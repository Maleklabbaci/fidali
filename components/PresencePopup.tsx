'use client'

import React, { useEffect } from 'react'

interface PresencePopupProps {
  customerName: string
  points: number
  isVisible: boolean
  onClose?: () => void
}

export const PresencePopup: React.FC<PresencePopupProps> = ({
  customerName,
  points,
  isVisible,
  onClose,
}) => {
  useEffect(() => {
    if (isVisible && onClose) {
      const timer = setTimeout(onClose, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-bounce">
      <div className="bg-green-500 text-white px-6 py-4 rounded-2xl shadow-lg">
        <p className="font-bold text-lg">{customerName}</p>
        <p className="text-sm opacity-90">+{points} points ajoutés ✅</p>
      </div>
    </div>
  )
}
