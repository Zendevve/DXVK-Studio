import { useState, useEffect } from 'react'
import { GameGrid } from './components/GameGrid'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import './App.css'

export interface Game {
  id: string
  name: string
  path: string
  exePath: string
  architecture: '32-bit' | '64-bit' | 'unknown'
  dxVersion: 8 | 9 | 10 | 11 | null
  dxvkInstalled: boolean
  dxvkVersion: string | null
  storefront: 'steam' | 'epic' | 'gog' | 'manual'
}

type View = 'library' | 'settings' | 'downloads'

function App() {
  const [games, setGames] = useState<Game[]>([])
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [currentView, setCurrentView] = useState<View>('library')
  const [isLoading, setIsLoading] = useState(false)

  // Placeholder data for initial UI development
  useEffect(() => {
    const placeholderGames: Game[] = [
      {
        id: '1',
        name: 'Grand Theft Auto IV',
        path: 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Grand Theft Auto IV',
        exePath: 'GTAIV.exe',
        architecture: '32-bit',
        dxVersion: 9,
        dxvkInstalled: false,
        dxvkVersion: null,
        storefront: 'steam'
      },
      {
        id: '2',
        name: 'Fallout: New Vegas',
        path: 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Fallout New Vegas',
        exePath: 'FalloutNV.exe',
        architecture: '32-bit',
        dxVersion: 9,
        dxvkInstalled: true,
        dxvkVersion: '2.3',
        storefront: 'steam'
      },
      {
        id: '3',
        name: 'The Elder Scrolls V: Skyrim',
        path: 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Skyrim',
        exePath: 'TESV.exe',
        architecture: '32-bit',
        dxVersion: 9,
        dxvkInstalled: false,
        dxvkVersion: null,
        storefront: 'steam'
      },
      {
        id: '4',
        name: 'Dark Souls III',
        path: 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\DARK SOULS III',
        exePath: 'DarkSoulsIII.exe',
        architecture: '64-bit',
        dxVersion: 11,
        dxvkInstalled: true,
        dxvkVersion: '2.3-gplasync',
        storefront: 'steam'
      }
    ]
    setGames(placeholderGames)
  }, [])

  const handleScanLibrary = async () => {
    setIsLoading(true)
    try {
      // Will be implemented with actual IPC
      // const scannedGames = await window.electronAPI.scanSteamLibrary()
      // setGames(scannedGames)
      console.log('Scanning library...')
    } catch (error) {
      console.error('Failed to scan library:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      <Header
        onScan={handleScanLibrary}
        isLoading={isLoading}
      />
      <div className="app-main">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
        />
        <main className="app-content">
          {currentView === 'library' && (
            <GameGrid
              games={games}
              selectedGame={selectedGame}
              onSelectGame={setSelectedGame}
            />
          )}
          {currentView === 'settings' && (
            <div className="card">
              <h2>Settings</h2>
              <p className="text-secondary">Configuration options coming soon...</p>
            </div>
          )}
          {currentView === 'downloads' && (
            <div className="card">
              <h2>DXVK Versions</h2>
              <p className="text-secondary">Version management coming soon...</p>
            </div>
          )}
        </main>
        {selectedGame && (
          <aside className="app-sidebar-right">
            <GameDetails game={selectedGame} />
          </aside>
        )}
      </div>
    </div>
  )
}

function GameDetails({ game }: { game: Game }) {
  return (
    <div className="game-details animate-slide-up">
      <h2 className="game-details-title">{game.name}</h2>

      <div className="game-details-section">
        <h3 className="text-secondary">Status</h3>
        <div className="flex gap-2">
          <span className={`badge ${game.dxvkInstalled ? 'badge-success' : 'badge-neutral'}`}>
            {game.dxvkInstalled ? `DXVK ${game.dxvkVersion}` : 'No DXVK'}
          </span>
          <span className="badge badge-neutral">{game.architecture}</span>
          {game.dxVersion && (
            <span className="badge badge-neutral">DX{game.dxVersion}</span>
          )}
        </div>
      </div>

      <div className="game-details-section">
        <h3 className="text-secondary">Path</h3>
        <code className="game-path font-mono text-tertiary">{game.path}</code>
      </div>

      <div className="game-details-actions">
        {game.dxvkInstalled ? (
          <>
            <button className="btn btn-secondary">Configure</button>
            <button className="btn btn-danger">Remove DXVK</button>
          </>
        ) : (
          <button className="btn btn-primary">Install DXVK</button>
        )}
      </div>
    </div>
  )
}

export default App
