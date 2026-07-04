import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GuideDashboardClient from './GuideDashboardClient'

export default async function MitraGuideDashboardPage() {
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

  // Jika data profile guide belum ada (misal pendaftaran lama/manual), buat record default
  if (!guideProfile) {
    const { data: newProfile, error: createError } = await supabase
      .from('guides')
      .insert([
        {
          mitra_id: user.id,
          tarif_per_hari: 0,
          keahlian: '-',
          is_available: true
        }
      ])
      .select()
      .single()

    if (!createError && newProfile) {
      guideProfile = newProfile
    }
  }

  return (
    <GuideDashboardClient
      guideProfile={guideProfile}
      userData={userData}
    />
  )
}
