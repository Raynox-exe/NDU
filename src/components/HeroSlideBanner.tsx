import { useCallback, useEffect, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { INSTITUTIONAL_EASE } from './MotionPrimitives';

interface SlideItem {
  id: string;
  kicker: string;
  title: string;
  subtitle: string;
  accentBg: string;
  illustration: 'stacks' | 'digital' | 'campus' | 'journals';
  backgroundImageUrl?: string;
  imageAlt?: string;
}

const SLIDES: SlideItem[] = [
  {
    id: 'main-library',
    kicker: 'Wilberforce Island · Amassoma',
    title: 'NIGER DELTA UNIVERSITY LIBRARY',
    subtitle: 'Gateway to Scholarly Resources, Research & Academic Excellence',
    accentBg: 'from-[#0B3B69] via-[#0F4C81] to-[#14452F]',
    illustration: 'stacks',
    backgroundImageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/e/e5/Niger_Delta_University_Main_Gate%2C_Bayelsa.jpg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original',
    imageAlt: 'Niger Delta University Main Gate in Bayelsa State',
  },
  {
    id: 'digital-center',
    kicker: 'Second Floor · New Campus',
    title: 'DIGITAL LIBRARY & E-RESOURCES',
    subtitle: 'Access EBSCOHost, PubMed, HeinOnline, Law Pavilion & 600+ Open Access Journals',
    accentBg: 'from-[#14452F] via-[#134E4A] to-[#0B3B69]',
    illustration: 'digital',
    backgroundImageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ00nUQHcIeaDjZf_v69uUsrxNvEdn4hauemhMX7Z3feA&s=10',
    imageAlt: 'Niger Delta University Digital Library and E-Resources collections',
  },
  {
    id: 'faculty-network',
    kicker: '13 Campus & Faculty Libraries',
    title: 'DEPARTMENTAL JOURNAL ARCHIVE',
    subtitle: 'Curated open access e-journals organized faculty by faculty and department by department',
    accentBg: 'from-[#1E293B] via-[#0B3B69] to-[#1E3A8A]',
    illustration: 'journals',
    backgroundImageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDQSuZ4MvEwkULJPavAPzUwAyfwyd8kYbDn0yLv3-1bQ&s=10',
    imageAlt: 'Niger Delta University Departmental Journal Archive and Campus Library Network',
  },
  {
    id: 'conducive-study',
    kicker: 'Monday – Friday · 8:00am – 4:00pm',
    title: 'CONDUCIVE LEARNING ENVIRONMENT',
    subtitle: 'Physical reading rooms, Koha OPAC catalogue, bindery, and librarian research support',
    accentBg: 'from-[#0D3121] via-[#14452F] to-[#1C1917]',
    illustration: 'campus',
    backgroundImageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS711yFJrP4BkqXH2g6ODe5hJ05ve89knAvEgPSomI-Mw&s',
    imageAlt: 'Niger Delta University Library conducive learning and reading room environment',
  },
];

const TRACK_SLIDES = [
  { slide: SLIDES[SLIDES.length - 1], originalIndex: SLIDES.length - 1, isClone: true },
  ...SLIDES.map((slide, originalIndex) => ({ slide, originalIndex, isClone: false })),
  { slide: SLIDES[0], originalIndex: 0, isClone: true },
];

const AUTO_ADVANCE_MS = 6500;
const BOOK_SCROLL_DURATION = 0.72;

function SlideArtwork({ type, slideId }: { type: SlideItem['illustration']; slideId: string }) {
  const gradId = `shelfWarm-${slideId}`;

  if (type === 'stacks') {
    return (
      <svg viewBox="0 0 600 320" className="w-full h-full object-cover opacity-35" aria-hidden="true">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        {/* Perspective Library Bookshelves */}
        {[0, 1, 2, 3, 4].map((row) => (
          <g key={row} transform={`translate(0, ${row * 58 + 20})`}>
            <rect x="240" y="38" width="340" height="5" fill="#FDE68A" fillOpacity="0.4" />
            {Array.from({ length: 18 }).map((_, idx) => {
              const h = 24 + ((idx * 7 + row * 5) % 14);
              const w = 12 + ((idx * 3) % 6);
              const x = 250 + idx * 18;
              return (
                <rect
                  key={idx}
                  x={x}
                  y={38 - h}
                  width={w}
                  height={h}
                  rx="1.5"
                  fill={`url(#${gradId})`}
                  stroke="#FFFFFF"
                  strokeOpacity="0.25"
                />
              );
            })}
          </g>
        ))}
      </svg>
    );
  }

  if (type === 'digital') {
    return (
      <svg viewBox="0 0 600 320" className="w-full h-full object-cover opacity-35" aria-hidden="true">
        {/* Workstations & Network Grid */}
        <g stroke="#BAE6FD" strokeOpacity="0.35" fill="none">
          <circle cx="450" cy="160" r="110" strokeDasharray="4 6" />
          <circle cx="450" cy="160" r="72" />
          <rect x="330" y="90" width="90" height="58" rx="4" fill="#FFFFFF" fillOpacity="0.12" />
          <rect x="440" y="105" width="96" height="62" rx="4" fill="#FFFFFF" fillOpacity="0.12" />
          <rect x="375" y="175" width="110" height="66" rx="4" fill="#FFFFFF" fillOpacity="0.16" />
          <line x1="420" y1="241" x2="440" y2="262" strokeWidth="3" />
          <line x1="395" y1="262" x2="465" y2="262" strokeWidth="3" />
        </g>
      </svg>
    );
  }

  if (type === 'journals') {
    return (
      <svg viewBox="0 0 600 320" className="w-full h-full object-cover opacity-35" aria-hidden="true">
        <g fill="#FFFFFF" fillOpacity="0.14" stroke="#E2E8F0" strokeOpacity="0.3">
          <rect x="320" y="38" width="95" height="122" rx="3" />
          <rect x="432" y="54" width="95" height="122" rx="3" />
          <rect x="360" y="148" width="110" height="132" rx="3" />
          <line x1="336" y1="68" x2="395" y2="68" strokeWidth="2" />
          <line x1="336" y1="84" x2="380" y2="84" strokeWidth="2" />
          <line x1="382" y1="184" x2="448" y2="184" strokeWidth="2" />
          <line x1="382" y1="202" x2="430" y2="202" strokeWidth="2" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 600 320" className="w-full h-full object-cover opacity-35" aria-hidden="true">
      {/* Architectural Arches */}
      <g stroke="#FDE68A" strokeOpacity="0.35" fill="none" strokeWidth="2">
        <path d="M280 280V140C280 95 315 60 360 60C405 60 440 95 440 140V280" />
        <path d="M440 280V140C440 95 475 60 520 60C565 60 600 95 600 140V280" />
        <line x1="250" y1="280" x2="600" y2="280" />
      </g>
    </svg>
  );
}

interface HeroSlideBannerProps {
  mode: 'home' | 'digital';
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
}

export function HeroSlideBanner({
  mode,
  onPrimaryAction,
  primaryActionLabel,
}: HeroSlideBannerProps) {
  // Track index 1..SLIDES.length maps to real slides; 0 and length+1 are seamless wrap clones.
  const [trackIndex, setTrackIndex] = useState(mode === 'digital' ? 2 : 1);
  const [isInstantReset, setIsInstantReset] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const pointerStartXRef = useRef<number | null>(null);
  const wheelLockRef = useRef<number>(0);

  const realIndex = (trackIndex - 1 + SLIDES.length) % SLIDES.length;

  // Subtle vertical parallax on SVG background artwork when scrolling the page
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const artworkParallaxY = useTransform(scrollYProgress, [0, 1], [-18, 22]);

  useEffect(() => {
    setIsInstantReset(true);
    setTrackIndex(mode === 'digital' ? 2 : 1);
  }, [mode]);

  // Re-enable smooth book-page transitions after an instant boundary wrap snap
  useEffect(() => {
    if (!isInstantReset) return;
    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        setIsInstantReset(false);
      });
    });
    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  }, [isInstantReset]);

  const handleNext = useCallback(() => {
    setTrackIndex((prev) => {
      if (prev >= TRACK_SLIDES.length - 1) return prev;
      return prev + 1;
    });
  }, []);

  const handlePrev = useCallback(() => {
    setTrackIndex((prev) => {
      if (prev <= 0) return prev;
      return prev - 1;
    });
  }, []);

  const handleTrackAnimationComplete = useCallback(() => {
    if (trackIndex === TRACK_SLIDES.length - 1) {
      setIsInstantReset(true);
      setTrackIndex(1);
    } else if (trackIndex === 0) {
      setIsInstantReset(true);
      setTrackIndex(SLIDES.length);
    }
  }, [trackIndex]);

  useEffect(() => {
    if (isPaused || isDragging) return;
    const timer = window.setInterval(() => {
      handleNext();
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [isPaused, isDragging, handleNext]);

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    // Ignore drag initiation on interactive buttons inside slides
    if ((e.target as HTMLElement).closest('button, a')) return;
    pointerStartXRef.current = e.clientX;
    setIsDragging(true);
    setDragOffsetPx(0);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || pointerStartXRef.current === null) return;
    const delta = e.clientX - pointerStartXRef.current;
    setDragOffsetPx(delta);
  };

  const finishPointerDrag = () => {
    if (!isDragging) return;
    const threshold = 55;
    if (dragOffsetPx <= -threshold) {
      handleNext();
    } else if (dragOffsetPx >= threshold) {
      handlePrev();
    }
    pointerStartXRef.current = null;
    setIsDragging(false);
    setDragOffsetPx(0);
  };

  const handleWheel = (e: WheelEvent<HTMLElement>) => {
    // Allow horizontal trackpad swipe to turn pages forward/backward
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 22) {
      const now = Date.now();
      if (now - wheelLockRef.current < 550) return;
      wheelLockRef.current = now;
      if (e.deltaX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Library Highlights Carousel"
      aria-roledescription="carousel"
      tabIndex={0}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        finishPointerDrag();
      }}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onWheel={handleWheel}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleNext();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrev();
        }
      }}
      className="relative overflow-hidden rounded-lg border border-stone-200/80 bg-[#072644] text-white select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B3B69]"
    >
      {/* Continuous Book-Page Horizontal Viewport & Track */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointerDrag}
        onPointerCancel={finishPointerDrag}
        className={`relative overflow-hidden [perspective:1600px] ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <motion.div
          initial={false}
          animate={{ x: `calc(-${trackIndex * 100}% + ${dragOffsetPx}px)` }}
          transition={
            isDragging || isInstantReset
              ? { duration: 0 }
              : { duration: BOOK_SCROLL_DURATION, ease: INSTITUTIONAL_EASE }
          }
          onAnimationComplete={handleTrackAnimationComplete}
          className="flex w-full will-change-transform [transform-style:preserve-3d]"
        >
          {TRACK_SLIDES.map(({ slide, originalIndex, isClone }, trackIdx) => {
            const isCurrent = trackIdx === trackIndex;
            const isOutgoingLeft = trackIdx < trackIndex;
            const displayTitle =
              mode === 'digital' && originalIndex === 1
                ? 'DIGITAL LIBRARY RESOURCES AND SERVICES'
                : mode === 'home' && originalIndex === 0
                ? 'WELCOME TO NIGER DELTA UNIVERSITY LIBRARY'
                : slide.title;

            const isMainH1 = mode === 'home' && !isClone && originalIndex === 0;

            return (
              <motion.div
                key={`track-${trackIdx}-${slide.id}`}
                role={isClone ? undefined : 'group'}
                aria-roledescription={isClone ? undefined : 'slide'}
                aria-label={
                  isClone
                    ? undefined
                    : `Page ${originalIndex + 1} of ${SLIDES.length}: ${displayTitle}`
                }
                aria-hidden={!isCurrent || isClone}
                initial={false}
                animate={{
                  scale: isCurrent ? 1 : 0.965,
                  rotateY: isCurrent ? 0 : isOutgoingLeft ? -7 : 7,
                  opacity: isCurrent ? 1 : 0.72,
                }}
                transition={
                  isInstantReset || isDragging
                    ? { duration: 0 }
                    : { duration: BOOK_SCROLL_DURATION, ease: INSTITUTIONAL_EASE }
                }
                className={`relative w-full shrink-0 min-h-[265px] sm:min-h-[296px] bg-gradient-to-br ${slide.accentBg} origin-center border-l border-white/15 shadow-[-20px_0_38px_rgba(4,12,24,0.52)]`}
              >
                {/* Book Spine & Page Edge Highlight for visible page-scroll separation */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 z-20 w-8 bg-gradient-to-r from-black/30 via-black/10 to-transparent"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-0 z-20 w-6 bg-gradient-to-l from-black/25 to-transparent"
                />

                {/* Parallax Campus Photo or Architectural SVG Illustration Background */}
                <motion.div
                  style={{ y: artworkParallaxY }}
                  className="pointer-events-none absolute -inset-y-6 inset-x-0"
                >
                  {slide.backgroundImageUrl ? (
                    <img
                      src={slide.backgroundImageUrl}
                      alt={slide.imageAlt ?? displayTitle}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-center opacity-80"
                    />
                  ) : (
                    <SlideArtwork type={slide.illustration} slideId={`track-${trackIdx}-${slide.id}`} />
                  )}
                </motion.div>

                {/* Scrim for guaranteed >= 4.5:1 text contrast */}
                <div
                  className={`pointer-events-none absolute inset-0 ${
                    slide.backgroundImageUrl
                      ? 'bg-gradient-to-r from-[#071D35]/92 via-[#092746]/74 to-[#092746]/25'
                      : 'bg-gradient-to-r from-[#091E36]/88 via-[#0B3B69]/72 to-transparent'
                  }`}
                />

                {/* Slide Copy Content with Page-Drift Motion */}
                <div className="relative z-10 flex flex-col justify-between gap-6 p-6 pb-20 sm:p-9 sm:pb-22 lg:p-10 lg:pb-22 min-h-[265px] sm:min-h-[296px]">
                  <motion.div
                    initial={false}
                    animate={{
                      opacity: isCurrent ? 1 : 0.4,
                      x: isCurrent ? 0 : isOutgoingLeft ? -24 : 24,
                    }}
                    transition={
                      isInstantReset
                        ? { duration: 0 }
                        : { duration: 0.56, ease: INSTITUTIONAL_EASE }
                    }
                    className="max-w-2xl space-y-2.5 text-left"
                  >
                    <p className="text-xs font-semibold tracking-[0.12em] uppercase text-amber-200/95">
                      {slide.kicker}
                    </p>
                    {isMainH1 ? (
                      <h1 className="font-serif text-2xl sm:text-3xl lg:text-[2.15rem] font-semibold tracking-tight leading-[1.16] text-white [text-wrap:balance]">
                        {displayTitle}
                      </h1>
                    ) : (
                      <h2 className="font-serif text-2xl sm:text-3xl lg:text-[2.15rem] font-semibold tracking-tight leading-[1.16] text-white [text-wrap:balance]">
                        {displayTitle}
                      </h2>
                    )}
                    <p className="text-sm sm:text-base text-slate-100/90 max-w-xl leading-relaxed">
                      {slide.subtitle}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Persistent Carousel Bottom Controls Bar */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-6 py-4 sm:px-9 lg:px-10 bg-gradient-to-t from-black/45 to-transparent">
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-white/15">
          <div className="flex items-center gap-3 min-w-0">
            {onPrimaryAction && primaryActionLabel && (
              <button
                type="button"
                onClick={onPrimaryAction}
                className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-xs sm:text-sm font-semibold text-stone-950 hover:bg-amber-400 active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {primaryActionLabel}
              </button>
            )}
          </div>

          {/* Slide Dots + Prev / Next Arrow Controls */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-1.5 mr-1" role="tablist" aria-label="Slide indicators">
              {SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={idx === realIndex}
                  aria-label={`Show slide ${idx + 1}: ${s.title}`}
                  onClick={() => setTrackIndex(idx + 1)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === realIndex ? 'w-6 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous slide"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/30 bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next slide"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/40 bg-white/15 text-white hover:bg-white/25 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Auto-Scroll Progress Hairline */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[3px] bg-white/10 overflow-hidden">
        {!isPaused && !isDragging && (
          <motion.div
            key={`${realIndex}-${mode}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: AUTO_ADVANCE_MS / 1000, ease: 'linear' }}
            className="h-full w-full origin-left bg-amber-400/90"
          />
        )}
      </div>
    </section>
  );
}
