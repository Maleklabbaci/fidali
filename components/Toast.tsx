'use client'

import { useState, useCallback, useRef } from 'react'

interface ToastState {
  message: string
  visible: boolean
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({ message: '', visible: false })
  const timeoutRef = useRef<NodeJS.Timeout>()

  const showToast = useCallback((message: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setToast({ message, visible: true })
    timeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }))
    }, 3500)
  }, [])

  return { toast, showToast }
}

export function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 bg-dark text-white px-5 py-2.5 rounded-[10px] font-bold text-sm shadow-2xl z-[99999] transition-all duration-400 flex items-center gap-2 max-w-[90vw] border border-white/[0.08] ${
      visible ? 'translate-y-0 opacity-100' : 'translate-y-[100px] opacity-0'
    }`}>
      {message}
    </div>
  )
}
