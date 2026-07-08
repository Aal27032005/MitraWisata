'use client'

import { useActionState, useState, useTransition, useEffect } from 'react'
import { createWisataAction, updateWisataAction, deleteWisataAction } from './actions'
import {
  Landmark, Plus, Edit2, Trash2, X, Compass, DollarSign, Users,
  AlertCircle, BarChart3, Ticket, TrendingUp, Calendar, CalendarCheck, Camera, ImageIcon,
  ChevronLeft,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { BookingRow } from './page'
import { convertHeicToJpeg } from '@/lib/heicToJpeg'

interface Wisata {
  id: string
  mitra_id: string
  nama_wisata: string
  deskripsi: string
  harga_tiket: number
  kuota_harian: number
  foto_url: string | null
  foto_urls?: string[] | null
}

interface Props {
  wisataList: Wisata[]
  bookings: BookingRow[]
  activeTab: string
  totalTiketTerjual: number
  totalPendapatan: number
}

export default function WisataDashboardClient({ wisataList, bookings, activeTab: activeTabProp, totalTiketTerjual, totalPendapatan }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(activeTabProp || 'beranda')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedWisata, setSelectedWisata] = useState<Wisata | null>(null)
  const [isPendingDelete, startDeleteTransition] = useTransition()

  // State foto untuk modal Tambah
  const [createFotoFile, setCreateFotoFile] = useState<File | null>(null)
  const [createFotoPreview, setCreateFotoPreview] = useState<string | null>(null)

  // State foto untuk modal Edit
  const [editFotoFile, setEditFotoFile] = useState<File | null>(null)
  const [editFotoPreview, setEditFotoPreview] = useState<string | null>(null)

  // State galeri untuk modal Tambah
  const [createGaleriFiles, setCreateGaleriFiles] = useState<File[]>([])
  const [createGaleriPreviews, setCreateGaleriPreviews] = useState<string[]>([])

  // State galeri untuk modal Edit
  const [editGaleriFiles, setEditGaleriFiles] = useState<File[]>([])
  const [editGaleriPreviews, setEditGaleriPreviews] = useState<string[]>([])
  // URL galeri tersimpan yang masih aktif di modal Edit (dikurangi saat user klik hapus)
  const [editActiveGaleriUrls, setEditActiveGaleriUrls] = useState<string[]>([])

  // Sinkronkan tab dari URL (saat navigasi Navbar)
  useEffect(() => {
    setActiveTab(activeTabProp || 'beranda')
  }, [activeTabProp])

  // React 19 Action States
  const [createState, createFormAction, isCreatePending] = useActionState(
    async (state: any, formData: FormData) => {
      // Upload foto utama ke FormData (aman, satu file saja)
      if (createFotoFile) {
        formData.set('destinasi_file', createFotoFile)
      }

      // Upload setiap file galeri satu per satu via API route terpisah,
      // lalu kirimkan URL hasilnya sebagai string ke Server Action.
      // Ini menghindari "Unexpected end of form" akibat payload multipart besar.
      const uploadedGaleriUrls: string[] = []
      for (const file of createGaleriFiles) {
        if (!file || file.size === 0) continue
        try {
          const fd = new FormData()
          fd.append('file', file)
          const res = await fetch('/api/upload-galeri', { method: 'POST', body: fd })
          if (res.ok) {
            const json = await res.json()
            if (json.url) uploadedGaleriUrls.push(json.url as string)
          }
        } catch (e) {
          console.warn('[createFormAction] Gagal upload satu file galeri, dilanjutkan:', e)
        }
      }
      formData.set('pre_uploaded_galeri_urls', JSON.stringify(uploadedGaleriUrls))

      const res = await createWisataAction(state, formData)
      if (res.success) {
        setIsCreateOpen(false)
        setCreateFotoFile(null)
        if (createFotoPreview?.startsWith('blob:')) URL.revokeObjectURL(createFotoPreview)
        setCreateFotoPreview(null)
        createGaleriPreviews.forEach((u) => { if (u.startsWith('blob:')) URL.revokeObjectURL(u) })
        setCreateGaleriFiles([])
        setCreateGaleriPreviews([])
      }
      return res
    },
    null
  )

  const [editState, editFormAction, isEditPending] = useActionState(
    async (state: any, formData: FormData) => {
      // Upload foto utama ke FormData (aman, satu file saja)
      if (editFotoFile) {
        formData.set('destinasi_file', editFotoFile)
      }

      // Kirim URL galeri yang masih aktif (sudah dikurangi yang dihapus user)
      formData.set('existing_galeri_urls', JSON.stringify(editActiveGaleriUrls))
      // Kirim URL yang dihapus agar server bisa hapus file fisik dari Storage
      const originalGaleri = selectedWisata?.foto_urls ?? []
      const deletedGaleriUrls = originalGaleri.filter((url) => !editActiveGaleriUrls.includes(url))
      formData.set('deleted_galeri_urls', JSON.stringify(deletedGaleriUrls))

      // Upload file galeri baru satu per satu via API route terpisah
      const uploadedGaleriUrls: string[] = []
      for (const file of editGaleriFiles) {
        if (!file || file.size === 0) continue
        try {
          const fd = new FormData()
          fd.append('file', file)
          const res = await fetch('/api/upload-galeri', { method: 'POST', body: fd })
          if (res.ok) {
            const json = await res.json()
            if (json.url) uploadedGaleriUrls.push(json.url as string)
          }
        } catch (e) {
          console.warn('[editFormAction] Gagal upload satu file galeri, dilanjutkan:', e)
        }
      }
      formData.set('pre_uploaded_galeri_urls', JSON.stringify(uploadedGaleriUrls))

      const res = await updateWisataAction(state, formData)
      if (res.success) {
        setIsEditOpen(false)
        setSelectedWisata(null)
        setEditFotoFile(null)
        if (editFotoPreview?.startsWith('blob:')) URL.revokeObjectURL(editFotoPreview)
        setEditFotoPreview(null)
        editGaleriPreviews.forEach((u) => { if (u.startsWith('blob:')) URL.revokeObjectURL(u) })
        setEditGaleriFiles([])
        setEditGaleriPreviews([])
      }
      return res
    },
    null
  )

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus tempat wisata "${name}"?`)) {
      startDeleteTransition(async () => {
        const res = await deleteWisataAction(id)
        if (res.error) alert(res.error)
      })
    }
  }

  const openEditModal = (wisata: Wisata) => {
    setSelectedWisata(wisata)
    setEditFotoFile(null)
    setEditFotoPreview(getCoverPhoto(wisata) || null)
    // Inisialisasi galeri aktif dari data wisata (slice(1) karena index 0 adalah foto utama)
    setEditActiveGaleriUrls(wisata.foto_urls?.slice(1) ?? [])
    // Reset galeri baru (galeri lama tetap ada di editActiveGaleriUrls)
    editGaleriPreviews.forEach((u) => { if (u.startsWith('blob:')) URL.revokeObjectURL(u) })
    setEditGaleriFiles([])
    setEditGaleriPreviews([])
    setIsEditOpen(true)
  }

  const getCoverPhoto = (wisata: Wisata) => wisata.foto_urls?.[0] || wisata.foto_url

  // ── Statistik ringkasan untuk tab Beranda ──────────────────────────────
  // Nilai dihitung di server (page.tsx) dari query agregat yang selalu berjalan
  // — bebas dari masalah bookings kosong akibat lazy-fetch per tab.
  const totalDestinasi = wisataList.length

  return (
    <div className="space-y-6">
      {/* ── Tombol Kembali — hanya muncul saat berada di tab non-beranda ── */}
      {activeTab !== 'beranda' && (
        <Link
          href="/dashboard/mitra-wisata"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      )}

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-2 dark:text-white">
            <Landmark className="w-7 h-7 text-emerald-400" />
            <span>
              {activeTab === 'kelola'
                ? 'Manajemen Destinasi Wisata'
                : activeTab === 'riwayat'
                ? 'Riwayat Pesanan Tiket'
                : 'Beranda Mitra Wisata'}
            </span>
          </h1>
          <p className="text-slate-600 text-sm mt-1 dark:text-slate-400">
            {activeTab === 'kelola'
              ? 'Tambahkan, ubah, atau hapus tempat wisata kelolaan Anda.'
              : activeTab === 'riwayat'
              ? 'Pantau semua transaksi pemesanan tiket destinasi Anda.'
              : 'Ringkasan performa dan aktivitas destinasi wisata Anda.'}
          </p>
        </div>
        {activeTab === 'kelola' && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 text-sm font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Wisata Baru</span>
          </button>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          TAB: BERANDA
      ════════════════════════════════════════════════════════════ */}
      {activeTab === 'beranda' && (
        <div className="space-y-6">
          {/* Kartu statistik */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/80 border border-slate-200 rounded-2xl p-5 space-y-2 dark:bg-slate-900/40 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Total Destinasi
              </div>
              <div className="text-3xl font-black text-slate-950 dark:text-white">{totalDestinasi}</div>
              <p className="text-slate-500 text-[11px]">destinasi terdaftar</p>
            </div>
            <div className="bg-white/80 border border-slate-200 rounded-2xl p-5 space-y-2 dark:bg-slate-900/40 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <Ticket className="w-4 h-4 text-emerald-400" />
                Tiket Terjual
              </div>
              <div className="text-3xl font-black text-slate-950 dark:text-white">{totalTiketTerjual}</div>
              <p className="text-slate-500 text-[11px]">pax dari transaksi lunas</p>
            </div>
            <div className="bg-white/80 border border-slate-200 rounded-2xl p-5 space-y-2 dark:bg-slate-900/40 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Total Pendapatan
              </div>
              <div className="text-2xl font-black text-emerald-500">
                Rp {totalPendapatan.toLocaleString('id-ID')}
              </div>
              <p className="text-slate-500 text-[11px]">akumulasi dari transaksi sukses</p>
            </div>
          </div>

          {/* Daftar destinasi singkat */}
          <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 space-y-4 dark:bg-slate-900/40 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider dark:text-white">
              Destinasi Aktif
            </h2>
            {wisataList.length === 0 ? (
              <p className="text-slate-500 text-xs italic">Belum ada destinasi. Pergi ke tab Kelola Destinasi untuk menambahkan.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {wisataList.map((w) => (
                  <div key={w.id} className="flex items-center justify-between py-3 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 dark:bg-slate-800 dark:border-slate-700">
                        {getCoverPhoto(w) ? (
                          <img src={getCoverPhoto(w) || ''} alt={w.nama_wisata} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Compass className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <span className="font-semibold text-sm text-slate-800 truncate dark:text-slate-200">{w.nama_wisata}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 shrink-0">
                      Rp {w.harga_tiket.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB: RIWAYAT PESANAN TIKET
      ════════════════════════════════════════════════════════════ */}
      {activeTab === 'riwayat' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="border border-slate-200 bg-white/80 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 dark:border-slate-800 dark:bg-slate-900/20">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-900 dark:text-slate-600 dark:border-slate-800">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Belum Ada Pesanan Tiket</h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
                Belum ada wisatawan yang memesan tiket ke destinasi Anda. Pastikan destinasi sudah terdaftar dan aktif.
              </p>
            </div>
          ) : (
            <div className="bg-white/80 border border-slate-200 rounded-2xl overflow-hidden shadow-xl dark:bg-slate-900/30 dark:border-slate-800/80">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                      <th className="py-3.5 px-5">Wisatawan</th>
                      <th className="py-3.5 px-5">Destinasi</th>
                      <th className="py-3.5 px-5">Tgl Kunjungan</th>
                      <th className="py-3.5 px-5 text-center">Tiket</th>
                      <th className="py-3.5 px-5">Total Bayar</th>
                      <th className="py-3.5 px-5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {bookings.map((b) => {
                      const customer = Array.isArray(b.customer) ? b.customer[0] : b.customer
                      const wisata = Array.isArray(b.wisata) ? b.wisata[0] : b.wisata
                      const isSuccess = b.status === 'success'
                      const isPast = new Date(b.tanggal_kunjungan) < new Date()
                      let label = b.status
                      if (isSuccess) label = isPast ? 'selesai' : 'lunas'
                      else if (b.status === 'pending') label = 'menunggu'
                      else if (b.status === 'cancelled') label = 'dibatalkan'
                      return (
                        <tr key={b.id} className="hover:bg-slate-50 text-slate-700 transition-colors dark:hover:bg-slate-900/20 dark:text-slate-300">
                          <td className="py-4 px-5">
                            <div className="font-bold text-slate-950 dark:text-white">{customer?.nama_lengkap || '—'}</div>
                            <div className="text-slate-500 text-xs">{customer?.email || ''}</div>
                          </td>
                          <td className="py-4 px-5 font-semibold dark:text-slate-200">{wisata?.nama_wisata || '—'}</td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                              <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
                              {new Date(b.tanggal_kunjungan).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                            </div>
                          </td>
                          <td className="py-4 px-5 text-center font-semibold">{b.jumlah_tiket} pax</td>
                          <td className="py-4 px-5 font-bold text-emerald-600 dark:text-emerald-400">
                            Rp {b.total_harga.toLocaleString('id-ID')}
                          </td>
                          <td className="py-4 px-5 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              label === 'lunas'      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' :
                              label === 'selesai'    ? 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400' :
                              label === 'dibatalkan' ? 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400' :
                                                      'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400'
                            }`}>{label}</span>
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
          TAB: KELOLA DESTINASI — konten asli tidak diubah sama sekali
      ════════════════════════════════════════════════════════════ */}
      {activeTab === 'kelola' && (
        <>
          {wisataList.length === 0 ? (
            <div className="border border-dashed border-slate-300 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 my-8 dark:border-slate-800">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Belum Ada Tempat Wisata</h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
                Anda belum mendaftarkan destinasi wisata. Mulai tambahkan tempat wisata baru agar wisatawan dapat melihat dan memesan tiket.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
                >
                  Tambah Wisata Pertama Anda
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wisataList.map((item) => (
                <div key={item.id} className="bg-white/80 backdrop-blur-md border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 group dark:bg-slate-900/40 dark:border-slate-800/80 dark:hover:border-slate-700">
                  <div className="h-44 bg-slate-100 relative overflow-hidden flex-shrink-0 dark:bg-slate-950">
                    {getCoverPhoto(item) ? (
                      <img
                        src={getCoverPhoto(item) || ''}
                        alt={item.nama_wisata}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-100 gap-2 dark:text-slate-600 dark:bg-slate-950">
                        <Compass className="w-10 h-10 text-slate-400 animate-pulse dark:text-slate-700" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Tidak Ada Foto</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] font-bold px-2 py-1 rounded text-emerald-400 uppercase tracking-wide">
                      Rp {item.harga_tiket.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-950 text-base group-hover:text-emerald-600 transition-colors dark:text-white dark:group-hover:text-emerald-400">{item.nama_wisata}</h3>
                      <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed dark:text-slate-400">{item.deskripsi}</p>
                    </div>
                    <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-850">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Harga Tiket</span>
                          <span className="font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
                            <DollarSign className="w-3.5 h-3.5" />
                            Rp {item.harga_tiket.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Kuota Harian</span>
                          <span className="font-bold text-slate-700 flex items-center gap-1 mt-0.5 dark:text-slate-300">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            {item.kuota_harian} pax
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="flex-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold py-2 rounded-lg border border-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Ubah</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.nama_wisata)}
                          disabled={isPendingDelete}
                          className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-300 p-2 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Modal Tambah Wisata ────────────────────────────────────────── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-y-auto max-h-[90vh] shadow-2xl dark:bg-slate-900 dark:border-slate-800">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2 dark:text-white">
                <Landmark className="w-5 h-5 text-emerald-400" />
                Tambah Wisata Baru
              </h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-500 hover:text-slate-950 cursor-pointer dark:text-slate-400 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form action={createFormAction} className="p-6 space-y-4">
              {createState?.error && (
                <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{createState.error}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Nama Tempat Wisata</label>
                <input type="text" name="nama_wisata" required placeholder="Contoh: Pantai Kuta" className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Deskripsi Wisata</label>
                <textarea name="deskripsi" rows={4} required placeholder="Tuliskan daya tarik utama..." className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Harga Tiket (Rp)</label>
                  <input type="number" name="harga_tiket" min="0" required placeholder="15000" className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Kuota Harian (Pax)</label>
                  <input type="number" name="kuota_harian" min="0" required placeholder="100" className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100" />
                </div>
              </div>
              {/* Input file foto utama + preview */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Foto Utama Destinasi</label>
                <div className="flex items-center gap-3">
                  {/* Preview thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 flex items-center justify-center dark:border-slate-700 dark:bg-slate-800">
                    {createFotoPreview ? (
                      <img src={createFotoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <label htmlFor="create_foto_input" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-300">
                      <Camera className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="truncate">{createFotoFile ? createFotoFile.name : 'Pilih foto destinasi…'}</span>
                    </label>
                    <input
                      id="create_foto_input"
                      type="file"
                      accept="image/*,.heic,.heif"
                      className="sr-only"
                      onChange={async (e) => {
                        const raw = e.target.files?.[0]
                        if (!raw) return
                        const file = await convertHeicToJpeg(raw)
                        if (createFotoPreview?.startsWith('blob:')) URL.revokeObjectURL(createFotoPreview)
                        setCreateFotoFile(file)
                        setCreateFotoPreview(URL.createObjectURL(file))
                      }}
                    />
                    <p className="text-slate-400 text-[10px] mt-1">JPG, PNG, WebP. Maks 20 MB.</p>
                  </div>
                </div>
              </div>
              {/* ── Galeri foto tambahan (multi-file) ── */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Galeri Foto Destinasi (Opsional)
                </label>
                <label
                  htmlFor="create_galeri_input"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold cursor-pointer transition-colors w-full mb-2"
                >
                  <ImageIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    {createGaleriFiles.length > 0
                      ? `${createGaleriFiles.length} foto dipilih`
                      : 'Pilih beberapa foto galeri sekaligus…'}
                  </span>
                </label>
                <input
                  id="create_galeri_input"
                  type="file"
                  accept="image/*,.heic,.heif"
                  multiple
                  className="sr-only"
                  onChange={async (e) => {
                    const rawFiles = Array.from(e.target.files || [])
                    if (rawFiles.length === 0) return
                    const files = await Promise.all(rawFiles.map(convertHeicToJpeg))
                    createGaleriPreviews.forEach((u) => { if (u.startsWith('blob:')) URL.revokeObjectURL(u) })
                    setCreateGaleriFiles(files)
                    setCreateGaleriPreviews(files.map((f) => URL.createObjectURL(f)))
                  }}
                />
                {createGaleriPreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {createGaleriPreviews.map((src, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                        <img src={src} alt={`Galeri ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            URL.revokeObjectURL(src)
                            setCreateGaleriFiles((prev) => prev.filter((_, i) => i !== idx))
                            setCreateGaleriPreviews((prev) => prev.filter((_, i) => i !== idx))
                          }}
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Hapus foto ${idx + 1}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3 dark:border-slate-800">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-900 dark:text-slate-300">Batal</button>
                <button type="submit" disabled={isCreatePending} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50">
                  {isCreatePending ? <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : <span>Simpan</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Edit Wisata ──────────────────────────────────────────── */}
      {isEditOpen && selectedWisata && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-y-auto max-h-[90vh] shadow-2xl dark:bg-slate-900 dark:border-slate-800">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2 dark:text-white">
                <Landmark className="w-5 h-5 text-emerald-400" />
                Ubah Detail Wisata
              </h2>
              <button onClick={() => { setIsEditOpen(false); setSelectedWisata(null) }} className="text-slate-500 hover:text-slate-950 cursor-pointer dark:text-slate-400 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form action={editFormAction} className="p-6 space-y-4">
              {editState?.error && (
                <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{editState.error}
                </div>
              )}
              <input type="hidden" name="id" value={selectedWisata.id} />
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Nama Tempat Wisata</label>
                <input type="text" name="nama_wisata" required defaultValue={selectedWisata.nama_wisata} className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Deskripsi Wisata</label>
                <textarea name="deskripsi" rows={4} required defaultValue={selectedWisata.deskripsi} className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Harga Tiket (Rp)</label>
                  <input type="number" name="harga_tiket" min="0" required defaultValue={selectedWisata.harga_tiket} className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Kuota Harian (Pax)</label>
                  <input type="number" name="kuota_harian" min="0" required defaultValue={selectedWisata.kuota_harian} className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100" />
                </div>
              </div>
              {/* Hidden field: URL foto lama sebagai fallback jika tidak ada file baru */}
              <input type="hidden" name="existing_foto_url" value={selectedWisata.foto_url || ''} />
              {/* Input file foto utama + preview */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Foto Utama Destinasi</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 flex items-center justify-center dark:border-slate-700 dark:bg-slate-800">
                    {editFotoPreview ? (
                      <img src={editFotoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <label htmlFor="edit_foto_input" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-300">
                      <Camera className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="truncate">{editFotoFile ? editFotoFile.name : 'Ganti foto destinasi…'}</span>
                    </label>
                    <input
                      id="edit_foto_input"
                      type="file"
                      accept="image/*,.heic,.heif"
                      className="sr-only"
                      onChange={async (e) => {
                        const raw = e.target.files?.[0]
                        if (!raw) return
                        const file = await convertHeicToJpeg(raw)
                        if (editFotoPreview?.startsWith('blob:')) URL.revokeObjectURL(editFotoPreview)
                        setEditFotoFile(file)
                        setEditFotoPreview(URL.createObjectURL(file))
                      }}
                    />
                    <p className="text-slate-400 text-[10px] mt-1">Biarkan kosong untuk mempertahankan foto saat ini.</p>
                  </div>
                </div>
              </div>
              {/* ── Galeri foto tambahan (multi-file) ── */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Tambah Foto Galeri Baru (Opsional)
                </label>
                {/* Thumbnail galeri lama yang sudah ada di DB — dengan tombol hapus */}
                {editActiveGaleriUrls.length > 0 && (
                  <div className="mb-2">
                    <p className="text-slate-400 text-[10px] mb-1.5">
                      Foto galeri tersimpan ({editActiveGaleriUrls.length} foto) — klik ✕ untuk menghapus:
                    </p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {editActiveGaleriUrls.map((src, idx) => (
                        <div key={src} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                          <img src={src} alt={`Galeri ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setEditActiveGaleriUrls((prev) => prev.filter((_, i) => i !== idx))}
                            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            aria-label={`Hapus foto galeri ${idx + 1}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <label
                  htmlFor="edit_galeri_input"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold cursor-pointer transition-colors w-full mb-2"
                >
                  <ImageIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    {editGaleriFiles.length > 0
                      ? `${editGaleriFiles.length} foto baru dipilih`
                      : 'Pilih foto galeri tambahan…'}
                  </span>
                </label>
                <input
                  id="edit_galeri_input"
                  type="file"
                  accept="image/*,.heic,.heif"
                  multiple
                  className="sr-only"
                  onChange={async (e) => {
                    const rawFiles = Array.from(e.target.files || [])
                    if (rawFiles.length === 0) return
                    const files = await Promise.all(rawFiles.map(convertHeicToJpeg))
                    editGaleriPreviews.forEach((u) => { if (u.startsWith('blob:')) URL.revokeObjectURL(u) })
                    setEditGaleriFiles(files)
                    setEditGaleriPreviews(files.map((f) => URL.createObjectURL(f)))
                  }}
                />
                {editGaleriPreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {editGaleriPreviews.map((src, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                        <img src={src} alt={`Galeri baru ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            URL.revokeObjectURL(src)
                            setEditGaleriFiles((prev) => prev.filter((_, i) => i !== idx))
                            setEditGaleriPreviews((prev) => prev.filter((_, i) => i !== idx))
                          }}
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Hapus foto ${idx + 1}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-slate-400 text-[10px] mt-1.5">Foto galeri lama akan tetap dipertahankan. Foto baru akan ditambahkan.</p>
              </div>
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3 dark:border-slate-800">
                <button type="button" onClick={() => { setIsEditOpen(false); setSelectedWisata(null) }} className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-900 dark:text-slate-300">Batal</button>
                <button type="submit" disabled={isEditPending} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50">
                  {isEditPending ? <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : <span>Simpan Perubahan</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
