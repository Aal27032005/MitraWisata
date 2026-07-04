'use client'

import { useActionState, useState } from 'react'
import { createBookingAction } from '@/app/booking/actions'
import Link from 'next/link'
import { Compass, Calendar, Users, DollarSign, ArrowLeft, ShieldAlert, MapPin, Ticket, X, Images, MessageSquare, ChevronLeft, ChevronRight, BadgeCheck, CheckCircle2, UserRound } from 'lucide-react'

interface Wisata {
  id: string
  nama_wisata: string
  deskripsi: string
  harga_tiket: number
  kuota_harian: number
  foto_url: string | null
  foto_urls?: string[] | null
  lokasi?: string | null
  alamat?: string | null
}

interface Guide {
  id: string
  tarif_per_hari: number
  keahlian: string
  users: {
    nama_lengkap: string
  }
}

interface Props {
  wisata: Wisata
  guides: Guide[]
}

export default function BookingFormClient({ wisata, guides }: Props) {
  // Action state React 19
  const [state, formAction, isPending] = useActionState(createBookingAction, null)

  // Local state for calculations
  const [jumlahTiket, setJumlahTiket] = useState(1)
  const [selectedGuideId, setSelectedGuideId] = useState<string>('none')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Calculate live total price
  const selectedGuide = guides.find((g) => g.id === selectedGuideId)
  const guideTarif = selectedGuide ? selectedGuide.tarif_per_hari : 0
  const totalHarga = (jumlahTiket * wisata.harga_tiket) + guideTarif
  const gallerySources = Array.isArray(wisata.foto_urls) ? wisata.foto_urls : []
  const gallery = Array.from(new Set([...gallerySources, wisata.foto_url].filter(Boolean))) as string[]
  const previewGallery = gallery.length > 0 ? gallery.slice(0, 5) : []
  const lokasi = wisata.lokasi || wisata.alamat || 'Lokasi belum ditambahkan oleh pengelola'
  const activeLightboxPhoto = lightboxIndex !== null ? gallery[lightboxIndex] : null

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const showPreviousPhoto = () => {
    setLightboxIndex((current) => current === null ? null : (current - 1 + gallery.length) % gallery.length)
  }
  const showNextPhoto = () => {
    setLightboxIndex((current) => current === null ? null : (current + 1) % gallery.length)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 dark:bg-slate-950 dark:text-slate-100">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative space-y-8 py-8">
        <section className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <Link href="/wisata" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:text-white">
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Katalog</span>
            </Link>
            <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Reservasi Tiket
            </span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">
                <BadgeCheck className="w-3.5 h-3.5" />
                Destinasi Pilihan MitraWisata
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 leading-tight dark:text-white">{wisata.nama_wisata}</h1>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{lokasi}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-80">
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/50">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Harga Tiket</span>
                <strong className="mt-1 block text-lg text-emerald-400">Rp {wisata.harga_tiket.toLocaleString('id-ID')}</strong>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/50">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Sisa Kuota</span>
                <strong className="mt-1 block text-lg text-slate-950 dark:text-white">{wisata.kuota_harian} pax</strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 rounded-[1.75rem] border border-slate-200 bg-white/70 p-3 shadow-2xl shadow-slate-900/10 backdrop-blur-xl overflow-hidden dark:border-slate-800/80 dark:bg-slate-900/30 dark:shadow-black/30">
            {previewGallery.length > 0 ? (
              previewGallery.map((photoUrl, index) => (
                <button
                  key={`${photoUrl}-${index}`}
                  type="button"
                  onClick={() => openLightbox(index)}
                  className={`${index === 0 ? 'col-span-2 lg:col-span-2 lg:row-span-2 h-72 sm:h-96 lg:h-[30rem]' : 'h-36 sm:h-44 lg:h-[14.625rem]'} group relative overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 cursor-zoom-in dark:bg-slate-950 dark:border-slate-800`}
                >
                  <img src={photoUrl} alt={`${wisata.nama_wisata} foto ${index + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-70 group-hover:opacity-40 transition-opacity" />
                  {index === 0 && (
                    <div className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-slate-950/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                      Foto Utama
                    </div>
                  )}
                  {index === previewGallery.length - 1 && gallery.length > previewGallery.length && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-white font-bold">
                      <Images className="w-7 h-7 mb-2 text-emerald-300" />
                      +{gallery.length - previewGallery.length} Foto
                    </div>
                  )}
                  {index > 0 && !(index === previewGallery.length - 1 && gallery.length > previewGallery.length) && (
                    <div className="absolute inset-x-3 bottom-3 translate-y-2 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 text-[10px] font-bold text-white opacity-0 backdrop-blur-md transition-all group-hover:translate-y-0 group-hover:opacity-100">
                      Lihat Foto {index + 1}
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="col-span-full h-72 md:h-96 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-700">
                <Compass className="w-16 h-16 text-slate-800 animate-spin-slow" />
                <span className="text-xs uppercase font-bold tracking-wider mt-2">Galeri MitraWisata</span>
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: WISATA DETAILS */}
        <section className="lg:col-span-7 space-y-6">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 dark:bg-slate-900/35 dark:border-slate-800/80">
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2 dark:text-white">
                <Compass className="w-5 h-5 text-emerald-400" />
                Tentang Destinasi
              </h2>
              <p className="text-slate-700 text-sm sm:text-base leading-7 whitespace-pre-line dark:text-slate-300">
                {wisata.deskripsi}
              </p>
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 dark:bg-slate-950/50 dark:border-slate-800">
                <MapPin className="w-5 h-5 text-emerald-400 mb-3" />
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Lokasi</span>
                <p className="mt-1 text-sm font-semibold text-slate-950 leading-relaxed dark:text-white">{lokasi}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 dark:bg-slate-950/50 dark:border-slate-800">
                <Users className="w-5 h-5 text-emerald-400 mb-3" />
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Sisa Kuota Harian</span>
                <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{wisata.kuota_harian} pengunjung</p>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 dark:bg-slate-950/50 dark:border-slate-800">
                <Ticket className="w-5 h-5 text-emerald-400 mb-3" />
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Harga Tiket</span>
                <p className="mt-1 text-sm font-semibold text-emerald-400">Rp {wisata.harga_tiket.toLocaleString('id-ID')} / pax</p>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: BOOKING FORM */}
        <section className="lg:col-span-5">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-2xl shadow-slate-900/10 space-y-6 sticky top-24 dark:bg-slate-900/50 dark:border-slate-800/80 dark:shadow-black/30">
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">Form Pemesanan Terpadu</h2>
              <p className="text-slate-500 text-xs mt-1">Booking tiket dan opsi tour guide akan diproses sebagai satu transaksi via WhatsApp.</p>
            </div>

            <form action={formAction} className="space-y-4">
              {state?.error && (
                <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 font-medium animate-pulse">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{state.error}</span>
                </div>
              )}

              {/* Hidden Inputs */}
              <input type="hidden" name="wisata_id" value={wisata.id} />

              {/* Tanggal Kunjungan */}
              <div>
                <label htmlFor="tanggal_kunjungan" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Tanggal Kunjungan
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input
                    id="tanggal_kunjungan"
                    name="tanggal_kunjungan"
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]} // Mencegah pemesanan tanggal lampau
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Jumlah Tiket */}
              <div>
                <label htmlFor="jumlah_tiket" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Jumlah Tiket / Pengunjung
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Users className="w-4 h-4" />
                  </span>
                  <input
                    id="jumlah_tiket"
                    name="jumlah_tiket"
                    type="number"
                    min="1"
                    required
                    value={jumlahTiket}
                    onChange={(e) => setJumlahTiket(Math.max(1, parseInt(e.target.value) || 1))}
                    max={wisata.kuota_harian}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <input type="hidden" name="guide_id" value={selectedGuideId} />

              {/* Pilihan Tour Guide (Opsional) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Sewa Tour Guide (Opsional)
                  </label>
                  <span className="text-[10px] text-emerald-400 font-bold lowercase tracking-normal">Boleh dikosongkan</span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedGuideId('none')}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${selectedGuideId === 'none' ? 'border-emerald-500/60 bg-emerald-500/10 shadow-lg shadow-emerald-500/5' : 'border-slate-200 bg-white/70 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-slate-700'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                        <Compass className="w-5 h-5" />
                      </div>
                      <div>
                          <div className="text-sm font-bold text-slate-950 dark:text-white">Tanpa Tour Guide</div>
                        <p className="text-xs text-slate-500">Lanjutkan hanya dengan tiket masuk destinasi.</p>
                      </div>
                    </div>
                    {selectedGuideId === 'none' && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                  </div>
                </button>

                <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                  {guides.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/50">
                      Belum ada tour guide yang tersedia untuk saat ini.
                    </div>
                  ) : (
                    guides.map((guide) => {
                      const isSelected = selectedGuideId === guide.id
                      const guideName = guide.users?.nama_lengkap || 'Tour Guide MitraWisata'
                      const initial = guideName.charAt(0).toUpperCase()

                      return (
                        <button
                          key={guide.id}
                          type="button"
                          onClick={() => setSelectedGuideId(guide.id)}
                          className={`w-full rounded-2xl border p-4 text-left transition-all ${isSelected ? 'border-emerald-500/60 bg-emerald-500/10 shadow-lg shadow-emerald-500/5' : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-slate-700 dark:hover:bg-slate-950/80'}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white text-base font-black text-emerald-600 shadow-inner dark:border-slate-700 dark:from-slate-800 dark:to-slate-950 dark:text-emerald-300">
                              {initial || <UserRound className="h-5 w-5" />}
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-sm font-bold text-slate-950 dark:text-white">{guideName}</div>
                                  <div className="text-xs font-bold text-emerald-400">Rp {guide.tarif_per_hari.toLocaleString('id-ID')}/hari</div>
                                </div>
                                {isSelected && <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />}
                              </div>
                              <p className="line-clamp-2 text-xs leading-relaxed text-slate-400">
                                {guide.keahlian || 'Pemandu lokal berpengalaman siap mendampingi perjalanan Anda.'}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Rincian Total Harga */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 mt-4 dark:bg-slate-950/40 dark:border-slate-850">
                <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">Kalkulasi Tarif</span>
                
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Tiket Masuk ({jumlahTiket} pax)</span>
                  <span>Rp {(jumlahTiket * wisata.harga_tiket).toLocaleString('id-ID')}</span>
                </div>

                {selectedGuide && (
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Jasa Pemandu ({selectedGuide.users?.nama_lengkap})</span>
                    <span>Rp {guideTarif.toLocaleString('id-ID')}</span>
                  </div>
                )}

                <div className="flex justify-between border-t border-slate-200 pt-3 text-sm font-bold text-slate-950 dark:border-slate-850 dark:text-white">
                  <span>Total Bayar</span>
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <DollarSign className="w-4 h-4" />
                    Rp {totalHarga.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 text-sm font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-lg shadow-emerald-500/10"
              >
                {isPending ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    <span>Booking Sekarang</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
        </div>

      </main>

      {activeLightboxPhoto && (
        <div className="fixed inset-0 z-50 bg-white/90 dark:bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <button type="button" onClick={closeLightbox} className="absolute top-4 right-4 rounded-full border border-slate-200 bg-white/80 p-2 text-slate-800 hover:bg-slate-100 hover:text-slate-950 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:hover:text-white transition-colors cursor-pointer" aria-label="Tutup galeri">
            <X className="w-6 h-6" />
          </button>
          {gallery.length > 1 && (
            <button type="button" onClick={showPreviousPhoto} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white/80 p-3 text-slate-800 hover:bg-slate-100 hover:text-slate-950 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:hover:text-white transition-colors cursor-pointer" aria-label="Foto sebelumnya">
              <ChevronLeft className="w-7 h-7" />
            </button>
          )}
          <img src={activeLightboxPhoto} alt={`${wisata.nama_wisata} tampilan besar`} className="max-h-[82vh] max-w-[92vw] rounded-3xl object-contain shadow-2xl border border-slate-200 dark:border-white/10" />
          {gallery.length > 1 && (
            <button type="button" onClick={showNextPhoto} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white/80 p-3 text-slate-800 hover:bg-slate-100 hover:text-slate-950 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:hover:text-white transition-colors cursor-pointer" aria-label="Foto berikutnya">
              <ChevronRight className="w-7 h-7" />
            </button>
          )}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-bold text-slate-800 backdrop-blur-md dark:border-white/10 dark:bg-white/10 dark:text-white">
            {(lightboxIndex || 0) + 1} / {gallery.length}
          </div>
        </div>
      )}
    </div>
  )
}
