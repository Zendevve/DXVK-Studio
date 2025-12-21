# DXVK Studio Architecture

> Technical architecture for DXVK Studio Windows application

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          DXVK Studio                                 │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐    IPC    ┌────────────────────────────┐     │
│  │   Renderer        │◄─────────►│   Main Process             │     │
│  │   (React + TS)    │  Bridge   │   (Electron + Node.js)     │     │
│  │                   │           │                            │     │
│  │  ┌─────────────┐  │           │  ┌──────────────────────┐  │     │
│  │  │ App.tsx     │  │           │  │  steam-scanner.ts    │  │     │
│  │  │ Components  │  │           │  │  pe-analyzer.ts      │  │     │
│  │  │ Views       │  │           │  │  engine-manager.ts   │  │     │
│  │  └─────────────┘  │           │  │  deployer.ts         │  │     │
│  │                   │           │  └──────────────────────┘  │     │
│  │  Sandboxed        │           │  Full Node.js Access       │     │
│  └───────────────────┘           └────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       External Systems                               │
├──────────────────┬──────────────────┬───────────────────────────────┤
│  File System     │  GitHub API      │  Steam Library                │
│  (DLL Deploy)    │  (Releases)      │  (VDF Files)                  │
└──────────────────┴──────────────────┴───────────────────────────────┘
```

---

## Process Architecture

### Main Process (`electron/main.ts`)
- Electron app lifecycle management
- Window creation and management
- IPC handler registration
- Service orchestration

### Preload Script (`electron/preload.ts`)
- Context bridge between main and renderer
- Type-safe API exposure via `window.electronAPI`
- Event listener management

### Renderer Process (`src/`)
- React application
- TailwindCSS styling
- User interface components
- State management (React hooks)

---

## Service Layer

### Steam Scanner
**File**: `electron/services/steam-scanner.ts`

```
Input: None (auto-discovers Steam)
Output: SteamApp[]

Flow:
1. Search common Steam paths
2. Read libraryfolders.vdf
3. Parse VDF format
4. Scan appmanifest_*.acf files
5. Return game list with paths
```

### PE Analyzer
**File**: `electron/services/pe-analyzer.ts`

```
Input: exePath (string)
Output: PEAnalysisResult

Flow:
1. Open file handle
2. Read DOS header (MZ signature)
3. Read PE offset at 0x3C
4. Read PE signature
5. Read Machine type
6. Return architecture (32/64/unknown)
```

### Engine Manager
**File**: `electron/services/engine-manager.ts`

```
Responsibilities:
- Fetch releases from GitHub API
- Download tar.gz archives
- Extract to cache directory
- Track cached versions
- Provide DLL paths

Storage: %APPDATA%/dxvk-studio/engines/{fork}/{version}/
```

### Deployer
**File**: `electron/services/deployer.ts`

```
Install Flow:
1. Get engine DLLs for architecture
2. Backup existing DLLs (.bak_dxvk_studio)
3. Copy DXVK DLLs to game directory
4. Write deployment manifest

Uninstall Flow:
1. Read manifest
2. Remove DXVK DLLs
3. Restore backed up DLLs
4. Delete manifest
```

---

## IPC Communication

### Handler Naming Convention
```
{namespace}:{action}
```

| Namespace | Actions |
|-----------|---------|
| `dialog` | `openFile`, `openFolder` |
| `fs` | `exists` |
| `shell` | `openPath` |
| `games` | `scanSteam`, `checkSteam` |
| `pe` | `analyze`, `findExecutables` |
| `engines` | `getAvailable`, `getCached`, `isCached`, `download` |
| `dxvk` | `install`, `uninstall`, `checkStatus` |
| `config` | `save` |

### Response Pattern
```typescript
// Success
{ success: true, data: T }

// Failure
{ success: false, error: string }
```

---

## Data Models

### Game
```typescript
interface Game {
  id: string              // "steam-{appId}" or "manual-{timestamp}"
  name: string
  path: string            // Directory containing executable
  executable: string      // e.g., "game.exe"
  architecture: '32' | '64' | 'unknown'
  platform: 'steam' | 'manual'
  steamAppId?: string
  dxvkStatus: 'active' | 'inactive' | 'outdated' | 'corrupt'
  dxvkVersion?: string
  dxvkFork?: DxvkFork
}
```

### DxvkEngine
```typescript
interface DxvkEngine {
  id: string              // "{fork}-{version}"
  version: string         // e.g., "2.4"
  fork: 'official' | 'gplasync' | 'nvapi'
  releaseDate: string     // ISO date
  downloadUrl: string     // GitHub asset URL
  localPath?: string      // Local cache path
  cached: boolean
  changelog?: string      // GitHub release body
}
```

### DeploymentManifest
```typescript
interface DeploymentManifest {
  gameId: string
  engineVersion: string
  engineFork: DxvkFork
  architecture: Architecture
  installedAt: string     // ISO date
  dlls: DeployedDll[]
  configPath?: string     // Path to dxvk.conf if created
}
```

---

## Security Model

### Sandboxing
- Renderer has **no** direct Node.js access
- All file operations go through IPC
- Context isolation enabled

### User Consent
- Anti-cheat warnings before install
- No auto-running on startup
- User must initiate all operations

### Data Safety
- Original DLLs always backed up
- Manifest tracks all changes
- Full restore on uninstall

---

## File Locations

| Purpose | Windows Path |
|---------|-------------|
| App Data | `%APPDATA%\dxvk-studio\` |
| Engine Cache | `%APPDATA%\dxvk-studio\engines\` |
| Logs | `%APPDATA%\dxvk-studio\logs\` |
| Temp Downloads | `%APPDATA%\dxvk-studio\engines\temp-*` |
| Deployment Manifest | `{gamePath}\dxvk_studio_manifest.json` |
| DXVK Config | `{gamePath}\dxvk.conf` |
| DLL Backups | `{gamePath}\*.bak_dxvk_studio` |

---

## Build Pipeline

```
npm run dev
    │
    ├─► Vite dev server (React)
    └─► Electron with hot reload

npm run build
    │
    ├─► TypeScript compilation
    ├─► Vite production build
    └─► electron-builder
         │
         ├─► NSIS installer (.exe)
         └─► Portable (.exe)
```

---

## Future Considerations

### v1.1 - Extended Discovery
- GOG Galaxy integration
- Epic Games Store integration
- Windows Registry fallback

### v1.2 - Configuration
- Profile system
- Per-game dxvk.conf
- HUD customization

### v2.0 - Cross-Platform
- Linux Wine/Proton support
- macOS CrossOver support
- Platform abstraction layer
