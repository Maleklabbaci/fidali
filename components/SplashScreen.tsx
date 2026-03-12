'use client'

import { useEffect, useState } from 'react'

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fill, setFill] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Remplissage progressif
    const start = performance.now()
    const duration = 1600 // ms pour remplir à 100%

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Easing cubic pour que ce soit plus fluide
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2
      setFill(Math.round(eased * 100))

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Pause 300ms puis fade out
        setTimeout(() => {
          setFadeOut(true)
          setTimeout(onDone, 500)
        }, 300)
      }
    }

    requestAnimationFrame(animate)
  }, [onDone])

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="flex flex-col items-center gap-6">

        {/* Logo avec effet de remplissage */}
        <div className="relative w-24 h-24">
          {/* Logo grisé (fond) */}
          <img
            src="/logo.png"
            alt="Fidali"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ filter: 'grayscale(1) opacity(0.12)' }}
          />

          {/* Logo coloré qui se révèle de bas en haut */}
          <div
            className="absolute inset-0 overflow-hidden transition-none"
            style={{ clipPath: `inset(${100 - fill}% 0 0 0)` }}
          >
            <img
              src="/logo.png"
              alt=""
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Barre de progression */}
        <div className="w-16 h-[3px] bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-none"
            style={{ width: `${fill}%` }}
          />
        </div>

      </div>
    </div>
  )
}
