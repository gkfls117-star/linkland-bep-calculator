# 링크랜드 성수 연무장길 BEP 계산기

React + TypeScript + Vite + Tailwind 기반 임차 투자 계산기입니다. GitHub Pages에서 정적 앱으로 공유하고, Google Sheets를 공용 DB로, Google Apps Script Web App을 API 서버처럼 사용합니다. Apps Script URL이 비어 있으면 localStorage 캐시 모드로 동작합니다.

## 주요 기능

- 대시보드, 좌측 입력값 패널, 오프라인/온라인 손익, 합산 투자, 초기 필요 현금, 순투자 회수기간, 2~5년차 양도/권리금 회수, 오프라인 BEP/위험도, 판단 메모
- InfoTip 클릭 토글과 관련 입력 Row 하이라이트
- 시나리오 빠른 비교, 시나리오 비교표
- Google Sheets 시나리오 저장/덮어쓰기/삭제 동기화
- 주변 매장 분석 데이터 불러오기/추가/수정/삭제
- 한국어/KRW, 중국어/CNY 전환과 환율 직접 수정
- 오프라인 고정비, 온라인 변동비/고정비, 임차/초기 투자비, 주변 매장 분석 항목 추가/삭제

## 설치와 실행

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Google Sheet 만드는 법

1. Google Drive에서 새 Google Sheet를 만듭니다.
2. 첫 번째 시트명을 `scenarios`로 바꿉니다.
3. 두 번째 시트명을 `marketStores`로 만듭니다.
4. 아래 컬럼명을 1행에 그대로 입력합니다.

### scenarios

`id, name, dataJson, updatedAt, updatedBy, isDeleted`

`dataJson`에는 계산기의 전체 입력값이 JSON 문자열로 저장됩니다. 삭제는 실제 행 삭제가 아니라 `isDeleted=TRUE`로 처리됩니다.

### marketStores

`id, nameKo, nameZh, categoryKo, categoryZh, monthlyRevenue, peakMonthlyRevenue, avgOrderValue, conversion, margin, noteKo, noteZh, updatedAt, isDeleted`

Apps Script를 처음 실행하면 `marketStores`가 비어 있을 때 아래 기본 데이터가 자동으로 들어갑니다.

- 헤트라스 성수: 월방문객수 150,000명 기준, 월매출 1,500,000,000원, 객단가 50,000원, 전환율 20%, 공헌이익률 65%
- 자연도 소금빵
- 성수 디저트/베이커리형
- 뷰티 플래그십/체험형
- 잡화/라이프스타일형
- 링크랜드 현재 가정

## Apps Script 붙여넣는 법

1. Google Sheet에서 `확장 프로그램 > Apps Script`를 엽니다.
2. 기본 `Code.gs` 내용을 지우고 `apps-script/Code.gs` 전체를 붙여넣습니다.
3. 선택 사항: `프로젝트 설정 > 스크립트 속성`에서 `WRITE_KEY` 값을 추가합니다.
4. `배포 > 새 배포 > 유형 선택 > 웹 앱`을 선택합니다.
5. Web App 배포 설정:
   - Execute as: `Me`
   - Who has access: `Anyone`
6. 배포 후 발급되는 Web App URL을 복사합니다.

주의: `writeKey`는 공개 프론트엔드에 노출될 수 있는 단순 옵션입니다. 실질적인 보안 장치로 과신하지 말고, 민감정보는 시트에 저장하지 마세요.

## Web App URL 넣는 곳

방법 1: 로컬 개발용 `.env.local`

```bash
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/배포_ID/exec
VITE_WRITE_KEY=선택_WRITE_KEY
```

방법 2: GitHub Pages 빌드용 Repository Variables

GitHub 저장소에서 `Settings > Secrets and variables > Actions > Variables`에 아래 값을 추가합니다.

- `VITE_APPS_SCRIPT_URL`: Apps Script Web App URL
- `VITE_WRITE_KEY`: 선택 writeKey

방법 3: 앱 우측 상단 입력칸

배포된 앱의 우측 상단 `Apps Script URL` 칸에 Web App URL을 넣으면 해당 브라우저의 localStorage에 저장됩니다. 여러 사람이 같은 링크에서 바로 동기화하려면 방법 2처럼 빌드 변수로 넣는 방식이 편합니다.

## GitHub Pages 배포 방법

이 저장소에는 GitHub Actions 방식의 Pages 배포 파일이 포함되어 있습니다.

1. GitHub에 저장소를 만들고 코드를 push합니다.
2. 저장소 `Settings > Pages`에서 Source를 `GitHub Actions`로 설정합니다.
3. 필요하면 `Settings > Secrets and variables > Actions > Variables`에 `VITE_APPS_SCRIPT_URL`, `VITE_WRITE_KEY`를 넣습니다.
4. `main` 브랜치에 push하면 `.github/workflows/pages.yml`이 `npm ci`, `npm run build` 후 Pages에 배포합니다.

수동 gh-pages 배포를 쓰려면:

```bash
npm run build
npm run deploy
```

Vite base는 Actions에서 `/${repository-name}/`로 자동 설정됩니다. 수동 배포에서 다른 base가 필요하면 `VITE_BASE_PATH=/저장소명/ npm run build`처럼 지정하세요.

## 윌리엄에게 공유할 링크 예시

저장소가 `your-id/linkland-seongsu-bep`라면:

`https://your-id.github.io/linkland-seongsu-bep/`

윌리엄이 폰에서 시나리오를 저장하거나 주변 매장 데이터를 수정하면 Google Sheets에 반영되고, 내 컴퓨터에서는 새로고침 또는 우측 상단 동기화 버튼으로 최신 수정 시나리오를 불러옵니다. 최신 수정된 시나리오가 맨 위에 정렬되고, 앱 로드 시 첫 번째 시나리오가 자동으로 대시보드에 적용됩니다.

## 계산 기준

- 모든 계산은 KRW 기준으로 수행합니다.
- 중국어/CNY 모드에서는 표시 금액만 환산합니다.
- 기본 환율은 `1 CNY = 217.19 KRW`입니다.
- 환율은 우측 상단에서 수정 가능하며 localStorage에 저장됩니다.
- 오프라인 BEP 매출 = 오프라인 고정비 ÷ 오프라인 공헌이익률
- 필요 월 방문자 = BEP 매출 ÷ 객단가 ÷ 전환율
- 주변 매장 월 구매고객 = 월매출 ÷ 객단가
- 주변 매장 필요 월 방문자 = 월 구매고객 ÷ 전환율
- 주변 매장 일평균 방문자 = 필요 월 방문자 ÷ 30
