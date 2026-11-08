# 개발과 배포

큐브는 메인 포털과 분리된 Astro·TypeScript 프로젝트다. 이 저장소에서 의존성 설치, 테스트, 빌드를 실행한다.

## 실행

Node.js 22.23.4 이상이 필요하다. 현재 검증 환경은 Node.js 24.18.0과 npm 11.16.0이다.

```sh
npm ci
npm run dev
```

개발 서버는 `http://127.0.0.1:4323/`에서 실행한다. `npm run preview`는 빌드한 `dist/`를 같은 포트로 제공한다.

## 검증

```sh
npm test
npm run check
npm run build
npm run test:site
```

개발 서버를 실행한 상태에서 `npm run test:browser`로 브라우저 검사를 실행한다. Chrome 경로는 `CHROME_PATH`, 대상 서버는 `BASE_URL`로 지정한다. 결과와 캡처는 `artifacts/`에 저장한다.

새 큐브 사례는 시작 조건, 각 확인 지점, 동작 후 결과와 이전 층 보존을 검사한다. 화면의 시연 완료와 실물의 완료는 구분한다. 실제 독자의 이해도와 실물 사용성은 별도 평가가 필요하다.

빌드 결과 자체를 검사하려면 개발 서버와 다른 포트에서 `npm exec --offline -- astro preview --host 127.0.0.1 --port 4324`를 실행한 뒤 `BASE_URL`을 `http://127.0.0.1:4324`로 지정해 브라우저 검사를 실행한다. 소스 검증과 실제 초보자의 학습 성과 검증은 구분한다.

고도화 범위는 [기획안](superpowers/specs/2026-11-08-learning-reconstruction-design.md), 실행 기록은 [계획](superpowers/plans/2026-11-08-learning-reconstruction.md), 반복 작업 방식은 [AI 개발 절차](development-workflow.md)를 따른다. [사용자 관찰지](research/usability-study.md)는 실제 큐브를 준비하는 수순과 과제별 기록 양식을 포함한다.

`.impeccable/design.json`과 `.impeccable/surfaces/cube.md`는 디자인 토큰·화면 계약을 기록한다. 리뷰 캡처·도구 상태·개인 설정은 Git에 포함하지 않는다.

## 구조

- `src/content/`: 한국어·영어 수업, 사례와 진행 안내
- `src/lib/`: 회전 모델, 공식 묶음과 학습 기록
- `src/scripts/`: 재생, 관찰, 공식 연습과 테마 전환
- `src/components/`, `src/layouts/`: 화면과 공통 레이아웃
- `src/styles/`: 색·글꼴·간격 토큰과 반응형 스타일
- `tests/`, `scripts/`: 단위·브라우저·빌드 산출물 검사

## 배포

Cloudflare Pages의 빌드 명령은 `npm run build`, 빌드 출력 디렉터리는 `dist`다. 저장소의 소스·테스트·개발 문서 전체를 정적 파일로 올리지 않는다.

`SITE_URL`은 큐브 자신의 배포 주소이고, `PUBLIC_HOME_URL`은 메인 포털 주소다. 예시는 `.env.example`에 있다. 두 값은 정적 빌드 시 반영되므로 변경 후 다시 빌드한다. 비밀값은 환경변수나 배포 서비스의 비밀 저장소에서 관리한다.

메인 포털 주소가 없으면 개발 서버에서는 로컬 포털로 연결하고, 공개 빌드에서는 해당 링크를 표시하지 않는다.

직접 업로드할 때도 빌드가 성공한 `dist/`만 지정한다.

```sh
npx wrangler@4.158.0 pages deploy dist --project-name namu-cube --branch main
```

## 글꼴과 해법

글꼴은 Pretendard의 자체 호스팅 서브셋이며 라이선스와 출처는 `public/fonts/`에 있다. 새 글자가 서브셋에 없으면 시스템 글꼴로 표시한다.

[해법의 기준과 검증](research/cube-method.md)에서 알고리즘, 잡는 방향과 테스트 범위를 확인할 수 있다.
