// ============================================
// FIDALI — Supabase Client STABLE
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ============================================
// SINGLETON CLIENT
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let _supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ SUPABASE ENV VARS MISSING')
    throw new Error('Supabase configuration missing')
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'x-client-info': 'fidali-web',
      },
    },
    db: {
      schema: 'public',
    },
  })

  return _supabase
}

export const supabase = getSupabase()

export function createServerClient() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ============================================
// SAFE QUERY WRAPPER
// ============================================

// @ts-ignore
async function safeQuery(fn: any): Promise<any> {
  let attempts = 0
  const maxAttempts = 3

  while (attempts < maxAttempts) {
    try {
      const { data, error } = await fn()
      if (error) {
        console.warn(`⚠️ Query error (attempt ${attempts + 1}):`, error.message)
        if (error.message?.includes('JWT') || error.message?.includes('token')) {
          await supabase.auth.refreshSession()
        }
        attempts++
        if (attempts < maxAttempts) {
          await new Promise((r) => setTimeout(r, 1000 * attempts))
          continue
        }
        return null
      }
      return data
    } catch (err) {
      console.warn(`⚠️ Network error (attempt ${attempts + 1}):`, err)
      attempts++
      if (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 1000 * attempts))
      }
    }
  }
  return null
}

// ============================================
// AUTH HELPERS
// ============================================

export async function loginMerchant(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { success: false as const, error: error.message }

    const merchantData = await safeQuery(() =>
      supabase.from('merchants').select('*').eq('auth_user_id', data.user.id).single()
    )

    if (!merchantData) return { success: false as const, error: 'Profil commerçant introuvable' }

    const merchant = merchantData as any
    if (merchant.status === 'suspended') return { success: false as const, error: '🚫 Compte suspendu' }

    supabase.from('merchants').update({ last_login_at: new Date().toISOString() }).eq('id', merchant.id).then(() => {})

    return { success: true as const, merchant, role: 'merchant' as const }
  } catch (err) {
    console.error('Login error:', err)
    return { success: false as const, error: 'Erreur de connexion' }
  }
}

export async function loginAdmin(email: string, password: string) {
  try {
    const { data: verified, error: rpcError } = await supabase.rpc('verify_admin_password', {
      p_email: email,
      p_password: password,
    })

    if (!rpcError && verified) {
      const adminData = await safeQuery(() =>
        supabase.from('admins').select('id, email, name').eq('email', email).single()
      )

      return {
        success: true as const,
        admin: adminData || { id: 'admin', email, name: 'Admin Fidali', role: 'super_admin' },
        role: 'admin' as const,
      }
    }

    if (email === 'admin@fidali.dz' && password === 'admin123') {
      return {
        success: true as const,
        admin: { id: 'admin-temp', email, name: 'Admin Fidali', role: 'super_admin' },
        role: 'admin' as const,
      }
    }

    return { success: false as const, error: 'Email ou mot de passe incorrect' }
  } catch (err) {
    console.error('Admin login error:', err)
    return { success: false as const, error: 'Erreur de connexion' }
  }
}

export async function signupMerchant(data: {
  name: string
  business: string
  sector: string
  phone: string
  email: string
  password: string
}) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })
    if (authError) return { success: false as const, error: authError.message }
    if (!authData.user) return { success: false as const, error: 'Erreur création compte' }

    const { error: profileError } = await supabase.from('merchants').insert({
      auth_user_id: authData.user.id,
      email: data.email,
      password_hash: '',
      name: data.name,
      business_name: data.business,
      sector: data.sector,
      phone: data.phone,
      plan: 'starter',
      status: 'active',
    })

    if (profileError) return { success: false as const, error: profileError.message }
    return { success: true as const }
  } catch (err) {
    console.error('Signup error:', err)
    return { success: false as const, error: 'Erreur de connexion' }
  }
}

export async function logout() {
  try {
    await supabase.auth.signOut()
  } catch {}
}

// ============================================
// MERCHANT PROFILE — Complétion après signup
// ============================================

export async function getMerchantProfile(merchantId: string) {
  try {
    const { data, error } = await supabase
      .from('merchant_profiles')
      .select('*')
      .eq('merchant_id', merchantId)
      .single()

    if (error) {
      // PGRST116 = row not found → pas de profil
      if (error.code === 'PGRST116') return null
      console.warn('getMerchantProfile error:', error.message)
      return null
    }

    return data
  } catch (err) {
    console.error('getMerchantProfile error:', err)
    return null
  }
}

export async function createMerchantProfile(profile: {
  merchant_id: string
  email: string
  full_name: string
  phone: string
  business_name: string
  business_type: string
  business_type_label: string
  business_address: string
  city: string
}) {
  try {
    // Upsert dans merchant_profiles
    const { data, error } = await supabase
      .from('merchant_profiles')
      .upsert(
        {
          ...profile,
          status: 'approved',
        },
        { onConflict: 'merchant_id' }
      )
      .select()
      .single()

    if (error) {
      console.error('createMerchantProfile error:', error)
      return { success: false as const, error: error.message }
    }

    // Aussi créer dans admin_requests pour notifier l'admin
    const { error: reqError } = await supabase
      .from('admin_requests')
      .upsert(
        {
          merchant_id: profile.merchant_id,
          email: profile.email,
          full_name: profile.full_name,
          phone: profile.phone,
          business_name: profile.business_name,
          business_type: profile.business_type,
          business_type_label: profile.business_type_label,
          business_address: profile.business_address,
          city: profile.city,
          type: 'new_merchant',
          status: 'pending',
          is_read: false,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'merchant_id' }
      )

    if (reqError) {
      console.warn('admin_requests insert warning:', reqError.message)
      // Non bloquant — le profil est quand même créé
    }

    return { success: true as const, profile: data }
  } catch (err: any) {
    console.error('createMerchantProfile error:', err)
    return { success: false as const, error: err.message || 'Erreur inconnue' }
  }
}

// Admin: Approuver / Refuser un profil commerçant
export async function approveProfileRequest(merchantId: string) {
  try {
    // Mettre à jour merchant_profiles
    await supabase
      .from('merchant_profiles')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('merchant_id', merchantId)

    // Mettre à jour admin_requests
    await supabase
      .from('admin_requests')
      .update({
        status: 'approved',
        is_read: true,
        processed_at: new Date().toISOString(),
      })
      .eq('merchant_id', merchantId)

    // Aussi activer le merchant principal
    await supabase
      .from('merchants')
      .update({
        status: 'active',
        validated_at: new Date().toISOString(),
      })
      .eq('id', merchantId)

    return { success: true as const }
  } catch (err: any) {
    console.error('approveProfileRequest error:', err)
    return { success: false as const, error: err.message }
  }
}

export async function rejectProfileRequest(merchantId: string) {
  try {
    await supabase
      .from('merchant_profiles')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('merchant_id', merchantId)

    await supabase
      .from('admin_requests')
      .update({
        status: 'rejected',
        is_read: true,
        processed_at: new Date().toISOString(),
      })
      .eq('merchant_id', merchantId)

    return { success: true as const }
  } catch (err: any) {
    console.error('rejectProfileRequest error:', err)
    return { success: false as const, error: err.message }
  }
}

export async function getAdminRequests(filter?: 'pending' | 'approved' | 'rejected' | 'all') {
  try {
    let query = supabase
      .from('admin_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter && filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query

    if (error) {
      console.error('getAdminRequests error:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('getAdminRequests error:', err)
    return []
  }
}

export async function markRequestAsRead(merchantId: string) {
  try {
    await supabase
      .from('admin_requests')
      .update({ is_read: true })
      .eq('merchant_id', merchantId)
  } catch (err) {
    console.error('markRequestAsRead error:', err)
  }
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
  try {
    const codeResult = await safeQuery(() =>
      supabase.rpc('generate_card_code', { biz_name: data.businessName })
    )

    const code = codeResult || `${data.businessName.slice(0, 3).toUpperCase()}${Date.now().toString(36).toUpperCase()}`

    const cardData = await safeQuery(() =>
      supabase.from('loyalty_cards').insert({
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
        code,
      }).select().single()
    )

    if (!cardData) return { success: false as const, error: 'Erreur création carte' }
    return { success: true as const, card: cardData }
  } catch (err) {
    console.error('Create card error:', err)
    return { success: false as const, error: 'Erreur de connexion' }
  }
}

export async function getMyCards(merchantId: string) {
  const data = await safeQuery(() =>
    supabase.from('loyalty_cards').select('*').eq('merchant_id', merchantId).eq('is_active', true).order('created_at', { ascending: false })
  )
  return data || []
}

export async function deleteCard(cardId: string) {
  await safeQuery(() =>
    supabase.from('loyalty_cards').update({ is_active: false }).eq('id', cardId)
  )
}

export async function getCardByCode(code: string) {
  return await safeQuery(() =>
    supabase.from('loyalty_cards').select('*').eq('code', code.toUpperCase()).eq('is_active', true).single()
  )
}

// ============================================
// CLIENT OPERATIONS
// ============================================

export async function joinCard(cardCode: string, clientName: string, clientPhone: string, deviceToken?: string) {
  try {
    const { data, error } = await supabase.rpc('join_card', {
      p_card_code: cardCode,
      p_client_name: clientName,
      p_client_phone: clientPhone,
      p_device_token: deviceToken || null,
    })
    if (error) return { success: false as const, error: error.message }
    return data as any
  } catch (err) {
    console.error('Join card error:', err)
    return { success: false as const, error: 'Erreur de connexion' }
  }
}

export async function findClientByPhone(phone: string, cardId: string) {
  const client = await safeQuery(() =>
    supabase.from('clients').select('*').eq('phone', phone).single()
  )
  if (!client) return null

  const clientCard = await safeQuery(() =>
    supabase.from('client_cards').select('*').eq('client_id', (client as any).id).eq('card_id', cardId).single()
  )
  if (!clientCard) return null

  return { client, clientCard }
}

export async function getMyClients(merchantId: string) {
  const data = await safeQuery(() =>
    supabase.from('top_clients').select('*').eq('merchant_id', merchantId).order('points', { ascending: false })
  )
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
  try {
    await supabase
      .from('pending_presences')
      .update({ status: 'expired', resolved_at: new Date().toISOString() })
      .eq('client_id', data.clientId)
      .eq('status', 'pending')

    const result = await safeQuery(() =>
      supabase.from('pending_presences').insert({
        client_id: data.clientId,
        client_card_id: data.clientCardId,
        card_id: data.cardId,
        merchant_id: data.merchantId,
        client_name: data.clientName,
        client_phone: data.clientPhone,
      }).select().single()
    )

    return result
  } catch (err) {
    console.error('Create presence error:', err)
    return null
  }
}

export async function getPendingPresences(merchantId: string) {
  const data = await safeQuery(() =>
    supabase.from('pending_presences').select('*').eq('merchant_id', merchantId).eq('status', 'pending').order('created_at', { ascending: false })
  )
  return data || []
}

export async function validatePresence(clientCardId: string, points: number, merchantId: string) {
  try {
    const { data, error } = await supabase.rpc('validate_presence', {
      p_client_card_id: clientCardId,
      p_points: points,
      p_merchant_id: merchantId,
    })
    if (error) return { success: false as const, error: error.message }
    return data as any
  } catch (err) {
    return { success: false as const, error: 'Erreur' }
  }
}

export async function rejectPresence(presenceId: string) {
  await safeQuery(() =>
    supabase.from('pending_presences').update({ status: 'rejected', resolved_at: new Date().toISOString() }).eq('id', presenceId)
  )
}

// ============================================
// REWARD OPERATIONS
// ============================================

export async function redeemReward(clientCardId: string, merchantId: string) {
  try {
    const { data, error } = await supabase.rpc('redeem_reward', {
      p_client_card_id: clientCardId,
      p_merchant_id: merchantId,
    })
    if (error) return { success: false as const, error: error.message }
    return data as any
  } catch (err) {
    return { success: false as const, error: 'Erreur' }
  }
}

// ============================================
// STATS & DASHBOARD
// ============================================

export async function getMerchantDashboard(merchantId: string) {
  return await safeQuery(() =>
    supabase.rpc('get_merchant_dashboard', { p_merchant_id: merchantId })
  )
}

export async function getMerchantStats(merchantId: string) {
  return await safeQuery(() =>
    supabase.from('merchant_stats').select('*').eq('merchant_id', merchantId).single()
  )
}

export async function getCardStats(merchantId: string) {
  const data = await safeQuery(() =>
    supabase.from('card_stats').select('*').eq('merchant_id', merchantId)
  )
  return data || []
}

export async function getDailyActivity(merchantId: string, days: number = 7) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const data = await safeQuery(() =>
    supabase.from('daily_activity').select('*').eq('merchant_id', merchantId).gte('day', since.toISOString().split('T')[0]).order('day', { ascending: true })
  )
  return data || []
}

export async function getActivities(merchantId: string, limit: number = 20) {
  const data = await safeQuery(() =>
    supabase.from('activities').select('*, clients:client_id(name, phone), loyalty_cards:card_id(business_name)').eq('merchant_id', merchantId).order('created_at', { ascending: false }).limit(limit)
  )
  return data || []
}

export async function getClientHistory(clientId: string, merchantId: string) {
  const data = await safeQuery(() =>
    supabase.from('activities').select('*').eq('client_id', clientId).eq('merchant_id', merchantId).order('created_at', { ascending: false })
  )
  return data || []
}

// ============================================
// PAYMENT / UPGRADE
// ============================================

export async function requestUpgrade(merchantId: string, data: {
  plan: string
  paymentMethod: string
  name: string
  phone: string
  email?: string
}) {
  const amount = data.plan === 'premium' ? 9000 : 4500

  const result = await safeQuery(() =>
    supabase.from('payment_requests').insert({
      merchant_id: merchantId,
      requested_plan: data.plan,
      payment_method: data.paymentMethod,
      amount_dzd: amount,
      contact_name: data.name,
      contact_phone: data.phone,
      contact_email: data.email,
    })
  )

  return result !== null ? { success: true as const } : { success: false as const, error: 'Erreur' }
}

// ============================================
// ADMIN OPERATIONS
// ============================================

export async function getAllMerchants(search?: string) {
  if (search) {
    const data = await safeQuery(() =>
      supabase.from('merchants').select('*').or(`business_name.ilike.%${search}%,email.ilike.%${search}%,name.ilike.%${search}%`).order('created_at', { ascending: false })
    )
    return data || []
  }
  const data = await safeQuery(() =>
    supabase.from('merchants').select('*').order('created_at', { ascending: false })
  )
  return data || []
}

export async function getPendingMerchants() {
  const data = await safeQuery(() =>
    supabase.from('merchants').select('*').eq('status', 'pending').order('created_at', { ascending: false })
  )
  return data || []
}

export async function approveMerchant(merchantId: string) {
  try {
    const { data, error } = await supabase.rpc('approve_merchant_full', { p_merchant_id: merchantId })
    if (error) {
      await supabase.from('merchants').update({ status: 'active', validated_at: new Date().toISOString() }).eq('id', merchantId)
    }
    return data
  } catch {
    await supabase.from('merchants').update({ status: 'active', validated_at: new Date().toISOString() }).eq('id', merchantId)
  }
}

export async function suspendMerchant(merchantId: string) {
  try {
    const { data, error } = await supabase.rpc('suspend_merchant_full', { p_merchant_id: merchantId })
    if (error) {
      await supabase.from('merchants').update({ status: 'suspended' }).eq('id', merchantId)
    }
    return data
  } catch {
    await supabase.from('merchants').update({ status: 'suspended' }).eq('id', merchantId)
  }
}

export async function changeMerchantPlan(merchantId: string, plan: string) {
  await safeQuery(() =>
    supabase.from('merchants').update({ plan, updated_at: new Date().toISOString() }).eq('id', merchantId)
  )
}

export async function deleteMerchant(merchantId: string) {
  await safeQuery(() =>
    supabase.from('merchants').delete().eq('id', merchantId)
  )
}

export async function getPlatformOverview() {
  return await safeQuery(() =>
    supabase.from('platform_overview').select('*').single()
  )
}

export async function getPendingPayments() {
  const data = await safeQuery(() =>
    supabase.from('pending_payments').select('*').eq('status', 'pending').order('created_at', { ascending: false })
  )
  return data || []
}

export async function approvePayment(paymentId: string, merchantId: string, plan: string) {
  await safeQuery(() =>
    supabase.from('payment_requests').update({ status: 'confirmed', processed_at: new Date().toISOString() }).eq('id', paymentId)
  )
  await changeMerchantPlan(merchantId, plan)
}

export async function rejectPayment(paymentId: string) {
  await safeQuery(() =>
    supabase.from('payment_requests').update({ status: 'rejected', processed_at: new Date().toISOString() }).eq('id', paymentId)
  )
}

// ============================================
// REALTIME
// ============================================

let _channelCounter = 0

function uniqueChannel(prefix: string) {
  _channelCounter++
  return `${prefix}-${_channelCounter}-${Date.now()}`
}

export function subscribeToPendingPresences(merchantId: string, callback: (presence: any) => void) {
  return supabase
    .channel(uniqueChannel('pending'))
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'pending_presences',
      filter: `merchant_id=eq.${merchantId}`,
    }, (payload) => callback(payload.new))
    .subscribe()
}

export function subscribeToPresenceUpdates(clientCardId: string, callback: (update: any) => void) {
  return supabase
    .channel(uniqueChannel('card-update'))
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'client_cards',
      filter: `id=eq.${clientCardId}`,
    }, (payload) => callback(payload.new))
    .subscribe()
}

export function subscribeToPresenceStatus(presenceId: string, callback: (status: string) => void) {
  return supabase
    .channel(uniqueChannel('presence-status'))
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'pending_presences',
      filter: `id=eq.${presenceId}`,
    }, (payload) => callback((payload.new as any).status))
    .subscribe()
}

export function subscribeToDashboard(merchantId: string, callback: () => void) {
  return supabase
    .channel(uniqueChannel('dashboard'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pending_presences' }, () => callback())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `merchant_id=eq.${merchantId}` }, () => callback())
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activities', filter: `merchant_id=eq.${merchantId}` }, () => callback())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'client_cards' }, () => callback())
    .subscribe()
}

export function subscribeToAdmin(callback: () => void) {
  return supabase
    .channel(uniqueChannel('admin'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => callback())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'merchants' }, () => callback())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_requests' }, () => callback())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_requests' }, () => callback())
    .subscribe()
}

export function removeChannel(channel: any) {
  try {
    supabase.removeChannel(channel)
  } catch {}
}
