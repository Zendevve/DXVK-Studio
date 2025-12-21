# Testing Strategy

## Test Levels

| Level | Purpose | Location | Framework |
|-------|---------|----------|-----------|
| Unit | Pure functions, algorithms | `tests/unit/` | Jest (planned) |
| Integration | Components with real services | `tests/integration/` | Jest + Electron (planned) |
| E2E | Full user flows | `tests/e2e/` | Playwright (planned) |

---

## Current Test Coverage

> ⚠️ **Note**: Automated testing infrastructure is not yet configured.

### Manual Verification Checklist

#### Steam Library Scanning
- [ ] Detects Steam installation
- [ ] Parses libraryfolders.vdf correctly
- [ ] Finds games in multiple library folders
- [ ] Returns correct game paths

#### PE Analysis
- [ ] Correctly identifies 32-bit executables
- [ ] Correctly identifies 64-bit executables
- [ ] Handles invalid PE files gracefully
- [ ] Filters out non-game executables

#### DXVK Engine Management
- [ ] Fetches releases from GitHub API
- [ ] Downloads tar.gz archives
- [ ] Extracts to correct cache directory
- [ ] Reports download progress

#### Deployment
- [ ] Backs up original DLLs
- [ ] Copies correct architecture DLLs
- [ ] Creates manifest file
- [ ] Uninstall restores originals
- [ ] Uninstall removes manifest

---

## Test Commands

```bash
# Run all tests (when configured)
npm run test

# Run specific test file
npm run test -- path/to/test

# Run with coverage
npm run test -- --coverage
```

---

## Test Environment

### Requirements
- Node.js 18+
- Windows 10/11
- Steam installed (for integration tests)

### Setup
```bash
npm install
npm run dev  # Start dev server for manual testing
```

---

## Coverage Goals

| Area | Target | Current |
|------|--------|---------|
| Services | 80% | 0% |
| IPC Handlers | 70% | 0% |
| React Components | 60% | 0% |

---

## Test Data

### Sample Games
Tests should use games that are:
- Free (for CI accessibility)
- Small download size
- Both 32-bit and 64-bit versions available

### Mock Data Location
`tests/fixtures/` (when created)
