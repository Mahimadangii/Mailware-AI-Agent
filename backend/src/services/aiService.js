// backend/src/services/aiService.js
require('dotenv').config();

// 🔥 HACK: Editor ko dhokha dene ke liye URL ko tod diya hai taaki wo auto-link na banaye!
const API_URL = "https://" + "openrouter.ai" + "/api/v1/chat/completions";

// 1. Tasks nikalne ke liye
async function extractTasksFromEmails(emails) {
    try {
        const prompt = `You are an AI assistant. Analyze these unread emails and extract actionable tasks. 
        Return ONLY a raw JSON array of objects. Do not include markdown code blocks like \`\`\`json.
        Each object must have: "id" (string), "title" (short task description), "deadline" (string like 'Today', 'Tomorrow', 'Next Week', or ''), "priority" (High, Medium, Low), "sourceEmail" (sender name).
        Emails data: ${JSON.stringify(emails)}`;

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openrouter/free", 
                messages: [{ role: "user", content: prompt }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message || "OpenRouter API Error");
        }

        let aiText = data.choices[0].message.content.trim();
        if (aiText.startsWith("```json")) aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
        else if (aiText.startsWith("```")) aiText = aiText.replace(/```/g, "").trim();

        return JSON.parse(aiText);
    } catch (error) {
        console.error("AI Task Extraction Failed:", error.message);
        return [];
    }
}

// 2. Inbox Mails ki 1-line Summary banane ke liye
async function summarizeEmailSnippets(emails) {
    try {
        console.log(`🧠 AI is summarizing ${emails.length} emails...`);
        
        const safeEmailsText = emails.map((e, i) => 
            `[${i}] Subject: ${e.subject} | Text: ${e.snippet.substring(0, 150)}`
        ).join('\n');

        const prompt = `You are a smart email assistant. Read the following list of email subjects and raw texts.
        For each email, generate a very short, crisp 1-sentence summary (max 8-10 words) of what the email is actually about.
        Return the response STRICTLY as a raw JSON array of strings in the exact same order as the input. Do not wrap in markdown blocks.
        
        Input Emails:
        ${safeEmailsText}
        
        Output format example: ["Meeting rescheduled to 3 PM.", "Your Amazon order is shipped.", "Client requested a code review."]`;

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openrouter/free",
                messages: [{ role: "user", content: prompt }]
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || "OpenRouter API Error");
        }

        let aiText = data.choices[0].message.content.trim();
        
        if (aiText.startsWith("```json")) aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
        else if (aiText.startsWith("```")) aiText = aiText.replace(/```/g, "").trim();

        const summaries = JSON.parse(aiText);

        return emails.map((email, index) => {
            return {
                ...email,
                snippet: summaries[index] ? `✨ ${summaries[index]}` : email.snippet 
            };
        });

    } catch (error) {
        console.error("AI Summarization failed:", error.message);
        return emails; 
    }
}

module.exports = { extractTasksFromEmails, summarizeEmailSnippets };