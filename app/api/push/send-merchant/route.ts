// app/api/push/send-merchant/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:admin@fidali.dz',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  try {
    const { merchantId, presenceId, clientName, cardName } = await req.json()

    if (!merchantId || !presenceId || !clientName) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    const supabase = getAdmin()

    // Récupérer toutes les subscriptions du commerçant
    const { data: subs, error } = await supabase
      .from('merchant_push_subscriptions')
      .select('*')
      .eq('merchant_id', merchantId)

    if (error || !subs?.length) {
      // Pas de subscriptions enregistrées — silencieux, pas une erreur
      return NextResponse.json({ success: true, sent: 0 })
    }

    const payload = JSON.stringify({
      title: `🔔 Nouvelle visite — ${cardName || 'Carte fidélité'}`,
      body: `${clientName} demande une validation`,
      url: '/dashboard',
      presenceId,
    })

    // Envoyer à tous les appareils du commerçant
    const results = await Promise.allSettled(
      subs.map(sub =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
      )
    )

    // Supprimer les subscriptions expirées (code 410 = endpoint mort)
    const expiredEndpoints = results
      .map((r, i) => r.status === 'rejected' && (r.reason as any)?.statusCode === 410 ? subs[i].endpoint : null)
      .filter(Boolean)

    if (expiredEndpoints.length > 0) {
      await supabase
        .from('merchant_push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints)
    }

    const sent = results.filter(r => r.status === 'fulfilled').length
    return NextResponse.json({ success: true, sent })

  } catch (e: any) {
    console.error('[push/send-merchant]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
