# Test Strategy

## Test Levels

### Unit Tests
- Pure functions and algorithms
- Config parsing logic
- PE header parsing
- Located in: `tests/unit/`

### Integration Tests
- Electron IPC communication
- File system operations
- Steam library scanning
- Located in: `tests/integration/`

### E2E Tests
- Full user flows
- Game installation workflow
- Config editor interactions
- Located in: `tests/e2e/`

## Test Framework

- **Vitest** - Fast, Vite-native test runner
- **Playwright** - E2E testing for Electron

## Running Tests

```bash
# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Run with coverage
npm run test:coverage
```

## Coverage Goals

| Area | Target |
|------|--------|
| Core engine (`electron/services/`) | 80%+ |
| UI components | 60%+ |
| IPC handlers | 90%+ |

## Test Data

- Test fixtures in `tests/fixtures/`
- Mock Steam library structure for scanning tests
- Sample DXVK configs for parser tests

## CI Integration

Tests run on every PR via GitHub Actions.
