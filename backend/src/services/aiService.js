// backend/src/services/aiService.js
require('dotenv').config();

// HACK: Prevent markdown auto-linking in editors
const API_URL = "https://" + "openrouter.ai" + "/api/v1/chat/completions";

// Caching storage
const summaryCache = {}; 
const processedTaskEmails = new Set(); 

// 1. Strict AI Task Extraction (With Cache)
async function extractTasksFromEmails(emails) {
    try {
        const freshEmails = emails.filter(e => !processedTaskEmails.has(e.id));
        if (freshEmails.length === 0) return [];

        console.log(`🧠 AI is extracting tasks from ${freshEmails.length} NEW emails...`);

        const prompt = `You are an elite AI Task Manager. Your job is to extract GENUINE, ACTIONABLE tasks from the following unread emails.
        CRITICAL STRICT RULES:
        1. DO NOT create tasks for informational emails, security alerts, newsletters, welcome emails, or promotions.
        2. ONLY create a task if the email explicitly requires the user to take a specific action.
        3. If an email does not contain a clear, actionable task, COMPLETELY IGNORE IT. 
        4. If NONE of the emails contain valid tasks, you MUST return an empty array: []

        Return ONLY a raw JSON array of objects. Do not include markdown code blocks like \`\`\`json.
        Each object must have: "id" (string), "title" (short task description), "deadline" (string like 'Today', 'Tomorrow', 'Next Week', or 'No Deadline'), "priority" (High, Medium, Low), "sourceEmail" (sender name).
        
        Emails data: ${JSON.stringify(freshEmails)}`;

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ model: "openrouter/free", messages: [{ role: "user", content: prompt }] })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message || "OpenRouter API Error");

        let aiText = data.choices[0].message.content.trim();
        if (aiText.startsWith("```json")) aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
        else if (aiText.startsWith("```")) aiText = aiText.replace(/```/g, "").trim();

        const tasks = JSON.parse(aiText);
        freshEmails.forEach(e => processedTaskEmails.add(e.id));
        return tasks;
    } catch (error) {
        console.error("AI Task Extraction Failed:", error.message);
        return [];
    }
}

// 2. Strict Inbox Mails Summarization (With Cache)
async function summarizeEmailSnippets(emails) {
    try {
        const unsummarizedEmails = emails.filter(e => !summaryCache[e.id]);

        if (unsummarizedEmails.length > 0) {
            console.log(`🧠 AI is summarizing ${unsummarizedEmails.length} NEW emails...`);
            
            const safeEmailsText = unsummarizedEmails.map((e, i) => 
                `[${i}] Subject: ${e.subject} | Text: ${e.snippet.substring(0, 150)}`
            ).join('\n');

            // 🔥 STRICT PROMPT HERE
            const prompt = `You are a smart email assistant. Read the following list of EXACTLY ${unsummarizedEmails.length} email subjects and raw texts.
            For EACH email, generate a very short, crisp 1-sentence summary (max 8-10 words).
            
            CRITICAL RULES:
            1. You MUST return STRICTLY a JSON array of strings.
            2. The JSON array MUST contain EXACTLY ${unsummarizedEmails.length} items.
            3. Do NOT include any intro text, markdown formatting (\`\`\`json), or explanations. Just the raw array.
            4. If an email is gibberish or a security alert, summarize it as "Account security notification." or "System automated message."
            
            Input Emails:
            ${safeEmailsText}`;

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ model: "openrouter/free", messages: [{ role: "user", content: prompt }] })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message || "OpenRouter API Error");

            let aiText = data.choices[0].message.content.trim();
            if (aiText.startsWith("```json")) aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
            else if (aiText.startsWith("```")) aiText = aiText.replace(/```/g, "").trim();

            const newSummaries = JSON.parse(aiText);

            unsummarizedEmails.forEach((email, index) => {
                if (newSummaries[index]) {
                    summaryCache[email.id] = `✨ ${newSummaries[index]}`;
                }
            });
        }

        // Return mixed (from cache + fresh)
        return emails.map(email => ({
            ...email,
            snippet: summaryCache[email.id] || email.snippet 
        }));

    } catch (error) {
        console.error("AI Summarization failed:", error.message);
        return emails.map(email => ({
            ...email,
            snippet: summaryCache[email.id] || email.snippet 
        }));
    }
}

module.exports = { extractTasksFromEmails, summarizeEmailSnippets };