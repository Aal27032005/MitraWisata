'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(state: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email dan password wajib diisi.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message === 'Invalid login credentials' ? 'Email atau password salah.' : error.message }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Pengguna tidak ditemukan.' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/register/role-selection')
  }

  const role = profile.role
  if (role === 'admin') {
    redirect('/dashboard/admin')
  } else if (role === 'mitra_wisata') {
    redirect('/dashboard/mitra-wisata')
  } else if (role === 'mitra_guide') {
    redirect('/dashboard/mitra-guide')
  } else {
    // Customer langsung ke halaman Jelajah Wisata setelah login
    redirect('/wisata')
  }
}

export async function registerAction(state: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nama_lengkap = formData.get('nama_lengkap') as string
  const role = formData.get('role') as string

  if (!email || !password || !nama_lengkap || !role) {
    return { error: 'Semua bidang wajib diisi.' }
  }

  if (!['mitra_wisata', 'mitra_guide', 'customer'].includes(role)) {
    return { error: 'Role tidak valid.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nama_lengkap,
        role,
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  const user = data.user
  if (!user) {
    return { error: 'Registrasi gagal.' }
  }

  // Insert ke tabel public.users
  const { error: insertError } = await supabase
    .from('users')
    .insert([
      {
        id: user.id,
        email,
        nama_lengkap,
        role,
      }
    ])

  if (insertError) {
    return { error: 'Gagal membuat profil pengguna: ' + insertError.message }
  }

  // Jika mendaftar sebagai mitra_guide, buat record profil guide kosong secara default
  if (role === 'mitra_guide') {
    const { error: guideError } = await supabase
      .from('guides')
      .insert([
        {
          mitra_id: user.id,
          tarif_per_hari: 0,
          keahlian: '-',
          is_available: true
        }
      ])
    
    if (guideError) {
      return { error: 'Gagal inisialisasi profil guide: ' + guideError.message }
    }
  }

  // Buat baris subscription 'inactive' untuk mitra baru (mitra_wisata & mitra_guide)
  // Subscription harus diaktifkan lewat pembayaran sebelum bisa masuk dashboard.
  if (role === 'mitra_wisata' || role === 'mitra_guide') {
    const { error: subError } = await supabase
      .from('subscriptions')
      .insert([{ user_id: user.id, role, status: 'inactive' }])

    if (subError) {
      // Non-fatal: mitra tetap bisa login, SubscriptionGate akan handle ini
      console.warn('[registerAction] Gagal buat baris subscription:', subError.message)
    }
  }

  return { success: 'Registrasi berhasil! Silakan login menggunakan akun Anda.' }
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
