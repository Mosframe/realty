// Edge Runtime test - uses Cloudflare Workers infrastructure instead of AWS Lambda
export const config = {
    runtime: 'edge',
    regions: ['icn1'],
};

export default async function handler(request) {
    const startTime = Date.now();

    const targetUrl = 'https://new.land.naver.com/api/regions/list?cortarNo=0000000000';

    const headers = {
        'accept': '*/*',
        'accept-encoding': 'identity',
        'accept-language': 'ko;q=0.7',
        'authorization': `Bearer ${process.env.NAVER_LAND_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlJFQUxFU1RBVEUiLCJpYXQiOjE3NzA5Nzc3OTksImV4cCI6MTc3MDk4ODU5OX0.KtZaFoCPtVy0DfFhF8KMbpJ-IUgE_CDNhO4HQtfzGt0'}`,
        'cache-control': 'no-cache',
        'cookie': process.env.NAVER_COOKIE || 'NV_WETR_LOCATION_RGN_M="MDI1OTA2MDA="; NNB=IJV4PMAXC4PWS; NID_AUT=Js4hLjHV4thouDK/Rg9dzcyYuIvc8ElNgiEM9e1kUvwvL83kDZMjxKbGSJxmHO4y; NAC=qyFaB4wCM87g; landHomeFlashUseYn=Y',
        'pragma': 'no-cache',
        'referer': 'https://new.land.naver.com/complexes',
        'sec-ch-ua': '"Not:A-Brand";v="99", "Brave";v="145", "Chromium";v="145"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'sec-gpc': '1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
    };

    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: headers,
        });

        const elapsed = Date.now() - startTime;
        const body = await response.text();

        let parsedBody;
        try {
            parsedBody = JSON.parse(body);
        } catch (e) {
            parsedBody = body.substring(0, 500);
        }

        return new Response(JSON.stringify({
            runtime: 'edge',
            success: response.status === 200,
            statusCode: response.status,
            elapsed: `${elapsed}ms`,
            body: parsedBody
        }, null, 2), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        const elapsed = Date.now() - startTime;
        return new Response(JSON.stringify({
            runtime: 'edge',
            success: false,
            error: err.message,
            elapsed: `${elapsed}ms`
        }, null, 2), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
