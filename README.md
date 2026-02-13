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

2. 환경 변수 설정 (선택사항)
```bash
cp .env.example .env
# .env 파일을 편집하여 필요한 설정을 변경합니다
# 특히 NAVER_LAND_TOKEN을 실제 토큰으로 업데이트해야 합니다
```

3. 서버 실행
```bash
node server.js
```

4. 브라우저에서 접속
```
http://localhost:3000
```

**참고**: 기본적으로 서버는 mock 데이터를 사용합니다. 실제 Naver Land API를 사용하려면:
- 유효한 Bearer 토큰을 발급받아 환경 변수로 설정
- `server.js`에서 `USE_MOCK_DATA`를 `false`로 변경

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

## 배포 (Deployment)

### GitHub Pages (프론트엔드만)
현재 프론트엔드는 GitHub Pages에서 호스팅되며, mock 데이터를 사용하여 백엔드 없이도 동작합니다.

**접속 URL**: https://mosframe.github.io/realty/

### 백엔드 배포 (선택사항)
실시간 Naver Land API 데이터를 사용하려면 `server.js` 백엔드를 별도로 배포해야 합니다.

**무료 호스팅 옵션**:
- **Render.com** (추천) - 완전 무료, 간단한 설정
- **Railway.app** - $5 무료 크레딧, 슬립 모드 없음
- **Cyclic.sh** - 완전 무료, 슬립 모드 없음
- **Glitch.com** - 초보자 친화적
- **Fly.io** - 전 세계 엣지 네트워크

📖 **상세한 배포 가이드**: [DEPLOYMENT.md](DEPLOYMENT.md) 문서를 참조하세요.

### 빠른 배포 (Render.com)
1. [Render.com](https://render.com) 회원가입
2. GitHub 저장소 연결
3. "New Web Service" 선택
4. Start Command: `node server.js`
5. 환경 변수 `NAVER_LAND_TOKEN` 설정
6. 배포 완료!

## 라이선스

MIT License

## 보안 고려사항

- API 토큰은 환경 변수로 관리하며, 소스 코드에 하드코딩하지 않습니다
- 프로덕션 환경에서는 토큰 갱신 로직을 구현해야 합니다
- `.env` 파일은 `.gitignore`에 포함되어 있으며 버전 관리에서 제외됩니다
