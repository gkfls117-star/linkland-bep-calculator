# 링크랜드 BEP 계산기 실사용 문제 발굴 / 자체 수정 / UI 정리 플랜

## 목적

이 플랜은 이미 알고 있는 수정 사항을 체크하는 문서가 아니다.

목적은 계산기를 실제 투자 검토자가 쓰듯이 끝까지 사용하면서 새로 드러나는 문제를 최대한 많이 발견하고, 발견한 문제를 자체적으로 테스트-우선 방식으로 고치고, 마지막에 UI를 깔끔하고 일관된 상태로 정리하는 것이다.

최종 완료 기준은 다음 세 가지다.

- 실사용 흐름에서 발견된 `OPEN DEFECT`가 0개다.
- 모든 결함은 RED→GREEN 테스트와 실제 브라우저/HTTP 증거로 닫혔다.
- 검수 에이전트가 계산 정확성, 데이터 라우팅, 저장/동기화, 화면 가시성을 최종 승인했다.

## 역할

### 테스트 사용자

실제 사용자처럼 계산기를 막 써보는 역할이다. 정해진 happy path만 따라가지 않는다.

해야 할 일:
- 처음 보는 사람처럼 앱을 열고, 무엇을 입력해야 하는지 이해되는지 본다.
- 숫자를 정상값, 극단값, 빈값, 이상한 순서로 넣어본다.
- 시나리오 저장/불러오기/삭제를 반복한다.
- 동적 비용 항목을 추가/수정/삭제하고, 비율/금액 전환을 건드린다.
- 주변 매장 분석을 추가/수정/삭제한다.
- 한국어/KRW와 중국어/CNY를 오가고 환율을 바꾼다.
- 모바일/태블릿/데스크톱에서 직접 본다.
- 새로고침, localStorage 잔여 데이터, Apps Script 실패 상황을 시험한다.
- 헷갈림, 깨짐, 숫자 불신, 입력 불편, 화면 지저분함을 모두 결함으로 기록한다.

### 검수 에이전트

테스트 사용자가 발견한 문제와 수정 결과를 독립 검증하는 역할이다.

해야 할 일:
- 화면 숫자가 `src/lib/calc.ts` 계산 결과와 맞는지 검산한다.
- 입력값이 대시보드, 시나리오 비교, 주변 매장 분석, 저장 데이터에 같은 기준으로 들어가는지 확인한다.
- 결함별 RED→GREEN 테스트 증거가 있는지 확인한다.
- 실제 브라우저/HTTP 증거가 있는지 확인한다.
- UI 수정이 기능을 숨기거나 흐름을 더 어렵게 만들지 않았는지 확인한다.
- 승인하면 `CLOSED DEFECT-###`, 부족하면 `REOPENED DEFECT-###`로 돌려보낸다.

## 기록 위치

- 플랜: `plans/linkland-bep-user-review-loop.md`
- 결함 ledger: `.omo/ulw-loop/linkland-bep-user-review-loop-ledger.md`
- 증거: `.omo/ulw-loop/evidence/`
- 최종 승인 파일: `.omo/ulw-loop/evidence/final-reviewer-approval.json`

## 결함 처리 규칙

모든 발견 문제는 아래 흐름을 따른다.

1. 테스트 사용자가 `OPEN DEFECT-###`로 기록한다.
2. 결함에는 재현 단계, 기대값, 실제값, 화면/JSON/HTTP 증거를 붙인다.
3. 수정 전 반드시 regression test를 만든다.
4. 해당 test가 RED로 실패하는 것을 기록한다.
5. 최소한으로 production code를 수정한다.
6. 같은 test가 GREEN으로 통과하는 것을 기록한다.
7. 실제 브라우저 또는 HTTP QA를 다시 실행한다.
8. 검수 에이전트가 증거를 보고 닫거나 재오픈한다.

테스트 이름 규칙:

- Unit/component: `DEFECT-### Given ... When ... Then ...`
- Browser: `DEFECT-### @defect-### Given ... When ... Then ...`
- Ledger: `OPEN DEFECT-###`, `CLOSED DEFECT-###`, `REOPENED DEFECT-###`

커밋은 하지 않는다. 사용자가 명시적으로 요청할 때만 커밋한다.

## 공통 실행 명령

기본 검증:

```bash
npm test
npm run build
```

브라우저 QA:

```bash
npm install -D @playwright/test
npx playwright install chrome
npx playwright test tests/e2e/linkland-user-review-loop.spec.ts --project=chrome --grep "@tag" --reporter=line
npx playwright test tests/e2e/linkland-responsive-visual.spec.ts --project=chrome --grep "@tag" --reporter=line
npx playwright test tests/e2e/linkland-defect-regressions.spec.ts --project=chrome --grep "DEFECT-###" --reporter=line
```

Task 1에서 `@playwright/test`가 이미 있으면 재설치하지 않는다. 없으면 `package.json`과 `package-lock.json`에 반영한다. Chrome 실행은 로컬 Chrome channel을 우선 사용하고, 실패하면 `npx playwright install chrome`을 실행해 설치 로그를 evidence에 남긴다.

Apps Script fixture:

```bash
$fixture = Start-Process -FilePath node -ArgumentList "tests/fixtures/apps-script-fixture.mjs --host 127.0.0.1 --port 4873 --mode ok" -WindowStyle Hidden -PassThru
curl.exe -i "http://127.0.0.1:4873/exec?action=listScenarios&callback=qaCb"
curl.exe -i "http://127.0.0.1:4873/exec?action=listMarketStores&callback=qaCb"
curl.exe -i "http://127.0.0.1:4873/__shutdown"
Wait-Process -Id $fixture.Id -Timeout 5
```

오류 모드:

```bash
$fixture = Start-Process -FilePath node -ArgumentList "tests/fixtures/apps-script-fixture.mjs --host 127.0.0.1 --port 4873 --mode error" -WindowStyle Hidden -PassThru
curl.exe -i "http://127.0.0.1:4873/exec?action=listScenarios&callback=qaCb"
curl.exe -i "http://127.0.0.1:4873/__shutdown"
Wait-Process -Id $fixture.Id -Timeout 5
```

Fixture cleanup PASS 기준:
- `__shutdown` 응답 status가 200이다.
- body에 `{"status":"ok","shutdown":true}`가 포함된다.
- `Wait-Process` 뒤 fixture process가 종료된다.
- 종료 후 같은 포트 요청이 연결 실패로 끝난다.

## Wave 1. 실사용 QA 장치 만들기

목적: 문제를 제대로 발견하고 증거를 남길 수 있는 장치를 먼저 만든다.

병렬 가능:
- Task 1. Playwright Chrome QA harness
- Task 2. 결함 ledger/checker
- Task 3. 계산 oracle / 화면값 추출기
- Task 4. localStorage/Apps Script fixture

### Task 1. Playwright Chrome QA harness

만들 파일:
- `package.json`
- `package-lock.json`
- `playwright.config.ts`
- `tests/e2e/linkland-user-review-loop.spec.ts`
- `tests/e2e/linkland-responsive-visual.spec.ts`
- `tests/e2e/linkland-defect-regressions.spec.ts`
- `tests/e2e/helpers/*`
- `.omo/ulw-loop/evidence/.gitkeep`

성공 기준:
- `@playwright/test`가 없으면 설치되어 `package.json`/`package-lock.json`에 반영된다.
- Chrome channel 실행이 가능하거나 `npx playwright install chrome` 설치 로그가 evidence에 남는다.
- 실제 Chrome으로 앱을 열 수 있다.
- 초기 화면 screenshot이 저장된다.
- 콘솔 에러가 JSON으로 저장된다.
- 주요 영역이 없는 경우 테스트가 실패한다.

QA:

```bash
npm install -D @playwright/test
npx playwright install chrome
npx playwright test tests/e2e/linkland-user-review-loop.spec.ts --project=chrome --grep "@qa-harness" --reporter=line
```

Evidence:
- `.omo/ulw-loop/evidence/task-1-home.png`
- `.omo/ulw-loop/evidence/task-1-console.json`
- `.omo/ulw-loop/evidence/task-1-playwright-install.txt`

### Task 2. 결함 ledger/checker

만들 파일:
- `.omo/ulw-loop/linkland-bep-user-review-loop-ledger.md`
- `tests/qa/check-review-ledger.mjs`
- `tests/qa/fixtures/*`

성공 기준:
- ledger에 `테스트 사용자`, `검수 에이전트`, `OPEN DEFECT`, `CLOSED DEFECT`, `REOPENED DEFECT`, `REVIEWER APPROVED` 섹션이 있다.
- checker가 열린 결함, 증거 누락, RED/GREEN 누락, reviewer 승인 누락을 잡는다.

QA:

```bash
node tests/qa/check-review-ledger.mjs --ledger .omo/ulw-loop/linkland-bep-user-review-loop-ledger.md --expect-empty-open --require-roles
```

Evidence:
- `.omo/ulw-loop/evidence/task-2-ledger-check.txt`

### Task 3. 계산 oracle / 화면값 추출기

만들 파일:
- `tests/e2e/helpers/calculationOracle.ts`
- `tests/e2e/helpers/readVisibleValues.ts`
- 필요 시 `src/lib/calc.defect.test.ts`

성공 기준:
- 화면에서 읽은 합산 매출, 오프라인 손익, 온라인 손익, 합산/투자, 회수표, 주변 매장 지표를 계산 함수 결과와 비교할 수 있다.
- KRW/CNY 표시값을 같은 KRW 원천값 기준으로 검산할 수 있다.

QA:

```bash
npx playwright test tests/e2e/linkland-user-review-loop.spec.ts --project=chrome --grep "@oracle-smoke" --reporter=line
```

Evidence:
- `.omo/ulw-loop/evidence/task-3-oracle-smoke.json`

### Task 4. localStorage / Apps Script fixture

만들 파일:
- `tests/fixtures/apps-script-fixture.mjs`
- `src/lib/storage.defect.test.ts`
- `src/lib/sheetsApi.defect.test.ts`

성공 기준:
- 정상/오류 Apps Script 응답을 로컬에서 재현할 수 있다.
- localStorage에 낡거나 깨진 데이터가 있어도 앱이 복구되는지 시험할 수 있다.
- fixture 서버 종료 receipt가 남는다.

QA:

```bash
$fixture = Start-Process -FilePath node -ArgumentList "tests/fixtures/apps-script-fixture.mjs --host 127.0.0.1 --port 4873 --mode ok" -WindowStyle Hidden -PassThru
curl.exe -i "http://127.0.0.1:4873/exec?action=listScenarios&callback=qaCb"
curl.exe -i "http://127.0.0.1:4873/__shutdown"
Wait-Process -Id $fixture.Id -Timeout 5
```

Evidence:
- `.omo/ulw-loop/evidence/task-4-http-fixture.txt`
- `.omo/ulw-loop/evidence/task-4-http-fixture-cleanup.txt`

## Wave 2. 테스트 사용자 탐색 라운드

목적: 기능을 정해진 시나리오가 아니라 실제 사용처럼 흔들어 결함을 찾는다.

병렬 가능:
- Task 5. 첫 사용 / 투자 입력 탐색
- Task 6. 시나리오 저장/삭제/새로고침 탐색
- Task 7. 동적 항목 / 투자비 / 회수 가능 탐색
- Task 8. 주변 매장 분석 탐색
- Task 9. 언어/통화/환율/모바일 탐색
- Task 10. 오프라인/Sheets 실패/잔여 캐시 탐색

각 Task는 결함을 고치는 단계가 아니라 발견하는 단계다. 발견 즉시 ledger에 `OPEN DEFECT-###`로 기록한다.

### Task 5. 첫 사용 / 투자 입력 탐색

테스트 사용자 행동:
- 앱을 처음 열고 무엇을 입력해야 하는지 본다.
- 월 방문객, 전환율, 객단가, 온라인 월매출, 원가율, 투자비를 입력한다.
- 계산 결과를 보고 “왜 이 숫자인지” 이해되는지 확인한다.
- 극단값을 넣는다: 0명, 100% 전환율, 100% 원가율, 큰 매출, 음수 입력 시도, 빈값.

QA:

```bash
npx playwright test tests/e2e/linkland-user-review-loop.spec.ts --project=chrome --grep "@explore-core-inputs" --reporter=line
```

결함 예시:
- 입력을 바꿨는데 대시보드 일부만 갱신됨
- 회수기간이 현실과 맞지 않아 보임
- 원가율/이익률 용어가 혼동됨
- 큰 숫자가 카드 밖으로 튀어나감

Evidence:
- `.omo/ulw-loop/evidence/task-5-core-inputs.md`
- `.omo/ulw-loop/evidence/task-5-core-inputs.png`

### Task 6. 시나리오 저장/삭제/새로고침 탐색

테스트 사용자 행동:
- 다른이름 저장을 여러 번 누른다.
- 같은 이름/빈 이름/긴 이름/중국어 이름으로 저장한다.
- 덮어쓰기 후 새로고침한다.
- 삭제 후 quick/table에서 사라지는지 본다.
- 삭제한 시나리오가 새로고침 후 되살아나지 않는지 본다.

QA:

```bash
npx playwright test tests/e2e/linkland-user-review-loop.spec.ts --project=chrome --grep "@explore-scenarios" --reporter=line
```

Evidence:
- `.omo/ulw-loop/evidence/task-6-scenarios.md`
- `.omo/ulw-loop/evidence/task-6-scenarios-localstorage.json`

### Task 7. 동적 항목 / 투자비 / 회수 가능 탐색

테스트 사용자 행동:
- 오프라인 고정비 항목 추가/이름수정/금액수정/비율전환/삭제를 반복한다.
- 온라인 비용 항목 추가를 해보고, 플랫폼/PG와 온라인 광고비 잠금이 자연스러운지 확인한다.
- 임차/초기 투자비에서 회수 가능을 켰다 껐다 한다.
- 회수표와 투자비/회수 카드 숫자를 비교한다.

QA:

```bash
npx playwright test tests/e2e/linkland-user-review-loop.spec.ts --project=chrome --grep "@explore-dynamic-items" --reporter=line
```

Evidence:
- `.omo/ulw-loop/evidence/task-7-dynamic-items.md`
- `.omo/ulw-loop/evidence/task-7-dynamic-items.png`

### Task 8. 주변 매장 분석 탐색

테스트 사용자 행동:
- 새 매장을 추가한다.
- 월매출, 피크 월매출, 객단가, 전환율, 공헌이익률을 수정한다.
- 매우 낮은 객단가, 0 전환율, 높은 매출을 넣는다.
- 링크랜드 대비 비율이 현재 링크랜드 오프라인 매출 기준인지 확인한다.
- 매장을 삭제하고 새로고침한다.

QA:

```bash
npx playwright test tests/e2e/linkland-user-review-loop.spec.ts --project=chrome --grep "@explore-market" --reporter=line
```

Evidence:
- `.omo/ulw-loop/evidence/task-8-market.md`
- `.omo/ulw-loop/evidence/task-8-market.json`

### Task 9. 언어/통화/환율/모바일 탐색

테스트 사용자 행동:
- KRW에서 CNY로 바꾼다.
- 환율을 바꾼다.
- 다시 KRW로 돌아온다.
- 모바일 폭에서 모든 섹션을 훑는다.
- 중국어 텍스트가 버튼/카드/table에서 잘리는지 본다.

QA:

```bash
npx playwright test tests/e2e/linkland-user-review-loop.spec.ts --project=chrome --grep "@explore-language-mobile" --reporter=line
```

Evidence:
- `.omo/ulw-loop/evidence/task-9-language-mobile.md`
- `.omo/ulw-loop/evidence/task-9-ko-mobile.png`
- `.omo/ulw-loop/evidence/task-9-zh-mobile.png`

### Task 10. 오프라인 / Sheets 실패 / 잔여 캐시 탐색

테스트 사용자 행동:
- Apps Script URL이 비어 있는 상태로 사용한다.
- 잘못된 Apps Script URL을 넣고 저장을 시도한다.
- fixture 오류 모드에서 list/save/delete를 시도한다.
- localStorage에 오래된 시나리오/깨진 JSON/삭제된 row를 넣고 앱을 연다.

QA:

```bash
npx playwright test tests/e2e/linkland-user-review-loop.spec.ts --project=chrome --grep "@explore-sync-cache-failure" --reporter=line
```

HTTP QA:

```bash
$fixture = Start-Process -FilePath node -ArgumentList "tests/fixtures/apps-script-fixture.mjs --host 127.0.0.1 --port 4873 --mode error" -WindowStyle Hidden -PassThru
curl.exe -i "http://127.0.0.1:4873/exec?action=listScenarios&callback=qaCb"
curl.exe -i "http://127.0.0.1:4873/__shutdown"
Wait-Process -Id $fixture.Id -Timeout 5
```

Evidence:
- `.omo/ulw-loop/evidence/task-10-sync-cache.md`
- `.omo/ulw-loop/evidence/task-10-sync-cache-http.txt`
- `.omo/ulw-loop/evidence/task-10-sync-cache-cleanup.txt`

## Wave 3. 결함 자체 수정 루프

목적: Wave 2에서 발견된 모든 문제를 스스로 고친다.

반복 절차:

1. ledger에서 가장 심각한 `OPEN DEFECT-###`를 고른다.
2. 결함 유형을 분류한다.
   - calculation
   - data-routing
   - persistence
   - sync
   - ui-functional
   - ui-visual
   - responsive
   - bilingual
   - accessibility
3. regression test를 먼저 만든다.
4. RED를 기록한다.
5. 최소 수정한다.
6. GREEN을 기록한다.
7. 브라우저/HTTP QA를 다시 실행한다.
8. 검수 에이전트가 닫거나 재오픈한다.

결함별 수정 대상 예시:

- 계산 문제: `src/lib/calc.ts`, `src/lib/calc.defect.test.ts`
- 입력 라우팅 문제: `src/App.tsx`, `src/components/InputPanel.tsx`, `src/App.user-flow.test.tsx`
- 대시보드 표시 문제: `src/components/Dashboard.tsx`, `tests/e2e/linkland-defect-regressions.spec.ts`
- 동적 항목 문제: `src/components/DynamicItemEditor.tsx`, `src/components/DynamicItemEditor.defect.test.tsx`
- 저장 문제: `src/lib/storage.ts`, `src/App.scenarios.defect.test.tsx`
- Sheets 문제: `src/lib/sheetsApi.ts`, `apps-script/Code.gs`, `src/lib/sheetsApi.defect.test.ts`
- 시장 분석 문제: `src/components/MarketAnalysis.tsx`, `src/components/MarketAnalysis.defect.test.tsx`
- UI 문제: 관련 component + `tests/e2e/linkland-responsive-visual.spec.ts`

결함 1개당 필수 증거:
- RED command output
- GREEN command output
- 실제 브라우저 또는 HTTP evidence
- cleanup receipt
- 검수 에이전트 decision

## Wave 4. UI 정리 전용 라운드

목적: 기능 결함을 모두 닫은 뒤, 화면을 실제로 보기 좋고 사용하기 쉽게 정리한다.

이 단계는 단순히 “예쁘게”가 아니라, 테스트 사용자가 다시 썼을 때 덜 헷갈리고 더 빠르게 판단할 수 있는 UI를 만드는 단계다.

### UI 정리 기준

- 상단 대시보드와 하단 섹션의 시각 언어가 일관된다.
- 입력 패널은 “입력해야 하는 것”과 “자동 계산된 것”이 명확하다.
- 동적 항목 행은 위쪽 입력 UI와 같은 밀도와 리듬을 가진다.
- 버튼은 역할이 분명하다: 추가, 삭제, 저장, 새로고침, 설정.
- 삭제/위험 동작은 충분히 구분된다.
- 카드 안에 카드가 불필요하게 중첩되지 않는다.
- 긴 숫자와 긴 중국어 텍스트가 깨지지 않는다.
- 모바일에서 모든 주요 액션을 할 수 있다.
- 표는 페이지 전체를 밀지 않고, 자체 wrapper 안에서만 스크롤된다.

### UI Task A. 대시보드 / 입력 패널 정리

QA:

```bash
npx playwright test tests/e2e/linkland-responsive-visual.spec.ts --project=chrome --grep "@ui-dashboard-input-polish" --reporter=line
```

Evidence:
- `.omo/ulw-loop/evidence/ui-dashboard-input-polish.png`

### UI Task B. 하단 섹션 정리

대상:
- 시나리오 빠른 비교
- 주변 매장 분석
- 시나리오 비교 테이블
- 2~5년차 양도/권리금 회수표

QA:

```bash
npx playwright test tests/e2e/linkland-responsive-visual.spec.ts --project=chrome --grep "@ui-lower-sections-polish" --reporter=line
```

Evidence:
- `.omo/ulw-loop/evidence/ui-lower-sections-polish.png`

### UI Task C. 반응형 / bilingual 정리

Viewports:
- `1440x1000`
- `1024x900`
- `390x844`
- `360x780`

Modes:
- 한국어/KRW
- 중국어/CNY

QA:

```bash
npx playwright test tests/e2e/linkland-responsive-visual.spec.ts --project=chrome --grep "@ui-responsive-bilingual-polish" --reporter=line
```

PASS:
- `document.documentElement.scrollWidth <= document.documentElement.clientWidth`
- 버튼/입력/카드 텍스트 overlap 없음
- 주요 KPI 숫자가 카드 밖으로 나가지 않음
- 중국어/CNY에서도 긴 금액 표시가 읽힘

Evidence:
- `.omo/ulw-loop/evidence/ui-responsive-bilingual-report.json`
- `.omo/ulw-loop/evidence/ui-responsive-ko-mobile.png`
- `.omo/ulw-loop/evidence/ui-responsive-zh-mobile.png`

## Wave 5. 최종 전체 재실행

목적: 기능 수정과 UI 정리가 서로를 망가뜨리지 않았는지 전체를 다시 돌린다.

명령:

```bash
npm test
npm run build
npx playwright test tests/e2e/linkland-user-review-loop.spec.ts --project=chrome --grep "@final-full-walkthrough" --reporter=line
npx playwright test tests/e2e/linkland-responsive-visual.spec.ts --project=chrome --grep "@final-ui-review" --reporter=line
node tests/qa/check-review-ledger.mjs --ledger .omo/ulw-loop/linkland-bep-user-review-loop-ledger.md --require-no-open --require-reviewer-approved --require-evidence-files
```

최종 PASS:
- `OPEN DEFECT` 0개
- `REOPENED DEFECT` 0개
- 모든 `CLOSED DEFECT`에 RED/GREEN/브라우저 또는 HTTP 증거 있음
- 최종 브라우저 walkthrough 통과
- 반응형 UI 통과
- localStorage / Apps Script fixture 통과
- 검수 에이전트가 `REVIEWER APPROVED` 기록

Evidence:
- `.omo/ulw-loop/evidence/final-full-walkthrough.md`
- `.omo/ulw-loop/evidence/final-ui-review.json`
- `.omo/ulw-loop/evidence/final-reviewer-approval.json`

## 중단 조건

- 같은 결함이 3번 재오픈되면 사용자에게 원인과 선택지를 보고한다.
- QA 서버, 브라우저 세션, fixture 서버, 임시 파일이 남아 있으면 PASS 처리하지 않는다.
- 실제 Google Sheet 쓰기 테스트는 QA URL이 명확하지 않으면 실행하지 않는다.
- 테스트 없이 production code가 수정되면 해당 수정은 무효로 보고 RED 테스트부터 다시 한다.

## 최종 커밋 정책

이 플랜 실행 중에는 자동 커밋하지 않는다.

사용자가 커밋을 요청하면:
- 결함 수정 커밋과 UI 정리 커밋을 분리한다.
- Conventional Commit 형식을 쓴다.
- 각 커밋은 `npm test`, `npm run build`, 관련 Playwright QA 통과 상태여야 한다.
- 최종 커밋 본문에 `Plan: plans/linkland-bep-user-review-loop.md`를 남긴다.
