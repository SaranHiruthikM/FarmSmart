import dotenv from "dotenv";

dotenv.config();

async function testFetchV1() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    console.log("Testing with direct fetch to v1...");
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "hi" }] }]
            })
        });
        const data: any = await response.json();
        if (response.ok) {
            console.log("SUCCESS with v1 fetch!");
            console.log(JSON.stringify(data).substring(0, 100));
        } else {
            console.log(`FAILED with v1 fetch: ${data.error?.message || response.statusText}`);
        }
    } catch (e: any) {
        console.log(`Error during fetch: ${e.message}`);
    }
}

testFetchV1();
