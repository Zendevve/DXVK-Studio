# ADR-{{Number}}: {{Short Title}}

Status: {{Proposed / Accepted / Implemented / Rejected / Superseded}}
Date: {{YYYY-MM-DD}}
Owner: {{Owner or team}}
Related Features: {{Links to docs/Features/*}}
Supersedes: {{ADR-XXXX or N/A}}
Superseded by: {{ADR-YYYY or N/A}}

---

## Context

{{Current situation, constraints, problems.}}

---

## Decision

{{Short, direct statement of the chosen option.}}

Key points:

- {{Point 1}}
- {{Point 2}}

---

## Alternatives considered

### {{Option A}}

- Pros: {{List}}
- Cons: {{List}}
- Rejected because: {{Reason}}

### {{Option B}}

- Pros: {{List}}
- Cons: {{List}}
- Rejected because: {{Reason}}

---

## Consequences

### Positive

- {{Benefit}}

### Negative / risks

- {{Risk}}
- Mitigation: {{How to handle it}}

---

## Impact

### Code

- Affected modules / services: {{List}}
- New boundaries / responsibilities: {{Description}}

### Documentation

- Feature docs to update: {{Links}}
- Testing docs to update: {{Links}}
- Notes for `AGENTS.md`: {{New rules or patterns}}

---

## Verification

### Test commands

- build: `npm run build`
- test: `npm run test`
- dev: `npm run dev`

### New or changed tests

| ID | Scenario | Level | Expected result |
| --- | --- | --- | --- |
| {{TST-001}} | {{Happy path / negative / edge}} | {{Integration}} | {{Observable outcome}} |

---

## References

- Issues / tickets: {{Links}}
- External docs / specs: {{Links}}
- Related ADRs: {{Links}}

---

## Filing checklist

- [ ] File saved under `docs/ADR/ADR-{{Number}}-{{short-kebab-title}}.md`
- [ ] Status reflects real state
- [ ] Links to related features and tests are filled in
