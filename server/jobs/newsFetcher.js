const axios = require('axios');
const cron = require('node-cron');
const Article = require('../models/Article');

const fetchHealthNews = async () => {
    try {
        const apiKey = process.env.NEWS_API_KEY;
        if (!apiKey) {
            console.error('NEWS_API_KEY is missing in environment variables. Skipping news fetch.');
            return;
        }

        console.log('Starting health news fetch...');
        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: {
                category: 'health',
                country: 'us',
                pageSize: 50,
                apiKey: apiKey
            }
        });

        const articles = response.data.articles;
        if (!articles || articles.length === 0) {
            console.log('No articles found.');
            return;
        }

        let newCount = 0;
        for (const articleData of articles) {
            // Skip articles without content or url
            if (!articleData.url || !articleData.title) continue;

            // Check if article already exists
            const existing = await Article.findOne({ url: articleData.url });
            if (!existing) {
                await Article.create({
                    title: articleData.title,
                    description: articleData.description,
                    content: articleData.content,
                    url: articleData.url,
                    source: articleData.source.name,
                    imageUrl: articleData.urlToImage,
                    publishedAt: articleData.publishedAt,
                    category: ['health']
                });
                newCount++;
            }
        }

        console.log(`News fetch completed. Added ${newCount} new articles.`);

    } catch (error) {
        console.error('Error fetching health news:', error.message);
    }
};

const startCronJob = () => {
    // Run at 8:00 AM and 8:00 PM every day
    // Cron expression: "0 8,20 * * *"
    cron.schedule('0 8,20 * * *', () => {
        console.log('Running scheduled health news fetch...');
        fetchHealthNews();
    }, {
        scheduled: true,
        timezone: "UTC" // Using UTC as requested for reliability
    });

    console.log('Health news fetch cron job scheduled (0 8,20 * * * UTC).');
};

module.exports = { startCronJob, fetchHealthNews };
