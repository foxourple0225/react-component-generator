# server/AGENTS.md

## Module Context

Bun 런타임에서 직접 실행되는 AI 프록시 서버 (`bun --watch run server/index.ts`, 포트 3002). 프론트는 Vite 프록시를 통해서만 접근한다.

## Tech Stack & Constraints

- 외부 SDK 없이 `fetch`로 Anthropic/Gemini REST API를 직접 호출한다 (server/index.ts:69, 99). SDK 추가 금지.
- HTTP 서버는 `Bun.serve`, 환경변수는 `process.env`를 사용한다 (server/index.ts:60-61, 138).
- 응답 정규화 로직은 `Bun.serve` 부수효과가 없는 파일(`generator.ts`, `fallback.ts`)에 둔다. `index.ts`는 import 시 서버가 바로 기동되므로 테스트에서 import하지 마라.

## Implementation Patterns

- 새 provider 추가 시: `Provider` 유니온(index.ts:57), `ENV_KEYS`(index.ts:59), `/api/config` 응답(index.ts:150), 키 누락 오류 메시지(index.ts:171)를 모두 함께 갱신한다.
- 모든 `Response`에 `CORS_HEADERS`를 붙인다. 오류 응답 포함 (index.ts:155, 172, 178, 190, 204, 210, 217).
- 모델 폴백이 필요한 호출은 `withModelFallback(models, attempt)`로 감싼다 (index.ts:135). 모델 우선순위는 `GOOGLE_MODELS` 배열 순서다 (index.ts:5).
- 에러 분류는 `err.message.includes('503' | '429')` 문자열 매칭에 의존한다 (index.ts:194, 201). 업스트림 오류 메시지를 `... error: ${status}` 형식으로 유지해야 매핑이 깨지지 않는다 (index.ts:85, 112).

## Testing Strategy

- 명령어: `bun run test server/` (vitest, jsdom 환경으로 실행됨 — vite.config.ts:16).
- 테스트는 순수 함수 단위로 작성하고 네트워크 호출은 `vi.fn`으로 대체한다 (server/fallback.test.ts 패턴).

## Local Golden Rules

- Asymmetry: Gemini 호출에만 `finishReason === 'MAX_TOKENS'` 잘림 검사가 있고(index.ts:123) Anthropic 경로에는 없다. Anthropic 응답 처리를 수정할 때 `stop_reason: max_tokens` 잘림 처리 누락을 인지하고, 필요하면 사용자에게 제안한다.
- Asymmetry: 모델 폴백은 Google 경로에만 적용된다 (index.ts:134-136). Anthropic은 단일 모델(`claude-haiku-4-5-20251001`, index.ts:77) 고정이다.
- Security Boundary: 클라이언트가 보낸 `apiKey`가 환경변수 키보다 우선한다 (index.ts:65). 두 키 모두 응답 본문, 로그(`console.log`), 오류 메시지에 포함시키지 마라. Gemini는 키가 URL 쿼리에 들어가므로(index.ts:99) 요청 URL을 로깅하거나 오류에 포함하면 키가 유출된다.
- Hard Constraint: 시스템 프롬프트는 TypeScript 문법 금지, import 금지, 마지막 `render(<X />)` 호출을 요구한다 (index.ts:11-20). 프롬프트를 바꾸면 미리보기(react-live noInline)가 깨질 수 있으므로 `stripCodeFences`/`ensureRenderCall`과 함께 검토한다.
- Double Defense: `render()` 호출 보장은 프롬프트 지시(index.ts:12)와 `ensureRenderCall` 후처리(generator.ts:238) 두 곳에서 이중으로 처리한다. 한쪽을 제거하지 마라.
- Double Defense: 코드펜스 제거도 프롬프트 지시(index.ts:16)와 `stripCodeFences`(generator.ts:227) 이중 방어다.
