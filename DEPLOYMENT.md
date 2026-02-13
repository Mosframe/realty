# 무료 Node.js 서버 호스팅 가이드

이 문서는 `server.js` 백엔드를 무료로 배포할 수 있는 다양한 플랫폼과 배포 방법을 안내합니다.

## 🌟 추천 무료 호스팅 플랫폼

### 1. Render.com (추천 ⭐)

**장점:**
- 완전 무료 티어 제공
- HTTPS 자동 설정
- GitHub 연동으로 자동 배포
- 설정이 간단함
- 월 750시간 무료 (항상 실행 가능)

**단점:**
- 15분 미사용 시 슬립 모드 (첫 요청 시 약간의 지연)

**배포 방법:**
1. [Render.com](https://render.com) 회원가입
2. "New +" → "Web Service" 선택
3. GitHub 저장소 연결
4. 설정:
   - **Name**: realty-api
   - **Environment**: Node
   - **Build Command**: (비워두기 또는 `npm install`)
   - **Start Command**: `node server.js`
   - **Plan**: Free
5. 환경 변수 추가:
   - `NAVER_LAND_TOKEN`: (실제 토큰 값)
6. "Create Web Service" 클릭

배포 후 URL: `https://realty-api.onrender.com`

**app.js 수정:**
```javascript
const API_BASE_URL = 'https://realty-api.onrender.com/api';
```

---

### 2. Railway.app

**장점:**
- $5 무료 크레딧 제공 (매월)
- 빠른 배포 속도
- GitHub 자동 배포
- 슬립 모드 없음

**단점:**
- 무료 크레딧 소진 시 과금 가능

**배포 방법:**
1. [Railway.app](https://railway.app) 회원가입
2. "New Project" → "Deploy from GitHub repo"
3. 저장소 선택
4. 자동으로 Node.js 프로젝트 감지
5. 환경 변수 추가:
   - `NAVER_LAND_TOKEN`: (실제 토큰 값)
6. 배포 완료 후 도메인 설정

**app.js 수정:**
```javascript
const API_BASE_URL = 'https://realty-api.up.railway.app/api';
```

---

### 3. Vercel (서버리스 함수)

**장점:**
- GitHub Pages와 같은 회사
- 무제한 무료 배포
- 매우 빠른 성능
- 자동 HTTPS

**단점:**
- 서버리스 함수로 변환 필요
- 10초 실행 제한

**배포 방법:**
1. `server.js`를 서버리스 함수로 변환 필요
2. `vercel.json` 설정 파일 생성:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/$1.js"
    }
  ]
}
```

3. [Vercel](https://vercel.com) 회원가입
4. GitHub 저장소 연결
5. 자동 배포

---

### 4. Fly.io

**장점:**
- 무료 티어 제공
- 전 세계 엣지 네트워크
- Docker 기반 배포
- 슬립 모드 없음

**단점:**
- 초기 설정이 복잡할 수 있음

**배포 방법:**
1. [Fly.io](https://fly.io) 회원가입
2. Fly CLI 설치:
```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

3. 로그인:
```bash
fly auth login
```

4. 앱 생성 및 배포:
```bash
fly launch
fly secrets set NAVER_LAND_TOKEN="your_token_here"
fly deploy
```

---

### 5. Glitch.com

**장점:**
- 브라우저에서 직접 코드 편집
- 즉시 배포 및 테스트
- 협업 기능
- 초보자 친화적

**단점:**
- 5분 미사용 시 슬립 모드
- 월 1000시간 제한

**배포 방법:**
1. [Glitch.com](https://glitch.com) 회원가입
2. "New Project" → "Import from GitHub"
3. 저장소 URL 입력
4. `.env` 파일에 환경 변수 추가:
```
NAVER_LAND_TOKEN=your_token_here
```
5. 자동으로 실행됨

배포 URL: `https://your-project-name.glitch.me`

---

### 6. Cyclic.sh

**장점:**
- 완전 무료
- AWS 기반
- GitHub 자동 배포
- 슬립 모드 없음

**단점:**
- 상대적으로 신생 서비스

**배포 방법:**
1. [Cyclic.sh](https://cyclic.sh) 회원가입
2. "Link Your Own" → GitHub 저장소 연결
3. 환경 변수 설정
4. 자동 배포

---

### 7. Heroku (유료 전환됨)

⚠️ **주의**: Heroku는 2022년 11월부터 무료 티어를 제공하지 않습니다.

---

## 📋 배포 전 체크리스트

### server.js 수정 사항:

1. **포트 설정 수정** (대부분의 플랫폼은 동적 포트 사용):
```javascript
const PORT = process.env.PORT || 3000;
```

2. **CORS 설정 추가** (필요시):
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

### package.json 확인:

```json
{
  "name": "realty",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=14.x"
  }
}
```

---

## 🚀 빠른 시작 (Render.com 추천)

가장 간단한 배포 방법:

1. **GitHub에 코드 푸시**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Render.com 배포** (5분 소요)
   - [Render.com](https://render.com) 가입
   - GitHub 연결
   - "New Web Service" 클릭
   - 저장소 선택
   - `node server.js` 입력
   - 배포 완료!

3. **프론트엔드 연결**
   - `app.js`에서 `API_BASE_URL` 수정
   - GitHub Pages에 다시 배포

---

## 💡 하이브리드 배포 (현재 상태)

**현재 구조:**
- **프론트엔드**: GitHub Pages (무료, 정적 파일)
- **백엔드**: 선택 가능 (위의 플랫폼 중 선택)
- **데이터**: Mock data 내장 (백엔드 없이도 동작)

**장점:**
- 백엔드가 없어도 프론트엔드는 mock 데이터로 동작
- 백엔드 배포 시 실시간 API 데이터 사용 가능
- 비용 효율적

**배포 옵션:**

### 옵션 1: 프론트엔드만 (현재 상태, 무료)
```
GitHub Pages ─────> Mock Data
```
✅ 완전 무료
✅ 설정 필요 없음
❌ 실시간 데이터 없음

### 옵션 2: 프론트엔드 + 백엔드 (권장)
```
GitHub Pages ─────> Render.com ─────> Naver API
                    (백엔드)
```
✅ 실시간 데이터
✅ 무료 (Render.com)
❌ 초기 요청 시 약간의 지연

---

## 🔧 트러블슈팅

### 문제: 배포 후 500 에러
**해결책:**
- 환경 변수가 올바르게 설정되었는지 확인
- 로그 확인: `fly logs` 또는 Render 대시보드에서 확인

### 문제: CORS 에러
**해결책:**
- `server.js`에 CORS 헤더 추가
- 또는 프록시 미들웨어 사용

### 문제: 슬립 모드 (Cold Start)
**해결책:**
- UptimeRobot 같은 서비스로 주기적으로 ping
- 또는 슬립 모드가 없는 플랫폼 선택 (Railway, Cyclic)

---

## 📊 플랫폼 비교표

| 플랫폼 | 무료 티어 | 슬립 모드 | 배포 난이도 | 추천도 |
|--------|-----------|-----------|-------------|--------|
| **Render** | ✅ 750h/월 | ✅ 15분 후 | ⭐⭐⭐⭐⭐ 쉬움 | ⭐⭐⭐⭐⭐ |
| **Railway** | ✅ $5 크레딧 | ❌ 없음 | ⭐⭐⭐⭐ 쉬움 | ⭐⭐⭐⭐ |
| **Vercel** | ✅ 무제한 | ❌ 없음 | ⭐⭐⭐ 보통 | ⭐⭐⭐⭐ |
| **Fly.io** | ✅ 제한적 | ❌ 없음 | ⭐⭐ 어려움 | ⭐⭐⭐ |
| **Glitch** | ✅ 1000h/월 | ✅ 5분 후 | ⭐⭐⭐⭐⭐ 쉬움 | ⭐⭐⭐ |
| **Cyclic** | ✅ 무제한 | ❌ 없음 | ⭐⭐⭐⭐ 쉬움 | ⭐⭐⭐⭐ |

---

## 🎯 결론 및 추천

**초보자에게 추천**: Render.com 또는 Glitch.com
- 가장 쉽고 직관적
- 문서화가 잘 되어 있음

**프로덕션 용도**: Railway.app 또는 Cyclic.sh
- 슬립 모드 없음
- 안정적인 성능

**현재 프로젝트 상태**: 
- GitHub Pages에서 mock 데이터로 이미 동작 중
- 실시간 데이터가 필요하면 Render.com에 백엔드 배포 권장

---

## 📚 참고 자료

- [Render 문서](https://render.com/docs)
- [Railway 문서](https://docs.railway.app)
- [Vercel 문서](https://vercel.com/docs)
- [Fly.io 문서](https://fly.io/docs)
- [Glitch 문서](https://glitch.com/help)
- [Cyclic 문서](https://docs.cyclic.sh)

---

## 💬 추가 질문이 있으신가요?

이슈를 생성하거나 PR을 통해 문의해주세요!
