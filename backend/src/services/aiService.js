require('dotenv').config();
const fs = require('fs');
const path = require('path');
const CACHE_FILE = path.join(__dirname, 'cache.json');
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

let summaryCache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE)) : {};
const processedTaskEmails = new Set(); 

function saveCache() { fs.writeFileSync(CACHE_FILE, JSON.stringify(summaryCache)); }

function safelyParseJSON(text) {
    if (!text) return null;
    const match = text.match(/\[.*\]/s); // Regex to find array brackets
    if (!match) {
        console.log("❌ Regex failed to find a JSON array in AI response.");
        return null;
    }
    try { 
        return JSON.parse(match[0]); 
    } catch (e) { 
        console.log("❌ JSON.parse failed! Corrupted JSON:", match[0]);
        return null; 
    }
}

async function extractTasksFromEmails(emails) {
    try {
        // 🔥 DEBUG LOG 1: Check how many emails are actually going to AI
        const freshEmails = emails.filter(e => !processedTaskEmails.has(e.id));
        console.log(`\n📥 Inbox sent ${emails.length} emails. Fresh emails to process: ${freshEmails.length}`);
        
        if (freshEmails.length === 0) {
            console.log("⚠️ No fresh emails to process. All emails are already in cache.");
            return [];
        }

        const prompt = `You are an expert AI Task Manager. Analyze the provided emails and extract ONLY actionable tasks.

        STRICT RULES:
         1. DO NOT create tasks for newsletters, social media notifications (like Pinterest/Snapchat), or general marketing emails.
         2. ONLY create tasks for emails that explicitly ask the user to DO something (e.g., "Submit assignment", "Complete assessment", "Apply before deadline").
         3. If an email is just an update or a notification, IGNORE IT.
         4. Return ONLY a valid JSON array of objects with EXACTLY these keys: 
         [
           {
             "id": "...", 
             "title": "...", 
             "actionItem": "Short 1-line description of what needs to be done",
             "deadline": "Exact date if mentioned, otherwise 'No Deadline'", 
             "priority": "High/Medium/Low", 
             "senderName": "Name of the sender",
             "sourceEmail": "..."
           }
         ]
         5. CRITICAL: Do NOT add markdown blocks (like \`\`\`json). Return ONLY the raw JSON array. Do not add any conversational text.

         Emails data: ${JSON.stringify(freshEmails)}`;

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "openrouter/free", messages: [{ role: "user", content: prompt }] })
        });

        const data = await response.json();
        const rawContent = data?.choices?.[0]?.message?.content;
        
        // 🔥 DEBUG LOG 2: See EXACTLY what AI replied before parsing
        console.log("\n🤖 RAW AI RESPONSE:\n", rawContent);

        const tasks = safelyParseJSON(rawContent);
        
        // 🔥 FIX: Only add to processed cache if parsing was successful
        if (tasks && Array.isArray(tasks)) {
            console.log(`✅ Successfully extracted ${tasks.length} tasks.`);
            freshEmails.forEach(e => processedTaskEmails.add(e.id));
            return tasks;
        } else {
            console.log("⚠️ Failed to extract tasks properly. Not adding to cache so we can retry.");
            return [];
        }

    } catch (e) { 
        console.error("🔥 AI Task Extraction Crash:", e);
        return []; 
    }
}

async function summarizeEmailSnippets(emails) {
    const unsummarized = emails.filter(e => !summaryCache[e.id]);
    if (unsummarized.length > 0) {
        const prompt = `Summarize these ${unsummarized.length} emails. Return a raw JSON array of ${unsummarized.length} strings. No text, just the array.
        Emails: ${JSON.stringify(unsummarized.map(e => ({id: e.id, sub: e.subject, body: e.snippet.substring(0,100)})))}`;

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "openrouter/free", messages: [{ role: "user", content: prompt }] })
        });

        const data = await response.json();
        const summaries = safelyParseJSON(data?.choices?.[0]?.message?.content);
        if (summaries) {
            unsummarized.forEach((e, i) => { summaryCache[e.id] = `✨ ${summaries[i]}`; });
            saveCache();
        }
    }
    return emails.map(e => ({ ...e, snippet: summaryCache[e.id] || e.snippet }));
}

module.exports = { extractTasksFromEmails, summarizeEmailSnippets };