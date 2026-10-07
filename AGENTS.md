# AGENTS.md

## Operational Commands

- 패키지 매니저는 `bun` 고정 (`bun.lock` 존재). npm/yarn/pnpm 사용 금지.
- 설치: `bun install`
- 개발 (API 서버 :3002 + Vite :5173 동시): `bun run dev`
- 빌드 (타입체크 포함): `bun run build`
- 린트: `bun run lint`
- 테스트 전체: `bun run test` (vitest run, `src/**`와 `server/**` 모두 포함 — vite.config.ts:18)
- 단일 파일 테스트: `bun run test server/generator.test.ts`
- 변경 완료 전 `bun run lint`, `bun run test`, `bun run build`를 모두 통과시킨다.

## Project Context

프롬프트로 React 컴포넌트를 AI가 생성하고 react-live로 미리보기하는 도구.

Tech Stack: React 19, TypeScript 5.9, Vite 8, Vitest 4, Testing Library, react-live, Bun(API 서버), ESLint 9.

## Golden Rules

### Immutable

- `.env`와 API 키를 커밋하거나 코드에 하드코딩하지 않는다. `.env`는 `.gitignore`에 등록되어 있다 (.gitignore:32).
- 서버의 환경변수 키 값은 클라이언트로 내려보내지 않는다. `/api/config`는 존재 여부(boolean)만 반환한다 (server/index.ts:150-153). 키 값 자체를 응답에 포함하지 마라.

### Do's & Don'ts

- Do: 타입 import는 `import type`을 사용한다. `verbatimModuleSyntax`가 켜져 있다 (tsconfig.app.json:40). 예: src/hooks/useComponentGenerator.ts:2.
- Do: TypeScript 문법은 erasable 한 것만 쓴다. `erasableSyntaxOnly`가 켜져 있어 `enum`, `namespace`, 생성자 parameter property는 컴파일 오류다 (tsconfig.app.json:49).
- Do: 서버로 가는 요청은 상대 경로 `/api/*`로 호출한다. Vite 프록시가 :3002로 전달한다 (vite.config.ts:9-14). 포트 하드코딩 금지.
- Don't: 미리보기 코드는 `LiveProvider noInline`으로 실행된다 (src/components/LivePreview.tsx:10). 생성 코드에 `render(<Comp />)` 호출이 필수이며, 이를 보장하는 로직은 server/generator.ts의 `ensureRenderCall`이다. noInline 설정을 제거하지 마라.
- Don't: 프론트(`src/`)에 `Bun.*`/`process.env`를 import/사용하지 않는다. tsconfig.app.json은 `src`만, tsconfig.node.json은 `vite.config.ts`만 포함하며 `server/`는 Bun이 직접 실행한다.

### 테스트 경계

- 테스트가 있는 영역: `server/generator.ts`, `server/fallback.ts`, `src/components/PromptInput.tsx`. 이 파일을 수정하면 해당 `.test` 파일을 함께 갱신한다.
- 테스트가 없는 영역: `server/index.ts`(HTTP 핸들러, Bun.serve 부수효과), `src/hooks/useComponentGenerator.ts`, `src/App.tsx`. 로직을 추가할 때는 부수효과 없는 순수 함수로 분리해 `server/generator.ts`처럼 테스트 가능하게 만든다 (server/generator.ts:1-2 주석 참고).

## Context Map

- **[프론트엔드 UI/훅 수정](./src/AGENTS.md)** — React 컴포넌트, 훅, 테스트 작업 시.
- **[API 서버 수정](./server/AGENTS.md)** — Bun 서버, provider 호출, 응답 정규화 작업 시.

## Standards & References

- 프로젝트 소개, 실행 방법, 기능 목록은 README.md 참조. 여기에 반복하지 않는다.
- 주석과 UI 문구는 한국어로 작성한다 (기존 코드 전반의 관례).
- 커밋 메시지: `feat|fix|refactor|chore: 한국어 요약` 형식 (git log 기준). 상세 절차는 `commit` 스킬을 따른다.
- Maintenance Policy: 이 문서의 규칙과 실제 코드가 어긋나면 작업을 멈추고 AGENTS.md 갱신을 사용자에게 제안한다.
