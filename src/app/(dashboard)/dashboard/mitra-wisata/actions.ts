'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function parseFotoUrls(raw: string) {
  return raw
    .split(/[\n,]/)
    .map((url) => url.trim())
    .filter(Boolean)
}

export async function createWisataAction(state: any, formData: FormData) {
  const nama_wisata = formData.get('nama_wisata') as string
  const deskripsi = formData.get('deskripsi') as string
  const harga_tiket_raw = formData.get('harga_tiket') as string
  const kuota_harian_raw = formData.get('kuota_harian') as string
  const foto_url = formData.get('foto_url') as string
  const foto_urls_raw = formData.get('foto_urls') as string

  if (!nama_wisata || !deskripsi || !harga_tiket_raw || !kuota_harian_raw) {
    return { error: 'Semua bidang wajib diisi kecuali Foto URL.' }
  }

  const harga_tiket = parseInt(harga_tiket_raw, 10)
  const kuota_harian = parseInt(kuota_harian_raw, 10)

  if (isNaN(harga_tiket) || harga_tiket < 0) {
    return { error: 'Harga tiket tidak valid.' }
  }

  if (isNaN(kuota_harian) || kuota_harian < 0) {
    return { error: 'Kuota harian tidak valid.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Sesi berakhir, silakan login kembali.' }
  }

  const foto_urls = parseFotoUrls(foto_urls_raw || foto_url || '')

  const { error } = await supabase
    .from('wisata')
    .insert([
      {
        mitra_id: user.id,
        nama_wisata,
        deskripsi,
        harga_tiket,
        kuota_harian,
        foto_url: foto_urls[0] || foto_url || null,
        foto_urls,
      }
    ])

  if (error) {
    return { error: 'Gagal menambahkan wisata: ' + error.message }
  }

  revalidatePath('/dashboard/mitra-wisata')
  return { success: 'Berhasil menambahkan tempat wisata baru!' }
}

export async function updateWisataAction(state: any, formData: FormData) {
  const id = formData.get('id') as string
  const nama_wisata = formData.get('nama_wisata') as string
  const deskripsi = formData.get('deskripsi') as string
  const harga_tiket_raw = formData.get('harga_tiket') as string
  const kuota_harian_raw = formData.get('kuota_harian') as string
  const foto_url = formData.get('foto_url') as string
  const foto_urls_raw = formData.get('foto_urls') as string

  if (!id || !nama_wisata || !deskripsi || !harga_tiket_raw || !kuota_harian_raw) {
    return { error: 'Semua bidang wajib diisi kecuali Foto URL.' }
  }

  const harga_tiket = parseInt(harga_tiket_raw, 10)
  const kuota_harian = parseInt(kuota_harian_raw, 10)

  if (isNaN(harga_tiket) || harga_tiket < 0) {
    return { error: 'Harga tiket tidak valid.' }
  }

  if (isNaN(kuota_harian) || kuota_harian < 0) {
    return { error: 'Kuota harian tidak valid.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Sesi berakhir, silakan login kembali.' }
  }

  const foto_urls = parseFotoUrls(foto_urls_raw || foto_url || '')

  const { error } = await supabase
    .from('wisata')
    .update({
      nama_wisata,
      deskripsi,
      harga_tiket,
      kuota_harian,
      foto_url: foto_urls[0] || foto_url || null,
      foto_urls,
    })
    .eq('id', id)
    .eq('mitra_id', user.id)

  if (error) {
    return { error: 'Gagal memperbarui wisata: ' + error.message }
  }

  revalidatePath('/dashboard/mitra-wisata')
  return { success: 'Berhasil memperbarui tempat wisata!' }
}

export async function deleteWisataAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Sesi berakhir, silakan login kembali.' }
  }

  const { error } = await supabase
    .from('wisata')
    .delete()
    .eq('id', id)
    .eq('mitra_id', user.id)

  if (error) {
    return { error: 'Gagal menghapus wisata: ' + error.message }
  }

  revalidatePath('/dashboard/mitra-wisata')
  return { success: 'Berhasil menghapus tempat wisata!' }
}
