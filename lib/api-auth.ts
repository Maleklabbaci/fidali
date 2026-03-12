// lib/api-auth.ts
// Middleware d'authentification pour les routes API REST

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

let _supabaseAdmin: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin
  _supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  return _supabaseAdmin
}

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export interface AuthResult {
  merchantId: string
  keyId: string
}

export async function authenticateApiKey(req: NextRequest): Promise<AuthResult | NextResponse> {
  const authHeader = req.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid Authorization header. Use: Bearer fid_live_...' },
      { status: 401 }
    )
  }

  const rawKey = authHeader.replace('Bearer ', '').trim()

  if (!rawKey.startsWith('fid_live_')) {
    return NextResponse.json(
      { error: 'Invalid API key format' },
      { status: 401 }
    )
  }

  const supabaseAdmin = getSupabaseAdmin()
  const keyHash = await sha256(rawKey)

  const { data: apiKey, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, merchant_id, is_active')
    .eq('key_hash', keyHash)
    .eq('is_active', true)
    .single()

  if (error || !apiKey) {
    return NextResponse.json(
      { error: 'Invalid or revoked API key' },
      { status: 401 }
    )
  }

  // Vérifier que le commerçant est Premium
  const { data: merchant } = await supabaseAdmin
    .from('merchants')
    .select('plan, status')
    .eq('id', apiKey.merchant_id)
    .single()

  if (!merchant || merchant.plan !== 'premium' || merchant.status !== 'active') {
    return NextResponse.json(
      { error: 'API access requires an active Premium plan' },
      { status: 403 }
    )
  }

  // Mettre à jour last_used_at
  await supabaseAdmin
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', apiKey.id)

  return { merchantId: apiKey.merchant_id, keyId: apiKey.id }
}

export function isAuthError(result: AuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse
}

export { getSupabaseAdmin }
