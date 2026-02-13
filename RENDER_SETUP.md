# Render.com 배포 및 설정 가이드

이 문서는 Render.com에 백엔드를 배포하고 프론트엔드를 연결하는 방법을 안내합니다.

## 📋 현재 설정 상태

### 변경 사항
- ✅ **app.js**: Mock 데이터 제거 (709줄 → 335줄)
- ✅ **server.js**: `USE_MOCK_DATA = false` (실제 API 사용)
- ✅ **config.js**: API 엔드포인트 설정 파일 추가
- ✅ **index.html**: config.js 스크립트 추가

### 기본 설정
```javascript
// config.js
API_BASE_URL: 'https://realty-api.onrender.com/api'
```

## 🚀 Render.com 백엔드 배포

### 1단계: Render.com 설정

1. **Render.com 대시보드 접속**
   - https://dashboard.render.com
   - GitHub 계정으로 로그인

2. **Web Service 생성**
   - "New +" → "Web Service" 클릭
   - GitHub 저장소 연결: `Mosframe/realty`

3. **서비스 설정**
   ```
   Name: realty-backend (또는 원하는 이름)
   Environment: Node
   Region: Singapore (또는 가까운 지역)
   Branch: main (또는 사용 중인 브랜치)
   Build Command: (비워두기)
   Start Command: node server.js
   Instance Type: Free
   ```

4. **환경 변수 설정**
   - "Environment" 탭으로 이동
   - 환경 변수 추가:
   
   | Key | Value | 설명 |
   |-----|-------|------|
   | `NAVER_LAND_TOKEN` | (실제 토큰 값) | 네이버 부동산 API 토큰 |
   | `USE_MOCK_DATA` | `false` | Mock 데이터 비활성화 |

5. **배포**
   - "Create Web Service" 클릭
   - 배포 완료까지 약 5-10분 소요

### 2단계: 배포 URL 확인

배포 완료 후 Render가 제공하는 URL 확인:
```
https://your-service-name.onrender.com
```

예시:
```
https://realty-backend.onrender.com
https://realty-api.onrender.com
```

## 🔧 프론트엔드 설정

### 옵션 1: config.js 수정 (권장)

`config.js` 파일을 열고 URL 업데이트:

```javascript
const CONFIG = {
    // Render.com에서 받은 실제 URL로 변경
    API_BASE_URL: 'https://your-service-name.onrender.com/api'
};
```

### 옵션 2: app.js 직접 수정

`app.js` 파일의 3번째 줄 수정:

```javascript
// 변경 전
const API_BASE_URL = typeof CONFIG !== 'undefined' ? CONFIG.API_BASE_URL : 'https://realty-api.onrender.com/api';

// 변경 후
const API_BASE_URL = typeof CONFIG !== 'undefined' ? CONFIG.API_BASE_URL : 'https://your-service-name.onrender.com/api';
```

## 📱 GitHub Pages 재배포

프론트엔드 설정 변경 후:

1. **변경사항 커밋**
   ```bash
   git add config.js
   git commit -m "Update API URL for Render.com"
   git push origin main
   ```

2. **GitHub Pages 자동 배포**
   - GitHub Actions가 자동으로 배포
   - 또는 GitHub 저장소 Settings → Pages에서 확인

## ✅ 동작 확인

### 1. 백엔드 테스트

브라우저에서 직접 접속:
```
https://your-service-name.onrender.com/api/regions/list?cortarNo=0000000000
```

정상 응답 예시:
```json
{
  "regionList": [
    {
      "cortarNo": "1100000000",
      "cortarName": "서울시"
    },
    ...
  ]
}
```

### 2. 프론트엔드 테스트

1. GitHub Pages URL 접속:
   ```
   https://mosframe.github.io/realty/
   ```

2. 브라우저 개발자 도구 열기 (F12)

3. Console 탭 확인:
   - ❌ "Backend API not available" → 설정 오류
   - ❌ "Failed to load resource" → URL 오류
   - ✅ 정상: 오류 메시지 없음

4. 시도 선택:
   - "시도 선택" 드롭다운 클릭
   - 서울시, 경기도, 부산시 등이 표시되어야 함

## 🔍 문제 해결

### 문제 1: "시도 목록을 불러오는데 실패했습니다"

**원인**:
- Render.com URL이 잘못되었거나
- 백엔드가 아직 배포 중이거나
- CORS 설정 문제

**해결**:
1. Render.com 대시보드에서 서비스 상태 확인
2. 배포 로그 확인:
   ```
   Dashboard → Your Service → Logs
   ```
3. config.js의 URL이 정확한지 확인
4. 브라우저 콘솔에서 실제 호출되는 URL 확인

### 문제 2: CORS 오류

**증상**:
```
Access to fetch at 'https://...' from origin 'https://mosframe.github.io' 
has been blocked by CORS policy
```

**해결**:
server.js에 CORS 헤더가 이미 설정되어 있어야 합니다:
```javascript
'Access-Control-Allow-Origin': '*'
```

### 문제 3: Cold Start (첫 요청 지연)

**증상**:
- 첫 번째 요청이 30초 이상 걸림
- "서버 연결을 확인하세요" 오류

**원인**:
- Render.com 무료 플랜은 15분 미사용 시 슬립 모드
- 첫 요청에서 서버 깨우기 시간 필요

**해결**:
- 정상 동작입니다
- 30초 후 다시 시도
- 또는 유료 플랜 사용

### 문제 4: 네이버 API 토큰 만료

**증상**:
```
{"error": "Unauthorized"} 또는 {"error": "Token expired"}
```

**해결**:
1. 네이버 부동산에서 새 토큰 발급
2. Render.com 환경 변수 업데이트:
   ```
   Dashboard → Your Service → Environment → Edit
   NAVER_LAND_TOKEN = (새 토큰)
   ```
3. 서비스 재시작 (자동 또는 Manual Deploy)

## 📊 성능 최적화

### 1. 리전 선택

한국 사용자를 위한 최적 리전:
- **Singapore**: 가장 가까움 (권장)
- **Oregon (US West)**
- **Frankfurt**

### 2. 캐싱 설정

server.js에 캐싱 헤더 추가 가능:
```javascript
res.setHeader('Cache-Control', 'public, max-age=300'); // 5분 캐싱
```

### 3. 슬립 모드 회피

무료 플랜에서 슬립 모드를 피하려면:
- UptimeRobot 같은 서비스로 주기적 ping (5분마다)
- 또는 Railway, Cyclic 같은 슬립 없는 플랫폼 사용

## 🔄 업데이트 및 재배포

### 자동 배포

GitHub에 코드 푸시 시 Render가 자동으로 재배포:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

### 수동 배포

Render 대시보드에서:
```
Your Service → Manual Deploy → Deploy latest commit
```

## 📝 체크리스트

배포 전 확인사항:
- [ ] Render.com 서비스 생성 완료
- [ ] 환경 변수 설정 (NAVER_LAND_TOKEN)
- [ ] 배포 완료 및 URL 확인
- [ ] config.js에 올바른 URL 설정
- [ ] GitHub Pages 재배포
- [ ] 백엔드 API 테스트 (브라우저에서 직접 호출)
- [ ] 프론트엔드 테스트 (시도 목록 로드 확인)
- [ ] 브라우저 콘솔 오류 없음 확인

## 🎯 다음 단계

1. **커스텀 도메인** (선택사항)
   - Render에서 커스텀 도메인 설정
   - config.js 업데이트

2. **모니터링**
   - Render 대시보드에서 로그 모니터링
   - 성능 메트릭 확인

3. **백업**
   - 환경 변수 백업
   - 설정 문서화

## 💡 추가 정보

- [Render 공식 문서](https://render.com/docs)
- [Node.js 배포 가이드](https://render.com/docs/deploy-node-express-app)
- [환경 변수 관리](https://render.com/docs/environment-variables)

---

문제가 있으면 Issue를 생성하거나 PR로 문의해주세요!
