import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Award, CalendarCheck, Compass, DollarSign } from 'lucide-react'

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
  users?: GuideUser | GuideUser[] | null
}

export default async function GuideDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('guides')
    .select('id, tarif_per_hari, keahlian, is_available, users(nama_lengkap, email)')
    .eq('id', id)
    .single()

  if (!data) notFound()

  const guide = data as GuideDetail
  const guideUser = Array.isArray(guide.users) ? guide.users[0] : guide.users

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      <header className="w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/guides" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Katalog Guide
          </Link>
          <Link href="/wisata" className="text-emerald-400 hover:text-emerald-300 text-sm font-bold">Pesan Wisata</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-5 bg-slate-900/50 border border-slate-800 rounded-3xl p-8 h-fit space-y-6">
          <div className="w-24 h-24 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 text-4xl font-black shadow-inner">
            {guideUser?.nama_lengkap?.charAt(0) || 'G'}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{guideUser?.nama_lengkap || 'Tour Guide'}</h1>
            <p className="text-slate-500 text-sm mt-1">{guideUser?.email}</p>
          </div>
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase ${guide.is_available ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            <CalendarCheck className="w-4 h-4" />
            {guide.is_available ? 'Tersedia untuk disewa' : 'Sedang tidak tersedia'}
          </span>
        </section>

        <section className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2 uppercase tracking-wider"><Award className="w-5 h-5 text-emerald-400" />Spesialisasi</h2>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-950/40 border border-slate-900 rounded-xl p-4">{guide.keahlian}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
              <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Tarif Pemanduan</span>
              <div className="text-2xl font-black text-emerald-400 mt-2 flex items-center gap-1"><DollarSign className="w-6 h-6" />Rp {guide.tarif_per_hari.toLocaleString('id-ID')}</div>
              <p className="text-slate-500 text-xs mt-1">per hari layanan</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
              <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Cara Menyewa</span>
              <p className="text-slate-300 text-sm mt-2 leading-relaxed">Pilih destinasi wisata, lalu pilih guide ini pada form pemesanan agar tiket dan jasa guide masuk dalam satu transaksi.</p>
            </div>
          </div>

          <Link href="/wisata" className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-sm font-bold px-5 py-3 rounded-xl transition-colors">
            <Compass className="w-4 h-4" />
            Pilih Wisata dan Sewa Guide
          </Link>
        </section>
      </main>
    </div>
  )
}
