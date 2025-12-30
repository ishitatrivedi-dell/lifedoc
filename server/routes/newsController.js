const Article = require('../models/Article');

exports.getHealthNews = async (req, res) => {
    try {
        // Fetch latest 50 articles, sorted by published date
        const articles = await Article.find()
            .sort({ publishedAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            data: articles
        });
    } catch (error) {
        console.error("Error fetching news from DB:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving news articles",
            error: error.message
        });
    }
};
