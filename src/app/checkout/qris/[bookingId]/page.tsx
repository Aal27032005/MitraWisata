import { createClient } from '@/lib/supabase/server'
import { simulateQrisPaymentAction } from '../../actions'
import { ArrowLeft, Calendar, CheckCircle, Compass, QrCode, ShieldCheck, UserRound } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

export const revalidate = 0

interface PageProps {
  params: Promise<{ bookingId: string }>
  searchParams: Promise<{ error?: string }>
}

interface CheckoutBooking {
  id: string
  tanggal_kunjungan: string
  jumlah_tiket: number
  total_harga: number
  status: string
  wisata: {
    nama_wisata: string
    harga_tiket: number
  } | null
  guides: {
    tarif_per_hari: number
    users: {
      nama_lengkap: string
    } | null
  } | null
}

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString('id-ID')}`
}

export default async function QrisCheckoutPage({ params, searchParams }: PageProps) {
  const { bookingId } = await params
  const { error } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data } = await supabase
    .from('bookings')
    .select(`
      id,
      tanggal_kunjungan,
      jumlah_tiket,
      total_harga,
      status,
      wisata ( nama_wisata, harga_tiket ),
      guides ( tarif_per_hari, users ( nama_lengkap ) )
    `)
    .eq('id', bookingId)
    .eq('customer_id', user.id)
    .single()

  const booking = data as unknown as CheckoutBooking | null

  if (!booking) {
    notFound()
  }

  if (booking.status === 'success') {
    redirect(`/checkout/success?booking_id=${booking.id}`)
  }

  const ticketSubtotal = (booking.wisata?.harga_tiket || 0) * booking.jumlah_tiket
  const guideFee = booking.guides?.tarif_per_hari || 0
  const qrSeed = `MITRAWISATA|${booking.id}|${booking.total_harga}|QRIS-DEMO`

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
      <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />

      <header className="relative z-10 border-b border-slate-200 bg-white/80 dark:border-slate-900 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard/customer" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard
          </Link>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            QRIS Demo
          </span>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:px-8">
        <section className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:p-8 dark:border-slate-800 dark:bg-slate-900/40 dark:shadow-black/30">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <QrCode className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl dark:text-white">Invoice Pembayaran QRIS</h1>
                <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">Scan QRIS demo atau klik simulasi sukses untuk kebutuhan presentasi.</p>
              </div>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-600 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-850 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">ID Transaksi</span>
                <span className="text-right font-mono text-xs font-bold text-slate-950 dark:text-white">{booking.id}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Compass className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />Destinasi</span>
                <span className="text-right text-sm font-bold text-slate-950 dark:text-white">{booking.wisata?.nama_wisata || 'Wisata'}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Calendar className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />Tanggal</span>
                <span className="text-right text-sm font-bold text-slate-950 dark:text-white">{new Date(booking.tanggal_kunjungan).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><UserRound className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />Tour Guide</span>
                <span className="text-right text-sm font-bold text-slate-950 dark:text-white">{booking.guides?.users?.nama_lengkap || 'Tanpa Guide'}</span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/30 p-5 space-y-3 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>Tiket wisata ({booking.jumlah_tiket} pax)</span>
                <span>{formatRupiah(ticketSubtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>Biaya tour guide</span>
                <span>{formatRupiah(guideFee)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-4 text-lg font-black text-slate-950 dark:text-white">
                <span>Total Pembayaran</span>
                <span className="text-emerald-500 dark:text-emerald-400">{formatRupiah(booking.total_harga)}</span>
              </div>
            </div>
          </div>
        </section>

        <aside className="lg:col-span-5">
          <div className="sticky top-8 rounded-3xl border border-slate-200 bg-white/85 p-6 text-center shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-black/40">
            <div className="mx-auto mb-5 flex h-64 w-64 items-center justify-center rounded-3xl bg-white p-4 shadow-xl">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrSeed)}`}
                alt="QRIS pembayaran MitraWisata"
                className="h-full w-full rounded-2xl object-contain"
              />
            </div>
            <div className="mb-5 space-y-1">
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-950 dark:text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                QRIS Simulated Gateway
              </div>
              <p className="text-xs leading-relaxed text-slate-550 dark:text-slate-500">Kode QR dibuat dinamis dari ID booking dan total transaksi.</p>
            </div>
            <form action={simulateQrisPaymentAction}>
              <input type="hidden" name="booking_id" value={booking.id} />
              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/10 transition-colors hover:bg-emerald-600 active:bg-emerald-700">
                <CheckCircle className="h-5 w-5" />
                Simulasi Bayar Sukses
              </button>
            </form>
            <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-200">
              Status akan diperbarui menjadi <strong>Lunas</strong> untuk demo transaksi.
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
