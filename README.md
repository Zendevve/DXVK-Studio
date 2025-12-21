# DXVK Studio

> Professional DXVK management suite for Windows gamers

![Platform: Windows](https://img.shields.io/badge/platform-Windows-0078D6?logo=windows)
![Electron](https://img.shields.io/badge/Electron-33-47848F?logo=electron)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![License: MIT](https://img.shields.io/badge/license-MIT-green)

---

## 🎮 What is DXVK Studio?

DXVK Studio simplifies installing and managing [DXVK](https://github.com/doitsujin/dxvk) for Windows games. DXVK translates DirectX 9/10/11 calls to Vulkan, often improving performance on modern GPUs.

**Features:**
- 🔍 Auto-detect Steam games
- ⚡ One-click DXVK installation
- 🔄 Multiple DXVK fork support (Official, GPL Async, NVAPI)
- 💾 Automatic DLL backup & restore
- 🎯 32-bit and 64-bit architecture detection
- ⚠️ Anti-cheat detection warnings

---

## 📸 Screenshots

*Coming soon*

---

## 🚀 Quick Start

### Prerequisites
- Windows 10/11
- Modern GPU with Vulkan support
- [Latest Vulkan drivers](https://www.vulkan.org/tools#vulkan-gpu-resources)

### Installation

1. Download the latest release from [Releases](https://github.com/your-repo/releases)
2. Run the installer or use the portable version
3. Launch DXVK Studio
4. Click "Scan Steam" to discover your games
5. Select a game and click "Install DXVK"

---

## 🛠️ Development

### Setup
```bash
# Install dependencies
npm install

# Start development mode
npm run dev
```

### Build
```bash
# Create production build
npm run build
```

### Project Structure
```
dxvk-studio/
├── electron/           # Main process & services
│   ├── main.ts
│   ├── preload.ts
│   └── services/
├── src/                # React renderer
│   ├── App.tsx
│   └── shared/types.ts
├── docs/               # Documentation
│   ├── PRD.md
│   └── ARCHITECTURE.md
└── .agent/             # AI development rules
    └── AGENTS.md
```

---

## ⚠️ Anti-Cheat Warning

> **Do NOT use DXVK with online multiplayer games that use kernel-level anti-cheat!**

DXVK Studio will detect and warn about:
- EasyAntiCheat
- BattlEye
- Riot Vanguard
- PunkBuster

Using DXVK with these games may result in **game bans**.

---

## 📖 Documentation

- [Product Requirements](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Agent Rules](.agent/AGENTS.md)

---

## 🤝 Contributing

Contributions welcome! Please read [AGENTS.md](.agent/AGENTS.md) for development guidelines.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [DXVK](https://github.com/doitsujin/dxvk) by doitsujin
- [DXVK GPL Async](https://github.com/Ph42oN/dxvk-gplasync) by Ph42oN
- [DXVK NVAPI](https://github.com/jp7677/dxvk-nvapi) by jp7677
