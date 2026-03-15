// ===== CORE TYPES =====

export type PlanType = 'starter' | 'pro' | 'premium'
export type MerchantStatus = 'active' | 'approved' | 'pending' | 'suspended' | 'rejected'
export type ActivityType = 'join' | 'pts' | 'redeem'
export type PointsRuleType = 'visit' | 'da' | 'item' | 'custom'
export type PaymentMethod = 'baridimob' | 'ccp' | 'especes'

export interface Merchant {
  id: string
  name: string
  email: string
  password: string
  business: string
  sector: string
  phone: string
  plan: PlanType
  status: MerchantStatus
  createdAt: number
}

export interface LoyaltyCard {
  id: string
  merchantId: string
  businessName: string
  color1: string
  color2: string
  pointsRule: string
  pointsPerVisit: number
  reward: string
  maxPoints: number
  welcomeMessage: string
  code: string
  createdAt: number
}

export interface Client {
  id: string
  name: string
  phone: string
  createdAt: number
}

export interface ClientCard {
  id: string
  clientId: string
  cardId: string
  points: number
  createdAt: number
  lastValidation: number | null
}

export interface Activity {
  type: ActivityType
  clientId: string
  cardId: string
  amount?: number
  timestamp: number
  merchantId: string
}

export interface PendingPresence {
  clientId: string
  clientCardId: string
  cardId: string
  merchantId: string
  phone: string
  name: string
  timestamp: number
}

export interface AdminCredentials {
  email: string
  password: string
}

// ===== STORE TYPES =====

export interface Database {
  admin: AdminCredentials
  merchants: Merchant[]
  cards: LoyaltyCard[]
  clients: Client[]
  clientCards: ClientCard[]
  activities: Activity[]
  currentUserId: string | null
  currentRole: 'merchant' | 'admin' | null
  pendingPresence: PendingPresence | null
}

// ===== UI TYPES =====

export interface CardColor {
  c1: string
  c2: string
}

export interface CardRenderProps {
  businessName: string
  color1: string
  color2: string
  points?: number
  maxPoints?: number
  holderName?: string
  reward?: string
  size?: 'sm' | 'md' | 'lg'
}

export interface PlanLimits {
  cards: number
  clients: number
}

export interface KPIData {
  label: string
  value: string | number
  icon: string
  color: string
}

export interface ClientStatus {
  className: string
  label: string
}

export interface FunnelData {
  plan: PlanType
  name: string
  phone: string
  email: string
  business: string
  paymentMethod: PaymentMethod
}

// ===== CONSTANTS =====

export const CARD_COLORS: CardColor[] = [
  { c1: '#FF6B35', c2: '#FF9A5C' },
  { c1: '#4D96FF', c2: '#6BBBFF' },
  { c1: '#6BCB77', c2: '#9EE8A8' },
  { c1: '#C77DFF', c2: '#E0AAFF' },
  { c1: '#FF6B9D', c2: '#FFB3CD' },
  { c1: '#1A1A2E', c2: '#16213E' },
  { c1: '#FF9500', c2: '#FFCD00' },
  { c1: '#00B4D8', c2: '#90E0EF' },
  { c1: '#E74C3C', c2: '#FF7675' },
  { c1: '#2D3436', c2: '#636E72' },
]

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  starter: { cards: 1, clients: 10 },
  pro: { cards: 5, clients: 100 },
  premium: { cards: 999, clients: 99999 },
}

export const SECTORS = [
  { value: 'restaurant', label: '🍕 Restaurant / Fast-food' },
  { value: 'cafe', label: '☕ Café / Salon de thé' },
  { value: 'boulangerie', label: '🥖 Boulangerie / Pâtisserie' },
  { value: 'boutique', label: '👗 Boutique / Prêt-à-porter' },
  { value: 'salon', label: '💇 Salon de coiffure / Beauté' },
  { value: 'pharmacie', label: '💊 Pharmacie' },
  { value: 'superette', label: '🛒 Supérette / Épicerie' },
  { value: 'ecommerce', label: '📦 E-commerce' },
  { value: 'gym', label: '💪 Salle de sport' },
  { value: 'autre', label: '🏪 Autre commerce' },
]

export const COOLDOWN_MS = 2 * 3600000 // 2 hours
export const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
