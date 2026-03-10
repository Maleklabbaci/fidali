'use client'

import { useState, useEffect } from 'react'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadPayments() }, [])

  const loadPayments = async () => {
    try {
      const { getPendingPayments } = await import('@/database/supabase-client')
      const data = await getPendingPayments()
      setPayments(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-4xl animate-spin">⏳</div></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">💰 Paiements</h2>
        <p className="text-gray-500 text-sm">{payments.length} paiement(s) en attente</p>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-16 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-white mb-2">Tout est à jour</h3>
          <p className="text-gray-500">Aucun paiement en attente de confirmation</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((p: any) => (
            <div key={p.id} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-2xl">
                    💳
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{p.contact_name}</h4>
                    <p className="text-sm text-gray-500">{p.contact_phone} • {p.contact_email || 'N/A'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">
                        {p.requested_plan}
                      </span>
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-bold">
                        {p.payment_method}
                      </span>
                      <span className="text-sm font-bold text-green-400">
                        {p.amount_dzd?.toLocaleString()} DA
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      const { approvePayment } = await import('@/database/supabase-client')
                      await approvePayment(p.id, p.merchant_id, p.requested_plan)
                      loadPayments()
                    }}
                    className="px-5 py-2.5 bg-green-500/20 text-green-400 rounded-xl text-sm font-bold hover:bg-green-500/30 transition"
                  >
                    ✓ Confirmer le paiement
                  </button>
                  <button
                    onClick={async () => {
                      const { rejectPayment } = await import('@/database/supabase-client')
                      await rejectPayment(p.id)
                      loadPayments()
                    }}
                    className="px-5 py-2.5 bg-red-500/20 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500/30 transition"
                  >
                    ✗ Refuser
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
