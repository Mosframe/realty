// API Configuration
const API_BASE_URL = '/api';

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

// Helper function to make API calls
async function fetchAPI(url) {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (err) {
        console.error('API Error:', err);
        throw err;
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
async function loadSido() {
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
    } catch (err) {
        showError('시도 목록을 불러오는데 실패했습니다.');
        console.error(err);
    }
}

// Load 시/군/구 (District)
async function loadDistrict(cortarNo) {
    try {
        showLoading(true);
        const data = await fetchAPI(`${API_BASE_URL}/regions/list?cortarNo=${cortarNo}`);
        
        districtSelect.innerHTML = '<option value="">시/군/구 선택</option>';
        dongSelect.innerHTML = '<option value="">동 선택</option>';
        dongSelect.disabled = true;
        searchBtn.disabled = true;
        
        if (data.regionList && data.regionList.length > 0) {
            data.regionList.forEach(region => {
                const option = document.createElement('option');
                option.value = region.cortarNo;
                option.textContent = region.cortarName;
                districtSelect.appendChild(option);
            });
            districtSelect.disabled = false;
        }
    } catch (err) {
        showError('시/군/구 목록을 불러오는데 실패했습니다.');
        console.error(err);
    } finally {
        showLoading(false);
    }
}

// Load 동 (Neighborhood)
async function loadDong(cortarNo) {
    try {
        showLoading(true);
        const data = await fetchAPI(`${API_BASE_URL}/regions/list?cortarNo=${cortarNo}`);
        
        dongSelect.innerHTML = '<option value="">동 선택</option>';
        searchBtn.disabled = true;
        
        if (data.regionList && data.regionList.length > 0) {
            data.regionList.forEach(region => {
                const option = document.createElement('option');
                option.value = region.cortarNo;
                option.textContent = region.cortarName;
                dongSelect.appendChild(option);
            });
            dongSelect.disabled = false;
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

// Calculate current price (highest in last 3 months)
function calculateCurrentPrice(realPriceData) {
    if (!realPriceData || !realPriceData.realPriceOnMonthList) {
        return null;
    }
    
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    
    let highestPrice = null;
    let highestPriceInfo = null;
    
    realPriceData.realPriceOnMonthList.forEach(monthData => {
        if (monthData.realPriceList) {
            monthData.realPriceList.forEach(price => {
                // Parse trade date
                const tradeDate = new Date(price.formattedTradeYearMonth.replace(/\./g, '-'));
                
                // Check if within last 3 months
                if (tradeDate >= threeMonthsAgo) {
                    const dealPrice = price.dealPrice; // dealPrice is already in units of 만원 (10,000 won)
                    
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
    if (!currentCortarNo) {
        showError('동을 선택해주세요.');
        return;
    }
    
    try {
        showLoading(true);
        resultsTable.innerHTML = '<tr><td colspan="6" class="no-data">데이터를 불러오는 중...</td></tr>';
        
        // Load all complexes in the selected dong
        const complexes = await loadComplexes(currentCortarNo);
        
        if (complexes.length === 0) {
            resultsTable.innerHTML = '<tr><td colspan="6" class="no-data">해당 지역에 아파트 단지가 없습니다.</td></tr>';
            return;
        }
        
        const results = [];
        
        // Process each complex
        for (const complex of complexes) {
            const complexInfo = await getComplexInfo(complex.complexNo);
            
            if (!complexInfo || !complexInfo.areaList) {
                continue;
            }
            
            // Process each area type in the complex
            for (let i = 0; i < complexInfo.areaList.length; i++) {
                const area = complexInfo.areaList[i];
                const areaNo = area.pyeongNo;
                
                const priceData = await getRealPrices(complex.complexNo, areaNo);
                
                if (priceData) {
                    const currentPriceInfo = calculateCurrentPrice(priceData);
                    
                    if (currentPriceInfo) {
                        results.push({
                            complexName: complex.complexName,
                            pyeongName: area.pyeongName,
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
            resultsTable.innerHTML = '<tr><td colspan="6" class="no-data">최근 3개월간 거래 내역이 없습니다.</td></tr>';
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
    } else {
        dongSelect.innerHTML = '<option value="">동 선택</option>';
        dongSelect.disabled = true;
        searchBtn.disabled = true;
    }
});

dongSelect.addEventListener('change', (e) => {
    currentCortarNo = e.target.value;
    searchBtn.disabled = !currentCortarNo;
});

searchBtn.addEventListener('click', searchRealEstate);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSido();
});
