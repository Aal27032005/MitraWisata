import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Landmark, Compass, ArrowRight, Heart } from 'lucide-react'

export const revalidate = 0 // Dynamic data loading

type WisataCatalogItem = {
  id: string
  nama_wisata: string
  deskripsi: string
  harga_tiket: number
  kuota_harian: number
  foto_url?: string | null
  foto_urls?: string[] | null
}

export default async function WisataCatalogPage() {
  const supabase = await createClient()

  // Fetch data wisata
  const { data: wisataList } = await supabase
    .from('wisata')
    .select('*')
    .order('created_at', { ascending: false })

  const getCoverPhoto = (item: WisataCatalogItem) => item.foto_urls?.[0] || item.foto_url

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[60vh] left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header/Navbar */}
      <header className="z-10 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-400" />
            <span className="text-xl font-bold tracking-tight text-white">MitraWisata</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/guides"
              className="text-slate-400 hover:text-white text-sm font-semibold transition-colors"
            >
              Katalog Guide
            </Link>
            <Link
              href="/dashboard/customer"
              className="text-slate-400 hover:text-white text-sm font-semibold transition-colors"
            >
              Dashboard Saya
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center space-y-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Temukan Petualangan Berikutnya
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Pilih berbagai tempat wisata lokal terbaik dan sewa jasa pemandu wisata berlisensi secara langsung dan praktis.
        </p>
      </section>

      {/* MAIN LAYOUT */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* DESTINASI WISATA SECTION: Left 8-cols */}
        <section className="lg:col-span-8 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-900 pb-3">
            <Landmark className="w-5 h-5 text-emerald-400" />
            <span>Destinasi Wisata Terpopuler ({wisataList?.length || 0})</span>
          </h2>

          {!wisataList || wisataList.length === 0 ? (
            <div className="border border-slate-900 bg-slate-900/10 rounded-2xl p-16 text-center space-y-4">
              <Landmark className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
              <h3 className="text-sm font-bold text-slate-400">Belum Ada Tempat Wisata</h3>
              <p className="text-slate-600 text-xs max-w-xs mx-auto">
                Silakan kembali beberapa saat lagi, pengelola sedang memproses pendaftaran pariwisata baru.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {wisataList.map((item) => {
                const coverPhoto = getCoverPhoto(item)

                return (
                <div key={item.id} className="bg-slate-900/40 border border-slate-900 hover:border-slate-800/80 rounded-2xl overflow-hidden flex flex-col group transition-all duration-300">
                  {/* Photo Area */}
                  <div className="h-44 bg-slate-950 relative overflow-hidden flex-shrink-0">
                    {coverPhoto ? (
                      <img
                        src={coverPhoto}
                        alt={item.nama_wisata}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-slate-950 gap-2">
                        <Compass className="w-8 h-8 text-slate-800" />
                        <span className="text-[9px] uppercase font-bold tracking-wider">MitraWisata</span>
                      </div>
                    )}
                    
                    {/* Floating Heart Icon */}
                    <button className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md p-1.5 rounded-full border border-slate-800/80 text-slate-400 hover:text-red-400 transition-colors cursor-pointer">
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors truncate">{item.nama_wisata}</h3>
                      <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{item.deskripsi}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-850 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Harga Tiket</span>
                        <span className="text-sm font-bold text-emerald-400 flex items-center">
                          Rp {item.harga_tiket.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <Link
                        href={`/wisata/${item.id}`}
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1 group/btn"
                      >
                        <span>Pesan Tiket</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </div>
                )
              })}
            </div>
          )}
        </section>

        {/* TOUR GUIDE SIDEBAR: Right 4-cols */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-4 sticky top-24">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              <span>Butuh Tour Guide?</span>
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              Lihat katalog pemandu lengkap untuk membandingkan spesialisasi, tarif, dan status sebelum menyewa bersama tiket wisata.
            </p>
            <Link href="/guides" className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1">
              Lihat Katalog Guide
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

      </main>
    </div>
  )
}
