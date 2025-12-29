const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

/* const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
}); */

const auth = require('../middleware/authMiddleware');
const Consultation = require('../models/Consultation');
const Prescription = require('../models/Prescription');
const LabReport = require('../models/LabReport');
const User = require('../models/User');

// Middleware to check auth would go here
// const auth = require('../middleware/auth'); 

// POST /api/ai/analyze
// Desc: Analyze symptom text and return medical summary
router.post('/analyze', auth, async (req, res) => {
    const { text, language } = req.body;

    if (!process.env.OPENAI_API_KEY) {
        console.error("Server Error: OPENAI_API_KEY is missing from environment variables.");
        return res.status(500).json({ msg: 'Server Configuration Error: API Key missing.' });
    }

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    if (!text) {
        return res.status(400).json({ msg: 'Please provide symptom text' });
    }

    try {
        const prompt = `
    You are Docmetry, an AI medical assistant for elderly patients. 
    Analyze the following patient statement: "${text}"
    
    Provide the response in JSON format with these fields:
    - summary: A conversational, empathetic summary of what the patient said, addressed TO the patient (e.g., "I understand you are feeling...").
    - urgency: "Low", "Medium", or "High".
    - actions: A list of 2-3 simple, actionable steps they can take at home or should do next.
    - language: Detect the language or use the provided preference (${language || 'English'}). Ensure the summary and actions are in this language.
    
    IMPORTANT: Provide strictly valid JSON. Do not include markdown formatting.
    `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful and empathetic medical AI assistant." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
        });

        const aiResult = JSON.parse(response.choices[0].message.content);

        // Save to Database
        const newConsultation = new Consultation({
            user: req.user.id,
            symptoms: text,
            aiSummary: aiResult.summary,
            urgency: aiResult.urgency,
            actions: aiResult.actions,
            language: language || 'en'
        });

        await newConsultation.save();

        res.json(aiResult);
    } catch (err) {
        console.error("AI Error:", err.message);
        res.status(500).json({ msg: 'Error processing AI request', error: err.message });
    }
});

// POST /api/ai/analyze-prescription
// Desc: Analyze prescription image using Vision model
router.post('/analyze-prescription', auth, async (req, res) => {
    const { image } = req.body; // Base64 image string

    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ msg: 'Server Configuration Error: API Key missing.' });
    }

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    if (!image) {
        return res.status(400).json({ msg: 'Please upload an image' });
    }

    try {
        const prompt = `
    You are an expert pharmacist and doctor assistant.
    Analyze this prescription image. 
    
    Extract the following details in strict JSON format:
    - medicines: array of objects { name, dosage, timing (e.g., "Morning-Night"), precaution (e.g., "After food") }
    - audioSummary: A simple, clear paragraph explaining to the patient how to take their medicines in plain language (e.g., "You have 3 medicines. Take the Paracetamol after lunch...").
    
    If you cannot read the prescription or if it's not a prescription, return an error message in the summary.
    `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: image } }
                    ]
                }
            ],
            max_tokens: 1000,
            response_format: { type: "json_object" },
        });

        const aiResult = JSON.parse(response.choices[0].message.content);

        // Save to Database
        const newPrescription = new Prescription({
            user: req.user.id,
            image: image, // Note: Storing Base64 in Mongo is not ideal for prod, but OK for this demo
            medicines: aiResult.medicines,
            audioSummary: aiResult.audioSummary
        });

        await newPrescription.save();

        res.json(aiResult);

    } catch (err) {
        console.error("Vision AI Error:", err.message);
        res.status(500).json({ msg: 'Error analyzing image', error: err.message });
    }
});

// POST /api/ai/summerizer
// Desc: Summarize diary entry using Gemini
router.post('/summerizer', auth, async (req, res) => {
    try {
        const { prompt } = req.query; // e.g. "diarySummerizer"
        const { text, date } = req.body;

        if (!prompt) {
            return res.status(400).json({ msg: 'Prompt query parameter is required' });
        }

        // Validate prompt file exists
        const promptPath = path.join(__dirname, `../prompts/${prompt}.txt`);
        if (!fs.existsSync(promptPath)) {
            return res.status(404).json({ msg: 'Prompt file not found' });
        }

        const basePrompt = fs.readFileSync(promptPath, 'utf8');

        if (!process.env.GEMINI_API_KEY) {
            console.error("Server Error: GEMINI_API_KEY is missing.");
            return res.status(500).json({ msg: 'Server Configuration Error: API Key missing.' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using gemini-flash-latest which was verified to work
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const fullPrompt = `${basePrompt}\n\nUser Diary Entry (${date || 'Today'}):\n${text}\n\nOutput JSON:`;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
            generationConfig: { responseMimeType: "application/json" } // Force JSON
        });

        const response = await result.response;
        const textResponse = response.text();

        // Parse JSON safely
        let aiResult;
        try {
            aiResult = JSON.parse(textResponse);
        } catch (e) {
            // Fallback cleanup if not pure JSON
            const cleanText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            aiResult = JSON.parse(cleanText);
        }

        res.json(aiResult);

    } catch (err) {
        console.error("Gemini AI Error:", err.message);
        res.status(500).json({ msg: 'Error processing AI request', error: err.message });
    }
});

// POST /api/ai/analyze-lab-report
// Desc: Analyze lab report image/PDF using Gemini
router.post('/analyze-lab-report', auth, async (req, res) => {
    try {
        const { image, notes, reportDate: userDate, testType: userTestType } = req.body; // Base64 string and optional overrides

        if (!image) {
            return res.status(400).json({ msg: 'Please upload a lab report image' });
        }

        // Read the prompt
        const promptPath = path.join(__dirname, '../prompts/labReportAnalyzer.txt');
        if (!fs.existsSync(promptPath)) {
            return res.status(500).json({ msg: 'System Error: Prompt file missing' });
        }
        const systemPrompt = fs.readFileSync(promptPath, 'utf8');

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ msg: 'Server Configuration Error: API Key missing.' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Prepare image part
        let mimeType = "image/jpeg"; // Default
        let base64Data = image;

        if (image.includes("base64,")) {
            const parts = image.split(";base64,");
            mimeType = parts[0].split(":")[1];
            base64Data = parts[1];
        }

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            }
        };

        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: systemPrompt },
                        imagePart
                    ]
                }
            ],
            generationConfig: { responseMimeType: "application/json" }
        });

        const response = await result.response;
        const textResponse = response.text();
        const aiResult = JSON.parse(textResponse);

        // Determine test type and date (User overrides take precedence if provided, otherwise AI)
        const finalReportDate = userDate ? new Date(userDate) : (aiResult.labReport?.reportDate ? new Date(aiResult.labReport.reportDate) : new Date());

        let finalTestType = userTestType || "General Lab Report";
        if (!userTestType && aiResult.tests && aiResult.tests.length > 0) {
            finalTestType = aiResult.tests[0].testCategory || aiResult.tests[0].testName || "General Lab Report";
        }

        // Upload to Cloudinary
        const cloudinary = require('../utils/cloudinary');
        let cloudinaryUrl = null;
        try {
            const uploadResponse = await cloudinary.uploader.upload(image, {
                folder: 'lab_reports',
                resource_type: 'auto'
            });
            cloudinaryUrl = uploadResponse.secure_url;
        } catch (uploadError) {
            console.error("Cloudinary Upload Error:", uploadError.message);
        }

        const newLabReport = new LabReport({
            userId: req.user.id,
            reportDate: finalReportDate,
            testType: finalTestType,
            parsedResults: aiResult,
            fileUrl: cloudinaryUrl || image, // Use Cloudinary URL if available, else fallback to base64
            originalReport: cloudinaryUrl, // Keep this for now as per previous request
            notes: notes || "Analyzed by AI"
        });

        await newLabReport.save();

        res.json({
            message: "Lab report analyzed successfully",
            data: newLabReport,
            aiAnalysis: aiResult
        });

    } catch (err) {
        console.error("Lab Report Analysis Error:", err.message);
        res.status(500).json({ msg: 'Error analyzing lab report', error: err.message });
    }
});

// POST /api/ai/generate-questions
// Desc: Generate lifestyle questions based on chronic conditions
router.post('/generate-questions', auth, async (req, res) => {
    try {
        const { diseases } = req.body; // Array of strings e.g. ["Diabetes", "None"]

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ msg: 'Server Configuration Error: API Key missing.' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
        You are a medical expert. The user has the following conditions: ${diseases && diseases.length > 0 ? diseases.join(", ") : "None"}.
        Generate 3 to 5 specific, relevant questions to ask this user to understand their lifestyle, diet, and daily habits better, which will help in creating a personalized health summary.
        
        Requirements:
        1. Generate a mix of Multiple Choice Questions (MCQ) and Text Input questions.
        2. If the user has specific diseases, ask about medication adherence, specific diet restrictions, etc.
        3. If "None" or empty, ask about general fitness, diet, and stress.
        
        Output strictly a JSON array of objects with this structure:
        [
            {
                "id": 1,
                "question": "Question text here",
                "type": "mcq", 
                "options": ["Option 1", "Option 2", "Option 3"],
                "ans": ""
            },
            {
                "id": 2,
                "question": "Question text here",
                "type": "text",
                "options": [],
                "ans": ""
            }
        ]
        Ensure you include at least one "mcq" and one "text" type question.
        Do not include markdown formatting.
        `;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const response = await result.response;
        const textResponse = response.text();
        const questions = JSON.parse(textResponse);

        res.json(questions);

    } catch (err) {
        console.error("Generate Questions Error:", err.message);
        const fs = require('fs');
        const path = require('path');
        fs.writeFileSync(path.join(__dirname, '../error_log.txt'), `Error: ${err.message}\nStack: ${err.stack}\n`);
        res.status(500).json({ msg: 'Error generating questions', error: err.message });
    }
});

// POST /api/ai/analyze-lifestyle
// Desc: Analyze answers and update user storyDesc
router.post('/analyze-lifestyle', auth, async (req, res) => {
    try {
        const { answers, diseases, additionalDetails, userProfile } = req.body; // answers: [{question, answer}], diseases: [], additionalDetails: string, userProfile: {}

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ msg: 'Server Configuration Error: API Key missing.' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
        You are a medical expert. Analyze the following user profile and questionnaire answers.
        
        Conditions: ${diseases ? diseases.join(", ") : "None"}
        
        User Profile:
        Age: ${userProfile?.age || "Not specified"}
        Gender: ${userProfile?.gender || "Not specified"}
        Height: ${userProfile?.height ? userProfile.height + " cm" : "Not specified"}
        Weight: ${userProfile?.weight ? userProfile.weight + " kg" : "Not specified"}
        Blood Group: ${userProfile?.bloodGroup || "Not specified"}

        Q&A:
        ${answers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join("\n\n")}
        
        Additional Details from User:
        ${additionalDetails || "None provided"}
        
        Create a comprehensive, empathetic, and professional summary of the user's health lifestyle, habits, and potential areas for improvement. 
        This summary will be displayed on their profile as "My Health Story".
        Keep it under 150 words. Use "You" to address the user.
        
        Output strictly JSON:
        {
            "summary": "Your summary text here..."
        }
        `;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const response = await result.response;
        const textResponse = response.text();
        const aiResult = JSON.parse(textResponse);

        // Update User Profile
        // Note: storyDesc is inside the profile object in User model
        await User.findByIdAndUpdate(req.user.id, {
            $set: { "profile.storyDesc": aiResult.summary }
        });

        res.json(aiResult);

    } catch (err) {
        console.error("Analyze Lifestyle Error:", err.message);
        res.status(500).json({ msg: 'Error analyzing lifestyle', error: err.message });
    }
});

module.exports = router;
