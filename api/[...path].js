const https = require('https');
const url = require('url');

const API_BASE_URL = 'new.land.naver.com';
const BEARER_TOKEN = process.env.NAVER_LAND_TOKEN || '';
const NAVER_COOKIE = process.env.NAVER_COOKIE || 'NV_WETR_LOCATION_RGN_M="MDI1OTA2MDA="; NNB=IJV4PMAXC4PWS; NID_AUT=Js4hLjHV4thouDK/Rg9dzcyYuIvc8ElNgiEM9e1kUvwvL83kDZMjxKbGSJxmHO4y; NAC=qyFaB4wCM87g; NV_WETR_LAST_ACCESS_RGN_M="MDI1OTA2MDA="; ASID=3a7bcf630000019ba27235bc00000021; BUC=fwWdtkZ_bekHxEuCP-3DXCweJKyWYG9skA3Wjx5JSe0=; NID_SES=AAABypS30CNYOCRB/NNdzAvXtHzw+bZNIfD69/tEbyeCDiY0BvAROi2/Xdommc4CA8DadXXA7cp7TIMDupDLOGquknonUVX8rZUHOXq1Q4C3wDFTvGt8yS1sMTnNe9CDMCpX+2pLG11avt2frcGuJMI8E21MLtaDvhqpUM+DqUZFZ+aCBCDsU9GYN0gP7+Kxz+DbqIEKdLE8Zh3+GeBfiCkRN3ZAR+Eedw8o+UzZVdxyypUAXG1BLBumtqSqZd6Kwc7WdWghRqQYOWZNCWUFp1zrKStPG1S3XnHlGcqrsgLyj356QLTf48qfmVkj5tWzRTVtCleOYZiBeH4nz+4Ct8GfNX9p2S6INQwSd8RIGXxo73Rm42BgoG8jnWIdZsDylVyIPw5U6tkJZ9HbwOsu+2CJm4gJxC4Mg2IXZKSLDkyf243TuZ6ekjcWaIkFYmi0RINAyCtX/YzW8ChxWaWNmi/b0v0n6K2eNs/30bCL4yYzKfDBiKz41usVRZXYOITxm1+AN+VqHmgGQ9oA1F5zbVUR28zC4aA+AXr7A8hJMQFeig+WgaFNooCAHrg1h1nkrlnyhbg1XGE1vdp+vpmm8uBS2+FRxFWmPSHnYRgJ2mgB3ory; nhn.realestate.article.rlet_type_cd=A01; nhn.realestate.article.trade_type_cd=""; nhn.realestate.article.ipaddress_city=4100000000; landHomeFlashUseYn=Y; realestate.beta.lastclick.cortar=4159125600';

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

    console.log({ hostname: options.hostname, path: options.path, hasCookie: !!headers['cookie'], hasAuth: !!headers['authorization'] });

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
