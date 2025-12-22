# Feature: Engine Manager

## Description
The Engine Manager is responsible for discovering, downloading, caching, and managing different versions of DXVK and its forks (NVAPI, GPL Async). It abstracts the differences between GitHub and GitLab APIs and provides a unified interface for the frontend.

## Supported Forks
| Fork | Source | Description |
|------|--------|-------------|
| **Official** | GitHub (doitsujin/dxvk) | Mainline DXVK releases |
| **GPL Async** | GitLab (Ph42oN/dxvk-gplasync) | Async shader compilation (legacy/performance) |
| **NVAPI** | GitHub (jp7677/dxvk-nvapi) | NVIDIA-specific features |

## UI Features

The Engine Manager view provides a dedicated interface for managing DXVK versions:

### Tabs
- **Cached Engines**: Shows all locally downloaded versions, grouped by fork
- **Available Versions**: Browse and download versions from GitHub/GitLab

### Features
| Feature | Description |
|---------|-------------|
| Fork Selector | Filter available versions by Official, GPL Async, or NVAPI |
| Pre-Download | Download DXVK versions before installing to games |
| Download Progress | Real-time progress bar during downloads |
| Clear All Cache | One-click removal of all cached engines |
| Refresh | Reload cached/available engine lists |
| Grouped Display | Cached engines organized by fork |
| Version Badges | "Latest" and "Cached" indicators |

## Architecture

### Data Flow
1. **Fetch**: `fetchReleases(fork)` calls appropriate API (GitHub or GitLab).
2. **Fallback**: If API fails or is rate-limited (403), `getFallbackReleases(fork)` provides hardcoded specific versions.
3. **Download**: `downloadEngine(url)` streams generic .tar.gz or .zip to `temp/`.
4. **Extraction**: Archives are extracted to `AppData/dxvk-studio/engines/<fork>/<version>/`.
5. **Caching**: `getAllCachedEngines()` scans the filesystem to list available versions.

### Key Components
- **Service**: `electron/services/engine-manager.ts`
- **UI**: `EngineManagerView` component in `src/App.tsx`

## Technical Details

### API Abstraction
- **GitHub**: Standard REST API `GET /repos/{owner}/{repo}/releases`
- **GitLab**: REST API `GET /projects/{id}/releases` (Mapped to identical `DxvkRelease` interface)

### Fallback Mechanism
To prevent "Engine not found" errors during GitHub API rate limiting:
- A hardcoded list of known-good versions is maintained.
- If API calls fail, the system silently degrades to this list.
- Fallback downloads use direct raw file URLs to bypass API limits.

## Storage Layout
```
%APPDATA%/dxvk-studio/engines/
├── official/
│   ├── 2.7.1/
│   │   ├── x64/dxgi.dll
│   │   └── x32/d3d9.dll
├── gplasync/
│   ├── 2.7.1-1/
└── nvapi/
    ├── 0.7.1/
```

