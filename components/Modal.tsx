'use client'

import { useEffect, useRef } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  maxWidth?: string
}

export function Modal({ open, onClose, children, maxWidth = 'max-w-[440px]' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className={`bg-white rounded-[20px] p-7 w-[92%] ${maxWidth} relative shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto`}>
        <button
          onClick={onClose}
          className="absolute top-2.5 right-3.5 bg-transparent border-none text-xl cursor-pointer text-gray-300 w-[30px] h-[30px] rounded-lg flex items-center justify-center hover:text-brand-orange hover:bg-orange-50 transition-all"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  )
}
