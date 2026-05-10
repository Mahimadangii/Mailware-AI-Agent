// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { fetchRecentEmails, fetchInboxList, fetchSentEmails, getFullEmail, trashMessage, archiveMessage, replyToEmail, sendNewEmail } = require('../services/gmailService'); 
// 🔥 Naya AI Summarizer Import kiya
const { extractTasksFromEmails, summarizeEmailSnippets } = require('../services/aiService'); 

router.post('/save-token', async (req, res) => {
    const { token, userEmail } = req.body;
    if (!token) return res.status(400).json({ error: "Token is missing!" });
    try {
        const emails = await fetchRecentEmails(token);
        if (emails.length === 0) return res.status(200).json({ message: "No unread emails.", tasks: [] });
        const tasks = await extractTasksFromEmails(emails);
        res.status(200).json({ message: "Emails processed successfully!", tasks: tasks });
    } catch (error) { res.status(500).json({ error: "Something went wrong" }); }
});

// 🔥 UPDATE: Inbox Route ab AI Summary ke sath data bhejega
router.post('/inbox', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token is missing!" });
    try {
        let emails = await fetchInboxList(token, 20); 
        
        // ✨ AI Magic: Raw emails ko summarize karo
        emails = await summarizeEmailSnippets(emails);
        
        res.status(200).json({ message: "Inbox fetched successfully!", emails: emails });
    } catch (error) { res.status(500).json({ error: "Inbox load karne mein error aayi" }); }
});

// Sent mails mein summarization optional hai, par abhi humne normal rakha hai
router.post('/sent', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token is missing!" });
    try {
        const emails = await fetchSentEmails(token, 20); 
        res.status(200).json({ message: "Sent mails fetched successfully!", emails: emails });
    } catch (error) { res.status(500).json({ error: "Sent mails load error" }); }
});

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
    try {
        await trashMessage(token, messageId);
        res.status(200).json({ success: true, message: "Email moved to trash" });
    } catch (error) { res.status(500).json({ error: "Failed to trash email" }); }
});

router.post('/action/archive', async (req, res) => {
    const { token, messageId } = req.body;
    try {
        await archiveMessage(token, messageId);
        res.status(200).json({ success: true, message: "Email archived" });
    } catch (error) { res.status(500).json({ error: "Failed to archive email" }); }
});

router.post('/action/reply', async (req, res) => {
    const { token, messageId, replyText } = req.body;
    try {
        await replyToEmail(token, messageId, replyText);
        res.status(200).json({ success: true, message: "Reply sent successfully!" });
    } catch (error) { res.status(500).json({ error: "Failed to send reply" }); }
});

router.post('/action/send', async (req, res) => {
    const { token, to, subject, bodyText } = req.body;
    try {
        await sendNewEmail(token, to, subject, bodyText);
        res.status(200).json({ success: true, message: "Email sent successfully!" });
    } catch (error) { res.status(500).json({ error: "Failed to send email" }); }
});

module.exports = router;