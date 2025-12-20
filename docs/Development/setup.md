# Development Setup

## Prerequisites

- Node.js 18+
- npm 9+
- Git

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Zendevve/dxvk-studio.git
cd dxvk-studio

# Install dependencies
npm install

# Start development server
npm run dev
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Electron + Vite dev server |
| `npm run build` | Build for production |
| `npm run test` | Run test suite |
| `npm run format` | Format code with Prettier |
| `npm run lint` | Run ESLint |

## Project Structure

```
dxvk-studio/
├── electron/           # Electron main process
│   ├── main.ts        # App entry point
│   ├── preload.ts     # Secure IPC bridge
│   └── services/      # Core engine services
├── src/               # React renderer process
│   ├── components/    # UI components
│   ├── stores/        # Zustand state
│   ├── App.tsx        # Root component
│   └── index.css      # Design system
├── docs/              # MCAF documentation
│   ├── Features/      # Feature specifications
│   ├── ADR/           # Architecture decisions
│   ├── Testing/       # Test strategy
│   └── Development/   # This folder
└── AGENTS.md          # AI agent rules
```

## Development Workflow (MCAF)

1. **Before coding**: Write/update feature doc in `docs/Features/`
2. **Implement**: Code and tests together
3. **Verify**: Run tests, format, lint
4. **Document**: Update AGENTS.md if new patterns discovered
5. **Review**: PR and merge

## IDE Setup

Recommended extensions:
- ESLint
- Prettier
- TypeScript Vue Plugin (Volar) - for TSX support
