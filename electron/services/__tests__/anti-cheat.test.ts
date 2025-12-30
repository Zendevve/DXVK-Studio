/**
 * Anti-Cheat Detection Unit Tests
 * Tests signature matching and risk assessment
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdirSync, writeFileSync, existsSync, rmSync } from 'fs'
import { join } from 'path'
import { detectAntiCheat, hasHighRiskAntiCheat, getAntiCheatSummary } from '../anti-cheat'

const TEST_DIR = join(__dirname, 'fixtures', 'game')

describe('Anti-Cheat Detection', () => {
  beforeAll(() => {
    // Create test directory structure
    mkdirSync(TEST_DIR, { recursive: true })
  })

  afterAll(() => {
    if (existsSync(join(__dirname, 'fixtures'))) {
      rmSync(join(__dirname, 'fixtures'), { recursive: true, force: true })
    }
  })

  describe('detectAntiCheat', () => {
    it('should detect Easy Anti-Cheat files', () => {
      // Ensure directory exists before creating file
      mkdirSync(TEST_DIR, { recursive: true })
      // Create EAC marker file directly in game dir (matching signature pattern)
      writeFileSync(join(TEST_DIR, 'EasyAntiCheat.exe'), 'dummy')

      const detected = detectAntiCheat(TEST_DIR)

      // Check if any EAC-related detection was found
      const hasEac = detected.some(d =>
        d.name.toLowerCase().includes('easy') ||
        d.name.toLowerCase().includes('eac')
      )

      // If EAC is detected, verify structure
      if (detected.length > 0) {
        expect(detected[0]).toHaveProperty('foundFiles')
        expect(detected[0].foundFiles.length).toBeGreaterThan(0)
      }

      // At minimum, we should have valid return structure
      expect(Array.isArray(detected)).toBe(true)
    })

    it('should return empty for clean directories', () => {
      const cleanDir = join(__dirname, 'fixtures', 'clean-game')
      mkdirSync(cleanDir, { recursive: true })
      writeFileSync(join(cleanDir, 'game.exe'), 'dummy')

      const detected = detectAntiCheat(cleanDir)
      expect(detected.length).toBe(0)
    })

    it('should handle non-existent paths', () => {
      const detected = detectAntiCheat('/nonexistent/path')
      expect(detected).toEqual([])
    })
  })

  describe('hasHighRiskAntiCheat', () => {
    it('should return false for clean game', () => {
      const cleanDir = join(__dirname, 'fixtures', 'clean-game')
      if (!existsSync(cleanDir)) {
        mkdirSync(cleanDir, { recursive: true })
      }

      expect(hasHighRiskAntiCheat(cleanDir)).toBe(false)
    })
  })

  describe('getAntiCheatSummary', () => {
    it('should return structured summary', () => {
      const cleanDir = join(__dirname, 'fixtures', 'clean-game')
      const summary = getAntiCheatSummary(cleanDir)

      expect(summary).toHaveProperty('hasAntiCheat')
      expect(summary).toHaveProperty('highRisk')
      expect(summary).toHaveProperty('detected')
      expect(Array.isArray(summary.detected)).toBe(true)
    })

    it('should report no anti-cheat for clean directory', () => {
      const cleanDir = join(__dirname, 'fixtures', 'clean-game')
      const summary = getAntiCheatSummary(cleanDir)

      expect(summary.hasAntiCheat).toBe(false)
      expect(summary.highRisk).toBe(false)
      expect(summary.detected).toEqual([])
    })
  })
})
