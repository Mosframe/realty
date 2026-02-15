// 클립보드 복사 기능
function copyTableToClipboard() {
    const table = document.getElementById('resultsTable');
    if (!table) return;
    // 검색 조건 추출
    const now = new Date();
    const dateStr = now.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    const sido = sidoSelect.options[sidoSelect.selectedIndex]?.text || '';
    const district = districtSelect.options[districtSelect.selectedIndex]?.text || '';
    const dong = dongSelect.options[dongSelect.selectedIndex]?.text || '';
    const pyeongMin = pyeongMinInput.value;
    const pyeongMax = pyeongMaxInput.value;
    const dateFrom = dateFromInput.value;
    const dateTo = dateToInput.value;
    const topOnly = topOnlyCheckbox.checked ? '단지별 최고 평단가만' : '';
    const conds = [
        `조회일자: ${dateStr}`,
        `지역: ${sido} ${district} ${dong}`.trim(),
        `평형: ${pyeongMin || '-'} ~ ${pyeongMax || '-'}평`,
        `거래일자: ${dateFrom || '-'} ~ ${dateTo || '-'}`,
        topOnly
    ].filter(Boolean);
    let tsv = conds.join('\n') + '\n';
    // 헤더
    const headers = Array.from(table.querySelectorAll('thead tr th')).map(th => th.innerText.trim());
    tsv += headers.join('\t') + '\n';
    // 데이터
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    for (const row of rows) {
        const cells = Array.from(row.querySelectorAll('td')).map(td => td.innerText.replace(/\n/g, ' ').trim());
        if (cells.length === headers.length) {
            tsv += cells.join('\t') + '\n';
        }
    }
    navigator.clipboard.writeText(tsv).then(() => {
        alert('표가 클립보드에 복사되었습니다!');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const copyBtn = document.getElementById('copyClipboardBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyTableToClipboard);
    }
});
// 엑셀 다운로드 기능 (SheetJS)
function exportTableToExcel() {
    // SheetJS가 없으면 동적 로드
    if (typeof XLSX === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js';
        script.onload = exportTableToExcel;
        document.body.appendChild(script);
        return;
    }
    const table = document.getElementById('resultsTable');
    // 테이블 복제 후 상단에 조회일자 및 검색조건 행 추가
    const clone = table.cloneNode(true);
    const now = new Date();
    const dateStr = now.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    // 검색 조건 추출
    const sido = sidoSelect.options[sidoSelect.selectedIndex]?.text || '';
    const district = districtSelect.options[districtSelect.selectedIndex]?.text || '';
    const dong = dongSelect.options[dongSelect.selectedIndex]?.text || '';
    const pyeongMin = pyeongMinInput.value;
    const pyeongMax = pyeongMaxInput.value;
    const dateFrom = dateFromInput.value;
    const dateTo = dateToInput.value;
    const topOnly = topOnlyCheckbox.checked ? '단지별 최고 평단가만' : '';
    // 조건 행들 추가 (아래에서 위로 삽입)
    let insertAt = 0;
    const conds = [
        `조회일자: ${dateStr}`,
        `지역: ${sido} ${district} ${dong}`.trim(),
        `평형: ${pyeongMin || '-'} ~ ${pyeongMax || '-'}평`,
        `거래일자: ${dateFrom || '-'} ~ ${dateTo || '-'}`,
        topOnly
    ].filter(Boolean);
    for (let i = conds.length - 1; i >= 0; i--) {
        const row = clone.insertRow(insertAt);
        const cell = row.insertCell(0);
        cell.colSpan = clone.rows[conds.length]?.cells.length || clone.rows[conds.length - 1]?.cells.length || 7;
        cell.innerText = conds[i];
    }
    // 엑셀 변환
    const wb = XLSX.utils.table_to_book(clone, { sheet: '실거래가' });
    // SheetJS 스타일 적용
    const ws = wb.Sheets['실거래가'];
    // 컬럼 넓이 지정 (웹과 유사하게)
    ws['!cols'] = [
        { wch: 6 },   // 순위
        { wch: 18 },  // 아파트명
        { wch: 8 },   // 평형
        { wch: 6 },   // 층
        { wch: 14 },  // 현재시세
        { wch: 12 },  // 평단가
        { wch: 14 }   // 거래일자
    ];
    // 조건/조회일자 행 스타일 (A1~An)
    for (let i = 1; i <= conds.length; i++) {
        const cell = ws[`A${i}`];
        if (cell) {
            cell.s = {
                fill: { fgColor: { rgb: 'FFF9E5' } },
                font: { bold: true, color: { rgb: '333333' } },
                alignment: { horizontal: 'left' }
            };
        }
    }
    // 헤더 행 스타일 (조건행 다음)
    const headerRow = conds.length + 1;
    const colCount = clone.rows[conds.length]?.cells.length || 7;
    for (let c = 0; c < colCount; c++) {
        const col = String.fromCharCode(65 + c); // A, B, C ...
        const cell = ws[`${col}${headerRow}`];
        if (cell) {
            cell.s = {
                fill: { fgColor: { rgb: 'E3F2FD' } },
                font: { bold: true },
                border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } },
                alignment: { horizontal: 'center' }
            };
        }
    }
    // 데이터 행 테두리
    const rowLen = clone.rows.length;
    for (let r = headerRow + 1; r <= rowLen; r++) {
        for (let c = 0; c < colCount; c++) {
            const col = String.fromCharCode(65 + c);
            const cell = ws[`${col}${r}`];
            if (cell) {
                cell.s = {
                    border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } },
                    alignment: { horizontal: c === 0 ? 'center' : 'right' }
                };
            }
        }
    }
    // 파일명에 조회일자 포함
    const fileDate = now.getFullYear().toString()
        + ('0' + (now.getMonth() + 1)).slice(-2)
        + ('0' + now.getDate()).slice(-2)
        + '_'
        + ('0' + now.getHours()).slice(-2)
        + ('0' + now.getMinutes()).slice(-2);
    XLSX.writeFile(wb, `실거래가_조회결과_${fileDate}.xlsx`);
}

document.addEventListener('DOMContentLoaded', () => {
    const excelBtn = document.getElementById('excelDownloadBtn');
    if (excelBtn) {
        excelBtn.addEventListener('click', exportTableToExcel);
    }
});
// ...existing code...
// API Configuration
// Use local proxy server to avoid CORS issues
const API_BASE_URL = '/api';

// State
let currentCortarNo = null;

// DOM Elements
const sidoSelect = document.getElementById('sido');
const districtSelect = document.getElementById('district');
const dongSelect = document.getElementById('dong');
const searchBtn = document.getElementById('searchBtn');

// 조회중일 때 옵션 비활성화, 그 외엔 활성화
function updateFilterDisabled() {
    const disabled = searchState === 'searching';
    // 시도, 시군구, 동, 평형, 날짜, 체크박스 모두 비활성화 (조회중)
    sidoSelect.disabled = disabled;
    districtSelect.disabled = disabled;
    dongSelect.disabled = disabled;
    pyeongMinInput.disabled = disabled;
    pyeongMaxInput.disabled = disabled;
    dateFromInput.disabled = disabled;
    dateToInput.disabled = disabled;
    topOnlyCheckbox.disabled = disabled;
    // 조회 버튼은 별도 로직에서 관리
}

// updateSearchBtn에서 옵션 활성/비활성도 같이 처리
const _origUpdateSearchBtn = updateSearchBtn;
updateSearchBtn = function () {
    _origUpdateSearchBtn();
    updateFilterDisabled();
};

function updateSearchBtn() {
    if (searchState === 'idle') {
        searchBtn.textContent = '조회';
        searchBtn.classList.remove('paused');
    } else if (searchState === 'searching') {
        searchBtn.textContent = '일시중지';
        searchBtn.classList.remove('paused');
    } else if (searchState === 'paused') {
        searchBtn.textContent = '계속조회';
        searchBtn.classList.add('paused');
    }
    searchBtn.disabled = false;
    // 엑셀 다운로드 버튼 표시/숨김
    const excelBtn = document.getElementById('excelDownloadBtn');
    const copyBtn = document.getElementById('copyClipboardBtn');
    if (excelBtn) {
        if (searchState === 'idle') {
            excelBtn.style.display = '';
        } else {
            excelBtn.style.display = 'none';
        }
    }
    if (copyBtn) {
        if (searchState === 'idle') {
            copyBtn.style.display = '';
        } else {
            copyBtn.style.display = 'none';
        }
    }
}

searchBtn.addEventListener('click', async () => {
    if (searchState === 'idle') {
        searchState = 'searching';
        sidoSelect.disabled = true;
        updateSearchBtn();
        await searchRealEstate();
    } else if (searchState === 'searching') {
        // Pause
        searchAborted = true;
        searchState = 'paused';
        updateSearchBtn();
    } else if (searchState === 'paused') {
        // Resume
        searchState = 'searching';
        sidoSelect.disabled = true;
        updateSearchBtn();
        await searchRealEstate(true); // resume
    }
});
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const resultsTable = document.getElementById('resultsTable').querySelector('tbody');
const pyeongMinInput = document.getElementById('pyeongMin');
const pyeongMaxInput = document.getElementById('pyeongMax');
const dateFromInput = document.getElementById('dateFrom');
const dateToInput = document.getElementById('dateTo');
const topOnlyCheckbox = document.getElementById('topOnlyCheckbox');

// 토큰 만료일 표시 + 버전 표시 + 자동 업데이트
(function initTokenExpiry() {
    const el = document.getElementById('tokenExpiryText');
    const refreshBtn = document.getElementById('tokenRefreshBtn');

    async function updateTokenExpiry() {
        try {
            const res = await fetch('/api/token-info');
            const data = await res.json();
            if (data.version) {
                document.getElementById('appVersion').textContent = `v${data.version}`;
            }
            if (data.expDate) {
                const exp = new Date(data.expDate);
                const now = new Date();
                const diffMs = exp - now;
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                const dateStr = exp.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                if (diffMs <= 0) {
                    el.textContent = `만료됨 (${dateStr})`;
                    el.parentElement.className = 'token-expiry expired';
                } else if (diffHours < 1) {
                    el.textContent = `${diffMins}분 후 만료 (${dateStr})`;
                    el.parentElement.className = 'token-expiry expiring-soon';
                } else {
                    el.textContent = `토큰 만료: ${dateStr}`;
                    el.parentElement.className = 'token-expiry';
                }
            } else {
                el.textContent = '토큰 없음';
                el.parentElement.className = 'token-expiry expired';
            }
        } catch (e) { /* ignore */ }
    }

    refreshBtn.addEventListener('click', async () => {
        refreshBtn.disabled = true;
        refreshBtn.textContent = '⏳';
        try {
            const res = await fetch('/api/token-refresh');
            const data = await res.json();
            if (data.success) {
                await updateTokenExpiry();
            } else {
                el.textContent = `갱신 실패: ${data.message}`;
                el.parentElement.className = 'token-expiry expired';
            }
        } catch (e) {
            el.textContent = '갱신 실패';
            el.parentElement.className = 'token-expiry expired';
        } finally {
            refreshBtn.disabled = false;
            refreshBtn.textContent = '↻';
        }
    });

    updateTokenExpiry(); // 자동 갱신 중지: setInterval 제거
})();

// Set default date range (1 month ago ~ today)
(function setDefaultDateRange() {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    dateToInput.value = today.toISOString().split('T')[0];
    dateFromInput.value = oneMonthAgo.toISOString().split('T')[0];
})();

// Helper function to make API calls with timeout and retry
async function fetchAPI(url, retries = 2) {
    // 네이버 API 요청 간 100ms 지연
    await new Promise(r => setTimeout(r, 100));

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                let errorDetail = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorDetail = `[${errorData.statusCode}] ${errorData.message}`;
                    console.error('Server Error:', errorData);
                } catch (e) {
                    const text = await response.text();
                    errorDetail = `[${response.status}] ${text}`;
                    console.error('Server Error:', text);
                }
                // Retry on 5xx errors
                if (response.status >= 500 && attempt < retries) {
                    console.warn(`Retrying (${attempt + 1}/${retries})... ${url}`);
                    await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                    continue;
                }
                showError(`서버 오류: ${errorDetail}`);
                throw new Error(errorDetail);
            }

            return await response.json();
        } catch (err) {
            if (err.name === 'AbortError') {
                console.warn(`Request timeout (${attempt + 1}/${retries + 1}): ${url}`);
                if (attempt < retries) {
                    await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                    continue;
                }
                showError('요청 시간이 초과되었습니다. 다시 시도해주세요.');
            }
            console.error('API Error:', err);
            throw err;
        }
    }
}

// Show/Hide loading
function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
}

// Show error message
function showError(message) {
    error.textContent = message;
    error.style.display = 'block';
    setTimeout(() => {
        error.style.display = 'none';
    }, 5000);
}

// Format price to Korean currency
function formatPrice(price) {
    const eok = Math.floor(price / 10000);
    const man = price % 10000;

    if (eok > 0 && man > 0) {
        return `${eok}억 ${man.toLocaleString()}만원`;
    } else if (eok > 0) {
        return `${eok}억원`;
    } else {
        return `${man.toLocaleString()}만원`;
    }
}

// Load 시도 (City/Province)
// select에서 코드 또는 한글명으로 값 선택
function selectByValueOrText(selectEl, val) {
    if (!val) return;
    // 코드로 매칭
    for (const opt of selectEl.options) {
        if (opt.value === val) { selectEl.value = val; return; }
    }
    // 한글명으로 매칭 (포함 검색)
    for (const opt of selectEl.options) {
        if (opt.textContent === val || opt.textContent.includes(val)) {
            selectEl.value = opt.value;
            return;
        }
    }
}

// 선택된 값 반환 (selectByValueOrText 후 사용)
function getSelectedValue(selectEl) {
    return selectEl.value || '';
}

async function loadSido(defaultValue) {
    try {
        const data = await fetchAPI(`${API_BASE_URL}/regions/list?cortarNo=0000000000`);

        sidoSelect.innerHTML = '<option value="">시도 선택</option>';

        if (data.regionList && data.regionList.length > 0) {
            data.regionList.forEach(region => {
                const option = document.createElement('option');
                option.value = region.cortarNo;
                option.textContent = region.cortarName;
                sidoSelect.appendChild(option);
            });
        }

        if (defaultValue) {
            selectByValueOrText(sidoSelect, defaultValue);
        }
        // 시도 콤보박스 disabled 속성 강제 재적용
        updateFilterDisabled && updateFilterDisabled();
    } catch (err) {
        // 최초 페이지 로딩 중이면 에러 메시지 표시하지 않음
        if (document.readyState === 'complete' && document.activeElement !== document.body) {
            showError('시도 목록을 불러오는데 실패했습니다.');
        }
        console.error(err);
    }
}

// Load 시/군/구 (District)
async function loadDistrict(cortarNo, defaultValue) {
    try {
        showLoading(true);
        const data = await fetchAPI(`${API_BASE_URL}/regions/list?cortarNo=${cortarNo}`);

        districtSelect.innerHTML = '<option value="">시/군/구 선택</option>';
        dongSelect.innerHTML = '<option value="">동 선택</option>';
        dongSelect.disabled = true;
        searchBtn.disabled = !cortarNo;

        if (data.regionList && data.regionList.length > 0) {
            data.regionList.forEach(region => {
                const option = document.createElement('option');
                option.value = region.cortarNo;
                option.textContent = region.cortarName;
                districtSelect.appendChild(option);
            });
            districtSelect.disabled = false;
        }

        if (defaultValue) {
            selectByValueOrText(districtSelect, defaultValue);
            currentCortarNo = getSelectedValue(districtSelect);
            searchBtn.disabled = !currentCortarNo;
        }
    } catch (err) {
        showError('시/군/구 목록을 불러오는데 실패했습니다.');
        console.error(err);
    } finally {
        showLoading(false);
    }
}

// Load 동 (Neighborhood)
async function loadDong(cortarNo, defaultValue) {
    try {
        showLoading(true);
        const data = await fetchAPI(`${API_BASE_URL}/regions/list?cortarNo=${cortarNo}`);

        dongSelect.innerHTML = '<option value="">동 선택</option>';

        if (data.regionList && data.regionList.length > 0) {
            data.regionList.forEach(region => {
                const option = document.createElement('option');
                option.value = region.cortarNo;
                option.textContent = region.cortarName;
                dongSelect.appendChild(option);
            });
            dongSelect.disabled = false;
        }

        if (defaultValue) {
            selectByValueOrText(dongSelect, defaultValue);
            const dongVal = getSelectedValue(dongSelect);
            if (dongVal) {
                currentCortarNo = dongVal;
                searchBtn.disabled = false;
            }
        }
    } catch (err) {
        showError('동 목록을 불러오는데 실패했습니다.');
        console.error(err);
    } finally {
        showLoading(false);
    }
}

// Load apartment complexes
async function loadComplexes(cortarNo) {
    try {
        const data = await fetchAPI(`${API_BASE_URL}/regions/complexes?cortarNo=${cortarNo}&realEstateType=APT:PRE:ABYG:JGC&order=`);
        return data.complexList || [];
    } catch (err) {
        console.error('Failed to load complexes:', err);
        return [];
    }
}

// Get complex info including area list
async function getComplexInfo(complexNo) {
    try {
        const data = await fetchAPI(`${API_BASE_URL}/complexes/${complexNo}?complexNo=${complexNo}&initial=Y`);
        return data;
    } catch (err) {
        console.error('Failed to load complex info:', err);
        return null;
    }
}

// Get real transaction prices
async function getRealPrices(complexNo, areaNo) {
    try {
        const data = await fetchAPI(`${API_BASE_URL}/complexes/${complexNo}/prices/real?complexNo=${complexNo}&tradeType=A1&year=5&priceChartChange=false&areaNo=${areaNo}&type=table`);
        return data;
    } catch (err) {
        console.error('Failed to load real prices:', err);
        return null;
    }
}

// Calculate current price (highest in date range)
// Note: dealPrice from the API is in units of 만원 (10,000 won)
// For example: dealPrice: 160000 means 160000만원 = 16억원
function calculateCurrentPrice(realPriceData, dateFrom, dateTo) {
    if (!realPriceData || !realPriceData.realPriceOnMonthList) {
        return null;
    }

    let highestPrice = null;
    let highestPriceInfo = null;
    let allTimeHighest = 0; // 전체 기간 최고가 (최고가 판별용)

    // 1차: 전체 기간 최고가 계산
    realPriceData.realPriceOnMonthList.forEach(monthData => {
        if (monthData.realPriceList) {
            monthData.realPriceList.forEach(price => {
                if (price.dealPrice > allTimeHighest) {
                    allTimeHighest = price.dealPrice;
                }
            });
        }
    });

    // 2차: 날짜 범위 내 최고가 계산
    realPriceData.realPriceOnMonthList.forEach(monthData => {
        if (monthData.realPriceList) {
            monthData.realPriceList.forEach(price => {
                const tradeDate = new Date(price.formattedTradeYearMonth.replace(/\./g, '-'));

                if ((!dateFrom || tradeDate >= dateFrom) && (!dateTo || tradeDate <= dateTo)) {
                    const dealPrice = price.dealPrice;

                    if (!highestPrice || dealPrice > highestPrice) {
                        highestPrice = dealPrice;
                        highestPriceInfo = {
                            price: dealPrice,
                            floor: price.floor,
                            date: price.formattedTradeYearMonth,
                            isHighest: dealPrice >= allTimeHighest // 전체 기간 대비 최고가 여부
                        };
                    }
                }
            });
        }
    });

    return highestPriceInfo;
}

// 결과 고유 키 생성
function resultKey(r) {
    return `${r.complexName}|${r.pyeongName}`;
}

// 이전 순위 기록 (순위 변동 감지용)
const prevRanks = new Map();

// 결과 테이블 렌더링 (FLIP 애니메이션)
function renderResults(results) {
    // 가격 있는 항목은 평단가 기준 정렬, 미조회 항목은 뒤쪽
    results.sort((a, b) => {
        if (a.price === null && b.price === null) return 0;
        if (a.price === null) return 1;
        if (b.price === null) return -1;
        // 평단가 계산
        const getPerPyeong = r => {
            const pyeong = parseFloat(r.pyeongName);
            if (!r.price || !pyeong || isNaN(pyeong)) return 0;
            return r.price / pyeong;
        };
        return getPerPyeong(b) - getPerPyeong(a);
    });

    // 단지별 최고평단가만 필터링
    let displayResults = results;
    if (topOnlyCheckbox.checked) {
        const bestPerPyeong = new Map();
        results.forEach(r => {
            if (r.price && r.pyeongName) {
                const pyeong = parseFloat(r.pyeongName);
                if (pyeong && !isNaN(pyeong)) {
                    const per = r.price / pyeong;
                    if (!bestPerPyeong.has(r.complexName) || per > bestPerPyeong.get(r.complexName).per) {
                        bestPerPyeong.set(r.complexName, { per, row: r });
                    }
                }
            }
        });
        displayResults = Array.from(bestPerPyeong.values()).map(v => v.row);
    }

    if (displayResults.length === 0) {
        resultsTable.innerHTML = '<tr><td colspan="6" class="no-data">조회된 거래 내역이 없습니다.</td></tr>';
        return;
    }

    // FLIP: 기존 행 위치 기록 (First)
    const existingRows = resultsTable.querySelectorAll('tr[data-key]');
    const firstPositions = new Map();
    existingRows.forEach(row => {
        firstPositions.set(row.dataset.key, row.getBoundingClientRect());
    });

    // 순위 계산 (가격 있는 것만)
    let rank = 0;
    const currentRanks = new Map(); // 이번 렌더의 순위

    // 새 행 생성
    const fragment = document.createDocumentFragment();
    displayResults.forEach((result, index) => {
        const key = resultKey(result);
        const row = document.createElement('tr');
        row.dataset.key = key;
        if (result._complexNo) row.dataset.complexNo = result._complexNo;
        if (result._areaNo) row.dataset.areaNo = result._areaNo;
        row.dataset.complexName = result.complexName || '';
        row.dataset.pyeongName = result.pyeongName || '';

        const hasPrice = result.price !== null;
        if (hasPrice) rank++;

        // 순위 기록
        if (hasPrice) currentRanks.set(key, rank);

        row.classList.remove('rank-1', 'rank-2', 'rank-3');
        if (hasPrice && rank === 1) row.classList.add('rank-1');
        if (hasPrice && rank === 2) row.classList.add('rank-2');
        if (hasPrice && rank === 3) row.classList.add('rank-3');

        if (!hasPrice) row.classList.add('row-pending');

        // 배지 판별
        let nameBadge = ''; // 시세 옆: 최고가
        let dateBadge = '';  // 날짜 옆: NEW
        if (hasPrice && result.date) {
            // NEW: 어제 00:00 이후 거래
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            const tradeDate = new Date(result.date.replace(/\./g, '-'));
            if (tradeDate >= yesterday) {
                dateBadge = ' <span class="badge-today">NEW</span>';
            }
            // 최고가: 같은 단지+평형 전체 기간 최고가
            if (result.isHighest) {
                nameBadge = ' <span class="badge-new">최고가</span>';
            }
        }

        // 평단가 계산 (price per pyeong)
        let pricePerPyeong = '';
        if (hasPrice && result.price && result.pyeongName) {
            const pyeong = parseFloat(result.pyeongName);
            if (pyeong && !isNaN(pyeong)) {
                const pricePer = result.price / pyeong;
                if (pricePer < 10000) {
                    // 1억(10000만) 이하: 만원 단위, 콤마 추가
                    pricePerPyeong = `${Math.round(pricePer).toLocaleString()}만/평`;
                } else {
                    // 1억 초과: 억 단위
                    const pricePerEok = pricePer / 10000;
                    pricePerPyeong = `${pricePerEok.toFixed(2)}억/평`;
                }
            }
        }
        row.innerHTML = `
            <td class="rank-cell">${hasPrice ? rank : '-'}</td>
            <td>${result.complexName}</td>
            <td>${result.pyeongName}평</td>
            <td>${hasPrice ? result.floor + '층' : '-'}</td>
            <td class="price-flex">${result.noPrice ? '<span class="no-price">최근시세 없음</span>' : (hasPrice ? `<span class="badge-area">${nameBadge}</span><span class="price-value${result.isHighest ? ' price-highest' : ''}">${formatPrice(result.price)}</span>` : '<span class="price-loading">조회 중...</span>')}</td>
            <td class="price-per-pyeong-cell">${hasPrice && pricePerPyeong ? pricePerPyeong : '-'}</td>
            <td>${hasPrice ? result.date + dateBadge : '-'}</td>
        `;
        fragment.appendChild(row);
    });

    // DOM 교체
    resultsTable.innerHTML = '';
    resultsTable.appendChild(fragment);

    // 모든 애니메이션 제거: 순위 즉각 반영

    // 순위 기록 갱신
    prevRanks.clear();
    currentRanks.forEach((r, k) => prevRanks.set(k, r));
}

// ========== 세부정보 모달 ==========


const detailPanelOverlay = document.getElementById('detailPanelOverlay');
const detailPanel = document.getElementById('detailPanel');
const detailTitle = document.getElementById('detailTitle');
const detailInfo = document.getElementById('detailInfo');
const detailTradeList = document.getElementById('detailTradeList');
const detailCloseBtn = document.getElementById('detailCloseBtn');

// 패널 닫기 (오버레이, 버튼, ESC)
function hideDetailPanel() {
    detailPanelOverlay.classList.remove('active');
    detailPanelOverlay.style.display = 'none';
}
function showDetailPanel() {
    detailPanelOverlay.classList.add('active');
    detailPanelOverlay.style.display = 'flex';
}
detailCloseBtn.addEventListener('click', hideDetailPanel);
detailPanelOverlay.addEventListener('click', (e) => {
    if (e.target === detailPanelOverlay) hideDetailPanel();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && detailPanelOverlay.classList.contains('active')) hideDetailPanel();
});

// 행 클릭 이벤트 (이벤트 위임)
document.getElementById('resultsTable').querySelector('tbody').addEventListener('click', async (e) => {
    const row = e.target.closest('tr[data-complex-no]');
    if (!row) return;

    const complexNo = row.dataset.complexNo;
    const areaNo = row.dataset.areaNo;
    const complexName = row.dataset.complexName;
    const pyeongName = row.dataset.pyeongName;


    detailTitle.textContent = `${complexName} ${pyeongName}평`;
    detailInfo.innerHTML = '<div class="detail-loading">정보를 불러오는 중...</div>';
    detailTradeList.innerHTML = '<tr><td colspan="4" class="detail-loading">거래 내역을 불러오는 중...</td></tr>';
    showDetailPanel();

    // 단지 정보 + 거래 내역 동시 조회
    const [complexInfo, priceData] = await Promise.all([
        getComplexInfo(complexNo),
        getRealPrices(complexNo, areaNo)
    ]);

    // 단지 기본 정보 표시
    if (complexInfo) {
        const info = complexInfo;
        const area = info.areaList?.find(a => String(a.pyeongNo) === String(areaNo));
        const items = [];
        if (info.address) items.push({ label: '주소', value: info.address });
        if (info.totalHouseholdCount) items.push({ label: '세대수', value: info.totalHouseholdCount.toLocaleString() + '세대' });
        if (info.totalBuildingCount) items.push({ label: '동수', value: info.totalBuildingCount + '개동' });
        if (info.approvalDate) items.push({ label: '준공일', value: info.approvalDate });
        if (area?.supplySpace) items.push({ label: '공급면적', value: area.supplySpace + '㎡' });
        if (area?.exclusiveSpace) items.push({ label: '전용면적', value: area.exclusiveSpace + '㎡' });
        if (info.parkingCountByHousehold) items.push({ label: '주차', value: info.parkingCountByHousehold + '대/세대' });
        if (info.floorAreaRatio) items.push({ label: '용적률', value: info.floorAreaRatio + '%' });

        detailInfo.innerHTML = items.map(i =>
            `<div class="detail-info-item"><span class="label">${i.label}</span><span class="value">${i.value}</span></div>`
        ).join('');
    } else {
        detailInfo.innerHTML = '<div style="color:#999;">단지 정보를 불러올 수 없습니다.</div>';
    }

    // 거래 내역 표시
    if (priceData && priceData.realPriceOnMonthList) {
        const trades = [];
        let allTimeMax = 0;

        // 전체 거래 수집
        priceData.realPriceOnMonthList.forEach(monthData => {
            if (monthData.realPriceList) {
                monthData.realPriceList.forEach(p => {
                    trades.push({
                        date: p.formattedTradeYearMonth,
                        floor: p.floor,
                        price: p.dealPrice,
                        type: p.tradeTypeName || ''
                    });
                    if (p.dealPrice > allTimeMax) allTimeMax = p.dealPrice;
                });
            }
        });

        // 최신순 정렬
        trades.sort((a, b) => {
            const da = new Date(a.date.replace(/\./g, '-'));
            const db = new Date(b.date.replace(/\./g, '-'));
            return db - da;
        });

        if (trades.length === 0) {
            detailTradeList.innerHTML = '<tr><td colspan="4" class="detail-loading">거래 내역이 없습니다.</td></tr>';
        } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);

            // 최고가 동일 금액이 여러 개면 최신 날짜에만 표시
            let highestShown = false;

            detailTradeList.innerHTML = trades.map(t => {
                const isMax = t.price >= allTimeMax && !highestShown;
                if (isMax) highestShown = true;
                const tradeDate = new Date(t.date.replace(/\./g, '-'));
                const isNew = tradeDate >= yesterday;
                let badges = '';
                if (isMax) badges += '<span class="badge-new">최고가</span> ';
                if (isNew) badges += '<span class="badge-today">NEW</span>';
                return `<tr class="${isMax ? 'trade-highest' : ''}">
                    <td>${t.date}</td>
                    <td>${t.floor}층</td>
                    <td class="trade-price">${formatPrice(t.price)}</td>
                    <td>${badges || t.type}</td>
                </tr>`;
            }).join('');
        }
    } else {
        detailTradeList.innerHTML = '<tr><td colspan="4" class="detail-loading">거래 내역을 불러올 수 없습니다.</td></tr>';
    }
});

// 검색 상태 표시
const searchStatus = document.getElementById('searchStatus');
function showSearchStatus(text) {
    searchStatus.textContent = text;
    searchStatus.style.display = text ? 'block' : 'none';
}

// 검색 중지 제어
// let searchAborted = false;
// const stopBtn = document.getElementById('stopBtn');
// stopBtn.addEventListener('click', () => { searchAborted = true; });

// Search and display results
// resume: true면 중단된 지점부터 이어서 조회(여기선 단순히 재시작)
async function searchRealEstate(resume = false) {
    const searchCortarNo = dongSelect.value || districtSelect.value;
    if (!searchCortarNo) {
        showError('시/군/구를 선택해주세요.');
        return;
    }

    // 일시정지/계속조회 기능: 진행상태 저장
    try {
        if (!window._searchResumeState) window._searchResumeState = {};
        let resumeState = window._searchResumeState;
        if (!resume) {
            searchAborted = false;
            resumeState.pendingItems = null;
            resumeState.results = null;
            resumeState.itemIndex = 0;
        } else {
            searchAborted = false;
        }
        searchBtn.disabled = true;

        // 결과 즉시 초기화 (resume이면 기존 유지)
        if (!resume) {
            resultsTable.innerHTML = '';
            prevRanks.clear();
        }

        showSearchStatus('단지 목록 조회 중...');

        // ===== Phase 1: 단지 + 평형 목록만 빠르게 수집 =====
        let allComplexes = [];
        if (!resume || !resumeState.pendingItems) {
            if (dongSelect.value) {
                allComplexes = await loadComplexes(dongSelect.value);
            } else {
                const dongData = await fetchAPI(`${API_BASE_URL}/regions/list?cortarNo=${districtSelect.value}`);
                if (dongData.regionList && dongData.regionList.length > 0) {
                    for (const dong of dongData.regionList) {
                        if (searchAborted) break;
                        showSearchStatus(`단지 목록 조회 중... (${dong.cortarName})`);
                        const complexes = await loadComplexes(dong.cortarNo);
                        allComplexes = allComplexes.concat(complexes);
                    }
                }
            }
            if (allComplexes.length === 0) {
                resultsTable.innerHTML = '<tr><td colspan="6" class="no-data">해당 지역에 아파트 단지가 없습니다.</td></tr>';
                showSearchStatus('');
                return;
            }
            const pyeongMin = pyeongMinInput.value ? parseInt(pyeongMinInput.value) : null;
            const pyeongMax = pyeongMaxInput.value ? parseInt(pyeongMaxInput.value) : null;
            // 단지+평형 목록만
            const pendingItems = [];
            for (const complex of allComplexes) {
                if (searchAborted) break;
                pendingItems.push({
                    complexNo: complex.complexNo,
                    complexName: complex.complexName
                });
            }
            resumeState.pendingItems = pendingItems;
            resumeState.results = [];
            resumeState.itemIndex = 0;
        }
        const pendingItems = resumeState.pendingItems;
        let results = resumeState.results;
        let itemCount = resumeState.itemIndex;
        const pyeongMin = pyeongMinInput.value ? parseInt(pyeongMinInput.value) : null;
        const pyeongMax = pyeongMaxInput.value ? parseInt(pyeongMaxInput.value) : null;
        for (; itemCount < pendingItems.length; itemCount++) {
            if (searchAborted) break;
            const item = pendingItems[itemCount];
            showSearchStatus(`정보/시세 조회 중... ${itemCount + 1}/${pendingItems.length} (${item.complexName})`);
            // 단지 정보
            const complexInfo = await getComplexInfo(item.complexNo);
            if (!complexInfo || !complexInfo.areaList) {
                results.push({
                    complexName: item.complexName,
                    pyeongName: '-',
                    floor: null,
                    price: null,
                    date: null,
                    _complexNo: item.complexNo,
                    _areaNo: null,
                    noPrice: true
                });
                renderResults(results);
                continue;
            }
            for (const area of complexInfo.areaList) {
                const pyeong = parseInt(area.pyeongName2) || parseInt(area.exclusivePyeong) || 0;
                if (pyeongMin !== null && pyeong < pyeongMin) continue;
                if (pyeongMax !== null && pyeong > pyeongMax) continue;
                // 가격 조회
                const priceData = await getRealPrices(item.complexNo, area.pyeongNo);
                let priceInfo = null;
                if (priceData) {
                    priceInfo = calculateCurrentPrice(priceData, dateFromInput.value ? new Date(dateFromInput.value) : null, dateToInput.value ? new Date(dateToInput.value) : null);
                }
                results.push({
                    complexName: item.complexName,
                    pyeongName: area.pyeongName2 || area.pyeongName,
                    floor: priceInfo ? priceInfo.floor : null,
                    price: priceInfo ? priceInfo.price : null,
                    date: priceInfo ? priceInfo.date : null,
                    isHighest: priceInfo ? priceInfo.isHighest : false,
                    _complexNo: item.complexNo,
                    _areaNo: area.pyeongNo,
                    noPrice: !priceInfo
                });
                renderResults(results);
            }
            // 진행상태 저장
            resumeState.itemIndex = itemCount + 1;
            resumeState.results = results;
        }
        // 최종 렌더링
        if (results.length === 0) {
            resultsTable.innerHTML = '<tr><td colspan="6" class="no-data">해당 조건에 맞는 아파트가 없습니다.</td></tr>';
        } else {
            renderResults(results);
        }

        if (searchAborted) {
            showSearchStatus('조회가 중지되었습니다.');
            setTimeout(() => showSearchStatus(''), 2000);
            searchState = 'paused';
            updateSearchBtn();
        } else {
            showSearchStatus('');
            searchState = 'idle';
            updateSearchBtn();
            // 완료 시 진행상태 초기화
            resumeState.pendingItems = null;
            resumeState.results = null;
            resumeState.itemIndex = 0;
        }
    } catch (err) {
        showError('데이터를 불러오는데 실패했습니다.');
        showSearchStatus('');
        searchState = 'idle';
        updateSearchBtn();
        console.error(err);
    }
}

// Event Listeners
// Event Listeners
sidoSelect.addEventListener('change', (e) => {
    const cortarNo = e.target.value;
    if (cortarNo) {
        loadDistrict(cortarNo);
    } else {
        districtSelect.innerHTML = '<option value="">시/군/구 선택</option>';
        districtSelect.disabled = true;
        dongSelect.innerHTML = '<option value="">동 선택</option>';
        dongSelect.disabled = true;
        searchBtn.disabled = true;
    }
});

districtSelect.addEventListener('change', (e) => {
    const cortarNo = e.target.value;
    if (cortarNo) {
        loadDong(cortarNo);
        currentCortarNo = cortarNo;
        searchBtn.disabled = false;
    } else {
        dongSelect.innerHTML = '<option value="">동 선택</option>';
        dongSelect.disabled = true;
        searchBtn.disabled = true;
    }
});

dongSelect.addEventListener('change', (e) => {
    if (e.target.value) {
        currentCortarNo = e.target.value;
    } else {
        currentCortarNo = districtSelect.value;
    }
});

searchBtn.addEventListener('click', searchRealEstate);

// Default values (서버 config.txt에서 로드)
let DEFAULTS = {
    sido: '',
    district: '',
    dong: '',
    pyeongMin: '',
    pyeongMax: '',
    dateFrom: '',
    dateTo: '',
    topOnly: false
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // 서버에서 기본값 로드
    try {
        const res = await fetch('/api/token-info');
        const data = await res.json();
        if (data.defaults) {
            DEFAULTS = { ...DEFAULTS, ...data.defaults };
        }
    } catch (e) { /* ignore */ }

    // Set pyeong defaults
    if (DEFAULTS.pyeongMin) pyeongMinInput.value = DEFAULTS.pyeongMin;
    if (DEFAULTS.pyeongMax) pyeongMaxInput.value = DEFAULTS.pyeongMax;
    if (DEFAULTS.dateFrom) dateFromInput.value = DEFAULTS.dateFrom;
    if (DEFAULTS.dateTo) dateToInput.value = DEFAULTS.dateTo;
    topOnlyCheckbox.checked = DEFAULTS.topOnly === true || DEFAULTS.topOnly === 'true';

    // Load and set region defaults
    await loadSido(DEFAULTS.sido);
    const sidoVal = getSelectedValue(sidoSelect);
    if (sidoVal) await loadDistrict(sidoVal, DEFAULTS.district);
    const distVal = getSelectedValue(districtSelect);
    if (distVal) await loadDong(distVal, DEFAULTS.dong);

    // Initialize search button state
    updateSearchBtn();

    // Add filter change event listeners
    function onFilterChanged() {
        searchState = 'idle';
        updateSearchBtn();
    }
    pyeongMinInput.addEventListener('input', onFilterChanged);
    pyeongMaxInput.addEventListener('input', onFilterChanged);
    dateFromInput.addEventListener('input', onFilterChanged);
    dateToInput.addEventListener('input', onFilterChanged);
    topOnlyCheckbox.addEventListener('change', onFilterChanged);

    // 최초 자동 검색은 모든 지역 정보가 준비된 후에만 시도
    if (getSelectedValue(sidoSelect) && getSelectedValue(districtSelect) && getSelectedValue(dongSelect)) {
        searchBtn.disabled = false;
        searchBtn.click();
    }
});
