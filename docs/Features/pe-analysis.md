# Feature: PE Header Analysis

Status: In Progress
Owner: Core Engine
Created: 2025-12-21

---

## Purpose

Automatically detect executable architecture (32-bit vs 64-bit) and DirectX dependencies by parsing PE headers. This eliminates user error from manually selecting the wrong DXVK DLLs.

---

## Scope

### In scope

- Parse PE header to detect Machine type (x86/x64)
- Scan import table for DirectX DLL dependencies
- Detect D3D8, D3D9, D3D10, D3D11 usage
- Return structured analysis result

### Out of scope

- Runtime memory analysis
- Dynamic DLL detection
- DirectX 12 (not supported by DXVK)

---

## Business Rules

- If Machine type is 0x014c (IMAGE_FILE_MACHINE_I386) → 32-bit
- If Machine type is 0x8664 (IMAGE_FILE_MACHINE_AMD64) → 64-bit
- DirectX version detected by scanning for DLL imports OR string patterns in binary
- If no DirectX detected, warn user but allow manual selection

---

## System Behaviour

- Entry points: IPC handler `analyze-executable`
- Reads from: Local filesystem (game executable)
- Writes to: None (pure analysis)
- Error handling: Return structured error if file not found or not valid PE

---

## Verification

### Test flows

**Positive scenarios**

| ID | Description | Expected Result |
|----|-------------|-----------------|
| POS-001 | Analyze 32-bit DX9 game | Returns { arch: 'x86', dxVersion: 9 } |
| POS-002 | Analyze 64-bit DX11 game | Returns { arch: 'x64', dxVersion: 11 } |
| POS-003 | Analyze UE4 game | Returns { arch: 'x64', dxVersion: 11 } |

**Negative scenarios**

| ID | Description | Expected Result |
|----|-------------|-----------------|
| NEG-001 | Non-PE file (text) | Returns error: "Not a valid PE file" |
| NEG-002 | File not found | Returns error: "File not found" |

---

## Definition of Done

- [ ] PE parser implemented in `electron/services/pe-parser.ts`
- [ ] IPC handler registered in `electron/main.ts`
- [ ] Unit tests for parser logic
- [ ] Integration test with real game executable
