# Feature: DXVK Installation Engine

Status: In Progress
Owner: Core Engine
Created: 2025-12-21

---

## Purpose

Manage DXVK installations: download versions, install to games, remove installed DLLs, and manage a central version repository.

---

## Scope

### In scope

- Download DXVK releases from GitHub
- Maintain local version repository
- Install DLLs to game directories
- Remove DXVK from games
- Support variants: Standard, Async, GPLAsync

### Out of scope

- Automatic updates
- External overlay system

---

## Business Rules

- DXVK versions stored in `%APPDATA%/dxvk-studio/versions/`
- Each version has `x32/` and `x64/` subdirectories
- Installation copies (not symlinks for MVP) DLLs to game directory
- Removal deletes only known DXVK DLLs (d3d8, d3d9, d3d10, d3d11, dxgi)
- Never modify System32/SysWOW64

---

## Verification

### Test flows

| ID | Description | Expected Result |
|----|-------------|-----------------|
| POS-001 | Download latest DXVK | Version downloaded to repository |
| POS-002 | Install to 64-bit game | x64 DLLs copied to game folder |
| POS-003 | Remove from game | DXVK DLLs deleted |
| NEG-001 | Install to System32 | Blocked with error |

---

## Definition of Done

- [ ] DXVK engine implemented in `electron/services/dxvk-engine.ts`
- [ ] Download, install, remove functions working
- [ ] IPC handlers registered
- [ ] Integration tests passing
