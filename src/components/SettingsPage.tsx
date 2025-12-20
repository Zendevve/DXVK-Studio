import { useState, useEffect } from 'react'
import './SettingsPage.css'

export function SettingsPage() {
  const [versionsDir, setVersionsDir] = useState<string>('')
  const [defaultVariant, setDefaultVariant] = useState<string>('standard')
  const [autoScan, setAutoScan] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const dir = await window.electronAPI.getVersionsDir()
      setVersionsDir(dir)

      // Load from localStorage
      setDefaultVariant(localStorage.getItem('dxvk-default-variant') || 'standard')
      setAutoScan(localStorage.getItem('dxvk-auto-scan') === 'true')
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }

  const handleVariantChange = (variant: string) => {
    setDefaultVariant(variant)
    localStorage.setItem('dxvk-default-variant', variant)
  }

  const handleAutoScanChange = (enabled: boolean) => {
    setAutoScan(enabled)
    localStorage.setItem('dxvk-auto-scan', String(enabled))
  }

  const handleOpenVersionsDir = async () => {
    // This would open the folder in file explorer
    console.log('Opening:', versionsDir)
  }

  return (
    <div className="settings-page">
      <h2>Settings</h2>

      {/* Storage */}
      <section className="settings-section">
        <h3>Storage</h3>
        <div className="settings-item">
          <div className="settings-item-info">
            <label>DXVK Versions Directory</label>
            <p className="text-tertiary">Where downloaded DXVK versions are stored</p>
          </div>
          <div className="settings-item-control">
            <code className="path-display">{versionsDir || 'Loading...'}</code>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleOpenVersionsDir}
              aria-label="Open versions directory in file explorer"
            >
              Open Folder
            </button>
          </div>
        </div>
      </section>

      {/* Defaults */}
      <section className="settings-section">
        <h3>Defaults</h3>
        <div className="settings-item">
          <div className="settings-item-info">
            <label htmlFor="default-variant">Default DXVK Variant</label>
            <p className="text-tertiary">Used when installing DXVK to new games</p>
          </div>
          <select
            id="default-variant"
            value={defaultVariant}
            onChange={e => handleVariantChange(e.target.value)}
            className="settings-select"
          >
            <option value="standard">Standard</option>
            <option value="async">Async</option>
            <option value="gplasync">GPL Async</option>
          </select>
        </div>
        <div className="settings-item">
          <div className="settings-item-info">
            <label>Auto-scan Steam on startup</label>
            <p className="text-tertiary">Automatically scan for new games when app opens</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={autoScan}
              onChange={e => handleAutoScanChange(e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      </section>

      {/* About */}
      <section className="settings-section">
        <h3>About</h3>
        <div className="about-card">
          <div className="about-logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" />
              <path d="M2 17L12 22L22 17" />
              <path d="M2 12L12 17L22 12" />
            </svg>
          </div>
          <div className="about-info">
            <h4>DXVK Studio</h4>
            <p className="text-secondary">Version 1.0.0 MVP</p>
            <p className="text-tertiary">The definitive DXVK management suite</p>
            <div className="about-links">
              <a
                href="https://github.com/Zendevve/dxvk-studio"
                target="_blank"
                rel="noopener noreferrer"
                className="about-link"
              >
                GitHub
              </a>
              <span className="text-tertiary">•</span>
              <a
                href="https://github.com/doitsujin/dxvk"
                target="_blank"
                rel="noopener noreferrer"
                className="about-link"
              >
                DXVK Project
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
