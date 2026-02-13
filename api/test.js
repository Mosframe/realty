const https = require('https');

module.exports = (req, res) => {
    const startTime = Date.now();

    const options = {
        hostname: 'new.land.naver.com',
        path: '/api/regions/list?cortarNo=0000000000',
        method: 'GET',
        headers: {
            'accept': '*/*',
            'accept-encoding': 'identity',
            'accept-language': 'ko;q=0.7',
            'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlJFQUxFU1RBVEUiLCJpYXQiOjE3NzA5Nzc3OTksImV4cCI6MTc3MDk4ODU5OX0.KtZaFoCPtVy0DfFhF8KMbpJ-IUgE_CDNhO4HQtfzGt0',
            'cache-control': 'no-cache',
            'cookie': 'NV_WETR_LOCATION_RGN_M="MDI1OTA2MDA="; NNB=IJV4PMAXC4PWS; NID_AUT=Js4hLjHV4thouDK/Rg9dzcyYuIvc8ElNgiEM9e1kUvwvL83kDZMjxKbGSJxmHO4y; NAC=qyFaB4wCM87g; NV_WETR_LAST_ACCESS_RGN_M="MDI1OTA2MDA="; ASID=3a7bcf630000019ba27235bc00000021; BUC=fwWdtkZ_bekHxEuCP-3DXCweJKyWYG9skA3Wjx5JSe0=; NID_SES=AAABypS30CNYOCRB/NNdzAvXtHzw+bZNIfD69/tEbyeCDiY0BvAROi2/Xdommc4CA8DadXXA7cp7TIMDupDLOGquknonUVX8rZUHOXq1Q4C3wDFTvGt8yS1sMTnNe9CDMCpX+2pLG11avt2frcGuJMI8E21MLtaDvhqpUM+DqUZFZ+aCBCDsU9GYN0gP7+Kxz+DbqIEKdLE8Zh3+GeBfiCkRN3ZAR+Eedw8o+UzZVdxyypUAXG1BLBumtqSqZd6Kwc7WdWghRqQYOWZNCWUFp1zrKStPG1S3XnHlGcqrsgLyj356QLTf48qfmVkj5tWzRTVtCleOYZiBeH4nz+4Ct8GfNX9p2S6INQwSd8RIGXxo73Rm42BgoG8jnWIdZsDylVyIPw5U6tkJZ9HbwOsu+2CJm4gJxC4Mg2IXZKSLDkyf243TuZ6ekjcWaIkFYmi0RINAyCtX/YzW8ChxWaWNmi/b0v0n6K2eNs/30bCL4yYzKfDBiKz41usVRZXYOITxm1+AN+VqHmgGQ9oA1F5zbVUR28zC4aA+AXr7A8hJMQFeig+WgaFNooCAHrg1h1nkrlnyhbg1XGE1vdp+vpmm8uBS2+FRxFWmPSHnYRgJ2mgB3ory; nhn.realestate.article.rlet_type_cd=A01; nhn.realestate.article.trade_type_cd=""; nhn.realestate.article.ipaddress_city=4100000000; landHomeFlashUseYn=Y; realestate.beta.lastclick.cortar=4159125600; REALESTATE=Fri%20Feb%2013%202026%2019%3A16%3A39%20GMT%2B0900%20(Korean%20Standard%20Time); PROP_TEST_KEY=1770977799430.551d3eddd43512a1afd41356bfaa7f4d98edd6f02a57905dd1708c1cc9357d56; PROP_TEST_ID=c8e5c52253d74ece8d473d1db4e27a35501605c5bb7e21f34e3b400067e568ee',
            'pragma': 'no-cache',
            'priority': 'u=1, i',
            'referer': 'https://new.land.naver.com/complexes',
            'origin': 'https://new.land.naver.com',
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
        proxyRes.on('data', chunk => data.push(chunk));
        proxyRes.on('end', () => {
            const elapsed = Date.now() - startTime;
            const buffer = Buffer.concat(data);
            let body;
            try {
                body = JSON.parse(buffer.toString('utf-8'));
            } catch (e) {
                body = buffer.toString('utf-8').substring(0, 500);
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                success: proxyRes.statusCode === 200,
                statusCode: proxyRes.statusCode,
                elapsed: `${elapsed}ms`,
                responseHeaders: proxyRes.headers,
                body: body
            }, null, 2));
        });
    });

    proxyReq.on('error', (err) => {
        const elapsed = Date.now() - startTime;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            success: false,
            error: err.message,
            code: err.code,
            elapsed: `${elapsed}ms`
        }, null, 2));
    });

    proxyReq.setTimeout(55000, () => {
        const elapsed = Date.now() - startTime;
        proxyReq.destroy();
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            success: false,
            error: 'TIMEOUT',
            elapsed: `${elapsed}ms`,
            message: 'Naver API did not respond within 55 seconds'
        }, null, 2));
    });

    proxyReq.end();
};
