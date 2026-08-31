const dotenv = require('dotenv');
dotenv.config();

async function testFetchGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const body = {
    contents: [{ parts: [{ text: "Hello" }] }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.log("RESULT: FAILED");
    } else {
      console.log("RESULT: SUCCESS");
    }
  } catch (err) {
    console.error("Fetch Error:", err);
    console.log("RESULT: FAILED");
  }
}

testFetchGemini();

// minor safe update 7

// automated formatting update 7

// automated formatting update 32
