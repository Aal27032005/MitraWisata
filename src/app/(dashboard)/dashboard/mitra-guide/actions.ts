'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type GuideProfileActionState = {
  error?: string
  success?: string
} | null

// ── Helper: parse galeri dari berbagai format ─────────────────────────────────
// Client mengirim JSON.stringify(string[]) — kita perlu parse kembali.
// Handle juga kasus array native (dari DB langsung) dan null/undefined.
function parseGaleriFromFormData(raw: FormDataEntryValue | null): string[] {
  if (!raw || typeof raw !== 'string') return []
  const trimmed = raw.trim()
  if (!trimmed || trimmed === '[]') return []
  try {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) {
      return parsed.filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
    }
  } catch {
    // Bukan JSON — abaikan
  }
  return []
}

// ── Helper: upload satu file ke Supabase Storage ──────────────────────────────
// Menggunakan Service Role Key agar bebas dari batasan RLS bucket.
async function uploadFileToStorage(
  file: Blob,
  storagePath: string,
  contentType: string
): Promise<string | null> {
  const serviceClient = createServiceClient()

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  console.log(`[Storage] Memulai upload ke path: ${storagePath}, size: ${buffer.length} bytes, type: ${contentType}`)

  const { error: uploadError } = await serviceClient.storage
    .from('guide-photos')
    .upload(storagePath, buffer, {
      contentType: contentType || 'image/jpeg',
      upsert: true,
    })

  if (uploadError) {
    console.error(`[Storage] GAGAL upload ke ${storagePath}:`, uploadError.message)
    return null
  }

  const { data: urlData } = serviceClient.storage
    .from('guide-photos')
    .getPublicUrl(storagePath)

  console.log(`[Storage] Upload berhasil, public URL: ${urlData.publicUrl}`)
  return urlData.publicUrl
}

// ── Main Action ───────────────────────────────────────────────────────────────
export async function updateGuideProfileAction(
  state: GuideProfileActionState,
  formData: FormData
) {
  // ── 1. Ambil field teks ────────────────────────────────────────────────────
  const nama_lengkap = (formData.get('nama_lengkap') as string | null)?.trim() || ''
  const tarif_per_hari_raw = formData.get('tarif_per_hari') as string
  const keahlian = ((formData.get('keahlian') as string | null) || '').trim()
  const is_available = formData.get('is_available') === 'true'

  // URL foto profil lama sebagai fallback
  const existing_foto_profil_url =
    (formData.get('existing_foto_profil_url') as string | null)?.trim() || null

  // Galeri lama — dikirim client sebagai JSON string
  const existing_galeri_urls = parseGaleriFromFormData(formData.get('existing_galeri_urls'))

  // ── 2. Deteksi file baru ───────────────────────────────────────────────────
  // Di Server Actions Next.js, File dari FormData bisa berupa File atau Blob.
  // Kita cek dengan cara yang paling kompatibel: ambil sebagai Blob, cek size > 0.
  const fotoProfilEntry = formData.get('foto_profil_file')
  const fotoProfilBlob = fotoProfilEntry instanceof Blob ? fotoProfilEntry : null
  const hasFotoProfil = fotoProfilBlob !== null && fotoProfilBlob.size > 0

  // Nama file — tersedia jika instanceof File, gunakan fallback jika Blob biasa
  const fotoProfilName = (fotoProfilEntry instanceof File)
    ? fotoProfilEntry.name
    : 'foto-profil'

  console.log('[Action] foto_profil_file entry:', fotoProfilEntry)
  console.log('[Action] adalah Blob?', fotoProfilBlob !== null)
  console.log('[Action] hasFotoProfil:', hasFotoProfil, '| size:', fotoProfilBlob?.size ?? 0)
  console.log('[Action] existing_galeri_urls:', existing_galeri_urls)

  // Kumpulkan file galeri baru
  const galeriEntries: { blob: Blob; name: string }[] = []
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('galeri_file_') && value instanceof Blob && value.size > 0) {
      galeriEntries.push({
        blob: value,
        name: value instanceof File ? value.name : `galeri-${key}`,
      })
    }
  }
  console.log('[Action] galeri files diterima:', galeriEntries.length)

  // ── 3. Validasi field wajib ────────────────────────────────────────────────
  if (!nama_lengkap || !tarif_per_hari_raw || !keahlian) {
    return { error: 'Nama lengkap, tarif harian, dan keahlian wajib diisi.' }
  }

  const tarif_per_hari = parseInt(tarif_per_hari_raw, 10)
  if (isNaN(tarif_per_hari) || tarif_per_hari < 0) {
    return { error: 'Tarif per hari tidak valid.' }
  }

  // ── 4. Verifikasi sesi user ────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Sesi berakhir, silakan login kembali.' }
  }
  console.log('[Action] User ID:', user.id)

  // ── 5. Upload foto profil baru (jika ada) ─────────────────────────────────
  let foto_profil_url: string | null = existing_foto_profil_url

  if (hasFotoProfil) {
    const ext = fotoProfilName.split('.').pop()?.toLowerCase() || 'jpg'
    const contentType = fotoProfilBlob!.type || 'image/jpeg'
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const storagePath = `profiles/${user.id}-${Date.now()}-${randomSuffix}.${ext}`

    const uploadedUrl = await uploadFileToStorage(fotoProfilBlob!, storagePath, contentType)
    if (!uploadedUrl) {
      return { error: 'Gagal mengunggah foto profil ke Storage. Cek log terminal untuk detail.' }
    }
    foto_profil_url = uploadedUrl
  }

  // ── 6. Upload galeri baru secara SEKUENSIAL (satu per satu) ──────────────
  // Sequential dengan for...of mencegah:
  // (a) Tabrakan nama file — setiap file mendapat timestamp + random suffix unik
  // (b) Overload koneksi ke Supabase Storage saat upload banyak file sekaligus
  let foto_galeri_urls: string[] = [...existing_galeri_urls]

  if (galeriEntries.length > 0) {
    console.log('[Action] Mulai upload galeri sekuensial:', galeriEntries.length, 'file')
    for (let i = 0; i < galeriEntries.length; i++) {
      const { blob, name } = galeriEntries[i]
      const ext = name.split('.').pop()?.toLowerCase() || 'jpg'
      const contentType = blob.type || 'image/jpeg'
      // Timestamp diambil fresh per-iterasi + random suffix 6 karakter
      // untuk memastikan path benar-benar unik walaupun upload cepat
      const randomSuffix = Math.random().toString(36).substring(2, 8)
      const storagePath = `galleries/${user.id}-${Date.now()}-${randomSuffix}.${ext}`

      const uploadedUrl = await uploadFileToStorage(blob, storagePath, contentType)
      if (uploadedUrl) {
        foto_galeri_urls.push(uploadedUrl)
        console.log(`[Action] Galeri [${i + 1}/${galeriEntries.length}] berhasil:`, uploadedUrl)
      } else {
        console.warn(`[Action] Galeri [${i + 1}/${galeriEntries.length}] gagal, dilanjutkan ke berikutnya`)
      }
    }
    console.log('[Action] Selesai upload galeri. Total URL tersimpan:', foto_galeri_urls.length)
  }

  // ── 7. Update tabel users ──────────────────────────────────────────────────
  const { error: userError } = await supabase
    .from('users')
    .update({ nama_lengkap })
    .eq('id', user.id)

  if (userError) {
    return { error: 'Gagal memperbarui nama lengkap: ' + userError.message }
  }

  // ── 8. Upsert ke tabel guides menggunakan serviceClient ───────────────────
  // foto_galeri_urls dikirim sebagai native JS string[] — Supabase JS client
  // mengkonversinya ke format TEXT[] PostgreSQL secara otomatis.
  const serviceClient = createServiceClient()
  const { error: guideError } = await serviceClient
    .from('guides')
    .upsert(
      {
        mitra_id: user.id,
        tarif_per_hari,
        keahlian,
        is_available,
        foto_profil_url,
        foto_galeri_urls,
      },
      { onConflict: 'mitra_id' }
    )

  if (guideError) {
    console.error('[DB] Gagal upsert guides:', guideError.message)
    return { error: 'Gagal memperbarui profil: ' + guideError.message }
  }

  console.log('[Action] Profil berhasil disimpan. foto_profil_url:', foto_profil_url)
  revalidatePath('/dashboard/mitra-guide')
  return {
    success: 'Profil pemandu wisata berhasil diperbarui!',
    foto_profil_url,
    foto_galeri_urls,
  }
}

export async function toggleGuideAvailabilityAction(currentStatus: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Sesi berakhir, silakan login kembali.' }
  }

  const { error } = await supabase
    .from('guides')
    .update({ is_available: !currentStatus })
    .eq('mitra_id', user.id)

  if (error) {
    return { error: 'Gagal memperbarui status ketersediaan: ' + error.message }
  }

  revalidatePath('/dashboard/mitra-guide')
  return { success: 'Status ketersediaan berhasil diperbarui!' }
}
