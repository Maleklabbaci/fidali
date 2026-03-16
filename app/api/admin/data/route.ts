/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase-admin'

function checkAuth(req: NextRequest) {
  return !!req.headers.get('x-admin-id')
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getServiceClient() as any
  const type = req.nextUrl.searchParams.get('type')

  try {
    if (type === 'overview') {
      const [m, clients, cards, today, week, pts, rew] = await Promise.all([
        db.from('merchants').select('id, status, plan'),
        db.from('clients').select('id', { count: 'exact', head: true }),
        db.from('loyalty_cards').select('id', { count: 'exact', head: true }).eq('is_active', true),
        db.from('activities').select('id', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0]),
        db.from('activities').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
        db.from('client_cards').select('points'),
        db.from('client_cards').select('total_rewards_redeemed'),
      ])
      const ms: any[] = m.data || []
      return NextResponse.json({
        total_merchants:   ms.length,
        active_merchants:  ms.filter((x: any) => x.status === 'active' || x.status === 'approved').length,
        pending_merchants: ms.filter((x: any) => x.status === 'pending').length,
        starter_count:     ms.filter((x: any) => x.plan === 'starter').length,
        pro_count:         ms.filter((x: any) => x.plan === 'pro').length,
        premium_count:     ms.filter((x: any) => x.plan === 'premium').length,
        total_clients:     clients.count || 0,
        total_cards:       cards.count   || 0,
        activities_today:  today.count   || 0,
        activities_week:   week.count    || 0,
        total_points:   (pts.data  || []).reduce((s: number, c: any) => s + (c.points || 0), 0),
        total_rewards:  (rew.data  || []).reduce((s: number, c: any) => s + (c.total_rewards_redeemed || 0), 0),
      })
    }

    if (type === 'merchants') {
      const search = req.nextUrl.searchParams.get('search') || ''
      let q = db.from('merchants').select('*').order('created_at', { ascending: false })
      if (search) {
        const safe = search.replace(/[%_\\]/g, '\\$&').substring(0, 100)
        q = q.or(`business_name.ilike.%${safe}%,email.ilike.%${safe}%,name.ilike.%${safe}%`)
      }
      const { data, error } = await q
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ data: data || [] })
    }

    if (type === 'pending') {
      const { data } = await db.from('merchants').select('*').eq('status', 'pending').order('created_at', { ascending: false })
      return NextResponse.json({ data: data || [] })
    }

    if (type === 'payments') {
      const { data, error } = await db.from('payment_requests')
        .select('*, merchants(business_name, email, name, phone, plan, sub_start, sub_end, sub_billing, sector)')
        .order('created_at', { ascending: false })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ data: data || [] })
    }

    if (type === 'messages') {
      const { data } = await db.from('messages').select('*').order('created_at', { ascending: false }).limit(100)
      return NextResponse.json({ data: data || [] })
    }

    if (type === 'settings') {
      const { data } = await db.from('platform_settings').select('*')
      return NextResponse.json({ data: data || [] })
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getServiceClient() as any
  const body = await req.json()
  const { action } = body

  try {
    if (action === 'approve_merchant') {
      await db.from('merchants').update({ status: 'active', validated_at: new Date().toISOString() }).eq('id', body.merchantId)
      return NextResponse.json({ success: true })
    }

    if (action === 'suspend_merchant') {
      const suspendUntil = body.days > 0 ? new Date(Date.now() + body.days * 86400000).toISOString() : null
      await db.from('merchants').update({ status: 'suspended', suspend_until: suspendUntil, updated_at: new Date().toISOString() }).eq('id', body.merchantId)
      return NextResponse.json({ success: true })
    }

    if (action === 'reactivate_merchant') {
      await db.from('merchants').update({ status: 'active', suspend_until: null, updated_at: new Date().toISOString() }).eq('id', body.merchantId)
      return NextResponse.json({ success: true })
    }

    // ✅ SUPPRIMER un marchand
    if (action === 'delete_merchant') {
      const merchantId = body.merchantId
      await db.from('merchant_profiles').delete().eq('merchant_id', merchantId)
      await db.from('admin_requests').delete().eq('merchant_id', merchantId)
      await db.from('messages').delete().eq('merchant_id', merchantId)
      await db.from('client_cards').delete().eq('merchant_id', merchantId)
      await db.from('loyalty_cards').delete().eq('merchant_id', merchantId)
      await db.from('activities').delete().eq('merchant_id', merchantId)
      await db.from('clients').delete().eq('merchant_id', merchantId)
      await db.from('payment_requests').delete().eq('merchant_id', merchantId)
      await db.from('merchants').delete().eq('id', merchantId)
      const { error: authError } = await db.auth.admin.deleteUser(merchantId)
      if (authError) console.error('Auth delete error:', authError)
      return NextResponse.json({ success: true })
    }

    // ✅ REFUSER un marchand (nouveau !)
    if (action === 'reject_merchant') {
      const merchantId = body.merchantId
      await db.from('merchant_profiles').delete().eq('merchant_id', merchantId)
      await db.from('admin_requests').delete().eq('merchant_id', merchantId)
      await db.from('messages').delete().eq('merchant_id', merchantId)
      await db.from('client_cards').delete().eq('merchant_id', merchantId)
      await db.from('loyalty_cards').delete().eq('merchant_id', merchantId)
      await db.from('activities').delete().eq('merchant_id', merchantId)
      await db.from('clients').delete().eq('merchant_id', merchantId)
      await db.from('payment_requests').delete().eq('merchant_id', merchantId)
      await db.from('merchants').delete().eq('id', merchantId)
      const { error: authError } = await db.auth.admin.deleteUser(merchantId)
      if (authError) console.error('Auth delete error:', authError)
      return NextResponse.json({ success: true })
    }

    if (action === 'change_plan') {
      await db.from('merchants').update({ plan: body.plan, updated_at: new Date().toISOString() }).eq('id', body.merchantId)
      return NextResponse.json({ success: true })
    }

    if (action === 'reply_message') {
      await db.from('messages').update({ admin_reply: body.reply, status: 'replied', replied_at: new Date().toISOString() }).eq('id', body.messageId)
      return NextResponse.json({ success: true })
    }

    if (action === 'save_settings') {
      await db.from('platform_settings').upsert({ key: body.key, value: body.value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
