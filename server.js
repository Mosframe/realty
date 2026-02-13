const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const mockData = require('./mockData');

const PORT = 3000;
const API_BASE_URL = 'new.land.naver.com';
// Note: In production, this token should be stored in environment variables and refreshed regularly
// The token expires after a certain period and needs to be regenerated from the Naver Land API
const BEARER_TOKEN = process.env.NAVER_LAND_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlJFQUxFU1RBVEUiLCJpYXQiOjE3NzA5Nzc3OTksImV4cCI6MTc3MDk4ODU5OX0.KtZaFoCPtVy0DfFhF8KMbpJ-IUgE_CDNhO4HQtfzGt0';
const USE_MOCK_DATA = false; // Set to true to use mock data when external API is not accessible

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
    
    console.log({parsedUrl,pathname,query});
    
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
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'accept-language': 'ko;q=0.7',
            'authorization': `Bearer ${BEARER_TOKEN}`,
            'cache-control': 'no-cache',
            'cookie': 'NV_WETR_LOCATION_RGN_M="MDI1OTA2MDA="; NNB=IJV4PMAXC4PWS; NID_AUT=Js4hLjHV4thouDK/Rg9dzcyYuIvc8ElNgiEM9e1kUvwvL83kDZMjxKbGSJxmHO4y; NAC=qyFaB4wCM87g; NV_WETR_LAST_ACCESS_RGN_M="MDI1OTA2MDA="; ASID=3a7bcf630000019ba27235bc00000021; BUC=fwWdtkZ_bekHxEuCP-3DXCweJKyWYG9skA3Wjx5JSe0=; NID_SES=AAABypS30CNYOCRB/NNdzAvXtHzw+bZNIfD69/tEbyeCDiY0BvAROi2/Xdommc4CA8DadXXA7cp7TIMDupDLOGquknonUVX8rZUHOXq1Q4C3wDFTvGt8yS1sMTnNe9CDMCpX+2pLG11avt2frcGuJMI8E21MLtaDvhqpUM+DqUZFZ+aCBCDsU9GYN0gP7+Kxz+DbqIEKdLE8Zh3+GeBfiCkRN3ZAR+Eedw8o+UzZVdxyypUAXG1BLBumtqSqZd6Kwc7WdWghRqQYOWZNCWUFp1zrKStPG1S3XnHlGcqrsgLyj356QLTf48qfmVkj5tWzRTVtCleOYZiBeH4nz+4Ct8GfNX9p2S6INQwSd8RIGXxo73Rm42BgoG8jnWIdZsDylVyIPw5U6tkJZ9HbwOsu+2CJm4gJxC4Mg2IXZKSLDkyf243TuZ6ekjcWaIkFYmi0RINAyCtX/YzW8ChxWaWNmi/b0v0n6K2eNs/30bCL4yYzKfDBiKz41usVRZXYOITxm1+AN+VqHmgGQ9oA1F5zbVUR28zC4aA+AXr7A8hJMQFeig+WgaFNooCAHrg1h1nkrlnyhbg1XGE1vdp+vpmm8uBS2+FRxFWmPSHnYRgJ2mgB3ory; nhn.realestate.article.rlet_type_cd=A01; nhn.realestate.article.trade_type_cd=""; nhn.realestate.article.ipaddress_city=4100000000; landHomeFlashUseYn=Y; realestate.beta.lastclick.cortar=4159125600; REALESTATE=Fri%20Feb%2013%202026%2019%3A16%3A39%20GMT%2B0900%20(Korean%20Standard%20Time); PROP_TEST_KEY=1770977799430.551d3eddd43512a1afd41356bfaa7f4d98edd6f02a57905dd1708c1cc9357d56; PROP_TEST_ID=c8e5c52253d74ece8d473d1db4e27a35501605c5bb7e21f34e3b400067e568ee',
            'pragma': 'no-cache',
            'priority': 'u=1, i',
            'sec-ch-ua': '"Not:A-Brand";v="99", "Brave";v="145", "Chromium";v="145"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'sec-gpc': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
        }
    };
    
    console.log({hostname:options.hostname, path:options.path,auth:options.headers.authorization});

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
        //const apiPath = pathname.replace('/api', '') + (parsedUrl.search || '');
        const apiPath = pathname + (parsedUrl.search || '');
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
