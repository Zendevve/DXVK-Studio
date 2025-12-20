/**
 * DXVK Studio - Electron Main Process
 *
 * Registers IPC handlers for all core engine functionality.
 */

import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'

// Import services
import { analyzePE } from './services/pe-parser'
import {
  installDxvk,
  removeDxvk,
  checkDxvkInstalled,
  fetchAvailableVersions,
  getInstalledVersions,
  downloadDxvk,
  getVersionsDir,
  type DxvkVariant
} from './services/dxvk-engine'
import { scanSteamGames, findGameExecutable } from './services/library-scanner'
import { loadConfig, saveConfig, type DxvkConfig } from './services/config-parser'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false  // Required for fs access in services
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0a0a0f',
    show: false
  })

  // Graceful show to avoid white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }
}

// ============================================
// IPC Handlers
// ============================================

function registerIpcHandlers() {
  // --- PE Analysis ---
  ipcMain.handle('analyze-executable', async (_event, exePath: string) => {
    return analyzePE(exePath)
  })

  // --- Steam Library ---
  ipcMain.handle('scan-steam-library', async () => {
    const games = await scanSteamGames()

    // Enrich with executable analysis
    const enrichedGames = await Promise.all(
      games.map(async (game) => {
        const exePath = await findGameExecutable(game.installDir)
        if (!exePath) {
          return {
            ...game,
            exePath: null,
            architecture: 'unknown',
            dxVersion: null,
            dxvkInstalled: false
          }
        }

        const analysis = await analyzePE(exePath)
        const dxvkStatus = await checkDxvkInstalled(game.installDir)

        return {
          id: game.appId,
          name: game.name,
          path: game.installDir,
          exePath,
          architecture: analysis.architecture || 'unknown',
          dxVersion: analysis.dxVersion || null,
          dxvkInstalled: dxvkStatus.installed,
          dxvkVersion: null,  // TODO: detect version
          storefront: 'steam' as const
        }
      })
    )

    return enrichedGames
  })

  // --- DXVK Installation ---
  ipcMain.handle('install-dxvk', async (_event, gamePath: string, exePath: string, versionPath: string) => {
    return installDxvk(gamePath, exePath, versionPath)
  })

  ipcMain.handle('remove-dxvk', async (_event, gamePath: string) => {
    return removeDxvk(gamePath)
  })

  ipcMain.handle('get-dxvk-status', async (_event, gamePath: string) => {
    return checkDxvkInstalled(gamePath)
  })

  // --- Version Management ---
  ipcMain.handle('get-available-versions', async (_event, variant: DxvkVariant = 'standard') => {
    return fetchAvailableVersions(variant)
  })

  ipcMain.handle('get-installed-versions', async () => {
    return getInstalledVersions()
  })

  ipcMain.handle('download-dxvk', async (event, version: string, variant: DxvkVariant = 'standard') => {
    const result = await downloadDxvk(version, variant, (progress) => {
      event.sender.send('progress', progress)
    })
    return result
  })

  ipcMain.handle('get-versions-dir', async () => {
    return getVersionsDir()
  })

  // --- Config Management ---
  ipcMain.handle('get-config', async (_event, gamePath: string) => {
    return loadConfig(gamePath)
  })

  ipcMain.handle('save-config', async (_event, gamePath: string, config: DxvkConfig) => {
    await saveConfig(gamePath, config)
    return { success: true }
  })

  // --- Dialogs ---
  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openDirectory']
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('select-executable', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openFile'],
      filters: [{ name: 'Executables', extensions: ['exe'] }]
    })
    return result.canceled ? null : result.filePaths[0]
  })
}

// ============================================
// App Lifecycle
// ============================================

app.whenReady().then(() => {
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
