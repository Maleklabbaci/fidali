// app/dashboard/shopify/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ShopifyDashboardContent() {
  const searchParams = useSearchParams();
  const merchantId = searchParams.get('merchant');
  const shop = searchParams.get('shop');

  const [stats, setStats] = useState({
    totalClients: 0,
    totalPoints: 0,
    rewardsUsed: 0,
  });

  useEffect(() => {
    if (merchantId) {
      loadStats();
    }
  }, [merchantId]);

  const loadStats = async () => {
    // TODO: Fetch from API
    setStats({
      totalClients: 0,
      totalPoints: 0,
      rewardsUsed: 0,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🎯 Fidali - Tableau de Bord Shopify
          </h1>
          <p className="text-gray-600 mt-2">
            Boutique: <span className="font-medium">{shop || 'Chargement...'}</span>
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">👥</span>
              <span className="text-sm text-gray-500">Total Clients</span>
            </div>
            <div className="text-3xl font-bold">{stats.totalClients}</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">⭐</span>
              <span className="text-sm text-gray-500">Points Distribués</span>
            </div>
            <div className="text-3xl font-bold">{stats.totalPoints}</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🎁</span>
              <span className="text-sm text-gray-500">Récompenses Utilisées</span>
            </div>
            <div className="text-3xl font-bold">{stats.rewardsUsed}</div>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <h3 className="font-bold text-green-900 mb-1">
                Installation réussie!
              </h3>
              <p className="text-green-700">
                Fidali est maintenant actif sur votre boutique Shopify. 
                Le widget a été installé automatiquement et vos clients 
                gagneront des points à chaque commande.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopifyDashboard() {
  return (
    <Suspense fallback={<div className="p-8">Chargement...</div>}>
      <ShopifyDashboardContent />
    </Suspense>
  );
}
