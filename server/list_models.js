const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const fs = require('fs');
dotenv.config();

async function listModels() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        let output = "Available Models:\n";
        if (data.models) {
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    output += `- ${m.name}\n`;
                }
            });
        } else {
            output += "Could not list models: " + JSON.stringify(data);
        }

        fs.writeFileSync('models_clean.txt', output);
        console.log("Done writing models_clean.txt");

    } catch (error) {
        fs.writeFileSync('models_clean.txt', "Error: " + error.message);
    }
}

listModels();
