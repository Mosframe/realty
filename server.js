const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const mockData = require('./mockData');

const PORT = 3000;
const API_BASE_URL = 'new.land.naver.com';
const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlJFQUxFU1RBVEUiLCJpYXQiOjE3NzA5Nzc3OTksImV4cCI6MTc3MDk4ODU5OX0.KtZaFoCPtVy0DfFhF8KMbpJ-IUgE_CDNhO4HQtfzGt0';
const USE_MOCK_DATA = true; // Set to true to use mock data when external API is not accessible

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Get mock data key based on request path
function getMockDataKey(pathname, query) {
    if (pathname === '/regions/list') {
        return `regions_${query.cortarNo}`;
    } else if (pathname === '/regions/complexes') {
        return `complexes_${query.cortarNo}`;
    } else if (pathname.match(/^\/complexes\/\d+$/)) {
        const complexNo = pathname.split('/')[2];
        return `complex_${complexNo}`;
    } else if (pathname.match(/^\/complexes\/\d+\/prices\/real$/)) {
        const complexNo = pathname.split('/')[2];
        return `prices_${complexNo}_${query.areaNo}`;
    }
    return null;
}

// Proxy API requests to Naver Land or return mock data
function proxyAPIRequest(apiPath, res) {
    console.log(`Proxying request: ${apiPath}`);
    
    // Parse URL to extract query parameters
    const parsedUrl = url.parse(apiPath, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;
    
    // Try to use mock data if enabled
    if (USE_MOCK_DATA) {
        const mockKey = getMockDataKey(pathname, query);
        console.log(`Looking for mock data key: ${mockKey}`);
        
        if (mockKey && mockData[mockKey]) {
            console.log(`Using mock data for: ${mockKey}`);
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            });
            res.end(JSON.stringify(mockData[mockKey]));
            return;
        }
    }
    
    // Fall back to real API call
    const options = {
        hostname: API_BASE_URL,
        path: apiPath,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${BEARER_TOKEN}`,
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'ko;q=0.7',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
        }
    };

    const proxyReq = https.request(options, (proxyRes) => {
        console.log(`Response status: ${proxyRes.statusCode}`);
        
        let data = [];

        proxyRes.on('data', (chunk) => {
            data.push(chunk);
        });

        proxyRes.on('end', () => {
            const buffer = Buffer.concat(data);
            console.log(`Response received: ${buffer.length} bytes`);
            
            res.writeHead(proxyRes.statusCode, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            });
            res.end(buffer);
        });
    });

    proxyReq.on('error', (err) => {
        console.error('Proxy error:', err);
        res.writeHead(500, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ error: err.message }));
    });

    proxyReq.end();
}

// Create HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Handle API proxy requests
    if (pathname.startsWith('/api/')) {
        const apiPath = pathname.replace('/api', '') + (parsedUrl.search || '');
        proxyAPIRequest(apiPath, res);
        return;
    }

    // Handle static files
    let filePath = '.' + pathname;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('Press Ctrl+C to stop the server');
});
