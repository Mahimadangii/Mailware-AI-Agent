// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { fetchRecentEmails, fetchInboxList, fetchSentEmails, getFullEmail, trashMessage, archiveMessage, replyToEmail, sendNewEmail } = require('../services/gmailService'); 
const { extractTasksFromEmails, summarizeEmailSnippets } = require('../services/aiService'); 

router.post('/save-token', async (req, res) => {
    const { token, userEmail } = req.body;
    if (!token) return res.status(400).json({ error: "Token is missing!" });
    try {
        const emails = await fetchRecentEmails(token);
        if (emails.length === 0) return res.status(200).json({ message: "No unread emails.", tasks: [] });
        const tasks = await extractTasksFromEmails(emails);
        res.status(200).json({ message: "Emails processed successfully!", tasks: tasks });
    } catch (error) {
        console.error("❌ Save Token Crash:", error); // Ye line bohot zaroori hai
        res.status(500).send("Internal Server Error");
    }
});

router.post('/inbox', async (req, res) => {
    // 🔥 UPDATE: pageToken extraction from body
    const { token, pageToken } = req.body; 
    if (!token) return res.status(400).json({ error: "Token is missing!" });
    try {
        let result = await fetchInboxList(token, 20, pageToken); 
        
        // Summarize naye chunk of emails
        let summarizedEmails = await summarizeEmailSnippets(result.emails);
        
        // Return emails and nextPageToken
        res.status(200).json({ message: "Inbox fetched successfully!", emails: summarizedEmails, nextPageToken: result.nextPageToken });
    } catch (error) { res.status(500).json({ error: "Inbox load karne mein error aayi" }); }
});

router.post('/sent', async (req, res) => {
    const { token, pageToken } = req.body;
    if (!token) return res.status(400).json({ error: "Token is missing!" });
    try {
        let result = await fetchSentEmails(token, 20, pageToken); 
        res.status(200).json({ message: "Sent mails fetched successfully!", emails: result.emails, nextPageToken: result.nextPageToken });
    } catch (error) { res.status(500).json({ error: "Sent mails load error" }); }
});

// ... baaki endpoints same rahenge (email-details, trash, archive, reply, send)
router.post('/email-details', async (req, res) => {
    const { token, messageId } = req.body;
    if (!token || !messageId) return res.status(400).json({ error: "Missing data!" });
    try {
        const emailBody = await getFullEmail(token, messageId);
        res.status(200).json({ body: emailBody });
    } catch (error) { res.status(500).json({ error: "Full email load karne mein error aayi" }); }
});
router.post('/action/trash', async (req, res) => {
    const { token, messageId } = req.body;
    try { await trashMessage(token, messageId); res.status(200).json({ success: true, message: "Email moved to trash" }); } catch (error) { res.status(500).json({ error: "Failed to trash email" }); }
});
router.post('/action/archive', async (req, res) => {
    const { token, messageId } = req.body;
    try { await archiveMessage(token, messageId); res.status(200).json({ success: true, message: "Email archived" }); } catch (error) { res.status(500).json({ error: "Failed to archive email" }); }
});
router.post('/action/reply', async (req, res) => {
    const { token, messageId, replyText } = req.body;
    try { await replyToEmail(token, messageId, replyText); res.status(200).json({ success: true, message: "Reply sent successfully!" }); } catch (error) { res.status(500).json({ error: "Failed to send reply" }); }
});
router.post('/action/send', async (req, res) => {
    const { token, to, subject, bodyText } = req.body;
    try { await sendNewEmail(token, to, subject, bodyText); res.status(200).json({ success: true, message: "Email sent successfully!" }); } catch (error) { res.status(500).json({ error: "Failed to send email" }); }
});

module.exports = router;