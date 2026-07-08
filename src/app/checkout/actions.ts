'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function simulateQrisPaymentAction(formData: FormData) {
  const bookingId = formData.get('booking_id') as string | null

  if (!bookingId) {
    redirect('/dashboard/customer')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // ── Ambil detail booking terlebih dahulu ────────────────────────────
  // Kita butuh wisata_id, jumlah_tiket, dan status saat ini sebelum update.
  const { data: booking, error: bookingFetchErr } = await supabase
    .from('bookings')
    .select('id, status, wisata_id, jumlah_tiket')
    .eq('id', bookingId)
    .eq('customer_id', user.id)
    .single()

  if (bookingFetchErr || !booking) {
    redirect(`/checkout/qris/${bookingId}?error=${encodeURIComponent('Booking tidak ditemukan.')}`)
  }

  // Jika sudah lunas sebelumnya, langsung redirect ke success
  if (booking.status === 'success') {
    redirect(`/checkout/success?booking_id=${bookingId}`)
  }

  // ── Validasi ulang kuota sebelum konfirmasi pembayaran ──────────────
  // Kuota = kuota_harian wisata di DB (statis, tidak berubah).
  // Tiket terjual = SUM jumlah_tiket dari bookings berstatus success PADA wisata ini.
  // Ini lebih akurat daripada decrement kolom karena tahan race condition.
  const { data: wisata, error: wisataErr } = await supabase
    .from('wisata')
    .select('kuota_harian')
    .eq('id', booking.wisata_id)
    .single()

  if (wisataErr || !wisata) {
    redirect(`/checkout/qris/${bookingId}?error=${encodeURIComponent('Data destinasi tidak ditemukan.')}`)
  }

  // Hitung total tiket yang sudah lunas untuk wisata ini (excludes booking ini sendiri)
  const { data: soldTickets } = await supabase
    .from('bookings')
    .select('jumlah_tiket')
    .eq('wisata_id', booking.wisata_id)
    .eq('status', 'success')

  const totalTerjual = soldTickets?.reduce((sum, b) => sum + b.jumlah_tiket, 0) ?? 0
  const sisaKuota = wisata.kuota_harian - totalTerjual

  if (booking.jumlah_tiket > sisaKuota) {
    const msg = `Kuota tidak mencukupi. Sisa kuota yang tersedia adalah ${sisaKuota} tiket, sedangkan pesanan Anda ${booking.jumlah_tiket} tiket.`
    redirect(`/checkout/qris/${bookingId}?error=${encodeURIComponent(msg)}`)
  }

  // ── Update status booking → success ────────────────────────────────
  const { error: updateErr } = await supabase
    .from('bookings')
    .update({ status: 'success' })
    .eq('id', bookingId)
    .eq('customer_id', user.id)

  if (updateErr) {
    redirect(`/checkout/qris/${bookingId}?error=${encodeURIComponent('Gagal memproses pembayaran demo.')}`)
  }

  revalidatePath('/dashboard/customer')
  revalidatePath(`/checkout/qris/${bookingId}`)
  revalidatePath('/wisata')
  revalidatePath(`/wisata/${booking.wisata_id}`)
  redirect(`/checkout/success?booking_id=${bookingId}`)
}
