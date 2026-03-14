// ============================================
// FIDALI — Supabase Client
// ============================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check .env.local:\n' +
    '- NEXT_PUBLIC_SUPABASE_URL\n' +
    '- NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

// ===== CLIENT-SIDE SUPABASE =====
// Use this in components and client-side code
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// ===== SERVER-SIDE SUPABASE =====
// Use this in API routes and server components
export function createServerSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not set. Using anon key for server operations.')
    return createClient(supabaseUrl, supabaseAnonKey)
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// ============================================
// AUTH HELPERS
// ============================================

export async function signUpMerchant(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export async function signInMerchant(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

// ============================================
// MERCHANT OPERATIONS
// ============================================

export async function getMerchantProfile(authUserId: string) {
  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle()
  return { data, error }
}

export async function createMerchantProfile(profile: {
  auth_user_id: string
  email: string
  name: string
  business_name: string
  sector: string
  phone?: string
}) {
  const { data, error } = await supabase
    .from('merchants')
    .insert({
      ...profile,
      password_hash: '', // Auth handled by Supabase Auth
      plan: 'starter',
      status: 'pending',
    })
    .select()
    .maybeSingle()
  return { data, error }
}

export async function updateMerchantProfile(merchantId: string, updates: {
  business_name?: string
  phone?: string
  name?: string
  welcome_message?: string
}) {
  const { data, error } = await supabase
    .from('merchants')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', merchantId)
    .select()
    .maybeSingle()
  return { data, error }
}

// ============================================
// CARD OPERATIONS
// ============================================

export async function getMyCards(merchantId: string) {
  const { data, error } = await supabase
    .from('loyalty_cards')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  return { data: data || [], error }
}

export async function createCard(card: {
  merchant_id: string
  business_name: string
  color1: string
  color2: string
  points_rule: string
  points_rule_type: string
  points_per_visit: number
  reward: string
  max_points: number
  welcome_message: string
  code: string
}) {
  const { data, error } = await supabase
    .from('loyalty_cards')
    .insert(card)
    .select()
    .maybeSingle()
  return { data, error }
}

export async function deleteCard(cardId: string) {
  const { error } = await supabase
    .from('loyalty_cards')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', cardId)
  return { error }
}

export async function getCardByCode(code: string) {
  const { data, error } = await supabase
    .from('loyalty_cards')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .maybeSingle()
  return { data, error }
}

// ============================================
// CLIENT OPERATIONS (No auth needed)
// ============================================

export async function joinCard(cardCode: string, clientName: string, clientPhone: string) {
  const { data, error } = await supabase.rpc('join_card', {
    p_card_code: cardCode,
    p_client_name: clientName,
    p_client_phone: clientPhone,
  })
  return { data, error }
}

export async function findClientByPhone(phone: string, cardId: string) {
  // First find client by phone
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('phone', phone)
    .maybeSingle()

  if (!client) return { client: null, clientCard: null }

  // Then find their card
  const { data: clientCard } = await supabase
    .from('client_cards')
    .select('*')
    .eq('client_id', client.id)
    .eq('card_id', cardId)
    .maybeSingle()

  return { client, clientCard }
}

export async function getMyClients(merchantId: string) {
  const { data, error } = await supabase
    .from('top_clients')
    .select('*')
    .eq('merchant_id', merchantId)
    .order('points', { ascending: false })
  return { data: data || [], error }
}

export async function getClientsByCardId(cardId: string) {
  const { data, error } = await supabase
    .from('client_cards')
    .select(`
      *,
      clients:client_id(id, name, phone, created_at)
    `)
    .eq('card_id', cardId)
    .order('created_at', { ascending: false })
  return { data: data || [], error }
}

// ============================================
// PRESENCE VALIDATION
// ============================================

export async function validatePresence(clientCardId: string, points: number, merchantId: string) {
  const { data, error } = await supabase.rpc('validate_presence', {
    p_client_card_id: clientCardId,
    p_points: points,
    p_merchant_id: merchantId,
  })
  return { data, error }
}

export async function redeemReward(clientCardId: string, merchantId: string) {
  const { data, error } = await supabase.rpc('redeem_reward', {
    p_client_card_id: clientCardId,
    p_merchant_id: merchantId,
  })
  return { data, error }
}

export async function createPendingPresence(data: {
  client_id: string
  client_card_id: string
  card_id: string
  merchant_id: string
  client_name: string
  client_phone: string
}) {
  // Cancel any existing pending for this client
  await supabase
    .from('pending_presences')
    .update({ status: 'expired', resolved_at: new Date().toISOString() })
    .eq('client_id', data.client_id)
    .eq('status', 'pending')

  const { data: presence, error } = await supabase
    .from('pending_presences')
    .insert(data)
    .select()
    .maybeSingle()
  return { data: presence, error }
}

export async function getPendingPresences(merchantId: string) {
  const { data, error } = await supabase
    .from('pending_presences')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
  return { data: data || [], error }
}

export async function resolvePresence(presenceId: string, status: 'confirmed' | 'rejected') {
  const { error } = await supabase
    .from('pending_presences')
    .update({ 
      status, 
      resolved_at: new Date().toISOString() 
    })
    .eq('id', presenceId)
  return { error }
}

// ============================================
// STATS & DASHBOARD
// ============================================

export async function getMerchantStats(merchantId: string) {
  const { data, error } = await supabase
    .from('merchant_stats')
    .select('*')
    .eq('merchant_id', merchantId)
    .maybeSingle()
  return { data, error }
}

export async function getMerchantDashboard(merchantId: string) {
  const { data, error } = await supabase.rpc('get_merchant_dashboard', {
    p_merchant_id: merchantId,
  })
  return { data, error }
}

export async function getDailyActivity(merchantId: string, days: number = 7) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('daily_activity')
    .select('*')
    .eq('merchant_id', merchantId)
    .gte('day', since.toISOString().split('T')[0])
    .order('day', { ascending: true })
  return { data: data || [], error }
}

export async function getRecentActivities(merchantId: string, limit: number = 20) {
  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      clients:client_id(name, phone),
      loyalty_cards:card_id(business_name)
    `)
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data: data || [], error }
}

export async function getClientHistory(clientId: string, merchantId: string) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('client_id', clientId)
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false })
  return { data: data || [], error }
}

// ============================================
// ADMIN OPERATIONS
// ============================================

export async function getAllMerchants(search?: string) {
  let query = supabase
    .from('merchants')
    .select('*')
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(
      `business_name.ilike.%${search}%,email.ilike.%${search}%,name.ilike.%${search}%`
    )
  }

  const { data, error } = await query
  return { data: data || [], error }
}

export async function getPendingMerchants() {
  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  return { data: data || [], error }
}

export async function updateMerchantStatus(merchantId: string, status: 'active' | 'suspended') {
  const { error } = await supabase
    .from('merchants')
    .update({ 
      status, 
      updated_at: new Date().toISOString(),
      ...(status === 'active' ? { validated_at: new Date().toISOString() } : {})
    })
    .eq('id', merchantId)
  return { error }
}

export async function updateMerchantPlan(merchantId: string, plan: 'starter' | 'pro' | 'premium') {
  const { error } = await supabase
    .from('merchants')
    .update({ plan, updated_at: new Date().toISOString() })
    .eq('id', merchantId)
  return { error }
}

export async function deleteMerchant(merchantId: string) {
  const { error } = await supabase
    .from('merchants')
    .delete()
    .eq('id', merchantId)
  return { error }
}

export async function getPlatformOverview() {
  const { data, error } = await supabase
    .from('platform_overview')
    .select('*')
    .maybeSingle()
  return { data, error }
}

export async function getAllActivities(limit: number = 50) {
  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      clients:client_id(name),
      loyalty_cards:card_id(business_name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data: data || [], error }
}

// ============================================
// PAYMENT REQUESTS
// ============================================

export async function createPaymentRequest(request: {
  merchant_id: string
  requested_plan: 'pro' | 'premium'
  payment_method: 'baridimob' | 'ccp' | 'especes'
  amount_dzd: number
  contact_name: string
  contact_phone: string
  contact_email?: string
}) {
  const { data, error } = await supabase
    .from('payment_requests')
    .insert(request)
    .select()
    .maybeSingle()
  return { data, error }
}

export async function getPendingPayments() {
  const { data, error } = await supabase
    .from('pending_payments')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  return { data: data || [], error }
}

export async function approvePayment(paymentId: string, merchantId: string, plan: 'pro' | 'premium') {
  // Update payment
  await supabase
    .from('payment_requests')
    .update({ status: 'confirmed', processed_at: new Date().toISOString() })
    .eq('id', paymentId)

  // Upgrade merchant
  await updateMerchantPlan(merchantId, plan)
}

export async function rejectPayment(paymentId: string) {
  const { error } = await supabase
    .from('payment_requests')
    .update({ status: 'rejected', processed_at: new Date().toISOString() })
    .eq('id', paymentId)
  return { error }
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

export function subscribeToPendingPresences(
  merchantId: string,
  callback: (presence: any) => void
) {
  return supabase
    .channel(`presences-${merchantId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'pending_presences',
        filter: `merchant_id=eq.${merchantId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe()
}

export function subscribeToClientCardUpdates(
  clientCardId: string,
  callback: (update: any) => void
) {
  return supabase
    .channel(`client-card-${clientCardId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'client_cards',
        filter: `id=eq.${clientCardId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe()
}

export function subscribeToPresenceStatus(
  presenceId: string,
  callback: (status: string) => void
) {
  return supabase
    .channel(`presence-status-${presenceId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'pending_presences',
        filter: `id=eq.${presenceId}`,
      },
      (payload) => callback((payload.new as any).status)
    )
    .subscribe()
}

// ============================================
// UTILITY
// ============================================

export function generateCardCode(bizName: string): string {
  const clean = bizName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10).toUpperCase()
  const random = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `${clean}-${random}`
}

export function getQrUrl(code: string): string {
  const base = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}` 
    : ''
  return `${base}#join/${code}`
}

export function getQrImageUrl(text: string, size: number = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&color=1A1A2E&bgcolor=FFFFFF&margin=8`
}
