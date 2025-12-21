<p align="center">
  <img src="public/icon.png" alt="DXVK Studio" width="128" height="128">
</p>

<h1 align="center">DXVK Studio</h1>

<p align="center">
  <strong>A modern desktop application for managing DXVK on Windows games</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows-0078D6?logo=windows&logoColor=white" alt="Platform">
  <img src="https://img.shields.io/badge/Electron-33-47848F?logo=electron&logoColor=white" alt="Electron">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</p>

---

## 🎮 What is this?

**DXVK Studio** transforms [DXVK](https://github.com/doitsujin/dxvk) from a command-line utility into a beautiful, user-friendly desktop app. DXVK translates DirectX 9/10/11 calls to Vulkan, often delivering **significant performance improvements** on modern GPUs.

### The Problem
Installing DXVK manually means downloading archives, copying DLLs to the right folders, managing config files, and hoping you got the 32-bit vs 64-bit right. Mess it up, and your game won't launch.

### The Solution
One-click installation. Automatic architecture detection. Version management. Original DLL backup and restore. All wrapped in a sleek interface.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Smart Game Discovery** | Auto-detect Steam games or add any game manually |
| 🎯 **Architecture Detection** | PE header analysis for accurate 32/64-bit detection |
| ⬇️ **Version Management** | Download and cache multiple DXVK versions from GitHub |
| 🔀 **Multiple Forks** | Official, GPL Async, and NVAPI fork support |
| 💾 **Safe Deployment** | Automatic backup of original DLLs, one-click restore |
| ⚙️ **Config Generation** | Create `dxvk.conf` with common performance settings |

---

## 🖼️ Screenshots

*Coming soon — UI built with React, TailwindCSS, and Lucide icons*

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      DXVK Studio                            │
├─────────────────────┬───────────────────────────────────────┤
│   Renderer Process  │         Main Process                  │
│   (React + TS)      │         (Electron + Node.js)          │
│                     │                                       │
│   • Game Grid UI    │   • steam-scanner.ts  → VDF parsing   │
│   • Detail Views    │   • pe-analyzer.ts    → Architecture  │
│   • Version Select  │   • engine-manager.ts → GitHub API    │
│                     │   • deployer.ts       → DLL handling  │
│         ↕           │                                       │
│   Context Bridge    │                                       │
│   (preload.ts)      │                                       │
└─────────────────────┴───────────────────────────────────────┘
```

### Tech Stack

- **Frontend**: React 18 + TypeScript + TailwindCSS
- **Desktop**: Electron 33 with context isolation
- **Build**: Vite + electron-builder
- **IPC**: Type-safe bridge via `preload.ts`

### Core Services

| Service | Responsibility |
|---------|---------------|
| `steam-scanner.ts` | Parse Steam's VDF format, discover installed games |
| `pe-analyzer.ts` | Read PE headers to detect 32-bit vs 64-bit executables |
| `engine-manager.ts` | Fetch releases from GitHub, download and cache DXVK |
| `deployer.ts` | Copy DLLs, backup originals, track via JSON manifest |

---

## 🚀 Quick Start

### Prerequisites

- Windows 10/11
- Node.js 18+
- Vulkan-capable GPU

### Development

```bash
# Clone and install
git clone https://github.com/Zendevve/dxvk-studio.git
cd dxvk-studio
npm install

# Start dev server with hot reload
npm run dev
```

### Production Build

```bash
npm run build
# Output: release/*.exe (NSIS installer + portable)
```

---

## 📁 Project Structure

```
dxvk-studio/
├── electron/
│   ├── main.ts           # App lifecycle, IPC handlers
│   ├── preload.ts        # Secure context bridge
│   └── services/         # Core business logic
├── src/
│   ├── App.tsx           # Main React component
│   ├── shared/types.ts   # Shared TypeScript types
│   └── index.css         # TailwindCSS entry
├── docs/
│   ├── PRD.md            # Product requirements
│   ├── ARCHITECTURE.md   # Technical design
│   └── ADR/              # Architecture decisions
└── AGENTS.md             # AI development rules (MCAF)
```

---

## ⚠️ Anti-Cheat Warning

> **Do NOT use DXVK with online games using kernel-level anti-cheat.**

DXVK Studio will detect and warn about:
- 🔴 EasyAntiCheat, BattlEye, Riot Vanguard
- 🟡 PunkBuster

Using DXVK with these games may result in **permanent bans**. Stick to single-player or games without invasive anti-cheat.

---

## 🗺️ Roadmap

### ✅ Completed (MVP Core)
- [x] Steam library scanning
- [x] PE header architecture detection
- [x] DXVK version fetching and caching
- [x] DLL deployment with backup/restore
- [x] Dynamic version dropdown from GitHub
- [x] Manifest-based installation tracking

### 🔜 In Progress
- [ ] Anti-cheat detection UI warnings
- [ ] Engine Manager view (list/delete cached versions)
- [ ] dxvk.conf visual editor

### 📋 Planned
- [ ] GOG Galaxy integration
- [ ] Epic Games Store integration
- [ ] Profile system for game-specific configs

---

## 🤝 Contributing

This project follows [MCAF](https://mcaf.managed-code.com/) (Managed Code Coding AI Framework).

1. Read [`AGENTS.md`](AGENTS.md) for development rules
2. Check [`docs/`](docs/) for architecture and decisions
3. Write feature docs before heavy coding
4. Tests and code move together

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Credits

Built on the shoulders of giants:

- [DXVK](https://github.com/doitsujin/dxvk) by doitsujin — the magic behind the performance gains
- [DXVK GPL Async](https://github.com/Ph42oN/dxvk-gplasync) by Ph42oN — async shader compilation
- [DXVK NVAPI](https://github.com/jp7677/dxvk-nvapi) by jp7677 — NVIDIA-specific features

---

<p align="center">
  <sub>Made with ☕ and TypeScript</sub>
</p>
