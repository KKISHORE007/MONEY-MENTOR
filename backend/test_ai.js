const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Using API Key:", apiKey ? "FOUND" : "MISSING");
  
  if (!apiKey) return;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log("Sending test prompt to Gemini...");
    const result = await model.generateContent("Hello, are you there?");
    const response = await result.response;
    const text = response.text();
    
    console.log("Gemini Response:", text);
    console.log("RESULT: SUCCESS");
  } catch (error) {
    console.error("Gemini Error:", error);
    if (error.response) {
      console.error("Error Response:", JSON.stringify(error.response, null, 2));
    }
    console.log("RESULT: FAILED");
  }
}

testGemini();
