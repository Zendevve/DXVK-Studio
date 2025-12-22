# Feature: Monetization & Support

## Description
DXVK Studio follows an **Open Core** monetization model. The source code is open (MIT) and free to build, while convenience features (pre-built binaries) and support avenues provide sustainability.

## Strategy
- **Community Edition**: Free, full-featured source code available on GitHub.
- **Support**: In-app donation links (GitHub Sponsors, Ko-fi).
- **Distribution**:
  - Source: GitHub (Free)
  - Binaries: GitHub Releases (Free/Optional), itch.io/Gumroad (Paid/Convenience)

## Implementation

### Settings UI
A "Support Project" section is integrated into the Settings view:
- **GitHub Sponsors**: Direct link to sponsor the maintainer.
- **Ko-fi/Patreon**: Alternative one-time donation links.
- **Star Repository**: Engagement link.

### Security
External links are handled securely via the Main process to prevent them from opening inside the Electron window (violating user trust/expectations).

**Mechanism:**
`electron/main.ts`:
```typescript
mainWindow.webContents.setWindowOpenHandler(({ url }) => {
  if (url.startsWith('https:') || url.startsWith('http:')) {
    shell.openExternal(url) // Opens in default system browser
  }
  return { action: 'deny' }
})
```
This ensures `target="_blank"` links in React work safely and correctly.
