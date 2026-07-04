import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, Compass, DollarSign, ShieldCheck } from 'lucide-react'

export const revalidate = 0

type GuideUser = {
  nama_lengkap?: string | null
  email?: string | null
}

type GuideCatalogItem = {
  id: string
  tarif_per_hari: number
  keahlian: string
  is_available: boolean
  created_at: string
  users?: GuideUser | GuideUser[] | null
}

export default async function GuidesCatalogPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('guides')
    .select('id, tarif_per_hari, keahlian, is_available, created_at, users(nama_lengkap, email)')
    .order('is_available', { ascending: false })
    .order('created_at', { ascending: false })
  const guides = (data || []) as GuideCatalogItem[]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <section className="space-y-3">
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Guide Terverifikasi
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">Katalog Tour Guide</h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Bandingkan spesialisasi, tarif, dan ketersediaan pemandu sebelum memilih layanan terbaik untuk perjalanan Anda.
          </p>
        </section>

        {guides.length === 0 ? (
          <div className="border border-slate-900 bg-slate-900/10 rounded-2xl p-16 text-center space-y-3">
            <Compass className="w-10 h-10 text-slate-700 mx-auto" />
            <h2 className="text-sm font-bold text-slate-400">Belum Ada Tour Guide</h2>
            <p className="text-slate-600 text-xs">Katalog pemandu akan tampil di sini setelah mitra guide melengkapi profil.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => {
              const guideUser = Array.isArray(guide.users) ? guide.users[0] : guide.users

              return (
              <Link key={guide.id} href={`/guides/${guide.id}`} className="bg-slate-900/40 border border-slate-900 hover:border-emerald-500/30 rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-lg shrink-0">
                      {guideUser?.nama_lengkap?.charAt(0) || 'G'}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{guideUser?.nama_lengkap || 'Tour Guide'}</h2>
                      <p className="text-slate-500 text-xs truncate">{guideUser?.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full border text-[10px] font-bold uppercase ${guide.is_available ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {guide.is_available ? 'Tersedia' : 'Sibuk'}
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 bg-slate-950/40 border border-slate-900 rounded-xl p-3">{guide.keahlian}</p>
                <div className="flex items-center justify-between border-t border-slate-850 pt-4">
                  <span className="text-emerald-400 text-sm font-bold flex items-center gap-1"><DollarSign className="w-4 h-4" />Rp {guide.tarif_per_hari.toLocaleString('id-ID')}/hari</span>
                  <span className="text-slate-300 text-xs font-bold flex items-center gap-1">Detail <ArrowRight className="w-3.5 h-3.5" /></span>
                </div>
              </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
