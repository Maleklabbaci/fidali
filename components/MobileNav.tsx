'use client'

const TABS = [
  { id: 'overview', icon: HomeIcon,     label: 'Accueil'  },
  { id: 'cards',    icon: CardsIcon,    label: 'Cartes'   },
  { id: 'pending',  icon: BellIcon,     label: 'Valider'  },
  { id: 'clients',  icon: ClientsIcon,  label: 'Clients'  },
  { id: 'activity', icon: ActivityIcon, label: 'Activité' },
]

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  )
}

function CardsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="3"/>
      <path d="M2 10h20"/>
    </svg>
  )
}

function BellIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  )
}

function ClientsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="4"/>
      <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
      <path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87"/>
    </svg>
  )
}

function ActivityIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  )
}

export default function MobileNav({
  activeTab,
  onTabChange,
  pendingCount,
}: {
  activeTab: string
  onTabChange: (tab: string) => void
  pendingCount: number
}) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex justify-center"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3 mx-4 rounded-[28px]"
        style={{
          background: 'rgba(15, 15, 25, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.09)',
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          const hasBadge = tab.id === 'pending' && pendingCount > 0
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex items-center justify-center transition-all duration-200 active:scale-90"
              style={{
                width: isActive ? 54 : 46,
                height: isActive ? 54 : 46,
                borderRadius: '50%',
                background: isActive
                  ? 'linear-gradient(145deg, #6366f1, #4338ca)'
                  : 'rgba(255,255,255,0.07)',
                boxShadow: isActive
                  ? '0 4px 20px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.2)'
                  : 'none',
                border: isActive
                  ? '1px solid rgba(255,255,255,0.18)'
                  : '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <Icon active={isActive} />

              {hasBadge && (
                <span
                  className="absolute flex items-center justify-center text-white font-bold"
                  style={{
                    top: -2,
                    right: -2,
                    minWidth: 18,
                    height: 18,
                    fontSize: 9,
                    borderRadius: 99,
                    background: '#ef4444',
                    border: '2px solid rgba(15,15,25,0.9)',
                    padding: '0 4px',
                  }}
                >
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
