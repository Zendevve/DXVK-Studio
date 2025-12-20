/**
 * DXVK Installation Engine
 *
 * Manages DXVK downloads, installations, and removals.
 *
 * @see docs/Features/dxvk-engine.md
 */

import { mkdir, copyFile, unlink, readdir, access, constants, rm } from 'fs/promises'
import { join, dirname } from 'path'
import { app } from 'electron'
import { createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import { Readable } from 'stream'
import { analyzePE, getRequiredDlls, getDxvkArchFolder } from './pe-parser'

// DXVK GitHub repository
const DXVK_REPO = 'doitsujin/dxvk'
const DXVK_ASYNC_REPO = 'Sporif/dxvk-async'
const DXVK_GPLASYNC_REPO = 'Ph42oN/dxvk-gplasync'

export type DxvkVariant = 'standard' | 'async' | 'gplasync'

export interface DxvkVersion {
  version: string
  variant: DxvkVariant
  path: string
  installed: boolean
}

export interface InstallResult {
  success: boolean
  error?: string
  installedFiles?: string[]
}

// Known DXVK DLL files
const DXVK_DLLS = [
  'd3d8.dll',
  'd3d9.dll',
  'd3d10.dll',
  'd3d10_1.dll',
  'd3d10core.dll',
  'd3d11.dll',
  'dxgi.dll'
]

// Protected paths - NEVER install here
const PROTECTED_PATHS = [
  'c:\\windows\\system32',
  'c:\\windows\\syswow64',
  'c:\\windows'
]

/**
 * Get the DXVK versions directory
 */
export function getVersionsDir(): string {
  return join(app.getPath('userData'), 'versions')
}

/**
 * Check if a path is protected (System32, etc.)
 */
function isProtectedPath(targetPath: string): boolean {
  const normalized = targetPath.toLowerCase().replace(/\\/g, '/')
  return PROTECTED_PATHS.some(p => normalized.startsWith(p.replace(/\\/g, '/')))
}

/**
 * Get GitHub repo for a variant
 */
function getRepoForVariant(variant: DxvkVariant): string {
  switch (variant) {
    case 'async':
      return DXVK_ASYNC_REPO
    case 'gplasync':
      return DXVK_GPLASYNC_REPO
    default:
      return DXVK_REPO
  }
}

/**
 * Fetch available versions from GitHub
 */
export async function fetchAvailableVersions(variant: DxvkVariant = 'standard'): Promise<{ tag: string, url: string }[]> {
  const repo = getRepoForVariant(variant)
  const response = await fetch(`https://api.github.com/repos/${repo}/releases`)

  if (!response.ok) {
    throw new Error(`Failed to fetch releases: ${response.statusText}`)
  }

  const releases = await response.json() as Array<{
    tag_name: string
    assets: Array<{ name: string, browser_download_url: string }>
  }>

  return releases.map(release => {
    // Find the main tarball asset
    const asset = release.assets.find(a => a.name.endsWith('.tar.gz') || a.name.endsWith('.zip'))
    return {
      tag: release.tag_name,
      url: asset?.browser_download_url || ''
    }
  }).filter(v => v.url)
}

/**
 * Download a DXVK version
 */
export async function downloadDxvk(
  version: string,
  variant: DxvkVariant = 'standard',
  onProgress?: (percent: number) => void
): Promise<string> {
  const versions = await fetchAvailableVersions(variant)
  const release = versions.find(v => v.tag === version) || versions[0]

  if (!release) {
    throw new Error('No releases found')
  }

  const versionDir = join(getVersionsDir(), `${variant}-${release.tag}`)
  await mkdir(versionDir, { recursive: true })

  const response = await fetch(release.url)
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download: ${response.statusText}`)
  }

  const contentLength = Number(response.headers.get('content-length')) || 0
  const archivePath = join(versionDir, 'dxvk.tar.gz')

  // Download with progress
  const fileStream = createWriteStream(archivePath)
  let downloaded = 0

  const reader = response.body.getReader()
  const stream = new Readable({
    async read() {
      const { done, value } = await reader.read()
      if (done) {
        this.push(null)
      } else {
        downloaded += value.length
        if (onProgress && contentLength > 0) {
          onProgress(Math.round((downloaded / contentLength) * 100))
        }
        this.push(value)
      }
    }
  })

  await pipeline(stream, fileStream)

  // Extract archive (using tar command on Windows)
  const { exec } = await import('child_process')
  const { promisify } = await import('util')
  const execAsync = promisify(exec)

  await execAsync(`tar -xzf "${archivePath}" -C "${versionDir}" --strip-components=1`)
  await unlink(archivePath)

  return versionDir
}

/**
 * Get installed DXVK versions
 */
export async function getInstalledVersions(): Promise<DxvkVersion[]> {
  const versionsDir = getVersionsDir()

  try {
    await access(versionsDir, constants.R_OK)
  } catch {
    return []
  }

  const entries = await readdir(versionsDir, { withFileTypes: true })
  const versions: DxvkVersion[] = []

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const [variant, ...versionParts] = entry.name.split('-')
      const version = versionParts.join('-')

      versions.push({
        version,
        variant: variant as DxvkVariant,
        path: join(versionsDir, entry.name),
        installed: true
      })
    }
  }

  return versions
}

/**
 * Install DXVK to a game directory
 */
export async function installDxvk(
  gamePath: string,
  exePath: string,
  versionPath: string
): Promise<InstallResult> {
  // Safety check
  if (isProtectedPath(gamePath)) {
    return {
      success: false,
      error: 'Cannot install DXVK to protected system directories'
    }
  }

  // Analyze the executable
  const analysis = await analyzePE(exePath)
  if (!analysis.isValid || !analysis.architecture) {
    return {
      success: false,
      error: analysis.error || 'Failed to analyze executable'
    }
  }

  const archFolder = getDxvkArchFolder(analysis.architecture)
  const dxvkSourceDir = join(versionPath, archFolder)

  // Check source exists
  try {
    await access(dxvkSourceDir, constants.R_OK)
  } catch {
    return {
      success: false,
      error: `DXVK ${archFolder} folder not found in version directory`
    }
  }

  // Determine which DLLs to copy based on DirectX version
  const dxVersion = analysis.dxVersion || 11 // Default to DX11 if unknown
  const requiredDlls = getRequiredDlls(dxVersion)

  const installedFiles: string[] = []
  const gameDir = dirname(exePath)

  try {
    for (const dll of requiredDlls) {
      const source = join(dxvkSourceDir, dll)
      const dest = join(gameDir, dll)

      try {
        await access(source, constants.R_OK)
        await copyFile(source, dest)
        installedFiles.push(dll)
      } catch (err) {
        // Skip if source DLL doesn't exist (some DX versions don't need all)
        console.warn(`DLL not found in DXVK: ${dll}`)
      }
    }

    return { success: true, installedFiles }
  } catch (error) {
    return {
      success: false,
      error: `Installation failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}

/**
 * Remove DXVK from a game directory
 */
export async function removeDxvk(gamePath: string): Promise<InstallResult> {
  // Safety check
  if (isProtectedPath(gamePath)) {
    return {
      success: false,
      error: 'Cannot modify protected system directories'
    }
  }

  const removedFiles: string[] = []

  try {
    for (const dll of DXVK_DLLS) {
      const dllPath = join(gamePath, dll)
      try {
        await access(dllPath, constants.F_OK)
        await unlink(dllPath)
        removedFiles.push(dll)
      } catch {
        // File doesn't exist, skip
      }
    }

    return { success: true, installedFiles: removedFiles }
  } catch (error) {
    return {
      success: false,
      error: `Removal failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}

/**
 * Check if DXVK is installed in a game directory
 */
export async function checkDxvkInstalled(gamePath: string): Promise<{ installed: boolean, dlls: string[] }> {
  const foundDlls: string[] = []

  for (const dll of DXVK_DLLS) {
    try {
      await access(join(gamePath, dll), constants.F_OK)
      foundDlls.push(dll)
    } catch {
      // Not found
    }
  }

  return {
    installed: foundDlls.length > 0,
    dlls: foundDlls
  }
}
