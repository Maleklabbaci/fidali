'use client'

import { useState } from 'react'

export default function TestPage() {
  const [result, setResult] = useState('')

  const testConnection = async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    setResult(JSON.stringify({
      url_exists: !!url,
      url_start: url?.substring(0, 30) + '...',
      key_exists: !!key,
      key_length: key?.length || 0,
      key_start: key?.substring(0, 20) + '...',
    }, null, 2))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-4">🔧 Test Supabase</h1>
        <button
          onClick={testConnection}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold mb-4"
        >
          Tester la connexion
        </button>
        {result && (
          <pre className="bg-gray-100 p-4 rounded-xl text-sm overflow-auto">
            {result}
          </pre>
        )}
      </div>
    </div>
  )
}
