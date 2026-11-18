import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  MessageSquare,
  MapPin,
  ArrowUpRight,
  Check,
  Navigation,
} from 'lucide-react';
import {
  WORKSHOP_LOCATION,
  getWhatsAppBookingUrl,
} from './data/paintShopData';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { KurchatovMapSection } from './components/KurchatovMapSection';

export default function App() {
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  const primaryWhatsAppUrl = getWhatsAppBookingUrl();

  return (
    <div className="min-h-screen bg-[#07090E] text-[#F3F5F8] flex flex-col selection:bg-[#FF5A1F] selection:text-white">
      {/* Required Google Maps Platform Demo Key Quota Banner (Only shown if quota event fires) */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Bar Contract: Strictly 1 row, 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 bg-[#07090E]/85 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#hero"
            className="text-lg sm:text-xl font-bold tracking-tight text-white font-display whitespace-nowrap shrink-0"
          >
            KURCHATOV PAINT
          </a>

          {/* Zone 2: Concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a
              href="#hero"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Примеры До и После
            </a>
            <a
              href="#directions"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Как проехать
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action redirecting directly to WhatsApp */}
          <div className="flex items-center shrink-0">
            <a
              href={primaryWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#FF5A1F] hover:bg-[#FF743D] rounded-xl shadow-[0_4px_20px_rgba(255,90,31,0.4)] transition-all duration-150 whitespace-nowrap shrink-0"
            >
              Записаться в WhatsApp
            </a>
          </div>
        </div>
      </header>

      {/* Main Content: Strictly Hero + Before/After Showcase + Google Maps Directions */}
      <main className="flex-1">
        <section
          id="hero"
          className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 overflow-hidden"
        >
          {/* Ambient Motion Design Spotlights */}
          <div
            className="pointer-events-none absolute -top-36 left-1/4 w-[560px] h-[560px] rounded-full bg-[#FF5A1F]/12 blur-[140px]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute bottom-0 right-10 w-[440px] h-[440px] rounded-full bg-amber-500/8 blur-[130px]"
            aria-hidden="true"
          />

          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Column: Kinetic Value Proposition & WhatsApp CTA (5 cols) */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-5 flex flex-col justify-between bg-[#10141D]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-9 shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
              >
                <div className="space-y-6">
                  {/* Unboxed Regional Kicker */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="text-[#FF5A1F] font-semibold">
                      {WORKSHOP_LOCATION.city}, {WORKSHOP_LOCATION.streetAddress}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Казахстан</span>
                  </div>

                  <h1
                    className="font-bold text-white tracking-tight leading-[1.06] text-balance"
                    style={{ fontSize: 'clamp(2.25rem, 3.6vw, 3.5rem)' }}
                  >
                    Покраска автомобилей под ключ от{' '}
                    <span className="text-[#FF5A1F] font-mono-num">50 000 ₸</span>
                  </h1>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    Профессиональная камера окраски и сушки в г. Курчатов. Возвращаем заводской зеркальный глянец, восстанавливаем геометрию кузова и подбираем цвет со 100% точностью.
                  </p>

                  {/* Clean Technical Highlights */}
                  <ul className="space-y-3 pt-1 text-xs sm:text-sm text-slate-200">
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                      <span>Покраска под ключ с материалами — от 50 000 ₸</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                      <span>Безпылевая камера 60 °C и заводская шагрень</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                      <span>Быстрая оценка по фото и запись через WhatsApp</span>
                    </li>
                  </ul>
                </div>

                {/* Primary WhatsApp CTA & Quick Jump to Google Map */}
                <div className="pt-8 mt-8 border-t border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <a
                      href={primaryWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-4 px-6 rounded-2xl bg-[#FF5A1F] hover:bg-[#FF743D] text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-[0_10px_32px_rgba(255,90,31,0.4)] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 shrink-0" />
                      <span>Записаться в WhatsApp</span>
                      <ArrowUpRight className="w-4 h-4 shrink-0" />
                    </a>

                    <a
                      href="#directions"
                      className="py-4 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/10 transition-colors whitespace-nowrap shrink-0"
                    >
                      <Navigation className="w-4 h-4 text-[#FF5A1F]" />
                      <span>Как проехать</span>
                    </a>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#FF5A1F]" />
                      <span>{WORKSHOP_LOCATION.city}, {WORKSHOP_LOCATION.streetAddress}</span>
                    </span>
                    <span className="font-mono-num text-slate-300">
                      {WORKSHOP_LOCATION.dmsCoordinates}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Interactive Before / After Showcase (7 cols) */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-7 flex flex-col"
              >
                <BeforeAfterSlider />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Google Maps "Как проехать" Section */}
        <KurchatovMapSection />
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-white/10 bg-[#05070B] py-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-white font-display">
              KURCHATOV PAINT
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {WORKSHOP_LOCATION.fullAddress} ({WORKSHOP_LOCATION.dmsCoordinates})
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#hero" className="hover:text-white transition-colors">
              До и После
            </a>
            <a href="#directions" className="hover:text-white transition-colors">
              Карта Google Maps
            </a>
            <a
              href={primaryWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF5A1F] font-semibold hover:underline"
            >
              Записаться в WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
