// Mock data for demonstration
const mockProperties = [
    {
        id: 1,
        title: "강남구 신축 아파트",
        region: "서울",
        type: "아파트",
        tradeType: "매매",
        price: 120000,
        area: 85,
        rooms: 3,
        address: "서울시 강남구 역삼동",
        year: 2023,
        icon: "🏢"
    },
    {
        id: 2,
        title: "해운대 오션뷰 아파트",
        region: "부산",
        type: "아파트",
        tradeType: "전세",
        price: 45000,
        area: 102,
        rooms: 4,
        address: "부산시 해운대구 우동",
        year: 2020,
        icon: "🌊"
    },
    {
        id: 3,
        title: "분당 모던 빌라",
        region: "경기",
        type: "빌라",
        tradeType: "월세",
        price: 500,
        deposit: 5000,
        area: 65,
        rooms: 2,
        address: "경기도 성남시 분당구",
        year: 2021,
        icon: "🏠"
    },
    {
        id: 4,
        title: "송도 신도시 오피스텔",
        region: "인천",
        type: "오피스텔",
        tradeType: "매매",
        price: 35000,
        area: 42,
        rooms: 1,
        address: "인천시 연수구 송도동",
        year: 2022,
        icon: "🏙️"
    },
    {
        id: 5,
        title: "광화문 프리미엄 오피스텔",
        region: "서울",
        type: "오피스텔",
        tradeType: "전세",
        price: 28000,
        area: 38,
        rooms: 1,
        address: "서울시 종로구 광화문",
        year: 2021,
        icon: "🏙️"
    },
    {
        id: 6,
        title: "용인 단독주택",
        region: "경기",
        type: "단독주택",
        tradeType: "매매",
        price: 85000,
        area: 165,
        rooms: 5,
        address: "경기도 용인시 수지구",
        year: 2019,
        icon: "🏡"
    },
    {
        id: 7,
        title: "대구 중심가 상가",
        region: "대구",
        type: "상가",
        tradeType: "매매",
        price: 95000,
        area: 120,
        rooms: 0,
        address: "대구시 중구 동성로",
        year: 2018,
        icon: "🏪"
    },
    {
        id: 8,
        title: "수원 역세권 아파트",
        region: "경기",
        type: "아파트",
        tradeType: "월세",
        price: 80,
        deposit: 10000,
        area: 78,
        rooms: 3,
        address: "경기도 수원시 팔달구",
        year: 2020,
        icon: "🏢"
    },
    {
        id: 9,
        title: "판교 테크노밸리 오피스텔",
        region: "경기",
        type: "오피스텔",
        tradeType: "매매",
        price: 42000,
        area: 45,
        rooms: 1,
        address: "경기도 성남시 분당구 판교동",
        year: 2022,
        icon: "🏙️"
    },
    {
        id: 10,
        title: "제주 바다뷰 빌라",
        region: "제주",
        type: "빌라",
        tradeType: "매매",
        price: 65000,
        area: 88,
        rooms: 3,
        address: "제주시 애월읍",
        year: 2021,
        icon: "🌴"
    }
];

// State management
let currentView = 'grid';
let filteredProperties = [];

// DOM Elements
const searchForm = document.getElementById('searchForm');
const resultsContainer = document.getElementById('resultsContainer');
const loadingElement = document.getElementById('loading');
const totalCountElement = document.getElementById('totalCount');
const avgPriceElement = document.getElementById('avgPrice');
const lastUpdateElement = document.getElementById('lastUpdate');
const viewButtons = document.querySelectorAll('.view-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateStats([]);
    updateLastUpdate();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    searchForm.addEventListener('submit', handleSearch);
    
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
        });
    });
}

// Handle Search
async function handleSearch(e) {
    e.preventDefault();
    
    showLoading();
    
    const formData = new FormData(searchForm);
    const filters = {
        region: formData.get('region'),
        propertyType: formData.get('propertyType'),
        tradeType: formData.get('tradeType'),
        minPrice: parseInt(formData.get('minPrice')) || 0,
        maxPrice: parseInt(formData.get('maxPrice')) || Infinity
    };
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    filteredProperties = filterProperties(filters);
    displayResults(filteredProperties);
    updateStats(filteredProperties);
    updateLastUpdate();
    hideLoading();
}

// Filter Properties
function filterProperties(filters) {
    return mockProperties.filter(property => {
        const matchRegion = !filters.region || property.region === filters.region;
        const matchType = !filters.propertyType || property.type === filters.propertyType;
        const matchTradeType = !filters.tradeType || property.tradeType === filters.tradeType;
        
        const propertyPrice = property.tradeType === '월세' ? property.deposit : property.price;
        const matchPrice = propertyPrice >= filters.minPrice && propertyPrice <= filters.maxPrice;
        
        return matchRegion && matchType && matchTradeType && matchPrice;
    });
}

// Display Results
function displayResults(properties) {
    if (properties.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results"><p>검색 결과가 없습니다. 다른 조건으로 검색해보세요.</p></div>';
        return;
    }
    
    resultsContainer.innerHTML = properties.map(property => createPropertyCard(property)).join('');
}

// Create Property Card
function createPropertyCard(property) {
    const priceDisplay = formatPrice(property);
    
    return `
        <div class="property-card" onclick="showPropertyDetail(${property.id})">
            <div class="property-image">
                ${property.icon}
            </div>
            <div class="property-info">
                <h3>${property.title}</h3>
                <div class="property-details">
                    <div class="detail-item">
                        <span>📍</span>
                        <span>${property.address}</span>
                    </div>
                    <div class="detail-item">
                        <span>📐</span>
                        <span>${property.area}㎡</span>
                    </div>
                    ${property.rooms > 0 ? `
                    <div class="detail-item">
                        <span>🛏️</span>
                        <span>방 ${property.rooms}개</span>
                    </div>
                    ` : ''}
                    <div class="detail-item">
                        <span>📅</span>
                        <span>${property.year}년 건축</span>
                    </div>
                </div>
                <div class="property-tags">
                    <span class="tag">${property.type}</span>
                    <span class="tag">${property.tradeType}</span>
                    <span class="tag">${property.region}</span>
                </div>
                <div class="property-price">${priceDisplay}</div>
            </div>
        </div>
    `;
}

// Format Price
function formatPrice(property) {
    if (property.tradeType === '월세') {
        return `보증금 ${property.deposit.toLocaleString()}만원 / 월 ${property.price.toLocaleString()}만원`;
    } else {
        return `${property.price.toLocaleString()}만원`;
    }
}

// Update Statistics
function updateStats(properties) {
    totalCountElement.textContent = properties.length.toLocaleString();
    
    if (properties.length > 0) {
        const prices = properties.map(p => p.tradeType === '월세' ? p.deposit : p.price);
        const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
        avgPriceElement.textContent = `${avgPrice.toLocaleString()}만원`;
    } else {
        avgPriceElement.textContent = '0원';
    }
}

// Update Last Update Time
function updateLastUpdate() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    lastUpdateElement.textContent = timeString;
}

// Switch View
function switchView(view) {
    currentView = view;
    
    viewButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    if (view === 'grid') {
        resultsContainer.className = 'results-grid';
    } else {
        resultsContainer.className = 'results-list';
    }
    
    if (filteredProperties.length > 0) {
        displayResults(filteredProperties);
    }
}

// Show Property Detail (placeholder)
function showPropertyDetail(id) {
    const property = mockProperties.find(p => p.id === id);
    if (property) {
        alert(`매물 상세정보\n\n${property.title}\n${property.address}\n\n가격: ${formatPrice(property)}\n면적: ${property.area}㎡\n건축년도: ${property.year}년\n\n※ 실제 서비스에서는 상세 페이지로 이동합니다.`);
    }
}

// Loading State
function showLoading() {
    loadingElement.style.display = 'block';
    resultsContainer.style.display = 'none';
}

function hideLoading() {
    loadingElement.style.display = 'none';
    resultsContainer.style.display = currentView === 'grid' ? 'grid' : 'flex';
}

// API Integration Helper (for future use)
async function fetchRealEstateData(filters) {
    // This function can be extended to call real APIs
    // Example: Korea Real Estate API, Kakao Map API, etc.
    
    try {
        // const response = await fetch('API_ENDPOINT', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(filters)
        // });
        // const data = await response.json();
        // return data;
        
        // For now, return mock data
        return mockProperties;
    } catch (error) {
        console.error('API 호출 오류:', error);
        return [];
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        filterProperties,
        formatPrice,
        mockProperties
    };
}
