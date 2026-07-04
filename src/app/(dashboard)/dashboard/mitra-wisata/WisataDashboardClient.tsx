'use client'

import { useActionState, useState, useTransition } from 'react'
import { createWisataAction, updateWisataAction, deleteWisataAction } from './actions'
import { Landmark, Plus, Edit2, Trash2, X, Compass, DollarSign, Users, AlertCircle } from 'lucide-react'

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
}

export default function WisataDashboardClient({ wisataList }: Props) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedWisata, setSelectedWisata] = useState<Wisata | null>(null)
  const [isPendingDelete, startDeleteTransition] = useTransition()

  // React 19 Action States
  const [createState, createFormAction, isCreatePending] = useActionState(
    async (state: any, formData: FormData) => {
      const res = await createWisataAction(state, formData)
      if (res.success) {
        setIsCreateOpen(false)
      }
      return res
    },
    null
  )

  const [editState, editFormAction, isEditPending] = useActionState(
    async (state: any, formData: FormData) => {
      const res = await updateWisataAction(state, formData)
      if (res.success) {
        setIsEditOpen(false)
        setSelectedWisata(null)
      }
      return res
    },
    null
  )

  // Handle Delete
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus tempat wisata "${name}"?`)) {
      startDeleteTransition(async () => {
        const res = await deleteWisataAction(id)
        if (res.error) {
          alert(res.error)
        }
      })
    }
  }

  // Open Edit Modal
  const openEditModal = (wisata: Wisata) => {
    setSelectedWisata(wisata)
    setIsEditOpen(true)
  }

  const getCoverPhoto = (wisata: Wisata) => wisata.foto_urls?.[0] || wisata.foto_url

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-2 dark:text-white">
            <Landmark className="w-7 h-7 text-emerald-400" />
            <span>Manajemen Destinasi Wisata</span>
          </h1>
          <p className="text-slate-600 text-sm mt-1 dark:text-slate-400">Tambahkan, ubah, atau hapus tempat wisata kelolaan Anda.</p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 text-sm font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Wisata Baru</span>
        </button>
      </div>

      {/* Main Wisata List Grid */}
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
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-slate-300 dark:border-slate-800"
            >
              Tambah Wisata Pertama Anda
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wisataList.map((item) => (
            <div key={item.id} className="bg-white/80 backdrop-blur-md border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 group dark:bg-slate-900/40 dark:border-slate-800/80 dark:hover:border-slate-700">
              {/* Photo Area */}
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
                
                {/* Badges on top of photo */}
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] font-bold px-2 py-1 rounded text-emerald-400 uppercase tracking-wide">
                  Rp {item.harga_tiket.toLocaleString('id-ID')}
                </div>
              </div>

              {/* Info Body */}
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

                  {/* Actions Buttons */}
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

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in dark:bg-slate-900 dark:border-slate-800">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2 dark:text-white">
                <Landmark className="w-5 h-5 text-emerald-400" />
                <span>Tambah Wisata Baru</span>
              </h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-500 hover:text-slate-950 transition-colors cursor-pointer dark:text-slate-400 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form action={createFormAction} className="p-6 space-y-4">
              {createState?.error && (
                <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{createState.error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nama Tempat Wisata
                </label>
                <input
                  type="text"
                  name="nama_wisata"
                  required
                  placeholder="Contoh: Pantai Kuta, Candi Borobudur"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Deskripsi Wisata
                </label>
                <textarea
                  name="deskripsi"
                  rows={4}
                  required
                  placeholder="Tuliskan daya tarik utama destinasi wisata Anda..."
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Harga Tiket (Rp)
                  </label>
                  <input
                    type="number"
                    name="harga_tiket"
                    min="0"
                    required
                    placeholder="Contoh: 15000"
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Kuota Harian (Pax)
                  </label>
                  <input
                    type="number"
                    name="kuota_harian"
                    min="0"
                    required
                    placeholder="Contoh: 100"
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Foto Utama URL (Opsional)
                </label>
                <input
                  type="url"
                  name="foto_url"
                  placeholder="https://example.com/foto.jpg"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Galeri Foto URL (Opsional)
                </label>
                <textarea
                  name="foto_urls"
                  rows={3}
                  placeholder="Satu URL per baris, atau pisahkan dengan koma"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-900 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCreatePending}
                  className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isCreatePending ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Simpan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && selectedWisata && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in dark:bg-slate-900 dark:border-slate-800">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2 dark:text-white">
                <Landmark className="w-5 h-5 text-emerald-400" />
                <span>Ubah Detail Wisata</span>
              </h2>
              <button
                onClick={() => {
                  setIsEditOpen(false)
                  setSelectedWisata(null)
                }}
                className="text-slate-500 hover:text-slate-950 transition-colors cursor-pointer dark:text-slate-400 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form action={editFormAction} className="p-6 space-y-4">
              {editState?.error && (
                <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{editState.error}</span>
                </div>
              )}

              {/* ID Hidden input */}
              <input type="hidden" name="id" value={selectedWisata.id} />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nama Tempat Wisata
                </label>
                <input
                  type="text"
                  name="nama_wisata"
                  required
                  defaultValue={selectedWisata.nama_wisata}
                  placeholder="Contoh: Pantai Kuta, Candi Borobudur"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Deskripsi Wisata
                </label>
                <textarea
                  name="deskripsi"
                  rows={4}
                  required
                  defaultValue={selectedWisata.deskripsi}
                  placeholder="Tuliskan daya tarik utama destinasi wisata Anda..."
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Harga Tiket (Rp)
                  </label>
                  <input
                    type="number"
                    name="harga_tiket"
                    min="0"
                    required
                    defaultValue={selectedWisata.harga_tiket}
                    placeholder="Contoh: 15000"
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Kuota Harian (Pax)
                  </label>
                  <input
                    type="number"
                    name="kuota_harian"
                    min="0"
                    required
                    defaultValue={selectedWisata.kuota_harian}
                    placeholder="Contoh: 100"
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Foto Utama URL (Opsional)
                </label>
                <input
                  type="url"
                  name="foto_url"
                  defaultValue={selectedWisata.foto_url || ''}
                  placeholder="https://example.com/foto.jpg"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Galeri Foto URL (Opsional)
                </label>
                <textarea
                  name="foto_urls"
                  rows={3}
                  defaultValue={(selectedWisata.foto_urls?.length ? selectedWisata.foto_urls : selectedWisata.foto_url ? [selectedWisata.foto_url] : []).join('\n')}
                  placeholder="Satu URL per baris, atau pisahkan dengan koma"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false)
                    setSelectedWisata(null)
                  }}
                  className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-900 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isEditPending}
                  className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isEditPending ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
