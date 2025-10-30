const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Instagram API endpoint to get reel data
app.post('/api/get-caption', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Validate Instagram URL
        const instagramUrlPattern = /^https?:\/\/(www\.)?instagram\.com\/(reel|reels|p)\/([A-Za-z0-9_-]+)/;
        const match = url.match(instagramUrlPattern);
        
        if (!match) {
            return res.status(400).json({ error: 'Invalid Instagram URL' });
        }

        // Extract post code from URL
        const postCode = match[3];
        
        // Fetch Instagram post data
        // Note: Instagram's official API requires authentication
        // For a production app, you'd need to use Instagram Graph API with proper authentication
        // This is a simplified approach using public endpoints which may become unreliable
        // The __a=1 parameter is deprecated but still works for some use cases
        
        const instagramUrl = `https://www.instagram.com/p/${postCode}/?__a=1&__d=dis`;
        
        const response = await axios.get(instagramUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
            timeout: 10000
        });

        // Try to extract caption from response
        let caption = '';
        
        // Instagram's response structure can vary
        if (response.data && response.data.graphql && response.data.graphql.shortcode_media) {
            const media = response.data.graphql.shortcode_media;
            if (media.edge_media_to_caption && media.edge_media_to_caption.edges.length > 0) {
                caption = media.edge_media_to_caption.edges[0].node.text;
            }
        } else if (response.data && response.data.items && response.data.items.length > 0) {
            const item = response.data.items[0];
            if (item.caption && item.caption.text) {
                caption = item.caption.text;
            }
        }

        if (!caption) {
            // Try alternative method - scrape the page HTML
            const htmlResponse = await axios.get(`https://www.instagram.com/p/${postCode}/`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
                timeout: 10000
            });

            const html = htmlResponse.data;
            
            // Try to extract from meta tags
            const metaRegex = /<meta property="og:description" content="([^"]*)"/;
            const metaMatch = html.match(metaRegex);
            
            if (metaMatch && metaMatch[1]) {
                caption = metaMatch[1];
                // Clean up the caption (remove "likes, X comments" prefix if present)
                // Note: This pattern may need adjustment based on Instagram's format changes
                caption = caption.replace(/^\d+\s+(Likes?,\s+)?\d+\s+Comments?\s+-\s+/i, '');
            }
        }

        if (!caption) {
            return res.status(404).json({ 
                error: 'Caption not found or post is private',
                caption: ''
            });
        }

        res.json({ 
            success: true,
            caption: caption,
            postCode: postCode
        });

    } catch (error) {
        console.error('Error fetching Instagram data:', error.message);
        
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ error: 'Post not found or is private' });
        }
        
        res.status(500).json({ 
            error: 'Failed to fetch caption. The post might be private or Instagram is blocking the request.',
            details: error.message
        });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to use the app`);
});
