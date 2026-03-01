# 부동산 실거래가 랭킹

네이버 부동산 API를 활용한 아파트 실거래가 랭킹 조회 앱입니다.

## 기능

- 시도 → 시/군/구 → 동 단계별 지역 선택 (동 미선택 시 구 전체 조회)
- **평형 범위 필터** (예: 20~27평)
- **거래일자 범위 필터**
- 가격순 랭킹 표시 (상위 3개 강조)
- 가격 한국식 표기 (예: 14억 2,000만원)
- **JWT 토큰 자동 갱신** (만료 10분 전 자동 갱신, 수동 갱신 버튼)
- 우측 상단 토큰 만료일 실시간 표시

## 실행 방법

### Node.js로 실행

```bash
npm start
```

서버 시작 시 브라우저가 자동으로 열립니다 (`http://localhost:3000`).

### EXE로 실행

```bash
npm run build
```

`dist/realty.exe` 생성 후, `config.txt`를 exe와 같은 폴더에 두고 실행합니다.

## 설정 (config.txt)

exe 또는 server.js와 같은 폴더에 `config.txt`를 생성합니다.

```
# 네이버 부동산 API 토큰 (자동 갱신됨)
NAVER_LAND_TOKEN=eyJ...

# 네이버 쿠키 - 필수: NNB, NID_AUT, BUC, NID_SES
# 브라우저 DevTools > Application > Cookies에서 복사
NAVER_COOKIE=NNB=...; NID_AUT=...; BUC=...; NID_SES=...

# 서버 포트 (기본: 3000)
PORT=3000
```

> **쿠키 갱신**: `NID_SES` 만료 시 네이버에 재로그인 후 쿠키를 다시 복사해야 합니다.
> 쿠키가 유효한 동안 JWT 토큰은 자동으로 갱신됩니다.

## 프로젝트 구조

```
realty/
├── server.js       # Node.js 서버 (API 프록시 + 토큰 자동 갱신)
├── index.html      # UI
├── app.js          # 클라이언트 로직
├── style.css       # 스타일
├── config.txt      # 환경 설정 (git 제외)
├── mockData.js     # 테스트용 mock 데이터
└── package.json    # 프로젝트 설정 + exe 빌드 스크립트
```

## 개선사항
- 저장된 오래된 호가 삭제
- 단지별 최고평단가만 > 최고가만
- 호가와 실거래가 병합
- 호가에 안잡히는 버그 수정
- 검색속도 개선
- 과거 모든 거래내용 취합하기
- 엑셀 출력시 클립보드 처럼 데이터셋으로 변환
- 최근거래가 전달에 비해 오른값인지 내린값인지
- 호가일때 각종 이름 변경
- 쿠키 무작위 설정
- 직거래 제거하기
- 조회중에는 세부조회 클릭 금지
- 조회 일시정지 기능
- 서비스 권한 설정

## 활용
- 최신 실거래가 목록 확인
- 특정 구간에 실거래가 확인
- 지역내 대장아파트 찾기
- 두지역의 현재 우위 비교하기
- 두지역의 변화량 비교하기

## 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js (http 모듈)
- **API**: 네이버 부동산 API (프록시)
- **빌드**: pkg (node18-win-x64)

## 라이선스

MIT License

