// app/api/shopify/install/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getInstallUrl } from '@/lib/shopify-client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get('shop');

  // Validation
  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
  }

  // Validate shop domain format
  if (!shop.endsWith('.myshopify.com')) {
    return NextResponse.json({ error: 'Invalid shop domain' }, { status: 400 });
  }

  // Générer URL OAuth et redirect
  const installUrl = getInstallUrl(shop);
  
  return NextResponse.redirect(installUrl);
}
