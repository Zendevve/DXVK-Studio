import { useState } from 'react'
import { Gamepad2, Search, ChevronRight, Check } from 'lucide-react'

interface OnboardingWizardProps {
  onComplete: () => void
  onScanGames: () => Promise<number> // Returns count of games found
}

const steps = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'scan', title: 'Find Games' },
  { id: 'done', title: 'Ready' },
]

export function OnboardingWizard({ onComplete, onScanGames }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isScanning, setIsScanning] = useState(false)
  const [gamesFound, setGamesFound] = useState<number | null>(null)

  const handleScan = async () => {
    setIsScanning(true)
    try {
      const count = await onScanGames()
      setGamesFound(count)
    } catch (e) {
      console.error('Scan failed:', e)
      setGamesFound(0)
    } finally {
      setIsScanning(false)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleFinish = () => {
    localStorage.setItem('dxvk-studio-onboarded', 'true')
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-studio-950/80 backdrop-blur-xl">
      <div className="w-full max-w-lg mx-4">
        {/* Card */}
        <div className="liquid-glass rounded-2xl overflow-hidden border border-white/10 shadow-elevation-3">
          {/* Progress indicator */}
          <div className="px-8 pt-6 pb-4 bg-gradient-to-b from-white/5 to-transparent border-b border-white/5">
            <div className="flex items-center justify-center gap-4">
              {steps.map((step, i) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-callout font-medium transition-all duration-300 ${i < currentStep
                        ? 'bg-accent-vulkan text-white shadow-glow-sm shadow-accent-vulkan/50'
                        : i === currentStep
                          ? 'bg-accent-vulkan/20 text-accent-vulkan border-2 border-accent-vulkan'
                          : 'bg-white/5 text-studio-500 border border-white/10'
                        }`}
                    >
                      {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`mt-2 text-caption-1 font-medium ${i <= currentStep ? 'text-white' : 'text-studio-500'
                      }`}>
                      {step.title}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`w-16 h-0.5 mx-3 rounded-full transition-colors duration-300 ${i < currentStep ? 'bg-accent-vulkan' : 'bg-white/5'
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step content */}
          <div className="p-8 text-center min-h-[400px] flex flex-col justify-center">
            {/* Step 1: Welcome */}
            {currentStep === 0 && (
              <div className="animate-fade-in space-y-8">
                <div className="w-32 h-32 mx-auto relative group">
                  <div className="absolute inset-0 bg-accent-vulkan/20 blur-xl rounded-full group-hover:bg-accent-vulkan/30 transition-all duration-500" />
                  <img
                    src="/icon.png"
                    alt="DXVK Studio"
                    className="relative w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-2">
                  <h2 className="text-large-title text-white">Welcome to DXVK Studio</h2>
                  <p className="text-body text-studio-400 max-w-sm mx-auto">
                    Let's set up your environment in just a few steps.
                  </p>
                </div>
                <button onClick={handleNext} className="btn-primary w-full py-4 text-callout flex items-center justify-center gap-2 shadow-lg hover:shadow-accent-vulkan/20">
                  Get Started
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 2: Scan */}
            {currentStep === 1 && (
              <div className="animate-fade-in space-y-8">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-accent-vulkan/20 to-accent-vulkan/5 border border-accent-vulkan/20 flex items-center justify-center shadow-inner-highlight">
                  <Search className="w-10 h-10 text-accent-vulkan drop-shadow-lg" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-title-1 text-white">Find Your Games</h2>
                  <p className="text-body text-studio-400 max-w-sm mx-auto">
                    We'll scan for Steam, GOG, and Epic games on your system.
                  </p>
                </div>

                {gamesFound !== null ? (
                  <div className="space-y-6">
                    <div className={`p-6 rounded-2xl backdrop-blur-md transition-all duration-300 ${gamesFound > 0
                      ? 'bg-accent-success/10 border border-accent-success/20 shadow-glow-sm shadow-accent-success/10'
                      : 'bg-white/5 border border-white/10'
                      }`}>
                      <p className={`text-headline ${gamesFound > 0 ? 'text-accent-success' : 'text-studio-300'}`}>
                        {gamesFound > 0
                          ? `Found ${gamesFound} game${gamesFound !== 1 ? 's' : ''}!`
                          : 'No games found.'}
                      </p>
                      {gamesFound === 0 && (
                        <p className="text-caption-1 text-studio-500 mt-1">You can add games manually later.</p>
                      )}
                    </div>
                    <button onClick={handleNext} className="btn-primary w-full py-4 text-callout flex items-center justify-center gap-2">
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={handleScan}
                      disabled={isScanning}
                      className="btn-primary w-full py-4 text-callout flex items-center justify-center gap-2"
                    >
                      {isScanning ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          Scan for Games
                        </>
                      )}
                    </button>
                    <button onClick={handleNext} className="text-studio-400 hover:text-white text-subhead transition-colors py-2">
                      Skip for now
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Done */}
            {currentStep === 2 && (
              <div className="animate-fade-in space-y-8">
                <div className="w-32 h-32 mx-auto relative group">
                  <div className="absolute inset-0 bg-accent-vulkan/20 blur-xl rounded-full" />
                  <img
                    src="/icon.png"
                    alt="DXVK Studio"
                    className="relative w-full h-full object-contain drop-shadow-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <h2 className="text-large-title text-white">You're All Set!</h2>
                  <p className="text-body text-studio-400 max-w-sm mx-auto">
                    DXVK Studio is ready. Start managing your games with Vulkan power.
                  </p>
                </div>
                <button onClick={handleFinish} className="btn-primary w-full py-4 text-callout flex items-center justify-center gap-2 shadow-lg shadow-accent-vulkan/20">
                  <Gamepad2 className="w-5 h-5" />
                  Enter DXVK Studio
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
