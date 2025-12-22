<div align="center">

<img src="public/icon.png" alt="DXVK Studio" width="120">

# DXVK Studio

**One-click DXVK management for your entire game library**

[![Release](https://img.shields.io/github/v/release/Zendevve/dxvk-studio?style=flat-square&color=blue)](https://github.com/Zendevve/dxvk-studio/releases)
[![Downloads](https://img.shields.io/github/downloads/Zendevve/dxvk-studio/total?style=flat-square&color=green)](https://github.com/Zendevve/dxvk-studio/releases)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows-0078D6?style=flat-square&logo=windows&logoColor=white)](https://github.com/Zendevve/dxvk-studio/releases)

[Download](#-installation) • [Features](#-features) • [Usage](#-usage) • [Roadmap](#-roadmap) • [Contributing](#-contributing)

---

<!-- TODO: Add demo GIF here -->
<!-- ![Demo](docs/demo.gif) -->

</div>

## 🎯 What is this?

**DXVK Studio** is a desktop application that manages [DXVK](https://github.com/doitsujin/dxvk) installations on Windows. DXVK translates DirectX 9/10/11 calls to Vulkan, which can significantly improve game performance—especially for older titles on modern hardware.

Instead of manually downloading archives, extracting DLLs, and editing config files, DXVK Studio handles everything with a few clicks.

<br>

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎮 **Smart Discovery** | Auto-detects games from Steam, GOG, and Epic |
| 🔍 **Architecture Detection** | Reads PE headers to pick 32-bit or 64-bit DLLs |
| 📦 **Multi-Fork Support** | Official, GPL Async, and NVAPI forks |
| 🛡️ **Safe Deployment** | Backs up original DLLs before any changes |
| ⚙️ **Config Editor** | Visual editor for `dxvk.conf` settings |
| 🚨 **Anti-Cheat Warnings** | Alerts you before modifying risky games |
| 📋 **Activity Logs** | Searchable, exportable operation history |

<br>

## 📥 Installation

### Download

| Type | Link |
|------|------|
| **Installer** | [DXVK Studio Setup 1.0.0.exe](https://github.com/Zendevve/dxvk-studio/releases/latest) |
| **Portable** | [DXVK Studio 1.0.0.exe](https://github.com/Zendevve/dxvk-studio/releases/latest) |

**Requirements:** Windows 10/11 (64-bit), Vulkan-capable GPU

### Build from Source

```bash
git clone https://github.com/Zendevve/dxvk-studio.git
cd dxvk-studio
npm install
npm run build
```

<br>

## 🚀 Usage

```
1. Launch DXVK Studio
2. Select a game from the auto-detected library
3. Pick a DXVK fork and version
4. Click "Install"
```

**Manual game addition:** Click `Add Game` → select any `.exe`

**Configuration:** Click the ⚙️ button on any game to edit HUD, VSync, FPS limits, etc.

**Uninstall:** Click `Uninstall` to restore original DLLs

<br>

## 🗺️ Roadmap

- [x] Multi-platform game scanning
- [x] One-click install/uninstall
- [x] Visual config editor
- [x] Anti-cheat detection
- [ ] Game-specific profiles
- [ ] HUD position editor
- [ ] Profile import/export
- [ ] Linux support

<br>

## 🤝 Contributing

Contributions welcome!

```bash
npm run dev    # Start development server
npm test       # Run tests
```

For major changes, please open an issue first.

<br>

## 📄 License

[MIT](LICENSE) © [Zendevve](https://github.com/Zendevve)

---

<div align="center">

**[⬆ Back to top](#dxvk-studio)**

</div>
