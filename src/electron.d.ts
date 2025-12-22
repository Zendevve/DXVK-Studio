/**
 * TypeScript declarations for Electron IPC API
 * This file makes Window.electronAPI available to the React app
 */

import type { Game, DxvkFork, DxvkEngine, DxvkConfig, PEAnalysisResult } from './shared/types'

export interface DownloadProgress {
  fork: DxvkFork
  version: string
  percent: number
}

declare global {
  interface Window {
    electronAPI: {
      // Dialogs
      openFileDialog: () => Promise<string | null>
      openFolderDialog: () => Promise<string | null>

      // File System
      pathExists: (path: string) => Promise<boolean>
      openPath: (path: string) => Promise<string>

      // Game Discovery
      scanAllGames: () => Promise<Partial<Game>[]>
      scanSteamLibrary: () => Promise<Partial<Game>[]> // Deprecated
      checkSteamInstalled: () => Promise<boolean>
      searchMetadata: (term: string) => Promise<number | null>
      searchMetadataMultiple: (term: string) => Promise<Array<{
        id: number
        name: string
        imageUrl: string
      }>>

      // PE Analysis
      analyzeExecutable: (path: string) => Promise<PEAnalysisResult>
      findExecutables: (gamePath: string) => Promise<string[]>

      // Engines
      getAvailableEngines: (fork: DxvkFork) => Promise<DxvkEngine[]>
      getCachedVersions: (fork: DxvkFork) => Promise<string[]>
      isEngineCached: (fork: DxvkFork, version: string) => Promise<boolean>
      downloadEngine: (fork: DxvkFork, version: string, url: string) => Promise<{ success: boolean; path?: string; error?: string }>
      onDownloadProgress: (callback: (progress: DownloadProgress) => void) => void
      removeDownloadProgressListener: () => void
      getAllCachedEngines: () => Promise<Array<{
        fork: DxvkFork
        version: string
        path: string
        sizeBytes: number
      }>>
      deleteEngine: (fork: DxvkFork, version: string) => Promise<{ success: boolean; error?: string }>

      // Deployment
      installDxvk: (gamePath: string, gameId: string, fork: DxvkFork, version: string, architecture: '32' | '64') =>
        Promise<{ success: boolean; manifest?: unknown; error?: string }>
      uninstallDxvk: (gamePath: string) => Promise<{ success: boolean; error?: string }>
      checkDxvkStatus: (gamePath: string) => Promise<{
        installed: boolean
        version?: string
        fork?: DxvkFork
        integrity?: string
      }>

      // Config
      saveConfig: (gamePath: string, config: DxvkConfig) => Promise<{ success: boolean; error?: string }>

      // Anti-Cheat
      detectAntiCheat: (gamePath: string) => Promise<Array<{
        name: string
        files: string[]
        riskLevel: 'high' | 'medium' | 'low'
        description: string
        foundFiles: string[]
      }>>
      getAntiCheatSummary: (gamePath: string) => Promise<{
        hasAntiCheat: boolean
        highRisk: boolean
        detected: string[]
      }>
    }
  }
}

export { }
