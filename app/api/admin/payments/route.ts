// app/api/admin/payments/route.ts
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
  try {
    const supabaseAdmin = getAdmin()
    const { data, error } = await supabaseAdmin
      .from('payment_requests')
      .select('*, merchants(business_name, email, name)')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, paymentId, merchantId, plan } = await req.json()
    const supabaseAdmin = getAdmin()

    if (action === 'approve') {
      await supabaseAdmin
        .from('payment_requests')
        .update({ status: 'confirmed', processed_at: new Date().toISOString() })
        .eq('id', paymentId)

      await supabaseAdmin
        .from('merchants')
        .update({ plan, updated_at: new Date().toISOString() })
        .eq('id', merchantId)

      await supabaseAdmin.from('notifications').insert({
        merchant_id: merchantId,
        type: 'plan_upgraded',
        title: 'Plan mis à jour',
        message: `Votre plan a été mis à jour vers ${plan}. Profitez de vos nouvelles fonctionnalités !`,
        created_at: new Date().toISOString(),
      })
    }

    if (action === 'reject') {
      await supabaseAdmin
        .from('payment_requests')
        .update({ status: 'rejected', processed_at: new Date().toISOString() })
        .eq('id', paymentId)
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
