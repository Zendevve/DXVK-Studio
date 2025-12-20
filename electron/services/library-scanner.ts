/**
 * Steam Library Scanner
 *
 * Parses Steam library folders and app manifests to discover installed games.
 *
 * @see docs/Features/steam-scanner.md
 */

import { readFile, readdir, access, constants } from 'fs/promises'
import { join, dirname } from 'path'
import { homedir } from 'os'

export interface SteamGame {
  appId: string
  name: string
  installDir: string
  sizeOnDisk: number
}

export interface SteamLibrary {
  path: string
  games: SteamGame[]
}

// Default Steam installation paths
const DEFAULT_STEAM_PATHS = [
  'C:\\Program Files (x86)\\Steam',
  'C:\\Program Files\\Steam',
  join(homedir(), '.steam', 'steam'), // For WSL/Linux compatibility
]

/**
 * Parse Valve's VDF format (simple key-value parser)
 * This is a simplified parser for libraryfolders.vdf and appmanifest files
 */
function parseVdf(content: string): Record<string, any> {
  const result: Record<string, any> = {}
  const lines = content.split('\n')
  const stack: Record<string, any>[] = [result]

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('//')) continue

    // Opening brace - push new object
    if (trimmed === '{') continue

    // Closing brace - pop stack
    if (trimmed === '}') {
      stack.pop()
      continue
    }

    // Key-value pair: "key" "value" or "key" { ... }
    const match = trimmed.match(/^"([^"]+)"(?:\s+"([^"]*)")?/)
    if (match) {
      const [, key, value] = match
      const current = stack[stack.length - 1]

      if (value !== undefined) {
        // Simple key-value
        current[key] = value
      } else {
        // Object - peek next line for brace
        current[key] = {}
        stack.push(current[key])
      }
    }
  }

  return result
}

/**
 * Find Steam installation directory
 */
export async function findSteamPath(): Promise<string | null> {
  for (const steamPath of DEFAULT_STEAM_PATHS) {
    try {
      await access(join(steamPath, 'steam.exe'), constants.F_OK)
      return steamPath
    } catch {
      // Try next path
    }
  }

  // Try to find from registry (Windows)
  try {
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)

    const { stdout } = await execAsync(
      'reg query "HKLM\\SOFTWARE\\WOW6432Node\\Valve\\Steam" /v InstallPath'
    )

    const match = stdout.match(/InstallPath\s+REG_SZ\s+(.+)/)
    if (match) {
      return match[1].trim()
    }
  } catch {
    // Registry query failed
  }

  return null
}

/**
 * Get all Steam library folders
 */
export async function getSteamLibraries(): Promise<string[]> {
  const steamPath = await findSteamPath()
  if (!steamPath) {
    return []
  }

  const libraryFoldersPath = join(steamPath, 'steamapps', 'libraryfolders.vdf')

  try {
    const content = await readFile(libraryFoldersPath, 'utf-8')
    const parsed = parseVdf(content)

    const libraries: string[] = []

    // Extract library paths from the VDF structure
    const libraryFolders = parsed.libraryfolders || parsed.LibraryFolders || parsed

    for (const [key, value] of Object.entries(libraryFolders)) {
      if (typeof value === 'object' && value !== null) {
        const path = (value as any).path || (value as any).Path
        if (path) {
          libraries.push(path)
        }
      } else if (typeof value === 'string' && key !== 'contentstatsid') {
        // Old format: numeric keys with path as value
        libraries.push(value)
      }
    }

    return libraries
  } catch (error) {
    console.error('Failed to parse libraryfolders.vdf:', error)
    return steamPath ? [steamPath] : []
  }
}

/**
 * Parse an app manifest file
 */
async function parseAppManifest(manifestPath: string): Promise<SteamGame | null> {
  try {
    const content = await readFile(manifestPath, 'utf-8')
    const parsed = parseVdf(content)
    const appState = parsed.AppState || parsed.appstate || parsed

    if (!appState.appid && !appState.AppID) {
      return null
    }

    return {
      appId: String(appState.appid || appState.AppID),
      name: appState.name || appState.Name || 'Unknown Game',
      installDir: join(dirname(manifestPath), 'common', appState.installdir || appState.InstallDir || ''),
      sizeOnDisk: parseInt(appState.SizeOnDisk || appState.sizeondisk || '0', 10)
    }
  } catch {
    return null
  }
}

/**
 * Scan all Steam libraries for installed games
 */
export async function scanSteamGames(): Promise<SteamGame[]> {
  const libraries = await getSteamLibraries()
  const games: SteamGame[] = []

  for (const libraryPath of libraries) {
    const steamappsPath = join(libraryPath, 'steamapps')

    try {
      const files = await readdir(steamappsPath)
      const manifests = files.filter(f => f.startsWith('appmanifest_') && f.endsWith('.acf'))

      for (const manifest of manifests) {
        const game = await parseAppManifest(join(steamappsPath, manifest))
        if (game && game.installDir) {
          // Verify the game directory exists
          try {
            await access(game.installDir, constants.R_OK)
            games.push(game)
          } catch {
            // Game directory doesn't exist, skip
          }
        }
      }
    } catch {
      // Library not accessible
    }
  }

  return games
}

/**
 * Find the main executable for a game
 */
export async function findGameExecutable(gamePath: string): Promise<string | null> {
  try {
    const files = await readdir(gamePath, { recursive: true })

    // Look for common patterns
    const exeFiles = (files as string[])
      .filter(f => f.endsWith('.exe'))
      .map(f => join(gamePath, f))

    // Prioritize:
    // 1. Root-level executables
    // 2. Executables matching game folder name
    // 3. Unreal Engine shipping builds
    // 4. Any executable

    const rootExes = exeFiles.filter(f => dirname(f) === gamePath)
    if (rootExes.length === 1) {
      return rootExes[0]
    }

    // UE4 pattern
    const ueExe = exeFiles.find(f => f.match(/Binaries[\\/]Win64[\\/].*-Win64-Shipping\.exe$/i))
    if (ueExe) {
      return ueExe
    }

    // Just return the first root exe or any exe
    return rootExes[0] || exeFiles[0] || null
  } catch {
    return null
  }
}
