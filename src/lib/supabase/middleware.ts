import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if a user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // Route Guarding (RBAC)
  if (url.pathname.startsWith('/dashboard')) {
    if (!user) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Ambil data profile dari tabel 'users' untuk mendapatkan role-nya
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    if (!role) {
      // Jika profile belum terbentuk atau role kosong, arahkan ke onboarding role-selection
      if (url.pathname !== '/register/role-selection') {
        url.pathname = '/register/role-selection'
        return NextResponse.redirect(url)
      }
    } else {
      // Proteksi masing-masing sub-dashboard
      if (url.pathname.startsWith('/dashboard/admin') && role !== 'admin') {
        url.pathname = '/unauthorized'
        return NextResponse.redirect(url)
      }
      if (url.pathname.startsWith('/dashboard/mitra-wisata') && role !== 'mitra_wisata') {
        url.pathname = '/unauthorized'
        return NextResponse.redirect(url)
      }
      if (url.pathname.startsWith('/dashboard/mitra-guide') && role !== 'mitra_guide') {
        url.pathname = '/unauthorized'
        return NextResponse.redirect(url)
      }
      if (url.pathname.startsWith('/dashboard/customer') && role !== 'customer') {
        url.pathname = '/unauthorized'
        return NextResponse.redirect(url)
      }
    }
  }

  // Jika user sudah login dan mencoba masuk ke /login atau /register, redirect ke dashboard yang sesuai
  if ((url.pathname === '/login' || url.pathname === '/register') && user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role
    if (role) {
      if (role === 'admin') url.pathname = '/dashboard/admin'
      else if (role === 'mitra_wisata') url.pathname = '/dashboard/mitra-wisata'
      else if (role === 'mitra_guide') url.pathname = '/dashboard/mitra-guide'
      else if (role === 'customer') url.pathname = '/dashboard/customer'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
