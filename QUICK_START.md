# 🚀 빠른 시작 가이드 - 무료 배포

이 가이드는 **5분 안에** 백엔드 서버를 무료로 배포하는 방법을 안내합니다.

## 방법 1: Render.com (가장 추천)

### 1단계: Render 가입
- https://render.com 접속
- GitHub 계정으로 가입

### 2단계: 새 웹 서비스 생성
1. 대시보드에서 **"New +"** 클릭
2. **"Web Service"** 선택
3. GitHub 저장소 연결 (Mosframe/realty)

### 3단계: 설정
```
Name: realty-backend
Environment: Node
Build Command: (비워두기)
Start Command: node server.js
Plan: Free
```

### 4단계: 환경 변수 (선택사항)
- **NAVER_LAND_TOKEN**: (실제 네이버 토큰 - 없으면 mock 데이터 사용)

### 5단계: 배포
- **"Create Web Service"** 클릭
- 5분 정도 기다리면 배포 완료!

### 6단계: URL 확인
배포 완료 후 URL 복사: `https://realty-backend.onrender.com`

### 7단계: 프론트엔드 연결
`app.js` 파일 수정:
```javascript
// 기존
const API_BASE_URL = '/api';

// 변경
const API_BASE_URL = 'https://realty-backend.onrender.com/api';
```

✅ **완료!** 이제 실시간 API를 사용할 수 있습니다.

---

## 방법 2: Railway.app (슬립 모드 없음)

### 1단계: Railway 가입
- https://railway.app 접속
- GitHub 계정으로 가입

### 2단계: 배포
1. **"New Project"** 클릭
2. **"Deploy from GitHub repo"** 선택
3. 저장소 선택 (Mosframe/realty)
4. 자동으로 배포 시작!

### 3단계: 도메인 설정
1. 프로젝트 클릭
2. **"Settings"** → **"Networking"**
3. **"Generate Domain"** 클릭

### 4단계: 환경 변수 (선택사항)
- **"Variables"** 탭에서 추가
- `NAVER_LAND_TOKEN` = (실제 토큰)

✅ **완료!** Railway는 슬립 모드가 없어 항상 빠릅니다.

---

## 방법 3: Cyclic.sh (완전 무료)

### 1단계: Cyclic 가입
- https://cyclic.sh 접속
- GitHub 계정으로 가입

### 2단계: 앱 연결
1. **"Link Your Own"** 클릭
2. GitHub 저장소 선택
3. 자동 배포 시작

### 3단계: 환경 변수
- 대시보드에서 Variables 추가
- `NAVER_LAND_TOKEN` = (실제 토큰)

✅ **완료!** Cyclic은 무료이면서 슬립 모드가 없습니다.

---

## ⚡ 테스트 방법

배포 후 브라우저에서 테스트:

```
https://your-app-url.onrender.com/api/regions/list?cortarNo=0000000000
```

응답 예시:
```json
{
  "regionList": [
    {
      "cortarNo": "1100000000",
      "cortarName": "서울시"
    }
  ]
}
```

---

## 🔧 문제 해결

### 문제: 504 Gateway Timeout
**원인**: 슬립 모드에서 깨어나는 중
**해결**: 30초 후 다시 시도

### 문제: Cannot find module 'mockData'
**원인**: mockData.js 파일이 누락됨
**해결**: 저장소에 mockData.js가 있는지 확인

### 문제: 환경 변수가 인식 안됨
**원인**: 플랫폼마다 설정 방법이 다름
**해결**: 각 플랫폼의 대시보드에서 Variables 탭 확인

---

## 💰 비용

모든 방법이 **완전 무료**입니다!

| 플랫폼 | 무료 용량 | 슬립 모드 |
|--------|-----------|-----------|
| Render | 750시간/월 | ✅ 15분 후 |
| Railway | $5 크레딧 | ❌ 없음 |
| Cyclic | 무제한 | ❌ 없음 |

---

## 📱 다음 단계

1. ✅ 백엔드 배포 완료
2. 📝 `app.js`에서 API URL 변경
3. 🚀 GitHub Pages에 프론트엔드 재배포
4. 🎉 완성!

---

더 자세한 정보는 [DEPLOYMENT.md](DEPLOYMENT.md) 참조하세요!
