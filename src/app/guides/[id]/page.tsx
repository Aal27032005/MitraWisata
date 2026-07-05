import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Award, CalendarCheck, Compass, DollarSign, Images } from 'lucide-react'
import { parseGaleriUrls } from '@/app/(dashboard)/dashboard/mitra-guide/utils'

export const revalidate = 0

interface PageProps {
  params: Promise<{ id: string }>
}

type GuideUser = {
  nama_lengkap?: string | null
  email?: string | null
}

type GuideDetail = {
  id: string
  tarif_per_hari: number
  keahlian: string
  is_available: boolean
  foto_profil_url?: string | null
  foto_galeri_urls?: unknown
  users?: GuideUser | GuideUser[] | null
}

export default async function GuideDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('guides')
    .select('id, tarif_per_hari, keahlian, is_available, foto_profil_url, foto_galeri_urls, users(nama_lengkap, email)')
    .eq('id', id)
    .single()

  if (!data) notFound()

  const guide = data as GuideDetail
  const guideUser = Array.isArray(guide.users) ? guide.users[0] : guide.users
  const initial = guideUser?.nama_lengkap?.charAt(0) || 'G'
  const galeriUrls = parseGaleriUrls(guide.foto_galeri_urls)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 dark:bg-slate-950 dark:text-slate-100">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── Kolom Kiri: Kartu Profil ── */}
        <section className="lg:col-span-5 bg-white/80 border border-slate-200 rounded-3xl p-8 h-fit space-y-6 dark:bg-slate-900/50 dark:border-slate-800">
          {/* Avatar — tampilkan foto profil jika ada, fallback ke inisial */}
          <div className="w-24 h-24 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-emerald-600 text-4xl font-black shadow-inner overflow-hidden dark:bg-slate-800 dark:border-slate-700 dark:text-emerald-400">
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
          <div>
            <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight dark:text-white">
              {guideUser?.nama_lengkap || 'Tour Guide'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">{guideUser?.email}</p>
          </div>
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase ${guide.is_available ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            <CalendarCheck className="w-4 h-4" />
            {guide.is_available ? 'Tersedia untuk disewa' : 'Sedang tidak tersedia'}
          </span>
        </section>

        {/* ── Kolom Kanan: Info Detail ── */}
        <section className="lg:col-span-7 space-y-6">
          {/* Spesialisasi */}
          <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 space-y-3 dark:bg-slate-900/40 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-950 flex items-center gap-2 uppercase tracking-wider dark:text-white">
              <Award className="w-5 h-5 text-emerald-400" />
              Spesialisasi
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line bg-slate-50 border border-slate-200 rounded-xl p-4 dark:text-slate-300 dark:bg-slate-950/40 dark:border-slate-900">
              {guide.keahlian}
            </p>
          </div>

          {/* Tarif & Cara Sewa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 dark:bg-slate-900/40 dark:border-slate-800">
              <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Tarif Pemanduan</span>
              <div className="text-2xl font-black text-emerald-400 mt-2 flex items-center gap-1">
                <DollarSign className="w-6 h-6" />
                Rp {guide.tarif_per_hari.toLocaleString('id-ID')}
              </div>
              <p className="text-slate-500 text-xs mt-1">per hari layanan</p>
            </div>
            <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 dark:bg-slate-900/40 dark:border-slate-800">
              <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Cara Menyewa</span>
              <p className="text-slate-700 text-sm mt-2 leading-relaxed dark:text-slate-300">
                Pilih destinasi wisata, lalu pilih guide ini pada form pemesanan agar tiket dan jasa guide masuk dalam satu transaksi.
              </p>
            </div>
          </div>

          {/* Galeri Pengalaman — hanya tampil jika ada foto */}
          {galeriUrls.length > 0 && (
            <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 space-y-4 dark:bg-slate-900/40 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-950 flex items-center gap-2 uppercase tracking-wider dark:text-white">
                <Images className="w-5 h-5 text-emerald-400" />
                Galeri Pengalaman
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {galeriUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Galeri pengalaman ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-[10px] leading-relaxed">
                Foto dokumentasi perjalanan dan momen bersama wisatawan dari guide ini.
              </p>
            </div>
          )}

          <Link
            href="/wisata"
            className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-sm font-bold px-5 py-3 rounded-xl transition-colors"
          >
            <Compass className="w-4 h-4" />
            Pilih Wisata dan Sewa Guide
          </Link>
        </section>
      </main>
    </div>
  )
}
