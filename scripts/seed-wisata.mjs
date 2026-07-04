import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

loadLocalEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const explorerApiUrl = process.env.EXPLORER_API_URL
const explorerApiKey = process.env.EXPLORER_API_KEY
const explicitMitraId = process.env.SEED_MITRA_ID
const seedLimit = Number.parseInt(process.env.SEED_LIMIT || '12', 10)

if (!supabaseUrl || !supabaseKey) {
  fail('NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY atau NEXT_PUBLIC_SUPABASE_ANON_KEY wajib tersedia.')
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

const mockDestinations = [
  {
    nama_wisata: 'Pantai Kuta Bali',
    lokasi: 'Badung, Bali',
    deskripsi: 'Pantai ikonik di Bali dengan hamparan pasir luas, matahari terbenam dramatis, dan akses mudah ke pusat kuliner serta belanja.',
    harga_tiket: 15000,
    kuota_harian: 350,
    foto_urls: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    nama_wisata: 'Candi Borobudur',
    lokasi: 'Magelang, Jawa Tengah',
    deskripsi: 'Kompleks candi Buddha terbesar di dunia dengan relief bersejarah, lanskap pegunungan, dan pengalaman sunrise yang sangat populer.',
    harga_tiket: 50000,
    kuota_harian: 500,
    foto_urls: [
      'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    nama_wisata: 'Gunung Bromo',
    lokasi: 'Probolinggo, Jawa Timur',
    deskripsi: 'Destinasi vulkanik legendaris dengan panorama kaldera, lautan pasir, dan sunrise dari Penanjakan yang menjadi favorit wisatawan.',
    harga_tiket: 35000,
    kuota_harian: 420,
    foto_urls: [
      'https://images.unsplash.com/photo-1589308454676-22fb8ce8f6d9?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    nama_wisata: 'Raja Ampat',
    lokasi: 'Papua Barat Daya',
    deskripsi: 'Surga bahari Indonesia dengan gugusan pulau karst, air laut jernih, dan biodiversitas bawah laut kelas dunia.',
    harga_tiket: 100000,
    kuota_harian: 180,
    foto_urls: [
      'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    nama_wisata: 'Danau Toba',
    lokasi: 'Sumatera Utara',
    deskripsi: 'Danau vulkanik terbesar di Asia Tenggara dengan Pulau Samosir, budaya Batak, dan panorama perbukitan yang menenangkan.',
    harga_tiket: 20000,
    kuota_harian: 300,
    foto_urls: [
      'https://images.unsplash.com/photo-1601058497548-f247dfe349d6?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    nama_wisata: 'Labuan Bajo',
    lokasi: 'Manggarai Barat, NTT',
    deskripsi: 'Gerbang menuju Taman Nasional Komodo, terkenal dengan pulau eksotis, sailing trip, snorkeling, dan pemandangan sunset.',
    harga_tiket: 75000,
    kuota_harian: 250,
    foto_urls: [
      'https://images.unsplash.com/photo-1586500036706-41963de24d8b?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    nama_wisata: 'Tangkuban Perahu',
    lokasi: 'Bandung Barat, Jawa Barat',
    deskripsi: 'Gunung berapi dengan kawah aktif yang mudah diakses, udara sejuk, dan legenda Sangkuriang yang melekat kuat.',
    harga_tiket: 30000,
    kuota_harian: 260,
    foto_urls: [
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    nama_wisata: 'Nusa Penida',
    lokasi: 'Klungkung, Bali',
    deskripsi: 'Pulau dengan tebing laut spektakuler, pantai tersembunyi, dan spot foto populer seperti Kelingking Beach dan Broken Beach.',
    harga_tiket: 25000,
    kuota_harian: 280,
    foto_urls: [
      'https://images.unsplash.com/photo-1573790387438-4da905039392?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    nama_wisata: 'Kawah Ijen',
    lokasi: 'Banyuwangi, Jawa Timur',
    deskripsi: 'Kawah vulkanik dengan fenomena blue fire, danau asam berwarna turquoise, serta jalur trekking malam yang menantang.',
    harga_tiket: 25000,
    kuota_harian: 220,
    foto_urls: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    nama_wisata: 'Mandalika',
    lokasi: 'Lombok Tengah, NTB',
    deskripsi: 'Kawasan wisata pesisir modern dengan pantai pasir putih, bukit hijau, budaya Sasak, dan area sport tourism internasional.',
    harga_tiket: 20000,
    kuota_harian: 360,
    foto_urls: [
      'https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    nama_wisata: 'Pulau Derawan',
    lokasi: 'Berau, Kalimantan Timur',
    deskripsi: 'Destinasi tropis untuk snorkeling, diving, penyu laut, dan laguna ubur-ubur yang menjadi daya tarik wisata bahari.',
    harga_tiket: 40000,
    kuota_harian: 200,
    foto_urls: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    nama_wisata: 'Tana Toraja',
    lokasi: 'Sulawesi Selatan',
    deskripsi: 'Kawasan budaya dengan rumah adat Tongkonan, lanskap pegunungan, tradisi unik, dan warisan budaya Toraja yang kuat.',
    harga_tiket: 30000,
    kuota_harian: 240,
    foto_urls: [
      'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80',
    ],
  },
]

async function main() {
  const mitraId = explicitMitraId || await findFirstMitraWisataId()
  if (!mitraId) {
    fail('Tidak menemukan user role mitra_wisata. Set SEED_MITRA_ID=<uuid user mitra_wisata> di .env.local atau buat akun mitra wisata terlebih dahulu.')
  }

  const source = await loadDestinations()
  const destinations = source.slice(0, Number.isFinite(seedLimit) && seedLimit > 0 ? seedLimit : source.length)
  const payload = destinations.map((item) => toWisataRow(item, mitraId, true))

  if (payload.length === 0) {
    fail('Tidak ada destinasi yang dapat di-seed.')
  }

  let { error } = await saveWisataRows(payload, mitraId)

  if (error && /foto_urls/i.test(error.message)) {
    console.warn('Kolom foto_urls belum tersedia di database remote. Seed dilanjutkan dengan foto_url utama saja.')
    const fallbackPayload = destinations.map((item) => toWisataRow(item, mitraId, false))
    const fallbackResult = await saveWisataRows(fallbackPayload, mitraId)
    error = fallbackResult.error
  }

  if (error) {
    fail(`Gagal seed wisata: ${error.message}`)
  }

  console.log(`Seed wisata selesai: ${payload.length} destinasi dimasukkan/diperbarui untuk mitra_id ${mitraId}.`)
  console.log(`Sumber data: ${explorerApiUrl ? 'API eksternal' : 'mock pariwisata Indonesia'}.`)
}

async function saveWisataRows(payload, mitraId) {
  const { data: existingRows, error: existingError } = await supabase
    .from('wisata')
    .select('id, nama_wisata')
    .eq('mitra_id', mitraId)

  if (existingError) {
    return { error: existingError }
  }

  const existingByName = new Map((existingRows || []).map((row) => [row.nama_wisata, row.id]))
  const rowsToInsert = []
  const rowsToUpdate = []

  for (const row of payload) {
    const existingId = existingByName.get(row.nama_wisata)
    if (existingId) {
      rowsToUpdate.push({ id: existingId, row })
    } else {
      rowsToInsert.push(row)
    }
  }

  if (rowsToInsert.length > 0) {
    const { error } = await supabase.from('wisata').insert(rowsToInsert)
    if (error) return { error }
  }

  for (const item of rowsToUpdate) {
    const { mitra_id, ...updatePayload } = item.row
    const { error } = await supabase
      .from('wisata')
      .update(updatePayload)
      .eq('id', item.id)
      .eq('mitra_id', mitra_id)

    if (error) return { error }
  }

  return { error: null }
}

async function loadDestinations() {
  if (!explorerApiUrl) {
    return mockDestinations
  }

  try {
    const headers = explorerApiKey ? { Authorization: `Bearer ${explorerApiKey}` } : undefined
    const response = await fetch(explorerApiUrl, { headers })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const json = await response.json()
    const records = Array.isArray(json) ? json : json.data || json.destinations || json.results || []
    const normalized = records.map(normalizeExternalDestination).filter(Boolean)
    return normalized.length > 0 ? normalized : mockDestinations
  } catch (error) {
    console.warn(`Gagal fetch API eksternal (${error.message}). Menggunakan mock dataset.`)
    return mockDestinations
  }
}

async function findFirstMitraWisataId() {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'mitra_wisata')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    fail(`Gagal mencari mitra wisata: ${error.message}`)
  }

  return data?.id || null
}

function normalizeExternalDestination(item) {
  const name = item.nama_wisata || item.name || item.title || item.nama || item.destination_name
  if (!name) return null

  const location = item.lokasi || item.location || item.address || item.city || item.region || 'Indonesia'
  const description = item.deskripsi || item.description || item.summary || item.content || `Destinasi wisata menarik di ${location}.`
  const photos = normalizePhotos(item.foto_urls || item.photos || item.images || item.gallery || item.image || item.foto_url)

  return {
    nama_wisata: String(name),
    lokasi: String(location),
    deskripsi: String(description),
    harga_tiket: toPositiveInteger(item.harga_tiket || item.ticket_price || item.price, 25000),
    kuota_harian: toPositiveInteger(item.kuota_harian || item.daily_quota || item.quota, 250),
    foto_urls: photos,
  }
}

function toWisataRow(item, mitraId, includeGallery) {
  const fotoUrls = normalizePhotos(item.foto_urls)
  const deskripsiDenganLokasi = item.lokasi
    ? `${item.deskripsi}\n\nLokasi: ${item.lokasi}`
    : item.deskripsi

  const row = {
    mitra_id: mitraId,
    nama_wisata: item.nama_wisata,
    deskripsi: deskripsiDenganLokasi,
    harga_tiket: toPositiveInteger(item.harga_tiket, 25000),
    kuota_harian: toPositiveInteger(item.kuota_harian, 250),
    foto_url: fotoUrls[0] || null,
  }

  if (includeGallery) {
    row.foto_urls = fotoUrls
  }

  return row
}

function normalizePhotos(value) {
  if (!value) return []
  const raw = Array.isArray(value) ? value : String(value).split(/[\n,]/)
  return raw
    .map((photo) => typeof photo === 'string' ? photo : photo?.url || photo?.src || photo?.image_url)
    .filter(Boolean)
    .map((photo) => String(photo).trim())
    .filter((photo) => /^https?:\/\//.test(photo))
}

function toPositiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return

  const content = readFileSync(envPath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue


    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '')
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

function fail(message) {
  console.error(message)
  process.exit(1)
}

main()
