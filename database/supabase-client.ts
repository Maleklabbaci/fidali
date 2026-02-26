// ============================================
// FIDALI — Supabase Client & API Helpers
// ============================================
// Copy this to your Next.js project: lib/supabase.ts
// ============================================

import { createClient } from '@supabase/supabase-js'
import type { Database, PlanType, PaymentMethod } from './supabase-types'

// ============================================
// CLIENT SETUP
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side client (for admin operations)
export function createServerClient() {
  return createClient<Database>(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ============================================
// AUTH HELPERS
// ============================================

export async function loginMerchant(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { success: false, error: error.message }

  // Get merchant profile
  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('auth_user_id', data.user.id)
    .single()

  if (!merchant) return { success: false, error: 'Profil commerçant introuvable' }
  if (merchant.status === 'pending') return { success: false, error: '⏳ Compte en attente de validation' }
  if (merchant.status === 'suspended') return { success: false, error: '🚫 Compte suspendu' }

  // Update last login
  await supabase.from('merchants').update({ last_login_at: new Date().toISOString() }).eq('id', merchant.id)

  return { success: true, merchant, role: 'merchant' as const }
}

export async function loginAdmin(email: string, password: string) {
  const { data: admin } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .single()

  if (!admin) return { success: false, error: 'Admin introuvable' }

  // In production, use Supabase Auth for admin too
  // For now, verify with pgcrypto
  const { data: verified } = await supabase.rpc('verify_admin_password', {
    p_email: email,
    p_password: password
  })

  if (!verified) return { success: false, error: 'Mot de passe incorrect' }

  return { success: true, admin, role: 'admin' as const }
}

export async function signupMerchant(data: {
  name: string
  business: string
  sector: string
  phone: string
  email: string
  password: string
}) {
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  })
  if (authError) return { success: false, error: authError.message }

  // Create merchant profile
  const { error: profileError } = await supabase.from('merchants').insert({
    auth_user_id: authData.user!.id,
    email: data.email,
    password_hash: '', // Supabase Auth handles this
    name: data.name,
    business_name: data.business,
    sector: data.sector,
    phone: data.phone,
    plan: 'starter',
    status: 'pending',
  })

  if (profileError) return { success: false, error: profileError.message }

  return { success: true }
}

export async function logout() {
  await supabase.auth.signOut()
}

// ============================================
// CARD OPERATIONS
// ============================================

export async function createCard(merchantId: string, data: {
  businessName: string
  color1: string
  color2: string
  pointsRule: string
  pointsRuleType: string
  pointsPerVisit: number
  reward: string
  maxPoints: number
  welcomeMessage: string
}) {
  // Generate unique code
  const { data: code } = await supabase.rpc('generate_card_code', {
    biz_name: data.businessName
  })

  const { data: card, error } = await supabase.from('loyalty_cards').insert({
    merchant_id: merchantId,
    business_name: data.businessName,
    color1: data.color1,
    color2: data.color2,
    points_rule: data.pointsRule,
    points_rule_type: data.pointsRuleType as any,
    points_per_visit: data.pointsPerVisit,
    reward: data.reward,
    max_points: data.maxPoints,
    welcome_message: data.welcomeMessage,
    code: code!,
  }).select().single()

  if (error) return { success: false, error: error.message }
  return { success: true, card }
}

export async function getMyCards(merchantId: string) {
  const { data, error } = await supabase
    .from('loyalty_cards')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return data || []
}

export async function deleteCard(cardId: string) {
  await supabase.from('loyalty_cards').update({ is_active: false }).eq('id', cardId)
}

export async function getCardByCode(code: string) {
  const { data } = await supabase
    .from('loyalty_cards')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  return data
}

// ============================================
// CLIENT OPERATIONS
// ============================================

export async function joinCard(cardCode: string, clientName: string, clientPhone: string, deviceToken?: string) {
  const { data, error } = await supabase.rpc('join_card', {
    p_card_code: cardCode,
    p_client_name: clientName,
    p_client_phone: clientPhone,
    p_device_token: deviceToken || null,
  })

  if (error) return { success: false, error: error.message }
  return data as any
}

export async function findClientByPhone(phone: string, cardId: string) {
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('phone', phone)
    .single()

  if (!client) return null

  const { data: clientCard } = await supabase
    .from('client_cards')
    .select('*')
    .eq('client_id', client.id)
    .eq('card_id', cardId)
    .single()

  if (!clientCard) return null

  return { client, clientCard }
}

export async function getMyClients(merchantId: string) {
  const { data } = await supabase
    .from('top_clients')
    .select('*')
    .eq('merchant_id', merchantId)
    .order('points', { ascending: false })

  return data || []
}

// ============================================
// PRESENCE VALIDATION
// ============================================

export async function createPendingPresence(data: {
  clientId: string
  clientCardId: string
  cardId: string
  merchantId: string
  clientName: string
  clientPhone: string
}) {
  // Clean up old pending presences for this client
  await supabase
    .from('pending_presences')
    .update({ status: 'expired', resolved_at: new Date().toISOString() })
    .eq('client_id', data.clientId)
    .eq('status', 'pending')

  const { data: presence, error } = await supabase
    .from('pending_presences')
    .insert({
      client_id: data.clientId,
      client_card_id: data.clientCardId,
      card_id: data.cardId,
      merchant_id: data.merchantId,
      client_name: data.clientName,
      client_phone: data.clientPhone,
    })
    .select()
    .single()

  if (error) return null
  return presence
}

export async function getPendingPresences(merchantId: string) {
  const { data } = await supabase
    .from('pending_presences')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  return data || []
}

export async function validatePresence(clientCardId: string, points: number, merchantId: string) {
  const { data, error } = await supabase.rpc('validate_presence', {
    p_client_card_id: clientCardId,
    p_points: points,
    p_merchant_id: merchantId,
  })

  if (error) return { success: false, error: error.message }
  return data as any
}

export async function rejectPresence(presenceId: string) {
  await supabase
    .from('pending_presences')
    .update({ status: 'rejected', resolved_at: new Date().toISOString() })
    .eq('id', presenceId)
}

// ============================================
// REWARD OPERATIONS
// ============================================

export async function redeemReward(clientCardId: string, merchantId: string) {
  const { data, error } = await supabase.rpc('redeem_reward', {
    p_client_card_id: clientCardId,
    p_merchant_id: merchantId,
  })

  if (error) return { success: false, error: error.message }
  return data as any
}

// ============================================
// STATS & DASHBOARD
// ============================================

export async function getMerchantDashboard(merchantId: string) {
  const { data } = await supabase.rpc('get_merchant_dashboard', {
    p_merchant_id: merchantId,
  })

  return data as any
}

export async function getMerchantStats(merchantId: string) {
  const { data } = await supabase
    .from('merchant_stats')
    .select('*')
    .eq('merchant_id', merchantId)
    .single()

  return data
}

export async function getCardStats(merchantId: string) {
  const { data } = await supabase
    .from('card_stats')
    .select('*')
    .eq('merchant_id', merchantId)

  return data || []
}

export async function getDailyActivity(merchantId: string, days: number = 7) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data } = await supabase
    .from('daily_activity')
    .select('*')
    .eq('merchant_id', merchantId)
    .gte('day', since.toISOString().split('T')[0])
    .order('day', { ascending: true })

  return data || []
}

export async function getActivities(merchantId: string, limit: number = 20) {
  const { data } = await supabase
    .from('activities')
    .select(`
      *,
      clients:client_id(name, phone),
      loyalty_cards:card_id(business_name)
    `)
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return data || []
}

export async function getClientHistory(clientId: string, merchantId: string) {
  const { data } = await supabase
    .from('activities')
    .select('*')
    .eq('client_id', clientId)
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false })

  return data || []
}

// ============================================
// PAYMENT / UPGRADE
// ============================================

export async function requestUpgrade(merchantId: string, data: {
  plan: PlanType
  paymentMethod: PaymentMethod
  name: string
  phone: string
  email?: string
}) {
  const amount = data.plan === 'premium' ? 9000 : 4500

  const { error } = await supabase.from('payment_requests').insert({
    merchant_id: merchantId,
    requested_plan: data.plan,
    payment_method: data.paymentMethod,
    amount_dzd: amount,
    contact_name: data.name,
    contact_phone: data.phone,
    contact_email: data.email,
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
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
    query = query.or(`business_name.ilike.%${search}%,email.ilike.%${search}%,name.ilike.%${search}%`)
  }

  const { data } = await query
  return data || []
}

export async function getPendingMerchants() {
  const { data } = await supabase
    .from('merchants')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return data || []
}

export async function approveMerchant(merchantId: string) {
  await supabase
    .from('merchants')
    .update({ status: 'active', validated_at: new Date().toISOString() })
    .eq('id', merchantId)
}

export async function suspendMerchant(merchantId: string) {
  await supabase
    .from('merchants')
    .update({ status: 'suspended' })
    .eq('id', merchantId)
}

export async function changeMerchantPlan(merchantId: string, plan: PlanType) {
  await supabase
    .from('merchants')
    .update({ plan, updated_at: new Date().toISOString() })
    .eq('id', merchantId)
}

export async function deleteMerchant(merchantId: string) {
  await supabase.from('merchants').delete().eq('id', merchantId)
}

export async function getPlatformOverview() {
  const { data } = await supabase
    .from('platform_overview')
    .select('*')
    .single()

  return data
}

export async function getPendingPayments() {
  const { data } = await supabase
    .from('pending_payments')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return data || []
}

export async function approvePayment(paymentId: string, merchantId: string, plan: PlanType) {
  // Update payment status
  await supabase
    .from('payment_requests')
    .update({ status: 'confirmed', processed_at: new Date().toISOString() })
    .eq('id', paymentId)

  // Upgrade merchant plan
  await changeMerchantPlan(merchantId, plan)
}

export async function rejectPayment(paymentId: string) {
  await supabase
    .from('payment_requests')
    .update({ status: 'rejected', processed_at: new Date().toISOString() })
    .eq('id', paymentId)
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

export function subscribeToPendingPresences(merchantId: string, callback: (presence: any) => void) {
  return supabase
    .channel('pending_presences')
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

export function subscribeToPresenceUpdates(clientCardId: string, callback: (update: any) => void) {
  return supabase
    .channel('client_card_updates')
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

export function subscribeToPresenceStatus(presenceId: string, callback: (status: string) => void) {
  return supabase
    .channel('presence_status')
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
