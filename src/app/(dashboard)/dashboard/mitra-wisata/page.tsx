import { createClient } from '@/lib/supabase/server'
import WisataDashboardClient from './WisataDashboardClient'
import { getSubscriptionAction } from '@/app/subscription/actions'
import SubscriptionGate from '@/components/SubscriptionGate'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

type WisataRow = {
  id: string
  mitra_id: string
  nama_wisata: string
  deskripsi: string
  harga_tiket: number
  kuota_harian: number
  foto_url: string | null
  foto_urls: unknown
}

export type BookingRow = {
  id: string
  tanggal_kunjungan: string
  jumlah_tiket: number
  total_harga: number
  status: string
  created_at: string
  wisata: { nama_wisata: string } | null
  customer: { nama_lengkap: string; email: string } | null
}

function normalizeFotoUrls(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
}

export default async function MitraWisataDashboardPage({ searchParams }: PageProps) {
  const { tab } = await searchParams
  const activeTab = tab || 'beranda'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ── Guard: pastikan user sudah login ──────────────────────────────────
  if (!user) {
    redirect('/login')
  }

  // ── Validasi Subscription ────────────────────────────────────────────
  // Jika subscription tidak active, tampilkan SubscriptionGate sebelum dashboard.
  const subscription = await getSubscriptionAction()
  const isActive = subscription?.status === 'active'
  if (!isActive) {
    return (
      <SubscriptionGate
        status={subscription?.status === 'expired' ? 'expired' : 'inactive'}
        roleLabel="Mitra Wisata"
        expiredAt={subscription?.expires_at ?? null}
      />
    )
  }

  let wisataList: {
    id: string
    mitra_id: string
    nama_wisata: string
    deskripsi: string
    harga_tiket: number
    kuota_harian: number
    foto_url: string | null
    foto_urls: string[]
  }[] = []

  let bookings: BookingRow[] = []
  let totalTiketTerjual = 0
  let totalPendapatan = 0

  if (user) {
    // ── Fetch destinasi wisata milik mitra ───────────────────────────────
    const { data: wisataData, error: wisataError } = await supabase
      .from('wisata')
      .select('id,mitra_id,nama_wisata,deskripsi,harga_tiket,kuota_harian,foto_url,foto_urls,created_at')
      .eq('mitra_id', user.id)
      .order('created_at', { ascending: false })

    if (wisataError) {
      console.error('Gagal memuat wisata mitra:', wisataError.message)
    }

    wisataList = ((wisataData || []) as WisataRow[]).map((wisata) => ({
      id: wisata.id,
      mitra_id: wisata.mitra_id,
      nama_wisata: wisata.nama_wisata,
      deskripsi: wisata.deskripsi,
      harga_tiket: wisata.harga_tiket,
      kuota_harian: wisata.kuota_harian,
      foto_url: wisata.foto_url,
      foto_urls: normalizeFotoUrls(wisata.foto_urls),
    }))

    const wisataIds = wisataList.map((w) => w.id)

    if (wisataIds.length > 0) {
      // ── Kalkulasi statistik: selalu fetch, join wisata untuk hitung porsi tiket saja ──
      // total_harga di DB = harga_tiket × jumlah_tiket + tarif_guide (jika ada).
      // Mitra Wisata hanya berhak atas bagian tiket → hitung dari harga_tiket wisata × jumlah_tiket.
      // Filter status 'success' sesuai constraint DB: pending | success | cancelled
      const { data: statsData, error: statsError } = await supabase
        .from('bookings')
        .select('jumlah_tiket, wisata:wisata_id ( harga_tiket )')
        .in('wisata_id', wisataIds)
        .eq('status', 'success')

      if (statsError) {
        console.error('Gagal memuat statistik booking:', statsError.message)
      } else {
        type StatsRow = { jumlah_tiket: number; wisata: { harga_tiket: number } | null }
        const rows = (statsData || []) as unknown as StatsRow[]
        totalTiketTerjual = rows.reduce((sum, r) => sum + r.jumlah_tiket, 0)
        // Pendapatan mitra wisata = harga tiket destinasi × jumlah tiket (tanpa biaya guide)
        totalPendapatan = rows.reduce((sum, r) => {
          const hargaTiket = r.wisata?.harga_tiket ?? 0
          return sum + hargaTiket * r.jumlah_tiket
        }, 0)
      }

      // ── Fetch riwayat bookings lengkap — hanya saat tab riwayat aktif ──
      // Kolom yang ditampilkan di tabel riwayat: nama customer, nama destinasi,
      // jumlah tiket, dan pendapatan TIKET (bukan total_harga yang sudah termasuk guide).
      if (activeTab === 'riwayat') {
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            tanggal_kunjungan,
            jumlah_tiket,
            status,
            created_at,
            wisata:wisata_id ( nama_wisata, harga_tiket ),
            customer:customer_id ( nama_lengkap, email )
          `)
          .in('wisata_id', wisataIds)
          .order('created_at', { ascending: false })

        if (bookingsError) {
          console.error('Gagal memuat riwayat pesanan:', bookingsError.message)
        } else {
          // Hitung total_harga per baris = harga_tiket × jumlah_tiket (porsi mitra wisata saja)
          const rawRows = (bookingsData || []) as unknown as Array<{
            id: string
            tanggal_kunjungan: string
            jumlah_tiket: number
            status: string
            created_at: string
            wisata: { nama_wisata: string; harga_tiket: number } | null
            customer: { nama_lengkap: string; email: string } | null
          }>
          bookings = rawRows.map((r) => ({
            id: r.id,
            tanggal_kunjungan: r.tanggal_kunjungan,
            jumlah_tiket: r.jumlah_tiket,
            // total_harga yang dikirim ke client = porsi tiket saja
            total_harga: (r.wisata?.harga_tiket ?? 0) * r.jumlah_tiket,
            status: r.status,
            created_at: r.created_at,
            wisata: r.wisata ? { nama_wisata: r.wisata.nama_wisata } : null,
            customer: r.customer,
          }))
        }
      }
    }
  }

  return (
    <WisataDashboardClient
      wisataList={wisataList}
      bookings={bookings}
      activeTab={activeTab}
      totalTiketTerjual={totalTiketTerjual}
      totalPendapatan={totalPendapatan}
    />
  )
}
