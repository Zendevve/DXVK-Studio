import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import type { Game } from '../../src/shared/types'
import { randomUUID } from 'crypto'

export function findEpicGames(): Game[] {
  const games: Game[] = []

  // Standard Epic Manifests location
  const programData = process.env.ProgramData || 'C:\\ProgramData'
  const manifestsPath = join(programData, 'Epic', 'EpicGamesLauncher', 'Data', 'Manifests')

  if (!existsSync(manifestsPath)) {
    return []
  }

  try {
    const files = readdirSync(manifestsPath)

    for (const file of files) {
      if (file.endsWith('.item')) {
        try {
          const content = readFileSync(join(manifestsPath, file), 'utf-8')
          const manifest = JSON.parse(content)

          // Epic Manifest Structure
          // {
          //   "DisplayName": "Fortnite",
          //   "InstallLocation": "C:\\Games\\Fortnite",
          //   "LaunchExecutable": "FortniteGame\\Binaries\\Win64\\FortniteClient-Win64-Shipping.exe",
          //   ...
          // }

          const { DisplayName, InstallLocation, LaunchExecutable } = manifest

          if (DisplayName && InstallLocation && LaunchExecutable) {
            const installDir = InstallLocation
            const exePath = join(installDir, LaunchExecutable)

            if (existsSync(exePath)) {
              games.push({
                id: `epic-${randomUUID()}`,
                name: DisplayName,
                path: installDir,
                executable: exePath,
                platform: 'epic',
                dxvkStatus: 'inactive',
                vkd3dStatus: 'inactive',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                architecture: 'unknown' // Will be analyzed
              })
            }
          }
        } catch (err) {
          console.warn(`Failed to parse Epic manifest ${file}:`, err)
        }
      }
    }
  } catch (error) {
    console.error('Failed to scan Epic manifests:', error)
  }

  return games
}
