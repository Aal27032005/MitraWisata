'use client'

import { useState, useEffect, useCallback } from 'react'
import { Images, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  galeriUrls: string[]
}

export default function GuideGalleryClient({ galeriUrls }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const isOpen = selectedIndex !== null
  const selectedUrl = selectedIndex !== null ? galeriUrls[selectedIndex] : null

  // ── Navigasi lightbox ────────────────────────────────────────────────
  const goPrev = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === null ? null : prev === 0 ? galeriUrls.length - 1 : prev - 1
    )
  }, [galeriUrls.length])

  const goNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === null ? null : prev === galeriUrls.length - 1 ? 0 : prev + 1
    )
  }, [galeriUrls.length])

  const close = useCallback(() => setSelectedIndex(null), [])

  // ── Keyboard: Esc tutup, panah kiri/kanan navigasi ───────────────────
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, close, goPrev, goNext])

  // ── Kunci scroll body saat lightbox terbuka ──────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* ── Section Galeri ─────────────────────────────────────────────── */}
      <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 space-y-4 dark:bg-slate-900/40 dark:border-slate-800">
        <h2 className="text-base font-bold text-slate-950 flex items-center gap-2 uppercase tracking-wider dark:text-white">
          <Images className="w-5 h-5 text-emerald-400" />
          Galeri Pengalaman &amp; Testimoni
        </h2>

        {galeriUrls.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {galeriUrls.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  aria-label={`Lihat foto galeri ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Galeri pengalaman ${idx + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </button>
              ))}
            </div>
            <p className="text-slate-400 text-[10px] leading-relaxed dark:text-slate-600">
              Klik foto untuk memperbesar. Gunakan tombol panah atau keyboard ← → untuk navigasi.
            </p>
          </>
        ) : (
          <p className="text-slate-400 text-xs italic text-center py-6 border border-dashed border-slate-200 rounded-xl dark:border-slate-800 dark:text-slate-600">
            Belum ada foto galeri pengalaman yang dibagikan.
          </p>
        )}
      </div>

      {/* ── Lightbox Modal ──────────────────────────────────────────────── */}
      {isOpen && selectedUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Tampilan foto besar"
        >
          {/* Container konten — hentikan propagasi klik agar tidak langsung tutup */}
          <div
            className="relative flex items-center justify-center w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol tutup */}
            <button
              type="button"
              onClick={close}
              className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors p-1"
              aria-label="Tutup lightbox"
            >
              <X className="w-7 h-7" />
            </button>

            {/* Tombol prev — hanya tampil jika lebih dari 1 foto */}
            {galeriUrls.length > 1 && (
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-0 -translate-x-12 text-white/70 hover:text-white transition-colors p-1 hidden sm:block"
                aria-label="Foto sebelumnya"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {/* Foto utama */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedUrl}
              alt={`Galeri besar ${(selectedIndex ?? 0) + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />

            {/* Tombol next — hanya tampil jika lebih dari 1 foto */}
            {galeriUrls.length > 1 && (
              <button
                type="button"
                onClick={goNext}
                className="absolute right-0 translate-x-12 text-white/70 hover:text-white transition-colors p-1 hidden sm:block"
                aria-label="Foto berikutnya"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}

            {/* Indikator posisi foto (mis. "2 / 5") */}
            {galeriUrls.length > 1 && (
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-xs font-medium tabular-nums">
                {(selectedIndex ?? 0) + 1} / {galeriUrls.length}
              </span>
            )}

            {/* Navigasi mobile — swipe-friendly row tombol prev/next di bawah foto */}
            {galeriUrls.length > 1 && (
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 sm:hidden">
                <button
                  type="button"
                  onClick={goPrev}
                  className="text-white/70 hover:text-white p-2"
                  aria-label="Foto sebelumnya"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="text-white/70 hover:text-white p-2"
                  aria-label="Foto berikutnya"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
