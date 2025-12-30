const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Medicine = require('../models/Medicine');
const LabTest = require('../models/LabTest');

const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// const medicines = [
//     {
//         name: "Paracetamol (Acetaminophen)",
//         description: "A common pain reliever and a fever reducer.",
//         uses: ["Headache", "Muscle aches", "Arthritis", "Backache", "Toothaches", "Colds", "Fevers"],
//         sideEffects: ["Nausea", "Stomach pain", "Loss of appetite", "Itching", "Rash"],
//         dosageInfo: "Adults: 500mg to 1000mg every 4-6 hours. Do not exceed 4000mg in 24 hours.",
//         category: "Analgesic"
//     },
//     {
//         name: "Amoxicillin",
//         description: "A penicillin antibiotic that fights bacteria.",
//         uses: ["Tonsillitis", "Bronchitis", "Pneumonia", "Ear infections", "Urinary tract infections"],
//         sideEffects: ["Nausea", "Vomiting", "Diarrhea", "Stomach pain", "Vaginal itching or discharge"],
//         dosageInfo: "Usually taken every 8 to 12 hours, depending on the strength and infection type.",
//         category: "Antibiotic"
//     },
//     {
//         name: "Ibuprofen",
//         description: "Nonsteroidal anti-inflammatory drug (NSAID).",
//         uses: ["Pain relief", "Fever reduction", "Inflammation control"],
//         sideEffects: ["Upset stomach", "Mild heartburn", "Nausea", "Vomiting", "Bloating"],
//         dosageInfo: "Adults: 200mg to 400mg every 4-6 hours as needed.",
//         category: "NSAID"
//     },
//     {
//         name: "Metformin",
//         description: "Used to treat type 2 diabetes.",
//         uses: ["Type 2 Diabetes", "PCOS"],
//         sideEffects: ["Nausea", "Upset stomach", "Diarrhea", "Metallic taste in mouth"],
//         dosageInfo: "Typical starting dose is 500mg once or twice daily with meals.",
//         category: "Antidiabetic"
//     },
//     {
//         name: "Atorvastatin",
//         description: "Used to lower cholesterol and triglyceride levels in the blood.",
//         uses: ["High Cholesterol", "Heart Attack Prevention", "Stroke Prevention"],
//         sideEffects: ["Joint pain", "Diarrhea", "Urinary tract infection", "Pain in extremities"],
//         dosageInfo: "10mg to 80mg once daily.",
//         category: "Statin"
//     },
//     {
//         name: "Omeprazole",
//         description: "Proton pump inhibitor (PPI) that decreases stomach acid.",
//         uses: ["GERD", "Acid Reflux", "Ulcers"],
//         sideEffects: ["Stomach pain", "Gas", "Nausea", "Vomiting", "Diarrhea"],
//         dosageInfo: "20mg once daily before a meal.",
//         category: "Proton Pump Inhibitor"
//     },
//     {
//         name: "Cetirizine",
//         description: "Antihistamine used to relieve allergy symptoms.",
//         uses: ["Hay fever", "Allergy symptoms", "Hives"],
//         sideEffects: ["Drowsiness", "Fatigue", "Dry mouth"],
//         dosageInfo: "5mg to 10mg once daily.",
//         category: "Antihistamine"
//     },
//     {
//         name: "Amlodipine",
//         description: "Calcium channel blocker used to treat high blood pressure.",
//         uses: ["Hypertension", "Coronary Artery Disease", "Angina"],
//         sideEffects: ["Swelling of legs/ankles", "Tiredness", "Stomach pain", "Nausea"],
//         dosageInfo: "5mg to 10mg once daily.",
//         category: "Antihypertensive"
//     },
//     {
//         name: "Azithromycin",
//         description: "Antibiotic used to treat various bacterial infections.",
//         uses: ["Respiratory infections", "Skin infections", "Ear infections", "Sexually transmitted diseases"],
//         sideEffects: ["Diarrhea", "Nausea", "Stomach pain", "Vomiting"],
//         dosageInfo: "Commonly taken once daily for 1 to 5 days.",
//         category: "Antibiotic"
//     },
//     {
//         name: "Prednisone",
//         description: "Corticosteroid that suppresses the immune system and reduces inflammation.",
//         uses: ["Arthritis", "Blood disorders", "Breathing problems", "Severe allergies", "Skin diseases"],
//         sideEffects: ["Sleep problems", "Appetite increase", "Sweating", "Indigestion"],
//         dosageInfo: "Varies significantly based on condition being treated.",
//         category: "Corticosteroid"
//     }
// ];

// const labTests = [
//     {
//         name: "Complete Blood Count (CBC)",
//         description: "A blood test used to evaluate your overall health and detect a wide range of disorders.",
//         normalRange: "RBC: 4.5-5.9 million/mcL (men), 4.1-5.1 million/mcL (women); WBC: 4,500-11,000/mcL; Platelets: 150,000-450,000/mcL.",
//         preparation: "No special preparation usually required.",
//         clinicalSignificance: "High WBC may indicate infection. Low RBC may indicate anemia.",
//         category: "Hematology"
//     },
//     {
//         name: "Lipid Panel",
//         description: "A blood test that measures lipids-fats and fatty substances used as a source of energy by your body.",
//         normalRange: "Total Cholesterol: <200 mg/dL; LDL: <100 mg/dL; HDL: >60 mg/dL; Triglycerides: <150 mg/dL.",
//         preparation: "Fasting for 9-12 hours is often required.",
//         clinicalSignificance: "High levels are risk factors for heart disease and stroke.",
//         category: "Biochemistry"
//     },
//     {
//         name: "Blood Glucose (Fasting)",
//         description: "Measures the amount of glucose (sugar) in your blood.",
//         normalRange: "70-99 mg/dL (Normal); 100-125 mg/dL (Prediabetes); 126+ mg/dL (Diabetes).",
//         preparation: "Fasting for at least 8 hours.",
//         clinicalSignificance: "Used to diagnose and monitor diabetes.",
//         category: "Endocrinology"
//     },
//     {
//         name: "Thyroid Stimulating Hormone (TSH)",
//         description: "Used to check for thyroid gland problems.",
//         normalRange: "0.4 to 4.0 milli-international units per liter (mIU/L).",
//         preparation: "No special preparation needed.",
//         clinicalSignificance: "High TSH often means hypothyroidism; low TSH can mean hyperthyroidism.",
//         category: "Endocrinology"
//     },
//     {
//         name: "Hemoglobin A1C",
//         description: "Average blood sugar level for the past two to three months.",
//         normalRange: "Below 5.7% (Normal); 5.7% - 6.4% (Prediabetes); 6.5% or higher (Diabetes).",
//         preparation: "No fasting required.",
//         clinicalSignificance: "Gold standard for monitoring long-term diabetes control.",
//         category: "Endocrinology"
//     },
//     {
//         name: "Liver Function Tests (LFTs)",
//         description: "Group of blood tests that check how well your liver is working.",
//         normalRange: "ALT: 7-55 U/L; AST: 8-48 U/L; ALP: 40-129 U/L; Albumin: 3.5-5.0 g/dL.",
//         preparation: "Fasting might be required.",
//         clinicalSignificance: "Elevated enzymes can indicate liver damage or disease.",
//         category: "Biochemistry"
//     },
//     {
//         name: "Kidney Function Tests (KFTs)",
//         description: "Tests to evaluate how well the kidneys are working.",
//         normalRange: "BUN: 6-20 mg/dL; Creatinine: 0.74-1.35 mg/dL (men), 0.59-1.04 mg/dL (women).",
//         preparation: "No special preparation usually.",
//         clinicalSignificance: "Elevated levels may suggest impaired kidney function.",
//         category: "Biochemistry"
//     },
//     {
//         name: "Vitamin D Test",
//         description: "Measures the level of vitamin D in your blood.",
//         normalRange: "20 ng/mL to 50 ng/mL is considered adequate.",
//         preparation: "No special preparation.",
//         clinicalSignificance: "Low levels can lead to bone weakness and other health issues.",
//         category: "Biochemistry"
//     },
//     {
//         name: "Urinalysis",
//         description: "A test of your urine.",
//         normalRange: "Various parameters (pH, specific gravity, protein, glucose, ketones, etc.) should be within standard limits.",
//         preparation: "Clean catch midstream sample usually required.",
//         clinicalSignificance: "Used to detect urinary tract infections, kidney disease, and diabetes.",
//         category: "Pathology"
//     },
//     {
//         name: "C-Reactive Protein (CRP)",
//         description: "Measures general levels of inflammation in your body.",
//         normalRange: "General: <10 mg/L; hs-CRP (cardiac risk): <1 mg/L (Low risk).",
//         preparation: "No special preparation.",
//         clinicalSignificance: "High levels indicate inflammation, which can be due to infection, injury, or chronic disease.",
//         category: "Immunology"
//     }
// ];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/lifedoc");
        console.log('MongoDB Connected for seeding');

        // Clear existing reference data
        await Medicine.deleteMany({});
        await LabTest.deleteMany({});

        console.log('Cleared existing medicines and lab tests');

        await Medicine.insertMany(medicines);
        console.log(`Seeded ${medicines.length} medicines`);

        await LabTest.insertMany(labTests);
        console.log(`Seeded ${labTests.length} lab tests`);

        console.log('Database seeded successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedDB();
