'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { registerUser, loginWithGoogle, verifyMobileOTP } from '../../lib/auth/session'

export default function RegisterPage() {
  const router = useRouter()
  const [authMethod, setAuthMethod] = useState<'EMAIL' | 'PHONE'>('EMAIL')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(true)

  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return 'Password must be at least 8 characters long.'
    if (!/[A-Z]/.test(pass)) return 'Password must contain at least one uppercase letter.'
    if (!/[a-z]/.test(pass)) return 'Password must contain at least one lowercase letter.'
    if (!/[0-9]/.test(pass)) return 'Password must contain at least one number.'
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return 'Password must contain at least one special character.'
    return ''
  }

  const handleEmailRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all required fields.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    const passError = validatePassword(password)
    if (passError) {
      setErrorMsg(passError)
      return
    }

    if (!acceptTerms) {
      setErrorMsg('You must accept the Terms and Conditions to proceed.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      const res = registerUser({ firstName, lastName, email, password })
      setLoading(false)
      if (res.success) {
        router.push('/dashboard')
      } else {
        setErrorMsg(res.error || 'Registration failed')
      }
    }, 500)
  }

  const handleGoogleRegister = () => {
    setLoading(true)
    setTimeout(() => {
      loginWithGoogle()
      setLoading(false)
      router.push('/dashboard')
    }, 600)
  }

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.')
      return
    }
    setOtpSent(true)
  }

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault()
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

  return (
    <div className="min-h-screen bg-[#0E1117] text-[#E6EDF3] flex flex-col justify-center items-center p-4 relative overflow-hidden py-12">
      {/* Subtle radial background tint */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1A4731_0%,_transparent_60%)] opacity-10 pointer-events-none" />

      <div className="w-full max-w-lg bg-[#161B22] border border-[#30363D] rounded-xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.6)] relative z-10">
        
        {/* Brand */}
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold font-display tracking-tight mb-3">
            <span className="text-[#2DA44E]">Money</span>
            <span className="text-[#E3B341]">Saver</span>
          </Link>
          <h1 className="text-lg font-semibold text-[#E6EDF3]">Create your account</h1>
          <p className="text-xs text-[#7D8590] mt-1">Free forever · No credit card required</p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-lg bg-[#DA3633]/10 border border-[#DA3633]/30 text-xs text-[#DA3633] font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* Google Sign Up */}
        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={loading}
          className="w-full mb-5 py-2.5 px-4 rounded-lg bg-white hover:bg-[#F3F4F6] font-semibold text-[#111827] transition-all flex items-center justify-center gap-3 text-sm shadow-sm min-h-[44px] border border-[#E5E7EB]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Sign up with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-[#30363D] w-full" />
          <span className="bg-[#161B22] px-3 text-[11px] font-medium text-[#484F58] uppercase tracking-wider">or</span>
        </div>

        {/* Auth Method Tabs */}
        <div className="flex bg-[#0E1117] p-1 rounded-lg border border-[#30363D] mb-5">
          <button
            type="button"
            onClick={() => { setAuthMethod('EMAIL'); setErrorMsg('') }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
              authMethod === 'EMAIL'
                ? 'bg-[#21262D] text-[#2DA44E] border border-[#30363D] shadow-sm'
                : 'text-[#484F58] hover:text-[#7D8590]'
            }`}
          >
            Email Registration
          </button>
          <button
            type="button"
            onClick={() => { setAuthMethod('PHONE'); setErrorMsg('') }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
              authMethod === 'PHONE'
                ? 'bg-[#21262D] text-[#2DA44E] border border-[#30363D] shadow-sm'
                : 'text-[#484F58] hover:text-[#7D8590]'
            }`}
          >
            Mobile OTP
          </button>
        </div>

        {authMethod === 'EMAIL' && (
          <form onSubmit={handleEmailRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#7D8590] block mb-1.5">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Rohan"
                  className="w-full bg-[#0E1117] border border-[#30363D] rounded-lg p-3 text-sm text-[#E6EDF3] placeholder-[#484F58] focus:border-[#2DA44E] focus:outline-none focus:ring-2 focus:ring-[#2DA44E]/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#7D8590] block mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Sharma"
                  className="w-full bg-[#0E1117] border border-[#30363D] rounded-lg p-3 text-sm text-[#E6EDF3] placeholder-[#484F58] focus:border-[#2DA44E] focus:outline-none focus:ring-2 focus:ring-[#2DA44E]/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[#7D8590] block mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#0E1117] border border-[#30363D] rounded-lg p-3 text-sm text-[#E6EDF3] placeholder-[#484F58] focus:border-[#2DA44E] focus:outline-none focus:ring-2 focus:ring-[#2DA44E]/10 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#7D8590] block mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0E1117] border border-[#30363D] rounded-lg p-3 text-sm text-[#E6EDF3] font-mono placeholder-[#484F58] focus:border-[#2DA44E] focus:outline-none focus:ring-2 focus:ring-[#2DA44E]/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#7D8590] block mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0E1117] border border-[#30363D] rounded-lg p-3 text-sm text-[#E6EDF3] font-mono placeholder-[#484F58] focus:border-[#2DA44E] focus:outline-none focus:ring-2 focus:ring-[#2DA44E]/10 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#7D8590]">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="rounded border-[#30363D] bg-[#0E1117] text-[#238636] focus:ring-[#238636] focus:ring-offset-0"
              />
              <span>I agree to the Terms of Service &amp; Privacy Policy</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#238636] hover:bg-[#2DA44E] font-semibold text-white transition-all shadow-[0_2px_10px_rgba(35,134,54,0.25)] min-h-[44px] text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account…</>
              ) : (
                'Create Account →'
              )}
            </button>
          </form>
        )}

        {authMethod === 'PHONE' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#7D8590] block mb-1.5">Mobile Number</label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-3 bg-[#0E1117] border border-[#30363D] rounded-lg text-xs font-mono font-medium text-[#7D8590]">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      className="w-full bg-[#0E1117] border border-[#30363D] rounded-lg p-3 text-sm text-[#E6EDF3] font-mono placeholder-[#484F58] focus:border-[#2DA44E] focus:outline-none focus:ring-2 focus:ring-[#2DA44E]/10"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-[#238636] hover:bg-[#2DA44E] font-semibold text-white transition-all text-sm min-h-[44px]"
                >
                  Send Verification OTP →
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4 animate-fade-in">
                <div className="p-3 rounded-lg bg-[#1A4731]/30 border border-[#2DA44E]/25 text-xs text-[#2DA44E] text-center">
                  OTP sent to <strong>+91 {phone}</strong>
                  <br />
                  <span className="text-[11px] text-[#7D8590]">Test OTP: <strong className="text-[#E6EDF3]">123456</strong></span>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#7D8590] block mb-1.5">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full bg-[#0E1117] border border-[#30363D] rounded-lg p-3 text-center text-2xl tracking-[0.5em] font-mono font-bold text-[#E3B341] mt-1 focus:border-[#2DA44E] focus:outline-none focus:ring-2 focus:ring-[#2DA44E]/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-[#238636] hover:bg-[#2DA44E] font-semibold text-white transition-all text-sm min-h-[44px] disabled:opacity-50"
                >
                  {loading ? 'Verifying…' : 'Verify & Register →'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-[#21262D] text-center text-xs text-[#7D8590]">
          <span>Already have an account? </span>
          <Link href="/login" className="font-semibold text-[#2DA44E] hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
