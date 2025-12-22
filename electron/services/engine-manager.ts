/**
 * DXVK Engine Manager
 * Handles downloading, caching, and managing DXVK versions
 */

import { existsSync, mkdirSync, createWriteStream, readdirSync, rmSync } from 'fs'
import { join } from 'path'
import { app } from 'electron'
import { pipeline } from 'stream/promises'
import { createGunzip } from 'zlib'
import { extract } from 'tar'
import type { DxvkEngine, DxvkFork, DxvkRelease } from '../shared/types'

// GitHub API endpoints for DXVK releases
const GITHUB_REPOS: Record<DxvkFork, string> = {
  official: 'doitsujin/dxvk',
  gplasync: 'Ph42oN/dxvk-gplasync',
  nvapi: 'jp7677/dxvk-nvapi'
}

/**
 * Get the base path for DXVK engine storage
 */
export function getEnginesPath(): string {
  const userDataPath = app?.getPath?.('userData') ?? join(process.env.APPDATA || '', 'dxvk-studio')
  const enginesPath = join(userDataPath, 'engines')

  if (!existsSync(enginesPath)) {
    mkdirSync(enginesPath, { recursive: true })
  }

  return enginesPath
}

/**
 * Get the path for a specific DXVK version
 */
export function getVersionPath(fork: DxvkFork, version: string): string {
  return join(getEnginesPath(), fork, version)
}

/**
 * Check if a DXVK version is cached locally
 */
export function isVersionCached(fork: DxvkFork, version: string): boolean {
  const versionPath = getVersionPath(fork, version)
  return existsSync(join(versionPath, 'x64', 'dxgi.dll')) ||
    existsSync(join(versionPath, 'x32', 'd3d9.dll'))
}

/**
 * Get all cached versions for a fork
 */
export function getCachedVersions(fork: DxvkFork): string[] {
  const forkPath = join(getEnginesPath(), fork)

  if (!existsSync(forkPath)) {
    return []
  }

  try {
    return readdirSync(forkPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
  } catch {
    return []
  }
}

/**
 * Calculate directory size recursively
 */
function getDirectorySize(dirPath: string): number {
  let size = 0

  try {
    const entries = readdirSync(dirPath, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name)

      if (entry.isFile()) {
        const { statSync } = require('fs')
        size += statSync(fullPath).size
      } else if (entry.isDirectory()) {
        size += getDirectorySize(fullPath)
      }
    }
  } catch {
    // Skip directories we can't read
  }

  return size
}

/**
 * Get all cached engines across all forks with size info
 */
export function getAllCachedEngines(): Array<{
  fork: DxvkFork
  version: string
  path: string
  sizeBytes: number
}> {
  const engines: Array<{
    fork: DxvkFork
    version: string
    path: string
    sizeBytes: number
  }> = []

  const forks: DxvkFork[] = ['official', 'gplasync', 'nvapi']

  for (const fork of forks) {
    const versions = getCachedVersions(fork)

    for (const version of versions) {
      const versionPath = getVersionPath(fork, version)
      const sizeBytes = getDirectorySize(versionPath)

      engines.push({
        fork,
        version,
        path: versionPath,
        sizeBytes
      })
    }
  }

  return engines
}

/**
 * Fetch releases from GitHub API
 */
export async function fetchReleases(fork: DxvkFork, limit = 10): Promise<DxvkRelease[]> {
  const repo = GITHUB_REPOS[fork]
  const url = `https://api.github.com/repos/${repo}/releases?per_page=${limit}`

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DXVK-Studio'
      }
    })

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`)
    }

    return await response.json() as DxvkRelease[]
  } catch (error) {
    console.error(`Failed to fetch releases for ${fork}:`, error)
    return []
  }
}

/**
 * Convert GitHub release to DxvkEngine
 */
export function releaseToEngine(release: DxvkRelease, fork: DxvkFork): DxvkEngine | null {
  // Find the download asset - DXVK uses ZIP files
  const asset = release.assets.find(a =>
    a.name.endsWith('.zip') || a.name.endsWith('.tar.gz') || a.name.endsWith('.tar.xz')
  )

  if (!asset) {
    console.warn(`No downloadable asset found for release ${release.tag_name}`)
    return null
  }

  const version = release.tag_name.replace(/^v/, '')

  return {
    id: `${fork}-${version}`,
    version,
    fork,
    releaseDate: release.published_at,
    downloadUrl: asset.browser_download_url,
    localPath: getVersionPath(fork, version),
    cached: isVersionCached(fork, version),
    changelog: release.body
  }
}

/**
 * Get all available engines (fetches from GitHub and merges with cached)
 */
export async function getAvailableEngines(fork: DxvkFork): Promise<DxvkEngine[]> {
  const releases = await fetchReleases(fork)
  const engines = releases
    .map(r => releaseToEngine(r, fork))
    .filter((e): e is DxvkEngine => e !== null)

  // Update cached status
  for (const engine of engines) {
    engine.cached = isVersionCached(fork, engine.version)
    if (engine.cached) {
      engine.localPath = getVersionPath(fork, engine.version)
    }
  }

  return engines
}

/**
 * Download and extract a DXVK version
 */
export async function downloadEngine(
  fork: DxvkFork,
  version: string,
  downloadUrl: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const versionPath = getVersionPath(fork, version)
  const tempPath = join(getEnginesPath(), `temp-${fork}-${version}.tar.gz`)

  // Create directory
  mkdirSync(versionPath, { recursive: true })

  try {
    // Download the tarball
    const response = await fetch(downloadUrl)
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`)
    }

    const contentLength = parseInt(response.headers.get('content-length') || '0')
    let downloadedBytes = 0

    // Create write stream for temp file
    const fileStream = createWriteStream(tempPath)
    const reader = response.body?.getReader()

    if (!reader) {
      throw new Error('No response body')
    }

    // Download with progress
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      fileStream.write(value)
      downloadedBytes += value.length

      if (onProgress && contentLength > 0) {
        onProgress(Math.round((downloadedBytes / contentLength) * 100))
      }
    }

    fileStream.close()

    // Extract the tarball
    await extract({
      file: tempPath,
      cwd: versionPath,
      strip: 1 // Remove the top-level directory from the archive
    })

    // Clean up temp file
    rmSync(tempPath, { force: true })

    return versionPath

  } catch (error) {
    // Clean up on failure
    rmSync(tempPath, { force: true })
    rmSync(versionPath, { recursive: true, force: true })
    throw error
  }
}

/**
 * Delete a cached engine version
 */
export function deleteEngine(fork: DxvkFork, version: string): void {
  const versionPath = getVersionPath(fork, version)

  if (existsSync(versionPath)) {
    rmSync(versionPath, { recursive: true, force: true })
  }
}

/**
 * Get the DLL paths for a specific engine and architecture
 */
export function getEngineDlls(fork: DxvkFork, version: string, architecture: '32' | '64'): string[] {
  const versionPath = getVersionPath(fork, version)
  const archFolder = architecture === '32' ? 'x32' : 'x64'
  const dllPath = join(versionPath, archFolder)

  if (!existsSync(dllPath)) {
    return []
  }

  try {
    return readdirSync(dllPath)
      .filter(f => f.endsWith('.dll'))
      .map(f => join(dllPath, f))
  } catch {
    return []
  }
}
