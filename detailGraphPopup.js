// 거래내역 가격 추이 그래프 팝업용 (Chart.js 필요)
// 이 파일은 detailGraphPopup.js로 저장됨

function openDetailGraphPopup(trades, title) {
    // Chart.js CDN 동적 로드
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => openDetailGraphPopup(trades, title);
        document.body.appendChild(script);
        return;
    }
    // 팝업 생성
    const width = 600, height = 400;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;
    const popup = window.open('', 'detailGraphPopup', `width=${width},height=${height},left=${left},top=${top}`);
    if (!popup) return alert('팝업 차단을 해제해주세요.');
    // HTML
    popup.document.write(`
        <html><head>
        <title>${title} - 거래내역 가격 추이</title>
        <meta charset='utf-8'>
        <style>body{font-family:sans-serif;margin:0;padding:20px;background:#fff;}h2{font-size:18px;margin-bottom:10px;}#chart{max-width:100%;}</style>
        <script src='https://cdn.jsdelivr.net/npm/chart.js'></script>
        </head><body>
        <h2>${title} - 거래내역 가격 추이</h2>
        <canvas id='chart' width='${width - 40}' height='${height - 80}'></canvas>
        </body></html>
    `);
    popup.document.close();
    // 데이터 준비
    const labels = trades.map(t => t.date);
    const data = trades.map(t => t.price);
    // 차트 렌더 (팝업 내)
    popup.onload = () => {
        const ctx = popup.document.getElementById('chart').getContext('2d');
        new popup.Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: '거래금액(만원)',
                    data,
                    borderColor: '#4a90e2',
                    backgroundColor: 'rgba(74,144,226,0.1)',
                    fill: true,
                    tension: 0.2,
                    pointRadius: 3,
                    pointBackgroundColor: '#e74c3c',
                }]
            },
            options: {
                responsive: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: false, ticks: { callback: v => v.toLocaleString() + '만원' } }
                }
            }
        });
    };
}
