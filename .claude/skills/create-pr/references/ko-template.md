## 요약

{{ summary }}

## 변경사항

{{ changes }}

## 테스트 계획

{{ test_plan }}

{% if breaking_changes %}
## ⚠️ Breaking Changes

{{ breaking_changes }}
{% endif %}

## 체크리스트

- [ ] 코드 리뷰 완료
- [ ] 테스트 통과 (`bun run test`)
- [ ] 린트 통과 (`bun run lint`)
- [ ] 빌드 성공 (`bun run build`)
- [ ] 문서 업데이트 (필요시)
- [ ] 변경사항을 CHANGELOG에 기록 (필요시)
