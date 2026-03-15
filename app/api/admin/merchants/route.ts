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
    const search = req.nextUrl.searchParams.get('search') || ''

    let query = supabase.from('merchants').select('*').order('created_at', { ascending: false })

    if (search) {
      const safe = search.replace(/[%_\\]/g, '\\$&').substring(0, 100)
      query = query.or(`business_name.ilike.%${safe}%,email.ilike.%${safe}%,name.ilike.%${safe}%`)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
