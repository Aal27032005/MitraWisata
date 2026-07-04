import { createClient } from '@/lib/supabase/server'
import WisataDashboardClient from './WisataDashboardClient'

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

function normalizeFotoUrls(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
}

export default async function MitraWisataDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let wisataList = []
  
  if (user) {
    const { data, error } = await supabase
      .from('wisata')
      .select('id,mitra_id,nama_wisata,deskripsi,harga_tiket,kuota_harian,foto_url,foto_urls,created_at')
      .eq('mitra_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Gagal memuat wisata mitra:', error.message)
    }
    
    wisataList = ((data || []) as WisataRow[]).map((wisata) => ({
      id: wisata.id,
      mitra_id: wisata.mitra_id,
      nama_wisata: wisata.nama_wisata,
      deskripsi: wisata.deskripsi,
      harga_tiket: wisata.harga_tiket,
      kuota_harian: wisata.kuota_harian,
      foto_url: wisata.foto_url,
      foto_urls: normalizeFotoUrls(wisata.foto_urls),
    }))
  }

  return <WisataDashboardClient wisataList={wisataList} />
}
