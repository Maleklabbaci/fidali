import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(req: NextRequest) {
  const adminId = req.headers.get('x-admin-id')
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const supabaseAdmin = getAdmin()
    const { data, error } = await supabaseAdmin
      .from('payment_requests')
      .select('*, merchants(business_name, email, name, phone, plan, sub_start, sub_end, sub_billing, sector)')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const adminId = req.headers.get('x-admin-id')
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { action } = body
    const supabase = getAdmin()

    if (action === 'create') {
      const { merchantId, plan, paymentMethod, name, phone, email, note, amount } = body
      if (!merchantId || !plan || !paymentMethod || !name || !phone) {
        return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
      }
      const { data, error } = await supabase
        .from('payment_requests')
        .insert({
          merchant_id: merchantId,
          requested_plan: plan,
          payment_method: paymentMethod,
          amount_dzd: amount ?? (plan === 'premium' ? 5000 : 2500),
          contact_name: name,
          contact_phone: phone,
          contact_email: email || null,
          note: note || null,
          status: 'pending',
        })
        .select()
        .maybeSingle()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, data })
    }

    if (action === 'approve') {
      const { paymentId, merchantId, plan, note: payNote } = body
      const now = new Date()
      const isAnnual = payNote?.includes('[Annuel]') || false
      const subEnd = new Date(now)
      isAnnual ? subEnd.setFullYear(subEnd.getFullYear() + 1) : subEnd.setMonth(subEnd.getMonth() + 1)

      await supabase.from('payment_requests')
        .update({ status: 'confirmed', processed_at: now.toISOString() })
        .eq('id', paymentId)

      await supabase.from('merchants')
        .update({
          plan,
          sub_start: now.toISOString(),
          sub_end: subEnd.toISOString(),
          sub_billing: isAnnual ? 'annual' : 'monthly',
          updated_at: now.toISOString(),
        })
        .eq('id', merchantId)

      const endLabel = subEnd.toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' })
      await supabase.from('notifications').insert({
        merchant_id: merchantId,
        type: 'plan_upgraded',
        title: `✅ Plan ${plan.charAt(0).toUpperCase() + plan.slice(1)} activé !`,
        message: `Votre abonnement ${isAnnual ? 'annuel' : 'mensuel'} est actif jusqu'au ${endLabel}.`,
        created_at: now.toISOString(),
      })
      return NextResponse.json({ success: true })
    }

    if (action === 'reject') {
      const { paymentId } = body
      await supabase.from('payment_requests')
        .update({ status: 'rejected', processed_at: new Date().toISOString() })
        .eq('id', paymentId)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
