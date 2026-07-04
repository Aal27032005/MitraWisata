import Link from 'next/link'
import { Compass, Landmark, UserCheck, ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react'

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Background ambient glow circles */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[140px] pointer-events-none" />

      {/* Hero Section */}
      <main className="flex-grow z-10">
        <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5" />
            SaaS Wisata Terintegrasi B2B2C
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            Mendigitalisasi Pariwisata Lokal &amp; Tour Guide Independen
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Platform all-in-one bagi pengelola destinasi wisata dan pemandu wisata untuk mengelola pemesanan tiket, ketersediaan jadwal, serta melayani wisatawan secara profesional.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 text-base font-bold px-8 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 group cursor-pointer"
            >
              Mulai Registrasi
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-base font-semibold px-8 py-3.5 rounded-xl transition-colors flex items-center justify-center"
            >
              Masuk ke Dashboard
            </Link>
          </div>
        </section>

        {/* Roles Section */}
        <section className="py-16 border-t border-slate-900 bg-slate-950/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Satu Platform, Tiga Solusi Terintegrasi</h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">Dirancang untuk menghubungkan pengelola destinasi, pemandu wisata profesional, dan wisatawan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1: Mitra Wisata */}
              <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-900 hover:border-emerald-500/20 rounded-2xl p-6 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 mb-5 group-hover:scale-105 transition-transform">
                  <Landmark className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Mitra Destinasi Wisata</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Kelola tiket masuk tempat wisata, kuota pengunjung harian, deskripsi destinasi, serta pantau laporan penjualan secara real-time.
                </p>
              </div>

              {/* Card 2: Mitra Guide */}
              <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-900 hover:border-emerald-500/20 rounded-2xl p-6 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 mb-5 group-hover:scale-105 transition-transform">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Pemandu Wisata / Guide</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Atur tarif jasa harian Anda, kelola spesialisasi/keahlian bahasa &amp; daerah, serta kelola status ketersediaan jadwal pemesanan Anda.
                </p>
              </div>

              {/* Card 3: Wisatawan */}
              <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-900 hover:border-emerald-500/20 rounded-2xl p-6 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 mb-5 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Wisatawan / Customer</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Temukan tempat wisata lokal terbaik, sewa tour guide profesional berlisensi, lakukan pemesanan online, dan konfirmasi instan via WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold text-slate-400">&copy; {new Date().getFullYear()} MitraWisata Platform. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-400">Terms</a>
            <a href="#" className="hover:text-slate-400">Privacy</a>
            <a href="#" className="hover:text-slate-400">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
