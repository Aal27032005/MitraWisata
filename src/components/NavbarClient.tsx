'use client'

import { createClient } from '@/lib/supabase/client'
import { Compass, LogIn, LogOut, Menu, UserRound, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type UserRole = 'admin' | 'customer' | 'mitra_wisata' | 'mitra_guide'

export interface NavbarProfile {
  email: string
  nama_lengkap: string
  role: string
}

interface NavItem {
  label: string
  href: string
}

interface NavbarClientProps {
  profile: NavbarProfile | null
}

const publicMenu: NavItem[] = [
  { label: 'Jelajah Wisata', href: '/wisata' },
  { label: 'Cari Tour Guide', href: '/guides' },
]

const roleMenus: Record<UserRole, NavItem[]> = {
  admin: [
    { label: 'Dashboard Admin', href: '/dashboard/admin' },
    { label: 'Jelajah Wisata', href: '/wisata' },
    { label: 'Cari Tour Guide', href: '/guides' },
  ],
  customer: [
    { label: 'Jelajah Wisata', href: '/wisata' },
    { label: 'Cari Tour Guide', href: '/guides' },
    { label: 'Riwayat Booking & Pembayaran', href: '/dashboard/customer' },
  ],
  mitra_wisata: [
    { label: 'Beranda Mitra', href: '/dashboard/mitra-wisata' },
    { label: 'Kelola Destinasi', href: '/dashboard/mitra-wisata' },
    { label: 'Riwayat Pesanan Tiket', href: '/dashboard/mitra-wisata' },
  ],
  mitra_guide: [
    { label: 'Beranda Guide', href: '/dashboard/mitra-guide' },
    { label: 'Edit Profil & Tarif', href: '/dashboard/mitra-guide' },
    { label: 'Jadwal Bookingan', href: '/dashboard/mitra-guide' },
  ],
}

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  customer: 'Wisatawan',
  mitra_wisata: 'Mitra Wisata',
  mitra_guide: 'Mitra Guide',
}

function normalizeRole(role?: string): UserRole {
  if (role === 'admin' || role === 'mitra_wisata' || role === 'mitra_guide') {
    return role
  }

  return 'customer'
}

export default function NavbarClient({ profile }: NavbarClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const role = normalizeRole(profile?.role)
  const navItems = profile ? roleMenus[role] : publicMenu
  const initial = (profile?.nama_lengkap || profile?.email || 'U').charAt(0).toUpperCase()

  const handleLogout = () => {
    startTransition(async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      setIsOpen(false)
      router.push('/')
      router.refresh()
    })
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }

    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/75 text-slate-100 shadow-2xl shadow-black/10 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-black tracking-tight text-white" onClick={() => setIsOpen(false)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/5">
              <Compass className="h-5 w-5" />
            </span>
            <span>MitraWisata</span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                className={`rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${isActive(item.href) ? 'bg-emerald-500/10 text-emerald-300' : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {profile ? (
              <>
                <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 py-1 pl-1 pr-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-black text-emerald-300">
                    {initial || <UserRound className="h-4 w-4" />}
                  </div>
                  <div className="max-w-44 leading-tight">
                    <div className="truncate text-xs font-bold text-white">{profile.nama_lengkap}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">{roleLabels[role]}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/70 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm font-bold text-slate-200 transition-colors hover:bg-slate-800">
                  <LogIn className="h-4 w-4" />
                  Masuk
                </Link>
                <Link href="/register" className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/10 transition-colors hover:bg-emerald-600">
                  Daftar
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/70 text-slate-200 lg:hidden"
            aria-label="Buka menu navigasi"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-slate-800 bg-slate-950/95 px-4 py-4 shadow-2xl backdrop-blur-xl lg:hidden">
          <div className="mx-auto max-w-7xl space-y-4">
            <div className="grid gap-2">
              {navItems.map((item) => (
                <Link
                  key={`${item.label}-${item.href}-mobile`}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-bold transition-colors ${isActive(item.href) ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-900'}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {profile ? (
              <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-sm font-black text-emerald-300">
                    {initial || <UserRound className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-white">{profile.nama_lengkap}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">{roleLabels[role]}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-black uppercase tracking-wider text-red-300 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link href="/login" onClick={() => setIsOpen(false)} className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-center text-sm font-bold text-slate-200">
                  Masuk
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)} className="rounded-xl bg-emerald-500 px-4 py-3 text-center text-sm font-black text-slate-950">
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
