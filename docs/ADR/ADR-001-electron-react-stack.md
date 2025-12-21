# ADR-001: Electron with React for Desktop Application

Status: Accepted
Date: 2024-12-21
Owner: Developer
Related Features: All
Supersedes: N/A
Superseded by: N/A

---

## Context

DXVK Studio requires a cross-platform desktop GUI that can:
- Access the Windows file system for DLL operations
- Execute system commands
- Provide a modern, responsive user interface
- Be distributed as a standalone Windows application

---

## Decision

Use **Electron** with **React** and **TypeScript** for the desktop application.

Key points:

- Electron provides full Node.js access for file system operations
- React offers component-based UI development with strong ecosystem
- TypeScript ensures type safety across main/renderer processes
- Vite enables fast development with HMR

---

## Alternatives considered

### Tauri (Rust + WebView)

- Pros: Smaller bundle size, better performance, native Rust backend
- Cons: Rust learning curve, less mature ecosystem, WebView2 dependency on Windows
- Rejected because: Team familiarity with TypeScript/Node.js, faster development velocity

### Native (C++ / .NET WPF)

- Pros: Best performance, native Windows integration
- Cons: No cross-platform potential, longer development time
- Rejected because: Future Linux/macOS support planned for v2.0

---

## Consequences

### Positive

- Rapid development with familiar web technologies
- Large ecosystem of npm packages
- Easy to find developers familiar with the stack

### Negative / risks

- Larger application bundle size (~150MB)
- Mitigation: Use electron-builder for optimized builds
- Higher memory usage compared to native
- Mitigation: Acceptable for a utility application

---

## Impact

### Code

- Main process: `electron/main.ts`
- Renderer: `src/` with React components
- IPC bridge: `electron/preload.ts`

### Documentation

- Architecture doc created: `docs/ARCHITECTURE.md`

---

## Verification

### Test commands

- build: `npm run build`
- dev: `npm run dev`

---

## References

- [Electron Documentation](https://www.electronjs.org/docs)
- [Vite Plugin Electron](https://github.com/electron-vite/vite-plugin-electron)
