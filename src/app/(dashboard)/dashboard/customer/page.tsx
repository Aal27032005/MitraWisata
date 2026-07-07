import { createClient } from '@/lib/supabase/server'
import { Calendar, Compass, ShoppingBag, ArrowRight, CheckCircle2, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import CustomerDashboardClient, { type CustomerBookingClient } from '@/components/CustomerDashboardClient'

interface PageProps {
  searchParams: Promise<{ success_booking?: string }>
}

interface CustomerBooking {
  id: string
  tanggal_kunjungan: string
  jumlah_tiket: number
  total_harga: number
  status: string
  created_at: string
  wisata: {
    nama_wisata: string
    harga_tiket: number
    foto_url: string | null
    foto_urls: unknown
  } | null
  guides: {
    tarif_per_hari: number
    users: {
      nama_lengkap: string
    } | null
  } | null
}

export const revalidate = 0

export default async function CustomerDashboardPage({ searchParams }: PageProps) {
  const { success_booking } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Ambil nama customer untuk ditampilkan di E-Ticket
  const { data: userData } = await supabase
    .from('users')
    .select('nama_lengkap')
    .eq('id', user.id)
    .single()
  const namaCustomer = userData?.nama_lengkap || user.email || 'Wisatawan'

  // 1. Ambil data semua booking milik customer ini
  let bookings: CustomerBooking[] = []
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        tanggal_kunjungan,
        jumlah_tiket,
        total_harga,
        status,
        created_at,
        wisata ( nama_wisata, harga_tiket, foto_url, foto_urls ),
        guides ( tarif_per_hari, users ( nama_lengkap ) )
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) {
      bookings = (data || []) as unknown as CustomerBooking[]
    }
  } catch (err) {
    console.error('Gagal memuat riwayat booking:', err)
  }

  // 2. Ambil detail booking spesifik jika baru saja sukses melakukan pemesanan
  let newBookingDetails: CustomerBooking | null = null
  if (success_booking) {
    const { data } = await supabase
      .from('bookings')
      .select(`
        id,
        tanggal_kunjungan,
        jumlah_tiket,
        total_harga,
        status,
        created_at,
        wisata ( nama_wisata, harga_tiket, foto_url, foto_urls ),
        guides ( tarif_per_hari, users ( nama_lengkap ) )
      `)
      .eq('id', success_booking)
      .eq('customer_id', user.id)
      .single()
    newBookingDetails = data as unknown as CustomerBooking | null
  }

  // 3. Normalisasi data ke format yang dipakai CustomerDashboardClient
  const bookingsForClient: CustomerBookingClient[] = bookings.map((b) => {
    const fotoUrls = Array.isArray(b.wisata?.foto_urls)
      ? (b.wisata!.foto_urls as unknown[]).filter((u): u is string => typeof u === 'string')
      : []
    const fotoWisataUrl = fotoUrls[0] ?? b.wisata?.foto_url ?? null
    return {
      id: b.id,
      tanggal_kunjungan: b.tanggal_kunjungan,
      jumlah_tiket: b.jumlah_tiket,
      total_harga: b.total_harga,
      status: b.status,
      created_at: b.created_at,
      namaWisata: b.wisata?.nama_wisata ?? 'Wisata',
      fotoWisataUrl,
      namaCustomer,
      namaGuide: b.guides?.users?.nama_lengkap ?? null,
    }
  })

  return (
    <div className="space-y-8 relative">
      {/* SUCCESS CONFIRMATION BANNER */}
      {newBookingDetails && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-emerald-400">Transaksi Berhasil Dibuat!</h2>
              <p className="text-slate-700 text-xs leading-relaxed max-w-xl dark:text-slate-300">
                Tiket untuk <strong className="text-slate-950 dark:text-white">{newBookingDetails.wisata?.nama_wisata}</strong>{newBookingDetails.guides?.users?.nama_lengkap ? <> dengan guide <strong className="text-slate-950 dark:text-white">{newBookingDetails.guides.users.nama_lengkap}</strong></> : null} pada tanggal {new Date(newBookingDetails.tanggal_kunjungan).toLocaleDateString('id-ID', { dateStyle: 'medium' })} telah dibuat sebagai satu transaksi dengan status <strong>Pending</strong>.
              </p>
              <div className="text-[10px] text-slate-500">ID Pesanan: {newBookingDetails.id}</div>
            </div>
          </div>
          <Link
            href={`/checkout/qris/${newBookingDetails.id}`}
            className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 text-xs font-bold px-5 py-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10 shrink-0"
          >
            <ArrowRight className="w-4.5 h-4.5" />
            <span>Bayar via QRIS</span>
          </Link>
        </div>
      )}

      {/* TOMBOL KEMBALI */}
      <Link
        href="/wisata"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Kembali ke Jelajah Wisata
      </Link>

      {/* DASHBOARD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Halo, Selamat Datang!</h1>
          <p className="text-slate-600 text-sm mt-1 dark:text-slate-400">Cari destinasi seru berikutnya, sewa tour guide berpengalaman, dan pantau pemesanan Anda.</p>
        </div>
        <Link
          href="/wisata"
          className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 text-sm font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/5 cursor-pointer"
        >
          <Compass className="w-4 h-4" />
          <span>Jelajah Wisata &amp; Guide</span>
        </Link>
      </div>

      {/* BOOKING HISTORY TABLE */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2 dark:text-white">
          <ShoppingBag className="w-5 h-5 text-emerald-400" />
          <span>Riwayat Pemesanan Anda</span>
        </h2>

        {bookings.length === 0 ? (
          <div className="border border-slate-200 bg-white/80 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 dark:border-slate-900 dark:bg-slate-900/20">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-900 dark:text-slate-600 dark:border-slate-800">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Belum Ada Riwayat Pemesanan</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
              Anda belum memesan tiket wisata apa pun. Temukan petualangan Anda hari ini dan buat pemesanan tiket dengan mudah!
            </p>
            <div className="pt-2">
              <Link
                href="/wisata"
                className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg dark:bg-slate-900 dark:hover:bg-slate-850 dark:border-slate-800 dark:text-slate-300"
              >
                Cari Tempat Wisata Sekarang
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <CustomerDashboardClient bookings={bookingsForClient} />
        )}
      </div>
    </div>
  )
}
