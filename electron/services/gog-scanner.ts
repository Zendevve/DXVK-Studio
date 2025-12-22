import { exec } from 'child_process'
import { promisify } from 'util'
import { join } from 'path'
import { existsSync } from 'fs'
import type { Game } from '../../src/shared/types'
import { randomUUID } from 'crypto'

const execAsync = promisify(exec)

// Registry key for GOG games
const GOG_REGISTRY_KEY = 'HKLM\\SOFTWARE\\WOW6432Node\\GOG.com\\Games'

export async function findGogGames(): Promise<Game[]> {
  const games: Game[] = []

  try {
    // 1. Query Registry for GOG Games
    // Output format:
    // HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\GOG.com\Games\1207658930
    // HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\GOG.com\Games\1423658930
    const { stdout } = await execAsync(`reg query "${GOG_REGISTRY_KEY}"`)

    const lines = stdout.split('\n').filter(line => line.trim().length > 0)
    const gameKeys = lines.filter(line => line.includes('GOG.com\\Games\\'))

    for (const key of gameKeys) {
      try {
        const gameId = key.split('\\').pop()?.trim()
        if (!gameId) continue

        // Query details for each game
        // We need: PATH, EXE, possibly DISPLAYNAME (usually in Uninstall key, but check here first)
        // Usually GOG registry keys have: 'path', 'exe', 'workingDir', 'launchCommand'?
        // The standard keys for GOG installers:
        // 'path' (Install location)
        // 'exe' (Main executable relative to path)
        // 'gameName' (Title)

        const { stdout: details } = await execAsync(`reg query "${key.trim()}" /s`)

        const pathMatch = details.match(/\s+path\s+REG_SZ\s+(.+)/i)
        const exeMatch = details.match(/\s+exe\s+REG_SZ\s+(.+)/i)
        const nameMatch = details.match(/\s+gameName\s+REG_SZ\s+(.+)/i) || details.match(/\s+displayName\s+REG_SZ\s+(.+)/i)

        if (pathMatch && exeMatch) {
          const installDir = pathMatch[1].trim()
          const exePath = join(installDir, exeMatch[1].trim())
          const name = nameMatch ? nameMatch[1].trim() : `GOG Game ${gameId}`

          if (existsSync(exePath)) {
            games.push({
              id: `gog-${randomUUID()}`,
              name,
              path: installDir, // Legacy support
              executable: exePath, // Legacy support
              platform: 'gog',
              dxvkStatus: 'inactive',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              architecture: 'unknown' // Will be analyzed later
            })
          }
        }
      } catch (err) {
        // Skip individual game errors
        console.warn(`Failed to parse GOG game key ${key}:`, err)
      }
    }

  } catch (error) {
    if ((error as any).code !== 1) { // Code 1 means key not found (no GOG games)
      console.error('Error scanning GOG registry:', error)
    }
  }

  return games
}
