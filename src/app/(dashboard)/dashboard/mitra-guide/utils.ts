/**
 * Normalisasi kolom foto_galeri_urls dari database.
 * Kolom bertipe TEXT[] di PostgreSQL — Supabase JS client mengembalikannya
 * sebagai string[] langsung. Fungsi ini memastikan hasilnya selalu string[] bersih.
 */
export function parseGaleriUrls(raw: unknown): string[] {
  if (!raw) return []

  // Kasus normal: Supabase JS client sudah mengembalikan array native
  if (Array.isArray(raw)) {
    return raw.filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
  }

  // Fallback: jika karena suatu hal nilai tersimpan sebagai JSON string
  if (typeof raw === 'string' && raw.trim().length > 0) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
      }
    } catch {
      // Bukan JSON valid
    }
  }

  return []
}
