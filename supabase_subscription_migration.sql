-- ============================================================
-- MIGRASI: SaaS Subscription untuk MitraWisata
-- Jalankan seluruh isi file ini di Supabase Dashboard →
--   SQL Editor → New Query → Paste → Run
-- ============================================================

-- 1. Buat tabel subscriptions
--    Setiap mitra (mitra_wisata / mitra_guide) memiliki
--    tepat SATU baris berkat constraint UNIQUE (user_id).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role        TEXT NOT NULL CHECK (role IN ('mitra_wisata', 'mitra_guide')),
    status      TEXT NOT NULL DEFAULT 'inactive'
                    CHECK (status IN ('inactive', 'active', 'expired')),
    plan        TEXT CHECK (plan IN ('bulanan', 'tahunan')),
    created_at  TIMESTAMP WITH TIME ZONE
                    DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at  TIMESTAMP WITH TIME ZONE,
    updated_at  TIMESTAMP WITH TIME ZONE
                    DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

-- 2. Indeks untuk mempercepat lookup berdasarkan user_id
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
    ON public.subscriptions (user_id);

-- 3. Aktifkan Row Level Security (RLS)
-- ------------------------------------------------------------
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: user hanya bisa membaca baris miliknya sendiri
CREATE POLICY "User dapat membaca subscription miliknya"
    ON public.subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: user hanya bisa meng-insert baris untuk dirinya sendiri
CREATE POLICY "User dapat insert subscription miliknya"
    ON public.subscriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: user hanya bisa meng-update baris miliknya sendiri
CREATE POLICY "User dapat update subscription miliknya"
    ON public.subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 4. Migrasi data: buat baris 'inactive' untuk semua mitra
--    yang sudah terdaftar di tabel public.users TAPI belum
--    punya baris di tabel subscriptions ini.
--    (Aman dijalankan berulang kali — ON CONFLICT DO NOTHING)
-- ------------------------------------------------------------
INSERT INTO public.subscriptions (user_id, role, status)
SELECT
    u.id                AS user_id,
    u.role              AS role,
    'inactive'          AS status
FROM public.users u
WHERE u.role IN ('mitra_wisata', 'mitra_guide')
  AND NOT EXISTS (
      SELECT 1
      FROM public.subscriptions s
      WHERE s.user_id = u.id
  )
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- SELESAI
-- Setelah migrasi berhasil, uji dengan query berikut:
--   SELECT * FROM public.subscriptions;
-- ============================================================
