const dotenv = require('dotenv');
const path = require('path');

// Load env vars
const envPath = path.join(__dirname, '../.env');
console.log(`Loading .env from: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env:', result.error);
} else {
    console.log('.env loaded successfully.');
    console.log('Environment keys found:', Object.keys(result.parsed));

    if (process.env.NEWS_API_KEY) {
        console.log('NEWS_API_KEY is present (length: ' + process.env.NEWS_API_KEY.length + ')');
    } else {
        console.error('NEWS_API_KEY is NOT present in process.env');
    }
}
