// API Configuration
// Use Naver Land API directly from browser (user's own IP, no cloud IP blocking)
const API_BASE_URL = 'https://new.land.naver.com/api';
const USE_PROXY = false; // Set to true to use local proxy server (/api)

// State
let currentCortarNo = null;

// DOM Elements
const sidoSelect = document.getElementById('sido');
const districtSelect = document.getElementById('district');
const dongSelect = document.getElementById('dong');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const resultsTable = document.getElementById('resultsTable').querySelector('tbody');
const pyeongMinInput = document.getElementById('pyeongMin');
const pyeongMaxInput = document.getElementById('pyeongMax');
const dateFromInput = document.getElementById('dateFrom');
const dateToInput = document.getElementById('dateTo');

// Set default date range (1 month ago ~ today)
(function setDefaultDateRange() {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    dateToInput.value = today.toISOString().split('T')[0];
    dateFromInput.value = oneMonthAgo.toISOString().split('T')[0];
})();

// Helper function to make API calls with timeout and retry
async function fetchAPI(apiUrl, retries = 2) {
    // If using proxy, rewrite URL to go through local server
    const url = USE_PROXY ? apiUrl.replace('https://new.land.naver.com/api', '/api') : apiUrl;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const fetchOptions = { signal: controller.signal };

            // When calling Naver API directly, we need credentials for same-site cookies
            if (!USE_PROXY) {
                fetchOptions.credentials = 'omit';
            }

            const response = await fetch(url, fetchOptions);
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
            sidoSelect.value = defaultValue;
        }
    } catch (err) {
        showError('시도 목록을 불러오는데 실패했습니다.');
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
            districtSelect.value = defaultValue;
            currentCortarNo = defaultValue;
            searchBtn.disabled = false;
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
            dongSelect.value = defaultValue;
            currentCortarNo = defaultValue;
            searchBtn.disabled = false;
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

    realPriceData.realPriceOnMonthList.forEach(monthData => {
        if (monthData.realPriceList) {
            monthData.realPriceList.forEach(price => {
                // Parse trade date
                const tradeDate = new Date(price.formattedTradeYearMonth.replace(/\./g, '-'));

                // Check if within date range
                if ((!dateFrom || tradeDate >= dateFrom) && (!dateTo || tradeDate <= dateTo)) {
                    // dealPrice is in units of 만원 (10,000 won) from the Naver Land API
                    // No conversion needed - we use it directly for calculations
                    const dealPrice = price.dealPrice;

                    if (!highestPrice || dealPrice > highestPrice) {
                        highestPrice = dealPrice;
                        highestPriceInfo = {
                            price: dealPrice,
                            floor: price.floor,
                            date: price.formattedTradeYearMonth
                        };
                    }
                }
            });
        }
    });

    return highestPriceInfo;
}

// Search and display results
async function searchRealEstate() {
    const searchCortarNo = dongSelect.value || districtSelect.value;
    if (!searchCortarNo) {
        showError('시/군/구를 선택해주세요.');
        return;
    }

    try {
        showLoading(true);
        resultsTable.innerHTML = '<tr><td colspan="6" class="no-data">데이터를 불러오는 중...</td></tr>';

        let allComplexes = [];

        if (dongSelect.value) {
            // 동이 선택된 경우 해당 동의 단지만 조회
            allComplexes = await loadComplexes(dongSelect.value);
        } else {
            // 동이 선택되지 않은 경우 시/군/구 내 모든 동의 단지 조회
            const dongData = await fetchAPI(`${API_BASE_URL}/regions/list?cortarNo=${districtSelect.value}`);
            if (dongData.regionList && dongData.regionList.length > 0) {
                for (const dong of dongData.regionList) {
                    const complexes = await loadComplexes(dong.cortarNo);
                    allComplexes = allComplexes.concat(complexes);
                }
            }
        }

        if (allComplexes.length === 0) {
            resultsTable.innerHTML = '<tr><td colspan="6" class="no-data">해당 지역에 아파트 단지가 없습니다.</td></tr>';
            return;
        }

        const results = [];

        // Get date filter values
        const dateFrom = dateFromInput.value ? new Date(dateFromInput.value) : null;
        const dateTo = dateToInput.value ? new Date(dateToInput.value) : null;

        // Process each complex
        for (const complex of allComplexes) {
            const complexInfo = await getComplexInfo(complex.complexNo);

            if (!complexInfo || !complexInfo.areaList) {
                continue;
            }

            // Get pyeong filter values
            const pyeongMin = pyeongMinInput.value ? parseInt(pyeongMinInput.value) : null;
            const pyeongMax = pyeongMaxInput.value ? parseInt(pyeongMaxInput.value) : null;

            // Process each area type in the complex
            for (let i = 0; i < complexInfo.areaList.length; i++) {
                const area = complexInfo.areaList[i];
                const areaNo = area.pyeongNo;

                // Filter by pyeong range
                const pyeong = parseInt(area.pyeongName2) || parseInt(area.exclusivePyeong) || 0;
                if (pyeongMin !== null && pyeong < pyeongMin) continue;
                if (pyeongMax !== null && pyeong > pyeongMax) continue;

                const priceData = await getRealPrices(complex.complexNo, areaNo);

                if (priceData) {
                    const currentPriceInfo = calculateCurrentPrice(priceData, dateFrom, dateTo);

                    if (currentPriceInfo) {
                        results.push({
                            complexName: complex.complexName,
                            pyeongName: area.pyeongName2 || area.pyeongName,
                            floor: currentPriceInfo.floor,
                            price: currentPriceInfo.price,
                            date: currentPriceInfo.date
                        });
                    }
                }

                // Add small delay to avoid overwhelming the API
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        // Sort by price (descending)
        results.sort((a, b) => b.price - a.price);

        // Display results
        if (results.length === 0) {
            resultsTable.innerHTML = '<tr><td colspan="6" class="no-data">해당 기간에 거래 내역이 없습니다.</td></tr>';
        } else {
            resultsTable.innerHTML = '';
            results.forEach((result, index) => {
                const row = document.createElement('tr');
                if (index === 0) row.classList.add('rank-1');
                if (index === 1) row.classList.add('rank-2');
                if (index === 2) row.classList.add('rank-3');

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${result.complexName}</td>
                    <td>${result.pyeongName}평</td>
                    <td>${result.floor}층</td>
                    <td class="price">${formatPrice(result.price)}</td>
                    <td>${result.date}</td>
                `;
                resultsTable.appendChild(row);
            });
        }
    } catch (err) {
        showError('데이터를 불러오는데 실패했습니다.');
        console.error(err);
    } finally {
        showLoading(false);
    }
}

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

// Default values
const DEFAULTS = {
    sido: '4100000000',       // 경기도
    district: '4159700000',   // 화성시 동탄구
    dong: '4159710400',       // 오산동
    pyeongMin: 20,
    pyeongMax: 27
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Set pyeong defaults
    pyeongMinInput.value = DEFAULTS.pyeongMin;
    pyeongMaxInput.value = DEFAULTS.pyeongMax;

    // Load and set region defaults
    await loadSido(DEFAULTS.sido);
    await loadDistrict(DEFAULTS.sido, DEFAULTS.district);
    await loadDong(DEFAULTS.district, DEFAULTS.dong);
});
