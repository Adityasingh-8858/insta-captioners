const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy - fixes ERR_ERL_UNEXPECTED_X_FORWARDED_FOR when behind proxy/load balancer
app.set('trust proxy', 1);

// Rate limiting to prevent abuse
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit each IP to 30 requests per windowMs
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Instagram API endpoint to get reel data
app.post('/api/get-caption', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Validate Instagram URL - ensure it's actually from Instagram domain
        const instagramUrlPattern = /^https?:\/\/(www\.)?instagram\.com\/(reel|reels|p)\/([A-Za-z0-9_-]+)/;
        const match = url.match(instagramUrlPattern);
        
        if (!match) {
            return res.status(400).json({ error: 'Invalid Instagram URL' });
        }

        // Extract post code from URL
        const postCode = match[3];
        
        // Additional validation: ensure postCode is alphanumeric and reasonable length
        if (!/^[A-Za-z0-9_-]{6,20}$/.test(postCode)) {
            return res.status(400).json({ error: 'Invalid post code format' });
        }
        
        // Fetch Instagram post data by scraping HTML
        // Note: Instagram's __a=1 JSON endpoints are deprecated and return 404
        // We now scrape the public HTML page and extract caption from meta tags
        
        // Construct URL with validated postCode
        const instagramUrl = `https://www.instagram.com/p/${encodeURIComponent(postCode)}/`;
        
        const response = await axios.get(instagramUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'max-age=0',
            },
            timeout: 15000,
            validateStatus: (status) => status === 200
        });

        const html = response.data;
        let caption = '';
        
        // Try to extract from og:description meta tag
        const ogDescRegex = /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i;
        const ogMatch = html.match(ogDescRegex);
        
        if (ogMatch && ogMatch[1]) {
            caption = ogMatch[1];
            // Decode HTML entities
            caption = caption
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#039;/g, "'");
            
            // Clean up the caption (remove "likes, X comments" prefix if present)
            caption = caption.replace(/^\d+\s+(Likes?,\s+)?\d+\s+Comments?\s+-\s+/i, '');
        }
        
        // Fallback: try name="description" meta tag
        if (!caption) {
            const nameDescRegex = /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i;
            const nameMatch = html.match(nameDescRegex);
            
            if (nameMatch && nameMatch[1]) {
                caption = nameMatch[1]
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&#039;/g, "'");
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
