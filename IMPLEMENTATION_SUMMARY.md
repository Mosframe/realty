# 부동산 실거래가 랭킹 사이트 구현 요약

## 구현 완료 항목

### 1. 시도 콤보박스 ✅
- API: `GET /api/regions/list?cortarNo=0000000000`
- 시도 목록을 조회하여 콤보박스에 표시
- 아이템명: `cortarName`, 아이템값: `cortarNo`

### 2. 시/군/구 콤보박스 ✅
- API: `GET /api/regions/list?cortarNo={선택한시도}`
- 시도 선택 시 해당 지역의 시/군/구 목록 로드
- 아이템명: `cortarName`, 아이템값: `cortarNo`

### 3. 동 콤보박스 ✅
- API: `GET /api/regions/list?cortarNo={선택한시군구}`
- 시/군/구 선택 시 해당 지역의 동 목록 로드
- 아이템명: `cortarName`, 아이템값: `cortarNo`

### 4. 아파트단지목록 ✅
- API: `GET /api/regions/complexes?cortarNo={선택한동}&realEstateType=APT:PRE:ABYG:JGC&order=`
- 선택한 동의 모든 아파트 단지 조회
- 아이템명: `complexName`, 아이템값: `complexNo`

### 5. 아파트단지정보 조회 ✅
- API: `GET /api/complexes/{complexNo}?complexNo={complexNo}&initial=Y`
- 각 단지의 평형(areaList) 정보 조회
- `areaList` 배열의 각 항목에 대해 실거래가 조회

### 6. 실거래가 조회 ✅
- API: `GET /api/complexes/{complexNo}/prices/real?complexNo={complexNo}&tradeType=A1&year=5&areaNo={areaNo}&type=table`
- 각 평형별 실거래가 정보 조회
- 최근 3개월간 거래 중 최고가 선택

## 최종 결과 표시

### 표시 항목
1. **순위** - 가격 기준 내림차순
2. **아파트명** - `complexName`
3. **평형** - `pyeongName`
4. **층** - `floor`
5. **현재시세** - 최근 3개월 최고가, 한국 통화 형식 (예: 16억원, 14억 2,000만원)
6. **거래일자** - `formattedTradeYearMonth`

### 특별 기능
- 상위 3개 항목 색상 강조 (금, 은, 동메달)
- 반응형 디자인
- 로딩 인디케이터
- 에러 처리

## 기술 구현

### Frontend (app.js)
- Vanilla JavaScript로 구현
- 비동기 API 호출 (async/await)
- 동적 DOM 조작
- 이벤트 핸들링

### Backend (server.js)
- Node.js HTTP 서버
- API 프록시 (CORS 우회)
- Mock 데이터 지원
- 환경 변수 지원

### Mock Data (mockData.js)
- 완전한 테스트 데이터셋
- 실제 API 응답 구조와 일치
- 개발/테스트 환경에서 사용

## 보안

- ✅ CodeQL 스캔 통과 (0건)
- ✅ 환경 변수로 토큰 관리
- ✅ .env.example 제공
- ✅ 민감정보 제외 (.gitignore)

## 테스트 완료

- ✅ 시도 → 시/군/구 → 동 선택 흐름
- ✅ 실거래가 조회 및 표시
- ✅ 가격 포맷팅 (한국 통화)
- ✅ 랭킹 정렬
- ✅ UI/UX 동작

## 실행 방법

```bash
node server.js
# 브라우저에서 http://localhost:3000 접속
```
