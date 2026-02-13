const https = require('https');
const url = require('url');

const API_BASE_URL = 'new.land.naver.com';
const BEARER_TOKEN = process.env.NAVER_LAND_TOKEN || '';
const NAVER_COOKIE = process.env.NAVER_COOKIE || '';

module.exports = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const apiPath = req.url; // /api/regions/list?cortarNo=...

    console.log(`Proxying request: ${apiPath}`);

    const headers = {
        'accept': '*/*',
        'accept-encoding': 'identity',
        'accept-language': 'ko;q=0.7',
        'authorization': `Bearer ${BEARER_TOKEN}`,
        'cache-control': 'no-cache',
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
    };

    if (NAVER_COOKIE) {
        headers['cookie'] = NAVER_COOKIE;
    }

    const options = {
        hostname: API_BASE_URL,
        path: apiPath,
        method: 'GET',
        headers: headers
    };

    console.log({ hostname: options.hostname, path: options.path });

    const proxyReq = https.request(options, (proxyRes) => {
        console.log(`Response status: ${proxyRes.statusCode}`);

        let data = [];

        proxyRes.on('data', (chunk) => {
            data.push(chunk);
        });

        proxyRes.on('end', () => {
            const buffer = Buffer.concat(data);
            console.log(`Response received: ${buffer.length} bytes`);

            const headers = {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            };

            // If upstream returned an error, include details
            if (proxyRes.statusCode >= 400) {
                const bodyStr = buffer.toString('utf-8');
                console.error(`API Error [${proxyRes.statusCode}]: ${bodyStr}`);
                res.writeHead(proxyRes.statusCode, headers);
                res.end(JSON.stringify({
                    error: true,
                    statusCode: proxyRes.statusCode,
                    message: bodyStr
                }));
                return;
            }

            res.writeHead(proxyRes.statusCode, headers);
            res.end(buffer);
        });
    });

    proxyReq.on('error', (err) => {
        console.error('Proxy error:', err);
        if (!res.headersSent) {
            res.writeHead(500, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ error: true, statusCode: 500, message: err.message }));
        }
    });

    proxyReq.setTimeout(55000, () => {
        console.error('Proxy request timed out');
        proxyReq.destroy(new Error('Request timed out'));
    });

    proxyReq.end();
};
