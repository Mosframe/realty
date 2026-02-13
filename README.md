# 부동산 정보 검색 웹페이지 🏠

실시간 부동산 정보를 검색하고 확인할 수 있는 웹 애플리케이션입니다.

## 기능 소개

### 주요 기능
- 🔍 **다양한 검색 옵션**: 지역, 매물 유형, 거래 유형, 가격대별 검색
- 📊 **통계 정보**: 총 매물 수, 평균 가격, 최근 업데이트 시간 제공
- 🎨 **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 기기 지원
- 👁️ **뷰 옵션**: 그리드 뷰와 리스트 뷰 전환 가능
- ⚡ **빠른 필터링**: 실시간으로 매물 검색 및 필터링

### 검색 옵션
- **지역**: 서울, 부산, 대구, 인천, 광주, 대전, 울산, 세종, 경기 등
- **매물 유형**: 아파트, 빌라, 오피스텔, 단독주택, 상가
- **거래 유형**: 매매, 전세, 월세
- **가격 범위**: 최소/최대 가격 설정 가능

## 사용 방법

### 1. 웹페이지 실행
브라우저에서 `index.html` 파일을 열어주세요:
```bash
# 로컬 서버 실행 (Python 사용)
python -m http.server 8000

# 또는 Node.js 사용
npx http-server
```

그런 다음 브라우저에서 `http://localhost:8000` 접속

### 2. 매물 검색
1. 원하는 검색 조건 선택 (지역, 매물 유형, 거래 유형, 가격)
2. "검색" 버튼 클릭
3. 검색 결과 확인

### 3. 결과 보기
- 📊 **그리드 뷰**: 카드 형식으로 매물 정보 확인
- 📝 **리스트 뷰**: 리스트 형식으로 매물 정보 확인
- 매물 카드 클릭 시 상세 정보 확인 가능

## 프로젝트 구조

```
realty/
├── index.html          # 메인 HTML 파일
├── styles.css          # 스타일시트
├── script.js           # JavaScript 로직
├── README.md           # 프로젝트 문서
└── LICENSE            # 라이선스 파일
```

## 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**: 반응형 디자인, Flexbox, Grid
- **JavaScript (ES6+)**: 동적 기능 구현
- **웹 표준**: 모던 브라우저 지원

## API 연동 가이드

현재는 데모 데이터를 사용하고 있습니다. 실제 API 연동을 위해서는:

### 1. 공공 데이터 포털 API
- [국토교통부 실거래가 API](https://www.data.go.kr/)
- [부동산 거래 정보 API](https://www.data.go.kr/)

### 2. API 연동 방법
`script.js` 파일의 `fetchRealEstateData` 함수를 수정:

```javascript
async function fetchRealEstateData(filters) {
    const API_KEY = 'YOUR_API_KEY';
    const API_ENDPOINT = 'YOUR_API_ENDPOINT';
    
    const response = await fetch(`${API_ENDPOINT}?serviceKey=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
    });
    
    const data = await response.json();
    return data;
}
```

### 3. 지원 가능한 API
- 국토교통부 실거래가 정보
- Kakao Map API (지도 표시)
- Naver Map API (지도 표시)
- 부동산 전문 API 서비스

## 브라우저 지원

- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)
- 모바일 브라우저 (iOS Safari, Chrome)

## 개발 로드맵

- [x] 기본 UI/UX 구현
- [x] 검색 필터 기능
- [x] 반응형 디자인
- [x] 통계 정보 표시
- [ ] 실제 API 연동
- [ ] 지도 통합
- [ ] 즐겨찾기 기능
- [ ] 비교 기능
- [ ] 사용자 리뷰 시스템

## 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 기여하기

프로젝트 개선을 위한 기여를 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.

---

© 2026 부동산 정보 검색. All rights reserved.
