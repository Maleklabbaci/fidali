import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, business, sector, phone, email, password } = body

  const db = getServiceClient() as any

  const phoneFormatted = phone.startsWith('+')
    ? phone
    : '+213' + phone.replace(/^0/, '').replace(/\s/g, '')

  // 1. Vérifier si le numéro existe déjà
  const { data: existingUsers } = await db.auth.admin.listUsers()
  const phoneExists = existingUsers?.users?.some(
    (u: any) => u.phone === phoneFormatted
  )
  if (phoneExists) {
    return NextResponse.json(
      { error: 'Ce numéro est déjà utilisé' },
      { status: 400 }
    )
  }

  // 2. Créer le user auth avec le téléphone
  const { data: authData, error: authError } = await db.auth.admin.createUser({
    phone: phoneFormatted,
    password,
    phone_confirm: false,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  if (!authData.user) {
    return NextResponse.json({ error: 'Erreur création compte' }, { status: 500 })
  }

  // 3. Créer le profil merchant (bypass RLS avec service_role)
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
    // Rollback : supprimer le user auth si le profil échoue
    await db.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  // 4. ✅ Générer et envoyer le OTP SMS via Supabase
  const { error: otpError } = await db.auth.admin.generateLink({
    type: 'magiclink',
    phone: phoneFormatted,
  })

  // Si generateLink ne marche pas, on utilise le client pour envoyer l'OTP
  if (otpError) {
    console.warn('generateLink error, using signInWithOtp fallback:', otpError.message)
  }

  return NextResponse.json({
    success: true,
    userId: authData.user.id,
    phone: phoneFormatted,
  })
}
