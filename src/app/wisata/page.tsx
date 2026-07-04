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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 dark:bg-slate-950 dark:text-slate-100">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[60vh] left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Banner Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center space-y-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 leading-tight dark:text-white">
          Temukan Petualangan Berikutnya
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed dark:text-slate-400">
          Pilih berbagai tempat wisata lokal terbaik dan sewa jasa pemandu wisata berlisensi secara langsung dan praktis.
        </p>
      </section>

      {/* MAIN LAYOUT */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* DESTINASI WISATA SECTION */}
        <section className="space-y-6">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-900 dark:text-white">
            <Landmark className="w-5 h-5 text-emerald-400" />
            <span>Destinasi Wisata Terpopuler ({wisataList?.length || 0})</span>
          </h2>

          {!wisataList || wisataList.length === 0 ? (
            <div className="border border-slate-200 bg-white/70 rounded-2xl p-16 text-center space-y-4 dark:border-slate-900 dark:bg-slate-900/10">
              <Landmark className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
              <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400">Belum Ada Tempat Wisata</h3>
              <p className="text-slate-500 text-xs max-w-xs mx-auto dark:text-slate-600">
                Silakan kembali beberapa saat lagi, pengelola sedang memproses pendaftaran pariwisata baru.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wisataList.map((item) => {
                const coverPhoto = getCoverPhoto(item)

                return (
                <div key={item.id} className="bg-white/80 border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 dark:bg-slate-900/40 dark:border-slate-900 dark:hover:border-slate-800/80">
                  {/* Photo Area */}
                  <div className="h-44 bg-slate-100 relative overflow-hidden flex-shrink-0 dark:bg-slate-950">
                    {coverPhoto ? (
                      <img
                        src={coverPhoto}
                        alt={item.nama_wisata}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 gap-2 dark:text-slate-700 dark:bg-slate-950">
                        <Compass className="w-8 h-8 text-slate-300 dark:text-slate-800" />
                        <span className="text-[9px] uppercase font-bold tracking-wider">MitraWisata</span>
                      </div>
                    )}
                    
                    {/* Floating Heart Icon */}
                    <button className="absolute top-3 right-3 bg-white/80 backdrop-blur-md p-1.5 rounded-full border border-slate-200/80 text-slate-500 hover:text-red-500 transition-colors cursor-pointer dark:bg-slate-950/80 dark:border-slate-800/80 dark:text-slate-400 dark:hover:text-red-400">
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-950 text-base group-hover:text-emerald-600 transition-colors truncate dark:text-white dark:group-hover:text-emerald-400">{item.nama_wisata}</h3>
                      <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed dark:text-slate-400">{item.deskripsi}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between dark:border-slate-850">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold dark:text-slate-500">Harga Tiket</span>
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

        {/* TOUR GUIDE SECTION */}
        <section className="bg-white/80 border border-slate-200 rounded-2xl p-6 sm:p-8 dark:bg-slate-900/40 dark:border-slate-900">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2 dark:text-white">
                <Compass className="w-5 h-5 text-emerald-400" />
                <span>Butuh Tour Guide?</span>
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed dark:text-slate-400">
                Lihat katalog pemandu lengkap untuk membandingkan spesialisasi, tarif, dan status sebelum menyewa bersama tiket wisata.
              </p>
            </div>
            <Link href="/guides" className="w-full lg:w-auto bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold px-5 py-3 rounded-lg transition-colors flex items-center justify-center gap-1 dark:bg-slate-950 dark:hover:bg-slate-900 dark:border-slate-800 dark:text-slate-200">
              Lihat Katalog Guide
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

      </main>
    </div>
  )
}
