```javascript
import { useEffect, useState } from 'react'
import { ExternalLink, Sparkles } from 'lucide-react'

export function BrandToast() {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    // Show toast after a brief delay
    const showTimer = setTimeout(() => {
      setIsVisible(true)
    }, 800)

    // Start fade out after 7 seconds
    const fadeTimer = setTimeout(() => {
      setIsVisible(false)
    }, 7800)

    // Remove from DOM after animation completes
    const removeTimer = setTimeout(() => {
      setShouldRender(false)
    }, 8500)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (!shouldRender) return null

  return (
    <div
      className={`fixed bottom - 8 right - 8 z - 40 transition - all duration - 700 ease - out ${
  isVisible
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-4'
} `}
    >
      <button
        onClick={() => window.open('https://guinto2.gumroad.com/l/dxvkstudio', '_blank')}
        className="glass-card px-6 py-4 border-accent-vulkan/40 bg-gradient-to-br from-studio-900/98 to-studio-800/98 backdrop-blur-xl hover:border-accent-vulkan/60 hover:shadow-xl hover:shadow-accent-vulkan/20 transition-all duration-300 group relative overflow-hidden"
      >
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-vulkan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative flex items-start gap-4">
          {/* App Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-accent-vulkan/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img
              src="/icon.png"
              alt="DXVK Studio"
              className="w-14 h-14 rounded-xl shadow-lg relative transform group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Content */}
          <div className="text-left">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-base font-bold text-white">DXVK Studio</h4>
              <Sparkles className="w-4 h-4 text-accent-vulkan opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <p className="text-sm text-studio-300 mb-2">
              Professional DXVK Manager
            </p>

            <div className="flex items-center gap-2">
              <p className="text-xs text-studio-400">
                Created by{' '}
                <span className="text-accent-vulkan font-semibold">Zendevve</span>
              </p>
              <ExternalLink className="w-3.5 h-3.5 text-studio-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0.5" />
            </div>

            <p className="text-xs text-studio-600 mt-1.5 italic">
              Click for official builds
            </p>
          </div>
        </div>
      </button>
    </div>
  )
}
