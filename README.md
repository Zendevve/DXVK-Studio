<p align="center">
  <img src="public/icon.png" alt="DXVK Studio" width="128" height="128">
</p>

<h1 align="center">DXVK Studio</h1>

<p align="center">
  <strong>A professional GUI for managing DXVK on Windows</strong>
</p>

<p align="center">
  <a href="https://github.com/Zendevve/dxvk-studio/releases/latest">
    <img src="https://img.shields.io/github/v/release/Zendevve/dxvk-studio?style=for-the-badge&color=blue" alt="Release">
  </a>
  <a href="https://github.com/Zendevve/dxvk-studio/releases">
    <img src="https://img.shields.io/github/downloads/Zendevve/dxvk-studio/total?style=for-the-badge&color=green" alt="Downloads">
  </a>
  <img src="https://img.shields.io/badge/platform-Windows%2010%2F11-0078D6?style=for-the-badge&logo=windows" alt="Platform">
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License">
  </a>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#roadmap">Roadmap</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#support">Support</a>
</p>

---

## What is DXVK Studio?

**DXVK Studio** transforms [DXVK](https://github.com/doitsujin/dxvk)—a translation layer that converts DirectX calls to Vulkan—from a command-line utility into a sleek desktop application. It lets you easily install, manage, and configure Vulkan wrappers for your entire game library.

### Why use DXVK?

- 🎮 **Revive older games** that have performance issues on modern hardware
- ⚡ **Boost FPS** in DirectX 9/10/11 games by leveraging Vulkan's efficiency
- 🔧 **Fix compatibility issues** on systems where DirectX doesn't work well

### Why use DXVK Studio?

| Without DXVK Studio | With DXVK Studio |
|---------------------|------------------|
| Download archives manually | One-click download from GitHub/GitLab |
| Extract correct DLLs (32-bit vs 64-bit) | Auto-detects game architecture |
| Copy files to game folder | Safe deployment with automatic backups |
| Edit `dxvk.conf` in a text editor | Visual configuration editor |
| Track which version is installed where | Per-game manifest tracking |

---

## Features

- **🎮 Smart Game Discovery** — Automatically scans Steam, GOG Galaxy, and Epic Games Store libraries
- **🔍 Architecture Detection** — Analyzes PE headers to determine 32-bit or 64-bit, ensuring correct DLLs
- **📦 Engine Manager** — Downloads and caches DXVK versions from Official, GPL Async, and NVAPI forks
- **🛡️ Safe Deployment** — Backs up original DLLs before installation with one-click restoration
- **⚙️ Configuration Editor** — Visual editor for `dxvk.conf` without touching config files
- **🚨 Anti-Cheat Detection** — Warns you before installing DXVK on games with anti-cheat software
- **📋 Activity Logs** — Track all operations with filterable, exportable logs

---

## Installation

### Requirements

- **OS**: Windows 10 or 11 (64-bit)
- **GPU**: Vulkan-capable graphics card with up-to-date drivers
- **RAM**: 4GB minimum

### Download

| Method | Link |
|--------|------|
| **Installer** (recommended) | [Download Latest Release](https://github.com/Zendevve/dxvk-studio/releases/latest) |
| **Portable** | Available in the releases page |

### Build from Source

For developers who want to build from source:

```bash
# Clone the repository
git clone https://github.com/Zendevve/dxvk-studio.git
cd dxvk-studio

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
# Executable will be in release/ folder
```

**Development Requirements:**
- Node.js 18+
- npm 9+

---

## Usage

### Quick Start

1. **Launch DXVK Studio** — Your games are automatically discovered
2. **Select a game** — View details and DXVK status
3. **Choose a DXVK fork and version** — Official, GPL Async, or NVAPI
4. **Click Install** — DLLs are deployed, originals are backed up
5. **Configure** — Optionally tweak settings via the Config Editor

### Adding Games Manually

Games not detected? Click **"Add Game"** and select any `.exe` file.

### Managing DXVK Versions

Use the **Engine Manager** tab to:
- Pre-download versions for offline use
- View cached engines and their sizes
- Clear cache to free disk space

---

## Roadmap

### ✅ Completed (v1.0.0)

- Steam, GOG, Epic game scanning
- One-click DXVK install/uninstall
- Multi-fork support (Official, GPL Async, NVAPI)
- Configuration editor
- Anti-cheat detection
- Activity logging

### 🔜 Planned

| Feature | Target |
|---------|--------|
| Game-specific profiles | v1.1 |
| HUD configuration UI | v1.1 |
| Profile import/export | v1.2 |
| Linux Wine/Proton support | v2.0 |

See the [CHANGELOG](CHANGELOG.md) for version history.

---

## Contributing

Contributions are welcome! Here's how to get started:

### Development Setup

```bash
# Clone and install
git clone https://github.com/Zendevve/dxvk-studio.git
cd dxvk-studio
npm install

# Run development server
npm run dev

# Run tests
npm test
```

### Guidelines

1. Read [AGENTS.md](AGENTS.md) for coding standards
2. Review the [Architecture Documentation](docs/ARCHITECTURE.md) before structural changes
3. Submit PRs to the `main` branch
4. Ensure tests pass: `npm test`

---

## Support

Need help? Here's where to go:

| Channel | Link |
|---------|------|
| 🐛 **Bug Reports** | [GitHub Issues](https://github.com/Zendevve/dxvk-studio/issues) |
| 💡 **Feature Requests** | [GitHub Discussions](https://github.com/Zendevve/dxvk-studio/discussions) |
| 📖 **Documentation** | [docs/](docs/) |

---

## Tech Stack

<p align="center">
  <a href="https://www.electronjs.org/">
    <img src="https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white" alt="Electron">
  </a>
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React">
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS">
  </a>
  <a href="https://vitejs.dev/">
    <img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  </a>
</p>

---

## Acknowledgments

- **[DXVK](https://github.com/doitsujin/dxvk)** by doitsujin — The Vulkan translation layer that makes this all possible
- **[dxvk-gplasync](https://gitlab.com/Ph42oN/dxvk-gplasync)** by Ph42oN — GPL Async fork
- **[dxvk-nvapi](https://github.com/jp7677/dxvk-nvapi)** by jp7677 — NVAPI support
- **[Lucide](https://lucide.dev/)** — Beautiful icon toolkit

---

## License

This project is licensed under the [MIT License](LICENSE).

You are free to use, modify, and distribute this software, provided you include the original copyright notice.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/Zendevve">Zendevve</a>
</p>
