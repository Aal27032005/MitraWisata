'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createBookingAction(state: any, formData: FormData) {
  const wisata_id = formData.get('wisata_id') as string
  const guide_id = formData.get('guide_id') as string | null
  const tanggal_kunjungan = formData.get('tanggal_kunjungan') as string
  const jumlah_tiket_raw = formData.get('jumlah_tiket') as string

  if (!wisata_id || !tanggal_kunjungan || !jumlah_tiket_raw) {
    return { error: 'Tanggal kunjungan dan jumlah tiket wajib diisi.' }
  }

  const jumlah_tiket = parseInt(jumlah_tiket_raw, 10)
  if (isNaN(jumlah_tiket) || jumlah_tiket <= 0) {
    return { error: 'Jumlah tiket harus bernilai minimal 1.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Sesi berakhir, silakan login kembali.' }
  }

  // 1. Ambil data wisata untuk verifikasi harga tiket dan kuota harian
  const { data: wisata, error: wisataErr } = await supabase
    .from('wisata')
    .select('harga_tiket, kuota_harian, nama_wisata')
    .eq('id', wisata_id)
    .single()

  if (wisataErr || !wisata) {
    return { error: 'Tempat wisata tidak ditemukan.' }
  }

  // 2. Hitung harga dasar tiket
  const totalTiket = jumlah_tiket * wisata.harga_tiket
  let total_harga = totalTiket

  // 3. Verifikasi guide jika dipilih
  let selectedGuideId: string | null = null
  if (guide_id && guide_id !== 'none') {
    const { data: guide, error: guideErr } = await supabase
      .from('guides')
      .select('tarif_per_hari, is_available')
      .eq('id', guide_id)
      .single()

    if (guideErr || !guide) {
      return { error: 'Data tour guide tidak valid atau tidak ditemukan.' }
    }

    if (!guide.is_available) {
      return { error: 'Tour guide terpilih sedang sibuk atau tidak tersedia.' }
    }

    selectedGuideId = guide_id
    total_harga = totalTiket + guide.tarif_per_hari
  }

  // 4. Periksa kuota harian wisata pada tanggal kunjungan terpilih
  const { data: booked } = await supabase
    .from('bookings')
    .select('jumlah_tiket')
    .eq('wisata_id', wisata_id)
    .eq('tanggal_kunjungan', tanggal_kunjungan)
    .neq('status', 'cancelled')

  const totalDipesan = booked?.reduce((sum, b) => sum + b.jumlah_tiket, 0) || 0
  if (totalDipesan + jumlah_tiket > wisata.kuota_harian) {
    const sisa = wisata.kuota_harian - totalDipesan
    return { 
      error: `Kuota harian penuh. Sisa kuota tiket untuk tanggal ${tanggal_kunjungan} adalah ${sisa >= 0 ? sisa : 0} tiket.` 
    }
  }

  // 5. Simpan pesanan ke tabel bookings
  const { data: booking, error: bookingErr } = await supabase
    .from('bookings')
    .insert([
      {
        customer_id: user.id,
        wisata_id,
        guide_id: selectedGuideId,
        tanggal_kunjungan,
        jumlah_tiket,
        total_harga,
        status: 'pending'
      }
    ])
    .select('id')
    .single()

  if (bookingErr || !booking) {
    return { error: 'Gagal memproses pemesanan tiket: ' + bookingErr?.message }
  }

  revalidatePath('/dashboard/customer')
  revalidatePath('/wisata')
  revalidatePath(`/wisata/${wisata_id}`)
  redirect(`/dashboard/customer?success_booking=${booking.id}`)
}
