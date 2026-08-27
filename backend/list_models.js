const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log("Fetching models...");
    // The SDK doesn't have a direct "listModels" in the simple GenAI object
    // but we can try to find where it is or just try common names.
    const models = ["gemini-pro", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"];
    
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        await model.generateContent("Hi");
        console.log(`Model ${m} WORKS`);
      } catch (e) {
        console.log(`Model ${m} FAILED: ${e.message}`);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

listModels();

// minor safe update 3

// minor safe update 28
