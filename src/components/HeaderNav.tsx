import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ExternalLink, Menu, X, User as UserIcon, Shield, Upload } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { LIBRARY_SERVICES, type LibraryServiceItem } from '../data/libraryMeta';
import { INSTITUTIONAL_EASE } from './MotionPrimitives';
import { NduCrest } from './NduCrest';
import { api, type User, type DynamicSection, type DynamicLink } from '../services/api';

export type AppPage =
  | 'home'
  | 'about'
  | 'services'
  | 'digital-library'
  | 'news'
  | 'contact'
  | 'member-portal'
  | 'admin-portal'
  | 'faculty-library';

export interface UniversityPublicationLink {
  id: string;
  name: string;
  url: string;
  description: string;
  badge?: string;
}

export const UNIVERSITY_PUBLICATIONS: UniversityPublicationLink[] = [
  {
    id: 'ndu-journal',
    name: 'NDU Journal',
    url: 'https://www.ndu.edu.ng/journals',
    description: 'Official Niger Delta University academic and research journals',
    badge: 'Journals',
  },
  {
    id: 'ndu-bulletin',
    name: 'NDU Bulletin',
    url: 'https://www.ndu.edu.ng/weekly-bulettin',
    description: 'Weekly official bulletins, university announcements, and circulars',
    badge: 'Weekly',
  },
  {
    id: 'inaugural-lectures',
    name: 'Inaugural Lecture Series',
    url: 'https://www.ndu.edu.ng/lecture-series',
    description: 'Distinguished professorial inaugural lectures & academic addresses',
    badge: 'Lectures',
  },
];

interface HeaderNavProps {
  activePage: AppPage;
  onNavigate: (page: AppPage, serviceId?: string) => void;
  onOpenJournals: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenSubmissionForm: () => void;
}

export function HeaderNav({
  activePage,
  onNavigate,
  onOpenJournals,
  currentUser,
  onOpenAuth,
  onOpenSubmissionForm,
}: HeaderNavProps) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [publicationsOpen, setPublicationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesExpanded, setMobileServicesExpanded] = useState(false);
  const [mobilePublicationsExpanded, setMobilePublicationsExpanded] = useState(false);

  // Dynamic sections and links from admin
  const [dynamicSections, setDynamicSections] = useState<DynamicSection[]>([]);
  const [dynamicLinks, setDynamicLinks] = useState<DynamicLink[]>([]);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const publicationsDropdownRef = useRef<HTMLDivElement | null>(null);

  // Fetch dynamic sections & active links
  useEffect(() => {
    let isMounted = true;
    api.public
      .getSectionsAndLinks()
      .then((res) => {
        if (isMounted && res.success) {
          setDynamicSections(res.sections || []);
          setDynamicLinks(res.allActiveLinks || []);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [activePage]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
      if (
        publicationsDropdownRef.current &&
        !publicationsDropdownRef.current.contains(e.target as Node)
      ) {
        setPublicationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Compute active services (filtered if admin disabled them)
  const activeServiceLinks = dynamicLinks.filter(
    (l) => l.section_id === 'sec-services' && l.is_active !== false
  );
  const displayServices =
    activeServiceLinks.length > 0
      ? activeServiceLinks
      : (LIBRARY_SERVICES as unknown as DynamicLink[]);

  // Compute active publication links
  const activePubLinks = dynamicLinks.filter(
    (l) => l.section_id === 'sec-publications' && l.is_active !== false
  );
  const displayPublications =
    activePubLinks.length > 0 ? activePubLinks : UNIVERSITY_PUBLICATIONS;

  // Custom additional dropdowns created by admin
  const customHeaderDropdowns = dynamicSections.filter(
    (s) =>
      s.target_nav === 'header_dropdown' &&
      s.id !== 'sec-services' &&
      s.id !== 'sec-publications' &&
      s.is_active !== false
  );

  const handleSelectService = (svc: DynamicLink | LibraryServiceItem) => {
    setServicesOpen(false);
    setPublicationsOpen(false);
    setMobileMenuOpen(false);
    if (svc.url) {
      window.open(svc.url, '_blank', 'noopener,noreferrer');
      return;
    }
    if ((svc as any).action_type === 'digital-library' || (svc as any).actionType === 'digital-library') {
      onNavigate('digital-library');
    } else if ((svc as any).action_type === 'journals' || (svc as any).actionType === 'journals') {
      onOpenJournals();
    } else {
      onNavigate('services', svc.id);
    }
  };

  const handleNavClick = (page: AppPage) => {
    setServicesOpen(false);
    setPublicationsOpen(false);
    setMobileMenuOpen(false);
    onNavigate(page);
  };

  const navLinkClass = (isActive: boolean) =>
    `relative inline-flex items-center h-9 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
      isActive ? 'text-[#0B3B69] font-semibold' : 'text-stone-700 hover:text-[#0B3B69]'
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
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 xl:gap-6 px-4 sm:px-6 lg:px-8 xl:px-10 h-16">
          {/* Zone 1: Single-line Brand Title */}
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B3B69]"
          >
            <NduCrest className="h-10 w-auto shrink-0" />
            <span className="font-sans text-xl font-bold tracking-tight text-[#14452F] whitespace-nowrap shrink-0">
              NDU Library
            </span>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav
            aria-label="Primary Library Navigation"
            className="hidden lg:flex items-center gap-3.5 xl:gap-5"
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

            {/* Our Services Dropdown Box */}
            <div className="relative flex items-center" ref={dropdownRef}>
              <button
                type="button"
                aria-expanded={servicesOpen}
                aria-haspopup="menu"
                onClick={() => {
                  setServicesOpen((prev) => !prev);
                  setPublicationsOpen(false);
                }}
                className={`gap-1 ${navLinkClass(
                  activePage === 'services' || servicesOpen
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
                        Our Library Services ({displayServices.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleNavClick('services')}
                        className="text-xs font-semibold text-[#0B3B69] hover:underline underline-offset-2 cursor-pointer whitespace-nowrap"
                      >
                        View all →
                      </button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto p-1.5 divide-y divide-stone-100">
                      {displayServices.map((svc: any, idx: number) => {
                        if (svc.url) {
                          return (
                            <a
                              key={svc.id}
                              href={svc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              role="menuitem"
                              onClick={() => {
                                setServicesOpen(false);
                                setPublicationsOpen(false);
                                setMobileMenuOpen(false);
                              }}
                              className="flex w-full items-center justify-between gap-2.5 rounded-md px-2.5 py-2 text-left text-xs font-medium text-stone-700 hover:bg-[#FBF9F5] hover:text-[#0B3B69] transition-colors"
                            >
                              <span className="flex items-baseline gap-2 min-w-0">
                                <span className="font-mono text-[11px] text-stone-400 tabular-nums w-5 shrink-0">
                                  {String(idx + 1).padStart(2, '0')}
                                </span>
                                <span className="truncate">{svc.name}</span>
                              </span>
                              <ExternalLink className="h-3 w-3 text-stone-400 shrink-0" />
                            </a>
                          );
                        }

                        return (
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
                            {(svc.actionType === 'journals' || svc.action_type === 'journals') && (
                              <span className="text-[11px] font-semibold text-[#14452F] shrink-0">
                                Journals
                              </span>
                            )}
                            {(svc.actionType === 'digital-library' ||
                              svc.action_type === 'digital-library') &&
                              (svc.id === 'digital-library-services' || svc.id === 'svc-digital-library') && (
                                <span className="text-[11px] font-semibold text-[#0B3B69] shrink-0">
                                  E-Library
                                </span>
                              )}
                          </button>
                        );
                      })}
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

            {/* NEW SECTION IN NAVBAR TITLED NEWS (EXPLICIT USER REQUIREMENT) */}
            <button
              type="button"
              onClick={() => handleNavClick('news')}
              className={`${navLinkClass(activePage === 'news')} cursor-pointer`}
            >
              News
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

            {/* NDU Publications Dropdown */}
            <div className="relative flex items-center" ref={publicationsDropdownRef}>
              <button
                type="button"
                aria-expanded={publicationsOpen}
                aria-haspopup="menu"
                onClick={() => {
                  setPublicationsOpen((prev) => !prev);
                  setServicesOpen(false);
                }}
                className={`gap-1 ${navLinkClass(publicationsOpen)} cursor-pointer`}
              >
                <span>NDU Publications</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    publicationsOpen ? 'rotate-180' : ''
                  }`}
                />
                {publicationsOpen && <ActiveUnderline />}
              </button>

              <AnimatePresence>
                {publicationsOpen && (
                  <motion.div
                    role="menu"
                    aria-label="NDU Publications & External Series"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: INSTITUTIONAL_EASE }}
                    className="absolute right-0 top-full mt-3.5 w-[330px] origin-top-right rounded-lg border border-stone-200 bg-white shadow-xl z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-200 bg-[#FBF9F5]">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-600">
                        NDU Publications ({displayPublications.length})
                      </span>
                      <span className="text-[10px] font-semibold text-[#14452F] bg-[#14452F]/10 px-2 py-0.5 rounded">
                        ndu.edu.ng
                      </span>
                    </div>

                    <div className="p-2 space-y-1">
                      {displayPublications.map((pub: any) => (
                        <a
                          key={pub.id}
                          href={pub.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          role="menuitem"
                          onClick={() => setPublicationsOpen(false)}
                          className="group flex items-start justify-between gap-3 rounded-md p-2.5 hover:bg-[#FBF9F5] transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-stone-800 group-hover:text-[#0B3B69] transition-colors">
                                {pub.name}
                              </span>
                              <ExternalLink className="h-3 w-3 text-stone-400 group-hover:text-[#0B3B69] transition-colors shrink-0" />
                            </div>
                            <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                              {pub.description}
                            </p>
                          </div>
                          {pub.badge && (
                            <span className="text-[10px] font-semibold text-[#14452F] bg-[#14452F]/10 px-1.5 py-0.5 rounded shrink-0">
                              {pub.badge}
                            </span>
                          )}
                        </a>
                      ))}
                    </div>

                    <div className="px-3.5 py-2 border-t border-stone-100 bg-stone-50/80 text-[11px] text-stone-500 flex items-center justify-between">
                      <span className="text-[10px] text-stone-400 font-mono">Official Portals</span>
                      <span className="text-[10px] text-stone-400">Opens in new tab ↗</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Zone 3: Actions + Portal Button + Mobile Toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Portal Button (Researcher / Admin / Sign In) */}
            {currentUser ? (
              <button
                type="button"
                onClick={() =>
                  onNavigate(currentUser.role === 'admin' ? 'admin-portal' : 'member-portal')
                }
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer shadow-sm ${
                  currentUser.role === 'admin'
                    ? 'bg-[#0B3B69] text-white hover:bg-[#082847]'
                    : 'bg-[#14452F] text-white hover:bg-[#0D3121]'
                }`}
              >
                {currentUser.role === 'admin' ? (
                  <Shield className="h-3.5 w-3.5 text-amber-300" />
                ) : (
                  <UserIcon className="h-3.5 w-3.5" />
                )}
                <span className="truncate max-w-[130px]">
                  {currentUser.role === 'admin' ? 'Admin Console' : 'Dashboard'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer shadow-sm"
              >
                <UserIcon className="h-3.5 w-3.5 text-stone-500" />
                <span>Portal Login</span>
              </button>
            )}

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={onOpenJournals}
              className="rounded-md bg-[#14452F] px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#0D3121] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
            >
              Open E-Journals
            </button>

            {/* Mobile Toggle */}
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex lg:hidden h-9 w-9 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-800 hover:bg-stone-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
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
              <div className="px-4 py-4 max-h-[80vh] overflow-y-auto space-y-2">
                {currentUser && (
                  <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-stone-900">{currentUser.full_name}</div>
                      <div className="text-[10px] text-stone-500 uppercase">{currentUser.role} Account</div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleNavClick(
                          currentUser.role === 'admin' ? 'admin-portal' : 'member-portal'
                        )
                      }
                      className="text-xs font-semibold text-[#14452F] underline"
                    >
                      Open Portal →
                    </button>
                  </div>
                )}

                <div className="flex flex-col space-y-1">
                  {(
                    [
                      ['home', 'Home'],
                      ['about', 'About the Library'],
                      ['digital-library', 'Digital Library Resources & Services'],
                      ['news', 'News'],
                      ['contact', 'Contact Us'],
                    ] as const
                  ).map(([page, label]) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => handleNavClick(page)}
                      className={`flex min-h-[40px] items-center justify-between rounded-md px-3 text-left text-sm font-medium transition-colors ${
                        activePage === page
                          ? 'bg-[#14452F]/10 text-[#14452F]'
                          : 'text-stone-800 hover:bg-stone-50'
                      }`}
                    >
                      <span>{label}</span>
                    </button>
                  ))}

                  {/* Submission Shortcut */}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenSubmissionForm();
                    }}
                    className="flex min-h-[40px] items-center justify-between rounded-md px-3 text-left text-sm font-medium text-[#14452F] bg-[#14452F]/5"
                  >
                    <span>Submit Research Manuscript</span>
                    <Upload className="h-3.5 w-3.5" />
                  </button>

                  {/* Services Accordion */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setMobileServicesExpanded((p) => !p)}
                      className="flex min-h-[40px] w-full items-center justify-between rounded-md px-3 text-left text-sm font-medium text-stone-800 hover:bg-stone-50"
                    >
                      <span>Our Library Services ({displayServices.length})</span>
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
                          className="overflow-hidden mt-1 rounded-md border border-stone-200/80 bg-[#FBF9F5] p-1.5 space-y-0.5"
                        >
                          {displayServices.map((svc: any, idx: number) => (
                            <button
                              key={svc.id}
                              type="button"
                              onClick={() => handleSelectService(svc)}
                              className="flex min-h-[36px] w-full items-center gap-2 rounded px-2 text-left text-xs font-medium text-stone-700 hover:bg-white"
                            >
                              <span className="font-mono text-[10px] text-stone-400 tabular-nums w-4">
                                {idx + 1}
                              </span>
                              <span className="truncate">{svc.name}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Publications Accordion */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setMobilePublicationsExpanded((p) => !p)}
                      className="flex min-h-[40px] w-full items-center justify-between rounded-md px-3 text-left text-sm font-medium text-stone-800 hover:bg-stone-50"
                    >
                      <span>NDU Publications ({displayPublications.length})</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          mobilePublicationsExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {mobilePublicationsExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mt-1 rounded-md border border-stone-200/80 bg-[#FBF9F5] p-1.5 space-y-0.5"
                        >
                          {displayPublications.map((pub: any) => (
                            <a
                              key={pub.id}
                              href={pub.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex min-h-[36px] w-full items-center justify-between rounded px-2 text-left text-xs font-medium text-stone-700 hover:bg-white"
                            >
                              <span>{pub.name}</span>
                              <ExternalLink className="h-3 w-3 text-stone-400" />
                            </a>
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

      {/* Operational Opening Hours Slide Ribbon — hidden on admin & member portals */}
      {activePage !== 'admin-portal' && activePage !== 'member-portal' && (
      <div
        aria-label="Library Opening Hours Notice"
        className="border-b border-[#0D3121] bg-[#14452F] text-stone-100 overflow-hidden select-none"
      >
        <div className="animate-hours-slide py-2 text-xs tracking-wide">
          {[0, 1, 2, 3].map((dup) => (
            <div key={dup} className="flex items-center gap-8 px-4 whitespace-nowrap shrink-0">
              <span className="font-semibold text-amber-300">
                Library Opening Hours: Monday – Friday · 8:00am – 4:00pm
              </span>
              <span aria-hidden="true" className="text-stone-400">·</span>
              <span>Scholarly Manuscript Transmission System &amp; E-Journals Live 24/7</span>
              <span aria-hidden="true" className="text-stone-400">·</span>
              <span>Niger Delta University, Wilberforce Island, P.M.B. 071, Yenagoa, Bayelsa State</span>
              <span aria-hidden="true" className="text-stone-400">·</span>
              <span>Open Access Research Digest Volumes &amp; Departmental E-Journals Active</span>
              <span aria-hidden="true" className="text-stone-400">·</span>
            </div>
          ))}
        </div>
      </div>
      )}
    </>
  );
}
