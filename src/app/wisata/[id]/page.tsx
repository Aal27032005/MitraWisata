import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BookingFormClient from './BookingFormClient'

export const revalidate = 0

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function WisataDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Ambil detail tempat wisata termasuk foto utama dan galeri tambahan
  const { data: wisata } = await supabase
    .from('wisata')
    .select('*, foto_url, foto_urls')
    .eq('id', id)
    .single()

  if (!wisata) {
    notFound()
  }

  // 2. Hitung sisa kuota aktual: kuota_harian dikurangi tiket yang sudah success
  // Tidak ada filter tanggal — kita hitung total keseluruhan tiket success
  // agar tampilan konsisten dengan validasi di booking/actions.ts dan checkout/actions.ts
  const { data: soldData } = await supabase
    .from('bookings')
    .select('jumlah_tiket')
    .eq('wisata_id', id)
    .eq('status', 'success')

  const totalTerjual = soldData?.reduce((sum, b) => sum + b.jumlah_tiket, 0) ?? 0
  const sisaKuota = Math.max(0, wisata.kuota_harian - totalTerjual)

  // 3. Ambil pemandu wisata yang berstatus tersedia (is_available = true)
  const { data: guides } = await supabase
    .from('guides')
    .select('*, users(nama_lengkap)')
    .eq('is_available', true)

  return (
    <BookingFormClient
      wisata={{ ...wisata, sisaKuota }}
      guides={guides || []}
    />
  )
}
