import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GuideDashboardClient from './GuideDashboardClient'

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function MitraGuideDashboardPage({ searchParams }: PageProps) {
  const { tab } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Ambil data profile dasar user
  const { data: userData } = await supabase
    .from('users')
    .select('nama_lengkap, email')
    .eq('id', user.id)
    .single()

  if (!userData) {
    redirect('/register/role-selection')
  }

  // Ambil data profile guide
  let { data: guideProfile } = await supabase
    .from('guides')
    .select('*')
    .eq('mitra_id', user.id)
    .single()

  // Jika data profile guide belum ada, buat record default
  if (!guideProfile) {
    const { data: newProfile, error: createError } = await supabase
      .from('guides')
      .insert([
        {
          mitra_id: user.id,
          tarif_per_hari: 0,
          keahlian: '-',
          is_available: true,
        },
      ])
      .select()
      .single()

    if (!createError && newProfile) {
      guideProfile = newProfile
    }
  }

  // Ambil data bookings untuk guide ini (filter by guides.id, bukan mitra_id)
  let bookings: any[] = []
  if (guideProfile?.id) {
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        tanggal_kunjungan,
        jumlah_tiket,
        total_harga,
        status,
        created_at,
        wisata ( nama_wisata ),
        customer:customer_id ( nama_lengkap, email )
      `)
      .eq('guide_id', guideProfile.id)
      .order('created_at', { ascending: false })

    if (!bookingsError && bookingsData) {
      bookings = bookingsData
    } else if (bookingsError) {
      console.error('Gagal mengambil data booking guide:', bookingsError.message)
    }
  }

  return (
    <GuideDashboardClient
      guideProfile={guideProfile ?? {
        id: '',
        mitra_id: user.id,
        tarif_per_hari: 0,
        keahlian: '-',
        is_available: true,
      }}
      userData={userData}
      bookings={bookings}
      activeTab={tab || 'beranda'}
    />
  )
}
