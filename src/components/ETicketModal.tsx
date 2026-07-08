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

// ─────────────────────────────────────────────────────────────────────────────
// CSS INLINE untuk dokumen iframe — sepenuhnya terisolasi dari dark mode,
// Tailwind, stacking context, dan semua style global halaman utama.
// ─────────────────────────────────────────────────────────────────────────────
function buildTicketHtml(params: {
  namaWisata: string
  fotoWisataUrl: string | null
  namaCustomer: string
  tanggalFormatted: string
  jumlahTiket: number
  namaGuide: string | null
  totalHarga: number
  shortId: string
  bookingId: string
  createdFormatted: string
  qrDataUrl: string
}): string {
  const {
    namaWisata, fotoWisataUrl, namaCustomer, tanggalFormatted,
    jumlahTiket, namaGuide, totalHarga, shortId, bookingId,
    createdFormatted, qrDataUrl,
  } = params

  const fotoHtml = fotoWisataUrl
    ? `<div class="foto-wrap">
        <img src="${fotoWisataUrl}" alt="${namaWisata}" class="foto-img" />
        <div class="foto-overlay"></div>
        <div class="foto-label">📍 ${namaWisata}</div>
       </div>`
    : `<div class="foto-placeholder">🧭 ${namaWisata}</div>`

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>E-Ticket MitraWisata – ${shortId}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #ffffff;
      color: #0f172a;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .ticket {
      max-width: 520px;
      margin: 0 auto;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }

    /* Header hijau */
    .header {
      background: #10b981;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header-brand { display: flex; align-items: center; gap: 10px; }
    .header-icon {
      width: 36px; height: 36px;
      background: rgba(0,0,0,0.15);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
    }
    .header-name { font-weight: 900; font-size: 16px; color: #ffffff; letter-spacing: -0.3px; }
    .header-sub  { font-size: 9px; font-weight: 600; text-transform: uppercase;
                   letter-spacing: 2px; color: #d1fae5; margin-top: 1px; }
    .header-badge {
      display: flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 999px; padding: 4px 12px;
      font-size: 9px; font-weight: 900;
      text-transform: uppercase; letter-spacing: 1px; color: #ffffff;
    }

    /* Foto destinasi */
    .foto-wrap { position: relative; height: 130px; overflow: hidden; }
    .foto-img  { width: 100%; height: 100%; object-fit: cover; display: block; }
    .foto-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.65), transparent);
    }
    .foto-label {
      position: absolute; bottom: 10px; left: 16px; right: 16px;
      color: #ffffff; font-weight: 900; font-size: 15px;
      text-shadow: 0 1px 4px rgba(0,0,0,0.5);
    }
    .foto-placeholder {
      height: 80px; background: #f0fdf4;
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: 16px; color: #065f46;
      border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;
    }

    /* Garis robek */
    .tear {
      display: flex; align-items: center;
      border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;
    }
    .tear-circle {
      width: 18px; height: 18px; border-radius: 50%;
      background: #f8fafc; border: 1px solid #e2e8f0; flex-shrink: 0;
    }
    .tear-circle-l { margin-left: -9px; }
    .tear-circle-r { margin-right: -9px; }
    .tear-line {
      flex: 1; border-top: 2px dashed #e2e8f0; margin: 0 4px;
    }

    /* Body detail */
    .body {
      border: 1px solid #e2e8f0;
      border-top: none; border-radius: 0 0 16px 16px;
      background: #ffffff; padding: 20px;
    }

    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; margin-bottom: 16px; }
    .field-label {
      font-size: 9px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1px; color: #94a3b8; margin-bottom: 2px;
    }
    .field-value { font-weight: 700; font-size: 13px; color: #0f172a; }

    /* Total harga */
    .total-box {
      background: #f0fdf4; border: 1px solid #bbf7d0;
      border-radius: 10px; padding: 10px 14px;
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 16px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .total-label { font-size: 10px; font-weight: 700; text-transform: uppercase;
                   letter-spacing: 1px; color: #065f46; }
    .total-value { font-weight: 900; font-size: 18px; color: #059669; }

    /* QR + kode */
    .qr-row { display: flex; gap: 16px; padding-top: 16px;
              border-top: 2px dashed #e2e8f0; }
    .qr-img { width: 90px; height: 90px; flex-shrink: 0;
              border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px;
              background: #ffffff; }
    .qr-meta { flex: 1; }
    .kode-tiket { font-family: monospace; font-weight: 900; font-size: 22px;
                  color: #0f172a; letter-spacing: 3px; margin-bottom: 4px; }
    .kode-full  { font-family: monospace; font-size: 8px; color: #94a3b8;
                  word-break: break-all; margin-bottom: 4px; }
    .kode-date  { font-size: 10px; color: #94a3b8; }

    /* Footer */
    .footer {
      margin-top: 14px; padding-top: 14px;
      border-top: 1px solid #f1f5f9;
      text-align: center; font-size: 8px;
      color: #94a3b8; line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="ticket">

    <div class="header">
      <div class="header-brand">
        <div class="header-icon">🧭</div>
        <div>
          <div class="header-name">MitraWisata</div>
          <div class="header-sub">E-Ticket Resmi</div>
        </div>
      </div>
      <div class="header-badge">✓ LUNAS / VALID</div>
    </div>

    ${fotoHtml}

    <div class="tear">
      <div class="tear-circle tear-circle-l"></div>
      <div class="tear-line"></div>
      <div class="tear-circle tear-circle-r"></div>
    </div>

    <div class="body">
      <div class="grid">
        <div>
          <div class="field-label">Nama Pemesan</div>
          <div class="field-value">${namaCustomer}</div>
        </div>
        <div>
          <div class="field-label">Tanggal Kunjungan</div>
          <div class="field-value">${tanggalFormatted}</div>
        </div>
        <div>
          <div class="field-label">Jumlah Tiket</div>
          <div class="field-value">${jumlahTiket} pax</div>
        </div>
        <div>
          <div class="field-label">Tour Guide</div>
          <div class="field-value">${namaGuide ?? 'Tanpa Guide'}</div>
        </div>
      </div>

      <div class="total-box">
        <span class="total-label">Total Dibayar</span>
        <span class="total-value">Rp ${totalHarga.toLocaleString('id-ID')}</span>
      </div>

      <div class="qr-row">
        <img src="${qrDataUrl}" alt="QR Code Tiket" class="qr-img" />
        <div class="qr-meta">
          <div class="field-label">Kode Tiket</div>
          <div class="kode-tiket">${shortId}</div>
          <div class="kode-full">${bookingId}</div>
          <div class="kode-date">Diterbitkan: ${createdFormatted}</div>
        </div>
      </div>

      <div class="footer">
        Tunjukkan tiket ini kepada petugas destinasi wisata sebagai bukti pemesanan yang sah.<br/>
        MitraWisata · Platform Wisata &amp; Tour Guide SaaS · mitrawisata.app
      </div>
    </div>

  </div>
</body>
</html>`
}

export default function ETicketModal({ ticket, onClose }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const qrRef = useRef<SVGSVGElement>(null)

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

  // Lock scroll saat modal terbuka
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

  // ── Fungsi cetak via iframe tersembunyi ──────────────────────────────────
  // Strategi: buat iframe baru di luar DOM modal, suntikkan HTML tiket yang
  // sepenuhnya berdiri sendiri (CSS inline, tanpa Tailwind, tanpa dark mode),
  // panggil print() pada iframe, lalu hapus iframe setelah selesai.
  // Ini mengisolasi cetak 100% dari stacking context dan tema halaman utama.
  const handlePrint = () => {
    // 1. Ambil QR code sebagai data URL dari SVG yang sudah dirender
    let qrDataUrl = ''
    if (qrRef.current) {
      const svgEl = qrRef.current
      const serialized = new XMLSerializer().serializeToString(svgEl)
      const encoded = btoa(unescape(encodeURIComponent(serialized)))
      qrDataUrl = `data:image/svg+xml;base64,${encoded}`
    }

    // 2. Bangun HTML dokumen tiket yang lengkap dan terisolasi
    const html = buildTicketHtml({
      namaWisata: ticket.namaWisata,
      fotoWisataUrl: ticket.fotoWisataUrl,
      namaCustomer: ticket.namaCustomer,
      tanggalFormatted,
      jumlahTiket: ticket.jumlahTiket,
      namaGuide: ticket.namaGuide,
      totalHarga: ticket.totalHarga,
      shortId,
      bookingId: ticket.bookingId,
      createdFormatted,
      qrDataUrl,
    })

    // 3. Buat iframe tersembunyi, suntikkan HTML, panggil print
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.top = '-9999px'
    iframe.style.left = '-9999px'
    iframe.style.width = '1px'
    iframe.style.height = '1px'
    iframe.style.opacity = '0'
    iframe.style.border = 'none'
    iframe.setAttribute('aria-hidden', 'true')
    document.body.appendChild(iframe)

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) {
      document.body.removeChild(iframe)
      return
    }

    iframeDoc.open()
    iframeDoc.write(html)
    iframeDoc.close()

    // 4. Tunggu resource gambar (foto wisata) dimuat sebelum print
    const win = iframe.contentWindow
    if (!win) {
      document.body.removeChild(iframe)
      return
    }

    const doPrint = () => {
      win.focus()
      win.print()
      // Hapus iframe setelah dialog print ditutup (afterprint atau timeout)
      const cleanup = () => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe)
        }
      }
      win.addEventListener('afterprint', cleanup, { once: true })
      // Fallback timeout jika afterprint tidak fired (Safari)
      setTimeout(cleanup, 5000)
    }

    // Beri sedikit waktu untuk render sebelum print
    setTimeout(doPrint, 300)
  }

  return (
    <>
      <div
        ref={backdropRef}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      >
        {/* Modal wrapper scrollable */}
        <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl bg-white dark:bg-slate-900">
          {/* Tombol tutup */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
            aria-label="Tutup E-Ticket"
          >
            <X className="w-4 h-4" />
          </button>

          {/* ── Konten tiket (tampilan di modal) ── */}
          <div id="printable-ticket-card">
            <TicketContent
              ticket={ticket}
              shortId={shortId}
              tanggalFormatted={tanggalFormatted}
              createdFormatted={createdFormatted}
              qrValue={qrValue}
              qrRef={qrRef}
            />
          </div>

          {/* ── Tombol Cetak ── */}
          <div className="px-6 pb-6 pt-2">
            <button
              onClick={handlePrint}
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
// Sub-komponen konten tiket — tampilan di dalam modal
// ─────────────────────────────────────────────────────────────────────────────
function TicketContent({
  ticket, shortId, tanggalFormatted, createdFormatted, qrValue, qrRef,
}: {
  ticket: ETicketData
  shortId: string
  tanggalFormatted: string
  createdFormatted: string
  qrValue: string
  qrRef: React.RefObject<SVGSVGElement | null>
}) {
  return (
    <div className="p-6 space-y-0">

      {/* Header tiket */}
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
        <div className="flex items-center gap-1.5 bg-white/20 border border-white/30 rounded-full px-3 py-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          <span className="text-[10px] font-black uppercase tracking-wider text-white">LUNAS / VALID</span>
        </div>
      </div>

      {/* Foto destinasi */}
      <div className="border-x border-slate-200 dark:border-slate-700">
        {ticket.fotoWisataUrl ? (
          <div className="relative h-36 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ticket.fotoWisataUrl} alt={ticket.namaWisata} className="w-full h-full object-cover" />
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

      {/* Garis robek */}
      <div className="border-x border-slate-200 dark:border-slate-700 flex items-center">
        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 -ml-2.5 flex-shrink-0" />
        <div className="flex-1 border-t-2 border-dashed border-slate-200 dark:border-slate-700 mx-1" />
        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 -mr-2.5 flex-shrink-0" />
      </div>

      {/* Detail tiket */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-b-2xl bg-white dark:bg-slate-900 px-5 py-5">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-5">
          <div>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
              <UserRound className="w-3 h-3" />Nama Pemesan
            </div>
            <div className="font-bold text-sm text-slate-950 dark:text-white">{ticket.namaCustomer}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
              <CalendarCheck className="w-3 h-3" />Tanggal Kunjungan
            </div>
            <div className="font-bold text-sm text-slate-950 dark:text-white">{tanggalFormatted}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
              <Users className="w-3 h-3" />Jumlah Tiket
            </div>
            <div className="font-bold text-sm text-slate-950 dark:text-white">{ticket.jumlahTiket} pax</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
              <UserRound className="w-3 h-3" />Tour Guide
            </div>
            <div className="font-bold text-sm text-slate-950 dark:text-white">
              {ticket.namaGuide ?? 'Tanpa Guide'}
            </div>
          </div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center justify-between mb-5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Total Dibayar</span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
            Rp {ticket.totalHarga.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="flex items-center gap-5 border-t border-dashed border-slate-200 dark:border-slate-700 pt-5">
          {/* QR Code — ref diteruskan agar bisa di-serialize ke data URL saat cetak */}
          <div className="flex-shrink-0 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <QRCodeSVG
              ref={qrRef}
              value={qrValue}
              size={88}
              bgColor="#ffffff"
              fgColor="#0f172a"
              level="M"
            />
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                <ReceiptText className="w-3 h-3" />Kode Tiket
              </div>
              <div className="font-mono font-black text-xl text-slate-950 tracking-widest dark:text-white">
                {shortId}
              </div>
            </div>
            <div className="text-[9px] text-slate-400 leading-relaxed break-all font-mono">
              {ticket.bookingId}
            </div>
            <div className="text-[10px] text-slate-400">Diterbitkan: {createdFormatted}</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[9px] text-slate-400 leading-relaxed">
            Tunjukkan tiket ini kepada petugas destinasi wisata sebagai bukti pemesanan yang sah.<br />
            MitraWisata · Platform Wisata &amp; Tour Guide SaaS · mitrawisata.app
          </p>
        </div>
      </div>
    </div>
  )
}
