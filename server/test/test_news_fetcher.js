const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { fetchHealthNews } = require('../jobs/newsFetcher');
const Article = require('../models/Article');

dotenv.config();

const runTest = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/lifedoc");
        console.log('Connected.');

        console.log('Running fetchHealthNews()...');
        await fetchHealthNews();

        console.log('Checking database for articles...');
        const count = await Article.countDocuments();
        console.log(`Total articles in DB: ${count}`);

        const sample = await Article.findOne();
        if (sample) {
            console.log('Sample article:', sample.title);
        } else {
            console.log('No articles found in DB.');
        }

    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
};

runTest();
