'use client'

import { useActionState, useState } from 'react'
import { registerAction } from '@/app/auth/actions'
import Link from 'next/link'
import { User, Mail, KeyRound, Compass, Landmark, UserCheck, ShieldAlert, ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null)
  const [role, setRole] = useState<'customer' | 'mitra_wisata' | 'mitra_guide'>('customer')

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 overflow-hidden px-4 py-12">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      {/* Main container */}
      <div className="w-full max-w-lg z-10">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            <Compass className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
            <span>MitraWisata</span>
          </Link>
        </div>

        <div className="bg-white/85 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-8 shadow-2xl dark:bg-slate-900/60 dark:border-slate-800/80">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight font-sans text-slate-950 dark:text-white">Buat Akun Baru</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Daftar sekarang untuk mulai berpetualang atau mendigitalisasi bisnis pariwisata Anda</p>
          </div>

          {state?.success ? (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 mb-2">
                <Compass className="w-8 h-8 animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Registrasi Berhasil!</h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm max-w-sm mx-auto leading-relaxed">
                {state.success}
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                >
                  Masuk Sekarang
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form action={formAction} className="space-y-4">
              {state?.error && (
                <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg text-center font-medium animate-pulse">
                  {state.error}
                </div>
              )}

              {/* Hidden Input for Role */}
              <input type="hidden" name="role" value={role} />

              <div>
                <label htmlFor="nama_lengkap" className="block text-xs font-semibold uppercase tracking-wider text-slate-550 dark:text-slate-400 mb-1.5">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="nama_lengkap"
                    name="nama_lengkap"
                    type="text"
                    required
                    placeholder="Nama Lengkap Anda"
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200 dark:bg-slate-950/65 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-550 dark:text-slate-400 mb-1.5">
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
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-550 dark:text-slate-400 mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Minimal 6 Karakter"
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200 dark:bg-slate-950/65 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Role Selection Cards */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-550 dark:text-slate-400 mb-2">
                  Daftar Sebagai
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Customer Card */}
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center cursor-pointer transition-all duration-200 ${
                      role === 'customer'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/5'
                        : 'border-slate-205 bg-white/50 text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <UserCheck className="w-6 h-6 mb-2" />
                    <span className="text-xs font-bold block">Wisatawan</span>
                    <span className="text-[10px] mt-1 leading-snug">Cari & booking wisata & guide</span>
                  </button>

                  {/* Mitra Wisata Card */}
                  <button
                    type="button"
                    onClick={() => setRole('mitra_wisata')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center cursor-pointer transition-all duration-200 ${
                      role === 'mitra_wisata'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/5'
                        : 'border-slate-205 bg-white/50 text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <Landmark className="w-6 h-6 mb-2" />
                    <span className="text-xs font-bold block">Mitra Wisata</span>
                    <span className="text-[10px] mt-1 leading-snug">Kelola tiket & kuota destinasi</span>
                  </button>

                  {/* Mitra Guide Card */}
                  <button
                    type="button"
                    onClick={() => setRole('mitra_guide')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center cursor-pointer transition-all duration-200 ${
                      role === 'mitra_guide'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/5'
                        : 'border-slate-205 bg-white/50 text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <Compass className="w-6 h-6 mb-2" />
                    <span className="text-xs font-bold block">Tour Guide</span>
                    <span className="text-[10px] mt-1 leading-snug">Jual jasa & atur ketersediaan</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 text-sm font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-emerald-500/10"
              >
                {isPending ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Daftar Sekarang
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {!state?.success && (
            <div className="mt-6 text-center text-sm text-slate-550 border-t border-slate-200/80 pt-5 dark:text-slate-400 dark:border-slate-800/80">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline font-medium">
                Masuk di sini
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
