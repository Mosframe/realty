// Edge Runtime - runs on Cloudflare Workers, not AWS (different IP range, may not be blocked by Naver)
export const config = {
    runtime: 'edge',
    regions: ['icn1'],
};

export default async function handler(request) {
    const url = new URL(request.url);
    const apiPath = url.pathname + url.search; // /api/regions/list?cortarNo=...

    const targetUrl = `https://new.land.naver.com${apiPath}`;

    const headers = {
        'accept': '*/*',
        'accept-encoding': 'identity',
        'accept-language': 'ko;q=0.7',
        'authorization': `Bearer ${process.env.NAVER_LAND_TOKEN || ''}`,
        'cache-control': 'no-cache',
        'cookie': process.env.NAVER_COOKIE || '',
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

        const body = await response.text();

        return new Response(body, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    } catch (err) {
        return new Response(JSON.stringify({
            error: true,
            statusCode: 500,
            message: err.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}
