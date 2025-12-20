# AGENTS.md

DXVK Studio — Electron + React + TypeScript

Follows [MCAF](https://mcaf.managed-code.com/)

---

## Conversations (Self-Learning)

Learn the user's habits, preferences, and working style. Extract rules from conversations, save to "## Rules to follow", and generate code according to the user's personal rules.

**Update requirement (core mechanism):**

Before doing ANY task, evaluate the latest user message.
If you detect a new rule, correction, preference, or change → update `AGENTS.md` first.
Only after updating the file you may produce the task output.
If no new rule is detected → do not update the file.

**When to extract rules:**

- prohibition words (never, don't, stop, avoid) → add NEVER rule
- requirement words (always, must, make sure, should) → add ALWAYS rule
- memory words (remember, keep in mind, note that) → add rule
- process words (the process is, the workflow is, we do it like) → add to workflow
- future words (from now on, going forward) → add permanent rule

**Strong signal (add IMMEDIATELY):**

- swearing, frustration, anger, sarcasm → critical rule
- ALL CAPS, excessive punctuation (!!!, ???) → high priority
- same mistake twice → permanent emphatic rule
- user undoes your changes → understand why, prevent

---

## Rules to follow (Mandatory, no exceptions)

### Commands

- build: `npm run build`
- dev: `npm run dev`
- test: `npm run test`
- format: `npm run format`
- lint: `npm run lint`

### Task Delivery (ALL TASKS)

- Read assignment, inspect code and docs before planning
- Write multi-step plan before implementation
- Implement code and tests together
- Run tests in layers: new → related suite → broader regressions
- After all tests pass: run format, then build
- Summarize changes and test results before marking complete
- Always run required builds and tests yourself; do not ask the user to execute them

### Documentation (ALL TASKS) - MCAF MANDATORY

- All docs live in `docs/`
- Update feature docs when behaviour changes
- Update ADRs when architecture changes
- **Phase plans and roadmaps MUST be saved as files in `docs/Development/`**
- Templates in `docs/templates/`

### Testing (ALL TASKS)

- Every behaviour change needs sufficient automated tests
- Prefer integration/E2E tests over unit tests for UI
- No mocks for internal systems — use real implementations
- Never delete or weaken a test to make it pass

### Design System (CRITICAL)

- Follow Laws of UX at all times (see `docs/Design/laws-of-ux.md`)
- Use CSS custom properties from `src/index.css`
- Minimum 44px touch targets (Fitts's Law)
- Animations under 400ms (Doherty Threshold)
- Dark theme only - no light mode switching
- Group related elements visually (Law of Proximity)

### Code Style

- TypeScript strict mode always enabled
- No magic literals — extract to constants or CSS variables
- Component files: PascalCase (e.g., `GameGrid.tsx`)
- CSS files: match component name (e.g., `GameGrid.css`)

### Critical (NEVER violate)

- Never commit secrets, keys, connection strings
- Never mock Electron IPC in integration tests
- Never skip tests to make PR green
- Never approve or merge (human decision)
- **NEVER FORGET MCAF** - docs first, tests with code, AGENTS.md current

### Boundaries

**Always:**

- Read AGENTS.md and docs before editing code
- Run dev server before committing UI changes

**Ask first:**

- Changing IPC API contracts
- Adding new dependencies
- Modifying Electron main process

---

## Preferences

### Likes

- Premium dark themes with subtle gradients
- Glassmorphism effects
- Smooth micro-animations
- Clean, scannable layouts
- MCAF compliance

### Dislikes

- Basic/ugly UIs
- Light themes
- Placeholder content
- Mocked components
- Forgetting documentation
