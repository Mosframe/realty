const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const mockData = require('./mockData');

// config.txt 읽기 (exe 옆 또는 server.js 옆)
function loadConfig() {
    const config = {};
    const configPath = path.join(path.dirname(process.pkg ? process.execPath : __filename), 'config.txt');
    try {
        const content = fs.readFileSync(configPath, 'utf-8');
        for (const line of content.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const idx = trimmed.indexOf('=');
            if (idx === -1) continue;
            const key = trimmed.substring(0, idx).trim();
            const value = trimmed.substring(idx + 1).trim();
            config[key] = value;
        }
        console.log(`config.txt 로드 완료: ${configPath}`);
    } catch (e) {
        console.warn(`config.txt를 찾을 수 없습니다 (${configPath}). 기본값을 사용합니다.`);
    }
    return config;
}

const config = loadConfig();
const PORT = parseInt(config.PORT) || 3000;
const API_BASE_URL = 'new.land.naver.com';
let BEARER_TOKEN = config.NAVER_LAND_TOKEN || '';
const USE_MOCK_DATA = (config.USE_MOCK_DATA || 'false').toLowerCase() === 'true';
let tokenRefreshTimer = null;

// JWT 토큰에서 만료 시간 추출
function getTokenExpiry(token) {
    if (!token) return null;
    try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        return payload.exp ? payload.exp * 1000 : null;
    } catch (e) { return null; }
}

// 네이버 부동산 페이지에서 새 토큰 가져오기
function refreshToken() {
    return new Promise((resolve, reject) => {
        const cookie = config.NAVER_COOKIE || '';
        if (!cookie) {
            console.warn('[토큰갱신] 쿠키가 없어 토큰을 갱신할 수 없습니다.');
            return reject(new Error('쿠키 없음'));
        }

        console.log('[토큰갱신] 네이버 부동산에서 토큰 가져오는 중...');
        const options = {
            hostname: 'new.land.naver.com',
            path: '/',
            method: 'GET',
            headers: {
                'accept': 'text/html,application/xhtml+xml',
                'accept-language': 'ko-KR,ko;q=0.9',
                'cookie': cookie,
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                // __NEXT_DATA__ 또는 script 내 jwt 토큰 추출
                const patterns = [
                    /"accessToken"\s*:\s*"(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)"/,
                    /"token"\s*:\s*"(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)"/,
                    /Bearer\s+(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/,
                    /(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/
                ];

                for (const pattern of patterns) {
                    const match = body.match(pattern);
                    if (match && match[1]) {
                        const newToken = match[1];
                        const exp = getTokenExpiry(newToken);
                        // REALESTATE 용 토큰인지 확인
                        try {
                            const payload = JSON.parse(Buffer.from(newToken.split('.')[1], 'base64').toString());
                            if (payload.id === 'REALESTATE' && exp && exp > Date.now()) {
                                BEARER_TOKEN = newToken;
                                const expDate = new Date(exp);
                                console.log(`[토큰갱신] 성공! 만료: ${expDate.toLocaleString('ko-KR')}`);
                                scheduleTokenRefresh();
                                return resolve(newToken);
                            }
                        } catch (e) { /* 다음 패턴 시도 */ }
                    }
                }
                console.warn('[토큰갱신] 페이지에서 유효한 토큰을 찾지 못했습니다.');
                reject(new Error('토큰을 찾을 수 없음'));
            });
        });

        req.on('error', (err) => {
            console.error('[토큰갱신] 요청 실패:', err.message);
            reject(err);
        });

        req.setTimeout(15000, () => {
            req.destroy(new Error('토큰 갱신 타임아웃'));
        });

        req.end();
    });
}

// 만료 10분 전에 자동 갱신 스케줄링
function scheduleTokenRefresh() {
    if (tokenRefreshTimer) clearTimeout(tokenRefreshTimer);

    const exp = getTokenExpiry(BEARER_TOKEN);
    if (!exp) return;

    const refreshAt = exp - 10 * 60 * 1000; // 만료 10분 전
    const delay = refreshAt - Date.now();

    if (delay <= 0) {
        // 이미 만료 임박 또는 만료됨 → 즉시 갱신
        console.log('[토큰갱신] 토큰 만료 임박, 즉시 갱신 시도...');
        refreshToken().catch(() => {
            // 실패 시 5분 후 재시도
            tokenRefreshTimer = setTimeout(() => refreshToken().catch(() => { }), 5 * 60 * 1000);
        });
    } else {
        const refreshDate = new Date(refreshAt);
        console.log(`[토큰갱신] 다음 갱신 예정: ${refreshDate.toLocaleString('ko-KR')} (${Math.round(delay / 60000)}분 후)`);
        tokenRefreshTimer = setTimeout(() => {
            refreshToken().catch(() => {
                // 실패 시 5분 후 재시도
                tokenRefreshTimer = setTimeout(() => refreshToken().catch(() => { }), 5 * 60 * 1000);
            });
        }, delay);
    }
}

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
    if (pathname === '/api/regions/list') {
        return `regions_${query.cortarNo}`;
    } else if (pathname === '/api/regions/complexes') {
        return `complexes_${query.cortarNo}`;
    } else if (pathname.match(/^\/api\/complexes\/\d+$/)) {
        const complexNo = pathname.split('/')[3];
        return `complex_${complexNo}`;
    } else if (pathname.match(/^\/api\/complexes\/\d+\/prices\/real$/)) {
        const complexNo = pathname.split('/')[3];
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
            'accept': '*/*',
            'accept-encoding': 'identity',
            'accept-language': 'ko;q=0.7',
            'authorization': `Bearer ${BEARER_TOKEN}`,
            'cache-control': 'no-cache',
            'cookie': config.NAVER_COOKIE || '',
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

    console.log({ hostname: options.hostname, path: options.path, auth: options.headers.authorization });

    const proxyReq = https.request(options, (proxyRes) => {
        console.log(`Response status: ${proxyRes.statusCode}`);

        let data = [];

        proxyRes.on('data', (chunk) => {
            data.push(chunk);
        });

        proxyRes.on('end', () => {
            const buffer = Buffer.concat(data);
            console.log(`Response received: ${buffer.length} bytes`);

            // If upstream returned an error, include details
            if (proxyRes.statusCode >= 400) {
                const bodyStr = buffer.toString('utf-8');
                console.error(`API Error [${proxyRes.statusCode}]: ${bodyStr}`);
                res.writeHead(proxyRes.statusCode, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                });
                res.end(JSON.stringify({
                    error: true,
                    statusCode: proxyRes.statusCode,
                    message: bodyStr
                }));
                return;
            }

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
        if (!res.headersSent) {
            res.writeHead(500, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ error: true, statusCode: 500, message: err.message }));
        }
    });

    proxyReq.setTimeout(30000, () => {
        console.error('Proxy request timed out');
        proxyReq.destroy(new Error('Request timed out'));
    });

    proxyReq.end();
}

// Create HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // 토큰 만료일 조회
    if (pathname === '/api/token-info') {
        const exp = getTokenExpiry(BEARER_TOKEN);
        const expDate = exp ? new Date(exp).toISOString() : null;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ expDate }));
        return;
    }

    // 수동 토큰 갱신
    if (pathname === '/api/token-refresh') {
        refreshToken()
            .then(() => {
                const exp = getTokenExpiry(BEARER_TOKEN);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, expDate: exp ? new Date(exp).toISOString() : null }));
            })
            .catch((err) => {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: err.message }));
            });
        return;
    }

    // Handle API proxy requests
    if (pathname.startsWith('/api/')) {
        //const apiPath = pathname.replace('/api', '') + (parsedUrl.search || '');
        const apiPath = pathname + (parsedUrl.search || '');
        proxyAPIRequest(apiPath, res);
        return;
    }

    // Handle static files
    // Both pkg (snapshot filesystem) and normal node use __dirname
    let filePath = path.join(__dirname, pathname);
    if (pathname === '/') {
        filePath = path.join(__dirname, 'index.html');
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

    // 토큰 자동 갱신 시작
    const exp = getTokenExpiry(BEARER_TOKEN);
    if (exp) {
        console.log(`[토큰] 현재 만료: ${new Date(exp).toLocaleString('ko-KR')}`);
        scheduleTokenRefresh();
    } else {
        console.log('[토큰] 저장된 토큰 없음, 즉시 갱신 시도...');
        refreshToken().catch(() => console.warn('[토큰] 자동 갱신 실패. config.txt에 유효한 쿠키를 설정하세요.'));
    }

    // Auto-open browser
    const { exec } = require('child_process');
    exec(`start http://localhost:${PORT}`);
});
