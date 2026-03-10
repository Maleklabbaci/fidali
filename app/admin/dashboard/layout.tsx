'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const NAV_ITEMS = [
  { icon: '📊', label: 'Vue d\'ensemble', path: '/admin/dashboard' },
  { icon: '🏪', label: 'Commerçants', path: '/admin/dashboard/merchants' },
  { icon: '💳', label: 'Paiements', path: '/admin/dashboard/payments' },
  { icon: '📈', label: 'Statistiques', path: '/admin/dashboard/stats' },
  { icon: '⚙️', label: 'Paramètres', path: '/admin/dashboard/settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [admin, setAdmin] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('admin')
    if (!stored) {
      router.push('/admin')
      return
    }
    setAdmin(JSON.parse(stored))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('admin')
    router.push('/admin')
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-4xl animate-spin">⏳</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0a0a1a] border-r border-white/5 flex flex-col transition-all duration-300 fixed h-full z-30`}>
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center text-xl font-bold shrink-0">
            🛡️
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="font-extrabold text-lg">Fidali</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600/20 to-rose-600/20 text-red-400 border border-red-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Toggle + Logout */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-white rounded-lg transition text-sm"
          >
            <span>{sidebarOpen ? '◀' : '▶'}</span>
            {sidebarOpen && <span>Réduire</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition text-sm"
          >
            <span>🚪</span>
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[#0f0f23]/80 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">
              {NAV_ITEMS.find((n) => n.path === pathname)?.label || 'Admin'}
            </h2>
            <p className="text-xs text-gray-500">Bienvenue, {admin.name || admin.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500">Système actif</span>
          </div>
        </header>

        {/* Page content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
