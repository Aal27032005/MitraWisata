'use client'

import { useTransition, useState } from 'react'
import { confirmPaymentAction, cancelBookingAction } from './actions'
import { Shield, Users, Landmark, DollarSign, Check, X, RefreshCw, AlertCircle, ShoppingBag } from 'lucide-react'

interface Booking {
  id: string
  tanggal_kunjungan: string
  jumlah_tiket: number
  total_harga: number
  status: string
  created_at: string
  wisata: {
    nama_wisata: string
  }
  customer: {
    nama_lengkap: string
    email: string
  }
  guides: {
    users: {
      nama_lengkap: string
    }
  } | null
}

interface Stats {
  totalUsers: number
  totalWisata: number
  totalBookings: number
  totalRevenue: number
}

interface Props {
  stats: Stats
  bookings: Booking[]
}

export default function AdminDashboardClient({ stats, bookings }: Props) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleConfirm = (id: string) => {
    setMessage(null)
    startTransition(async () => {
      const res = await confirmPaymentAction(id)
      if (res.success) {
        setMessage({ type: 'success', text: res.success })
      } else if (res.error) {
        setMessage({ type: 'error', text: res.error })
      }
    })
  }

  const handleCancel = (id: string) => {
    if (confirm('Apakah Anda yakin ingin membatalkan transaksi ini?')) {
      setMessage(null)
      startTransition(async () => {
        const res = await cancelBookingAction(id)
        if (res.success) {
          setMessage({ type: 'success', text: res.success })
        } else if (res.error) {
          setMessage({ type: 'error', text: res.error })
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-2 dark:text-white">
          <Shield className="w-7 h-7 text-emerald-400" />
          <span>Panel Administrator</span>
        </h1>
        <p className="text-slate-600 text-sm mt-1 dark:text-slate-400">Audit transaksi tiket pariwisata global dan verifikasi status pembayaran.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 border border-slate-200 rounded-xl p-5 dark:bg-slate-900/50 dark:border-slate-800/80">
          <div className="flex justify-between items-start text-slate-600 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Pengguna</span>
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold mt-2 text-slate-950 dark:text-white">{stats.totalUsers}</div>
          <div className="text-[10px] text-slate-500 mt-1">Akun terdaftar di database</div>
        </div>

        <div className="bg-white/80 border border-slate-200 rounded-xl p-5 dark:bg-slate-900/50 dark:border-slate-800/80">
          <div className="flex justify-between items-start text-slate-600 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Destinasi</span>
            <Landmark className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold mt-2 text-slate-950 dark:text-white">{stats.totalWisata}</div>
          <div className="text-[10px] text-slate-500 mt-1">Destinasi wisata terdaftar</div>
        </div>

        <div className="bg-white/80 border border-slate-200 rounded-xl p-5 dark:bg-slate-900/50 dark:border-slate-800/80">
          <div className="flex justify-between items-start text-slate-600 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Booking</span>
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold mt-2 text-slate-950 dark:text-white">{stats.totalBookings}</div>
          <div className="text-[10px] text-slate-500 mt-1">Semua status pemesanan</div>
        </div>

        <div className="bg-white/80 border border-slate-200 rounded-xl p-5 dark:bg-slate-900/50 dark:border-slate-800/80">
          <div className="flex justify-between items-start text-slate-600 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Omzet Sukses</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold mt-2 text-emerald-400">Rp {stats.totalRevenue.toLocaleString('id-ID')}</div>
          <div className="text-[10px] text-slate-500 mt-1">Pendapatan status 'success'</div>
        </div>
      </div>

      {/* Action status message */}
      {message && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Transaction Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2 dark:text-white">
          <span>Audit Transaksi Global</span>
          {isPending && <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />}
        </h2>

        {bookings.length === 0 ? (
          <div className="border border-slate-200 bg-white/70 rounded-2xl p-12 text-center text-slate-500 text-sm dark:border-slate-900 dark:bg-slate-900/10">
            Belum ada transaksi pemesanan tiket yang masuk ke sistem.
          </div>
        ) : (
          <div className="bg-white/80 border border-slate-200 rounded-2xl overflow-hidden shadow-2xl dark:bg-slate-900/30 dark:border-slate-800/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                    <th className="py-3.5 px-5">Customer</th>
                    <th className="py-3.5 px-5">Destinasi Wisata</th>
                    <th className="py-3.5 px-5">Tanggal Kunjungan</th>
                    <th className="py-3.5 px-5 text-center">Jumlah Tiket</th>
                    <th className="py-3.5 px-5">Tour Guide</th>
                    <th className="py-3.5 px-5">Total Harga</th>
                    <th className="py-3.5 px-5 text-center">Status</th>
                    <th className="py-3.5 px-5 text-center">Aksi Administrator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-850">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50 text-slate-700 transition-colors dark:hover:bg-slate-900/20 dark:text-slate-300">
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-950 dark:text-white">{booking.customer?.nama_lengkap}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{booking.customer?.email}</div>
                      </td>
                      <td className="py-4 px-5 font-medium text-slate-950 dark:text-white">
                        {booking.wisata?.nama_wisata}
                      </td>
                      <td className="py-4 px-5">
                        {new Date(booking.tanggal_kunjungan).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </td>
                      <td className="py-4 px-5 text-center font-semibold">
                        {booking.jumlah_tiket} pax
                      </td>
                      <td className="py-4 px-5 text-xs">
                        {booking.guides?.users?.nama_lengkap ? (
                          <span className="text-slate-700 font-medium dark:text-slate-300">{booking.guides.users.nama_lengkap}</span>
                        ) : (
                          <span className="text-slate-500 italic">Tanpa Guide</span>
                        )}
                      </td>
                      <td className="py-4 px-5 font-bold text-emerald-400">
                        Rp {booking.total_harga.toLocaleString('id-ID')}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          booking.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          booking.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex gap-1.5 justify-center">
                          {booking.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleConfirm(booking.id)}
                                disabled={isPending}
                                className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Konfirmasi</span>
                              </button>
                              <button
                                onClick={() => handleCancel(booking.id)}
                                disabled={isPending}
                                className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-slate-500 text-xs italic">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
