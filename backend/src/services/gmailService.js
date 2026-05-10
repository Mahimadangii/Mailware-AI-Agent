// backend/src/services/gmailService.js
const { google } = require('googleapis');

async function fetchRecentEmails(accessToken) {
    try {
        // 1. Google OAuth Client ko Token pass karna
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });

        // 2. Gmail API initialize karna
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        // 3. Inbox se Top 5 "Unread" (Bina padhe) emails ki ID lana
        const response = await gmail.users.messages.list({
            userId: 'me',
            q: 'is:unread', // Sirf unread emails
            maxResults: 5   // Ek baar mein max 5 emails
        });

        const messages = response.data.messages;
        if (!messages || messages.length === 0) {
            return []; // Agar koi naya email nahi hai toh khali array return karo
        }

        const cleanedEmails = [];

        // 4. Har ID ki detail nikalna aur kachra (unnecessary data) filter karna
        for (let msg of messages) {
            const mailData = await gmail.users.messages.get({
                userId: 'me',
                id: msg.id,
                format: 'metadata', // Hum sirf kaam ka data (Subject, From, aur Snippet) uthayenge
                metadataHeaders: ['Subject', 'From']
            });

            const headers = mailData.data.payload.headers;
            const subject = headers.find(h => h.name === 'Subject')?.value || "No Subject";
            const from = headers.find(h => h.name === 'From')?.value || "Unknown Sender";
            const snippet = mailData.data.snippet; // Email body ka starting ka text

            cleanedEmails.push({
                id: msg.id,
                from: from,
                subject: subject,
                snippet: snippet
            });
        }

        return cleanedEmails;

    } catch (error) {
        console.error("Gmail API Error:", error.message);
        throw error;
    }
}

module.exports = { fetchRecentEmails };