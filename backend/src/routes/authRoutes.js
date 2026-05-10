// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { fetchRecentEmails } = require('../services/gmailService'); 
const { extractTasksFromEmails } = require('../services/aiService'); // AI Service Import ki

router.post('/save-token', async (req, res) => {
    const { token, userEmail } = req.body;

    if (!token) return res.status(400).json({ error: "Token is missing!" });

    console.log(`\n[✓] New Login: ${userEmail}`);
    
    try {
        // 1. Gmail se raw emails laao
        console.log("📬 Fetching emails from Google...");
        const emails = await fetchRecentEmails(token);
        
        if (emails.length === 0) {
            return res.status(200).json({ message: "No new emails found.", tasks: [] });
        }

        // 2. Un emails ko AI (Mistral) ke paas bhejo tasks nikalne ke liye
        const extractedTasks = await extractTasksFromEmails(emails);

        // 3. Final Task array frontend ko wapas bhej do!
        res.status(200).json({ 
            message: "Emails processed successfully!", 
            totalEmailsScanned: emails.length,
            tasks: extractedTasks 
        });

    } catch (error) {
        console.error("System Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;