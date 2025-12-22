import { FolderOpen, Gamepad2, Trash2 } from 'lucide-react'
import type { Game } from '../shared/types'

interface ContextMenuProps {
  x: number
  y: number
  game: Game
  onClose: () => void
  onOpenFolder: () => void
  onViewDetails: () => void
  onRemove: () => void
}

export function ContextMenu({
  x,
  y,
  game: _game,
  onClose,
  onOpenFolder,
  onViewDetails,
  onRemove
}: ContextMenuProps) {
  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div
        className="fixed z-50 glass-card py-1 min-w-[160px] shadow-xl animate-fade-in"
        style={{ left: x, top: y }}
      >
        <button
          onClick={() => {
            onOpenFolder()
            onClose()
          }}
          className="w-full px-3 py-3 min-h-[44px] text-left text-sm text-studio-200 hover:bg-studio-700/50 flex items-center gap-2 focus-visible:outline-none focus-visible:bg-studio-700/50"
        >
          <FolderOpen className="w-4 h-4" />
          Open Folder
        </button>
        <button
          onClick={() => {
            onViewDetails()
            onClose()
          }}
          className="w-full px-3 py-3 min-h-[44px] text-left text-sm text-studio-200 hover:bg-studio-700/50 flex items-center gap-2 focus-visible:outline-none focus-visible:bg-studio-700/50"
        >
          <Gamepad2 className="w-4 h-4" />
          View Details
        </button>
        <div className="border-t border-studio-700 my-1" />
        <button
          onClick={() => {
            onRemove()
            onClose()
          }}
          className="w-full px-3 py-3 min-h-[44px] text-left text-sm text-accent-danger hover:bg-accent-danger/10 flex items-center gap-2 focus-visible:outline-none focus-visible:bg-accent-danger/10"
        >
          <Trash2 className="w-4 h-4" />
          Remove
        </button>
      </div>
    </>
  )
}
