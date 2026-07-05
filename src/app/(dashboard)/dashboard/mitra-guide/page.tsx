import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GuideDashboardClient from './GuideDashboardClient'
import { parseGaleriUrls } from './utils'

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

  // Ambil data bookings untuk guide ini — dengan join guide untuk ambil tarif_per_hari
  // Guide hanya berhak atas porsi tarif mereka sendiri (total_harga - harga_tiket × jumlah_tiket),
  // namun cara paling bersih adalah join ke tabel guides untuk ambil tarif_per_hari langsung.
  let bookings: any[] = []
  if (guideProfile?.id) {
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        tanggal_kunjungan,
        jumlah_tiket,
        status,
        created_at,
        wisata:wisata_id ( nama_wisata ),
        customer:customer_id ( nama_lengkap, email ),
        guide:guide_id ( tarif_per_hari )
      `)
      .eq('guide_id', guideProfile.id)
      .order('created_at', { ascending: false })

    if (!bookingsError && bookingsData) {
      // Sajikan total_harga sebagai porsi tarif guide saja (bukan total pembelian customer)
      bookings = (bookingsData as any[]).map((b) => ({
        ...b,
        // Tarif guide per booking = tarif_per_hari guide (flat per hari, independen dari jumlah tiket)
        total_harga: b.guide?.tarif_per_hari ?? 0,
      }))
    } else if (bookingsError) {
      console.error('Gagal mengambil data booking guide:', bookingsError.message)
    }
  }

  return (
    <GuideDashboardClient
      guideProfile={guideProfile ? {
        ...guideProfile,
        // foto_galeri_urls disimpan di DB sebagai TEXT (JSON string),
        // parse ke string[] sebelum dikirim ke client component.
        foto_galeri_urls: parseGaleriUrls(guideProfile.foto_galeri_urls),
      } : {
        id: '',
        mitra_id: user.id,
        tarif_per_hari: 0,
        keahlian: '-',
        is_available: true,
        foto_profil_url: null,
        foto_galeri_urls: [],
      }}
      userData={userData}
      bookings={bookings}
      activeTab={tab || 'beranda'}
    />
  )
}
