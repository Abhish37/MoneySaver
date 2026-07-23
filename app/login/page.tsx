'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loginUser, loginWithGoogle, verifyMobileOTP } from '../../lib/auth/session'

export default function LoginPage() {
  const router = useRouter()

  // Tabs: 'EMAIL' | 'PHONE'
  const [authMethod, setAuthMethod] = useState<'EMAIL' | 'PHONE'>('EMAIL')

  // Email state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  // Phone OTP state
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  // 1. Email Login Handler
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      const res = loginUser({ email, password, rememberMe })
      setLoading(false)
      if (res.success) {
        router.push('/dashboard')
      } else {
        setErrorMsg(res.error || 'Invalid credentials')
      }
    }, 500)
  }

  // 2. Google OAuth Login Handler
  const handleGoogleLogin = () => {
    setLoading(true)
    setTimeout(() => {
      loginWithGoogle()
      setLoading(false)
      router.push('/dashboard')
    }, 600)
  }

  // 3. Phone OTP Handlers
  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setOtpSent(true)
    }, 600)
  }

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)
    setTimeout(() => {
      const res = verifyMobileOTP(phone, otp || '123456')
      setLoading(false)
      if (res.success) {
        router.push('/dashboard')
      } else {
        setErrorMsg(res.error || 'OTP Verification failed')
      }
    }, 500)
  }

  const handleFillDemo = () => {
    setEmail('user@moneysaver.in')
    setPassword('Password123!')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden py-12">
      {/* Background Decorator */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold font-mono tracking-wider mb-2">
            <span className="text-emerald-400">Money</span>
            <span className="text-amber-400">Saver</span>
          </Link>
          <h1 className="text-xl font-bold text-slate-100">Welcome Back</h1>
          <p className="text-xs text-slate-400 mt-1">Sign in with Google, Mobile OTP, or Email</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 font-semibold text-center animate-fade-in">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* 1. Official Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mb-5 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 font-bold text-slate-900 transition-all flex items-center justify-center gap-3 text-xs shadow-md min-h-[44px]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            OR
          </span>
        </div>

        {/* Auth Method Switcher Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('EMAIL')
              setErrorMsg('')
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              authMethod === 'EMAIL'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ✉️ Email Login
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('PHONE')
              setErrorMsg('')
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              authMethod === 'PHONE'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📱 Mobile OTP Login
          </button>
        </div>

        {/* 2. Email Login Form */}
        {authMethod === 'EMAIL' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 mt-1 focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <Link href="/forgot-password" className="text-xs text-amber-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pr-10 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 text-xs"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition-all shadow-lg shadow-emerald-950 min-h-[46px] flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block animate-spin">⌛</span>
              ) : (
                'Sign In to Dashboard 🚀'
              )}
            </button>
          </form>
        )}

        {/* 3. Mobile Phone OTP Form */}
        {authMethod === 'PHONE' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Mobile Phone Number</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-300">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition-all shadow-lg shadow-emerald-950 min-h-[46px]"
                >
                  {loading ? 'Sending OTP...' : 'Send 6-Digit OTP 📲'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4 animate-fade-in">
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 text-center">
                  📲 OTP sent to <strong>+91 {phone}</strong>
                  <br />
                  <span className="text-[11px] text-slate-400">Use test OTP: <strong>123456</strong></span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center text-xl tracking-widest font-mono font-extrabold text-amber-400 mt-1 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition-all shadow-lg shadow-emerald-950 min-h-[46px]"
                >
                  {loading ? 'Verifying...' : 'Verify OTP & Log In 🎉'}
                </button>

                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full text-xs text-slate-400 hover:underline text-center block"
                >
                  Change phone number
                </button>
              </form>
            )}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
          <span>Don't have an account? </span>
          <Link href="/register" className="font-semibold text-emerald-400 hover:underline">
            Register now
          </Link>
        </div>

        {/* Demo Login Quick Assistant */}
        {authMethod === 'EMAIL' && (
          <div className="mt-5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 mb-1">Need a quick test login?</p>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline"
            >
              ⚡ Auto-Fill Demo Credentials (user@moneysaver.in)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
