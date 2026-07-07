'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle, Ticket } from 'lucide-react'
import Link from 'next/link'
import ETicketModal, { type ETicketData } from './ETicketModal'

export interface CustomerBookingClient {
  id: string
  tanggal_kunjungan: string
  jumlah_tiket: number
  total_harga: number
  status: string
  created_at: string
  namaWisata: string
  fotoWisataUrl: string | null
  namaCustomer: string
  namaGuide: string | null
}

interface Props {
  bookings: CustomerBookingClient[]
}

export default function CustomerDashboardClient({ bookings }: Props) {
  const [activeTicket, setActiveTicket] = useState<ETicketData | null>(null)

  const openTicket = (b: CustomerBookingClient) => {
    setActiveTicket({
      bookingId: b.id,
      namaWisata: b.namaWisata,
      fotoWisataUrl: b.fotoWisataUrl,
      namaCustomer: b.namaCustomer,
      tanggalKunjungan: b.tanggal_kunjungan,
      jumlahTiket: b.jumlah_tiket,
      totalHarga: b.total_harga,
      namaGuide: b.namaGuide,
      createdAt: b.created_at,
    })
  }

  if (bookings.length === 0) return null

  return (
    <>
      <div className="bg-white/80 border border-slate-200 rounded-2xl overflow-hidden shadow-xl dark:bg-slate-900/30 dark:border-slate-800/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                <th className="py-3.5 px-5">Nama Tempat Wisata</th>
                <th className="py-3.5 px-5">Tanggal Kunjungan</th>
                <th className="py-3.5 px-5 text-center">Jumlah Tiket</th>
                <th className="py-3.5 px-5">Tour Guide</th>
                <th className="py-3.5 px-5">Total Harga</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-850">
              {bookings.map((booking) => {
                const isPast = new Date(booking.tanggal_kunjungan) < new Date()
                const isSuccess = booking.status === 'success'
                let statusLabel = booking.status
                let statusClass = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                if (isSuccess) {
                  statusLabel = isPast ? 'selesai' : 'lunas'
                  statusClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                } else if (booking.status === 'cancelled') {
                  statusLabel = 'dibatalkan'
                  statusClass = 'bg-red-500/10 text-red-400 border-red-500/20'
                }

                return (
                  <tr key={booking.id} className="hover:bg-slate-50 text-slate-700 transition-colors dark:hover:bg-slate-900/20 dark:text-slate-300">
                    <td className="py-4 px-5 font-bold text-slate-950 dark:text-white">
                      {booking.namaWisata}
                    </td>
                    <td className="py-4 px-5">
                      {new Date(booking.tanggal_kunjungan).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </td>
                    <td className="py-4 px-5 text-center font-semibold">{booking.jumlah_tiket} pax</td>
                    <td className="py-4 px-5 text-xs text-slate-500 italic dark:text-slate-400">
                      {booking.namaGuide ? (
                        <span className="text-slate-700 not-italic font-medium dark:text-slate-300">
                          {booking.namaGuide}
                        </span>
                      ) : (
                        'Tanpa Guide'
                      )}
                    </td>
                    <td className="py-4 px-5 font-bold text-emerald-400">
                      Rp {booking.total_harga.toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      {booking.status === 'pending' && (
                        <Link
                          href={`/checkout/qris/${booking.id}`}
                          className="inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>Bayar</span>
                        </Link>
                      )}
                      {booking.status === 'success' && (
                        <button
                          type="button"
                          onClick={() => openTicket(booking)}
                          className="inline-flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>E-Ticket</span>
                        </button>
                      )}
                      {booking.status === 'cancelled' && (
                        <span className="text-slate-600 text-xs">Dibatalkan</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal E-Ticket */}
      {activeTicket && (
        <ETicketModal
          ticket={activeTicket}
          onClose={() => setActiveTicket(null)}
        />
      )}
    </>
  )
}
