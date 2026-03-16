'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function ConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone') || ''

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendCooldown])

  useEffect(() => {
    if (!phone) router.push('/signup')
  }, [phone, router])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)
    setError('')

    if (value && index < 5) {
      inputs.current[index + 1]?.focus()
    }

    if (newCode.every(d => d !== '') && newCode.join('').length === 6) {
      handleVerify(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const newCode = pasted.split('')
      setCode(newCode)
      handleVerify(pasted)
    }
  }

  // ✅ Vérifier le code OTP via SMS (Twilio)
  const handleVerify = async (otp: string) => {
    setLoading(true)
    setError('')
    try {
      const { supabase } = await import('@/database/supabase-client')

      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',  // ✅ SMS au lieu de 'signup'
      })

      if (verifyError) {
        setError(
          verifyError.message.includes('expired') || verifyError.message.includes('invalid')
            ? 'Code expiré ou invalide. Réessayez.'
            : verifyError.message
        )
        setCode(['', '', '', '', '', ''])
        inputs.current[0]?.focus()
        setLoading(false)
        return
      }

      if (data?.user) {
        setSuccess(true)

        // Récupérer le merchant depuis la DB
        const { data: merchantData } = await supabase
          .from('merchants')
          .select('*')
          .eq('auth_user_id', data.user.id)
          .maybeSingle()

        if (merchantData) {
          localStorage.setItem('merchant', JSON.stringify(merchantData))
        }

        setTimeout(() => {
          router.push('/complete-profile')
        }, 1500)
      }
    } catch {
      setError('Erreur de vérification. Réessayez.')
      setCode(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  // ✅ Renvoyer le code SMS
  const handleResend = async () => {
    setResending(true)
    setError('')
    try {
      const { supabase } = await import('@/database/supabase-client')

      const { error: resendError } = await supabase.auth.signInWithOtp({
        phone,
      })

      if (resendError) {
        setError(resendError.message)
      } else {
        setResendCooldown(60)
        setCode(['', '', '', '', '', ''])
        inputs.current[0]?.focus()
      }
    } catch {
      setError('Erreur lors du renvoi')
    } finally {
      setResending(false)
    }
  }

  // Masquer une partie du numéro pour la sécurité
  const maskedPhone = phone
    ? phone.slice(0, 4) + '••••' + phone.slice(-3)
    : ''

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #0f0f14 0%, #1a1025 100%)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .code-input {
          width: 52px; height: 64px;
          text-align: center; font-size: 24px; font-weight: 800;
          background: rgba(255,255,255,0.04);
          border: 2px solid rgba(255,255,255,0.1);
          border-radius: 14px; color: white;
          outline: none; caret-color: #9333ea;
          transition: all 0.2s;
          font-family: 'DM Sans', monospace;
        }
        .code-input:focus { border-color: #9333ea; background: rgba(147,51,234,0.08); }
        .code-input.filled { border-color: rgba(147,51,234,0.4); background: rgba(147,51,234,0.06); }
        .code-input.error { border-color: rgba(239,68,68,0.5); animation: shake 0.3s ease-in-out; }
      `}</style>

      <div style={{ maxWidth: 440, width: '100%', animation: 'fadeIn 0.5s ease-out' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, justifyContent: 'center' }}>
          <img src="/logo.png" alt="Fidali" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'contain' }} />
          <span style={{ color: 'white', fontWeight: 800, fontSize: 20 }}>Fidali</span>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24, padding: '40px 32px', textAlign: 'center',
        }}>
          {/* Icône */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: success ? 'rgba(16,185,129,0.1)' : 'rgba(147,51,234,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: 32,
            animation: success ? 'pulse 0.5s ease-out' : 'none',
            transition: 'all 0.3s',
          }}>
            {success ? '✅' : '📱'}
          </div>

          {/* Titre */}
          <h1 style={{
            color: 'white', fontSize: 24, fontWeight: 800, marginBottom: 8,
            fontFamily: "'DM Serif Display', serif",
          }}>
            {success ? 'Numéro vérifié !' : 'Vérifiez votre numéro'}
          </h1>

          {/* Sous-titre */}
          <p style={{
            color: 'rgba(255,255,255,0.4)', fontSize: 14, lineHeight: 1.6, marginBottom: 32,
          }}>
            {success ? (
              'Redirection vers votre profil...'
            ) : (
              <>
                Un code à 6 chiffres a été envoyé par SMS au
                <br />
                <span style={{ color: 'rgba(147,51,234,0.8)', fontWeight: 600, fontSize: 16 }}>
                  📱 {maskedPhone}
                </span>
              </>
            )}
          </p>

          {/* Champs du code */}
          {!success && (
            <>
              <div style={{
                display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24,
              }} onPaste={handlePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    disabled={loading}
                    className={`code-input ${digit ? 'filled' : ''} ${error ? 'error' : ''}`}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {/* Erreur */}
              {error && (
                <div style={{
                  padding: '10px 16px', borderRadius: 10,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.15)',
                  marginBottom: 20,
                }}>
                  <p style={{ color: '#f87171', fontSize: 13 }}>❌ {error}</p>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{
                    width: 24, height: 24,
                    border: '3px solid rgba(147,51,234,0.2)',
                    borderTopColor: '#9333ea',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    margin: '0 auto',
                  }} />
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 8 }}>
                    Vérification en cours...
                  </p>
                </div>
              )}

              {/* Renvoyer */}
              <div style={{ marginTop: 8 }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginBottom: 8 }}>
                  Vous n{"'"}avez pas reçu le SMS ?
                </p>
                <button
                  onClick={handleResend}
                  disabled={resending || resendCooldown > 0}
                  style={{
                    background: 'none', border: 'none',
                    cursor: (resending || resendCooldown > 0) ? 'not-allowed' : 'pointer',
                    color: (resending || resendCooldown > 0) ? 'rgba(255,255,255,0.2)' : '#9333ea',
                    fontWeight: 600, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                    padding: '8px 16px', borderRadius: 8,
                    transition: 'all 0.2s',
                  }}
                >
                  {resending ? 'Envoi...' : resendCooldown > 0 ? `Renvoyer dans ${resendCooldown}s` : 'Renvoyer le SMS'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Retour */}
        {!success && (
          <button
            onClick={() => router.push('/signup')}
            style={{
              display: 'block', margin: '20px auto 0',
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.25)', fontSize: 12,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ← Changer de numéro
          </button>
        )}

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.1)', fontSize: 11, marginTop: 24 }}>
          © 2025 Fidali 💜
        </p>
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0f14 0%, #1a1025 100%)',
      }}>
        <div style={{
          width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: 'rgba(255,255,255,0.6)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
