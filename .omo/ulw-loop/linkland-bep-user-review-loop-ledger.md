# 링크랜드 BEP 실사용 결함 Ledger

## 역할

### 테스트 사용자

실제 투자 검토자처럼 앱을 사용하면서 헷갈림, 버그, 계산 의심, 깨진 화면, 저장/동기화 문제를 `OPEN DEFECT-###`로 기록한다.

### 검수 에이전트

각 결함의 RED/GREEN 테스트, 브라우저/HTTP 증거, cleanup receipt, 계산/데이터/UI 적합성을 검토하고 `CLOSED DEFECT-###` 또는 `REOPENED DEFECT-###`로 판정한다.

## OPEN DEFECTS

없음.

## CLOSED DEFECTS

### CLOSED DEFECT-001

- family: calculation
- severity: high
- reproduction: 회수 가능 투자비와 회수 불가 투자비가 섞인 양수 영업이익 시나리오에서 회수 가능 체크를 변경한다.
- expected: 순투자 회수기간은 회수 가능 투자비를 제외한 순투자액 기준으로 바뀐다.
- actual: `calculateBep`의 `paybackMonths`가 `initialCash / combinedMonthlyProfit`를 사용해 회수 가능 체크와 무관하게 유지된다.
- RED command: `npm test -- --run src/lib/calc.test.ts src/components/FormattedNumberInput.test.ts`
- GREEN command: `npm test -- --run src/lib/calc.test.ts src/components/FormattedNumberInput.test.ts`
- QA command: `npx playwright test tests/e2e/linkland-defect-regressions.spec.ts --project=chrome --grep "DEFECT-001|DEFECT-002" --reporter=line`
- evidence: `.omo/ulw-loop/evidence/defect-001-002-red.txt`, `.omo/ulw-loop/evidence/defect-001-002-green.txt`, `.omo/ulw-loop/evidence/defect-001-002-browser-green.txt`, `.omo/ulw-loop/evidence/defect-001-payback-green.png`.
- cleanup: Playwright web server exited after test; no fixture process used.
- reviewer: pending final reviewer.

### CLOSED DEFECT-002

- family: input-validation
- severity: high
- reproduction: 월 방문객, 전환율, 객단가, 원가율, 온라인 매출, 투자비에 음수 또는 100% 초과 비율을 입력한다.
- expected: 사업 수치 입력은 음수를 막고 비율은 0~100 범위로 제한되어야 한다.
- actual: 입력값이 그대로 반영되어 음수 매출, 음수 투자비, 100% 초과 전환/원가율이 대시보드 계산에 들어간다.
- RED command: `npm test -- --run src/lib/calc.test.ts src/components/FormattedNumberInput.test.ts`
- GREEN command: `npm test -- --run src/lib/calc.test.ts src/components/FormattedNumberInput.test.ts`
- QA command: `npx playwright test tests/e2e/linkland-defect-regressions.spec.ts --project=chrome --grep "DEFECT-001|DEFECT-002" --reporter=line`
- evidence: `.omo/ulw-loop/evidence/task-5-negative-core-inputs.png`, `.omo/ulw-loop/evidence/task-5-over-limit-core-inputs.png`, `.omo/ulw-loop/evidence/task-5-core-inputs-probe.json`, `.omo/ulw-loop/evidence/defect-001-002-red.txt`, `.omo/ulw-loop/evidence/defect-001-002-green.txt`, `.omo/ulw-loop/evidence/defect-001-002-browser-green.txt`, `.omo/ulw-loop/evidence/defect-002-input-clamp-green.png`.
- cleanup: Playwright web server exited after test; no fixture process used.
- reviewer: pending final reviewer.

### CLOSED DEFECT-003

- family: responsive-ui
- severity: high
- reproduction: 360px 모바일 뷰포트에서 앱을 열고 CN/CNY로 전환한 뒤 전체 문서 폭을 확인한다.
- expected: 페이지 전체 가로 스크롤이 없어야 하며, 넓은 표는 내부 스크롤 컨테이너 안에서만 움직여야 한다.
- actual: `documentElement.clientWidth = 360`, `scrollWidth = 379`로 페이지 레벨 가로 오버플로가 생긴다.
- RED command: exploratory browser probe from Task 9.
- GREEN command: `npx playwright test tests/e2e/linkland-defect-regressions.spec.ts --project=chrome --grep "DEFECT-003|DEFECT-004" --reporter=line`
- QA command: `npx playwright test tests/e2e/linkland-defect-regressions.spec.ts --project=chrome --grep "DEFECT-003|DEFECT-004" --reporter=line`
- evidence: `.omo/ulw-loop/evidence/task-9-language-mobile-report.json`, `.omo/ulw-loop/evidence/task-9-zh-mobile-360-detail.json`, `.omo/ulw-loop/evidence/task-9-zh-mobile-360.png`, `.omo/ulw-loop/evidence/defect-003-004-browser-green.txt`, `.omo/ulw-loop/evidence/defect-003-mobile-overflow-green.png`.
- cleanup: Playwright web server exited after test; no fixture process used.
- reviewer: pending final reviewer.

### CLOSED DEFECT-004

- family: i18n
- severity: medium
- reproduction: CN/CNY로 전환 후 기본 시나리오명과 판단 메모를 확인한다.
- expected: 앱이 제공하는 기본 시나리오/메모 텍스트도 중국어로 보인다.
- actual: `링크랜드 현재 가정`, `권리금 회수 가능성을...` 같은 한국어 기본값이 중국어 모드에 남는다.
- RED command: exploratory browser probe from Task 9.
- GREEN command: `npx playwright test tests/e2e/linkland-defect-regressions.spec.ts --project=chrome --grep "DEFECT-003|DEFECT-004" --reporter=line`
- QA command: `npx playwright test tests/e2e/linkland-defect-regressions.spec.ts --project=chrome --grep "DEFECT-003|DEFECT-004" --reporter=line`
- evidence: `.omo/ulw-loop/evidence/task-9-zh-mobile-360-detail.json`, `.omo/ulw-loop/evidence/task-9-language-mobile-report.json`, `.omo/ulw-loop/evidence/defect-003-004-browser-green.txt`, `.omo/ulw-loop/evidence/defect-004-i18n-defaults-green.png`.
- cleanup: Playwright web server exited after test; no fixture process used.
- reviewer: pending final reviewer.

### CLOSED DEFECT-005

- family: navigation
- severity: medium
- reproduction: 모바일에서 사이드바의 `주변 매장 분석`, `시나리오 비교` 링크를 누른다.
- expected: 해당 섹션으로 스크롤된다.
- actual: hash만 `#market` / `#scenarios`로 바뀌고 매칭되는 DOM id가 없어 `scrollY`가 그대로다.
- RED command: exploratory browser probe from Task 8.
- GREEN command: `npx playwright test tests/e2e/linkland-defect-regressions.spec.ts --project=chrome --grep "DEFECT-005|DEFECT-006" --reporter=line`
- QA command: `npx playwright test tests/e2e/linkland-defect-regressions.spec.ts --project=chrome --grep "DEFECT-005|DEFECT-006" --reporter=line`
- evidence: `.omo/ulw-loop/evidence/task-8-sidebar-anchor-probe.json`, `.omo/ulw-loop/evidence/defect-005-006-browser-green.txt`, `.omo/ulw-loop/evidence/defect-005-sidebar-anchors-green.png`.
- cleanup: Playwright web server exited after test; no fixture process used.
- reviewer: pending final reviewer.

### CLOSED DEFECT-006

- family: sync
- severity: high
- reproduction: Apps Script fixture에서 원격 scenarios/marketStores를 전부 soft delete한 뒤 앱을 reload한다.
- expected: 원격 빈 목록이 반영되어 오래된 캐시 시나리오/매장이 사라진다.
- actual: `useSheetsReload`가 원격 목록 길이가 0이면 적용하지 않아 stale localStorage 항목이 계속 보인다.
- RED command: exploratory browser/HTTP probe from Task 10.
- GREEN command: `npx playwright test tests/e2e/linkland-defect-regressions.spec.ts --project=chrome --grep "DEFECT-005|DEFECT-006" --reporter=line`
- QA command: `npx playwright test tests/e2e/linkland-defect-regressions.spec.ts --project=chrome --grep "DEFECT-005|DEFECT-006" --reporter=line`
- evidence: `.omo/ulw-loop/evidence/task-10-empty-sheet-retains-stale-scenario-recheck.png`, `.omo/ulw-loop/evidence/task-10-empty-sheet-retains-stale-market-store.png`, `.omo/ulw-loop/evidence/defect-005-006-browser-green.txt`, `.omo/ulw-loop/evidence/defect-006-empty-sheets-green.png`.
- cleanup: Playwright fixture called `__shutdown`; Playwright web server exited after test.
- reviewer: pending final reviewer.

## REOPENED DEFECTS

없음.

## REVIEWER APPROVED

approved: final verification audit passed on 2026-06-10.

- approval file: `.omo/ulw-loop/evidence/final-reviewer-approval.json`
- ledger gate: `.omo/ulw-loop/evidence/final-ledger-check.txt`
- unit gate: `.omo/ulw-loop/evidence/final-npm-test-rerun.txt`
- build gate: `.omo/ulw-loop/evidence/final-build.txt`
- browser gate: `.omo/ulw-loop/evidence/final-playwright.txt`
- final walkthrough: `.omo/ulw-loop/evidence/final-full-walkthrough.md`
- final UI review: `.omo/ulw-loop/evidence/final-ui-review.json`

## Evidence Index

- task-1-red-qa-harness: `.omo/ulw-loop/evidence/task-1-red-qa-harness.txt`
- task-2-red-ledger-check: `.omo/ulw-loop/evidence/task-2-red-ledger-check.txt`
- task-3-red-oracle-smoke: `.omo/ulw-loop/evidence/task-3-red-oracle-smoke.txt`
- task-4-red-fixture: `.omo/ulw-loop/evidence/task-4-red-fixture.txt`
