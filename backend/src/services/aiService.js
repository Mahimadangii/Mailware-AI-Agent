// backend/src/services/aiService.js

async function extractTasksFromEmails(emails) {
    if (!emails || emails.length === 0) return [];

    console.log(`🤖 AI Engine Started: Processing ${emails.length} `);

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;

    // AI ko hum strict instruction de rahe hain ki sirf JSON wapas kare
    const systemPrompt = `
    You are an intelligent email parser. Read the provided emails and extract actionable tasks.
    Return ONLY a valid JSON array of objects. Do not include any markdown formatting like \`\`\`json or explanations.
    Format each object strictly as:
    {
      "id": "Use the provided email ID",
      "title": "String (Short, clear actionable task. If no task found, return an empty string)",
      "deadline": "String (Extract date/time if mentioned, otherwise null)",
      "priority": "High, Medium, or Low (Based on urgency words like ASAP, Urgent, etc.)",
      "sourceEmail": "String (The sender of the email)"
    }
    Only extract actual tasks. If an email has no tasks (e.g., promotional or casual chat), ignore it.
    `;

    // Emails ko ek readable text format mein convert karna AI ke liye
    const emailTextForAI = emails.map((e, index) => 
        `Email ${index + 1}:\nID: ${e.id}\nFrom: ${e.from}\nSubject: ${e.subject}\nBody: ${e.snippet}`
    ).join("\n\n---\n\n");

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openRouterApiKey}`,
                "Content-Type": "application/json",
                // OpenRouter kabhi-kabhi free models ke liye ye do headers maangta hai:
                "HTTP-Referer": "http://localhost:3000", 
                "X-Title": "Mailware AI Agent"
            },
            body: JSON.stringify({
                model: "openrouter/free", 
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Extract tasks from these emails:\n\n${emailTextForAI}` }
                ]
            })
        });

        const data = await response.json();
        
        // 🔥 NAYA DEBUG LOGGING: Agar output mein 'choices' nahi hai, toh asli error print karo
        if (!response.ok || !data.choices || !data.choices[0]) {
            console.error("🔴 OPENROUTER ASLI ERROR:", JSON.stringify(data, null, 2));
            throw new Error("OpenRouter API request failed");
        }

        const aiOutput = data.choices[0].message.content.trim();
        const cleanedJsonString = aiOutput.replace(/```json/g, '').replace(/````/g, '');

        const tasks = JSON.parse(cleanedJsonString);
        
        console.log("✅ AI ne successfully tasks extract kar liye!");
        return tasks;

    } catch (error) {
        console.error("❌ AI Parsing Error:", error.message);
        return []; 
    }
}

module.exports = { extractTasksFromEmails };