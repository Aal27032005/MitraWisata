'use client'

import { useActionState } from 'react'
import { loginAction } from '@/app/auth/actions'
import Link from 'next/link'
import { KeyRound, Mail, ArrowRight, Compass } from 'lucide-react'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 overflow-hidden px-4">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md z-10">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            <Compass className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
            <span>MitraWisata</span>
          </Link>
        </div>

        <div className="bg-white/85 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-8 shadow-2xl dark:bg-slate-900/60 dark:border-slate-800/80">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Selamat Datang Kembali</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Masuk ke akun Anda untuk mulai mengelola</p>
          </div>

          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg text-center font-medium animate-pulse">
                {state.error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="nama@email.com"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200 dark:bg-slate-950/65 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200 dark:bg-slate-950/65 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 text-sm font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-emerald-500/10"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Masuk Sekarang
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-550 border-t border-slate-200/80 pt-5 dark:text-slate-400 dark:border-slate-800/80">
            Belum punya akun?{' '}
            <Link href="/register" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline font-medium">
              Daftar di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
