// ============================================
// FIDALI — Supabase Client & API Helpers
// ============================================

import { createClient } from '@supabase/supabase-js'

// ============================================
// TYPES
// ============================================

type PlanType = 'starter' | 'pro' | 'premium'
type PaymentMethod = 'ccp' | 'baridi_mob' | 'cash'

interface Merchant {
  id: string
  auth_user_id: string
  email: string
  password_hash: string
  name: string
  business_name: string
  sector: string
  phone: string
  plan: PlanType
  status: 'active' | 'pending' | 'suspended'
  logo_url?: string
  color?: string
  created_at: string
  updated_at?: string
  validated_at?: string
  last_login_at?: string
  [key: string]: any
}

interface Admin {
  id: string
  email: string
  name: string
  role: string
  [key: string]: any
}

interface LoyaltyCard {
  id: string
  merchant_id: string
  business_name: string
  code: string
  color1: string
  color2: string
  points_rule: string
  points_rule_type: string
  points_per_visit: number
  reward: string
  max_points: number
  welcome_message: string
  is_active: boolean
  created_at: string
  [key: string]: any
}

interface Client {
  id: string
  name: string
  phone: string
  [key: string]: any
}

interface ClientCard {
  id: string
  client_id: string
  card_id: string
  points: number
  [key: string]: any
}

interface PendingPresence {
  id: string
  client_id: string
  client_card_id: string
  card_id: string
  merchant_id: string
  client_name: string
  client_phone: string
  status: 'pending' | 'validated' | 'rejected' | 'expired'
  expires_at: string
  created_at: string
  resolved_at?: string
  [key: string]: any
}

// ============================================
// CLIENT SETUP
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function createServerClient() {
  return createClient(
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
  if (error) return { success: false as const, error: error.message }

  const { data: merchantData } = await supabase
    .from('merchants')
    .select('*')
    .eq('auth_user_id', data.user.id)
    .single()

  const merchant = merchantData as Merchant | null

  if (!merchant) return { success: false as const, error: 'Profil commerçant introuvable' }
  if (merchant.status === 'pending') return { success: false as const, error: '⏳ Compte en attente de validation' }
  if (merchant.status === 'suspended') return { success: false as const, error: '🚫 Compte suspendu' }

  await supabase
    .from('merchants')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', merchant.id)

  return { success: true as const, merchant, role: 'merchant' as const }
}

export async function loginAdmin(email: string, password: string) {
  // Step 1: Verify password via RPC (bypasses RLS)
  const { data: verified, error: verifyError } = await supabase.rpc('verify_admin_password', {
    p_email: email,
    p_password: password,
  })

  if (verifyError) {
    console.error('Admin verify error:', verifyError)
    return { success: false as const, error: 'Erreur serveur' }
  }

  if (!verified) {
    return { success: false as const, error: 'Email ou mot de passe incorrect' }
  }

  // Step 2: Get admin data via RPC (bypasses RLS)
  const { data: adminData, error: adminError } = await supabase.rpc('get_admin_by_email', {
    p_email: email,
  })

  if (adminError || !adminData) {
    console.error('Admin fetch error:', adminError)
    // Fallback: create admin object from email
    return {
      success: true as const,
      admin: { id: 'admin', email, name: 'Admin Fidali', role: 'super_admin' },
      role: 'admin' as const,
    }
  }

  return { success: true as const, admin: adminData, role: 'admin' as const }
}
export async function signupMerchant(data: {
  name: string
  business: string
  sector: string
  phone: string
  email: string
  password: string
}) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  })
  if (authError) return { success: false as const, error: authError.message }

  const { error: profileError } = await supabase.from('merchants').insert({
    auth_user_id: authData.user!.id,
    email: data.email,
    password_hash: '',
    name: data.name,
    business_name: data.business,
    sector: data.sector,
    phone: data.phone,
    plan: 'starter',
    status: 'pending',
  })

  if (profileError) return { success: false as const, error: profileError.message }

  return { success: true as const }
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
  const { data: code } = await supabase.rpc('generate_card_code', {
    biz_name: data.businessName,
  })

  const { data: cardData, error } = await supabase.from('loyalty_cards').insert({
    merchant_id: merchantId,
    business_name: data.businessName,
    color1: data.color1,
    color2: data.color2,
    points_rule: data.pointsRule,
    points_rule_type: data.pointsRuleType,
    points_per_visit: data.pointsPerVisit,
    reward: data.reward,
    max_points: data.maxPoints,
    welcome_message: data.welcomeMessage,
    code: code!,
  }).select().single()

  const card = cardData as LoyaltyCard | null

  if (error) return { success: false as const, error: error.message }
  return { success: true as const, card }
}

export async function getMyCards(merchantId: string) {
  const { data } = await supabase
    .from('loyalty_cards')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (data as LoyaltyCard[] | null) || []
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

  return data as LoyaltyCard | null
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

  if (error) return { success: false as const, error: error.message }
  return data as any
}

export async function findClientByPhone(phone: string, cardId: string) {
  const { data: clientData } = await supabase
    .from('clients')
    .select('*')
    .eq('phone', phone)
    .single()

  const client = clientData as Client | null
  if (!client) return null

  const { data: clientCardData } = await supabase
    .from('client_cards')
    .select('*')
    .eq('client_id', client.id)
    .eq('card_id', cardId)
    .single()

  const clientCard = clientCardData as ClientCard | null
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
  await supabase
    .from('pending_presences')
    .update({ status: 'expired', resolved_at: new Date().toISOString() })
    .eq('client_id', data.clientId)
    .eq('status', 'pending')

  const { data: presenceData, error } = await supabase
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
  return presenceData as PendingPresence
}

export async function getPendingPresences(merchantId: string) {
  const { data } = await supabase
    .from('pending_presences')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  return (data as PendingPresence[] | null) || []
}

export async function validatePresence(clientCardId: string, points: number, merchantId: string) {
  const { data, error } = await supabase.rpc('validate_presence', {
    p_client_card_id: clientCardId,
    p_points: points,
    p_merchant_id: merchantId,
  })

  if (error) return { success: false as const, error: error.message }
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

  if (error) return { success: false as const, error: error.message }
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

  if (error) return { success: false as const, error: error.message }
  return { success: true as const }
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
  return (data as Merchant[] | null) || []
}

export async function getPendingMerchants() {
  const { data } = await supabase
    .from('merchants')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (data as Merchant[] | null) || []
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
  await supabase
    .from('payment_requests')
    .update({ status: 'confirmed', processed_at: new Date().toISOString() })
    .eq('id', paymentId)

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
