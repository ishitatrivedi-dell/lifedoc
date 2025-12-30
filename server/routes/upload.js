const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const cloudinary = require('../utils/cloudinary');

// POST /api/upload
router.post('/', upload.single('image'), async (req, res) => {
    try {
        // Debug Config
        const cloudConfig = cloudinary.config();
        console.log('[DEBUG] Cloudinary Config Check:', {
            cloud_name: cloudConfig.cloud_name,
            has_key: !!cloudConfig.api_key,
            has_secret: !!cloudConfig.api_secret
        });

        if (!req.file) {
            console.log('[DEBUG] No file received');
            return res.status(400).json({ message: 'No image file provided' });
        }

        console.log('[DEBUG] File received:', req.file.originalname, req.file.size);

        // Upload to Cloudinary using stream
        const streamUpload = (buffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'lifedoc_prescriptions' },
                    (error, result) => {
                        if (result) {
                            console.log('[DEBUG] Cloudinary Upload Success:', result.secure_url);
                            resolve(result);
                        } else {
                            console.error('[DEBUG] Cloudinary Upload Failed:', error);
                            reject(error);
                        }
                    }
                );
                stream.write(buffer);
                stream.end();
            });
        };

        const result = await streamUpload(req.file.buffer);

        res.status(200).json({
            message: 'Image uploaded successfully',
            url: result.secure_url
        });

    } catch (error) {
        console.error('[ERROR] Upload Route Exception:', error);
        res.status(500).json({ message: 'Error uploading image', error: error.message || error });
    }
});

module.exports = router;
