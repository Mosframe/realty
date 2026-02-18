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
    const sido2 = sidoSelect2.options[sidoSelect2.selectedIndex]?.text || '';
    const district2 = districtSelect2.options[districtSelect2.selectedIndex]?.text || '';
    const dong2 = dongSelect2.options[dongSelect2.selectedIndex]?.text || '';
    const pyeongMin = pyeongMinInput.value;
    const pyeongMax = pyeongMaxInput.value;
    const dateFrom = dateFromInput.value;
    const dateTo = dateToInput.value;
    const topOnly = topOnlyCheckbox.checked ? '단지별 최고 평단가만' : '';
    const conds = [
        `조회일자: ${dateStr}`,
        `지역1: ${sido} ${district} ${dong}`.trim(),
        `지역2: ${sido2} ${district2} ${dong2}`.trim(),
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
    const sido2 = sidoSelect2.options[sidoSelect2.selectedIndex]?.text || '';
    const district2 = districtSelect2.options[districtSelect2.selectedIndex]?.text || '';
    const dong2 = dongSelect2.options[dongSelect2.selectedIndex]?.text || '';
    const pyeongMin = pyeongMinInput.value;
    const pyeongMax = pyeongMaxInput.value;
    const dateFrom = dateFromInput.value;
    const dateTo = dateToInput.value;
    const topOnly = topOnlyCheckbox.checked ? '단지별 최고 평단가만' : '';
    // 조건 행들 추가 (아래에서 위로 삽입)
    let insertAt = 0;
    const conds = [
        `조회일자: ${dateStr}`,
        `지역1: ${sido} ${district} ${dong}`.trim(),
        `지역2: ${sido2} ${district2} ${dong2}`.trim(),
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
        { wch: 10 },  // 지역
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
const region1 = document.getElementById('region1');
const region2 = document.getElementById('region2');

const sidoSelect = document.getElementById('sido');
const districtSelect = document.getElementById('district');
const dongSelect = document.getElementById('dong');
const sidoSelect2 = document.getElementById('sido2');
const districtSelect2 = document.getElementById('district2');
const dongSelect2 = document.getElementById('dong2');
const searchBtn = document.getElementById('searchBtn');

var searchState = 'idle'; // 'idle', 'searching', 'paused'

// 조회중일 때 옵션 비활성화, 그 외엔 활성화
function updateFilterDisabled() {
    const disabled = searchState === 'searching';
    // 시도, 시군구, 동, 평형, 날짜, 체크박스 모두 비활성화 (조회중)
    sidoSelect.disabled = disabled;
    districtSelect.disabled = disabled;
    dongSelect.disabled = disabled;
    sidoSelect2.disabled = disabled;
    districtSelect2.disabled = disabled;
    dongSelect2.disabled = disabled;
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
        if (searchState === 'idle' && document.querySelector('tr[data-key]')) {
            excelBtn.style.display = '';
        } else {
            excelBtn.style.display = 'none';
        }
    }
    if (copyBtn) {
        if (searchState === 'idle' && document.querySelector('tr[data-key]')) {
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
        sidoSelect2.disabled = true;
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
        sidoSelect2.disabled = true;
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
const naverLandBtn = document.getElementById('naverLandBtn');
if (naverLandBtn) {
    naverLandBtn.addEventListener('click', () => {
        // 마지막으로 열린 상세정보의 complexNo, areaNo를 추적
        if (window._lastDetailComplexNo) {

            const url = `https://new.land.naver.com/complexes/${window._lastDetailComplexNo}?a=JGC:JGB:ABYG:APT:PRE&e=RETAIL&ad=true`;

            // 새 팝업윈도우에서 열기(창오픈위치:현재윈도우 중심)
            const width = window.innerWidth * 0.9;
            const height = window.innerHeight * 0.9;
            const left = window.screenX + (window.innerWidth - width) / 2;
            const top = window.screenY + (window.innerHeight - height) / 2;
            window.open(url, '_blank', `width=${width},height=${height},left=${left},top=${top}`);
        } else {
            alert('단지 정보를 찾을 수 없습니다.');
        }
    });
}

// Set default date range (1 month ago ~ today)
(function setDefaultDateRange() {

    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 3);

    // dateTo : today를 yyyy-MM-dd 형식으로 변환 (로컬시간으로)
    const dateTo = today.toISOString().slice(0, 10);
    const dateFrom = oneMonthAgo.toISOString().slice(0, 10);

    dateToInput.value = dateTo;
    dateFromInput.value = dateFrom;
})();

// Helper function to make API calls with timeout and retry
async function fetchAPI(url, retries = 3) {

    // (호출부에서 100ms 대기)

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

async function loadSido(sidoSelect, defaultValue) {

    try {
        await new Promise(r => setTimeout(r, 100));
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
async function loadDistrict(districtSelect, dongSelect, cortarNo, defaultValue) {
    try {
        showLoading(true);
        await new Promise(r => setTimeout(r, 100));
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
async function loadDong(dongSelect, cortarNo, defaultValue) {
    try {
        showLoading(true);
        await new Promise(r => setTimeout(r, 100));
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
        await new Promise(r => setTimeout(r, 100));
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
        await new Promise(r => setTimeout(r, 100));
        const data = await fetchAPI(`${API_BASE_URL}/complexes/${complexNo}?complexNo=${complexNo}&initial=Y`);
        return data;
    } catch (err) {
        console.error('Failed to load complex info:', err);
        return null;
    }
}

// Get real transaction prices
async function getRealPrices(complexNo, areaNo, all) {
    try {
        await new Promise(r => setTimeout(r, 100));
        const data = await fetchAPI(`${API_BASE_URL}/complexes/${complexNo}/prices/real?complexNo=${complexNo}&tradeType=A1&year=5&priceChartChange=false&areaNo=${areaNo}&type=table`);
        if (all) {

            let addedRowCount = data.addedRowCount;
            let totalRowCount = data.totalRowCount;
            while (addedRowCount < totalRowCount) {

                const data2 = await fetchAPI(`${API_BASE_URL}/complexes/${complexNo}/prices/real?complexNo=${complexNo}&tradeType=A1&year=5&priceChartChange=false&areaNo=${areaNo}&type=table&addedRowCount=${addedRowCount}`);
                data.realPriceOnMonthList = data.realPriceOnMonthList.concat(data2.realPriceOnMonthList);
                addedRowCount = data2.addedRowCount;
                totalRowCount = data2.totalRowCount;
            }
        }

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
    return `${r.region}|${r.complexName}|${r.pyeongName}`;
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
            const pyeong = parseFloat(r.pyeongName);
            // 거래가 있는 경우 평단가 기준, 없는 경우 noPrice 기준으로도 포함
            if (r.price && pyeong && !isNaN(pyeong)) {
                const per = r.price / pyeong;
                if (!bestPerPyeong.has(r.complexName) || per > bestPerPyeong.get(r.complexName).per) {
                    bestPerPyeong.set(r.complexName, { per, row: r });
                }
            } else if (r.noPrice) {
                // 거래가 없는 단지/평형도 반드시 포함
                if (!bestPerPyeong.has(r.complexName)) {
                    bestPerPyeong.set(r.complexName, { per: -1, row: r });
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
        row.dataset.region = result.region || '';
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
            let badgeBaseDate = new Date();
            if (newBadgeDateInput && newBadgeDateInput.value) {
                badgeBaseDate = new Date(newBadgeDateInput.value);
            }
            const tradeDate = new Date(result.date.replace(/\./g, '-'));
            if (tradeDate >= badgeBaseDate) {
                dateBadge = ' <span class="badge-today">NEW</span>';
            }
            // 최고가: 같은 단지+평형 전체 기간 최고가
            //if (result.isHighest) {
            //    nameBadge = ' <span class="badge-new">최고가</span>';
            //}
        }
        // 만약 거래내역이 여러 개라면, 어제 0시 이후 거래가 있는지 추가로 판별
        if (!dateBadge && result._complexNo && result._areaNo && result.price === null && !result.noPrice) {
            // 거래내역이 있으나 범위 내 거래가 없는 경우
            // getRealPrices에서 받은 데이터 활용 필요(추가 구현 가능)
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
        const regionClass = result.region === '지역1' ? `region1-label` : `region2-label`;
        row.innerHTML = `
            <td class="rank-cell">${hasPrice ? rank : '-'}</td>
            <td class="${regionClass}">${result.region}</td>
            <td>${result.complexName}</td>
            <td>${result.pyeongName}평</td>
            <td>${hasPrice ? result.floor + '층' : (result.noPrice ? '거래없음' : '-')}</td>
            <td class="price-flex">${result.noPrice ? '<span class="no-price">거래없음</span>' : (hasPrice ? `<span class="badge-area">${nameBadge}</span><span class="price-value${result.isHighest ? ' price-highest' : ''}">${formatPrice(result.price)}</span>` : '<span class="price-loading">조회 중...</span>')}</td>
            <td class="price-per-pyeong-cell">${hasPrice && pricePerPyeong ? pricePerPyeong : (result.noPrice ? '거래없음' : '-')}</td>
            <td>${hasPrice ? result.date + dateBadge : (result.noPrice ? '거래없음' : '-')}</td>
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
const detailTitle = document.getElementById('detailTitle');
const detailInfo = document.getElementById('detailInfo');
const detailTradeList = document.getElementById('detailTradeList');
const detailCloseBtn = document.getElementById('detailCloseBtn');

// 모달 닫기
detailCloseBtn.addEventListener('click', () => { detailPanelOverlay.style.display = 'none'; });
detailPanelOverlay.addEventListener('click', (e) => {
    if (e.target === detailPanelOverlay) detailPanelOverlay.style.display = 'none';
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && detailPanelOverlay.style.display !== 'none') detailPanelOverlay.style.display = 'none';
});

// 행 클릭 이벤트 (이벤트 위임)
document.getElementById('resultsTable').querySelector('tbody').addEventListener('click', async (e) => {
    const row = e.target.closest('tr[data-complex-no]');
    if (!row) return;

    const complexNo = row.dataset.complexNo;
    const areaNo = row.dataset.areaNo;
    const complexName = row.dataset.complexName;
    const pyeongName = row.dataset.pyeongName;

    window._lastDetailComplexNo = complexNo;

    detailTitle.textContent = `${complexName} ${pyeongName}평`;
    detailInfo.innerHTML = '<div class="detail-loading">정보를 불러오는 중...</div>';
    detailTradeList.innerHTML = '<tr><td colspan="4" class="detail-loading">거래 내역을 불러오는 중...</td></tr>';
    detailPanelOverlay.style.display = 'flex';

    // 단지 정보 + 거래 내역 동시 조회
    const [complexInfo, priceData] = await Promise.all([
        getComplexInfo(complexNo),
        getRealPrices(complexNo, areaNo, true)
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
        if (!resume || !resumeState.pendingItems) {

            const pendingItems = [];

            let allComplexes = [];
            const len = sidoSelect2.value && districtSelect2.value ? 2 : 1;
            for (let r = 0; r < len; ++r) {

                const doingValue = r === 0 ? dongSelect.value : dongSelect2.value;
                if (doingValue) {

                    allComplexes = await loadComplexes(doingValue);

                } else {

                    const districtSelectValue = r === 0 ? districtSelect.value : districtSelect2.value;
                    const dongData = await fetchAPI(`${API_BASE_URL}/regions/list?cortarNo=${districtSelectValue}`);
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
                // 단지+평형 목록만
                for (const complex of allComplexes) {
                    if (searchAborted) break;
                    pendingItems.push({
                        region: r === 0 ? "지역1" : "지역2",
                        complexNo: complex.complexNo,
                        complexName: complex.complexName
                    });
                }
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
                    region: item.region,
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
                let hasDeal = false;
                if (priceData) {
                    priceInfo = calculateCurrentPrice(priceData, dateFromInput.value ? new Date(dateFromInput.value) : null, dateToInput.value ? new Date(dateToInput.value) : null);
                    // 거래내역이 전체 기간 중 하나라도 있으면 hasDeal true (날짜 범위와 무관)
                    if (priceData.realPriceOnMonthList && priceData.realPriceOnMonthList.some(m => m.realPriceList && m.realPriceList.length > 0)) {
                        hasDeal = true;
                    }
                }
                // 거래내역이 없어도 반드시 추가 (hasDeal이 false면 noPrice true)
                results.push({
                    region: item.region,
                    complexName: item.complexName,
                    pyeongName: area.pyeongName2 || area.pyeongName,
                    floor: priceInfo ? priceInfo.floor : null,
                    price: priceInfo ? priceInfo.price : null,
                    date: priceInfo ? priceInfo.date : null,
                    isHighest: priceInfo ? priceInfo.isHighest : false,
                    _complexNo: item.complexNo,
                    _areaNo: area.pyeongNo,
                    noPrice: hasDeal ? !priceInfo : true
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
sidoSelect.addEventListener('change', (e) => {
    const cortarNo = e.target.value;
    if (cortarNo) {
        loadDistrict(districtSelect, dongSelect, cortarNo);
    } else {
        districtSelect.innerHTML = '<option value="">시/군/구 선택</option>';
        districtSelect.disabled = true;
        dongSelect.innerHTML = '<option value="">동 선택</option>';
        dongSelect.disabled = true;
        searchBtn.disabled = true;
    }
});
sidoSelect2.addEventListener('change', (e) => {
    const cortarNo = e.target.value;
    if (cortarNo) {
        loadDistrict(districtSelect2, dongSelect2, cortarNo);
    } else {
        districtSelect2.innerHTML = '<option value="">시/군/구 선택</option>';
        districtSelect2.disabled = true;
        dongSelect2.innerHTML = '<option value="">동 선택</option>';
        dongSelect2.disabled = true;
        searchBtn.disabled = true;
    }
});

districtSelect.addEventListener('change', (e) => {
    const cortarNo = e.target.value;
    if (cortarNo) {
        loadDong(dongSelect, cortarNo);
        currentCortarNo = cortarNo;
        searchBtn.disabled = false;
    } else {
        dongSelect.innerHTML = '<option value="">동 선택</option>';
        dongSelect.disabled = true;
        searchBtn.disabled = true;
    }
});

districtSelect2.addEventListener('change', (e) => {
    const cortarNo = e.target.value;
    if (cortarNo) {
        loadDong(dongSelect2, cortarNo);
        currentCortarNo = cortarNo;
        searchBtn.disabled = false;
    } else {
        dongSelect2.innerHTML = '<option value="">동 선택</option>';
        dongSelect2.disabled = true;
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
dongSelect2.addEventListener('change', (e) => {
    if (e.target.value) {
        currentCortarNo = e.target.value;
    } else {
        currentCortarNo = districtSelect2.value;
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

    // NEW 뱃지 기준일 기본값: dateTo의 1일 전
    const newBadgeDateInput = document.getElementById('newBadgeDateInput');
    if (dateToInput && newBadgeDateInput) {
        let baseDate = null;
        if (dateToInput.value) {
            baseDate = new Date(dateToInput.value);
        } else {
            baseDate = new Date();
        }

        // 30일 전으로 설정
        baseDate.setDate(baseDate.getDate() - 30);
        baseDate.setHours(0, 0, 0, 0);
        // yyyy-MM-dd 포맷
        const yyyy = baseDate.getFullYear();
        const mm = String(baseDate.getMonth() + 1).padStart(2, '0');
        const dd = String(baseDate.getDate()).padStart(2, '0');
        newBadgeDateInput.value = `${yyyy}-${mm}-${dd}`;
    }

    // 1초 지연
    await new Promise(r => setTimeout(r, 100));

    console.log("시작.....");

    // 서버에서 기본값 로드
    try {
        const res = await fetch('/api/config');
        const data = await res.json();
        if (data.defaults) {
            DEFAULTS = { ...DEFAULTS, ...data.defaults };
        }

        const appVersion = document.getElementById('appVersion');
        if (appVersion) appVersion.textContent = data.version;

    } catch (e) { /* ignore */ }

    console.log({ DEFAULTS });

    // Set pyeong defaults
    if (DEFAULTS.pyeongMin) pyeongMinInput.value = DEFAULTS.pyeongMin;
    if (DEFAULTS.pyeongMax) pyeongMaxInput.value = DEFAULTS.pyeongMax;
    if (DEFAULTS.dateFrom) dateFromInput.value = DEFAULTS.dateFrom;
    if (DEFAULTS.dateTo) dateToInput.value = DEFAULTS.dateTo;
    topOnlyCheckbox.checked = DEFAULTS.topOnly === true || DEFAULTS.topOnly === 'true';

    // Load and set region defaults
    await loadSido(sidoSelect, DEFAULTS.sido);
    const sidoVal = getSelectedValue(sidoSelect);
    if (sidoVal) await loadDistrict(districtSelect, dongSelect, sidoVal, DEFAULTS.district);
    const distVal = getSelectedValue(districtSelect);
    if (distVal) await loadDong(dongSelect, distVal, DEFAULTS.dong);

    await loadSido(sidoSelect2);

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

// ===== 세부정보 패널 드래그 이동 =====
(function enableDetailPanelDrag() {
    const overlay = document.getElementById('detailPanelOverlay');
    const panel = document.getElementById('detailPanel');
    const header = document.querySelector('.detail-panel-header');
    if (!overlay || !panel || !header) return;
    let isDragging = false;
    let startX = 0, startY = 0;
    let panelX = 0, panelY = 0;

    header.style.cursor = 'move';
    header.addEventListener('mousedown', function (e) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        // 현재 패널 위치 계산 (transform이 있을 수 있으니 getBoundingClientRect 기준)
        const rect = panel.getBoundingClientRect();
        panelX = rect.left;
        panelY = rect.top;
        // 드래그 시 크기 고정
        panel.style.width = rect.width + 'px';
        panel.style.height = rect.height + 'px';
        document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        // 패널을 fixed로 이동
        panel.style.position = 'fixed';
        panel.style.left = (panelX + dx) + 'px';
        panel.style.top = (panelY + dy) + 'px';
        panel.style.margin = '0';
        panel.style.transform = 'none';
    });
    document.addEventListener('mouseup', function () {
        if (isDragging) {
            isDragging = false;
            document.body.style.userSelect = '';
        }
    });
    // 오버레이 클릭/닫기 시 위치 초기화
    function resetPanelPosition() {
        panel.style.position = '';
        panel.style.left = '';
        panel.style.top = '';
        panel.style.margin = '';
        panel.style.transform = '';
        panel.style.width = '';
        panel.style.height = '';
    }
    document.getElementById('detailCloseBtn').addEventListener('click', resetPanelPosition);
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) resetPanelPosition();
    });
})();
