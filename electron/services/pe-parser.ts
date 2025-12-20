/**
 * PE Header Parser
 *
 * Analyzes Windows PE executables to detect:
 * - Architecture (32-bit / 64-bit)
 * - DirectX version dependencies (D3D8, D3D9, D3D10, D3D11)
 *
 * @see docs/Features/pe-analysis.md
 */

import { readFile, access, constants } from 'fs/promises'
import { join } from 'path'

// PE Header constants
const MZ_SIGNATURE = 0x5A4D  // "MZ"
const PE_SIGNATURE = 0x00004550  // "PE\0\0"
const PE_OFFSET_LOCATION = 0x3C

// Machine types
const IMAGE_FILE_MACHINE_I386 = 0x014c
const IMAGE_FILE_MACHINE_AMD64 = 0x8664

// DirectX DLL patterns to search for
const DX_PATTERNS = {
  d3d8: /d3d8\.dll/i,
  d3d9: /d3d9\.dll/i,
  d3d10: /d3d10\.dll/i,
  d3d10core: /d3d10core\.dll/i,
  d3d11: /d3d11\.dll/i,
  dxgi: /dxgi\.dll/i
}

export interface PEAnalysisResult {
  isValid: boolean
  error?: string
  architecture?: 'x86' | 'x64'
  dxVersion?: 8 | 9 | 10 | 11 | null
  detectedDlls?: string[]
}

/**
 * Analyze a PE executable file
 */
export async function analyzePE(filePath: string): Promise<PEAnalysisResult> {
  try {
    // Check file exists
    await access(filePath, constants.R_OK)
  } catch {
    return { isValid: false, error: 'File not found or not readable' }
  }

  try {
    const buffer = await readFile(filePath)

    // Check MZ signature
    if (buffer.length < 64) {
      return { isValid: false, error: 'File too small to be a valid PE' }
    }

    const mzSig = buffer.readUInt16LE(0)
    if (mzSig !== MZ_SIGNATURE) {
      return { isValid: false, error: 'Not a valid PE file (missing MZ signature)' }
    }

    // Get PE header offset
    const peOffset = buffer.readUInt32LE(PE_OFFSET_LOCATION)
    if (peOffset + 24 > buffer.length) {
      return { isValid: false, error: 'Invalid PE header offset' }
    }

    // Check PE signature
    const peSig = buffer.readUInt32LE(peOffset)
    if (peSig !== PE_SIGNATURE) {
      return { isValid: false, error: 'Not a valid PE file (missing PE signature)' }
    }

    // Read Machine type (offset peOffset + 4)
    const machineType = buffer.readUInt16LE(peOffset + 4)

    let architecture: 'x86' | 'x64'
    if (machineType === IMAGE_FILE_MACHINE_I386) {
      architecture = 'x86'
    } else if (machineType === IMAGE_FILE_MACHINE_AMD64) {
      architecture = 'x64'
    } else {
      return { isValid: false, error: `Unknown machine type: 0x${machineType.toString(16)}` }
    }

    // Detect DirectX version by scanning binary for DLL patterns
    const { dxVersion, detectedDlls } = detectDirectXVersion(buffer)

    return {
      isValid: true,
      architecture,
      dxVersion,
      detectedDlls
    }
  } catch (error) {
    return {
      isValid: false,
      error: `Failed to parse PE: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}

/**
 * Scan binary for DirectX DLL references
 */
function detectDirectXVersion(buffer: Buffer): { dxVersion: 8 | 9 | 10 | 11 | null, detectedDlls: string[] } {
  // Convert buffer to string for pattern matching
  // This is a simplified approach - real implementation would parse import table
  const content = buffer.toString('latin1')

  const detectedDlls: string[] = []

  // Check for each DX pattern
  for (const [name, pattern] of Object.entries(DX_PATTERNS)) {
    if (pattern.test(content)) {
      detectedDlls.push(name)
    }
  }

  // Determine version based on detected DLLs
  // Priority: D3D11 > D3D10 > D3D9 > D3D8
  let dxVersion: 8 | 9 | 10 | 11 | null = null

  if (detectedDlls.includes('d3d11') || detectedDlls.includes('dxgi')) {
    dxVersion = 11
  } else if (detectedDlls.includes('d3d10') || detectedDlls.includes('d3d10core')) {
    dxVersion = 10
  } else if (detectedDlls.includes('d3d9')) {
    dxVersion = 9
  } else if (detectedDlls.includes('d3d8')) {
    dxVersion = 8
  }

  return { dxVersion, detectedDlls }
}

/**
 * Get the appropriate DXVK DLL folder based on architecture
 */
export function getDxvkArchFolder(architecture: 'x86' | 'x64'): string {
  return architecture === 'x64' ? 'x64' : 'x32'
}

/**
 * Get the DLLs needed for a specific DirectX version
 */
export function getRequiredDlls(dxVersion: 8 | 9 | 10 | 11): string[] {
  switch (dxVersion) {
    case 8:
      return ['d3d8.dll']
    case 9:
      return ['d3d9.dll']
    case 10:
      return ['d3d10.dll', 'd3d10_1.dll', 'd3d10core.dll', 'dxgi.dll']
    case 11:
      return ['d3d11.dll', 'd3d10core.dll', 'dxgi.dll']
    default:
      return []
  }
}
