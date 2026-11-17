import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { LIBRARY_SERVICES, type LibraryServiceItem } from '../data/libraryMeta';
import { INSTITUTIONAL_EASE } from './MotionPrimitives';
import { NduCrest } from './NduCrest';

export type AppPage = 'home' | 'about' | 'services' | 'digital-library' | 'news' | 'contact';

interface HeaderNavProps {
  activePage: AppPage;
  onNavigate: (page: AppPage, serviceId?: string) => void;
  onOpenJournals: () => void;
}

export function HeaderNav({ activePage, onNavigate, onOpenJournals }: HeaderNavProps) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesExpanded, setMobileServicesExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelectService = (svc: LibraryServiceItem) => {
    setServicesOpen(false);
    setMobileMenuOpen(false);
    if (svc.actionType === 'digital-library') {
      onNavigate('digital-library');
    } else if (svc.actionType === 'journals') {
      onOpenJournals();
    } else {
      onNavigate('services', svc.id);
    }
  };

  const handleNavClick = (page: AppPage) => {
    setServicesOpen(false);
    setMobileMenuOpen(false);
    onNavigate(page);
  };

  const navLinkClass = (isActive: boolean) =>
    `relative inline-flex items-center h-9 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
      isActive ? 'text-[#0B3B69]' : 'text-stone-700 hover:text-[#0B3B69]'
    }`;

  const ActiveUnderline = () => (
    <motion.span
      layoutId="nav-active-underline"
      transition={{ duration: 0.28, ease: INSTITUTIONAL_EASE }}
      className="absolute inset-x-0 bottom-0 h-[2px] bg-[#0B3B69]"
    />
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-[#FBF9F5]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-4 sm:px-6 lg:px-10 h-16">
          {/* Zone 1: Single-line Brand Title */}
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B3B69]"
          >
            <NduCrest className="h-10 w-auto shrink-0" />
            <span className="font-serif text-lg font-bold tracking-tight text-[#14452F] whitespace-nowrap shrink-0">
              NDU Library
            </span>
          </button>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="Primary Library Navigation"
            className="hidden lg:flex items-center gap-7"
          >
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`${navLinkClass(activePage === 'home')} cursor-pointer`}
            >
              Home
              {activePage === 'home' && <ActiveUnderline />}
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className={`${navLinkClass(activePage === 'about')} cursor-pointer`}
            >
              About Library
              {activePage === 'about' && <ActiveUnderline />}
            </button>

            {/* Our Services Dropdown Box (PDF Page 3 requirement) */}
            <div className="relative flex items-center" ref={dropdownRef}>
              <button
                type="button"
                aria-expanded={servicesOpen}
                aria-haspopup="menu"
                onClick={() => setServicesOpen((prev) => !prev)}
                className={`gap-1 ${navLinkClass(
                  activePage === 'services' || servicesOpen,
                )} cursor-pointer`}
              >
                <span>Our Services</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    servicesOpen ? 'rotate-180' : ''
                  }`}
                />
                {(activePage === 'services' || servicesOpen) && <ActiveUnderline />}
              </button>

              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    role="menu"
                    aria-label="Our Library Services"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: INSTITUTIONAL_EASE }}
                    className="absolute left-0 top-full mt-3.5 w-[340px] origin-top-left rounded-lg border border-stone-200 bg-white shadow-xl z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-200 bg-[#FBF9F5]">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-600">
                        Our Library Services
                      </span>
                      <button
                        type="button"
                        onClick={() => handleNavClick('services')}
                        className="text-xs font-semibold text-[#0B3B69] hover:underline underline-offset-2 cursor-pointer whitespace-nowrap"
                      >
                        View all 17 →
                      </button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto p-1.5 divide-y divide-stone-100">
                      {LIBRARY_SERVICES.map((svc, idx) => (
                        <button
                          key={svc.id}
                          type="button"
                          role="menuitem"
                          onClick={() => handleSelectService(svc)}
                          className="flex w-full items-center justify-between gap-2.5 rounded-md px-2.5 py-2 text-left text-xs font-medium text-stone-700 hover:bg-[#FBF9F5] hover:text-[#0B3B69] transition-colors cursor-pointer"
                        >
                          <span className="flex items-baseline gap-2 min-w-0">
                            <span className="font-mono text-[11px] text-stone-400 tabular-nums w-5 shrink-0">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="truncate">{svc.name}</span>
                          </span>
                          {svc.actionType === 'journals' && (
                            <span className="text-[11px] font-semibold text-[#14452F] shrink-0">
                              Journals
                            </span>
                          )}
                          {svc.actionType === 'digital-library' &&
                            svc.id === 'digital-library-services' && (
                              <span className="text-[11px] font-semibold text-[#0B3B69] shrink-0">
                                E-Library
                              </span>
                            )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={() => handleNavClick('digital-library')}
              className={`${navLinkClass(activePage === 'digital-library')} cursor-pointer`}
            >
              Digital Library
              {activePage === 'digital-library' && <ActiveUnderline />}
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('news')}
              className={`${navLinkClass(activePage === 'news')} cursor-pointer`}
            >
              News &amp; Events
              {activePage === 'news' && <ActiveUnderline />}
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('contact')}
              className={`${navLinkClass(activePage === 'contact')} cursor-pointer`}
            >
              Contact
              {activePage === 'contact' && <ActiveUnderline />}
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action + Mobile Menu Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenJournals}
              className="rounded-md bg-[#14452F] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#0D3121] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14452F]"
            >
              Open E-Journals
            </button>

            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex lg:hidden h-11 w-11 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-800 hover:bg-stone-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.24, ease: INSTITUTIONAL_EASE }}
              className="lg:hidden overflow-hidden border-t border-stone-200 bg-white"
            >
              <div className="px-4 py-4 max-h-[80vh] overflow-y-auto">
                <div className="flex flex-col space-y-1">
                  {(
                    [
                      ['home', 'Home'],
                      ['about', 'About the Library'],
                      ['digital-library', 'Digital Library Resources & Services'],
                      ['news', 'News / Events'],
                      ['contact', 'Contact Us'],
                    ] as const
                  ).map(([page, label]) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => handleNavClick(page)}
                      className={`flex min-h-[44px] items-center justify-between rounded-md px-3 text-left text-sm font-medium transition-colors ${
                        activePage === page
                          ? 'bg-[#14452F]/10 text-[#14452F]'
                          : 'text-stone-800 hover:bg-stone-50'
                      }`}
                    >
                      <span>{label}</span>
                    </button>
                  ))}

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setMobileServicesExpanded((p) => !p)}
                      className="flex min-h-[44px] w-full items-center justify-between rounded-md px-3 text-left text-sm font-medium text-stone-800 hover:bg-stone-50"
                    >
                      <span>Our Library Services (17)</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          mobileServicesExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {mobileServicesExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22, ease: INSTITUTIONAL_EASE }}
                          className="overflow-hidden mt-1.5 rounded-md border border-stone-200/80 bg-[#FBF9F5] p-1.5 space-y-0.5"
                        >
                          {LIBRARY_SERVICES.map((svc, idx) => (
                            <button
                              key={svc.id}
                              type="button"
                              onClick={() => handleSelectService(svc)}
                              className="flex min-h-[40px] w-full items-center gap-2.5 rounded px-2.5 text-left text-xs font-medium text-stone-700 hover:bg-white hover:text-[#0B3B69]"
                            >
                              <span className="font-mono text-[11px] text-stone-400 tabular-nums w-5 shrink-0">
                                {String(idx + 1).padStart(2, '0')}
                              </span>
                              <span className="truncate">{svc.name}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Operational Opening Hours Slide Ribbon (PDF Page 1: "Library Opening Hours: Monday - Friday 8:00am - 4:00pm (Note this should be in slide)") */}
      <div
        aria-label="Library Opening Hours Notice"
        className="border-b border-[#0D3121] bg-[#14452F] text-stone-100 overflow-hidden"
      >
        <div className="animate-hours-slide py-2 text-xs tracking-wide">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center gap-8 px-4 whitespace-nowrap shrink-0">
              <span className="font-semibold text-amber-300">
                Library Opening Hours: Monday – Friday · 8:00am – 4:00pm
              </span>
              <span aria-hidden="true" className="text-stone-400">
                ·
              </span>
              <span>Reading Rooms &amp; Digital Library Extended Access: 8:00am – 5:00pm</span>
              <span aria-hidden="true" className="text-stone-400">
                ·
              </span>
              <span>Niger Delta University, Wilberforce Island, P.M.B. 071, Yenagoa, Bayelsa State</span>
              <span aria-hidden="true" className="text-stone-400">
                ·
              </span>
              <span>Open Access E-Journals Available 24/7 Across All Faculties &amp; Departments</span>
              <span aria-hidden="true" className="text-stone-400">
                ·
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
