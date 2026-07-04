'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}

export async function confirmPaymentAction(bookingId: string) {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return { error: 'Anda tidak memiliki hak akses administrator.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'success' })
    .eq('id', bookingId)

  if (error) {
    return { error: 'Gagal mengonfirmasi pembayaran: ' + error.message }
  }

  revalidatePath('/dashboard/admin')
  return { success: 'Pembayaran tiket berhasil dikonfirmasi!' }
}

export async function cancelBookingAction(bookingId: string) {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return { error: 'Anda tidak memiliki hak akses administrator.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)

  if (error) {
    return { error: 'Gagal membatalkan pesanan: ' + error.message }
  }

  revalidatePath('/dashboard/admin')
  return { success: 'Pemesanan berhasil dibatalkan!' }
}
