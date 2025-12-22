# DXVK Studio

DXVK Studio is a Windows desktop application for managing [DXVK](https://github.com/doitsujin/dxvk) installations across your game library. It automates downloading, installing, and configuring DXVK—a Vulkan-based translation layer that can improve performance in DirectX 9/10/11 games.

![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11-0078D6?logo=windows)
![License](https://img.shields.io/badge/license-MIT-green)
![Release](https://img.shields.io/github/v/release/Zendevve/dxvk-studio)

## Installation

Download the latest release from the [Releases page](https://github.com/Zendevve/dxvk-studio/releases).

**Requirements:**
- Windows 10 or 11 (64-bit)
- Vulkan-capable GPU with updated drivers

Or build from source:

```bash
git clone https://github.com/Zendevve/dxvk-studio.git
cd dxvk-studio
npm install
npm run build
```

The executable will be in the `release/` folder.

## Usage

1. Launch DXVK Studio — games from Steam, GOG, and Epic are automatically detected
2. Select a game from your library
3. Choose a DXVK fork (Official, GPL Async, or NVAPI) and version
4. Click **Install** — original DLLs are backed up automatically
5. To remove DXVK, click **Uninstall** — original files are restored

### Adding games manually

Click **Add Game** and select any `.exe` file.

### Configuration

Click the **Config** button on any game to open the visual editor for `dxvk.conf` settings like HUD options, VSync, and frame rate limits.

## Roadmap

- [ ] Game-specific configuration profiles
- [ ] HUD position/scale editor
- [ ] Profile import/export
- [ ] Linux support

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

```bash
# Development
npm run dev

# Run tests
npm test
```

## License

[MIT](LICENSE)
