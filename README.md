<div align="center">

<img src="ExlvaIBD.jpg" alt="DXVK Studio" width="120">

# DXVK Studio

A Windows desktop app that makes [DXVK](https://github.com/doitsujin/dxvk) easy for everyone.

[![Release](https://img.shields.io/github/v/release/Zendevve/dxvk-studio?style=flat-square&color=0969da)](https://github.com/Zendevve/dxvk-studio/releases)
[![Downloads](https://img.shields.io/github/downloads/Zendevve/dxvk-studio/total?style=flat-square&color=2da44e)](https://buymeacoffee.com/zendevve/e/530420)
[![License](https://img.shields.io/badge/license-Proprietary-red?style=flat-square)](#license)
[![Built with Electron](https://img.shields.io/badge/built%20with-Electron-47848f?style=flat-square&logo=electron&logoColor=white)](https://electronjs.org)
[![Discord](https://img.shields.io/badge/Discord-Join%20Server-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.com/invite/q5mSx7uFuC)

<br>

<img src="docs/screenshot.png" alt="DXVK Studio" width="700">

</div>

---

## ⚠️ No Longer Maintained

**DXVK Studio Community Edition is no longer actively developed.** Development has moved to **DXVK Studio Enterprise Edition (EE)** — the free Community Edition remains available here as the final release, but issues, pull requests, and releases are no longer being handled in this repository. The software is provided as-is under the license stated at the bottom of this page.

---

## What does it do?

DXVK is a translation layer that converts DirectX calls to Vulkan. It can **boost FPS in older games** and fix compatibility issues on modern systems. The problem? Installing it manually is tedious and technical.

**DXVK Studio automates all of that.** Point it at your games, pick a version, click install. Done.

---

## Features

- **Auto-detects your games** from Steam, GOG Galaxy, and Epic Games Store
- **Handles 32-bit and 64-bit** automatically by reading executable headers
- **Multiple DXVK forks** — Official, GPL Async (shader stutter fix), and NVAPI
- **Safe installs** — backs up original DLLs before any changes
- **Visual config editor** — tweak HUD, VSync, FPS limits without touching files
- **Anti-cheat warnings** — alerts you before modifying online games
- **Activity logs** — see everything the app has done

---

## Installation

> **License Notice**: This software is proprietary. See the [LICENSE](LICENSE) file for the full terms: personal, non-commercial use only — no modification, redistribution, or reuse of the code without prior written permission from the copyright holder.

---

### Option 1: Buy Pre-Built (Recommended)

**[Get DXVK Studio on Buy me a Coffee →](https://buymeacoffee.com/zendevve/e/530420)**

Download, run the installer, done. Supports ongoing development.

**System Requirements:**
- Windows 10/11 (64-bit)
- Vulkan-capable GPU (NVIDIA, AMD, or Intel Arc)

> **⚠️ Note:** The installer is not code-signed (code signing certificates cost $200-400/year). Windows SmartScreen may show a warning on first run—click **"More info" → "Run anyway"** to proceed.

---

### Option 2: Build From Source

For developers who prefer to compile the application themselves.

#### Prerequisites

You must have the following installed and properly configured:

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | v20.0.0+ (LTS) | [Download](https://nodejs.org/) — includes npm. Verify with `node -v` |
| **npm** | v10.0.0+ | Comes with Node.js. Verify with `npm -v` |
| **Git** | Latest | [Download](https://git-scm.com/download/win) — required for cloning |
| **Python** | 3.10+ | [Download](https://python.org) — required by node-gyp for native modules |
| **Visual Studio Build Tools** | 2022 | [Download](https://visualstudio.microsoft.com/visual-cpp-build-tools/) — required for compiling native Node.js addons |

> **⚠️ Important:** The Visual Studio Build Tools installation requires selecting the **"Desktop development with C++"** workload, which includes the MSVC compiler, Windows SDK, and CMake tools.

#### Native Module Dependencies

This project uses `better-sqlite3`, a native Node.js addon that requires compilation during installation. If you encounter errors during `npm install`, ensure:

1. Python is in your system PATH
2. Visual Studio Build Tools are installed with C++ workload
3. You're running the terminal as Administrator (if permission errors occur)

#### Build Steps

```bash
# 1. Clone the repository
git clone https://github.com/Zendevve/dxvk-studio.git
cd dxvk-studio

# 2. Install dependencies (may take several minutes due to native compilation)
npm install

# 3. Verify the installation succeeded
npm test

# 4. Start development server with hot reload
npm run dev
```

#### Creating a Production Build

To create distributable binaries:

```bash
# Full production build (TypeScript compilation + Vite bundling + Electron packaging)
npm run build
```

This generates:
- `release/DXVK Studio Setup X.X.X.exe` — NSIS installer
- `release/DXVK Studio X.X.X.exe` — Portable executable

> **Note:** The build process requires all native dependencies to be properly compiled. If you encounter errors, ensure your Visual Studio Build Tools installation includes the Windows 10/11 SDK.

#### Troubleshooting Build Errors

| Error | Solution |
|-------|----------|
| `node-gyp` fails | Install Visual Studio Build Tools with C++ workload |
| `better-sqlite3` compilation error | Run `npm config set msvs_version 2022` then reinstall |
| Python not found | Add Python to PATH or run `npm config set python /path/to/python.exe` |
| EACCES permission denied | Run terminal as Administrator |
| Electron download fails | Check firewall/proxy settings; Electron binaries are ~100MB |

---

## Usage

1. Launch the app — your games appear automatically
2. Click a game → choose fork and version → click **Install**
3. To undo, click **Uninstall** — original files are restored

---

## For Developers

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Electron 33 |
| UI | React 18 + TypeScript |
| Styling | TailwindCSS |
| Build | Vite + electron-builder |
| Testing | Vitest |
| Database | better-sqlite3 (native addon) |

### Architecture

```
electron/
├── main.ts              # App entry, IPC handlers
├── preload.ts           # Context bridge (security)
└── services/
    ├── steam-scanner.ts # VDF parsing, registry queries
    ├── gog-scanner.ts   # GOG Galaxy registry integration
    ├── epic-scanner.ts  # Epic manifest parsing
    ├── pe-analyzer.ts   # PE header reading (32/64-bit detection)
    ├── engine-manager.ts# GitHub/GitLab API, download, cache
    ├── deployer.ts      # DLL installation, backup, restore
    └── anti-cheat.ts    # Signature detection

src/
├── App.tsx              # Main UI controller
├── components/          # Reusable React components
└── shared/types.ts      # Shared TypeScript interfaces
```

### Development Commands

```bash
npm run dev          # Start with hot reload
npm test             # Run test suite
npm run lint         # ESLint check
npm run build        # Production build
```

### Key Design Decisions

- **Windows-first**: Registry queries, PE parsing, native paths — built for Windows from day one
- **Offline-capable**: Downloaded engines are cached locally
- **Non-destructive**: Every install creates backups; uninstall always works
- **No admin required**: Operates entirely in user space

---

## Roadmap

| Status | Feature |
|--------|---------|
| ✅ | Multi-launcher game detection |
| ✅ | One-click DXVK install/uninstall |
| ✅ | Config editor with visual UI |
| ✅ | Anti-cheat detection |
| ✅ | Per-game configuration profiles |
| ✅ | HUD position/scale editor |
| 📋 | Profile import/export |
| 📋 | Linux support |

---

## Redistribution Policy

This software is proprietary. The rights and restrictions below mirror the [LICENSE](LICENSE) file.

### What You May Do

- ✅ Download, view, study, fork, and install the software for personal, non-commercial use

### What Is Prohibited

- ❌ Distributing compiled binaries, installers, or executable files without explicit permission
- ❌ Hosting pre-built releases for download on any platform without explicit permission
- ❌ Creating "repacks" or unofficial public builds without explicit permission

### Enforcement

Distribution rights are exclusively reserved to the copyright holder (Zendevve).

Unauthorized distribution may result in:
- DMCA takedown notices
- Cease and desist letters
- Copyright infringement litigation
- Statutory damages under applicable law
- Recovery of legal costs

### Official Distribution

Authorized sources for compiled binaries:
- [Official Buy me a Coffee Store](https://buymeacoffee.com/zendevve/e/530420)

Any other source is unauthorized unless explicitly approved by the copyright holder.

---

## Contributing

This repository is **no longer maintained** — development has moved to DXVK Studio Enterprise Edition. Pull requests and issues are not being accepted here.

---

## Community

Join the [Discord server](https://discord.com/invite/q5mSx7uFuC) to ask questions, suggest features, or hang out. This is the best place to reach the developer.

---

## License

Proprietary — © 2024–2026 Zendevve. All rights reserved.

DXVK Studio Community Edition is licensed under the terms in the **[LICENSE](LICENSE)** file ("COPYRIGHT NOTICE AND LIMITED PERSONAL USE TERMS"). This is **not** an open-source license. In plain terms:

**You may:**
- Download, view, study, fork, and install the software for personal, non-commercial use
- Make copies only as technically necessary for downloading, installing, backing up, or using the software as distributed

**You may not (without prior written permission from the copyright holder):**
- Modify, adapt, or create derivative works from the software or its source code
- Redistribute, mirror, re-upload, publish, or host the software or modified versions on any platform
- Sell, rent, sublicense, bundle, or include it in any commercial offering
- Copy, extract, reuse, port, or incorporate any part of the source code, architecture, logic, design, or original assets into another project
- Remove copyright notices, change attribution, or claim authorship

**Forks** are permitted only for personal viewing, study, backup, or installation — forks may not be modified, redistributed, or used as the basis for another project without prior written permission.

Any use outside these permissions is prohibited unless explicitly authorized in writing by the copyright holder.

For permission requests, contact [Zendevve](https://github.com/Zendevve) or the [Discord server](https://discord.com/invite/q5mSx7uFuC).

---

<div align="center">

Made by [Zendevve](https://github.com/Zendevve)

</div>
