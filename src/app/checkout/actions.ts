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

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'success' })
    .eq('id', bookingId)
    .eq('customer_id', user.id)

  if (error) {
    redirect(`/checkout/qris/${bookingId}?error=${encodeURIComponent('Gagal memproses pembayaran demo.')}`)
  }

  revalidatePath('/dashboard/customer')
  revalidatePath(`/checkout/qris/${bookingId}`)
  redirect(`/checkout/success?booking_id=${bookingId}`)
}
