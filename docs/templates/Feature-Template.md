# Feature: {{Feature Name}}

Status: {{Draft / In Progress / Complete}}
Owner: {{Owner}}
Created: {{YYYY-MM-DD}}
Updated: {{YYYY-MM-DD}}

---

## Purpose

{{What this feature does and why it exists.}}

---

## Business Rules

- {{Rule 1}}
- {{Rule 2}}

---

## User Flows

### Main Flow

1. {{Step 1}}
2. {{Step 2}}
3. {{Step 3}}

### Alternative Flows

#### {{Alternative A}}

1. {{Step}}

---

## Components

| Component | File | Responsibility |
|-----------|------|---------------|
| {{Name}} | {{path/to/file}} | {{What it does}} |

---

## Test Flows

### Positive Tests

| ID | Scenario | Preconditions | Expected Result |
|----|----------|---------------|-----------------|
| P1 | {{Happy path}} | {{State}} | {{Outcome}} |

### Negative Tests

| ID | Scenario | Preconditions | Expected Result |
|----|----------|---------------|-----------------|
| N1 | {{Error case}} | {{State}} | {{Error handling}} |

### Edge Cases

| ID | Scenario | Preconditions | Expected Result |
|----|----------|---------------|-----------------|
| E1 | {{Boundary}} | {{State}} | {{Outcome}} |

---

## Definition of Done

- [ ] All test flows pass
- [ ] Documentation updated
- [ ] Code review complete
- [ ] No new lint errors

---

## Related

- ADRs: {{Links}}
- Other Features: {{Links}}
