'use client'

import { FormEvent, useState, useTransition } from 'react'
import { updateGuideProfileAction, toggleGuideAvailabilityAction } from './actions'
import { Compass, Award, DollarSign, Check, AlertCircle, RefreshCw, Eye, Sparkles, UserRound } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GuideProfile {
  id: string
  mitra_id: string
  tarif_per_hari: number
  keahlian: string
  is_available: boolean
}

interface UserData {
  nama_lengkap: string
  email: string
}

interface Props {
  guideProfile: GuideProfile
  userData: UserData
}

type ActionState = {
  error?: string
  success?: string
} | null

type SavedProfile = {
  nama_lengkap: string
  tarif_per_hari: number
  keahlian: string
}

export default function GuideDashboardClient({ guideProfile, userData }: Props) {
  const router = useRouter()
  const initialProfile: SavedProfile = {
    nama_lengkap: userData.nama_lengkap,
    tarif_per_hari: guideProfile.tarif_per_hari,
    keahlian: guideProfile.keahlian,
  }

  // Local states for real-time preview
  const [namaLengkap, setNamaLengkap] = useState(userData.nama_lengkap)
  const [tarif, setTarif] = useState(guideProfile.tarif_per_hari)
  const [keahlian, setKeahlian] = useState(guideProfile.keahlian)
  const [savedProfile, setSavedProfile] = useState(initialProfile)
  const [isAvailable, setIsAvailable] = useState(guideProfile.is_available)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [state, setState] = useState<ActionState>(null)
  const [isPendingToggle, startToggleTransition] = useTransition()

  const handleStartEdit = () => {
    setState(null)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setNamaLengkap(savedProfile.nama_lengkap)
    setTarif(savedProfile.tarif_per_hari)
    setKeahlian(savedProfile.keahlian)
    setState(null)
    setIsEditing(false)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isEditing || isSaving) return

    setIsSaving(true)
    setState(null)

    const formData = new FormData()
    formData.set('nama_lengkap', namaLengkap)
    formData.set('tarif_per_hari', String(tarif))
    formData.set('keahlian', keahlian)
    formData.set('is_available', isAvailable ? 'true' : 'false')

    const res = await updateGuideProfileAction(null, formData)
    setIsSaving(false)
    setState(res)

    if (res.success) {
      setSavedProfile({
        nama_lengkap: namaLengkap,
        tarif_per_hari: tarif,
        keahlian,
      })
      setIsEditing(false)
      router.refresh()
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Compass className="w-7 h-7 text-emerald-400" />
          <span>Pengaturan Layanan Tour Guide</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Kelola profil publik, ubah tarif pemanduan, dan atur jadwal ketersediaan Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: EDIT FORM */}
        <div className="lg:col-span-7 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-850 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">Profil Layanan Guide</h2>
              <p className="text-slate-500 text-xs mt-1">{isEditing ? 'Mode edit aktif.' : 'Mode preview read-only aktif setelah data tersimpan.'}</p>
            </div>
            
            {/* Quick Toggle Ketersediaan */}
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

            <div>
              <label htmlFor="nama_lengkap" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <UserRound className="w-4 h-4" />
                </span>
                <input
                  id="nama_lengkap"
                  name="nama_lengkap"
                  type="text"
                  required
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  readOnly={!isEditing}
                  placeholder="Nama lengkap pemandu"
                  className={`w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200 ${!isEditing ? 'cursor-default opacity-80' : ''}`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="tarif_per_hari" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Tarif Jasa Per Hari (Rp)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  Rp
                </span>
                <input
                  id="tarif_per_hari"
                  name="tarif_per_hari"
                  type="number"
                  min="0"
                  required
                  value={tarif}
                  onChange={(e) => setTarif(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  readOnly={!isEditing}
                  placeholder="Contoh: 150000"
                  className={`w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200 ${!isEditing ? 'cursor-default opacity-80' : ''}`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="keahlian" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Spesialisasi &amp; Keahlian Bahasa
              </label>
              <textarea
                id="keahlian"
                name="keahlian"
                rows={5}
                required
                value={keahlian}
                onChange={(e) => setKeahlian(e.target.value)}
                readOnly={!isEditing}
                placeholder="Contoh: Menguasai Bahasa Inggris &amp; Jepang. Spesialisasi sejarah pura Bali kuno dan trekking alam."
                className={`w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none transition-all duration-200 ${!isEditing ? 'cursor-default opacity-80' : ''}`}
              />
            </div>

            <div className="pt-4 border-t border-slate-850 flex justify-end gap-3">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-200 text-sm font-bold px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Edit Profil
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 text-sm font-bold px-6 py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 text-sm font-bold px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Simpan Perubahan</span>
                    )}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: PREVIEW CARD */}
        <div className="lg:col-span-5 flex flex-col justify-start space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Pratinjau Profil Wisatawan</span>
          </div>

          {/* Premium Preview Card */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl relative group">
            {/* Design accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Profile Card Header */}
            <div className="p-6 pb-4 flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 text-xl font-bold flex-shrink-0 shadow-inner">
                  {namaLengkap.charAt(0) || 'G'}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-white truncate flex items-center gap-1.5">
                    {namaLengkap || 'Nama Guide'}
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                  </h3>
                  <span className="text-slate-500 text-xs truncate block">{userData.email}</span>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                isAvailable
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {isAvailable ? 'Tersedia' : 'Sibuk'}
              </span>
            </div>

            {/* Profile Card Body */}
            <div className="px-6 py-4 border-t border-slate-850 space-y-4">
              {/* Expertise Area */}
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Keahlian &amp; Spesialisasi</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed italic whitespace-pre-line bg-slate-950/40 border border-slate-900 p-3 rounded-lg">
                  {keahlian || 'Belum menulis spesialisasi...'}
                </p>
              </div>

              {/* Stats / Tarif */}
              <div className="bg-slate-950/30 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">Tarif Pemanduan</span>
                  <span className="text-lg font-bold text-emerald-400 mt-0.5 flex items-center gap-0.5">
                    <DollarSign className="w-4 h-4" />
                    Rp {tarif.toLocaleString('id-ID')}
                    <span className="text-slate-500 font-normal text-xs">/hari</span>
                  </span>
                </div>
                <button
                  type="button"
                  className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-lg cursor-not-allowed"
                >
                  Sewa Guide
                </button>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-slate-950/60 text-slate-500 text-[9px] px-6 py-2 border-t border-slate-850 text-center leading-relaxed">
              *Tampilan ini adalah simulasi profil Anda di halaman pencarian wisatawan.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
