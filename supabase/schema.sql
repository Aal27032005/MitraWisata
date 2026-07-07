-- Aktifkan ekstensi UUID jika belum aktif (berguna untuk Supabase/PostgreSQL standar)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL: users (Sinkron atau dikelola bersama Auth Provider)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CONSTRAINT chk_user_role CHECK (role IN ('admin', 'mitra_wisata', 'mitra_guide', 'customer')),
    nama_lengkap VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL: wisata (Milik 'mitra_wisata')
CREATE TABLE IF NOT EXISTS wisata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mitra_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nama_wisata VARCHAR(255) NOT NULL,
    deskripsi TEXT NOT NULL,
    harga_tiket INT NOT NULL CONSTRAINT chk_harga_tiket CHECK (harga_tiket >= 0),
    kuota_harian INT NOT NULL CONSTRAINT chk_kuota_harian CHECK (kuota_harian >= 0),
    foto_url TEXT,
    foto_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Migrasi aman untuk database yang sudah terlanjur dibuat sebelum fitur galeri.
ALTER TABLE wisata ADD COLUMN IF NOT EXISTS foto_urls TEXT[] DEFAULT '{}';

-- Dipakai skrip seed agar import dapat diulang tanpa menggandakan destinasi mitra yang sama.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'wisata_mitra_nama_unique'
    ) THEN
        ALTER TABLE wisata ADD CONSTRAINT wisata_mitra_nama_unique UNIQUE (mitra_id, nama_wisata);
    END IF;
END $$;

-- 3. TABEL: guides (Milik 'mitra_guide')
CREATE TABLE IF NOT EXISTS guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mitra_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    tarif_per_hari INT NOT NULL CONSTRAINT chk_tarif_per_hari CHECK (tarif_per_hari >= 0),
    keahlian TEXT NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    foto_profil_url TEXT,
    foto_galeri_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Migrasi aman untuk database guides yang sudah terlanjur dibuat sebelum fitur foto.
ALTER TABLE guides ADD COLUMN IF NOT EXISTS foto_profil_url TEXT;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS foto_galeri_urls TEXT[] DEFAULT '{}';

-- 4. TABEL: bookings (Dibuat oleh 'customer')
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    wisata_id UUID NOT NULL REFERENCES wisata(id) ON DELETE RESTRICT,
    guide_id UUID REFERENCES guides(id) ON DELETE SET NULL, -- Boleh NULL jika tidak sewa guide
    tanggal_kunjungan DATE NOT NULL,
    jumlah_tiket INT NOT NULL CONSTRAINT chk_jumlah_tiket CHECK (jumlah_tiket > 0),
    total_harga INT NOT NULL CONSTRAINT chk_total_harga CHECK (total_harga >= 0),
    status VARCHAR(50) DEFAULT 'pending' NOT NULL CONSTRAINT chk_booking_status CHECK (status IN ('pending', 'success', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indeks untuk meningkatkan performa query relasional
CREATE INDEX IF NOT EXISTS idx_wisata_mitra ON wisata(mitra_id);
CREATE INDEX IF NOT EXISTS idx_guides_mitra ON guides(mitra_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_wisata ON bookings(wisata_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guide ON bookings(guide_id);

-- 5. TABEL: subscriptions (SaaS subscription untuk mitra_wisata dan mitra_guide)
-- Setiap mitra memiliki tepat satu baris di tabel ini.
-- status: 'inactive' (default/belum bayar), 'active' (berlangganan aktif), 'expired' (kadaluwarsa)
-- plan: 'bulanan' (30 hari, Rp 50.000), 'tahunan' (365 hari, Rp 450.000), atau NULL jika belum pilih
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    subscription_status TEXT NOT NULL DEFAULT 'inactive'
        CONSTRAINT chk_subscription_status CHECK (subscription_status IN ('inactive', 'active', 'expired')),
    subscription_plan TEXT
        CONSTRAINT chk_subscription_plan CHECK (subscription_plan IN ('bulanan', 'tahunan') OR subscription_plan IS NULL),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indeks untuk query cepat berdasarkan user_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);

-- Migrasi aman: pastikan semua mitra yang sudah ada mendapat baris subscription 'inactive'
-- Jalankan ini setelah CREATE TABLE di atas.
INSERT INTO subscriptions (user_id, subscription_status)
SELECT id, 'inactive'
FROM users
WHERE role IN ('mitra_wisata', 'mitra_guide')
  AND id NOT IN (SELECT user_id FROM subscriptions)
ON CONFLICT (user_id) DO NOTHING;
