'use client'

import { useState, useRef } from 'react'
import QRCode from 'react-qr-code'

interface ShareModalProps {
  card: any
  onClose: () => void
}

export default function ShareModal({ card, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const pageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join/${card.code}`
    : ''

  const cardUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/scan/${card.code}`
    : ''

  const gradientBg = `linear-gradient(135deg, ${card.color1 || '#6C3FE8'}, ${card.color2 || '#F59E0B'})`

  const handleCopy = () => {
    navigator.clipboard.writeText(pageUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`🎁 Rejoins ma carte de fidélité ${card.business_name} sur Fidali !\n${pageUrl}`)}`,
      '_blank'
    )
  }

  const handleInstagram = () => {
    navigator.clipboard.writeText(pageUrl)
    alert('Lien copié ! Colle-le dans ta bio Instagram ou ta story.')
  }

  const handleDownloadQR = async () => {
    setDownloading(true)
    try {
      const svgEl = document.getElementById('qr-download-svg')
      if (!svgEl) return

      const svgData = new XMLSerializer().serializeToString(svgEl)
      const canvas = document.createElement('canvas')
      const size = 600
      canvas.width = size
      canvas.height = size

      const ctx = canvas.getContext('2d')!
      const img = new window.Image()
      img.onload = () => {
        // Fond blanc
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, size, size)
        ctx.drawImage(img, 40, 40, size - 80, size - 80)

        // Logo Fidali au centre
        const logoImg = new window.Image()
        logoImg.onload = () => {
          const logoSize = 100
          const logoX = (size - logoSize) / 2
          const logoY = (size - logoSize) / 2

          // Cercle de fond
          ctx.save()
          ctx.beginPath()
          ctx.arc(size / 2, size / 2, logoSize / 2 + 6, 0, Math.PI * 2)
          ctx.fillStyle = 'white'
          ctx.fill()
          ctx.restore()

          // Fond coloré
          const grd = ctx.createLinearGradient(logoX, logoY, logoX + logoSize, logoY + logoSize)
          grd.addColorStop(0, card.color1 || '#6C3FE8')
          grd.addColorStop(1, card.color2 || '#F59E0B')
          ctx.save()
          ctx.beginPath()
          ctx.roundRect(logoX, logoY, logoSize, logoSize, 20)
          ctx.fillStyle = grd
          ctx.fill()
          ctx.restore()

          ctx.drawImage(logoImg, logoX + 15, logoY + 15, 70, 70)

          const link = document.createElement('a')
          link.download = `qr-${card.code}.png`
          link.href = canvas.toDataURL('image/png')
          link.click()
          setDownloading(false)
        }
        logoImg.src = '/logo-white.png'
      }
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      img.src = URL.createObjectURL(blob)
    } catch (e) {
      console.error(e)
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header avec couleurs de la carte */}
        <div className="p-6 text-white text-center relative" style={{ background: gradientBg }}>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/20 flex items-center justify-center overflow-hidden">
            {card.logo_url
              ? <img src={card.logo_url} alt="" className="w-full h-full object-cover" />
              : <span className="text-3xl">{card.logo_emoji || '🏪'}</span>
            }
          </div>
          <h2 className="font-extrabold text-lg">{card.business_name}</h2>
          <p className="text-white/60 text-xs mt-1">Page publique de fidélité</p>
        </div>

        <div className="p-5 space-y-4">

          {/* Lien */}
          <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200">
            <span className="text-xs text-slate-500 flex-1 truncate font-mono">{pageUrl}</span>
            <button onClick={handleCopy}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition shrink-0 ${copied ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
              {copied ? '✓ Copié' : 'Copier'}
            </button>
          </div>

          {/* QR stylé */}
          <div className="flex flex-col items-center bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <div className="relative">
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <QRCode
                  id="qr-download-svg"
                  value={cardUrl}
                  size={160}
                  level="H"
                  fgColor={card.color1 || '#6C3FE8'}
                />
                {/* Logo Fidali au centre */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border-2 border-white overflow-hidden"
                  style={{ background: gradientBg }}
                >
                  <img src="/logo-white.png" alt="" className="w-6 h-6 object-contain" />
                </div>
              </div>
            </div>
            <button
              onClick={handleDownloadQR}
              disabled={downloading}
              className="mt-4 px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition disabled:opacity-50 flex items-center gap-2"
            >
              {downloading ? (
                <><span className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />Téléchargement...</>
              ) : (
                <>⬇️ Télécharger le QR</>
              )}
            </button>
          </div>

          {/* Boutons partage */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-sm font-semibold transition active:scale-95">
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </button>
            <button onClick={handleInstagram}
              className="flex items-center justify-center gap-2 py-3 text-white rounded-2xl text-sm font-semibold transition active:scale-95"
              style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              Instagram
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
