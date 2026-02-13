# 부동산 실거래가 랭킹

네이버 부동산 API를 활용한 실거래가 랭킹 사이트입니다.

## 기능

1. **시도 선택** - 시/도 지역을 선택합니다
2. **시/군/구 선택** - 선택한 시/도의 시/군/구를 선택합니다
3. **동 선택** - 선택한 시/군/구의 동을 선택합니다
4. **실거래가 조회** - 선택한 동의 모든 아파트 단지의 최근 3개월 최고가를 조회하여 랭킹으로 표시합니다

## 설치 및 실행

### 필수 요구사항
- Node.js (버전 12 이상)

### 실행 방법

1. 저장소 클론
```bash
git clone https://github.com/Mosframe/realty.git
cd realty
```

2. 서버 실행
```bash
node server.js
```

3. 브라우저에서 접속
```
http://localhost:3000
```

## 프로젝트 구조

```
realty/
├── index.html      # 메인 HTML 페이지
├── style.css       # 스타일시트
├── app.js          # 프론트엔드 JavaScript
├── server.js       # Node.js 프록시 서버
├── package.json    # 프로젝트 설정
└── README.md       # 프로젝트 문서
```

## 사용 방법

1. 시도(서울시, 경기도 등)를 선택합니다
2. 시/군/구를 선택합니다
3. 동을 선택합니다
4. "조회" 버튼을 클릭합니다
5. 해당 지역의 아파트 실거래가 랭킹이 표시됩니다

## 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js
- **API**: Naver Land API

## 주요 기능

- 최근 3개월 거래 내역 중 최고가 표시
- 아파트명, 평형, 층, 거래일자 정보 제공
- 가격순 자동 정렬
- 상위 3개 항목 강조 표시 (금, 은, 동메달)

## 라이선스

MIT License
