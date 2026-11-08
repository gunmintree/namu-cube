# 학습 경험 재구성 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. 사용자는 추가 선택 절차 없이 묶음 실행을 위임했다.

**Goal:** 시작 지점 찾기부터 실물 확인과 복구까지 이어지는 양언어 큐브 매뉴얼을 구현한다.

**Architecture:** 기존 Astro 페이지와 큐브 상태 모델을 재사용한다. 시작 지점과 복구 안내는 서버 렌더링으로 제공하고 기존 수업 스크립트에 재생 정지와 진행 표시만 연결한다. 새 패키지는 추가하지 않는다.

**Tech Stack:** Astro 7.4.7, TypeScript, CSS, Node.js >=22.23.4, 기존 Puppeteer.

**Spec:** `docs/superpowers/specs/2026-11-08-learning-reconstruction-design.md`

## Global Constraints

- 한국어·영어, 모바일·키보드·움직임 감소 지원을 유지한다.
- 본 수업은 흰 십자부터 7단계이며 준비와 꽃 모양은 보조 설명이다.
- 화면의 예시는 실물 상태를 읽지 않는다. 재생 종료는 실물 완료가 아니다.
- 회전 알고리즘과 저장 형식은 재사용하며 새 의존성을 추가하지 않는다.
- 코드 주석과 개발 설명은 한국어로 작성한다.

## Review Focus

- 준비·꽃 모양을 완료한 기록이 본 수업 진행률에 섞이지 않는다.
- 저장소가 차단되거나 기록이 손상되어도 시작 안내와 수업을 읽는다.
- 복구 안내를 열 때 실행 중 한 동작이 마무리된 뒤 재생이 정지한다.
- 마지막 꼭짓점의 일시적 아래층 변화에 잘못된 복구 행동을 지시하지 않는다.
- 320px·영어·200% 글자 확대와 JavaScript 미사용에서도 탐색과 안내가 남는다.

## Task 1: 기획·기준본·검증 과제 고정

**Files:** 위 기획안, 이 계획, `docs/research/usability-study.md`.
**Interfaces:** 기준 커밋 `72b36cf`, 기존 49개 테스트, `artifacts/baseline/` 캡처.

- [x] 기존 문서와 전체 학습 흐름을 읽고 `npm test`의 49개 통과를 확인한다.
- [x] 390·1280px의 홈·흰 십자 화면을 캡처한다.
- [x] 대안, 선택 이유, 수용 기준과 후속 판단 항목을 기획안에 작성한다.
- [x] 사용자 관찰지에 과제·판정·기록 양식과 대표 사례의 실물 준비 수순을 작성했다.

## Task 2: 시작 안내와 준비·실습·확인 화면

**Files:** `src/components/CubeIndex.astro`, `src/components/Lesson.astro`, `src/components/RecoveryHelp.astro`, `src/styles/site.css`, `src/styles/tokens.css`, `src/scripts/progress-ui.ts`, `src/scripts/lesson.ts`, `scripts/browser-check.mjs`.
**Interfaces:** 기존 `data-case`, `data-case-when`, `data-case-hold`, 플레이어 데이터 속성을 유지한다. `data-course-progress`에는 본 수업 slug 목록을 전달한다. `data-recovery`가 열린 경우 수업의 `stop()`과 `update()`를 호출한다.

- [x] 브라우저 검사에 시작 지점 링크, 보조 수업을 제외한 진행 표시, 준비 영역 순서, 복구 시 재생 정지 검사를 추가했다.
- [x] `CHECK_FILTER`로 새 검사 4개가 구현 부재로 실패하는 것을 확인했다.
- [x] 홈에 서버 렌더링 시작 지점 찾기와 본 수업 진행 표시를 구현했다.
- [x] 수업의 사례·잡는 방향을 준비 영역으로 정리하고 시연·방법·실물 확인·복구를 재배치했다.
- [x] 두 언어와 마지막 꼭짓점의 예외를 반영한 복구 안내를 구현했다.
- [x] 디자인 토큰과 반응형 CSS를 적용하고 기존 플레이어·다크 모드·초점·움직임 감소 동작을 검사했다.
- [x] 새 검사와 `npm test`, `npm run check`를 통과했다.

## Task 3: 문서·브라우저 검증·최종 검토

**Files:** `PRODUCT.md`, `DESIGN.md`, `README.md`, `docs/development.md`, `docs/research/usability-study.md`, 구현 파일.
**Interfaces:** 7개 본 수업·2개 보조 수업의 한국어·영어 경로. 기존 기록과 수동 완료 버튼을 유지한다.

- [x] 제품·디자인·실행 문서를 실제 구현과 맞췄다. 문서화 담당자가 DESIGN.md와 schemaVersion 2 sidecar를 작성했고 JSON 파싱과 핵심 색상 8개 역할의 CSS 일치를 직접 확인했다.
- [x] 최종 수정 후 `npm test` 49/49, `npm run check` 0 errors/warnings/hints, `npm run build` 25페이지, `npm run test:site` 25페이지 링크·메타데이터 검사, 정적 빌드 서버의 `npm run test:browser` 68/68을 통과했다.
- [x] 데스크톱·모바일·두 테마의 대표 화면 12개를 확인했다. 시작·복구 링크가 안내를 직접 펼치도록 보강하고 확인했다.
- [x] 기획안·코드·화면을 독립 검토했다. Important 1건을 재현 검사 후 해결했고 같은 검토자의 수정 한정 verdict를 받았다.
- [x] 실제 초보자 평가에 필요한 과제·준비 수순·기록 양식을 제공한다. 실제 관찰은 사용자의 참여가 필요한 남은 작업이며, 학습 성과가 검증됐다고 처리하지 않는다.

## 실행 기록

- 기준: main `72b36cf`, 변경 전 49/49 테스트 통과.
- 작업 브랜치: `feature/learning-reconstruction`. 사용자 위임에 따라 현재 프로젝트 폴더에서 직접 실행한다.
- Pre-flight: Task 2의 데이터 속성은 기존 플레이어 인터페이스와 동일하게 유지하며 Task 3의 검사가 이를 검증한다.
- 판단: 이미지·외부 디자인 계정·새 브라우저 테스트 의존성을 추가하지 않는다. 실제 수업의 동작을 우선 검증하기 위한 선택이며, 시각적 협업 필요가 생기면 재검토한다.
- Task 2 판단: 2층의 좌·우 사례는 같은 잡는 방향을 공유한다. 방향 문구가 무조건 바뀐다는 검사 대신 선택한 사례의 실제 방향과 일치하는지 확인했다. 데이터의 공통 조건을 검증하는 정정이다.
- Task 2 보강: JavaScript 미사용 시 읽지 못한 기록을 0개로 단정하지 않도록 진행 표시를 초기에는 숨긴다. 새 검사의 실패 후 구현·통과를 확인했다.
- Task 2 보강: 시작 지점과 복구 링크는 native details 내부 fragment로 연결한다. 추가 스크립트 없이 JS 미사용에서도 펼쳐지는 것을 확인했다.
- 최종 검토: 복구 도움말이 열린 상태로 시연을 재개했다가 돌아오면 toggle이 없어 정지가 누락되는 Important 1건을 받았다. `journey: re-entering open recovery pauses restarted playback` 실패를 관찰하고 링크 click에도 정지를 연결해 통과시켰다. 독립 검토자는 해당 수정에 resolved/ship을 판정했다. Critical·Minor 지적은 없었다.
- 검증 환경 판단: 기존 preview 스크립트의 고정 포트에 포트 인수를 중복 전달하면 의도한 포트로 실행되지 않았다. 패키지 스크립트를 바꾸지 않고 `npm exec --offline -- astro preview --host 127.0.0.1 --port 4324`로 빌드 결과의 검증 서버를 실행했다.
- 최종 실행 로그: 로컬 `artifacts/verification/`의 unit/check/build/site/browser.log. 브라우저 보고서 `artifacts/browser-report.json`의 base는 `http://127.0.0.1:4324`이며 68개 모두 통과했다. 로그·캡처는 Git 제외 대상이다.
- 검증의 한계: 자동 검사는 회전·기능·배치·접근성 조건을 다룬다. 실제 초보자의 이해도·완료율·소요 시간과 공개 배포 결과는 확인하지 않았다.
- 마무리: 기존 main 기준본을 보존하고 작업 브랜치에 로컬 커밋으로 정리한다. 공개 배포나 원격 브랜치 변경은 이번 묶음의 산출물에 포함하지 않는다.
