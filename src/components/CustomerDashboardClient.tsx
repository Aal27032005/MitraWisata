'use client'

import { useState } from 'react'
import { ArrowRight, CalendarCheck, Ticket, Users, UserRound, Wallet, MapPin } from 'lucide-react'
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

function getStatusInfo(status: string, tanggalKunjungan: string) {
  const isSuccess = status === 'success'
  const isPast = new Date(tanggalKunjungan) < new Date()

  if (isSuccess) {
    const label = isPast ? 'Selesai' : 'Lunas'
    return {
      label,
      badgeClass:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
      dotClass: 'bg-emerald-500',
    }
  }
  if (status === 'cancelled') {
    return {
      label: 'Dibatalkan',
      badgeClass:
        'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
      dotClass: 'bg-red-500',
    }
  }
  return {
    label: 'Menunggu',
    badgeClass:
      'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20',
    dotClass: 'bg-yellow-400',
  }
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
      <div className="flex flex-col gap-3">
        {bookings.map((booking) => {
          const { label, badgeClass, dotClass } = getStatusInfo(
            booking.status,
            booking.tanggal_kunjungan
          )
          const tanggal = new Date(booking.tanggal_kunjungan).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
          })

          return (
            <div
              key={booking.id}
              className="group flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl border border-slate-200 bg-white/90 px-5 py-4 shadow-sm transition-all hover:shadow-md hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-slate-700"
            >
              {/* ── Kiri: thumbnail + info utama ──────────────────────── */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Thumbnail foto destinasi */}
                <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                  {booking.fotoWisataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={booking.fotoWisataUrl}
                      alt={booking.namaWisata}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Nama & meta info */}
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-base text-slate-950 dark:text-white truncate capitalize leading-tight">
                    {booking.namaWisata}
                  </h3>
                  {/* Baris meta: tanggal • pax */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <CalendarCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      {tanggal}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700 select-none">•</span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Users className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      {booking.jumlah_tiket} Pax
                    </span>
                    <span className="text-slate-300 dark:text-slate-700 select-none">•</span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <UserRound className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      {booking.namaGuide ?? (
                        <span className="italic">Tanpa Guide</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Kanan: harga + status + aksi ──────────────────────── */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:flex-shrink-0">
                {/* Harga */}
                <div className="flex sm:flex-col sm:items-end items-center gap-2 sm:gap-0.5">
                  <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:hidden">
                    <Wallet className="w-3 h-3" />
                    Total:
                  </div>
                  <span className="font-black text-base text-emerald-600 dark:text-emerald-400 tabular-nums">
                    Rp {booking.total_harga.toLocaleString('id-ID')}
                  </span>
                  <span className="hidden sm:block text-[10px] text-slate-400">total bayar</span>
                </div>

                {/* Divider vertikal (desktop) */}
                <div className="hidden sm:block w-px h-10 bg-slate-200 dark:bg-slate-700" />

                {/* Badge status + tombol aksi */}
                <div className="flex flex-col items-stretch sm:items-end gap-2 sm:min-w-[120px]">
                  {/* Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 self-start sm:self-end px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotClass}`} />
                    {label}
                  </span>

                  {/* Tombol aksi */}
                  {booking.status === 'pending' && (
                    <Link
                      href={`/checkout/qris/${booking.id}`}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Bayar Sekarang</span>
                    </Link>
                  )}
                  {booking.status === 'success' && (
                    <button
                      type="button"
                      onClick={() => openTicket(booking)}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Lihat E-Ticket</span>
                    </button>
                  )}
                  {booking.status === 'cancelled' && (
                    <span className="text-[11px] text-slate-400 text-center sm:text-right">
                      Pesanan dibatalkan
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
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
