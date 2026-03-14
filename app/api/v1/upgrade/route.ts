import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { merchantId, plan, paymentMethod, name, phone, email, note, amount } = body

    if (!merchantId || !plan || !paymentMethod || !name || !phone) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

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

    if (error) {
      console.error('[v1/upgrade]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    console.error('[v1/upgrade] catch:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
