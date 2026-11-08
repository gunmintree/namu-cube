---
name: Namu Cube
description: 혼자 읽고 실물에서 확인하는 단계별 큐브 작업표
colors:
  paper: "#f8fafd"
  paper-secondary: "#edf1f7"
  paper-tertiary: "#dce3ed"
  card: "#ffffff"
  ink: "#172b44"
  ink-secondary: "#354b66"
  muted: "#53647a"
  rule: "#cfd9e5"
  accent: "#2549df"
  accent-ink: "#ffffff"
  stage: "#e9eff8"
  stage-deep: "#cfdbec"
  field-edge: "#6c7c90"
  success: "#286242"
  ink-on-cube: "#171c21"
  cube-yellow: "#f3dc52"
  cube-white: "#fffefa"
  cube-green: "#51ad80"
  cube-blue: "#6593d9"
  cube-red: "#e56652"
  cube-orange: "#f0a353"
  cube-line: "#252c33"
  dark-paper: "#11171b"
  dark-paper-secondary: "#1b242a"
  dark-paper-tertiary: "#29343d"
  dark-card: "#182127"
  dark-ink: "#e7edf0"
  dark-ink-secondary: "#c0cbd2"
  dark-muted: "#a4b1ba"
  dark-rule: "#3b4a54"
  dark-accent: "#9fb7ff"
  dark-accent-ink: "#102044"
  dark-stage: "#1b2736"
  dark-stage-deep: "#2e4058"
  dark-field-edge: "#718390"
  dark-success: "#a3d8b7"
typography:
  display:
    fontFamily: "NamuSansSubset, Apple SD Gothic Neo, Malgun Gothic, sans-serif"
    fontSize: "clamp(2.75rem, 4.5vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.23
    letterSpacing: "-0.025em"
  lesson-title:
    fontSize: "clamp(1.9rem, 3vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  section:
    fontSize: "clamp(1.75rem, 2.8vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  lesson-order:
    fontSize: "clamp(2.5rem, 5vw, 4rem)"
    fontWeight: 650
    lineHeight: 1
    letterSpacing: "-0.04em"
  lead:
    fontSize: "clamp(1.125rem, 1.2vw + .5rem, 1.3rem)"
    lineHeight: 1.75
  body:
    fontFamily: "NamuSansSubset, Apple SD Gothic Neo, Malgun Gothic, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.7
  instruction:
    fontSize: "1rem"
    lineHeight: 1.85
  workspace-title:
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.5
  lesson-row-title:
    fontSize: "1.1rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "-0.025em"
  control:
    fontSize: "1rem"
    fontWeight: 620
    lineHeight: 1.5
  support:
    fontSize: "0.875rem"
  compact-label:
    fontSize: "0.8rem"
  caption:
    fontSize: "0.75rem"
  move:
    fontFamily: "ui-monospace, Consolas, monospace"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.2
  active-move:
    fontFamily: "ui-monospace, Consolas, monospace"
    fontSize: "2.75rem"
    fontWeight: 700
    lineHeight: 1.2
  dock-move:
    fontFamily: "ui-monospace, Consolas, monospace"
    fontSize: "1.125rem"
    fontWeight: 650
    lineHeight: 1.5
rounded:
  formula-rest: "0"
  layer-tile: "1px"
  diagram-tile: "2px"
  task-marker: "4px"
  cube-sticker: "6px"
  control: "8px"
  stage: "16px"
spacing:
  2xs: "4px"
  xs: "8px"
  sm: "12px"
  md: "20px"
  lg: "28px"
  xl: "48px"
  2xl: "80px"
  3xl: "112px"
  "16": "16px"
  "24": "24px"
  "32": "32px"
  "40": "40px"
  "64": "64px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
  button-secondary:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
  button-utility:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  select:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 32px 10px 12px"
  cube-stage:
    backgroundColor: "{colors.stage}"
    rounded: "{rounded.stage}"
    padding: "24px"
  recovery:
    backgroundColor: "{colors.paper-secondary}"
    rounded: "{rounded.stage}"
  view-choice:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  view-choice-selected:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
---

# Design System: 차근차근 큐브

## Overview

**Creative North Star: "단계별 실습 작업표"**

차가운 백색 작업면, 짙은 잉크, 파란 행동색과 가는 경계로 읽기와 조작을 연결한다. 큰 수업 번호와 목표 도해, 짧은 지시문이 현재 할 일을 밝힌다. 앞선 안내판의 명료함과 상태 기반 큐브는 유지하면서, 사례 고르기·잡기·따라 하기·실물 확인이 같은 순서로 반복되는 체계로 정리했다.

어린 독자도 보호자 없이 혼자 읽는 매뉴얼이다. 한국어·영어, 모바일, 키보드, 움직임 감소 설정을 동일한 제품 제약으로 다룬다. 시각 자산은 CSS 3D와 상태 데이터에서 만든 도해이며 새 래스터를 사용하지 않았다. 실제 초보자의 이해도·성공률·소요 시간은 아직 측정하지 않았다.

**Key Characteristics:**

- 차가운 백색과 짙은 잉크, 파란 행동색
- 실제 상태 데이터로 그린 3D 큐브와 층별·목표 도해
- 학습 순서와 일치하는 번호, 준비에서 확인으로 이어지는 위계
- 필요한 설명을 펼치는 native details와 다시 확인할 경로
- 시연과 실물 확인을 구분하는 직접적인 양언어 문구

기준은 (2026-11-08)의 `src/styles/tokens.css`, `base.css`, `site.css`와 `CubeIndex.astro`, `Lesson.astro`, `Formula.astro`, `RecoveryHelp.astro`, 시연 스크립트다. 제품의 고정 사실은 `PRODUCT.md`, 화면 방향은 `.impeccable/surfaces/cube.md`를 따른다. 이 문서는 구현을 기록하며 사용자 연구의 결과를 대신하지 않는다.

## Colors

전역 색은 frontmatter가 현재 구현의 값을 기록한다. 밝은 화면의 차가운 중립색과 어두운 화면의 청회색이 같은 역할을 유지한다.

### Primary

**행동 파랑**(`accent`)은 시작·다음 행동, 현재 학습 단계, 초점과 선택 상태에 사용한다. 그 위 글자는 `accent-ink`다. 큐브 무대인 `stage`와 그 내부 경계인 `stage-deep`는 읽는 면과 실습 면을 구별한다.

### Secondary

**확인 초록**(`success`)은 직접 확인한 수업과 예시 완료 메시지의 의미색이다. 큐브의 여섯 색은 별개의 상태 팔레트다. 노랑·하양·초록·파랑·빨강·주황은 스티커와 목표·비교 도해에서 같은 뜻을 갖는다. 큐브 테두리는 `cube-line`, 스티커 위 글자는 `ink-on-cube`를 쓴다.

### Neutral

**차가운 백색 작업면**(`paper`), 보조 면(`paper-secondary`, `paper-tertiary`), 조작 면(`card`)에 본문(`ink`), 설명(`ink-secondary`), 보조 글자(`muted`)를 놓는다. 내용 구분선은 `rule`, 조작 가능한 보조 버튼과 선택 상자의 경계는 더 뚜렷한 `field-edge`다. 비활성 버튼은 투명도 (.45)와 사용할 수 없는 커서로 구분한다.

`dark-` 항목은 같은 CSS 변수의 어두운 화면 재정의다. 시스템 설정 또는 저장한 테마 선택으로 적용한다. 어두운 화면에서도 큐브 여섯 색과 그 위 글자·테두리는 유지하며 접지 그림자는 투명해진다. `forest` 계열은 현재 파랑·무대색을 가리키는 호환 별칭이며 별도의 초록 브랜드 팔레트가 아니다.

**The Meaningful Color Rule.** 큐브 색을 다른 의미의 상태 표시로 임의 전용하지 않는다.

## Typography

**Display Font / Body Font:** 자체 호스팅 `NamuSansSubset`, `Apple SD Gothic Neo`, `Malgun Gothic`, `sans-serif`.

**Label/Mono Font:** 회전 기호와 공식의 고정폭 표기는 `ui-monospace`, `Consolas`, `monospace`.

같은 한글 서체의 크기·무게·줄간격으로 제목과 지시문을 구별한다. 일반 글자와 회전 기호는 서로 다른 역할이다. 전역 본문은 (1.0625rem / 1.7), 무게는 밝은 화면 (400), 어두운 화면 (350)이다. 제목은 기본 무게 (700), 자간 (-.025em), 줄간격 (1.3)을 상속한다.

### Hierarchy

| 역할 | 현재 크기·형식 | 사용 위치 |
| --- | --- | --- |
| 홈의 큰 제목 | `clamp(2.75rem, 4.5vw, 4.5rem)` / 1.23 | 처음 시작할 행동 |
| 수업 제목 | `clamp(1.9rem, 3vw, 2.75rem)` / 1.3 | 현재 수업의 목표 |
| 구역 제목 | `clamp(1.75rem, 2.8vw, 2.5rem)` / 1.3 | 전체 순서·정보 페이지 |
| 큰 수업 번호 | `clamp(2.5rem, 5vw, 4rem)` / 1, 무게 650 | 본 수업의 실제 순서 |
| 층·목록 제목 | (1.45rem), (1.1rem / 1.5) | 층별 구역과 수업 행 |
| 준비·실습 제목 | (1.125rem / 1.5) | 고르기·잡기·따라 하기 |
| 설명 제목 | 주로 (1.15rem), 확인 제목 (1.3rem) | 방법·공식·완료 확인 |
| 도입 문장 | `clamp(1.125rem, 1.2vw + .5rem, 1.3rem)` / 1.75 | 홈의 첫 설명 |
| 직접 수행 지시 | 주로 (1rem / 1.85), 방법 목록 (.95rem / 1.85) | 잡는 방향·동작·진행 방법 |
| 조작 문구 | (1rem / 1.5), 무게 620 | 주요·보조 버튼 |
| 보조 설명 | (.875rem), (.9rem), (.94rem), (.95rem) | 수업 설명·조건·링크 |
| 작은 조작·기록 | (.8rem), (.85rem), 단계 탐색 (.78rem) | 관찰 선택·복구·진행 표시 |
| 캡션 | (.75rem), 하단 공식 띠 라벨 (.7rem), 작은 도해 문자 (.65rem) | 그림·상태의 부가 정보 |
| 공식 기호 | 고정폭 (2rem / 1.2), 무게 700 | 큐브 위 기본 공식 |
| 다음 동작 | 고정폭 (2.75rem / 1.2), 무게 700 | 현재 수행할 한 동작; 종료 시 (1.25rem) |
| 하단 공식 띠 | 고정폭 (1.125rem / 1.5), 무게 650 | 공식이 화면 밖에 있을 때의 참고 |

이는 단일 비율의 글자 스케일이 아니다. frontmatter의 재사용 역할과 별도로 워드마크 (1.35rem), 보조 구역 제목 (1.5rem), 정보 소제목 (1.4rem), 홈 상태 질문 (1.25rem) 등 문맥별 literal 값도 사용한다. 선언만 있고 현재 직접 소비하지 않는 `--text-sm`, `--text-lg`, `--text-title`을 모든 글자가 따르는 규칙으로 해석하지 않는다.

(1000px) 이하에서 공식 기호는 (1.75rem)이다. (680px) 이하에서 홈 제목은 `clamp(2.6rem, 9vw, 3.4rem)`, 수업 제목은 (1.8rem), 층 제목은 (1.3rem), 수업 행 제목은 (1rem)로 바뀐다. 홈 도입은 (1.06rem), 수업 도입은 (.94rem), 재생 버튼과 단계 번호는 (.85rem)이다. 설명의 줄길이는 도입 약 (70ch), 실습 확인 약 (65ch), 복구 약 (75ch) 상한을 사용하되 좁은 화면의 실제 가용 폭을 따른다.

**The Readable Instruction Rule.** 회전 기호 밖의 설명은 일반 글꼴과 문장으로 읽히게 하고, 작은 캡션이 수행 지시를 대신하지 않게 한다.

## Layout

컨테이너 전체 상한은 (1296px), 넓은 화면의 좌우 안쪽 여백은 각각 (48px)다. 이때 내부 내용 상한은 (1200px)다. (900px) 이하의 여백은 (28px), (600px) 이하는 (20px)다. 간격은 (4·8·12·16·20·24·28·32·40·48·64·80·112px)을 사용하며 동일한 한 간격만 반복하지 않는다. (600px) 이하에서 큰 간격 `xl`·`2xl`·`3xl`은 각각 (32·56·80px)로 줄어든다.

홈 첫 영역은 시작 문장과 상태 데이터 큐브를 약 (1.1:1)의 두 열, 간격 (64px)로 묶는다. 시작 지점 찾기는 native details 안의 순서 목록이며 목적지 fragment `#start-point`도 그 내부에 있다. 이미 맞춘 상태는 자기 확인으로 선택한다. 준비·흰 조각 모으기는 보조 설명이고, 목록과 진행률·수업 탐색은 흰 십자부터 시작하는 본 수업 7개의 순서다.

수업은 목표와 번호 → 사례 고르기·잡는 방향 → 큐브 실습·방법 설명 → 실물 확인 → 복구 순서다. 준비는 약 (1.05:1), 실습은 약 (1.15:.85)의 두 열이며 기본 간격은 (48px)이다. (1000px) 이하에서는 일부 열 간격이 (28px)로 줄고 단계 이름을 숨겨도 링크의 접근 가능한 이름과 실제 번호는 남는다. (680px) 이하에서는 한 열로 쌓고 준비와 실습 간격은 (24px)이다. 모바일 재생 조작은 줄바꿈할 수 있고 실물 확인 버튼은 문구를 접어 표시한다.

**The Ordered Work Rule.** 번호는 실제 본 수업 순서 또는 고르기·잡기·따라 하기·확인의 작업 순서를 나타내며 장식용 순위를 만들지 않는다.

## Elevation & Depth

본문·목록·버튼은 평평한 면과 가는 경계로 구획하며 `box-shadow`를 사용하지 않는다. 깊이는 CSS 3D 큐브의 원근과 옅은 무대색으로 만든다. 큐브 아래 접지 표시는 (180×24px)의 타원형 면, 반경 (50%), 흐림 (14px), 밝은 화면의 `#20231f1a` 배경으로 표현한다. 어두운 화면에서는 투명하다. 이것은 일반 카드의 그림자 규칙이 아니다.

고정 공식 띠는 그림자 없이 조작 면과 경계선을 사용하고, 화면 하단 안전 여백을 따른다. 움직임은 조작 피드백과 실제 회전 설명에 한정한다. 버튼은 (150ms)의 배경·눌림 전환, 회전은 선택 속도 (1000ms / 500ms)와 `cubic-bezier(.4,0,.2,1)`을 사용한다. 움직임 감소 설정에서는 회전 결과를 즉시 적용하고 CSS 전환을 제거한다. 선언된 (220ms)·`--ease-out`을 현재 쓰이는 동작 규칙으로 기록하지 않는다.

## Shapes

큰 실습·복구 면은 완만한 모서리 (16px), 버튼·선택 상자·수업 행·공식 띠·관찰 조작은 (8px)다. 작은 그림에는 다른 모서리가 필요하다. 큐브 스티커는 (6px), 작업 번호와 현재 공식 기호는 (4px), 목표 도해·비교 칸·공식 띠 기호는 (2px), 층 도해는 (1px)다. 쉬고 있는 공식 기호는 배경 없이 직각 (0)이며 현재 기호만 파란 면과 (4px) 모서리로 드러난다. 큐브 접지 타원의 (50%)는 해당 효과의 형태다.

일반 구분선과 필드 경계는 (1px), 현재 단계 밑줄은 (2px), 큐브 스티커 경계는 (3px)다. 이 차이는 그림·조작·현재 위치를 구별하는 역할이며 모든 요소를 같은 반경이나 두께로 통일하지 않는다.

## Components

### Buttons and fields

행동명을 직접 읽는 주요·보조 버튼은 최소 높이 (50px), 기본 패딩 (12px 22px), 반경 (8px)다. 주요 버튼은 행동 파랑과 그 위 글자를 사용하며 hover에서 본문 잉크와 조작 면 글자로 바뀐다. 보조 버튼은 조작 면·필드 경계, hover에서 보조 작업면을 사용한다. 눌림은 아래로 (1px), 비활성은 투명도 (.45)다. 이어보기는 같은 보조 버튼 체계를 사용한다. 아랫면 보기·공식 복사·다시 보기·초기화·설명 방향 복원은 최소 높이 (44px), 패딩 (8px 12px), 글자 (.85rem)의 작은 보조 버튼이다. 아랫면 보기의 선택 상태는 파란 면과 `aria-pressed`로 함께 표시한다. 본문 탐색 링크는 밑줄을 유지한다.

선택 상자는 기본 브라우저 동작을 유지하며 최소 높이 (46px), 패딩 (10px 32px 10px 12px), 반경 (8px), 필드 경계를 사용한다. 사례 선택은 연결된 label과 시작 조건을 함께 제공한다. 모든 초점은 (3px)의 초점색 외곽선과 바깥 간격 (4px)으로 보인다. 재생 영역 버튼 패딩과 모바일 크기는 해당 공간에 맞게 달라진다.

### Navigation and progress

상단은 워드마크·학습 링크·언어·테마 버튼으로 구성한다. 수업 탐색은 7개 본 수업 링크를 한 줄에 놓고 현재 단계에 글자색·밑줄·무게·`aria-current`를 함께 준다. 좁은 화면에서는 이름을 숨겨도 번호와 접근 가능한 이름은 남는다. 홈 진행률은 독자가 완료 버튼으로 직접 확인한 본 수업만 세며 분모는 (7)이다. 시연 재생 종료나 보조 수업 방문은 완료 근거가 아니다.

### Work surface and cube player

실습 면은 상태 모델로 그린 CSS 3D 큐브와 공식·확인 지점·다음 한 동작·재생 조작을 연결한다. 자동 재생은 묶음 끝에서 멈춘다. 이전·다시 보기·초기화는 화면의 예시만 되돌린다. 관찰 방향은 `aria-pressed`가 있는 조작·드래그·키보드 방향키로 바꾸며 상태를 변경하지 않는다. Home은 설명 방향을 복원한다. 선택한 관찰 방향은 파란 면으로 표시한다.

사례 선택 아래에는 선택한 실제 시작 상태의 위·앞·오른쪽 면을 SVG로 투영한다. 여섯 색은 큐브 토큰을 그대로 쓰며, 그림과 조건은 사례 선택 시 함께 갱신된다. 재생 중에는 시작 그림이 고정된다. 좁은 화면에서는 그림과 설명을 한 열로 배치한다. 모바일의 큐브 영역은 한 손가락 상하·좌우 관찰을 처리하고 영역 밖에서 페이지를 스크롤한다. `touch-action: pinch-zoom`으로 브라우저 확대를 허용한다.

공식은 반복과 정렬을 나누어 보여주며 현재 기호만 채운다. 하단 공식 띠는 참고 공식이 화면 밖으로 나갔을 때 표시되는 보조 수단이다. 목표·현재 상태 도해는 같은 큐브 색을 사용하고 관계없는 칸은 중립색으로 낮춘다. 색 이름·위치·맞음/다름 문구를 함께 제공한다.

### Disclosures and recovery

추가 설명은 native details·summary를 사용한다. 시작 지점 목록과 복구 안내의 fragment는 접힌 내용 안에 두어 해당 위치로 이동할 때 기본 브라우저의 펼침 동작을 사용할 수 있다. 설명이 닫혔을 때 그 내부 내용은 표시하지 않는다.

복구 면은 보조 작업면·(16px) 반경, 좌우 패딩 (24px; 모바일 16px)으로 실습과 구분한다. 최초 도움말 열기와 이미 열린 도움말로의 링크 재진입 모두 자동 재생을 정지한다. 진행 중 한 회전은 끝낸 뒤 멈추며, 안내를 닫거나 돌아가도 재생을 자동 재개하지 않는다. 마지막 꼭짓점 단계에서는 일시적으로 달라진 아래층을 따로 고치지 말고 남은 꼭짓점과 최종 정렬 후 여섯 면을 확인하도록 안내한다.

**The Real Cube Check Rule.** 시연 종료와 실물 완료를 구분하고, 독자가 실물을 확인한 행동만 학습 완료로 기록한다.

## Do's and Don'ts

### Do:

- **Do** 실제 큐브 상태와 지시문·목표 도해를 일치시킨다.
- **Do** 현재 단계와 다음 행동을 글자·위치·상태 표시로 함께 알린다.
- **Do** 고르기·잡기·따라 하기·실물 확인 순서를 두 언어와 모바일에서도 유지한다.
- **Do** 회전 기호 밖의 설명은 일반 글꼴로 쓰고 키보드 초점과 움직임 감소 동작을 유지한다.
- **Do** 막혔을 때 시작 조건·잡는 방향·진행 위치를 다시 확인할 경로를 제공한다.

### Don't:

- **Don't** 본문·목록·버튼에 큐브의 접지 그림자를 복제한다.
- **Don't** 보호자가 옆에 있다는 전제로 설명한다.
- **Don't** 색만으로 조각 위치나 완료 상태를 설명한다.
- **Don't** 시연 재생 완료를 실물 완성으로 자동 처리한다.
- **Don't** 자기 확인에 따른 시작 지점 안내를 실물 인식·진단으로 표현한다.
- **Don't** 사용자 연구 없이 이해도·성공률·완성 시간의 개선을 사실로 기록한다.
