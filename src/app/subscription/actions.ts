'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type SubscriptionPlan = 'bulanan' | 'tahunan'
export type SubscriptionStatus = 'inactive' | 'active' | 'expired'

/** Bentuk baris tabel public.subscriptions */
export interface SubscriptionRow {
  id: string
  user_id: string
  role: 'mitra_wisata' | 'mitra_guide'
  status: SubscriptionStatus
  plan: SubscriptionPlan | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

/**
 * getSubscriptionAction()
 * ─────────────────────────────────────────────────────────────────
 * Ambil baris subscription milik user yang sedang login dari tabel
 * public.subscriptions.
 *
 * Jika baris tidak ada (mitra lama sebelum migrasi), kembalikan
 * objek virtual dengan status 'inactive' agar SubscriptionGate
 * tetap tampil — tanpa perlu crash.
 *
 * Auto-expire: jika status DB masih 'active' tapi expires_at sudah
 * lewat, update DB ke 'expired' dan kembalikan status terbaru.
 */
export async function getSubscriptionAction(): Promise<SubscriptionRow | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Baris belum ada (mitra yang baru migrasi atau edge-case) → anggap inactive
  if (error || !data) {
    return null
  }

  const row = data as SubscriptionRow

  // ── Auto-expire check ────────────────────────────────────────────────
  if (
    row.status === 'active' &&
    row.expires_at &&
    new Date(row.expires_at) < new Date()
  ) {
    const now = new Date().toISOString()
    await supabase
      .from('subscriptions')
      .update({ status: 'expired', updated_at: now })
      .eq('user_id', user.id)

    return { ...row, status: 'expired', updated_at: now }
  }

  return row
}

/**
 * activateSubscriptionAction(plan)
 * ─────────────────────────────────────────────────────────────────
 * Dipanggil oleh SubscriptionGate setelah user klik
 * "Simulasikan Bayar Sukses".
 *
 * Melakukan UPSERT pada tabel public.subscriptions:
 *   - status  → 'active'
 *   - plan    → paket yang dipilih
 *   - expires_at → sekarang + 30 hari (bulanan) / 365 hari (tahunan)
 *   - updated_at → timestamp sekarang
 *
 * Setelah sukses, revalidatePath agar Server Component otomatis
 * re-render dan SubscriptionGate runtuh → dashboard penuh tampil.
 */
export async function activateSubscriptionAction(
  plan: SubscriptionPlan
): Promise<{ success?: string; error?: string }> {
  if (plan !== 'bulanan' && plan !== 'tahunan') {
    return { error: 'Paket langganan tidak valid.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sesi berakhir, silakan login kembali.' }
  }

  // Hitung expires_at berdasarkan paket
  const now = new Date()
  const expiresAt = new Date(now)
  if (plan === 'bulanan') {
    expiresAt.setDate(expiresAt.getDate() + 30)
  } else {
    expiresAt.setDate(expiresAt.getDate() + 365)
  }

  // Ambil role user untuk kolom 'role' yang wajib ada saat INSERT pertama kali
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = (profile?.role as 'mitra_wisata' | 'mitra_guide' | null) ?? 'mitra_wisata'

  // Upsert: buat baris baru jika belum ada, update jika sudah ada
  const { error } = await supabase
    .from('subscriptions')
    .upsert(
      {
        user_id: user.id,
        role: userRole,
        status: 'active',
        plan,
        expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (error) {
    console.error('[activateSubscriptionAction] DB error:', error.message)
    return { error: 'Gagal mengaktifkan langganan: ' + error.message }
  }

  // Revalidate path agar Server Component re-render otomatis
  revalidatePath('/dashboard/mitra-wisata')
  revalidatePath('/dashboard/mitra-guide')

  const planLabel = plan === 'bulanan' ? 'Bulanan (30 hari)' : 'Tahunan (365 hari)'
  const expiresLabel = expiresAt.toLocaleDateString('id-ID', { dateStyle: 'long' })

  return {
    success: `Langganan ${planLabel} aktif hingga ${expiresLabel}!`,
  }
}
