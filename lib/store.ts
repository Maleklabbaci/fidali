import { create } from 'zustand'
import type {
  Database, Merchant, LoyaltyCard, Client, ClientCard,
  Activity, PendingPresence, PlanType, MerchantStatus,
  PlanLimits, ClientStatus, PLAN_LIMITS as PlanLimitsMap,
} from '@/types'

const STORAGE_KEY = 'fidali_nextjs_v1'
const CLIENT_CARDS_KEY = 'fidali_client_cards'

// ===== HELPERS =====

export function uid(): string {
  return Math.random().toString(36).substr(2, 8).toUpperCase()
}

export function timeAgo(ts: number): string {
  const d = Date.now() - ts
  if (d < 60000) return "à l'instant"
  if (d < 3600000) return `il y a ${Math.floor(d / 60000)} min`
  if (d < 86400000) return `il y a ${Math.floor(d / 3600000)}h`
  if (d < 604800000) return `il y a ${Math.floor(d / 86400000)}j`
  return new Date(ts).toLocaleDateString('fr-FR')
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function getClientStatus(pts: number, max: number, createdAt: number): ClientStatus {
  if (pts >= max) return { className: 'bg-brand-orange/10 text-brand-orange', label: '🎁 Récompense' }
  if (Date.now() - createdAt < 172800000) return { className: 'bg-brand-blue/10 text-brand-blue', label: 'Nouveau' }
  if (pts > max * 0.6) return { className: 'bg-brand-yellow/10 text-brand-yellow', label: '⭐ VIP' }
  return { className: 'bg-brand-green/10 text-brand-green', label: 'Actif' }
}

export function extractEmoji(text: string): string {
  const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu
  try {
    const match = text.match(emojiRegex)
    return match ? match[0] : '🏪'
  } catch {
    // Fallback sans regex unicode
    const simple = text.match(/[^\w\s,.!?;:'"()-]/g)
    return simple ? simple[0] : '🏪'
  }
}

export function stripEmoji(text: string): string {
  return text.replace(/[\u{1F000}-\u{1FFFF}]/gu, '').trim()
}

export function generateCardCode(bizName: string): string {
  const clean = bizName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10).toUpperCase()
  return `${clean}-${uid().substring(0, 4)}`
}

export function getJoinUrl(code: string): string {
  if (typeof window === 'undefined') return `#join/${code}`
  return `${window.location.origin}${window.location.pathname}join/${code}`
}

export function getQrImageUrl(text: string, size: number = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&color=1A1A2E&bgcolor=FFFFFF&margin=8`
}

// ===== PLAN LIMITS =====

const LIMITS: Record<PlanType, PlanLimits> = {
  starter: { cards: 1, clients: 10 },
  pro: { cards: 5, clients: 100 },
  premium: { cards: 999, clients: 99999 },
}

export function getPlanLimits(plan: PlanType): PlanLimits {
  return LIMITS[plan] || LIMITS.starter
}

// ===== CLIENT LOCAL STORAGE =====

export interface SavedClientCard {
  ccid: string
  cardId: string
  clientId: string
  businessName: string
  color1: string
  color2: string
  holderName: string
  phone: string
  reward: string
  maxPoints: number
  rule: string
  code: string
  savedAt: number
}

export function getSavedClientCards(): SavedClientCard[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(CLIENT_CARDS_KEY) || '[]')
  } catch { return [] }
}

export function saveClientCardLocally(data: SavedClientCard): void {
  if (typeof window === 'undefined') return
  const cards = getSavedClientCards()
  const idx = cards.findIndex(c => c.ccid === data.ccid)
  if (idx >= 0) cards[idx] = data
  else cards.push(data)
  localStorage.setItem(CLIENT_CARDS_KEY, JSON.stringify(cards))
}

export function findSavedCardByCardId(cardId: string): SavedClientCard | undefined {
  return getSavedClientCards().find(c => c.cardId === cardId)
}

// ===== SEED DATA =====

function createSeedData(): Database {
  const now = Date.now()
  
  const merchants: Merchant[] = [
    {
      id: 'M001', name: 'Karim Boudiaf', email: 'karim@pizzaoran.dz',
      password: '', business: 'Pizza Oran 🍕', sector: 'restaurant',
      phone: '0555 12 34 56', plan: 'starter', status: 'active',
      createdAt: now - 86400000 * 30,
    },
    {
      id: 'M002', name: 'Amina Hadj', email: 'amina@salonbeaute.dz',
      password: '', business: 'Salon Beauté Alger 💇', sector: 'salon',
      phone: '0555 98 76 54', plan: 'pro', status: 'active',
      createdAt: now - 86400000 * 15,
    },
  ]

  const cards: LoyaltyCard[] = [
    {
      id: 'C001', merchantId: 'M001', businessName: 'Pizza Oran 🍕',
      color1: '#FF6B35', color2: '#FF9A5C', pointsRule: '1 point par 100 DA',
      pointsPerVisit: 10, reward: '500 pts = 1 repas offert 🎁',
      maxPoints: 500, welcomeMessage: 'Bienvenue chez Pizza Oran ! 🍕',
      code: 'PIZZA-ORAN-001', createdAt: now - 86400000 * 28,
    },
    {
      id: 'C002', merchantId: 'M002', businessName: 'Salon Beauté Alger 💇',
      color1: '#FF6B9D', color2: '#FFB3CD', pointsRule: '1 point par visite',
      pointsPerVisit: 1, reward: '10 visites = 1 soin offert 💆',
      maxPoints: 10, welcomeMessage: 'Bienvenue au Salon Beauté ! 💇',
      code: 'SALON-BEAUTE-001', createdAt: now - 86400000 * 14,
    },
  ]

  const names = [
    { n: 'Ahmed Benali', p: '0555112233' },
    { n: 'Sarah Mansouri', p: '0555445566' },
    { n: 'Youcef Kaddour', p: '0555778899' },
    { n: 'Amina Cherif', p: '0555334455' },
    { n: 'Reda Bouzid', p: '0555667788' },
  ]
  const ptsArr = [350, 120, 480, 210, 150]
  
  const clients: Client[] = []
  const clientCards: ClientCard[] = []
  const activities: Activity[] = []

  names.forEach((c, i) => {
    const cid = `CL${String(i + 1).padStart(3, '0')}`
    const t = now - ((i + 1) * 86400000)
    
    clients.push({ id: cid, name: c.n, phone: c.p, createdAt: t })
    
    clientCards.push({
      id: `CC${uid()}`, clientId: cid, cardId: 'C001',
      points: ptsArr[i], createdAt: t, lastValidation: t,
    })
    
    if (i < 3) {
      clientCards.push({
        id: `CC${uid()}`, clientId: cid, cardId: 'C002',
        points: Math.floor(Math.random() * 8), createdAt: t, lastValidation: t,
      })
    }
    
    activities.push({ type: 'join', clientId: cid, cardId: 'C001', timestamp: t, merchantId: 'M001' })
    
    let rem = ptsArr[i]
    let off = 0
    while (rem > 0) {
      const chunk = Math.min(rem, Math.floor(Math.random() * 40) + 5)
      activities.push({
        type: 'pts', clientId: cid, cardId: 'C001',
        amount: chunk, timestamp: t + 3600000 + off * 86400000, merchantId: 'M001',
      })
      rem -= chunk
      off++
    }
  })

  return {
    admin: { email: 'admin@fidali.dz', password: '' },
    merchants, cards, clients, clientCards, activities,
    currentUserId: null, currentRole: null, pendingPresence: null,
  }
}

// ===== MAIN STORE =====

interface StoreState {
  db: Database
  initialized: boolean

  // Init
  init: () => void
  save: () => void

  // Auth
  login: (email: string, password: string) => { success: boolean; error?: string; role?: 'merchant' | 'admin' }
  signup: (data: Omit<Merchant, 'id' | 'plan' | 'status' | 'createdAt'>) => { success: boolean; error?: string }
  logout: () => void
  getCurrentMerchant: () => Merchant | null

  // Cards
  createCard: (card: Omit<LoyaltyCard, 'id' | 'createdAt' | 'code'>) => { success: boolean; error?: string }
  deleteCard: (cardId: string) => void
  getMyCards: () => LoyaltyCard[]
  getCardByCode: (code: string) => LoyaltyCard | undefined

  // Clients
  getMyClients: () => { client: Client; clientCards: ClientCard[] }[]
  getClientCardsByCardId: (cardId: string) => ClientCard[]
  addPoints: (clientCardId: string, amount: number) => { success: boolean; error?: string }
  redeemReward: (clientCardId: string) => void
  deleteClient: (clientId: string) => void

  // Client Join
  joinCard: (cardId: string, name: string, phone: string) => { success: boolean; clientCardId?: string; error?: string }
  findClientByPhone: (phone: string, cardId: string) => { client: Client; clientCard: ClientCard } | null

  // Presence
  setPendingPresence: (presence: PendingPresence | null) => void
  confirmPresence: (clientCardId: string, points: number) => { success: boolean; error?: string }
  rejectPresence: () => void

  // Admin
  getAllMerchants: () => Merchant[]
  changeMerchantPlan: (merchantId: string, plan: PlanType) => void
  changeMerchantStatus: (merchantId: string, status: MerchantStatus) => void
  deleteMerchant: (merchantId: string) => void

  // Stats
  getMyActivities: () => Activity[]
  getAllActivities: () => Activity[]
  getMyStats: () => { totalClients: number; totalCards: number; totalPoints: number; totalRewards: number }
}

export const useStore = create<StoreState>((set, get) => ({
  db: createSeedData(),
  initialized: false,

  init: () => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.merchants) {
          set({ db: parsed, initialized: true })
          return
        }
      }
    } catch {}
    const seed = createSeedData()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    set({ db: seed, initialized: true })
  },

  save: () => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(get().db))
  },

  // ===== AUTH =====
  login: (email, password) => {
    const { db } = get()
    if (email === db.admin.email && password === db.admin.password) {
      set({ db: { ...db, currentUserId: 'ADMIN', currentRole: 'admin' } })
      get().save()
      return { success: true, role: 'admin' as const }
    }
    const m = db.merchants.find(x => x.email === email && x.password === password)
    if (!m) return { success: false, error: 'Email ou mot de passe incorrect' }
    if (m.status === 'pending') return { success: false, error: '⏳ Compte en attente de validation' }
    if (m.status === 'suspended') return { success: false, error: '🚫 Compte suspendu' }
    set({ db: { ...db, currentUserId: m.id, currentRole: 'merchant' } })
    get().save()
    return { success: true, role: 'merchant' as const }
  },

  signup: (data) => {
    const { db } = get()
    if (db.merchants.find(x => x.email === data.email)) {
      return { success: false, error: 'Email déjà utilisé' }
    }
    const newMerchant: Merchant = {
      ...data,
      id: `M${uid()}`,
      plan: 'starter',
      status: 'pending',
      createdAt: Date.now(),
    }
    const updated = { ...db, merchants: [...db.merchants, newMerchant] }
    set({ db: updated })
    get().save()
    return { success: true }
  },

  logout: () => {
    const { db } = get()
    set({ db: { ...db, currentUserId: null, currentRole: null } })
    get().save()
  },

  getCurrentMerchant: () => {
    const { db } = get()
    if (!db.currentUserId || db.currentRole !== 'merchant') return null
    return db.merchants.find(m => m.id === db.currentUserId) || null
  },

  // ===== CARDS =====
  createCard: (cardData) => {
    const { db } = get()
    const merchant = db.merchants.find(m => m.id === db.currentUserId)
    if (!merchant) return { success: false, error: 'Non connecté' }
    
    const limits = getPlanLimits(merchant.plan)
    const currentCards = db.cards.filter(c => c.merchantId === merchant.id)
    if (currentCards.length >= limits.cards) {
      return { success: false, error: `Limite de ${limits.cards} carte(s) atteinte. Passez au plan supérieur.` }
    }

    const code = generateCardCode(cardData.businessName)
    const card: LoyaltyCard = {
      ...cardData,
      id: `C${uid()}`,
      code,
      createdAt: Date.now(),
    }
    set({ db: { ...db, cards: [...db.cards, card] } })
    get().save()
    return { success: true }
  },

  deleteCard: (cardId) => {
    const { db } = get()
    set({
      db: {
        ...db,
        cards: db.cards.filter(c => c.id !== cardId),
        clientCards: db.clientCards.filter(cc => cc.cardId !== cardId),
        activities: db.activities.filter(a => a.cardId !== cardId),
      },
    })
    get().save()
  },

  getMyCards: () => {
    const { db } = get()
    return db.cards.filter(c => c.merchantId === db.currentUserId)
  },

  getCardByCode: (code) => {
    const { db } = get()
    return db.cards.find(c => c.code.toUpperCase() === code.toUpperCase())
  },

  // ===== CLIENTS =====
  getMyClients: () => {
    const { db } = get()
    const myCardIds = new Set(db.cards.filter(c => c.merchantId === db.currentUserId).map(c => c.id))
    const myClientCards = db.clientCards.filter(cc => myCardIds.has(cc.cardId))
    const uniqueClientIds = [...new Set(myClientCards.map(cc => cc.clientId))]
    return uniqueClientIds.map(id => {
      const client = db.clients.find(c => c.id === id)!
      const cards = myClientCards.filter(cc => cc.clientId === id)
      return { client, clientCards: cards }
    }).filter(x => x.client)
  },

  getClientCardsByCardId: (cardId) => {
    const { db } = get()
    return db.clientCards.filter(cc => cc.cardId === cardId)
  },

  addPoints: (clientCardId, amount) => {
    const { db } = get()
    const cc = db.clientCards.find(x => x.id === clientCardId)
    if (!cc) return { success: false, error: 'Carte introuvable' }
    
    const updatedCC = db.clientCards.map(x =>
      x.id === clientCardId
        ? { ...x, points: x.points + amount, lastValidation: Date.now() }
        : x
    )
    const card = db.cards.find(c => c.id === cc.cardId)
    const newAct: Activity = {
      type: 'pts', clientId: cc.clientId, cardId: cc.cardId,
      amount, timestamp: Date.now(), merchantId: card?.merchantId || '',
    }
    set({ db: { ...db, clientCards: updatedCC, activities: [...db.activities, newAct] } })
    get().save()
    return { success: true }
  },

  redeemReward: (clientCardId) => {
    const { db } = get()
    const cc = db.clientCards.find(x => x.id === clientCardId)
    if (!cc) return
    
    const updatedCC = db.clientCards.map(x =>
      x.id === clientCardId ? { ...x, points: 0 } : x
    )
    const card = db.cards.find(c => c.id === cc.cardId)
    const newAct: Activity = {
      type: 'redeem', clientId: cc.clientId, cardId: cc.cardId,
      timestamp: Date.now(), merchantId: card?.merchantId || '',
    }
    set({ db: { ...db, clientCards: updatedCC, activities: [...db.activities, newAct] } })
    get().save()
  },

  deleteClient: (clientId) => {
    const { db } = get()
    const myCardIds = new Set(db.cards.filter(c => c.merchantId === db.currentUserId).map(c => c.id))
    set({
      db: {
        ...db,
        clientCards: db.clientCards.filter(cc => !(cc.clientId === clientId && myCardIds.has(cc.cardId))),
      },
    })
    get().save()
  },

  // ===== CLIENT JOIN =====
  joinCard: (cardId, name, phone) => {
    const { db } = get()
    const card = db.cards.find(c => c.id === cardId)
    if (!card) return { success: false, error: 'Carte introuvable' }

    const merchant = db.merchants.find(m => m.id === card.merchantId)
    const limits = getPlanLimits(merchant?.plan || 'starter')
    const existingCount = new Set(db.clientCards.filter(cc => cc.cardId === cardId).map(cc => cc.clientId)).size
    if (existingCount >= limits.clients) {
      return { success: false, error: 'Ce commerce a atteint sa limite de clients' }
    }

    let client = db.clients.find(c => c.phone === phone)
    if (!client) {
      client = { id: `CL${uid()}`, name, phone, createdAt: Date.now() }
      db.clients.push(client)
    } else {
      client.name = name
    }

    const ccid = `CC${uid()}`
    const newCC: ClientCard = {
      id: ccid, clientId: client.id, cardId,
      points: 0, createdAt: Date.now(), lastValidation: null,
    }
    const newAct: Activity = {
      type: 'join', clientId: client.id, cardId,
      timestamp: Date.now(), merchantId: card.merchantId,
    }

    set({
      db: {
        ...db,
        clients: [...db.clients.filter(c => c.id !== client!.id), client!],
        clientCards: [...db.clientCards, newCC],
        activities: [...db.activities, newAct],
      },
    })
    get().save()
    return { success: true, clientCardId: ccid }
  },

  findClientByPhone: (phone, cardId) => {
    const { db } = get()
    const client = db.clients.find(c => c.phone === phone)
    if (!client) return null
    const cc = db.clientCards.find(x => x.clientId === client.id && x.cardId === cardId)
    if (!cc) return null
    return { client, clientCard: cc }
  },

  // ===== PRESENCE =====
  setPendingPresence: (presence) => {
    const { db } = get()
    set({ db: { ...db, pendingPresence: presence } })
    get().save()
  },

  confirmPresence: (clientCardId, points) => {
    const { db } = get()
    const cc = db.clientCards.find(x => x.id === clientCardId)
    if (!cc) return { success: false, error: 'Carte introuvable' }

    if (cc.lastValidation && (Date.now() - cc.lastValidation) < 2 * 3600000) {
      const remaining = Math.ceil((2 * 3600000 - (Date.now() - cc.lastValidation)) / 60000)
      return { success: false, error: `⏳ Réessayez dans ${remaining} min` }
    }

    const updatedCC = db.clientCards.map(x =>
      x.id === clientCardId
        ? { ...x, points: x.points + points, lastValidation: Date.now() }
        : x
    )
    const card = db.cards.find(c => c.id === cc.cardId)
    const newAct: Activity = {
      type: 'pts', clientId: cc.clientId, cardId: cc.cardId,
      amount: points, timestamp: Date.now(), merchantId: card?.merchantId || '',
    }
    set({
      db: {
        ...db,
        clientCards: updatedCC,
        activities: [...db.activities, newAct],
        pendingPresence: null,
      },
    })
    get().save()
    return { success: true }
  },

  rejectPresence: () => {
    const { db } = get()
    set({ db: { ...db, pendingPresence: null } })
    get().save()
  },

  // ===== ADMIN =====
  getAllMerchants: () => get().db.merchants,

  changeMerchantPlan: (merchantId, plan) => {
    const { db } = get()
    set({
      db: {
        ...db,
        merchants: db.merchants.map(m => m.id === merchantId ? { ...m, plan } : m),
      },
    })
    get().save()
  },

  changeMerchantStatus: (merchantId, status) => {
    const { db } = get()
    set({
      db: {
        ...db,
        merchants: db.merchants.map(m => m.id === merchantId ? { ...m, status } : m),
      },
    })
    get().save()
  },

  deleteMerchant: (merchantId) => {
    const { db } = get()
    const cardIds = db.cards.filter(c => c.merchantId === merchantId).map(c => c.id)
    set({
      db: {
        ...db,
        merchants: db.merchants.filter(m => m.id !== merchantId),
        cards: db.cards.filter(c => c.merchantId !== merchantId),
        clientCards: db.clientCards.filter(cc => !cardIds.includes(cc.cardId)),
        activities: db.activities.filter(a => a.merchantId !== merchantId),
      },
    })
    get().save()
  },

  // ===== STATS =====
  getMyActivities: () => {
    const { db } = get()
    return db.activities
      .filter(a => a.merchantId === db.currentUserId)
      .sort((a, b) => b.timestamp - a.timestamp)
  },

  getAllActivities: () => {
    return get().db.activities.sort((a, b) => b.timestamp - a.timestamp)
  },

  getMyStats: () => {
    const { db } = get()
    const myCards = db.cards.filter(c => c.merchantId === db.currentUserId)
    const myCardIds = new Set(myCards.map(c => c.id))
    const myClientCards = db.clientCards.filter(cc => myCardIds.has(cc.cardId))
    const uniqueClients = new Set(myClientCards.map(cc => cc.clientId)).size
    const totalPoints = myClientCards.reduce((s, cc) => s + cc.points, 0)
    const totalRewards = myClientCards.filter(cc => {
      const card = myCards.find(c => c.id === cc.cardId)
      return card && cc.points >= card.maxPoints
    }).length

    return {
      totalClients: uniqueClients,
      totalCards: myCards.length,
      totalPoints,
      totalRewards,
    }
  },
}))
