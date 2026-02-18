const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const BaseURL = 'https://mosframe.github.io/realty';

var isLogin = false;

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
    console.log({ config });
    return config;
}
function loadConfigJson(onSuccess, onError) {

    const url = 'https://mosframe.github.io/realty/config.json';
    https.get(url).on('response', (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                //console.log('config.json 로드 완료:', json);
                if (onSuccess) onSuccess(json);
            } catch (e) {
                console.error('config.json 파싱 오류:', e);
                if (onError) onError(e);
            }
        });
    }).on('error', (err) => {
        console.error('config.json 로드 실패:', err);
        if (onError) onError(err);
    });

}

const config = loadConfig();
let configJson = {};
loadConfigJson(
    (json) => {
        configJson = json;
    },
    (err) => {
        console.error('config.json 로드 실패:', err);
    }
);
const PORT = parseInt(config.PORT) || 3000;
const API_BASE_URL = 'new.land.naver.com';


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

// Proxy API requests to Naver Land or return mock data
function proxyAPIRequest(apiPath, res) {

    if (!isLogin) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: '로그인이 필요합니다.' }));
        return;
    }

    const BEARER_TOKEN = configJson.TOKEN || '';
    const COOKIE = configJson.COOKIE || '';

    //console.log({ apiPath, BEARER_TOKEN, COOKIE });

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
            'cookie': COOKIE,
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

    console.log(`req: ${req.method} ${req.url}`);

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // 로그인
    if (pathname === '/api/login') {

        const { id, pw } = parsedUrl.query;
        https.get(`${BaseURL}/members/${id}`, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                try {
                    const serverPw = data;
                    console.log({ id, pw, serverPw });
                    const success = pw === serverPw;
                    isLogin = success;
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success }));
                } catch (e) {
                    console.error('회원 정보 파싱 오류:', e);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: '회원 정보 파싱 오류' }));
                }
            });
        }).on('error', (err) => {
            console.error('회원 정보 요청 실패:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: '회원 정보 요청 실패' }));
        });

        return;
    }

    // 설정값 얻기
    if (pathname === '/api/config') {

        https.get(`${BaseURL}/package.json`, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {

                console.log({ data });
                const pkg = JSON.parse(data);
                const defaults = {
                    sido: config['기본_시도'] || config.DEFAULT_SIDO || '',
                    district: config['기본_시군구'] || config.DEFAULT_DISTRICT || '',
                    dong: config['기본_동'] || config.DEFAULT_DONG || '',
                    pyeongMin: config['기본_최소평형'] || config.DEFAULT_PYEONG_MIN || '',
                    pyeongMax: config['기본_최대평형'] || config.DEFAULT_PYEONG_MAX || '',
                    dateFrom: config['기본_시작일자'] || config.DEFAULT_DATE_FROM || '',
                    dateTo: config['기본_종료일자'] || config.DEFAULT_DATE_TO || '',
                    topOnly: config['기본_단지별최고가만'] || config.DEFAULT_TOP_ONLY || 'false'
                };
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ version: pkg.version, defaults }));
            });
        }).on('error', (err) => {
            console.error('설정값 요청 실패:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '설정값 요청 실패' }));
        });

        return;
    }

    // API 플록시 요청
    if (pathname.startsWith('/api/')) {

        const apiPath = pathname + (parsedUrl.search || '');
        proxyAPIRequest(apiPath, res);
        return;
    }

    // 정적 파일들 요청

    const debug = process.argv.includes('--debug') || process.argv.includes('-d');
    if (debug) {

        serveLocalFile();
    }
    else {

        const remoteUrl = `${BaseURL}${pathname}`;
        https.get(remoteUrl, (remoteRes) => {
            if (remoteRes.statusCode === 200) {
                remoteRes.pipe(res);
            } else {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            }
        }).on('error', (err) => {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>', 'utf-8');
        });
    }

    function serveLocalFile() {

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
    }
});

server.listen(PORT, () => {

    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('Press Ctrl+C to stop the server');

    const { exec } = require('child_process');
    exec(`start http://localhost:${PORT}`);
});
