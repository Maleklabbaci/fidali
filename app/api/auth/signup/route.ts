import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, name, business, sector, phone, email } = body

  const db = getServiceClient() as any

  const { error } = await db.from('merchants').insert({
    auth_user_id: userId,
    email,
    password_hash: '',
    name,
    business_name: business,
    sector,
    phone,
    plan: 'starter',
    status: 'incomplete',
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
