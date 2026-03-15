import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { merchantId, plan, paymentMethod, name, phone, email, note, amount } = body

    if (!merchantId || !plan || !paymentMethod || !name || !phone) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!hasUrl || !hasKey) {
      return NextResponse.json({ 
        error: 'Configuration serveur manquante. Contactez l\'admin.' 
      }, { status: 500 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

  }
}
