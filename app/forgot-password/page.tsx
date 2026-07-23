'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold font-mono tracking-wider mb-2">
            <span className="text-emerald-400">Money</span>
            <span className="text-amber-400">Saver</span>
          </Link>
          <h1 className="text-xl font-bold text-slate-100">Reset Password</h1>
          <p className="text-xs text-slate-400 mt-1">Enter your account email to receive a password reset link.</p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3 animate-fade-in">
            <div className="text-3xl">📧</div>
            <h3 className="font-bold text-sm text-emerald-400">Reset Link Sent</h3>
            <p className="text-xs text-slate-300">
              If an account exists for <strong>{email}</strong>, you will receive password reset instructions shortly.
            </p>
            <Link
              href="/login"
              className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl mt-2"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 mt-1 focus:border-emerald-500 focus:outline-none transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition-all shadow-lg shadow-emerald-950 min-h-[46px]"
            >
              Send Reset Link 📧
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
          <Link href="/login" className="font-semibold text-emerald-400 hover:underline">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
