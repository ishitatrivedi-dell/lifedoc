const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { fetchHealthNews } = require('../jobs/newsFetcher');

// Load env vars from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const runManualFetch = async () => {
    try {
        console.log('Starting manual news fetch...');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/lifedoc");
        console.log('Connected to MongoDB.');

        // Run the fetch job
        await fetchHealthNews();

        console.log('Manual fetch completed successfully.');
    } catch (error) {
        console.error('Error during manual fetch:', error);
    } finally {
        // Close connection
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit(0);
    }
};

runManualFetch();
