## Summary

{{ summary }}

## Changes

{{ changes }}

## Test Plan

{{ test_plan }}

{% if breaking_changes %}
## ⚠️ Breaking Changes

{{ breaking_changes }}
{% endif %}

## Checklist

- [ ] Code review completed
- [ ] Tests passing (`bun run test`)
- [ ] Lint passing (`bun run lint`)
- [ ] Build successful (`bun run build`)
- [ ] Documentation updated (if needed)
- [ ] CHANGELOG updated (if needed)
