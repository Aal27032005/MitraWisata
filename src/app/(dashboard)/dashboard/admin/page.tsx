import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboardClient from './AdminDashboardClient'

export const revalidate = 0

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verifikasi kembali peran pengguna (RBAC)
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/unauthorized')
  }

  let stats = {
    totalUsers: 0,
    totalWisata: 0,
    totalBookings: 0,
    totalRevenue: 0
  }

  let bookingsList: any[] = []

  try {
    // 1. Ambil jumlah pengguna, destinasi, dan pemesanan
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
    const { count: wisataCount } = await supabase.from('wisata').select('*', { count: 'exact', head: true })
    const { count: bookingsCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true })

    // 2. Hitung total pendapatan dari transaksi berstatus success
    const { data: successBookings } = await supabase
      .from('bookings')
      .select('total_harga')
      .eq('status', 'success')

    const totalRevenue = successBookings?.reduce((sum, b) => sum + (b.total_harga || 0), 0) || 0

    stats = {
      totalUsers: usersCount || 0,
      totalWisata: wisataCount || 0,
      totalBookings: bookingsCount || 0,
      totalRevenue
    }

    // 3. Ambil seluruh data transaksi secara global untuk keperluan audit
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select(`
        id,
        tanggal_kunjungan,
        jumlah_tiket,
        total_harga,
        status,
        created_at,
        wisata ( nama_wisata ),
        customer:users!customer_id ( nama_lengkap, email ),
        guides ( users ( nama_lengkap ) )
      `)
      .order('created_at', { ascending: false })

    bookingsList = bookingsData || []
  } catch (err) {
    console.error('Gagal mengambil data untuk dashboard admin:', err)
  }

  return (
    <AdminDashboardClient
      stats={stats}
      bookings={bookingsList}
    />
  )
}
