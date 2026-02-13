# https.request 타임아웃 문제 해결

## 문제 설명
`https.request` 함수에서 응답이 없는 문제가 발생했습니다.

### 근본 원인
- `https.request` 호출 시 타임아웃 설정이 없었음
- 외부 API가 응답하지 않을 때 요청이 무한정 대기
- 타임아웃 이벤트 핸들러가 없어 적절한 에러 처리 불가능

## 해결 방법

### 1. 타임아웃 옵션 추가
`server.js`의 `proxyAPIRequest` 함수에서 https.request 옵션에 타임아웃 설정 추가:

```javascript
const options = {
    hostname: API_BASE_URL,
    path: apiPath,
    method: 'GET',
    timeout: 30000, // 30초 타임아웃 추가
    headers: {
        // ... 기존 헤더들
    }
};
```

### 2. 타임아웃 이벤트 핸들러 추가
요청이 타임아웃될 때 적절히 처리하는 핸들러 추가:

```javascript
// Handle request timeout
proxyReq.on('timeout', () => {
    console.error('Request timeout - no response received within 30 seconds');
    proxyReq.destroy(); // 요청 중단 및 리소스 정리
    res.writeHead(504, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ 
        error: 'Gateway Timeout',
        message: 'The external API did not respond in time'
    }));
});
```

## 수정 내용

### server.js
- **라인 76**: `timeout: 30000` 옵션 추가
- **라인 121-133**: 타임아웃 이벤트 핸들러 추가

## 효과

### Before (수정 전)
```
클라이언트 요청 → https.request → 외부 API 무응답 → 무한 대기 ❌
```

### After (수정 후)
```
클라이언트 요청 → https.request → 외부 API 무응답 → 30초 후 타임아웃 → 504 에러 응답 ✅
```

## 개선 사항

1. **무한 대기 방지**: 요청이 더 이상 무한정 대기하지 않음
2. **명확한 에러 메시지**: 30초 후 명확한 타임아웃 에러 발생
3. **적절한 HTTP 상태 코드**: 504 Gateway Timeout 상태 코드 반환
4. **리소스 정리**: `proxyReq.destroy()`로 적절한 리소스 해제
5. **사용자 경험 개선**: 사용자가 무한 로딩 대신 에러 메시지를 받음

## 타임아웃 값 설정

- **현재 설정**: 30초 (30000ms)
- **이유**: 네이버 부동산 API는 일반적으로 빠르게 응답하지만, 네트워크 지연을 고려하여 충분한 시간 제공
- **조정 가능**: 필요시 `timeout` 값을 변경하여 조정 가능

## 테스트

✅ JavaScript 구문 검사 통과
✅ 서버 정상 시작 확인
✅ HTTP 요청 정상 동작 확인

## 관련 파일

- `server.js` - 프록시 서버 로직

## 추가 고려사항

타임아웃 시간을 환경 변수로 설정하고 싶다면:

```javascript
const REQUEST_TIMEOUT = process.env.REQUEST_TIMEOUT || 30000;

const options = {
    // ...
    timeout: REQUEST_TIMEOUT,
    // ...
};
```

## 참고 자료

- [Node.js https.request 문서](https://nodejs.org/api/https.html#https_https_request_options_callback)
- [HTTP 504 Gateway Timeout](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/504)
