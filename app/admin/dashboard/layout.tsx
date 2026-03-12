'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const NAV = [
  { icon: '▣', label: "Vue d'ensemble", path: '/admin/dashboard' },
  { icon: '◈', label: 'Commerçants', path: '/admin/dashboard/merchants' },
  { icon: '◎', label: 'Paiements', path: '/admin/dashboard/payments' },
  { icon: '◉', label: 'Statistiques', path: '/admin/dashboard/stats' },
  { icon: '◐', label: 'Paramètres', path: '/admin/dashboard/settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [admin, setAdmin] = useState<any>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [time, setTime] = useState('')
  const [pendingCount, setPendingCount] = useState(0)
  const [paymentCount, setPaymentCount] = useState(0)
  const [messageCount, setMessageCount] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem('admin')
    if (!stored) { router.push('/admin'); return }
    setAdmin(JSON.parse(stored))
  }, [router])

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Charger les badges de notification
  useEffect(() => {
    const loadBadges = async () => {
      try {
        const { supabase } = await import('@/database/supabase-client')
        const [{ count: pending }, { count: payments }, { count: messages }] = await Promise.all([
          supabase.from('merchants').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('payment_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('messages').select('id', { count: 'exact', head: true }).eq('status', 'unread'),
        ])
        setPendingCount(pending || 0)
        setPaymentCount(payments || 0)
        setMessageCount(messages || 0)
      } catch {}
    }
    loadBadges()
    const id = setInterval(loadBadges, 15000)
    return () => clearInterval(id)
  }, [])

  if (!admin) return (
    <div className="min-h-screen bg-[#060608] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )

  const currentPage = NAV.find(n => n.path === pathname)

  const getBadge = (path: string) => {
    if (path === '/admin/dashboard/merchants') return pendingCount
    if (path === '/admin/dashboard/payments') return paymentCount
    return 0
  }

  return (
    <div className="min-h-screen bg-[#060608] text-white flex">
      <aside className={`${collapsed ? 'w-[60px]' : 'w-[220px]'} bg-[#0a0a0d] border-r border-white/[0.06] flex flex-col fixed h-full z-30 transition-all duration-200`}>

        {/* Logo */}
        <div className={`h-14 flex items-center border-b border-white/[0.06] ${collapsed ? 'justify-center px-0' : 'px-4 gap-3'}`}>
          <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-white/10">
            <img src="/logo.png" alt="Fidali" className="w-full h-full object-contain" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold tracking-tight">Fidali</p>
              <p className="text-[10px] text-white/30 -mt-0.5">Admin</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.path
            const badge = getBadge(item.path)
            return (
              <button key={item.path} onClick={() => router.push(item.path)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 relative ${
                  active ? 'bg-white text-black font-semibold' : 'text-white/40 hover:text-white/80 hover:bg-white/[0.05]'
                }`}>
                <span className="text-base shrink-0">{item.icon}</span>
                {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                {badge > 0 && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                    active ? 'bg-black/20 text-black' : 'bg-rose-500 text-white'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-white/[0.06] space-y-0.5">
          <button onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 text-white/25 hover:text-white/50 rounded-xl transition text-xs">
            <span className="text-base shrink-0">{collapsed ? '▷' : '◁'}</span>
            {!collapsed && <span>Réduire</span>}
          </button>
          <button onClick={() => { localStorage.removeItem('admin'); router.push('/admin') }}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/[0.06] rounded-xl transition text-xs">
            <span className="text-base shrink-0">⎋</span>
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      <main className={`flex-1 ${collapsed ? 'ml-[60px]' : 'ml-[220px]'} transition-all duration-200 flex flex-col min-h-screen`}>

        {/* Header */}
        <header className="h-14 border-b border-white/[0.06] bg-[#060608]/90 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-white/15 text-sm">/</span>
            <span className="text-sm text-white/50">{currentPage?.label || 'Admin'}</span>
          </div>
          <div className="flex items-center gap-5">
            {/* Badges alertes */}
            {paymentCount > 0 && (
              <button onClick={() => router.push('/admin/dashboard/payments')}
                className="flex items-center gap-1.5 text-[11px] text-rose-400 hover:text-rose-300 transition">
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
                {paymentCount} paiement{paymentCount > 1 ? 's' : ''}
              </button>
            )}
            {messageCount > 0 && (
              <button onClick={() => router.push('/admin/dashboard')}
                className="flex items-center gap-1.5 text-[11px] text-violet-400 hover:text-violet-300 transition">
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
                {messageCount} message{messageCount > 1 ? 's' : ''}
              </button>
            )}
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[11px] text-white/25">Actif</span>
            </div>
            <span className="text-xs text-white/20 font-mono">{time}</span>
            <div className="w-7 h-7 bg-white/[0.08] rounded-full flex items-center justify-center text-xs font-bold text-white/50">
              {(admin.name || admin.email || 'A')[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 p-8">{children}</div>
      </main>
    </div>
  )
}
