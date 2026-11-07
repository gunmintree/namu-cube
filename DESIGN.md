---
name: Namu Cube
description: 한 층씩 직접 맞추는 큐브 매뉴얼
colors:
  paper: "#fafaf7"
  paper-secondary: "#f1f2ed"
  paper-tertiary: "#e8e9e2"
  card: "#fffefa"
  ink: "#20231f"
  ink-secondary: "#3c423b"
  muted: "#62675f"
  rule: "#dedfd8"
  accent: "#2549df"
  stage: "#eef2f7"
  stage-deep: "#dce4ef"
  success: "#286242"
  cube-yellow: "#f3dc52"
  cube-white: "#fffefa"
  cube-green: "#51ad80"
  cube-blue: "#6593d9"
  cube-red: "#e56652"
  cube-orange: "#f0a353"
  cube-line: "#252c33"
typography:
  display:
    fontFamily: "NamuSansSubset, Apple SD Gothic Neo, Malgun Gothic, sans-serif"
    fontSize: "clamp(2.75rem, 4.5vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.23
    letterSpacing: "-0.035em"
  lesson-title:
    fontSize: "clamp(1.9rem, 3vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.035em"
  section:
    fontSize: "clamp(1.75rem, 2.8vw, 2.5rem)"
    fontWeight: 720
    lineHeight: 1.3
  body:
    fontFamily: "NamuSansSubset, Apple SD Gothic Neo, Malgun Gothic, sans-serif"
    fontSize: "1.0625rem"
    lineHeight: 1.7
  move:
    fontFamily: "ui-monospace, Consolas, monospace"
    fontSize: "0.875rem"
rounded:
  control: "8px"
  stage: "16px"
  cube-sticker: "6px"
spacing:
  2xs: "4px"
  xs: "8px"
  sm: "12px"
  md: "20px"
  lg: "28px"
  xl: "48px"
  2xl: "80px"
  3xl: "112px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.card}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
  button-secondary:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
  select:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 32px 10px 12px"
  cube-stage:
    backgroundColor: "{colors.stage}"
    rounded: "{rounded.stage}"
    padding: "24px"
---

# Design System: 차근차근 큐브

## Overview
**디자인 방향: "직접 만지는 과학 전시관의 안내판"**

실제 큐브의 움직임과 읽는 순서가 화면을 이끈다. 넓은 제목, 짧은 지시문, 정렬된 학습 목록과 목표 도해로 복잡한 해법을 나누어 보여준다. 기존의 초록 아치와 종이 그림자 표현을 대체한 체계다.

**Key Characteristics:**
- 밝은 바탕과 선명한 파란 기준색
- 실제 3D 큐브와 층별·목표 도해
- 조각 선택과 한 동작을 중심으로 한 읽기 위계
- 보호자 동반 전제 없이 직접 설명하는 문구

## Colors
파랑은 시작·다음 행동, 현재 단계와 초점의 기준색이다. 큐브의 여섯 색은 실제 스티커와 목표 도해의 의미를 유지한다.

### Primary
**안내 파랑**은 주요 버튼, 현재 단계, 로고와 관찰 방향 선택에 사용한다. **옅은 전시 바탕**은 큐브를 올려두는 면이다.

### Secondary
**완료 초록**은 완료한 수업의 글자 표시다. 큐브의 노랑·하양·초록·파랑·빨강·주황은 장식 팔레트가 아니라 조각 상태를 나타낸다.

### Neutral
밝은 바탕, 두 단계의 보조 면, 본문과 보조 글자, 구분선으로 밀도를 나눈다. 비활성 조작은 투명도 (.45)로 표시한다.

**The Meaningful Color Rule.** 큐브 색을 다른 의미의 상태 표시로 임의 전용하지 않는다.

## Typography
Pretendard 원본의 자체 호스팅 서브셋 NamuSansSubset을 제목과 본문에 사용한다. 회전 기호만 고정폭 글꼴로 표시한다. 본문 기본은 (1.0625rem), 줄간격은 (1.75)이다. 수업 안내는 문맥에 따라 (1rem)과 더 넓은 줄간격을 사용한다.

목록 첫 제목, 수업 제목, 소제목, 본문, 조작 문구의 위계를 구분한다. (680px) 이하에서 수업 제목은 (1.8rem), 목록 첫 제목은 `clamp(2.6rem, 9vw, 3.4rem)`이다.

## Layout
컨테이너 전체 상한은 (1296px), 데스크톱 좌우 안쪽 여백은 (48px)이므로 내부 내용 폭의 상한은 (1200px)이다. (900px) 이하의 여백은 (28px), (600px) 이하의 여백은 (20px)이다.

목록은 1층·2층·3층을 가는 선으로 나누며 도해·설명과 수업 링크를 두 열로 놓는다. 수업은 넓은 화면에서 큐브와 설명을 나란히 배치한다. (680px) 이하에서는 목표, 조각 선택, 잡는 방향, 큐브, 완료 확인 순서로 쌓인다. 제목 가까운 목표 도해와 접힌 추가 설명이 시연을 찾는 동선을 줄인다.

## Elevation & Depth
조작과 본문은 평평한 면과 경계선으로 구획한다. CSS 3D 큐브만 공간을 가진다. 큐브 아래의 접지 그림자는 반투명 타원에 blur (14px)를 적용한 실제 입체 표시의 일부이며 버튼·목록으로 복제하지 않는다.

## Shapes
버튼·선택 상자·관찰 방향은 같은 작은 모서리를 쓴다. 큐브 무대는 더 큰 모서리, 스티커는 입체의 개별 타일 모서리를 사용한다. 목표 면은 3×3 격자로 표시하며 관련 없는 칸을 중립색으로 줄일 수 있다.

## Components
### Buttons
주요 버튼은 파란 바탕과 흰 글자다. 보조 버튼은 흰 바탕과 가는 경계선이다. 기본 최소 높이는 (50px), 키보드 초점은 파란 외곽선 (3px)과 간격 (4px)이다. 누를 때 (1px) 내려가며 비활성 상태는 클릭 불가 커서와 투명도로 알린다.

### Select
사례 선택은 전체 열 너비로 표시한다. 속도 선택은 더 짧은 같은 형태의 필드다. 최소 높이는 (46px)이다.

### Navigation
수업 7개가 순서를 가진 탐색으로 이어진다. 현재 단계는 파란 글자와 밑줄을 함께 쓴다. 좁은 화면에서는 숫자를 남기고 단계 이름을 접는다. 보조 수업은 본 수업의 첫 단계처럼 번호를 붙이지 않는다.

### Cube player
실제 상태를 가진 CSS 3D 큐브, 다음 동작 설명, 동작 수, 이전·한 동작·재생, 초기화·속도, 관찰 방향 순서다. 회전 중의 상태와 조작 가능 여부를 동기화한다. 움직임 감소 설정에서는 회전을 즉시 적용한다.

### Goal and help
목표 도해는 수업 제목 가까이에 둔다. 흰 십자의 세 가지 사전 설명은 접힌 추가 설명으로 제공한다. 마지막 꼭짓점 수업은 한 조각씩 확인하는 안내를 바로 보이게 둔다.

## Do's and Don'ts
### Do:
- **Do** 실제 큐브 상태와 지시문을 일치시킨다.
- **Do** 현재 단계와 다음 행동을 글자와 상태 표시로 함께 알린다.
- **Do** 모바일에서 목표와 조작을 찾기 쉽게 유지한다.
- **Do** 회전 기호 밖의 설명은 읽기 쉬운 일반 글꼴로 쓴다.

### Don't:
- **Don't** 본문·목록·버튼에 큐브의 접지 그림자를 복제한다.
- **Don't** 보호자가 옆에 있다는 전제로 설명한다.
- **Don't** 색만으로 조각 위치나 완료 상태를 설명한다.
- **Don't** 시연 재생 완료를 실물 완성으로 자동 처리한다.
