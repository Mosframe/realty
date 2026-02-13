// API Configuration
const API_BASE_URL = '/api';

// State
let currentCortarNo = null;
let useBackendAPI = true; // Track if backend API is available

// Mock data for fallback when API is not available (e.g., on GitHub Pages)
const mockData = {
    // 시도 목록
    regions_0000000000: {
        "regionList": [
            {
                "cortarNo": "1100000000",
                "centerLat": 37.566427,
                "centerLon": 126.977872,
                "cortarName": "서울시",
                "cortarType": "city"
            },
            {
                "cortarNo": "4100000000",
                "centerLat": 37.274939,
                "centerLon": 127.008689,
                "cortarName": "경기도",
                "cortarType": "city"
            },
            {
                "cortarNo": "2600000000",
                "centerLat": 35.159527,
                "centerLon": 129.061229,
                "cortarName": "부산시",
                "cortarType": "city"
            }
        ]
    },
    // 경기도 시/군/구
    regions_4100000000: {
        "regionList": [
            {
                "cortarNo": "4159700000",
                "centerLat": 37.197266,
                "centerLon": 127.096607,
                "cortarName": "화성시 동탄구",
                "cortarType": "dvsn"
            },
            {
                "cortarNo": "4113500000",
                "centerLat": 37.394,
                "centerLon": 127.11,
                "cortarName": "성남시 분당구",
                "cortarType": "dvsn"
            }
        ]
    },
    // 화성시 동탄구 동 목록
    regions_4159700000: {
        "regionList": [
            {
                "cortarNo": "4159710400",
                "centerLat": 37.192398,
                "centerLon": 127.097583,
                "cortarName": "오산동",
                "cortarType": "sec"
            },
            {
                "cortarNo": "4159710300",
                "centerLat": 37.201,
                "centerLon": 127.075,
                "cortarName": "영천동",
                "cortarType": "sec"
            }
        ]
    },
    // 오산동 아파트 단지 목록
    complexes_4159710400: {
        "complexList": [
            {
                "complexNo": "119652",
                "complexName": "동탄역롯데캐슬(주상복합)",
                "cortarNo": "4159710400",
                "realEstateTypeCode": "APT",
                "realEstateTypeName": "아파트",
                "detailAddress": "1089",
                "latitude": 37.199274,
                "longitude": 127.097351,
                "totalHouseholdCount": 940,
                "totalBuildingCount": 4,
                "highFloor": 49,
                "lowFloor": 49,
                "useApproveYmd": "20210629",
                "dealCount": 21,
                "leaseCount": 1,
                "rentCount": 0,
                "shortTermRentCount": 0,
                "isInterest": true,
                "cortarAddress": "경기도 화성시 동탄구 오산동",
                "tourExist": false
            },
            {
                "complexNo": "119653",
                "complexName": "동탄역 센트럴파크 푸르지오",
                "cortarNo": "4159710400",
                "realEstateTypeCode": "APT",
                "realEstateTypeName": "아파트",
                "detailAddress": "1088",
                "latitude": 37.199,
                "longitude": 127.098,
                "totalHouseholdCount": 1200,
                "totalBuildingCount": 6,
                "highFloor": 45,
                "lowFloor": 45,
                "useApproveYmd": "20210701",
                "dealCount": 15,
                "leaseCount": 2,
                "rentCount": 0,
                "shortTermRentCount": 0,
                "isInterest": false,
                "cortarAddress": "경기도 화성시 동탄구 오산동",
                "tourExist": false
            }
        ]
    },
    // 아파트 단지 정보 - 동탄역롯데캐슬
    complex_119652: {
        "complex": {
            "complexNo": "119652",
            "complexName": "동탄역롯데캐슬(주상복합)",
            "cortarNo": "4159710400",
            "realEstateTypeCode": "APT",
            "realEstateTypeName": "아파트",
            "detailAddress": "1089",
            "latitude": 37.199274,
            "longitude": 127.097351,
            "totalHouseholdCount": 940,
            "totalBuildingCount": 4,
            "highFloor": 49,
            "lowFloor": 49,
            "useApproveYmd": "20210629",
            "dealCount": 21,
            "leaseCount": 1,
            "rentCount": 0,
            "shortTermRentCount": 0,
            "isInterest": true,
            "cortarAddress": "경기도 화성시 동탄구 오산동",
            "tourExist": false
        },
        "areaList": [
            {
                "pyeongNo": 1,
                "supplyAreaDouble": 90.67,
                "supplyArea": "90.67",
                "pyeongName": "90",
                "pyeongName2": "27",
                "grandPlanUrl": "/20180220_93/hscp_img_15191170286477cBzg_JPEG/photoinfra_1519117028351.jpg",
                "exclusiveArea": "65.96",
                "exclusivePyeong": "19.95"
            },
            {
                "pyeongNo": 2,
                "supplyAreaDouble": 74.12,
                "supplyArea": "74.12",
                "pyeongName": "74",
                "pyeongName2": "22",
                "grandPlanUrl": "/20180220_93/hscp_img_15191170286477cBzg_JPEG/photoinfra_1519117028351.jpg",
                "exclusiveArea": "54.32",
                "exclusivePyeong": "16.43"
            }
        ]
    },
    // 아파트 단지 정보 - 동탄역 센트럴파크 푸르지오
    complex_119653: {
        "complex": {
            "complexNo": "119653",
            "complexName": "동탄역 센트럴파크 푸르지오",
            "cortarNo": "4159710400",
            "realEstateTypeCode": "APT",
            "realEstateTypeName": "아파트",
            "detailAddress": "1088",
            "latitude": 37.199,
            "longitude": 127.098,
            "totalHouseholdCount": 1200,
            "totalBuildingCount": 6,
            "highFloor": 45,
            "lowFloor": 45,
            "useApproveYmd": "20210701",
            "dealCount": 15,
            "leaseCount": 2,
            "rentCount": 0,
            "shortTermRentCount": 0,
            "isInterest": false,
            "cortarAddress": "경기도 화성시 동탄구 오산동",
            "tourExist": false
        },
        "areaList": [
            {
                "pyeongNo": 1,
                "supplyAreaDouble": 84.98,
                "supplyArea": "84.98",
                "pyeongName": "84",
                "pyeongName2": "25",
                "exclusiveArea": "59.98",
                "exclusivePyeong": "18.14"
            }
        ]
    },
    // 실거래가 - 동탄역롯데캐슬 90평형
    prices_119652_1: {
        "areaNo": 1,
        "realPriceOnMonthList": [
            {
                "realPriceList": [
                    {
                        "tradeType": "A1",
                        "tradeYear": "2026",
                        "tradeMonth": 2,
                        "tradeDate": "10",
                        "dealPrice": 160000,
                        "leasePrice": 0,
                        "rentPrice": 0,
                        "floor": 45,
                        "representativeArea": 0.0,
                        "exclusiveArea": 0.0,
                        "formattedPrice": "16억",
                        "formattedTradeYearMonth": "2026.02.10"
                    },
                    {
                        "tradeType": "A1",
                        "tradeYear": "2026",
                        "tradeMonth": 1,
                        "tradeDate": "31",
                        "dealPrice": 158000,
                        "leasePrice": 0,
                        "rentPrice": 0,
                        "floor": 48,
                        "representativeArea": 0.0,
                        "exclusiveArea": 0.0,
                        "formattedPrice": "15억 8,000",
                        "formattedTradeYearMonth": "2026.01.31"
                    }
                ],
                "tradeBaseYear": "2026",
                "tradeBaseMonth": 2
            },
            {
                "realPriceList": [
                    {
                        "tradeType": "A1",
                        "tradeYear": "2026",
                        "tradeMonth": 1,
                        "tradeDate": "15",
                        "dealPrice": 155000,
                        "leasePrice": 0,
                        "rentPrice": 0,
                        "floor": 32,
                        "representativeArea": 0.0,
                        "exclusiveArea": 0.0,
                        "formattedPrice": "15억 5,000",
                        "formattedTradeYearMonth": "2026.01.15"
                    }
                ],
                "tradeBaseYear": "2026",
                "tradeBaseMonth": 1
            }
        ],
        "addedRowCount": 3,
        "totalRowCount": 21,
        "realPriceBasisYearMonth": "202602"
    },
    // 실거래가 - 동탄역롯데캐슬 74평형
    prices_119652_2: {
        "areaNo": 2,
        "realPriceOnMonthList": [
            {
                "realPriceList": [
                    {
                        "tradeType": "A1",
                        "tradeYear": "2026",
                        "tradeMonth": 2,
                        "tradeDate": "05",
                        "dealPrice": 135000,
                        "leasePrice": 0,
                        "rentPrice": 0,
                        "floor": 28,
                        "representativeArea": 0.0,
                        "exclusiveArea": 0.0,
                        "formattedPrice": "13억 5,000",
                        "formattedTradeYearMonth": "2026.02.05"
                    }
                ],
                "tradeBaseYear": "2026",
                "tradeBaseMonth": 2
            }
        ],
        "addedRowCount": 1,
        "totalRowCount": 8,
        "realPriceBasisYearMonth": "202602"
    },
    // 실거래가 - 동탄역 센트럴파크 푸르지오 84평형
    prices_119653_1: {
        "areaNo": 1,
        "realPriceOnMonthList": [
            {
                "realPriceList": [
                    {
                        "tradeType": "A1",
                        "tradeYear": "2026",
                        "tradeMonth": 2,
                        "tradeDate": "12",
                        "dealPrice": 142000,
                        "leasePrice": 0,
                        "rentPrice": 0,
                        "floor": 38,
                        "representativeArea": 0.0,
                        "exclusiveArea": 0.0,
                        "formattedPrice": "14억 2,000",
                        "formattedTradeYearMonth": "2026.02.12"
                    }
                ],
                "tradeBaseYear": "2026",
                "tradeBaseMonth": 2
            },
            {
                "realPriceList": [
                    {
                        "tradeType": "A1",
                        "tradeYear": "2026",
                        "tradeMonth": 1,
                        "tradeDate": "20",
                        "dealPrice": 140000,
                        "leasePrice": 0,
                        "rentPrice": 0,
                        "floor": 25,
                        "representativeArea": 0.0,
                        "exclusiveArea": 0.0,
                        "formattedPrice": "14억",
                        "formattedTradeYearMonth": "2026.01.20"
                    }
                ],
                "tradeBaseYear": "2026",
                "tradeBaseMonth": 1
            }
        ],
        "addedRowCount": 2,
        "totalRowCount": 15,
        "realPriceBasisYearMonth": "202602"
    }
};

// DOM Elements
const sidoSelect = document.getElementById('sido');
const districtSelect = document.getElementById('district');
const dongSelect = document.getElementById('dong');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const resultsTable = document.getElementById('resultsTable').querySelector('tbody');

// Get mock data key based on request URL
function getMockDataKey(url) {
    const urlObj = new URL(url, window.location.origin);
    const pathname = urlObj.pathname.replace('/api', '');
    const params = urlObj.searchParams;
    
    if (pathname === '/regions/list') {
        return `regions_${params.get('cortarNo')}`;
    } else if (pathname === '/regions/complexes') {
        return `complexes_${params.get('cortarNo')}`;
    } else if (pathname.match(/^\/complexes\/\d+$/)) {
        const complexNo = pathname.split('/')[2];
        return `complex_${complexNo}`;
    } else if (pathname.match(/^\/complexes\/\d+\/prices\/real$/)) {
        const complexNo = pathname.split('/')[2];
        return `prices_${complexNo}_${params.get('areaNo')}`;
    }
    return null;
}

// Helper function to make API calls with fallback to mock data
async function fetchAPI(url) {
    // Try backend API first if enabled
    if (useBackendAPI) {
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (err) {
            console.log('Backend API not available, falling back to mock data');
            useBackendAPI = false; // Disable backend API for future requests
        }
    }
    
    // Fallback to mock data
    const mockKey = getMockDataKey(url);
    if (mockKey && mockData[mockKey]) {
        console.log(`Using mock data for: ${mockKey}`);
        return mockData[mockKey];
    }
    
    // If no mock data available, throw error
    throw new Error('No data available from API or mock data');
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
// Note: dealPrice from the API is in units of 만원 (10,000 won)
// For example: dealPrice: 160000 means 160000만원 = 16억원
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
