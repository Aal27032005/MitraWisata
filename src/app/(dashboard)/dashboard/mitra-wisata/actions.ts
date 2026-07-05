'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Upload satu file gambar destinasi ke folder di bucket 'guide-photos'
// subfolder: 'destinations/' untuk foto utama, 'destinations/galleries/' untuk galeri
async function uploadDestinasiFile(
  file: Blob,
  mitraId: string,
  originalName: string,
  subfolder: 'destinations' | 'destinations/galleries' = 'destinations'
): Promise<string | null> {
  const serviceClient = createServiceClient()
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const storagePath = `${subfolder}/${mitraId}-${Date.now()}-${randomSuffix}.${ext}`

  const { error: uploadError } = await serviceClient.storage
    .from('guide-photos')
    .upload(storagePath, buffer, {
      contentType: file.type || 'image/jpeg',
      upsert: true,
    })

  if (uploadError) {
    console.error(`[Storage Destinasi] Gagal upload ke ${storagePath}:`, uploadError.message)
    return null
  }

  const { data: urlData } = serviceClient.storage
    .from('guide-photos')
    .getPublicUrl(storagePath)

  return urlData.publicUrl
}

// Upload array file galeri secara SEKUENSIAL — satu per satu agar tidak timeout/rate-limit
async function uploadGaleriFiles(
  entries: { blob: Blob; name: string }[],
  mitraId: string
): Promise<string[]> {
  const urls: string[] = []
  for (const { blob, name } of entries) {
    if (blob.size === 0) continue
    const url = await uploadDestinasiFile(blob, mitraId, name, 'destinations/galleries')
    if (url) {
      urls.push(url)
    } else {
      console.warn('[Storage Galeri] Satu file gagal diupload, dilanjutkan ke berikutnya.')
    }
  }
  return urls
}

export async function createWisataAction(state: any, formData: FormData) {
  try {
  const nama_wisata = formData.get('nama_wisata') as string
  const deskripsi = formData.get('deskripsi') as string
  const harga_tiket_raw = formData.get('harga_tiket') as string
  const kuota_harian_raw = formData.get('kuota_harian') as string

  if (!nama_wisata || !deskripsi || !harga_tiket_raw || !kuota_harian_raw) {
    return { error: 'Semua bidang wajib diisi kecuali Foto.' }
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

  // ── Upload foto utama ────────────────────────────────────────────────
  let uploadedFotoUrl: string | null = null
  const destinasiFile = formData.get('destinasi_file')
  if (destinasiFile instanceof Blob && destinasiFile.size > 0) {
    const fileName = destinasiFile instanceof File ? destinasiFile.name : 'foto.jpg'
    uploadedFotoUrl = await uploadDestinasiFile(destinasiFile, user.id, fileName)
    if (!uploadedFotoUrl) {
      return { error: 'Gagal mengunggah foto destinasi. Silakan coba lagi.' }
    }
  }

  // ── Upload galeri file baru secara sekuensial ────────────────────────
  // File galeri sudah diupload dari client via /api/upload-galeri,
  // di sini kita cukup baca array URL yang sudah jadi.
  let uploadedGaleriUrls: string[] = []
  const preUploadedRaw = (formData.get('pre_uploaded_galeri_urls') as string | null) || '[]'
  try {
    const parsed = JSON.parse(preUploadedRaw)
    if (Array.isArray(parsed)) {
      uploadedGaleriUrls = parsed.filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
    }
  } catch { /* pakai array kosong */ }

  // Fallback: jika ada galeri_file_* (upload lama), proses juga agar backward-compatible
  const legacyGaleriEntries: { blob: Blob; name: string }[] = []
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('galeri_file_') && value instanceof Blob && value.size > 0) {
      legacyGaleriEntries.push({
        blob: value,
        name: value instanceof File ? value.name : `galeri-${key}.jpg`,
      })
    }
  }
  if (legacyGaleriEntries.length > 0) {
    const legacyUrls = await uploadGaleriFiles(legacyGaleriEntries, user.id)
    uploadedGaleriUrls = [...uploadedGaleriUrls, ...legacyUrls]
  }

  // ── Susun array foto final ───────────────────────────────────────────
  // Urutan: foto utama → galeri upload baru
  const allFotoUrls = [
    ...(uploadedFotoUrl ? [uploadedFotoUrl] : []),
    ...uploadedGaleriUrls,
  ]
  const primaryFotoUrl = allFotoUrls[0] || null

  const { error } = await supabase
    .from('wisata')
    .insert([{
      mitra_id: user.id,
      nama_wisata,
      deskripsi,
      harga_tiket,
      kuota_harian,
      foto_url: primaryFotoUrl,
      foto_urls: allFotoUrls,
    }])

  if (error) {
    return { error: 'Gagal menambahkan wisata: ' + error.message }
  }

  revalidatePath('/dashboard/mitra-wisata')
  return { success: 'Berhasil menambahkan tempat wisata baru!' }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[createWisataAction] Error parsing form:', msg)
    return { error: 'Terjadi kesalahan saat memproses formulir. Pastikan ukuran file tidak terlalu besar dan coba lagi.' }
  }
}

export async function updateWisataAction(state: any, formData: FormData) {
  try {
  const id = formData.get('id') as string
  const nama_wisata = formData.get('nama_wisata') as string
  const deskripsi = formData.get('deskripsi') as string
  const harga_tiket_raw = formData.get('harga_tiket') as string
  const kuota_harian_raw = formData.get('kuota_harian') as string
  const existing_foto_url = (formData.get('existing_foto_url') as string | null)?.trim() || null
  // URL galeri yang masih aktif (sudah dikurangi yang dihapus user)
  const existing_galeri_raw = (formData.get('existing_galeri_urls') as string | null) || '[]'
  let existingGaleriUrls: string[] = []
  try {
    const parsed = JSON.parse(existing_galeri_raw)
    if (Array.isArray(parsed)) {
      existingGaleriUrls = parsed.filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
    }
  } catch { /* pakai array kosong */ }

  // URL galeri yang dihapus user — untuk dihapus juga dari Storage
  const deleted_galeri_raw = (formData.get('deleted_galeri_urls') as string | null) || '[]'
  let deletedGaleriUrls: string[] = []
  try {
    const parsed = JSON.parse(deleted_galeri_raw)
    if (Array.isArray(parsed)) {
      deletedGaleriUrls = parsed.filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
    }
  } catch { /* pakai array kosong */ }

  if (!id || !nama_wisata || !deskripsi || !harga_tiket_raw || !kuota_harian_raw) {
    return { error: 'Semua bidang wajib diisi kecuali Foto.' }
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

  // ── Upload foto utama baru (jika ada), fallback ke URL lama ───────────
  let primaryFotoUrl: string | null = existing_foto_url
  const destinasiFile = formData.get('destinasi_file')
  if (destinasiFile instanceof Blob && destinasiFile.size > 0) {
    const fileName = destinasiFile instanceof File ? destinasiFile.name : 'foto.jpg'
    const uploadedUrl = await uploadDestinasiFile(destinasiFile, user.id, fileName)
    if (!uploadedUrl) {
      return { error: 'Gagal mengunggah foto destinasi. Silakan coba lagi.' }
    }
    primaryFotoUrl = uploadedUrl
  }

  // ── Upload galeri file baru secara sekuensial, append ke galeri lama ──
  // File galeri sudah diupload dari client via /api/upload-galeri,
  // di sini kita cukup baca array URL yang sudah jadi.
  let uploadedGaleriUrls: string[] = []
  const preUploadedRaw = (formData.get('pre_uploaded_galeri_urls') as string | null) || '[]'
  try {
    const parsed = JSON.parse(preUploadedRaw)
    if (Array.isArray(parsed)) {
      uploadedGaleriUrls = parsed.filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
    }
  } catch { /* pakai array kosong */ }

  // Fallback: jika ada galeri_file_* (upload lama), proses juga agar backward-compatible
  const legacyGaleriEntries: { blob: Blob; name: string }[] = []
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('galeri_file_') && value instanceof Blob && value.size > 0) {
      legacyGaleriEntries.push({
        blob: value,
        name: value instanceof File ? value.name : `galeri-${key}.jpg`,
      })
    }
  }
  if (legacyGaleriEntries.length > 0) {
    const legacyUrls = await uploadGaleriFiles(legacyGaleriEntries, user.id)
    uploadedGaleriUrls = [...uploadedGaleriUrls, ...legacyUrls]
  }

  // ── Susun array foto final ───────────────────────────────────────────
  // Urutan: foto utama → galeri lama (tidak dihapus) → galeri baru
  const allFotoUrls = [
    ...(primaryFotoUrl ? [primaryFotoUrl] : []),
    ...existingGaleriUrls.filter((u) => u !== primaryFotoUrl),
    ...uploadedGaleriUrls,
  ]

  const { error } = await supabase
    .from('wisata')
    .update({
      nama_wisata,
      deskripsi,
      harga_tiket,
      kuota_harian,
      foto_url: allFotoUrls[0] || null,
      foto_urls: allFotoUrls,
    })
    .eq('id', id)
    .eq('mitra_id', user.id)

  if (error) {
    return { error: 'Gagal memperbarui wisata: ' + error.message }
  }

  // ── Hapus file fisik galeri yang dihapus user dari Supabase Storage ──────
  if (deletedGaleriUrls.length > 0) {
    const serviceClient = createServiceClient()
    const BUCKET = 'guide-photos'
    const pathsToDelete = deletedGaleriUrls
      .map((url) => {
        try {
          const marker = `/object/public/${BUCKET}/`
          const idx = url.indexOf(marker)
          return idx !== -1 ? decodeURIComponent(url.slice(idx + marker.length)) : null
        } catch {
          return null
        }
      })
      .filter((p): p is string => p !== null)

    if (pathsToDelete.length > 0) {
      const { error: deleteError } = await serviceClient.storage
        .from(BUCKET)
        .remove(pathsToDelete)
      if (deleteError) {
        console.warn('[updateWisataAction] Gagal hapus file galeri dari Storage:', deleteError.message)
      } else {
        console.log('[updateWisataAction] File galeri dihapus dari Storage:', pathsToDelete)
      }
    }
  }

  revalidatePath('/dashboard/mitra-wisata')
  return { success: 'Berhasil memperbarui tempat wisata!' }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[updateWisataAction] Error parsing form:', msg)
    return { error: 'Terjadi kesalahan saat memproses formulir. Pastikan ukuran file tidak terlalu besar dan coba lagi.' }
  }
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
