import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, Compass, DollarSign, ShieldCheck } from 'lucide-react'

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
  foto_profil_url?: string | null
  users?: GuideUser | GuideUser[] | null
}

export default async function GuidesCatalogPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('guides')
    .select('id, tarif_per_hari, keahlian, is_available, created_at, foto_profil_url, users(nama_lengkap, email)')
    .order('is_available', { ascending: false })
    .order('created_at', { ascending: false })
  const guides = (data || []) as GuideCatalogItem[]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 dark:bg-slate-950 dark:text-slate-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <section className="space-y-3">
          <Link
            href="/wisata"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Jelajah Wisata
          </Link>
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Guide Terverifikasi
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white">Katalog Tour Guide</h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl leading-relaxed dark:text-slate-400">
            Bandingkan spesialisasi, tarif, dan ketersediaan pemandu sebelum memilih layanan terbaik untuk perjalanan Anda.
          </p>
        </section>

        {guides.length === 0 ? (
          <div className="border border-slate-200 bg-white/70 rounded-2xl p-16 text-center space-y-3 dark:border-slate-900 dark:bg-slate-900/10">
            <Compass className="w-10 h-10 text-slate-400 mx-auto dark:text-slate-700" />
            <h2 className="text-sm font-bold text-slate-600 dark:text-slate-400">Belum Ada Tour Guide</h2>
            <p className="text-slate-500 text-xs dark:text-slate-600">Katalog pemandu akan tampil di sini setelah mitra guide melengkapi profil.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => {
              const guideUser = Array.isArray(guide.users) ? guide.users[0] : guide.users
              const initial = guideUser?.nama_lengkap?.charAt(0) || 'G'

              return (
                <Link
                  key={guide.id}
                  href={`/guides/${guide.id}`}
                  className="bg-white/80 border border-slate-200 hover:border-emerald-500/30 rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 group dark:bg-slate-900/40 dark:border-slate-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar — tampilkan foto profil jika ada, fallback ke inisial */}
                      <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-emerald-600 font-bold text-lg shrink-0 overflow-hidden dark:bg-slate-800 dark:border-slate-700 dark:text-emerald-400">
                        {guide.foto_profil_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={guide.foto_profil_url}
                            alt={`Foto profil ${guideUser?.nama_lengkap || 'guide'}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          initial
                        )}
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-bold text-slate-950 truncate group-hover:text-emerald-600 transition-colors dark:text-white dark:group-hover:text-emerald-400">
                          {guideUser?.nama_lengkap || 'Tour Guide'}
                        </h2>
                        <p className="text-slate-500 text-xs truncate">{guideUser?.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full border text-[10px] font-bold uppercase shrink-0 ${guide.is_available ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                      {guide.is_available ? 'Tersedia' : 'Sibuk'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 bg-slate-50 border border-slate-200 rounded-xl p-3 dark:text-slate-400 dark:bg-slate-950/40 dark:border-slate-900">
                    {guide.keahlian}
                  </p>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
                    <span className="text-emerald-400 text-sm font-bold flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      Rp {guide.tarif_per_hari.toLocaleString('id-ID')}/hari
                    </span>
                    <span className="text-slate-700 text-xs font-bold flex items-center gap-1 dark:text-slate-300">
                      Detail <ArrowRight className="w-3.5 h-3.5" />
                    </span>
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
