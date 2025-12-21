# ADR-002: Windows-First Development Strategy

Status: Accepted
Date: 2024-12-21
Owner: Developer
Related Features: All
Supersedes: N/A
Superseded by: N/A

---

## Context

DXVK is used on both Linux (via Wine/Proton) and Windows (native). The original PRD specified cross-platform support for Linux, Windows, and macOS. However, resources are limited and the codebase must be focused.

---

## Decision

**Windows is the ONLY priority for MVP (v1.x)**. Linux and macOS support is deferred to v2.0.

Key points:

- All file paths use Windows conventions
- No Wine/Proton/Lutris integration in v1.x
- Steam scanner only supports Windows Steam paths
- NSIS installer for Windows distribution

---

## Alternatives considered

### Cross-platform MVP

- Pros: Larger initial user base
- Cons: 3x development effort, complex testing matrix, Wine prefix management complexity
- Rejected because: Scope creep, risk of shipping incomplete features on all platforms

### Linux-first (following DXVK's primary use case)

- Pros: Aligns with DXVK's main audience
- Cons: Developer is on Windows, Wine testing infrastructure needed
- Rejected because: Practical development constraints

---

## Consequences

### Positive

- Focused development effort
- Simpler testing (Windows only)
- Faster MVP delivery

### Negative / risks

- Linux users cannot use v1.x
- Mitigation: Document clearly, plan v2.0 for Linux support
- Architecture must still allow future cross-platform
- Mitigation: Use platform abstraction where possible

---

## Impact

### Code

- `steam-scanner.ts`: Windows paths only
- `deployer.ts`: Windows DLL handling only
- `AGENTS.md`: Critical rule added to never implement Linux until v2.0

### Documentation

- PRD updated with Windows focus
- Implementation plan prioritizes Windows features

---

## References

- User directive: "focus on windows. windows. windows."
