// app/api/push/send/route.ts
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
    const { clientId, title, body, url } = await req.json()

    if (!clientId || !title || !body) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    const supabase = getAdmin()

    // Récupérer toutes les subscriptions du client
    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('client_id', clientId)

    if (error || !subs?.length) {
      return NextResponse.json({ success: true, sent: 0 })
    }

    const payload = JSON.stringify({ title, body, url: url || '/' })

    // Envoyer à tous les appareils du client
    const results = await Promise.allSettled(
      subs.map(sub =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
      )
    )

    // Supprimer les subscriptions expirées (410 Gone)
    const expired = results
      .map((r, i) => r.status === 'rejected' && (r.reason as any)?.statusCode === 410 ? subs[i].endpoint : null)
      .filter(Boolean)

    if (expired.length > 0) {
      await supabase.from('push_subscriptions').delete().in('endpoint', expired)
    }

    const sent = results.filter(r => r.status === 'fulfilled').length
    return NextResponse.json({ success: true, sent })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
