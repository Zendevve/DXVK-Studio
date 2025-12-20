import { contextBridge, ipcRenderer } from 'electron'

/**
 * Secure API exposed to the renderer process via contextBridge
 * All communication with the main process goes through this interface
 */
const electronAPI = {
  // Game Library
  scanSteamLibrary: () => ipcRenderer.invoke('scan-steam-library'),
  getGames: () => ipcRenderer.invoke('get-games'),

  // DXVK Management
  installDxvk: (gamePath: string, variant: string) =>
    ipcRenderer.invoke('install-dxvk', gamePath, variant),
  removeDxvk: (gamePath: string) =>
    ipcRenderer.invoke('remove-dxvk', gamePath),
  getDxvkStatus: (gamePath: string) =>
    ipcRenderer.invoke('get-dxvk-status', gamePath),

  // Configuration
  getConfig: (gamePath: string) =>
    ipcRenderer.invoke('get-config', gamePath),
  saveConfig: (gamePath: string, config: object) =>
    ipcRenderer.invoke('save-config', gamePath, config),

  // Version Management
  downloadDxvk: (version: string) =>
    ipcRenderer.invoke('download-dxvk', version),
  getAvailableVersions: () =>
    ipcRenderer.invoke('get-available-versions'),
  getInstalledVersions: () =>
    ipcRenderer.invoke('get-installed-versions'),

  // PE Analysis
  analyzeExecutable: (exePath: string) =>
    ipcRenderer.invoke('analyze-executable', exePath),

  // Events
  onProgress: (callback: (progress: number) => void) => {
    ipcRenderer.on('progress', (_event, progress) => callback(progress))
    return () => ipcRenderer.removeAllListeners('progress')
  }
}

// Expose the API to the renderer
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// Type definition for TypeScript
export type ElectronAPI = typeof electronAPI
