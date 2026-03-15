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
    const supabase = getAdmin()

    const [
      { count: totalMerchants },
      { count: activeMerchants },
      { count: pendingMerchants },
      { count: totalClients },
      { count: totalCards },
      { count: pendingPayments },
      { count: unreadMessages },
      { count: totalScansToday },
    ] = await Promise.all([
      supabase.from('merchants').select('id', { count: 'exact', head: true }),
      supabase.from('merchants').select('id', { count: 'exact', head: true }).in('status', ['active', 'approved']),
      supabase.from('merchants').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('clients').select('id', { count: 'exact', head: true }),
      supabase.from('loyalty_cards').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('payment_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('messages').select('id', { count: 'exact', head: true }).eq('status', 'unread'),
      supabase.from('activities').select('id', { count: 'exact', head: true })
        .gte('created_at', new Date().toISOString().split('T')[0]),
    ])

    return NextResponse.json({
      // Badges alertes (pour les pastilles rouges)
      pending:  pendingMerchants  || 0,
      payments: pendingPayments   || 0,
      messages: unreadMessages    || 0,
      // Chiffres globaux (pour la sidebar)
      totalMerchants: totalMerchants  || 0,
      activeMerchants: activeMerchants || 0,
      totalClients:   totalClients    || 0,
      totalCards:     totalCards      || 0,
      scansToday:     totalScansToday || 0,
    })
  } catch (e: any) {
    return NextResponse.json({ pending: 0, payments: 0, messages: 0, totalMerchants: 0, activeMerchants: 0, totalClients: 0, totalCards: 0, scansToday: 0 })
  }
}
