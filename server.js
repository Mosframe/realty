const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const zlib = require('zlib'); // 압축 해제를 위해 추가
const mockData = require('./mockData');

const PORT = 3000;
const API_BASE_URL = 'new.land.naver.com';
const BEARER_TOKEN = process.env.NAVER_LAND_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const USE_MOCK_DATA = false;

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

function proxyAPIRequest(apiPath, res) {
    console.log(`Proxying request: ${apiPath}`);

    const parsedUrl = url.parse(apiPath, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    if (USE_MOCK_DATA) {
        const mockKey = getMockDataKey(pathname, query);
        if (mockKey && mockData[mockKey]) {
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            });
            res.end(JSON.stringify(mockData[mockKey]));
            return;
        }
    }

    const options = {
        hostname: API_BASE_URL,
        path: apiPath,
        method: 'GET',
        // ✅ 1) 타임아웃 설정
        timeout: 10000,
        headers: {
            'accept': 'application/json',
            // ✅ 2) accept-encoding 제거하거나 gzip만 지정
            //    (br, zstd는 Node.js 기본 zlib로 해제 불가)
            'accept-encoding': 'gzip, deflate',
            'accept-language': 'ko;q=0.7',
            'authorization': `Bearer ${BEARER_TOKEN}`,
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
            // ✅ 3) 불필요한 브라우저 전용 헤더 제거
            //    (sec-ch-ua, sec-fetch-* 등은 서버 사이드에서 불필요)
        }
    };

    console.log(`Requesting: https://${options.hostname}${options.path}`);

    const proxyReq = https.request(options, (proxyRes) => {
        console.log(`Response status: ${proxyRes.statusCode}`);
        console.log(`Content-Encoding: ${proxyRes.headers['content-encoding']}`);

        // ✅ 4) 압축 해제 스트림 처리
        let stream = proxyRes;
        const encoding = proxyRes.headers['content-encoding'];

        if (encoding === 'gzip') {
            stream = proxyRes.pipe(zlib.createGunzip());
        } else if (encoding === 'deflate') {
            stream = proxyRes.pipe(zlib.createInflate());
        } else if (encoding === 'br') {
            stream = proxyRes.pipe(zlib.createBrotliDecompress());
        }

        let data = [];

        stream.on('data', (chunk) => {
            data.push(chunk);
        });

        stream.on('end', () => {
            const buffer = Buffer.concat(data);
            console.log(`Response received: ${buffer.length} bytes`);

            // ✅ 5) 디버깅용: 응답 내용 출력
            try {
                const text = buffer.toString('utf-8');
                console.log(`Response body (first 500 chars): ${text.substring(0, 500)}`);
            } catch (e) {
                console.log('Could not decode response as text');
            }

            res.writeHead(proxyRes.statusCode, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            });
            res.end(buffer);
        });

        // ✅ 6) 스트림 에러 처리
        stream.on('error', (err) => {
            console.error('Decompression error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Decompression failed: ' + err.message }));
        });
    });

    // ✅ 7) 타임아웃 이벤트 처리
    proxyReq.on('timeout', () => {
        console.error('Request timed out');
        proxyReq.destroy();
        res.writeHead(504, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Request timed out' }));
    });

    proxyReq.on('error', (err) => {
        console.error('Proxy error:', err.message);
        res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ error: err.message }));
    });

    proxyReq.end();
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname.startsWith('/api/')) {
        const apiPath = pathname.replace('/api', '') + (parsedUrl.search || '');
        proxyAPIRequest(apiPath, res);
        return;
    }

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
});
