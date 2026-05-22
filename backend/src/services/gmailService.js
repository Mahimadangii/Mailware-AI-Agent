// backend/src/services/gmailService.js
const { google } = require('googleapis');

async function fetchRecentEmails(accessToken) {
    try {
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        const response = await gmail.users.messages.list({ userId: 'me', q: 'is:unread', maxResults: 5 });
        const messages = response.data.messages;
        if (!messages || messages.length === 0) return [];
        const emails = [];
        for (let msg of messages) {
            const mailData = await gmail.users.messages.get({ userId: 'me', id: msg.id, format: 'metadata', metadataHeaders: ['Subject', 'From', 'Date'] });
            const headers = mailData.data.payload.headers;
            const subject = headers.find(h => h.name === 'Subject')?.value || "(No Subject)";
            const from = headers.find(h => h.name === 'From')?.value || "Unknown";
            const date = headers.find(h => h.name === 'Date')?.value || "";
            const snippet = mailData.data.snippet;
            emails.push({ id: msg.id, from, subject, snippet, date });
        }
        return emails;
    } catch (error) { throw error; }
}

// 🔥 UPDATE: Added pageToken support
async function fetchInboxList(accessToken, maxResults = 20, pageToken = null) {
    try {
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        
        const requestParams = { userId: 'me', q: 'in:inbox', maxResults: maxResults };
        if (pageToken) requestParams.pageToken = pageToken; // 🔥 Send token if exists

        const response = await gmail.users.messages.list(requestParams);
        const messages = response.data.messages;
        const nextPageToken = response.data.nextPageToken || null; // 🔥 Save next page token

        if (!messages || messages.length === 0) return { emails: [], nextPageToken: null };
        
        const inboxEmails = [];
        for (let msg of messages) {
            const mailData = await gmail.users.messages.get({ userId: 'me', id: msg.id, format: 'metadata', metadataHeaders: ['Subject', 'From', 'Date'] });
            const headers = mailData.data.payload.headers;
            const subject = headers.find(h => h.name === 'Subject')?.value || "(No Subject)";
            let from = headers.find(h => h.name === 'From')?.value || "Unknown";
            from = from.split('<')[0].trim(); 
            const date = headers.find(h => h.name === 'Date')?.value || "";
            const snippet = mailData.data.snippet;
            const isUnread = mailData.data.labelIds.includes('UNREAD');
            inboxEmails.push({ id: msg.id, from, subject, snippet, date, isUnread });
        }
        return { emails: inboxEmails, nextPageToken }; // 🔥 Returning token along with emails
    } catch (error) { throw error; }
}

// 🔥 UPDATE: Added pageToken support for Sent mails too
async function fetchSentEmails(accessToken, maxResults = 20, pageToken = null) {
    try {
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        
        const requestParams = { userId: 'me', q: 'in:sent', maxResults: maxResults };
        if (pageToken) requestParams.pageToken = pageToken;

        const response = await gmail.users.messages.list(requestParams);
        const messages = response.data.messages;
        const nextPageToken = response.data.nextPageToken || null;

        if (!messages || messages.length === 0) return { emails: [], nextPageToken: null };
        
        const sentEmails = [];
        for (let msg of messages) {
            const mailData = await gmail.users.messages.get({ userId: 'me', id: msg.id, format: 'metadata', metadataHeaders: ['Subject', 'To', 'Date'] });
            const headers = mailData.data.payload.headers;
            const subject = headers.find(h => h.name === 'Subject')?.value || "(No Subject)";
            let to = headers.find(h => h.name === 'To')?.value || "Unknown";
            to = to.split('<')[0].trim(); 
            const date = headers.find(h => h.name === 'Date')?.value || "";
            const snippet = mailData.data.snippet;
            sentEmails.push({ id: msg.id, to, subject, snippet, date, isUnread: false });
        }
        return { emails: sentEmails, nextPageToken };
    } catch (error) { throw error; }
}

async function getFullEmail(accessToken, messageId) {
    try {
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        const response = await gmail.users.messages.get({ userId: 'me', id: messageId, format: 'full' });
        const payload = response.data.payload;
        let emailBody = "";
        const decodeBase64 = (data) => Buffer.from(data, 'base64').toString('utf-8');
        if (payload.parts) {
            const htmlPart = payload.parts.find(part => part.mimeType === 'text/html');
            const textPart = payload.parts.find(part => part.mimeType === 'text/plain');
            if (htmlPart && htmlPart.body.data) emailBody = decodeBase64(htmlPart.body.data);
            else if (textPart && textPart.body.data) emailBody = decodeBase64(textPart.body.data);
        } else if (payload.body && payload.body.data) {
            emailBody = decodeBase64(payload.body.data);
        }
        return emailBody;
    } catch (error) { throw error; }
}

async function trashMessage(accessToken, messageId) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    await gmail.users.messages.trash({ userId: 'me', id: messageId });
}

async function archiveMessage(accessToken, messageId) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    await gmail.users.messages.modify({ userId: 'me', id: messageId, requestBody: { removeLabelIds: ['INBOX'] } });
}

async function replyToEmail(accessToken, originalMessageId, replyText) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const original = await gmail.users.messages.get({ userId: 'me', id: originalMessageId, format: 'metadata', metadataHeaders: ['Subject', 'From', 'Message-ID'] });
    const headers = original.data.payload.headers;
    const originalSubject = headers.find(h => h.name === 'Subject')?.value || "";
    const originalFrom = headers.find(h => h.name === 'From')?.value || "";
    const messageIdHeader = headers.find(h => h.name === 'Message-ID')?.value || "";
    const threadId = original.data.threadId;
    let replySubject = originalSubject;
    if (!replySubject.toLowerCase().startsWith('re:')) replySubject = `Re: ${originalSubject}`;
    const rawEmail = [`To: ${originalFrom}`, `Subject: ${replySubject}`, `In-Reply-To: ${messageIdHeader}`, `References: ${messageIdHeader}`, 'Content-Type: text/plain; charset="UTF-8"', '', replyText].join('\n');
    const encodedEmail = Buffer.from(rawEmail).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encodedEmail, threadId: threadId } });
}

async function sendNewEmail(accessToken, to, subject, bodyText) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const rawEmail = [`To: ${to}`, `Subject: ${subject}`, 'Content-Type: text/plain; charset="UTF-8"', '', bodyText].join('\n');
    const encodedEmail = Buffer.from(rawEmail).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encodedEmail } });
}

module.exports = { fetchRecentEmails, fetchInboxList, fetchSentEmails, getFullEmail, trashMessage, archiveMessage, replyToEmail, sendNewEmail };