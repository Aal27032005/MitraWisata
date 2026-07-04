'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateGuideProfileAction(state: any, formData: FormData) {
  const tarif_per_hari_raw = formData.get('tarif_per_hari') as string
  const keahlian = formData.get('keahlian') as string
  const is_available = formData.get('is_available') === 'true'

  if (!tarif_per_hari_raw || !keahlian) {
    return { error: 'Tarif harian dan keahlian wajib diisi.' }
  }

  const tarif_per_hari = parseInt(tarif_per_hari_raw, 10)

  if (isNaN(tarif_per_hari) || tarif_per_hari < 0) {
    return { error: 'Tarif per hari tidak valid.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Sesi berakhir, silakan login kembali.' }
  }

  const { error } = await supabase
    .from('guides')
    .update({
      tarif_per_hari,
      keahlian,
      is_available,
    })
    .eq('mitra_id', user.id)

  if (error) {
    return { error: 'Gagal memperbarui profil: ' + error.message }
  }

  revalidatePath('/dashboard/mitra-guide')
  return { success: 'Profil pemandu wisata berhasil diperbarui!' }
}

export async function toggleGuideAvailabilityAction(currentStatus: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Sesi berakhir, silakan login kembali.' }
  }

  const { error } = await supabase
    .from('guides')
    .update({
      is_available: !currentStatus,
    })
    .eq('mitra_id', user.id)

  if (error) {
    return { error: 'Gagal memperbarui status ketersediaan: ' + error.message }
  }

  revalidatePath('/dashboard/mitra-guide')
  return { success: 'Status ketersediaan berhasil diperbarui!' }
}
