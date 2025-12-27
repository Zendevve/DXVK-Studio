import { spawn } from 'child_process'
import { join } from 'path'
import { existsSync } from 'fs'
import type { Game } from '../../src/shared/types'
import { randomUUID } from 'crypto'

// Registry key for GOG games
const GOG_REGISTRY_KEY = 'HKLM\\SOFTWARE\\WOW6432Node\\GOG.com\\Games'

/**
 * Safe registry query using spawn (no shell interpolation)
 */
function queryRegistry(key: string, recursive = false): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = ['query', key]
    if (recursive) args.push('/s')

    const proc = spawn('reg', args, { shell: false, windowsHide: true })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data) => { stdout += data.toString() })
    proc.stderr.on('data', (data) => { stderr += data.toString() })

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout)
      } else {
        reject(new Error(stderr || `reg query failed with code ${code}`))
      }
    })

    proc.on('error', reject)
  })
}

export async function findGogGames(): Promise<Game[]> {
  const games: Game[] = []

  try {
    // 1. Query Registry for GOG Games
    const stdout = await queryRegistry(GOG_REGISTRY_KEY)

    const lines = stdout.split('\n').filter(line => line.trim().length > 0)
    const gameKeys = lines.filter(line => line.includes('GOG.com\\Games\\'))

    for (const key of gameKeys) {
      try {
        const gameId = key.split('\\').pop()?.trim()
        if (!gameId) continue

        // Query details for each game using safe spawn
        const details = await queryRegistry(key.trim(), true)

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
              path: installDir,
              executable: exePath,
              platform: 'gog',
              dxvkStatus: 'inactive',
              vkd3dStatus: 'inactive',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              architecture: 'unknown'
            })
          }
        }
      } catch (err) {
        // Skip individual game errors
        console.warn(`Failed to parse GOG game key ${key}:`, err)
      }
    }

  } catch (error) {
    // Code 1 means key not found (no GOG games) - this is expected
    if ((error as any).message?.includes('code 1')) {
      // Silent - no GOG installed
    } else {
      console.error('Error scanning GOG registry:', error)
    }
  }

  return games
}

