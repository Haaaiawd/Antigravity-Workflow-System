# ADR Template (Architecture Decision Record)

## Purpose
This template is used to record major architecture decisions. Each ADR should focus on a **single decision**.

---

## Template

```markdown
# ADR-[Number]: [Decision Title]

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-XXX]

## Date
[YYYY-MM-DD]

## Context
[Describe the problem or situation driving this decision]
- What are the project requirements?
- What constraints exist?
- What are stakeholder expectations?

## Decision Drivers
[List key factors influencing the decision]
- Driver 1: ...
- Driver 2: ...

## Options Considered

### Option A: [Name]
- **Description**: [Brief description]
- **Pros**: 
  - ...
- **Cons**:
  - ...

### Option B: [Name]
[Same format as above]

## Decision
[Clearly state the selected option and the core rationale]

## Consequences

### Positive
- ...

### Negative
- ...

### Follow-up Actions Required
- ...

## References
- [Link or citation]

## Impact Scope
<!--  Record which systems reference this ADR to trace impact when modified -->

This ADR is referenced by the following systems:
- [{System Name}](../04_SYSTEM_DESIGN/{System Name}.md) - §8 Trade-offs
- [To be added]

> **Maintenance Note**: When SYSTEM_DESIGN references this ADR in §8, add the reference record here.
```

---

## Best Practices

1. **Keep it concise**: An ADR should be readable in a few minutes
2. **Focus on one decision**: Split complex decisions into multiple ADRs
3. **Immutable**: Once accepted, treat as historical record; create a new ADR for changes
4. **Version control**: Store ADRs in Git alongside code
5. **Team collaboration**: Gather team feedback before finalizing
6. **Track impact**: In the "Impact Scope" section, record systems that reference this ADR so impact is immediately visible when changes happen
