# DXVK Studio

The definitive open-source DXVK management suite for Windows. Obsoletes WoJ DXVK Manager and script-based solutions by offering all premium features for free.

## Features (MVP)

- 🎮 **Automatic Game Detection** - Scans Steam library automatically
- 🔍 **Smart Architecture Detection** - PE header analysis for 32-bit/64-bit
- ⚡ **One-Click Installation** - Install DXVK with a single click
- ⚙️ **Visual Config Editor** - GUI for dxvk.conf settings
- 🔄 **Version Management** - Download and manage multiple DXVK versions

## Tech Stack

- **Runtime**: Electron 28+
- **Frontend**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Vanilla CSS (Laws of UX compliant)

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Project Structure

```
dxvk-studio/
├── electron/           # Main process
│   ├── main.ts        # Entry point
│   ├── preload.ts     # IPC bridge
│   └── services/      # Core engine
├── src/               # Renderer process
│   ├── components/    # React components
│   ├── App.tsx        # Root component
│   └── index.css      # Design system
├── docs/              # Documentation (MCAF)
│   ├── Features/      # Feature specifications
│   ├── ADR/           # Architecture decisions
│   ├── Testing/       # Test strategy
│   └── Development/   # Setup guides
└── AGENTS.md          # AI agent rules
```

## Documentation

This project follows [MCAF](https://mcaf.managed-code.com/) (Managed Code AI Framework).

- [Development Roadmap](docs/Development/roadmap.md)
- [Feature Docs](docs/Features/)
- [Architecture Decisions](docs/ADR/)

## License

MIT
