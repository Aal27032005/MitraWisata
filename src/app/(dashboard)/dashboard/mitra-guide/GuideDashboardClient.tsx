'use client'

import { FormEvent, useState, useTransition, useEffect } from 'react'
import { updateGuideProfileAction, toggleGuideAvailabilityAction } from './actions'
import { Compass, Award, DollarSign, Check, AlertCircle, RefreshCw, Eye, Sparkles, UserRound, Calendar, Users, CalendarCheck, Camera, ImageIcon, X as XIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GuideProfile {
  id: string
  mitra_id: string
  tarif_per_hari: number
  keahlian: string
  is_available: boolean
  foto_profil_url?: string | null
  foto_galeri_urls?: string[] | null
}

interface UserData {
  nama_lengkap: string
  email: string
}

interface Booking {
  id: string
  tanggal_kunjungan: string
  jumlah_tiket: number
  total_harga: number
  status: string
  created_at: string
  wisata: { nama_wisata: string } | null
  customer: { nama_lengkap: string; email: string } | null
}

interface Props {
  guideProfile: GuideProfile
  userData: UserData
  bookings: Booking[]
  activeTab: string
}

type ActionState = {
  error?: string
  success?: string
  foto_profil_url?: string | null
  foto_galeri_urls?: string[]
} | null

type SavedProfile = {
  nama_lengkap: string
  tarif_per_hari: number
  keahlian: string
  foto_profil_url: string | null
  foto_galeri_urls: string[]
}

export default function GuideDashboardClient({ guideProfile, userData, bookings, activeTab: activeTabProp }: Props) {
  const router = useRouter()

  const initialProfile: SavedProfile = {
    nama_lengkap: userData.nama_lengkap,
    tarif_per_hari: guideProfile.tarif_per_hari,
    keahlian: guideProfile.keahlian,
    foto_profil_url: guideProfile.foto_profil_url ?? null,
    foto_galeri_urls: guideProfile.foto_galeri_urls ?? [],
  }

  // ── TAB STATE ─────────────────────────────────────────────────────────
  // Diinisialisasi dari prop (URL query ?tab=), default 'beranda'
  const [activeTab, setActiveTab] = useState(activeTabProp || 'beranda')

  // Sinkronkan jika prop berubah (navigasi URL)
  useEffect(() => {
    setActiveTab(activeTabProp || 'beranda')
  }, [activeTabProp])

  // ── PROFILE FORM STATE ────────────────────────────────────────────────
  const [namaLengkap, setNamaLengkap] = useState(userData.nama_lengkap)
  const [tarif, setTarif] = useState(guideProfile.tarif_per_hari)
  const [keahlian, setKeahlian] = useState(guideProfile.keahlian)
  const [savedProfile, setSavedProfile] = useState(initialProfile)
  const [isAvailable, setIsAvailable] = useState(guideProfile.is_available)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [state, setState] = useState<ActionState>(null)
  const [isPendingToggle, startToggleTransition] = useTransition()

  // ── STATE FOTO PROFIL ─────────────────────────────────────────────────
  // fotoProfil: objek File yang dipilih user (belum di-upload, untuk preview lokal)
  // fotoProfilPreview: object URL untuk preview di UI
  // fotoProfilUrl: URL permanen yang sudah tersimpan di DB (dari guideProfile)
  const [fotoProfil, setFotoProfil] = useState<File | null>(null)
  const [fotoProfilPreview, setFotoProfilPreview] = useState<string | null>(
    guideProfile.foto_profil_url ?? null
  )

  // ── STATE GALERI FOTO ─────────────────────────────────────────────────
  // galeriFiles: array File yang dipilih user untuk preview lokal
  // galeriPreviews: array object URL untuk thumbnail grid
  // activeGaleriUrls: URL galeri tersimpan di DB yang MASIH ingin dipertahankan
  //   (dikurangi saat user klik hapus — berbeda dari savedProfile yang baru update setelah save)
  const [galeriFiles, setGaleriFiles] = useState<File[]>([])
  const [galeriPreviews, setGaleriPreviews] = useState<string[]>([])
  const [activeGaleriUrls, setActiveGaleriUrls] = useState<string[]>(
    guideProfile.foto_galeri_urls ?? []
  )

  // Sinkronkan activeGaleriUrls ketika savedProfile berubil setelah save berhasil
  useEffect(() => {
    setActiveGaleriUrls(savedProfile.foto_galeri_urls)
  }, [savedProfile.foto_galeri_urls])

  const handleStartEdit = () => {
    setState(null)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setNamaLengkap(savedProfile.nama_lengkap)
    setTarif(savedProfile.tarif_per_hari)
    setKeahlian(savedProfile.keahlian)
    // Reset preview foto profil ke URL tersimpan (atau null jika belum ada)
    setFotoProfil(null)
    setFotoProfilPreview(savedProfile.foto_profil_url)
    // Reset galeri ke state semula (hapus pilihan file baru yang belum disimpan)
    setGaleriFiles([])
    setGaleriPreviews([])
    // Kembalikan daftar galeri tersimpan ke kondisi sebelum edit
    setActiveGaleriUrls(savedProfile.foto_galeri_urls)
    setState(null)
    setIsEditing(false)
  }

  // Handler saat user memilih foto profil baru
  const handleFotoProfilChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Revoke object URL sebelumnya agar tidak memory leak
    if (fotoProfilPreview && fotoProfilPreview.startsWith('blob:')) {
      URL.revokeObjectURL(fotoProfilPreview)
    }
    setFotoProfil(file)
    setFotoProfilPreview(URL.createObjectURL(file))
  }

  // Handler saat user memilih file-file galeri baru
  const handleGaleriChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    // Revoke object URL lama
    galeriPreviews.forEach((url) => URL.revokeObjectURL(url))
    const previews = files.map((f) => URL.createObjectURL(f))
    setGaleriFiles(files)
    setGaleriPreviews(previews)
  }

  // Hapus satu item dari pratinjau galeri baru
  const handleRemoveGaleriPreview = (index: number) => {
    URL.revokeObjectURL(galeriPreviews[index])
    setGaleriFiles((prev) => prev.filter((_, i) => i !== index))
    setGaleriPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // Hapus satu foto dari galeri yang sudah tersimpan di DB
  // URL yang dihapus dikirim ke server agar file fisik di Storage juga terhapus
  const handleRemoveSavedGaleri = (index: number) => {
    setActiveGaleriUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isEditing || isSaving) return
    setIsSaving(true)
    setState(null)

    const formData = new FormData()

    // ── Field teks ─────────────────────────────────────────────────────────
    formData.set('nama_lengkap', namaLengkap)
    formData.set('tarif_per_hari', String(tarif))
    formData.set('keahlian', keahlian)
    formData.set('is_available', isAvailable ? 'true' : 'false')

    // ── URL lama sebagai fallback (agar tidak terhapus jika tidak ada file baru) ──
    formData.set('existing_foto_profil_url', savedProfile.foto_profil_url ?? '')
    // Kirim daftar galeri yang MASIH aktif (sudah dikurangi yang dihapus user)
    formData.set('existing_galeri_urls', JSON.stringify(activeGaleriUrls))
    // Kirim URL yang dihapus agar server bisa hapus file fisik dari Storage
    const deletedGaleriUrls = savedProfile.foto_galeri_urls.filter(
      (url) => !activeGaleriUrls.includes(url)
    )
    formData.set('deleted_galeri_urls', JSON.stringify(deletedGaleriUrls))

    // ── File foto profil baru (jika ada) ───────────────────────────────────
    if (fotoProfil) {
      formData.set('foto_profil_file', fotoProfil)
    }

    // ── File-file galeri baru (jika ada) — dikirim satu per satu ──────────
    galeriFiles.forEach((file, index) => {
      formData.set(`galeri_file_${index}`, file)
    })

    try {
      const res = await updateGuideProfileAction(null, formData)
      setState(res)
      if (res?.success) {
        // Gunakan URL yang dikembalikan server (hasil upload) untuk update state lokal
        const newFotoProfilUrl = res.foto_profil_url ?? savedProfile.foto_profil_url
        const newGaleriUrls = res.foto_galeri_urls ?? savedProfile.foto_galeri_urls

        setSavedProfile({
          nama_lengkap: namaLengkap,
          tarif_per_hari: tarif,
          keahlian,
          foto_profil_url: newFotoProfilUrl,
          foto_galeri_urls: newGaleriUrls,
        })

        // Update preview foto profil ke URL permanen dari Storage
        if (newFotoProfilUrl && newFotoProfilUrl !== fotoProfilPreview) {
          // Revoke blob URL lama agar tidak memory leak
          if (fotoProfilPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(fotoProfilPreview)
          }
          setFotoProfilPreview(newFotoProfilUrl)
        }

        // Bersihkan state file sementara
        setFotoProfil(null)
        galeriPreviews.forEach((url) => {
          if (url.startsWith('blob:')) URL.revokeObjectURL(url)
        })
        setGaleriFiles([])
        setGaleriPreviews([])
        setIsEditing(false)
        router.refresh()
      }
    } catch {
      setState({ error: 'Terjadi kesalahan tak terduga. Silakan coba lagi.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle = async () => {
    startToggleTransition(async () => {
      const res = await toggleGuideAvailabilityAction(isAvailable)
      if (res.success) {
        setIsAvailable(!isAvailable)
      } else if (res.error) {
        alert(res.error)
      }
    })
  }

  // ── STATISTIK BOOKING ────────────────────────────────────────────────
  const totalBookings = bookings.length
  const successBookings = bookings.filter(b => b.status === 'success')
  const totalRevenue = successBookings.reduce((sum, b) => sum + (b.total_harga || 0), 0)

  return (
    <div className="space-y-6">
      {/* ── Header — judul berubah sesuai tab aktif ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-2 dark:text-white">
          <Compass className="w-7 h-7 text-emerald-400" />
          <span>
            {activeTab === 'edit-profil'
              ? 'Edit Profil & Tarif Guide'
              : activeTab === 'jadwal'
              ? 'Jadwal & Riwayat Bookingan'
              : 'Pengaturan Layanan Tour Guide'}
          </span>
        </h1>
        <p className="text-slate-600 text-sm mt-1 dark:text-slate-400">
          {activeTab === 'edit-profil'
            ? 'Ubah informasi keahlian, bahasa, nama lengkap, dan tarif jasa layanan harian Anda.'
            : activeTab === 'jadwal'
            ? 'Lihat dan kelola pesanan pemanduan masuk serta status aktivitas tur pemandu.'
            : 'Kelola profil publik, ubah tarif pemanduan, dan atur jadwal ketersediaan Anda.'}
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════════
          TAB: JADWAL BOOKINGAN
      ════════════════════════════════════════════════════════════ */}
      {activeTab === 'jadwal' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="border border-slate-200 bg-white/80 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 dark:border-slate-800 dark:bg-slate-900/20">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-900 dark:text-slate-600 dark:border-slate-800">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Belum Ada Jadwal Bookingan</h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
                Saat ini belum ada wisatawan yang membooking jasa pemandu Anda. Profil Anda tetap aktif agar wisatawan dapat memilih Anda saat memesan tiket wisata!
              </p>
            </div>
          ) : (
            <div className="bg-white/80 border border-slate-200 rounded-2xl overflow-hidden shadow-xl dark:bg-slate-900/30 dark:border-slate-800/80">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                      <th className="py-3.5 px-5">Nama Wisatawan</th>
                      <th className="py-3.5 px-5">Destinasi</th>
                      <th className="py-3.5 px-5">Tanggal Kunjungan</th>
                      <th className="py-3.5 px-5 text-center">Jumlah Tiket</th>
                      <th className="py-3.5 px-5 text-center">Durasi</th>
                      <th className="py-3.5 px-5">Tarif Jasa Guide</th>
                      <th className="py-3.5 px-5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {bookings.map((booking) => {
                      const customer = Array.isArray(booking.customer) ? booking.customer[0] : booking.customer
                      const customerName = customer?.nama_lengkap || 'Wisatawan'
                      const customerEmail = customer?.email || ''
                      const isSuccess = booking.status === 'success'
                      const isPast = new Date(booking.tanggal_kunjungan) < new Date()
                      let displayStatus = booking.status
                      if (isSuccess) {
                        displayStatus = isPast ? 'selesai' : 'diterima'
                      } else if (booking.status === 'pending') {
                        displayStatus = 'menunggu'
                      } else if (booking.status === 'cancelled') {
                        displayStatus = 'dibatalkan'
                      }
                      return (
                        <tr key={booking.id} className="hover:bg-slate-50 text-slate-700 transition-colors dark:hover:bg-slate-900/20 dark:text-slate-300">
                          <td className="py-4 px-5">
                            <div className="font-bold text-slate-950 dark:text-white">{customerName}</div>
                            <div className="text-slate-500 text-xs mt-0.5">{customerEmail}</div>
                          </td>
                          <td className="py-4 px-5 font-semibold dark:text-slate-200">{booking.wisata?.nama_wisata || '-'}</td>
                          <td className="py-4 px-5">{new Date(booking.tanggal_kunjungan).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</td>
                          <td className="py-4 px-5 text-center font-semibold">{booking.jumlah_tiket} pax</td>
                          <td className="py-4 px-5 text-center font-semibold">1 Hari</td>
                          <td className="py-4 px-5 font-bold text-emerald-600 dark:text-emerald-400">Rp {booking.total_harga.toLocaleString('id-ID')}</td>
                          <td className="py-4 px-5 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              displayStatus === 'diterima' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' :
                              displayStatus === 'selesai'  ? 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400' :
                              displayStatus === 'dibatalkan' ? 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400' :
                              'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400'
                            }`}>{displayStatus}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB: BERANDA & EDIT PROFIL — layout grid 2 kolom asli
      ════════════════════════════════════════════════════════════ */}
      {activeTab !== 'jadwal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── KOLOM KIRI ─────────────────────────────────────── */}
          <div className="lg:col-span-7">

            {/* ── TAB BERANDA: ringkasan statistik ── */}
            {activeTab === 'beranda' && (
              <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-xl space-y-6 dark:bg-slate-900/40 dark:border-slate-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-slate-950 dark:text-white">Ringkasan Aktivitas Layanan</h2>
                    <p className="text-slate-500 text-xs mt-1">Status ketersediaan publik dan indikator performa pemanduan.</p>
                  </div>
                  <button
                    onClick={handleToggle}
                    disabled={isPendingToggle}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all duration-200 ${
                      isAvailable
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : 'border-red-500/30 bg-red-500/10 text-red-400'
                    }`}
                  >
                    {isPendingToggle ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    )}
                    <span>{isAvailable ? 'Ketersediaan: Aktif' : 'Ketersediaan: Nonaktif'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl dark:bg-slate-950/40 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Total Booking Masuk</span>
                    <div className="text-3xl font-black text-slate-950 mt-2 flex items-baseline gap-1.5 dark:text-white">
                      {totalBookings}
                      <span className="text-xs font-normal text-slate-500">transaksi</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-2 leading-relaxed">Jumlah wisatawan yang memilih jasa pemandu Anda.</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl dark:bg-slate-950/40 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Pendapatan Jasa Guide</span>
                    <div className="text-3xl font-black text-emerald-500 mt-2 flex items-baseline gap-0.5">
                      <span className="text-sm font-semibold">Rp</span>
                      {totalRevenue.toLocaleString('id-ID')}
                    </div>
                    <p className="text-slate-500 text-[11px] mt-2 leading-relaxed">Akumulasi tarif jasa pemanduan dari tugas yang sukses.</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/20 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Status Publik Pemanduan:</span>
                    <span className={`font-bold uppercase tracking-wider ${isAvailable ? 'text-emerald-500' : 'text-red-500'}`}>
                      {isAvailable ? 'Ditemukan Wisatawan' : 'Tersembunyi'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Tarif Layanan Terdaftar:</span>
                    <span className="font-bold text-slate-950 dark:text-white">Rp {tarif.toLocaleString('id-ID')} / hari</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Bahasa &amp; Spesialisasi:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-44">{keahlian || '-'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB EDIT PROFIL: form asli yang sudah ada ── */}
            {activeTab === 'edit-profil' && (
              <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-xl space-y-6 dark:bg-slate-900/40 dark:border-slate-800/80">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-slate-950 dark:text-white">Profil Layanan Guide</h2>
                    <p className="text-slate-500 text-xs mt-1">{isEditing ? 'Mode edit aktif.' : 'Mode preview read-only aktif setelah data tersimpan.'}</p>
                  </div>
                  <button
                    onClick={handleToggle}
                    disabled={isPendingToggle}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all duration-200 ${
                      isAvailable
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : 'border-red-500/30 bg-red-500/10 text-red-400'
                    }`}
                  >
                    {isPendingToggle ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    )}
                    <span>{isAvailable ? 'Ketersediaan: Aktif' : 'Ketersediaan: Nonaktif'}</span>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {state?.error && (
                    <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{state.error}</span>
                    </div>
                  )}
                  {state?.success && (
                    <div role="status" className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-lg flex items-center gap-2 font-medium shadow-lg shadow-emerald-500/5">
                      <Check className="w-4 h-4 flex-shrink-0" />
                      <span>{state.success}</span>
                    </div>
                  )}

                  {/* ── FOTO PROFIL ── */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Foto Profil</label>
                    <div className="flex items-center gap-4">
                      {/* Avatar preview — mencerminkan perubahan secara real-time */}
                      <div className="w-16 h-16 rounded-full border-2 border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                        {fotoProfilPreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={fotoProfilPreview}
                            alt="Preview foto profil"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 text-xl font-bold select-none">
                            {namaLengkap.charAt(0) || 'G'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor="foto_profil_input"
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-semibold transition-colors w-full
                            ${isEditing
                              ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-300'
                              : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed dark:border-slate-800 dark:bg-slate-900/50 opacity-60'
                            }`}
                        >
                          <Camera className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />
                          <span className="truncate">
                            {fotoProfil ? fotoProfil.name : 'Pilih foto profil baru…'}
                          </span>
                        </label>
                        <input
                          id="foto_profil_input"
                          type="file"
                          accept="image/*"
                          disabled={!isEditing}
                          onChange={handleFotoProfilChange}
                          className="sr-only"
                          tabIndex={isEditing ? 0 : -1}
                        />
                        <p className="text-slate-400 text-[10px] mt-1.5 leading-relaxed">
                          Format: JPG, PNG, WebP. Preview langsung ditampilkan di sini dan kartu pratinjau kanan.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="nama_lengkap" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Nama Lengkap</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><UserRound className="w-4 h-4" /></span>
                      <input
                        id="nama_lengkap" name="nama_lengkap" type="text" required
                        value={namaLengkap} onChange={(e) => setNamaLengkap(e.target.value)}
                        readOnly={!isEditing} placeholder="Nama lengkap pemandu"
                        className={`w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 ${!isEditing ? 'cursor-default opacity-80' : ''}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="tarif_per_hari" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Tarif Jasa Per Hari (Rp)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-sm">Rp</span>
                      <input
                        id="tarif_per_hari" name="tarif_per_hari" type="number" min="0" required
                        value={tarif} onChange={(e) => setTarif(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        readOnly={!isEditing} placeholder="Contoh: 150000"
                        className={`w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 ${!isEditing ? 'cursor-default opacity-80' : ''}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="keahlian" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Spesialisasi &amp; Keahlian Bahasa</label>
                    <textarea
                      id="keahlian" name="keahlian" rows={5} required
                      value={keahlian} onChange={(e) => setKeahlian(e.target.value)}
                      readOnly={!isEditing}
                      placeholder="Contoh: Menguasai Bahasa Inggris &amp; Jepang. Spesialisasi sejarah pura Bali kuno dan trekking alam."
                      className={`w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none transition-all duration-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 ${!isEditing ? 'cursor-default opacity-80' : ''}`}
                    />
                  </div>

                  {/* ── GALERI PENGALAMAN & TESTIMONI ── */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 mb-3">
                      <ImageIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Galeri Pengalaman &amp; Testimoni
                      </span>
                    </div>
                    <p className="text-slate-500 text-[10px] mb-3 leading-relaxed">
                      Unggah beberapa foto dokumentasi tur atau momen bersama wisatawan. Mendukung pilihan banyak gambar sekaligus.
                    </p>

                    {/* Input file galeri */}
                    <label
                      htmlFor="galeri_input"
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-semibold transition-colors w-full mb-3
                        ${isEditing
                          ? 'border-dashed border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 cursor-pointer dark:text-emerald-400 dark:border-emerald-500/30'
                          : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed dark:border-slate-800 dark:bg-slate-900/50 opacity-60'
                        }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        {galeriFiles.length > 0
                          ? `${galeriFiles.length} foto dipilih`
                          : 'Pilih beberapa foto sekaligus…'}
                      </span>
                    </label>
                    <input
                      id="galeri_input"
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={!isEditing}
                      onChange={handleGaleriChange}
                      className="sr-only"
                      tabIndex={isEditing ? 0 : -1}
                    />

                    {/* Galeri tersimpan di DB — tampil saat mode view maupun edit */}
                    {activeGaleriUrls.length > 0 && (
                      <div className="mb-2">
                        {isEditing && (
                          <p className="text-slate-400 text-[10px] mb-1.5">
                            Foto tersimpan ({activeGaleriUrls.length}) — klik ✕ untuk menghapus:
                          </p>
                        )}
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                          {activeGaleriUrls.map((src, idx) => (
                            <div key={src} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={src} alt={`Galeri ${idx + 1}`} className="w-full h-full object-cover" />
                              {isEditing && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSavedGaleri(idx)}
                                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                  aria-label={`Hapus foto galeri ${idx + 1}`}
                                >
                                  <XIcon className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grid thumbnail pratinjau galeri BARU yang dipilih user */}
                    {galeriPreviews.length > 0 && (
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                        {galeriPreviews.map((src, idx) => (
                          <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={src}
                              alt={`Galeri ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => handleRemoveGaleriPreview(idx)}
                                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                aria-label={`Hapus foto ${idx + 1}`}
                              >
                                <XIcon className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {activeGaleriUrls.length === 0 && galeriPreviews.length === 0 && (
                      <p className="text-slate-400 text-[10px] italic text-center py-2">
                        Belum ada foto galeri tersimpan.
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-end gap-3 dark:border-slate-800">
                    {!isEditing ? (
                      <button type="button" onClick={handleStartEdit}
                        className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-sm font-bold px-6 py-2.5 rounded-lg transition-colors cursor-pointer dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-900 dark:text-slate-200">
                        Edit Profil
                      </button>
                    ) : (
                      <>
                        <button type="button" onClick={handleCancelEdit} disabled={isSaving}
                          className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-bold px-6 py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-900 dark:text-slate-300">
                          Batal
                        </button>
                        <button type="submit" disabled={isSaving}
                          className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 text-sm font-bold px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
                          {isSaving
                            ? <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            : <span>Simpan Perubahan</span>}
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* ── KOLOM KANAN: preview card asli (selalu tampil di beranda & edit-profil) ── */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider dark:text-slate-400">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Pratinjau Profil Wisatawan</span>
            </div>

            {/* Premium Preview Card — TIDAK ADA PERUBAHAN ISI */}
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl overflow-hidden shadow-2xl relative group dark:bg-slate-900/60 dark:border-slate-800/80">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="p-6 pb-4 flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center text-emerald-600 text-xl font-bold flex-shrink-0 shadow-inner dark:border-slate-700 dark:text-emerald-400 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {fotoProfilPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={fotoProfilPreview}
                        alt={`Foto profil ${namaLengkap}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      namaLengkap.charAt(0) || 'G'
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-slate-950 truncate flex items-center gap-1.5 dark:text-white">
                      {namaLengkap || 'Nama Guide'}
                      <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                    </h3>
                    <span className="text-slate-500 text-xs truncate block">{userData.email}</span>
                  </div>
                </div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  isAvailable
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {isAvailable ? 'Tersedia' : 'Sibuk'}
                </span>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 space-y-4 dark:border-slate-800">
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Keahlian &amp; Spesialisasi</span>
                  </div>
                  <p className="text-slate-700 text-xs leading-relaxed italic whitespace-pre-line bg-slate-50 border border-slate-200 p-3 rounded-lg dark:text-slate-300 dark:bg-slate-950/40 dark:border-slate-900">
                    {keahlian || 'Belum menulis spesialisasi...'}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between dark:bg-slate-950/30 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">Tarif Pemanduan</span>
                    <span className="text-lg font-bold text-emerald-400 mt-0.5 flex items-center gap-0.5">
                      <DollarSign className="w-4 h-4" />
                      Rp {tarif.toLocaleString('id-ID')}
                      <span className="text-slate-500 font-normal text-xs">/hari</span>
                    </span>
                  </div>
                  <button type="button" className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-lg cursor-not-allowed">
                    Sewa Guide
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 text-slate-500 text-[9px] px-6 py-2 border-t border-slate-200 text-center leading-relaxed dark:bg-slate-950/60 dark:border-slate-800">
                *Tampilan ini adalah simulasi profil Anda di halaman pencarian wisatawan.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
