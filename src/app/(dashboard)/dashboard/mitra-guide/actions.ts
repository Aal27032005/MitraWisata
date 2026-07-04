'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type GuideProfileActionState = {
  error?: string
  success?: string
} | null

export async function updateGuideProfileAction(state: GuideProfileActionState, formData: FormData) {
  const nama_lengkap = (formData.get('nama_lengkap') as string | null)?.trim() || ''
  const tarif_per_hari_raw = formData.get('tarif_per_hari') as string
  const keahlian = ((formData.get('keahlian') as string | null) || '').trim()
  const is_available = formData.get('is_available') === 'true'

  if (!nama_lengkap || !tarif_per_hari_raw || !keahlian) {
    return { error: 'Nama lengkap, tarif harian, dan keahlian wajib diisi.' }
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

  const { error: userError } = await supabase
    .from('users')
    .update({ nama_lengkap })
    .eq('id', user.id)

  if (userError) {
    return { error: 'Gagal memperbarui nama lengkap: ' + userError.message }
  }

  const { error: guideError } = await supabase
    .from('guides')
    .upsert({
      mitra_id: user.id,
      tarif_per_hari,
      keahlian,
      is_available,
    }, { onConflict: 'mitra_id' })

  if (guideError) {
    return { error: 'Gagal memperbarui profil: ' + guideError.message }
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
