'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Compass, Landmark, UserCheck, ArrowRight } from 'lucide-react'

export default function RoleSelectionPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [role, setRole] = useState<'customer' | 'mitra_wisata' | 'mitra_guide'>('customer')
  const [namaLengkap, setNamaLengkap] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Sesi telah berakhir. Silakan login kembali.')
        setIsPending(false)
        return
      }

      // Simpan profil ke public.users
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: user.id,
            email: user.email,
            nama_lengkap: namaLengkap || user.user_metadata?.nama_lengkap || 'Pengguna Baru',
            role: role,
          }
        ])

      if (insertError) {
        throw new Error('Gagal menyimpan profil: ' + insertError.message)
      }

      // Jika mitra_guide, buat data guide default
      if (role === 'mitra_guide') {
        await supabase
          .from('guides')
          .insert([
            {
              mitra_id: user.id,
              tarif_per_hari: 0,
              keahlian: '-',
              is_available: true
            }
          ])
      }

      // Redirect ke dashboard yang sesuai
      router.push(`/dashboard/${role.replace('_', '-')}`)
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-slate-950 text-slate-100 overflow-hidden px-4">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />
      
      <div className="w-full max-w-md z-10">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold tracking-tight animate-fade-in">Selesaikan Profil Anda</h1>
            <p className="text-slate-400 text-xs mt-1">Akun Anda berhasil dibuat, pilih tipe pengguna Anda untuk melanjutkan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg text-center font-medium animate-pulse">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                placeholder="Nama Lengkap Anda"
                className="w-full bg-slate-950/65 border border-slate-800 focus:border-emerald-500 rounded-lg py-2.5 px-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Daftar Sebagai
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                    role === 'customer'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <UserCheck className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold block">Wisatawan / Customer</span>
                    <span className="text-[10px] text-slate-400 leading-snug">Menjelajahi dan memesan tiket wisata serta menyewa tour guide</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('mitra_wisata')}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                    role === 'mitra_wisata'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Landmark className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold block">Mitra Tempat Wisata</span>
                    <span className="text-[10px] text-slate-400 leading-snug">Mengelola tiket masuk destinasi wisata dan memantau kuota harian</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('mitra_guide')}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                    role === 'mitra_guide'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Compass className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold block">Tour Guide Independen</span>
                    <span className="text-[10px] text-slate-400 leading-snug">Menawarkan jasa tour guide, memperbarui tarif, dan keahlian</span>
                  </div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 text-sm font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Simpan & Lanjutkan
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
