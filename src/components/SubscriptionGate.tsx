'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Crown,
  CheckCircle,
  Sparkles,
  Calendar,
  CalendarDays,
  QrCode,
  ShieldCheck,
  Zap,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { activateSubscriptionAction, type SubscriptionPlan } from '@/app/subscription/actions'

interface Props {
  /** 'inactive' = belum pernah berlangganan, 'expired' = sudah kadaluwarsa */
  status: 'inactive' | 'expired'
  /** Nama role untuk label display */
  roleLabel: string
  /** Tanggal kadaluwarsa (hanya diisi jika status === 'expired') */
  expiredAt?: string | null
}

type UIStep = 'pilih-paket' | 'payment-demo' | 'sukses'

const PLANS: {
  id: SubscriptionPlan
  label: string
  harga: number
  durasi: string
  icon: React.ReactNode
  badge?: string
  features: string[]
}[] = [
  {
    id: 'bulanan',
    label: 'Paket Bulanan',
    harga: 50_000,
    durasi: '30 hari',
    icon: <Calendar className="w-6 h-6" />,
    features: [
      'Akses penuh dashboard mitra',
      'Manajemen destinasi & booking',
      'Upload foto & galeri tanpa batas',
      'Laporan pendapatan real-time',
    ],
  },
  {
    id: 'tahunan',
    label: 'Paket Tahunan',
    harga: 450_000,
    durasi: '365 hari',
    icon: <CalendarDays className="w-6 h-6" />,
    badge: 'Hemat 25%',
    features: [
      'Semua fitur Paket Bulanan',
      'Prioritas tampil di pencarian',
      'Dukungan teknis prioritas',
      'Laporan analitik lanjutan',
    ],
  },
]

function formatRupiah(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

export default function SubscriptionGate({ status, roleLabel, expiredAt }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<UIStep>('pilih-paket')
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('bulanan')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  const planDetail = PLANS.find((p) => p.id === selectedPlan)!
  const qrSeed = `MITRAWISATA|SUB|${selectedPlan}|${planDetail.harga}|DEMO`

  const handlePilihPaket = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setStep('payment-demo')
    setErrorMsg('')
  }

  const handleSimulasiBayar = () => {
    setErrorMsg('')
    startTransition(async () => {
      const res = await activateSubscriptionAction(selectedPlan)
      if (res.error) {
        setErrorMsg(res.error)
        return
      }
      setSuccessMsg(res.success ?? 'Langganan berhasil diaktifkan!')
      setStep('sukses')
      // Tunggu sebentar agar user membaca pesan sukses, lalu refresh halaman
      setTimeout(() => {
        router.refresh()
      }, 1800)
    })
  }

  // ── STEP: SUKSES ─────────────────────────────────────────────────────
  if (step === 'sukses') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-950 dark:text-white">Langganan Aktif!</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed">{successMsg}</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Membuka dashboard…</span>
          </div>
        </div>
      </div>
    )
  }

  // ── STEP: PAYMENT DEMO ───────────────────────────────────────────────
  if (step === 'payment-demo') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
        {/* Glow */}
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

        {/* Header */}
        <header className="relative z-10 border-b border-slate-200 bg-white/80 dark:border-slate-900 dark:bg-slate-950/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setStep('pilih-paket')}
              className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              ← Kembali ke Pilih Paket
            </button>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">
              QRIS Demo — Subscription
            </span>
          </div>
        </header>

        <main className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:px-8">
          {/* Kiri: Invoice */}
          <section className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:p-8 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <QrCode className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl dark:text-white">
                    Invoice Aktivasi Langganan
                  </h1>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    Scan QRIS demo atau klik simulasi sukses untuk mengaktifkan paket.
                  </p>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-600 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errorMsg}
                </div>
              )}

              {/* Detail invoice */}
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Jenis Transaksi</span>
                  <span className="text-right font-bold text-slate-950 dark:text-white text-sm">Aktivasi Langganan SaaS</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Crown className="h-4 w-4 text-emerald-500" />
                    Paket Dipilih
                  </span>
                  <span className="text-right text-sm font-bold text-slate-950 dark:text-white">
                    {planDetail.label}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Clock className="h-4 w-4 text-emerald-500" />
                    Durasi Aktif
                  </span>
                  <span className="text-right text-sm font-bold text-slate-950 dark:text-white">
                    {planDetail.durasi}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Zap className="h-4 w-4 text-emerald-500" />
                    Tipe Akun
                  </span>
                  <span className="text-right text-sm font-bold text-slate-950 dark:text-white">
                    {roleLabel}
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/30 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-4 text-lg font-black text-slate-950 dark:text-white">
                  <span>Total Pembayaran</span>
                  <span className="text-emerald-500 dark:text-emerald-400">
                    {formatRupiah(planDetail.harga)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Kanan: QR + tombol simulasi */}
          <aside className="lg:col-span-5">
            <div className="sticky top-8 rounded-3xl border border-slate-200 bg-white/85 p-6 text-center shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/60">
              <div className="mx-auto mb-5 flex h-64 w-64 items-center justify-center rounded-3xl bg-white p-4 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrSeed)}`}
                  alt="QRIS pembayaran langganan MitraWisata"
                  className="h-full w-full rounded-2xl object-contain"
                />
              </div>
              <div className="mb-5 space-y-1">
                <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-950 dark:text-white">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                  QRIS Simulated Gateway
                </div>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-500">
                  Kode QR dibuat dinamis dari paket dan nominal langganan.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSimulasiBayar}
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/10 transition-colors hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
                {isPending ? 'Memproses…' : 'Simulasi Bayar Sukses'}
              </button>

              <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-200">
                Status langganan akan berubah menjadi <strong>Aktif</strong> setelah simulasi ini.
              </div>
            </div>
          </aside>
        </main>
      </div>
    )
  }

  // ── STEP: PILIH PAKET (default) ──────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-16 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/8 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/4 translate-y-1/4 w-[350px] h-[350px] rounded-full bg-blue-500/8 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl space-y-10">
        {/* Heading */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-500 mx-auto">
            <Crown className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            Aktifkan Langganan Anda
          </h1>
          {status === 'expired' && expiredAt ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
              Langganan Anda sebagai <strong className="text-slate-700 dark:text-slate-200">{roleLabel}</strong> telah berakhir
              pada{' '}
              <strong className="text-red-500">
                {new Date(expiredAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </strong>
              . Pilih paket di bawah untuk memperbarui akses dashboard.
            </p>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
              Untuk mengakses dashboard <strong className="text-slate-700 dark:text-slate-200">{roleLabel}</strong> dan mengelola
              bisnis pariwisata Anda, pilih paket langganan di bawah ini.
            </p>
          )}
        </div>

        {/* Kartu paket */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl border p-7 flex flex-col gap-5 transition-all duration-200 ${
                plan.id === 'tahunan'
                  ? 'border-emerald-500/40 bg-white/90 shadow-2xl shadow-emerald-500/10 dark:bg-slate-900/60 dark:border-emerald-500/30'
                  : 'border-slate-200 bg-white/80 shadow-xl dark:bg-slate-900/40 dark:border-slate-800'
              }`}
            >
              {/* Badge hemat */}
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-emerald-500/20">
                  {plan.badge}
                </span>
              )}

              {/* Icon + nama */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                    plan.id === 'tahunan'
                      ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-500'
                      : 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {plan.icon}
                </div>
                <div>
                  <div className="font-black text-slate-950 dark:text-white">{plan.label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Aktif selama {plan.durasi}</div>
                </div>
              </div>

              {/* Harga */}
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-3xl font-black ${
                    plan.id === 'tahunan' ? 'text-emerald-500' : 'text-slate-950 dark:text-white'
                  }`}
                >
                  {formatRupiah(plan.harga)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/ {plan.durasi}</span>
              </div>

              {/* Fitur */}
              <ul className="space-y-2 flex-grow">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                type="button"
                onClick={() => handlePilihPaket(plan.id)}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-black transition-colors ${
                  plan.id === 'tahunan'
                    ? 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-950'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Aktifkan Sekarang
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-600">
          Demo environment — tidak ada transaksi uang nyata. Pembayaran disimulasikan untuk keperluan presentasi.
        </p>
      </div>
    </div>
  )
}
