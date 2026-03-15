// app/api/push/subscribe-merchant/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  try {
    const { subscription, merchantId } = await req.json()

    if (!subscription?.endpoint || !merchantId) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    const supabase = getAdmin()

    const { error } = await supabase
      .from('merchant_push_subscriptions')
      .upsert({
        merchant_id: merchantId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys?.p256dh,
        auth: subscription.keys?.auth,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'endpoint' })

    if (error) {
      console.error('[push/subscribe-merchant]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('[push/subscribe-merchant]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
