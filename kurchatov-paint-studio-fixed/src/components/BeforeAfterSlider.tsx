import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MoveHorizontal, Sparkles, MessageSquare, ArrowUpRight } from 'lucide-react';
import { BEFORE_AFTER_CASES, getWhatsAppBookingUrl } from '../data/paintShopData';

export const BeforeAfterSlider: React.FC = () => {
  const [activeCaseIndex, setActiveCaseIndex] = useState<number>(0);
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [beforeImgError, setBeforeImgError] = useState<Record<string, boolean>>({});
  const [afterImgError, setAfterImgError] = useState<Record<string, boolean>>({});

  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentCase = BEFORE_AFTER_CASES[activeCaseIndex];

  const updateSliderFromClientX = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const percentage = Math.max(3, Math.min(97, (offsetX / rect.width) * 100));
    setSliderPosition(Math.round(percentage));
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateSliderFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateSliderFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderPosition((prev) => Math.max(5, prev - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPosition((prev) => Math.min(95, prev + 5));
    }
  };

  const caseWhatsAppUrl = getWhatsAppBookingUrl(
    `Здравствуйте! Пишу с сайта Kurchatov Paint (г. Курчатов, ул. Иртышская). Понравился пример «${currentCase.title}», хочу записаться на покраску авто под ключ (от 50 000 ₸).`
  );

  return (
    <div className="flex flex-col h-full justify-between bg-[#10141D]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-6 shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
      {/* Top Bar of Comparator: Case Switcher & View Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-1.5 p-1 bg-[#07090E] rounded-2xl border border-white/5 overflow-x-auto">
          {BEFORE_AFTER_CASES.map((item, idx) => {
            const isActive = idx === activeCaseIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveCaseIndex(idx);
                  setSliderPosition(50);
                }}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#FF5A1F] text-white shadow-[0_4px_16px_rgba(255,90,31,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Пример 0{idx + 1}
              </button>
            );
          })}
        </div>

        {/* Quick Position Toggle Controls */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setSliderPosition(90)}
            className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              sliderPosition > 70
                ? 'bg-white/15 text-white font-semibold'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            До покраски
          </button>
          <button
            type="button"
            onClick={() => setSliderPosition(50)}
            className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              sliderPosition >= 30 && sliderPosition <= 70
                ? 'bg-white/15 text-white font-semibold'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            50 / 50
          </button>
          <button
            type="button"
            onClick={() => setSliderPosition(10)}
            className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              sliderPosition < 30
                ? 'bg-white/15 text-white font-semibold'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            Результат
          </button>
        </div>
      </div>

      {/* Interactive Drag/Touch Comparison Stage */}
      <div
        ref={containerRef}
        role="slider"
        tabIndex={0}
        aria-label="Интерактивный слайдер сравнения автомобиля до и после покраски"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={sliderPosition}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        className="relative my-4 aspect-16/10 w-full rounded-2xl overflow-hidden select-none cursor-ew-resize border border-white/10 bg-[#07090E] focus-visible:outline-2 focus-visible:outline-[#FF5A1F] group"
      >
        {/* Base Layer: AFTER Image */}
        <div className="absolute inset-0 w-full h-full">
          {!afterImgError[currentCase.id] ? (
            <img
              src={currentCase.afterImage}
              alt={`После покраски: ${currentCase.title}`}
              referrerPolicy="no-referrer"
              onError={() =>
                setAfterImgError((prev) => ({ ...prev, [currentCase.id]: true }))
              }
              className="w-full h-full object-cover pointer-events-none transition-transform duration-300 group-hover:scale-[1.01]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#181D27] via-[#12161F] to-[#2A1912] flex flex-col items-center justify-center p-6 text-center">
              <Sparkles className="w-10 h-10 text-[#FF5A1F] mb-2" />
              <p className="text-sm font-semibold text-white">После покраски под ключ</p>
              <p className="text-xs text-slate-400 mt-1">{currentCase.carModel}</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/35 pointer-events-none" />
          <div className="absolute top-3.5 right-3.5 px-3.5 py-1.5 rounded-xl bg-black/75 backdrop-blur-md text-xs font-semibold text-[#FF5A1F] border border-[#FF5A1F]/40 pointer-events-none whitespace-nowrap">
            ПОСЛЕ · Зеркальный глянец ({currentCase.microns})
          </div>
        </div>

        {/* Clipped Layer: BEFORE Image */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
          style={{
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
        >
          {!beforeImgError[currentCase.id] ? (
            <img
              src={currentCase.beforeImage}
              alt={`До покраски: ${currentCase.title}`}
              referrerPolicy="no-referrer"
              onError={() =>
                setBeforeImgError((prev) => ({ ...prev, [currentCase.id]: true }))
              }
              className="w-full h-full object-cover pointer-events-none filter contrast-105 saturate-75 transition-transform duration-300 group-hover:scale-[1.01]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-900 to-stone-800 flex flex-col items-center justify-center p-6 text-center">
              <p className="text-sm font-semibold text-slate-200">До кузовного ремонта</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/35" />
          <div className="absolute top-3.5 left-3.5 px-3.5 py-1.5 rounded-xl bg-black/75 backdrop-blur-md text-xs font-semibold text-slate-200 border border-white/20 whitespace-nowrap">
            ДО · Поврежденная деталь
          </div>
        </div>

        {/* Kinetic Divider Line & Handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[#FF5A1F] shadow-[0_0_24px_rgba(255,90,31,1)] pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#FF5A1F] text-white shadow-[0_0_25px_rgba(255,90,31,0.85)] border-2 border-white flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
            <MoveHorizontal className="w-5 h-5" />
          </div>
        </div>

        {/* Bottom Scrim Bar inside Viewport */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 pointer-events-none">
          <div className="text-xs text-slate-200 font-medium">
            {currentCase.carModel}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300 font-mono-num">
            <span>Срок: {currentCase.durationDays}</span>
            <span aria-hidden="true">·</span>
            <span>ЛКП: {currentCase.microns}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#FF5A1F] font-semibold">{currentCase.priceText}</span>
          </div>
        </div>
      </div>

      {/* Animated Case Info Footer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCase.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1 items-center"
        >
          <div className="md:col-span-8 space-y-1">
            <div className="text-xs text-[#FF5A1F] font-medium">
              {currentCase.tag}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
              {currentCase.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {currentCase.summary}
            </p>
          </div>

          <div className="md:col-span-4 flex flex-col items-stretch sm:items-end justify-end gap-2">
            <a
              href={caseWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FF5A1F] hover:bg-[#FF743D] text-white text-xs sm:text-sm font-semibold shadow-[0_8px_24px_rgba(255,90,31,0.35)] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Записаться в WhatsApp</span>
              <ArrowUpRight className="w-4 h-4 shrink-0" />
            </a>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
