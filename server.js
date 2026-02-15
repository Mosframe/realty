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
        console.log('[토큰갱신] 네이버 부동산 토큰 API 호출 중...');
        const req = https.request({
            hostname: 'new.land.naver.com',
            path: '/api/auth/getAuthToken',
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'accept-language': 'ko-KR,ko;q=0.9',
                'cookie': cookie,
                'referer': 'https://new.land.naver.com/',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
            }
        }, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                console.log(`[토큰갱신] 응답 상태: ${res.statusCode}`);
                if (res.statusCode === 429) {
                    console.warn('[토큰갱신] Rate limit 초과. 잠시 후 재시도됩니다.');
                    return reject(new Error('요청 과다 (429). 잠시 후 재시도하세요.'));
                }
                try {
                    const data = JSON.parse(body);
                    const newToken = data.accessToken || data.token || data.result?.accessToken;
                    if (newToken) {
                        const exp = getTokenExpiry(newToken);
                        if (exp && exp > Date.now()) {
                            BEARER_TOKEN = newToken;
                            console.log(`[토큰갱신] 성공! 만료: ${new Date(exp).toLocaleString('ko-KR')}`);
                            scheduleTokenRefresh();
                            return resolve(newToken);
                        }
                    }
                    // JSON에서 토큰을 못 찾으면 body 전체에서 JWT 패턴 검색
                    const jwtMatch = body.match(/(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/);
                    if (jwtMatch) {
                        const token = jwtMatch[1];
                        const exp = getTokenExpiry(token);
                        try {
                            const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                            if (payload.id === 'REALESTATE' && exp && exp > Date.now()) {
                                BEARER_TOKEN = token;
                                console.log(`[토큰갱신] 성공! 만료: ${new Date(exp).toLocaleString('ko-KR')}`);
                                scheduleTokenRefresh();
                                return resolve(token);
                            }
                        } catch (e) { /* ignore */ }
                    }
                    console.warn('[토큰갱신] 유효한 토큰을 찾지 못했습니다. 응답:', body.substring(0, 200));
                    reject(new Error('토큰을 찾을 수 없음'));
                } catch (e) {
                    console.warn('[토큰갱신] 응답 파싱 실패:', body.substring(0, 200));
                    reject(new Error('응답 파싱 실패'));
                }
            });
        });
        req.on('error', (err) => { console.error('[토큰갱신] 요청 실패:', err.message); reject(err); });
        req.setTimeout(15000, () => req.destroy(new Error('토큰 갱신 타임아웃')));
        req.end();
    });
}

// 만료 10분 전에 자동 갱신
function scheduleTokenRefresh() {
    if (tokenRefreshTimer) clearTimeout(tokenRefreshTimer);
    const exp = getTokenExpiry(BEARER_TOKEN);
    if (!exp) return;
    const delay = exp - 10 * 60 * 1000 - Date.now();
    if (delay <= 0) {
        console.log('[토큰갱신] 토큰 만료 임박, 즉시 갱신...');
        refreshToken().catch(() => {
            tokenRefreshTimer = setTimeout(() => refreshToken().catch(() => { }), 5 * 60 * 1000);
        });
    } else {
        console.log(`[토큰갱신] 다음 갱신: ${Math.round(delay / 60000)}분 후`);
        tokenRefreshTimer = setTimeout(() => {
            refreshToken().catch(() => {
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

    // Parse URL to extract query parameters
    const parsedUrl = url.parse(apiPath, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // Try to use mock data if enabled
    if (USE_MOCK_DATA) {
        const mockKey = getMockDataKey(pathname, query);

        if (mockKey && mockData[mockKey]) {
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

    const proxyReq = https.request(options, (proxyRes) => {

        let data = [];

        proxyRes.on('data', (chunk) => {
            data.push(chunk);
        });

        proxyRes.on('end', () => {
            const buffer = Buffer.concat(data);

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
        const pkg = require('./package.json');
        const defaults = {
            sido: config['기본_시도'] || config.DEFAULT_SIDO || '',
            district: config['기본_시군구'] || config.DEFAULT_DISTRICT || '',
            dong: config['기본_동'] || config.DEFAULT_DONG || '',
            pyeongMin: config['기본_최소평형'] || config.DEFAULT_PYEONG_MIN || '',
            pyeongMax: config['기본_최대평형'] || config.DEFAULT_PYEONG_MAX || '',
            dateFrom: config['기본_시작일자'] || config.DEFAULT_DATE_FROM || (() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); })(),
            dateTo: config['기본_종료일자'] || config.DEFAULT_DATE_TO || '',
            topOnly: config['기본_단지별최고가만'] || config.DEFAULT_TOP_ONLY || 'false'
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ expDate, version: pkg.version, defaults }));
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
