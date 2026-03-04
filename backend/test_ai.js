const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './.env' });
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const models = ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-pro'];

async function test() {
    for (const m of models) {
        try {
            const model = ai.getGenerativeModel({ model: m });
            console.log(`Testing ${m}...`);
            const r = await model.generateContent('Say hi');
            console.log(`[SUCCESS] ${m}: `, r.response.text());
        } catch (e) {
            console.log(`[FAIL] ${m}: ${e.message.split('\n')[0]}`);
        }
    }
}
test();
