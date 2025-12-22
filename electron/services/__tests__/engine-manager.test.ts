/**
 * Engine Manager Unit Tests
 * Tests version caching, path handling, and release conversion
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { mkdirSync, writeFileSync, existsSync, rmSync } from 'fs'
import { join } from 'path'

// Mock Electron app before importing engine-manager
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue(join(__dirname, 'fixtures', 'appdata'))
  }
}))

// Now import the functions
import {
  getVersionPath,
  isVersionCached,
  getCachedVersions,
  releaseToEngine
} from '../engine-manager'
import type { DxvkRelease, DxvkFork } from '../../shared/types'

const FIXTURES_DIR = join(__dirname, 'fixtures')
const ENGINES_DIR = join(FIXTURES_DIR, 'appdata', 'engines')

describe('Engine Manager', () => {
  beforeAll(() => {
    // Create mock engine directory structure
    mkdirSync(join(ENGINES_DIR, 'official', '2.7.1', 'x64'), { recursive: true })
    mkdirSync(join(ENGINES_DIR, 'official', '2.7.1', 'x32'), { recursive: true })
    writeFileSync(join(ENGINES_DIR, 'official', '2.7.1', 'x64', 'dxgi.dll'), 'dummy')
    writeFileSync(join(ENGINES_DIR, 'official', '2.7.1', 'x32', 'd3d9.dll'), 'dummy')

    // Create another version directory (empty - not valid)
    mkdirSync(join(ENGINES_DIR, 'official', '2.6.1'), { recursive: true })
  })

  afterAll(() => {
    if (existsSync(FIXTURES_DIR)) {
      rmSync(FIXTURES_DIR, { recursive: true, force: true })
    }
    vi.restoreAllMocks()
  })

  describe('getVersionPath', () => {
    it('should return correct path for fork and version', () => {
      const path = getVersionPath('official', '2.7.1')
      expect(path).toContain('official')
      expect(path).toContain('2.7.1')
    })

    it('should handle different forks', () => {
      const paths = ['official', 'gplasync', 'nvapi'].map(
        fork => getVersionPath(fork as DxvkFork, '1.0.0')
      )
      expect(paths[0]).toContain('official')
      expect(paths[1]).toContain('gplasync')
      expect(paths[2]).toContain('nvapi')
    })
  })

  describe('isVersionCached', () => {
    it('should return true for cached version with DLLs', () => {
      const cached = isVersionCached('official', '2.7.1')
      expect(cached).toBe(true)
    })

    it('should return false for non-existent version', () => {
      const cached = isVersionCached('official', '99.99.99')
      expect(cached).toBe(false)
    })

    it('should return false for empty version directory', () => {
      const cached = isVersionCached('official', '2.6.1')
      expect(cached).toBe(false)
    })
  })

  describe('getCachedVersions', () => {
    it('should return list of cached versions', () => {
      const versions = getCachedVersions('official')
      expect(versions).toContain('2.7.1')
      expect(versions).toContain('2.6.1')
    })

    it('should return empty array for non-existent fork', () => {
      const versions = getCachedVersions('gplasync')
      expect(versions).toEqual([])
    })
  })

  describe('releaseToEngine', () => {
    const mockRelease: DxvkRelease = {
      tag_name: 'v2.7.1',
      published_at: '2024-01-15T10:00:00Z',
      body: 'Release notes here',
      assets: [
        {
          name: 'dxvk-2.7.1.tar.gz',
          browser_download_url: 'https://example.com/dxvk-2.7.1.tar.gz'
        }
      ]
    }

    it('should convert GitHub release to DxvkEngine', () => {
      const engine = releaseToEngine(mockRelease, 'official')

      expect(engine).not.toBeNull()
      expect(engine?.version).toBe('2.7.1')
      expect(engine?.fork).toBe('official')
      expect(engine?.downloadUrl).toBe('https://example.com/dxvk-2.7.1.tar.gz')
      expect(engine?.changelog).toBe('Release notes here')
    })

    it('should strip v prefix from version', () => {
      const engine = releaseToEngine(mockRelease, 'official')
      expect(engine?.version).toBe('2.7.1')
      expect(engine?.version).not.toContain('v')
    })

    it('should return null for release without downloadable asset', () => {
      const releaseNoAsset: DxvkRelease = {
        tag_name: 'v1.0.0',
        published_at: '2024-01-01T00:00:00Z',
        body: 'No assets',
        assets: []
      }

      const engine = releaseToEngine(releaseNoAsset, 'official')
      expect(engine).toBeNull()
    })

    it('should handle different asset types', () => {
      const releaseZip: DxvkRelease = {
        ...mockRelease,
        assets: [{
          name: 'dxvk-2.7.1.zip',
          browser_download_url: 'https://example.com/dxvk-2.7.1.zip'
        }]
      }

      const engine = releaseToEngine(releaseZip, 'official')
      expect(engine).not.toBeNull()
    })
  })
})
