import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Compass, LogOut, User } from 'lucide-react'
import { signOutAction } from '@/app/auth/actions'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const displayName = profile?.nama_lengkap || user.email
  const role = profile?.role

  const roleLabel = 
    role === 'admin' ? 'Administrator' :
    role === 'mitra_wisata' ? 'Mitra Tempat Wisata' :
    role === 'mitra_guide' ? 'Mitra Tour Guide' : 'Wisatawan'

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Top navbar */}
      <nav className="border-b border-slate-900 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
              <Compass className="w-6 h-6" />
              <span>MitraWisata</span>
            </Link>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {roleLabel}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 text-sm text-slate-300">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 border border-slate-700">
                <User className="w-4 h-4" />
              </div>
              <span className="hidden md:inline font-medium">{displayName}</span>
            </div>

            <form action={signOutAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-red-400 bg-slate-900 border border-slate-800 hover:border-red-900/40 hover:bg-red-950/10 px-3.5 py-2 rounded-lg transition-all duration-200 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Main dashboard content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
        {children}
      </main>
    </div>
  )
}
