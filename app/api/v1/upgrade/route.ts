```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
 
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // ── LOG 1: Voir ce qu'on reçoit ──
    console.log('📥 [v1/upgrade] Request received:', {
      merchantId: body.merchantId,
      plan: body.plan,
      method: body.paymentMethod,
      name: body.name,
      phone: body.phone,
    })
    
    const { merchantId, plan, paymentMethod, name, phone, email, note, amount } = body
 
    if (!merchantId || !plan || !paymentMethod || !name || !phone) {
      console.log('❌ [v1/upgrade] Missing required fields:', {
        merchantId: !!merchantId,
        plan: !!plan,
        paymentMethod: !!paymentMethod,
        name: !!name,
        phone: !!phone,
      })
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }
 
    // ── LOG 2: Vérifier les env vars ──
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('🔑 [v1/upgrade] Environment check:', {
      hasSupabaseUrl: hasUrl,
      hasServiceRoleKey: hasKey,
      urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
      keyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    })
 
    if (!hasUrl || !hasKey) {
      console.error('💥 [v1/upgrade] CRITICAL: Missing environment variables!')
      return NextResponse.json({ 
        error: 'Configuration serveur manquante. Contactez l\'admin.' 
      }, { status: 500 })
    }
 
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
 
    // ── LOG 3: Tentative d'insertion ──
    const insertData = {
      merchant_id: merchantId,
      requested_plan: plan,
      payment_method: paymentMethod,
      amount_dzd: amount ?? (plan === 'premium' ? 5000 : 2500),
      contact_name: name,
      contact_phone: phone,
      contact_email: email || null,
      note: note || null,
      status: 'pending',
    }
    
    console.log('💾 [v1/upgrade] Attempting insert:', insertData)
 
    const { data, error } = await supabase
      .from('payment_requests')
      .insert(insertData)
      .select()
      .maybeSingle()
 
    if (error) {
      console.error('❌ [v1/upgrade] Database error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
 
    // ── LOG 4: Succès ──
    console.log('✅ [v1/upgrade] Payment request created successfully:', {
      id: data?.id,
      merchantId: data?.merchant_id,
      plan: data?.requested_plan,
      status: data?.status,
    })
 
    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    console.error('💥 [v1/upgrade] Unexpected error:', {
      message: e.message,
      stack: e.stack,
      name: e.name,
    })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
