import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * POST /api/upload-galeri
 *
 * Menerima satu file gambar (field name: "file") via multipart/form-data.
 * Mengupload ke Supabase Storage dan mengembalikan { url: string }.
 *
 * Digunakan oleh WisataDashboardClient untuk mengupload file galeri
 * satu per satu dari client sebelum memanggil Server Action,
 * sehingga Server Action hanya menerima string URL — bebas dari
 * error "Unexpected end of form" akibat payload multipart besar.
 */
export async function POST(req: NextRequest) {
  try {
    // Pastikan user sudah login
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof Blob) || file.size === 0) {
      return NextResponse.json({ error: 'File tidak valid atau kosong.' }, { status: 400 })
    }

    const originalName = file instanceof File ? file.name : 'galeri.jpg'
    const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg'
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const storagePath = `destinations/galleries/${user.id}-${Date.now()}-${randomSuffix}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const serviceClient = createServiceClient()
    const { error: uploadError } = await serviceClient.storage
      .from('guide-photos')
      .upload(storagePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      })

    if (uploadError) {
      console.error('[upload-galeri] Storage error:', uploadError.message)
      return NextResponse.json({ error: 'Gagal mengupload file: ' + uploadError.message }, { status: 500 })
    }

    const { data: urlData } = serviceClient.storage
      .from('guide-photos')
      .getPublicUrl(storagePath)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[upload-galeri] Unexpected error:', msg)
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}
