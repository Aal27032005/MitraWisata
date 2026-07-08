/**
 * heicToJpeg.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Helper client-side untuk mendeteksi file HEIC/HEIF dari iOS dan
 * mengkonversinya ke JPEG sebelum ditampilkan sebagai preview atau
 * diunggah ke Supabase Storage.
 *
 * Lazy-load heic2any hanya saat dibutuhkan agar tidak menambah bundle size
 * untuk pengguna yang tidak menggunakan perangkat iOS.
 */

/**
 * Cek apakah file adalah HEIC/HEIF berdasarkan MIME type atau ekstensi nama file.
 */
export function isHeicFile(file: File): boolean {
  const heicMimes = ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence']
  if (heicMimes.includes(file.type.toLowerCase())) return true
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ext === 'heic' || ext === 'heif'
}

/**
 * Konversi file HEIC/HEIF ke File JPEG.
 * Jika file bukan HEIC, dikembalikan apa adanya tanpa konversi.
 *
 * @param file  - File input dari <input type="file">
 * @returns     - File JPEG hasil konversi, atau file asli jika bukan HEIC
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  if (!isHeicFile(file)) return file

  try {
    // Lazy-load heic2any — hanya diunduh saat benar-benar diperlukan
    const heic2any = (await import('heic2any')).default

    const converted = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.92,
    })

    // heic2any bisa mengembalikan Blob atau Blob[] (untuk multi-frame)
    const resultBlob = Array.isArray(converted) ? converted[0] : converted

    // Buat nama file baru dengan ekstensi .jpg
    const newName = file.name.replace(/\.(heic|heif)$/i, '.jpg')
    return new File([resultBlob], newName, { type: 'image/jpeg' })
  } catch (err) {
    console.warn('[heicToJpeg] Konversi HEIC gagal, menggunakan file asli:', err)
    // Fallback: kembalikan file asli agar upload tidak tertotal gagal
    return file
  }
}
