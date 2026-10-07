---
name: create-pr
description: 현재 branch의 커밋을 분석해 PR을 생성합니다. 최근 커밋에서 제목과 본문을 자동으로 추출하고, 선택한 언어(한글/영문)의 PR 템플릿을 적용해 GitHub에 PR을 생성합니다. `--lang ko` (기본) 또는 `--lang en`으로 템플릿 언어를 지정하세요. fork agent를 사용해 백그라운드에서 비동기 처리하므로 대기하지 않고 즉시 결과를 반환합니다. "PR 만들어줘", "PR 생성", "create PR", "--lang en으로 PR 만들기" 같은 요청에 사용하세요.
compatibility: "필수: gh (GitHub CLI), bun/npm/yarn 프로젝트, git 저장소. 선택: git 커밋 분석 능력"
context: fork
---

# create-pr Skill

현재 branch의 변경사항을 분석하고 GitHub PR을 자동으로 생성하는 skill입니다. fork agent를 사용해 백그라운드에서 비동기 처리합니다.

## 사용법

```bash
# 한글 템플릿으로 PR 생성 (기본)
사용자: PR 만들어줘

# 영문 템플릿으로 PR 생성
사용자: PR 만들어줘 --lang en
```

## 워크플로우

1. **현재 상태 분석**
   - `git status` — 작업 중인 파일 확인
   - `git diff` — 변경사항 확인
   - `git log` (recent 5–10 commits) — 제목/본문 추출

2. **PR 제목/본문 자동 생성**
   - 최근 커밋의 메시지와 diff를 종합해 PR 제목 결정 (50자 이하)
   - git log에서 구체적인 변경 내용, 테스트 계획 등을 추출해 본문 작성

3. **템플릿 선택 및 적용**
   - 사용자가 지정한 언어(기본 `ko`) 템플릿 로드 (see [references/ko-template.md](./references/ko-template.md), [references/en-template.md](./references/en-template.md))
   - 자동으로 생성한 제목/본문을 템플릿의 placeholder에 삽입

4. **fork agent 사용해 백그라운드 PR 생성**
   - `gh pr create` 실행
   - PR 링크 + 주요 정보 반환

## 주의사항

- **커밋 이력 필수**: 최소 1개 이상의 커밋이 main 대비 앞서야 합니다 (현재 branch가 main과 다른 커밋을 가져야 함).
- **GitHub CLI 필수**: `gh` 명령어가 설치되어 있어야 하고, 인증 상태여야 합니다.
- **언어 파라미터**: `--lang ko` (한글, 기본값) 또는 `--lang en` (영문)만 지원. 다른 값은 기본값 적용.
- **Fork 처리**: 생성된 PR 링크는 skill 완료 후 사용자 메시지로 반환됩니다. 기다리지 않고 다른 작업을 계속할 수 있습니다.

## 구현 노트

### fork 사용 이유

PR 생성 (git 분석 + gh 호출)은 I/O 작업이 많고 시간이 걸릴 수 있습니다. fork agent를 사용하면:
- 현재 대화 컨텍스트 상속 (파일 경로, 프로젝트 구조 등 자동 활용)
- 백그라운드 실행 (사용자가 기다리지 않음)
- 완료 후 알림으로 결과 보고

### 언어별 템플릿

- **한글** (`ko-template.md`): "## 요약", "## 변경사항", "## 테스트 계획" 등 한글 섹션
- **영문** (`en-template.md`): "## Summary", "## Changes", "## Test Plan" 등 영문 섹션

각 템플릿은 다음 변수를 지원합니다:
- `{{ title }}` — PR 제목
- `{{ summary }}` — 변경사항 요약
- `{{ changes }}` — 상세 변경 내용
- `{{ test_plan }}` — 테스트 계획
- `{{ breaking_changes }}` — Breaking changes 있으면 표기

### PR 생성 코드 (fork agent 내부에서 실행)

```bash
# 1. 현재 branch 정보 확인
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
BASE_BRANCH=main  # or main/master 자동 감지

# 2. 제목/본문 추출
# git log + diff 분석으로 제목과 본문 조립

# 3. 템플릿 로드 및 치환
TEMPLATE_FILE="references/${LANG}-template.md"
BODY=$(cat "$TEMPLATE_FILE" | sed "s|{{ title }}|$TITLE|g" | sed "s|{{ summary }}|$SUMMARY|g" ...)

# 4. PR 생성
gh pr create --title "$TITLE" --body "$BODY"
```

## 예시

### 입력
```
사용자: 이제 PR 만들어줘 --lang en
```

### 출력 (fork 완료 후)
```
✅ PR created successfully!
  Title: feat(component): add color picker component
  Branch: feature/color-picker → main
  URL: https://github.com/org/repo/pull/42
  
상세 내용은 PR을 확인하세요.
```
