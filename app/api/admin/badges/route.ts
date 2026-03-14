import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET() {
  try {
    const supabase = getAdmin()
    const [
      { count: pending },
      { count: payments },
      { count: messages },
    ] = await Promise.all([
      supabase.from('merchants').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('payment_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('messages').select('id', { count: 'exact', head: true }).eq('status', 'unread'),
    ])
    return NextResponse.json({ pending: pending || 0, payments: payments || 0, messages: messages || 0 })
  } catch (e: any) {
    return NextResponse.json({ pending: 0, payments: 0, messages: 0 })
  }
}
