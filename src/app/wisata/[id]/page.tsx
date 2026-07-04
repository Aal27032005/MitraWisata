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

  // 2. Ambil pemandu wisata yang berstatus tersedia (is_available = true)
  const { data: guides } = await supabase
    .from('guides')
    .select('*, users(nama_lengkap)')
    .eq('is_available', true)

  return (
    <BookingFormClient
      wisata={wisata}
      guides={guides || []}
    />
  )
}
