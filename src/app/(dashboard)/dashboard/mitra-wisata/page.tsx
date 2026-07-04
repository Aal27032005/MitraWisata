import { createClient } from '@/lib/supabase/server'
import WisataDashboardClient from './WisataDashboardClient'

export default async function MitraWisataDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let wisataList: any[] = []
  
  if (user) {
    const { data } = await supabase
      .from('wisata')
      .select('*')
      .eq('mitra_id', user.id)
      .order('created_at', { ascending: false })
    
    wisataList = data || []
  }

  return <WisataDashboardClient wisataList={wisataList} />
}
