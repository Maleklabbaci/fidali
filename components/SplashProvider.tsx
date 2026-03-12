'use client'

import { useState, useEffect } from 'react'
import SplashScreen from './SplashScreen'

export default function SplashProvider({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false)

  useEffect(() => {
    const seen = sessionStorage.getItem('splash_seen')
    if (!seen) setShowSplash(true)
  }, [])

  const handleDone = () => {
    sessionStorage.setItem('splash_seen', '1')
    setShowSplash(false)
  }

  return (
    <>
      {showSplash && <SplashScreen onDone={handleDone} />}
      {children}
    </>
  )
}
