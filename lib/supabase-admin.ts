// lib/supabase-admin.ts
// Client Supabase avec SERVICE ROLE KEY — bypass complet du RLS
// À utiliser UNIQUEMENT dans les API routes (/api/admin/*)
// JAMAIS côté client (browser)

import { createClient } from '@supabase/supabase-js'

let _adminClient: ReturnType<typeof createClient> | null = null

export function getServiceClient() {
  if (_adminClient) return _adminClient
  _adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  return _adminClient
}
