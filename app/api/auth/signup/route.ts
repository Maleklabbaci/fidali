import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, business, sector, phone, email, password } = body

  const db = getServiceClient()

  // Formater le numéro
  const phoneFormatted = phone.startsWith('+')
    ? phone
    : '+213' + phone.replace(/^0/, '').replace(/\s/g, '')

  // 1. Créer le user auth
  const { data: authData, error: authError } = await db.auth.admin.createUser({
    phone: phoneFormatted,
    password,
    phone_confirm: false, // Le SMS sera envoyé
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  if (!authData.user) {
    return NextResponse.json({ error: 'Erreur création compte' }, { status: 500 })
  }

  // 2. Créer le profil merchant (avec service_role, bypass RLS)
  const { error: profileError } = await db.from('merchants').insert({
    auth_user_id: authData.user.id,
    email,
    password_hash: '',
    name,
    business_name: business,
    sector,
    phone: phoneFormatted,
    plan: 'starter',
    status: 'incomplete',
  })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  // 3. Envoyer le SMS OTP
  const { error: otpError } = await db.auth.admin.generateLink({
    type: 'phone_change',
    phone: phoneFormatted,
  })

  // Alternative : envoyer OTP via le client
  // On laisse le client faire le signInWithOtp après

  return NextResponse.json({ success: true, userId: authData.user.id })
}
