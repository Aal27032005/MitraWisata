'use client'

import { useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  X, Compass, CalendarCheck, Users, ReceiptText,
  CheckCircle2, Printer, MapPin, UserRound,
} from 'lucide-react'

export interface ETicketData {
  bookingId: string
  namaWisata: string
  fotoWisataUrl: string | null
  namaCustomer: string
  tanggalKunjungan: string
  jumlahTiket: number
  totalHarga: number
  namaGuide: string | null
  createdAt: string
}

interface Props {
  ticket: ETicketData
  onClose: () => void
}

export default function ETicketModal({ ticket, onClose }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null)

  // Tutup modal saat klik backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) onClose()
  }

  // Tutup modal saat tekan Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Lock scroll saat modal terbuka — dilepas saat unmount
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const shortId = ticket.bookingId.slice(0, 8).toUpperCase()
  const tanggalFormatted = new Date(ticket.tanggalKunjungan).toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const createdFormatted = new Date(ticket.createdAt).toLocaleDateString('id-ID', {
    dateStyle: 'medium',
  })
  const qrValue = `https://mitrawisata.app/tiket/${ticket.bookingId}`

  return (
    <>
      {/* ── Backdrop + modal — disembunyikan saat print ── */}
      <div
        ref={backdropRef}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        id="eticket-modal-backdrop"
      >
        {/* Modal wrapper scrollable */}
        <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl bg-white dark:bg-slate-900">
          {/* Tombol tutup */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
            aria-label="Tutup E-Ticket"
            id="eticket-close-btn"
          >
            <X className="w-4 h-4" />
          </button>

          {/* ── Konten tiket — ini yang dicetak via #printable-ticket-card ── */}
          <div id="printable-ticket-card">
            <TicketContent
              ticket={ticket}
              shortId={shortId}
              tanggalFormatted={tanggalFormatted}
              createdFormatted={createdFormatted}
              qrValue={qrValue}
            />
          </div>

          {/* ── Tombol Cetak — disembunyikan saat print via CSS ── */}
          <div className="px-6 pb-6 pt-2" id="eticket-print-btn-wrapper">
            <button
              onClick={() => window.print()}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold text-sm py-3 rounded-xl transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan sebagai PDF</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-komponen konten tiket — dirender di modal DAN di area cetak
// ─────────────────────────────────────────────────────────────────────────────
function TicketContent({
  ticket, shortId, tanggalFormatted, createdFormatted, qrValue,
}: {
  ticket: ETicketData
  shortId: string
  tanggalFormatted: string
  createdFormatted: string
  qrValue: string
}) {
  return (
    <div className="p-6 space-y-0">

      {/* ── Header tiket ── */}
      <div className="bg-emerald-500 rounded-t-2xl px-6 py-5 text-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-950/20 flex items-center justify-center">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-black text-base tracking-tight text-white">MitraWisata</div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-emerald-100">
              E-Ticket Resmi
            </div>
          </div>
        </div>
        {/* Badge status */}
        <div className="flex items-center gap-1.5 bg-white/20 border border-white/30 rounded-full px-3 py-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          <span className="text-[10px] font-black uppercase tracking-wider text-white">LUNAS / VALID</span>
        </div>
      </div>

      {/* ── Foto destinasi + nama ── */}
      <div className="border-x border-slate-200 dark:border-slate-700">
        {ticket.fotoWisataUrl ? (
          <div className="relative h-36 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ticket.fotoWisataUrl}
              alt={ticket.namaWisata}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <div className="flex items-center gap-1.5 text-white">
                <MapPin className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
                <span className="font-black text-base truncate drop-shadow">{ticket.namaWisata}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-24 bg-emerald-500/10 flex items-center justify-center gap-2 border-y border-slate-200 dark:border-slate-700">
            <Compass className="w-6 h-6 text-emerald-400" />
            <span className="font-black text-lg text-slate-800 dark:text-slate-100">{ticket.namaWisata}</span>
          </div>
        )}
      </div>

      {/* ── Garis robek ── */}
      <div className="border-x border-slate-200 dark:border-slate-700 flex items-center">
        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 -ml-2.5 flex-shrink-0" />
        <div className="flex-1 border-t-2 border-dashed border-slate-200 dark:border-slate-700 mx-1" />
        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 -mr-2.5 flex-shrink-0" />
      </div>

      {/* ── Detail tiket ── */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-b-2xl bg-white dark:bg-slate-900 px-5 py-5">
        {/* Grid info utama */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-5">
          <div>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
              <UserRound className="w-3 h-3" />
              Nama Pemesan
            </div>
            <div className="font-bold text-sm text-slate-950 dark:text-white">{ticket.namaCustomer}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
              <CalendarCheck className="w-3 h-3" />
              Tanggal Kunjungan
            </div>
            <div className="font-bold text-sm text-slate-950 dark:text-white">{tanggalFormatted}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
              <Users className="w-3 h-3" />
              Jumlah Tiket
            </div>
            <div className="font-bold text-sm text-slate-950 dark:text-white">{ticket.jumlahTiket} pax</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
              <UserRound className="w-3 h-3" />
              Tour Guide
            </div>
            <div className="font-bold text-sm text-slate-950 dark:text-white">
              {ticket.namaGuide ?? 'Tanpa Guide'}
            </div>
          </div>
        </div>

        {/* Total harga */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center justify-between mb-5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Total Dibayar</span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
            Rp {ticket.totalHarga.toLocaleString('id-ID')}
          </span>
        </div>

        {/* QR code + kode booking */}
        <div className="flex items-center gap-5 border-t border-dashed border-slate-200 dark:border-slate-700 pt-5">
          {/* QR Code */}
          <div className="flex-shrink-0 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <QRCodeSVG
              value={qrValue}
              size={88}
              bgColor="#ffffff"
              fgColor="#0f172a"
              level="M"
            />
          </div>
          {/* Kode & meta */}
          <div className="flex-1 space-y-2">
            <div>
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                <ReceiptText className="w-3 h-3" />
                Kode Tiket
              </div>
              <div className="font-mono font-black text-xl text-slate-950 tracking-widest dark:text-white">
                {shortId}
              </div>
            </div>
            <div className="text-[9px] text-slate-400 leading-relaxed break-all font-mono">
              {ticket.bookingId}
            </div>
            <div className="text-[10px] text-slate-400">
              Diterbitkan: {createdFormatted}
            </div>
          </div>
        </div>

        {/* Footer disclaimer */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[9px] text-slate-400 leading-relaxed">
            Tunjukkan tiket ini kepada petugas destinasi wisata sebagai bukti pemesanan yang sah.
            <br />
            MitraWisata · Platform Wisata &amp; Tour Guide SaaS · mitrawisata.app
          </p>
        </div>
      </div>
    </div>
  )
}
