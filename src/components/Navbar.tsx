import { createClient } from '@/lib/supabase/server'
import NavbarClient, { type NavbarProfile } from './NavbarClient'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: NavbarProfile | null = null

  if (user) {
    const { data } = await supabase
      .from('users')
      .select('nama_lengkap, role')
      .eq('id', user.id)
      .single()

    profile = {
      email: user.email || '',
      nama_lengkap: data?.nama_lengkap || user.email || 'Pengguna',
      role: data?.role || 'customer',
    }
  }

  return <NavbarClient profile={profile} />
}
