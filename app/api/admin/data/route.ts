// app/api/admin/data/route.ts
// Route centrale pour toutes les lectures de données admin
import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase-admin'

function checkAuth(req: NextRequest) {
  const adminId = req.headers.get('x-admin-id')
  if (!adminId) return false
  return true
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const type = req.nextUrl.searchParams.get('type')
  const supabase = getServiceClient()

  try {
    switch (type) {

      case 'overview': {
        const [merchants, clients, cards, actsToday, actsWeek, points, rewards] = await Promise.all([
          supabase.from('merchants').select('id, status, plan'),
          supabase.from('clients').select('id', { count: 'exact', head: true }),
          supabase.from('loyalty_cards').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('activities').select('id', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0]),
          supabase.from('activities').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
          supabase.from('client_cards').select('points'),
          supabase.from('client_cards').select('total_rewards_redeemed'),
        ])
        const ms = merchants.data || []
        return NextResponse.json({
          total_merchants: ms.length,
          active_merchants: ms.filter(m => m.status === 'active' || m.status === 'approved').length,
          pending_merchants: ms.filter(m => m.status === 'pending').length,
          starter_count: ms.filter(m => m.plan === 'starter').length,
          pro_count: ms.filter(m => m.plan === 'pro').length,
          premium_count: ms.filter(m => m.plan === 'premium').length,
          total_clients: clients.count || 0,
          total_cards: cards.count || 0,
          activities_today: actsToday.count || 0,
          activities_week: actsWeek.count || 0,
          total_points: (points.data || []).reduce((s: number, c: any) => s + (c.points || 0), 0),
          total_rewards: (rewards.data || []).reduce((s: number, c: any) => s + (c.total_rewards_redeemed || 0), 0),
        })
      }

      case 'merchants': {
        const search = req.nextUrl.searchParams.get('search') || ''
        let query = supabase.from('merchants').select('*').order('created_at', { ascending: false })
        if (search) {
          const safe = search.replace(/[%_\\]/g, '\\$&').substring(0, 100)
          query = query.or(`business_name.ilike.%${safe}%,email.ilike.%${safe}%,name.ilike.%${safe}%`)
        }
        const { data, error } = await query
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ data: data || [] })
      }

      case 'pending': {
        const { data } = await supabase.from('merchants').select('*').eq('status', 'pending').order('created_at', { ascending: false })
        return NextResponse.json({ data: data || [] })
      }

      case 'payments': {
        const { data, error } = await supabase.from('payment_requests')
          .select('*, merchants(business_name, email, name, phone, plan, sub_start, sub_end, sub_billing, sector)')
          .order('created_at', { ascending: false })
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ data: data || [] })
      }

      case 'messages': {
        const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(100)
        return NextResponse.json({ data: data || [] })
      }

      case 'settings': {
        const { data } = await supabase.from('platform_settings').select('*')
        return NextResponse.json({ data: data || [] })
      }

      default:
        return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getServiceClient()
  const body = await req.json()
  const { action } = body

  try {
    switch (action) {

      case 'approve_merchant': {
        const { merchantId } = body
        await supabase.from('merchants').update({ status: 'active', validated_at: new Date().toISOString() }).eq('id', merchantId)
        return NextResponse.json({ success: true })
      }

      case 'suspend_merchant': {
        const { merchantId, days } = body
        const suspendUntil = days > 0 ? new Date(Date.now() + days * 86400000).toISOString() : null
        await supabase.from('merchants').update({ status: 'suspended', suspend_until: suspendUntil, updated_at: new Date().toISOString() }).eq('id', merchantId)
        return NextResponse.json({ success: true })
      }

      case 'reactivate_merchant': {
        const { merchantId } = body
        await supabase.from('merchants').update({ status: 'active', suspend_until: null, updated_at: new Date().toISOString() }).eq('id', merchantId)
        return NextResponse.json({ success: true })
      }

      case 'delete_merchant': {
        const { merchantId } = body
        await supabase.from('merchants').delete().eq('id', merchantId)
        return NextResponse.json({ success: true })
      }

      case 'change_plan': {
        const { merchantId, plan } = body
        await supabase.from('merchants').update({ plan, updated_at: new Date().toISOString() }).eq('id', merchantId)
        return NextResponse.json({ success: true })
      }

      case 'reply_message': {
        const { messageId, reply } = body
        await supabase.from('messages').update({ admin_reply: reply, status: 'replied', replied_at: new Date().toISOString() }).eq('id', messageId)
        return NextResponse.json({ success: true })
      }

      case 'save_settings': {
        const { key, value } = body
        await supabase.from('platform_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
