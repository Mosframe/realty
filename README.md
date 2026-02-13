# 아파트 실거래가 순위 (Apartment Real Transaction Price Rankings)

부동산 아파트 실거래가 순위를 조회할 수 있는 웹 애플리케이션입니다.

## 기능 (Features)

- ✅ 지역별 필터링 (전국, 시, 구, 동 단위)
- ✅ 평형대별 필터링 (예: 20평~25평)
- ✅ 거래일자 범위 선택 (시작일 ~ 종료일)
- ✅ 순위 개수 선택 (10개 ~ 100개)
- ✅ 아파트별 체크박스를 통한 활성/비활성 기능
- ✅ 표와 그래프 뷰 전환
- ✅ 그래프를 통한 아파트 간 가격 비교
- ✅ 싱글 페이지 애플리케이션 (SPA)
- ✅ 다중 순위표 동적 추가 기능
- ✅ 로딩 인디케이터

## 사용 방법 (How to Use)

1. 웹 브라우저에서 `index.html` 파일을 엽니다.
2. "순위표 추가" 버튼을 클릭하여 새로운 순위표를 생성합니다.
3. 원하는 필터 조건을 설정합니다:
   - 지역: 전국, 시, 구, 동 단위로 선택
   - 평형대: 최소/최대 평수 입력
   - 거래일자: 시작일과 종료일 선택
   - 순위 개수: 10~100개 선택
4. "검색" 버튼을 클릭하여 결과를 조회합니다.
5. 체크박스를 사용하여 특정 아파트를 활성/비활성합니다.
6. "표/그래프" 버튼을 클릭하여 뷰를 전환합니다.
7. 필요한 만큼 순위표를 추가할 수 있습니다.

## GitHub Pages 배포 (Deployment)

이 프로젝트는 GitHub Pages를 통해 배포할 수 있습니다:

1. Repository Settings로 이동
2. Pages 섹션 선택
3. Source를 "Deploy from a branch" 선택
4. Branch를 "main" (또는 현재 브랜치) 선택
5. 저장 후 배포된 URL 확인

**참고**: 그래프 기능은 Chart.js CDN을 사용합니다. CDN 접근이 차단된 환경에서는 그래프 기능이 작동하지 않을 수 있습니다. 이 경우 Chart.js를 로컬에 다운로드하여 사용하거나 다른 CDN을 사용할 수 있습니다.

**Note**: The graph feature uses the Chart.js CDN. If CDN access is blocked in your environment, the chart feature may not work. In this case, you can download Chart.js locally or use an alternative CDN.

## 기술 스택 (Technology Stack)

- HTML5
- CSS3 (Flexbox, Grid, Animations)
- Vanilla JavaScript (ES6+)
- Chart.js (그래프 라이브러리)

## 파일 구조 (File Structure)

```
realty/
├── index.html      # 메인 HTML 파일
├── styles.css      # 스타일시트
├── app.js          # 메인 애플리케이션 로직
├── data.js         # 샘플 데이터
├── README.md       # 프로젝트 문서
└── .gitignore      # Git 제외 파일 목록
```

## 라이센스 (License)

MIT License
