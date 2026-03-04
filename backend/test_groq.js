const Groq = require('groq-sdk');
require('dotenv').config({ path: './.env' });

async function test() {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    try {
        console.log("Testing Groq with key:", process.env.GROQ_API_KEY.substring(0, 10) + "...");
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: 'Say hi' }],
            model: 'llama3-70b-8192'
        });
        console.log("Response:", completion.choices[0].message.content);
    } catch (e) {
        console.error("Groq Error:", e.message);
    }
}
test();
