// Sample apartment real transaction data
// 샘플 아파트 실거래 데이터

const sampleApartmentData = [
    // Seoul - Gangnam
    { id: 1, name: '래미안대치팰리스', region: '서울 강남구 대치동', pyeong: 34, price: 250000, date: '2024-01-15', change: 3.2 },
    { id: 2, name: '아크로리버파크', region: '서울 강남구 청담동', pyeong: 42, price: 320000, date: '2024-01-20', change: 5.1 },
    { id: 3, name: '타워팰리스', region: '서울 강남구 도곡동', pyeong: 55, price: 480000, date: '2024-01-18', change: 2.8 },
    { id: 4, name: '래미안퍼스티지', region: '서울 강남구 삼성동', pyeong: 38, price: 280000, date: '2024-01-25', change: 4.5 },
    { id: 5, name: '아이파크', region: '서울 강남구 논현동', pyeong: 29, price: 180000, date: '2024-02-01', change: -1.2 },
    { id: 6, name: '래미안삼성', region: '서울 강남구 삼성동', pyeong: 32, price: 210000, date: '2024-02-03', change: 2.1 },
    { id: 7, name: '트라움하우스', region: '서울 강남구 청담동', pyeong: 46, price: 350000, date: '2024-01-28', change: 3.8 },
    { id: 8, name: '힐스테이트', region: '서울 강남구 대치동', pyeong: 25, price: 160000, date: '2024-02-05', change: 1.5 },
    
    // Seoul - Seocho
    { id: 9, name: '아크로비스타', region: '서울 서초구 반포동', pyeong: 40, price: 310000, date: '2024-01-22', change: 4.2 },
    { id: 10, name: '래미안아트힐', region: '서울 서초구 서초동', pyeong: 35, price: 240000, date: '2024-01-30', change: 2.9 },
    { id: 11, name: '반포자이', region: '서울 서초구 반포동', pyeong: 45, price: 380000, date: '2024-02-02', change: 5.5 },
    { id: 12, name: '래미안서초', region: '서울 서초구 서초동', pyeong: 28, price: 175000, date: '2024-01-19', change: 1.8 },
    { id: 13, name: '방배힐스테이트', region: '서울 서초구 방배동', pyeong: 31, price: 195000, date: '2024-02-04', change: -0.5 },
    
    // Seoul - Songpa
    { id: 14, name: '헬리오시티', region: '서울 송파구 거여동', pyeong: 33, price: 145000, date: '2024-01-26', change: 2.3 },
    { id: 15, name: '파크하비오', region: '서울 송파구 잠실동', pyeong: 37, price: 220000, date: '2024-02-01', change: 3.7 },
    { id: 16, name: '잠실엘스', region: '서울 송파구 잠실동', pyeong: 48, price: 280000, date: '2024-01-24', change: 4.8 },
    { id: 17, name: '리센츠', region: '서울 송파구 송파동', pyeong: 26, price: 135000, date: '2024-02-06', change: 0.8 },
    { id: 18, name: '트리지움', region: '서울 송파구 방이동', pyeong: 30, price: 158000, date: '2024-01-29', change: 1.9 },
    
    // Seoul - Gangdong
    { id: 19, name: '고덕래미안힐스테이트', region: '서울 강동구 고덕동', pyeong: 27, price: 115000, date: '2024-02-03', change: 2.5 },
    { id: 20, name: '강동센트럴아이파크', region: '서울 강동구 둔촌동', pyeong: 35, price: 142000, date: '2024-01-27', change: 3.1 },
    
    // Seoul - Mapo
    { id: 21, name: '마포래미안푸르지오', region: '서울 마포구 공덕동', pyeong: 29, price: 165000, date: '2024-01-31', change: 2.7 },
    { id: 22, name: '아현아이파크', region: '서울 마포구 아현동', pyeong: 32, price: 148000, date: '2024-02-02', change: 1.4 },
    { id: 23, name: '상암월드컵파크', region: '서울 마포구 상암동', pyeong: 38, price: 175000, date: '2024-01-23', change: 3.3 },
    
    // Seoul - Yongsan
    { id: 24, name: '한강대교아크로리버파크', region: '서울 용산구 한강로동', pyeong: 44, price: 295000, date: '2024-01-28', change: 4.9 },
    { id: 25, name: '용산푸르지오써밋', region: '서울 용산구 원효로동', pyeong: 36, price: 210000, date: '2024-02-05', change: 2.6 },
    
    // Gyeonggi - Seongnam
    { id: 26, name: '판교푸르지오그랑블', region: '경기 성남시 분당구 판교동', pyeong: 34, price: 185000, date: '2024-01-21', change: 3.4 },
    { id: 27, name: '분당센트럴파크', region: '경기 성남시 분당구 서현동', pyeong: 30, price: 152000, date: '2024-02-01', change: 2.1 },
    { id: 28, name: '아크로리버뷰', region: '경기 성남시 분당구 정자동', pyeong: 38, price: 168000, date: '2024-01-25', change: 1.7 },
    { id: 29, name: '판교푸르지오월드마크', region: '경기 성남시 분당구 삼평동', pyeong: 42, price: 195000, date: '2024-02-03', change: 4.1 },
    
    // Gyeonggi - Yongin
    { id: 30, name: '광교호반베르디움', region: '경기 용인시 수지구 광교동', pyeong: 28, price: 125000, date: '2024-01-29', change: 2.8 },
    { id: 31, name: '수지레미안', region: '경기 용인시 수지구 죽전동', pyeong: 33, price: 138000, date: '2024-02-04', change: 1.9 },
    { id: 32, name: '동백센트럴파크', region: '경기 용인시 기흥구 동백동', pyeong: 31, price: 128000, date: '2024-01-26', change: 2.3 },
    
    // Busan
    { id: 33, name: '해운대아이파크', region: '부산 해운대구 우동', pyeong: 36, price: 145000, date: '2024-01-22', change: 3.2 },
    { id: 34, name: '센텀아이파크', region: '부산 해운대구 재송동', pyeong: 40, price: 168000, date: '2024-02-01', change: 4.5 },
    { id: 35, name: '마린시티', region: '부산 해운대구 우동', pyeong: 45, price: 185000, date: '2024-01-30', change: 2.7 },
    
    // Daegu
    { id: 36, name: '대구수성푸르지오', region: '대구 수성구 범어동', pyeong: 32, price: 98000, date: '2024-01-27', change: 1.8 },
    { id: 37, name: '수성롯데캐슬', region: '대구 수성구 만촌동', pyeong: 35, price: 105000, date: '2024-02-02', change: 2.4 },
    
    // Incheon
    { id: 38, name: '송도푸르지오하버뷰', region: '인천 연수구 송도동', pyeong: 34, price: 132000, date: '2024-01-24', change: 3.1 },
    { id: 39, name: '송도센트럴파크', region: '인천 연수구 송도동', pyeong: 38, price: 148000, date: '2024-02-05', change: 2.9 },
    { id: 40, name: '검단신도시대광로제비앙', region: '인천 서구 검단동', pyeong: 28, price: 95000, date: '2024-01-31', change: 1.5 },
    
    // More data for variety
    { id: 41, name: '강남아크로리버뷰', region: '서울 강남구 청담동', pyeong: 50, price: 420000, date: '2024-02-08', change: 6.2 },
    { id: 42, name: '반포센트럴자이', region: '서울 서초구 반포동', pyeong: 52, price: 450000, date: '2024-02-07', change: 5.8 },
    { id: 43, name: '여의도파크원', region: '서울 영등포구 여의도동', pyeong: 47, price: 380000, date: '2024-02-06', change: 4.3 },
    { id: 44, name: '목동신시가지아파트', region: '서울 양천구 목동', pyeong: 33, price: 165000, date: '2024-02-04', change: 2.2 },
    { id: 45, name: '은평뉴타운두산위브', region: '서울 은평구 응암동', pyeong: 29, price: 125000, date: '2024-02-03', change: 1.6 },
    { id: 46, name: '하남미사강변', region: '경기 하남시 망월동', pyeong: 31, price: 118000, date: '2024-02-08', change: 3.5 },
    { id: 47, name: '위례신도시푸르지오', region: '경기 성남시 수정구 창곡동', pyeong: 27, price: 112000, date: '2024-02-07', change: 2.8 },
    { id: 48, name: '광명역센트럴', region: '경기 광명시 광명동', pyeong: 30, price: 108000, date: '2024-02-05', change: 2.1 },
    { id: 49, name: '일산호수공원자이', region: '경기 고양시 일산동구 장항동', pyeeng: 35, price: 135000, date: '2024-02-06', change: 2.9 },
    { id: 50, name: '파주운정신도시롯데캐슬', region: '경기 파주시 교하읍', pyeong: 28, price: 95000, date: '2024-02-04', change: 1.4 },
];

// Region hierarchy data
const regionData = {
    '서울': {
        cities: ['강남구', '서초구', '송파구', '강동구', '마포구', '용산구', '영등포구', '양천구', '은평구'],
        districts: {
            '강남구': ['대치동', '청담동', '도곡동', '삼성동', '논현동'],
            '서초구': ['반포동', '서초동', '방배동'],
            '송파구': ['거여동', '잠실동', '송파동', '방이동'],
            '강동구': ['고덕동', '둔촌동'],
            '마포구': ['공덕동', '아현동', '상암동'],
            '용산구': ['한강로동', '원효로동'],
            '영등포구': ['여의도동'],
            '양천구': ['목동'],
            '은평구': ['응암동']
        }
    },
    '경기': {
        cities: ['성남시', '용인시', '하남시', '광명시', '고양시', '파주시'],
        districts: {
            '성남시': ['분당구 판교동', '분당구 서현동', '분당구 정자동', '분당구 삼평동', '수정구 창곡동'],
            '용인시': ['수지구 광교동', '수지구 죽전동', '기흥구 동백동'],
            '하남시': ['망월동'],
            '광명시': ['광명동'],
            '고양시': ['일산동구 장항동'],
            '파주시': ['교하읍']
        }
    },
    '부산': {
        cities: ['해운대구'],
        districts: {
            '해운대구': ['우동', '재송동']
        }
    },
    '대구': {
        cities: ['수성구'],
        districts: {
            '수성구': ['범어동', '만촌동']
        }
    },
    '인천': {
        cities: ['연수구', '서구'],
        districts: {
            '연수구': ['송도동'],
            '서구': ['검단동']
        }
    }
};

// Generate more sample data for various date ranges
function generateAdditionalData() {
    const baseData = [...sampleApartmentData];
    const additionalData = [];
    
    // Generate historical data (older dates)
    baseData.forEach((apt, index) => {
        if (index < 20) { // Generate for first 20 apartments
            for (let i = 1; i <= 3; i++) {
                const date = new Date('2024-01-15');
                date.setMonth(date.getMonth() - i);
                const priceChange = (Math.random() - 0.5) * 10; // Random change between -5% and +5%
                additionalData.push({
                    ...apt,
                    id: baseData.length + additionalData.length + 1,
                    date: date.toISOString().split('T')[0],
                    price: Math.round(apt.price * (1 - (i * 0.02))), // Slightly lower price for older dates
                    change: priceChange
                });
            }
        }
    });
    
    return [...baseData, ...additionalData];
}

const allApartmentData = generateAdditionalData();
