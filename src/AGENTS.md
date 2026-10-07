# src/AGENTS.md

## Module Context

Vite로 번들되는 브라우저 프론트엔드. `/api/generate`, `/api/config`만 호출하며 AI provider를 직접 호출하지 않는다.

## Tech Stack & Constraints

- 스타일은 `App.css`/`index.css`의 공용 클래스(`window`, `btn`, `control`, `field` 등)를 사용한다. UI 라이브러리와 CSS-in-JS는 도입하지 않았다 (src/App.tsx:50-190의 클래스 기반 마크업).
- 데이터 요청은 `fetch`만 사용한다 (src/hooks/useComponentGenerator.ts:41, src/App.tsx:26).
- 컴포넌트는 named export(`export function X`), `App`만 default export다 (src/App.tsx:193).

## Implementation Patterns

- 서버 통신과 목록 상태는 `useComponentGenerator` 훅에 둔다. 컴포넌트는 props로만 받는다 (src/App.tsx:22-23).
- Provider별 라벨/placeholder는 `PROVIDER_CONFIG` 한 곳에서 관리한다 (src/App.tsx:9-12). provider를 추가하면 여기와 `src/types/index.ts`의 `Provider`를 함께 갱신한다.
- 컴포넌트 props 타입은 같은 파일 상단의 `interface XxxProps`로 선언한다 (src/components/PromptInput.tsx:3, CodeView.tsx:3).
- 접근성 속성(`aria-label`, `role`, `aria-hidden`)을 기존처럼 유지한다 (src/App.tsx:58, 69, 124, 170).

## Testing Strategy

- 명령어: `bun run test src/`. jsdom 환경, `src/test/setup.ts`가 `jest-dom` 매처 등록과 테스트마다 `cleanup()`을 처리한다.
- 쿼리는 `getByRole` + 화면에 보이는 한국어 이름을 사용한다 (src/components/PromptInput.test.tsx:9, 30). 버튼/라벨 문구를 바꾸면 테스트도 같이 수정한다.
- 사용자 상호작용은 `@testing-library/user-event`를 사용한다.

## Local Golden Rules

- Security Boundary: 사용자가 입력한 API 키는 React state에만 보관한다 (src/App.tsx:15). `localStorage`/`sessionStorage`/쿠키에 저장하거나 로그에 남기지 마라. 코드에 저장 로직이 전혀 없다.
- Security Boundary: provider를 바꾸면 입력된 키를 비운다 (src/App.tsx:42-45). 다른 provider로 키가 전송되는 것을 막는 처리이므로 제거하지 마라.
- Hard Constraint: 서버가 반환한 AI 코드는 `react-live`가 브라우저에서 실행한다 (src/components/LivePreview.tsx:10). 코드를 별도 경로로 `eval`/`new Function`/`dangerouslySetInnerHTML`로 실행하지 말고 `LivePreview`를 거친다.
- Asymmetry: `GeneratedComponent.createdAt`은 `Date`다 (src/types/index.ts:7). JSON 직렬화 경로(저장, 전송)를 추가하면 문자열로 바뀌므로 변환을 처리한다.
- Double Defense: 키 누락은 클라이언트(src/App.tsx:35-38)와 서버(server/index.ts:169)에서 모두 검사한다. 한쪽만 제거하지 마라.
- Test Boundary: 테스트는 `PromptInput`에만 있다. `App.tsx`의 키 검증/provider 전환 로직과 `useComponentGenerator`를 수정할 때는 테스트를 추가한다.
