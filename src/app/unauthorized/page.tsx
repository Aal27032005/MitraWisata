'use client'

import Link from 'next/link'
import { ShieldAlert, ArrowLeft, Compass } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-slate-950 text-slate-100 overflow-hidden px-4">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-red-500/5 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-slate-500/5 blur-[100px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md z-10 text-center">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-emerald-400">
            <Compass className="w-8 h-8 text-emerald-400" />
            <span>MitraWisata</span>
          </Link>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 mb-4 animate-bounce">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-red-400">Akses Ditolak!</h1>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            Maaf, Anda tidak memiliki izin untuk mengakses halaman dashboard ini. Rute ini dibatasi khusus berdasarkan peran pengguna Anda.
          </p>

          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <Link
              href="/login"
              className="w-full bg-slate-950 hover:bg-slate-900 active:bg-slate-950 border border-slate-800 text-slate-300 text-sm font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Login / Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
