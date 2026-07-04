import { createClient } from '@/lib/supabase/server'
import { ArrowRight, Calendar, CheckCircle2, Compass, ReceiptText, Sparkles, UserRound } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const revalidate = 0

interface PageProps {
  searchParams: Promise<{ booking_id?: string }>
}

interface SuccessBooking {
  id: string
  tanggal_kunjungan: string
  jumlah_tiket: number
  total_harga: number
  status: string
  wisata: {
    nama_wisata: string
  } | null
  guides: {
    users: {
      nama_lengkap: string
    } | null
  } | null
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { booking_id } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let booking: SuccessBooking | null = null

  if (booking_id) {
    const { data } = await supabase
      .from('bookings')
      .select(`
        id,
        tanggal_kunjungan,
        jumlah_tiket,
        total_harga,
        status,
        wisata ( nama_wisata ),
        guides ( users ( nama_lengkap ) )
      `)
      .eq('id', booking_id)
      .eq('customer_id', user.id)
      .single()

    booking = data as unknown as SuccessBooking | null
  }

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
      <div className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[130px]" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-blue-500/10 blur-[110px]" />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <section className="w-full rounded-[2rem] border border-slate-200 bg-white/85 p-6 text-center shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:p-10 dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-black/40">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 shadow-2xl shadow-emerald-500/10">
            <CheckCircle2 className="h-14 w-14 text-emerald-600 dark:text-emerald-400 animate-pulse" />
          </div>

          <div className="mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              Pembayaran Berhasil
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">Booking Tiket &amp; Pembayaran Berhasil!</h1>
            <p className="mx-auto max-w-xl text-sm leading-7 text-slate-555 dark:text-slate-400">
              Transaksi Anda sudah tercatat sebagai lunas. Simpan halaman ini sebagai bukti demo pembayaran QRIS MitraWisata.
            </p>
          </div>

          {booking ? (
            <div className="mb-8 rounded-3xl border border-slate-200 bg-slate-50/50 p-5 text-left space-y-4 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-850">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"><ReceiptText className="h-4 w-4 text-emerald-550 dark:text-emerald-400" />ID Booking</span>
                <span className="text-right font-mono text-xs font-bold text-slate-950 dark:text-white">{booking.id}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <Compass className="mb-3 h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Destinasi</div>
                  <div className="mt-1 text-sm font-bold text-slate-950 dark:text-white">{booking.wisata?.nama_wisata || 'Wisata'}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <Calendar className="mb-3 h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tanggal</div>
                  <div className="mt-1 text-sm font-bold text-slate-950 dark:text-white">{new Date(booking.tanggal_kunjungan).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <UserRound className="mb-3 h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tour Guide</div>
                  <div className="mt-1 text-sm font-bold text-slate-950 dark:text-white">{booking.guides?.users?.nama_lengkap || 'Tanpa Guide'}</div>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <CheckCircle2 className="mb-3 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Total Lunas</div>
                  <div className="mt-1 text-lg font-black text-emerald-600 dark:text-emerald-400">Rp {booking.total_harga.toLocaleString('id-ID')}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
              Ringkasan booking tidak ditemukan, tetapi halaman sukses pembayaran berhasil dimuat.
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/dashboard/customer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-emerald-600">
              Lihat Riwayat Booking
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/wisata" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900">
              Jelajah Wisata Lain
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
