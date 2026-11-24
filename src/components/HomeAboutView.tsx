import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Building2,
  ChevronRight,
  ExternalLink,
  Mail,
  MapPin,
  PhoneCall,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  DATABASE_RESOURCES,
  LIBRARY_SERVICES,
  OUR_LIBRARIES,
  type CampusLibrary,
  type DatabaseResource,
} from '../data/libraryMeta';
import { TOTAL_DEPARTMENT_COUNT, TOTAL_JOURNAL_COUNT } from '../data/journalsIndex';
import { HeroSlideBanner } from './HeroSlideBanner';
import {
  INSTITUTIONAL_EASE,
  RevealOnLoad,
  RevealOnScroll,
  StaggerRevealGrid,
  StaggerRevealItem,
} from './MotionPrimitives';
import type { AppPage } from './HeaderNav';

interface HomeAboutViewProps {
  mode: 'home' | 'about';
  onNavigate: (page: AppPage, serviceId?: string) => void;
  onSelectFacultyJournals: (facultyId: string) => void;
  onSelectDatabase: (db: DatabaseResource) => void;
  onOpenFacultyLibrary?: (libraryId: string) => void;
}

export function HomeAboutView({
  mode: _mode,
  onNavigate,
  onSelectFacultyJournals,
  onSelectDatabase,
  onOpenFacultyLibrary,
}: HomeAboutViewProps) {
  const [selectedLibrary, setSelectedLibrary] = useState<CampusLibrary | null>(null);

  const quickLinkIds = [
    'ebscohost',
    'hinari',
    'taylor-francis',
    'oxford-press',
    'heinonline',
    'lexisnexis',
    'legalpedia',
    'law-pavilion',
    'proquest',
    'pubmed',
    'proquest-direct',
    'cinahl',
    'medline-complete',
    'open-access-databases',
    'ebooks',
    'ejournals',
    'ndu-bulletin',
    'ndu-repository',
    'ndu-journals',
    'newspapers-db',
    'jstor',
    'lirn',
  ];

  const quickLinks = quickLinkIds
    .map((id) => DATABASE_RESOURCES.find((d) => d.id === id))
    .filter((d): d is DatabaseResource => Boolean(d));

  const handleQuickLink = (item: DatabaseResource) => {
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (item.internalRoute === 'newspapers') {
      onNavigate('newspapers');
      return;
    }
    if (item.internalRoute === 'journals') {
      onSelectFacultyJournals('science');
      return;
    }
    if (item.internalRoute === 'digital-computers') {
      onNavigate('digital-library');
      return;
    }
    if (item.internalRoute === 'services') {
      onNavigate('services');
      return;
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-10">
      {/* Main 2-Column Layout mirroring Welcome_to_Niger_Delta_University_Library mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar: Quick Links */}
        <aside
          aria-label="Quick Links"
          className="lg:col-span-3 order-2 lg:order-1"
        >
          <RevealOnLoad delay={0.08} yOffset={18} className="rounded-lg border border-stone-200 bg-white p-5">
            <div className="flex flex-col items-center text-center gap-0.5 border-b border-stone-200 pb-3 mb-2">
              <h2 className="font-serif text-lg font-semibold tracking-tight text-[#1C1917] whitespace-nowrap">
                Quick Links
              </h2>
              <span className="text-[11px] font-medium text-stone-500 whitespace-nowrap">
                Digital Resources
              </span>
            </div>

            <ul className="divide-y divide-stone-100">
              {quickLinks.map((link) => {
                if (link.url) {
                  return (
                    <li key={link.id}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex min-h-[38px] w-full items-center justify-between gap-2 py-2 text-left text-[13px] font-medium text-[#0B3B69] hover:text-[#14452F] transition-colors cursor-pointer"
                      >
                        <span className="group-hover:underline underline-offset-4 leading-snug">
                          {link.name}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 text-stone-400 group-hover:text-[#14452F] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </a>
                    </li>
                  );
                }

                return (
                  <li key={link.id}>
                    <button
                      type="button"
                      onClick={() => handleQuickLink(link)}
                      className="group flex min-h-[38px] w-full items-center justify-between gap-2 py-2 text-left text-[13px] font-medium text-[#0B3B69] hover:text-[#14452F] transition-colors cursor-pointer"
                    >
                      <span className="group-hover:underline underline-offset-4 leading-snug">
                        {link.name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <ChevronRight className="h-3.5 w-3.5 text-stone-400 group-hover:text-[#14452F] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => onNavigate('digital-library')}
                className="w-full min-h-[42px] rounded-md bg-[#0B3B69] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#082c4f] active:scale-[0.99] transition-all cursor-pointer"
              >
                Go to Digital Library Services
              </button>
            </div>
          </RevealOnLoad>
        </aside>

        {/* Right Main Column: Sliding Banner + Welcome Address */}
        <div className="lg:col-span-9 order-1 lg:order-2 space-y-8">
          <RevealOnLoad delay={0.12} yOffset={16}>
            <HeroSlideBanner
              mode="home"
              primaryActionLabel="Explore Open Access E-Journals"
              onPrimaryAction={() => onSelectFacultyJournals('agriculture')}
            />
          </RevealOnLoad>

          {/* Compact Key Metrics Strip (uniform 1px hairline grid across mobile 2x2 & desktop 4x1) */}
          <StaggerRevealGrid className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-stone-200 rounded-lg border border-stone-200 overflow-hidden">
            <StaggerRevealItem className="bg-white p-4 sm:p-5">
              <div className="font-mono text-xl font-semibold text-[#14452F] tabular-nums">
                {TOTAL_JOURNAL_COUNT}+
              </div>
              <div className="text-xs font-medium text-stone-600 mt-1">Open Access Journals</div>
            </StaggerRevealItem>
            <StaggerRevealItem className="bg-white p-4 sm:p-5">
              <div className="font-mono text-xl font-semibold text-[#0B3B69] tabular-nums">
                {TOTAL_DEPARTMENT_COUNT}
              </div>
              <div className="text-xs font-medium text-stone-600 mt-1">Academic Departments</div>
            </StaggerRevealItem>
            <StaggerRevealItem className="bg-white p-4 sm:p-5">
              <div className="font-mono text-xl font-semibold text-[#1C1917] tabular-nums">13</div>
              <div className="text-xs font-medium text-stone-600 mt-1">Campus &amp; Faculty Libraries</div>
            </StaggerRevealItem>
            <StaggerRevealItem className="bg-white p-4 sm:p-5">
              <div className="font-mono text-xl font-semibold text-[#C2820A] tabular-nums">8am – 4pm</div>
              <div className="text-xs font-medium text-stone-600 mt-1">Mon – Fri Library Hours</div>
            </StaggerRevealItem>
          </StaggerRevealGrid>

          {/* Editorial Welcome Address */}
          <RevealOnScroll yOffset={22}>
            <article className="rounded-lg border border-stone-200 bg-white p-6 sm:p-8 lg:p-10">
              <div className="border-b border-stone-200 pb-4 mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                  University Librarian’s Address · Wilberforce Island
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1917] tracking-tight leading-snug mt-1.5 [text-wrap:balance]">
                  Welcome to the Niger Delta University Library
                </h2>
              </div>

              <div className="max-w-[66ch] space-y-4 text-[15px] sm:text-base leading-[1.7] text-stone-700 text-justify [text-justify:inter-word]">
                <p className="first-letter:font-serif first-letter:text-5xl first-letter:font-semibold first-letter:text-[#14452F] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none">
                  Welcome to the Niger Delta University Library, Wilberforce Island. The Library&apos;s
                  website is the gateway to our resources and services. The University Library is a
                  repository of knowledge and information. The Niger Delta University Library has a
                  core mission of striving to maintain an international reputation for high-quality
                  scholarship, research, and academic excellence.
                </p>
                <p>
                  The Library is the heart of any educational institution; it serves as the central
                  hub around which all teaching, learning, and research activities revolve. The
                  library provides comprehensive collections of print and digital resources, including
                  books, academic journals, research databases, and multimedia materials that support
                  the educational programs of Niger Delta University, Wilberforce Island. The website
                  also includes the library online catalogue for searching and finding specific
                  library print and electronic resources.
                </p>
                <p>
                  The Niger Delta University Library collections are designed to meet the
                  information, research, and curriculum needs of its students, faculty and staff
                  members. You are encouraged to use the library resources and services for teaching,
                  learning and research. You are also invited to visit our digital library in the
                  new campus physically or online for information discovery and learning in a
                  conducive environment. If you need further information and assistance, please
                  contact any of our library staff through scheduled appointment, chat, or email to
                  answer your questions.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-serif text-lg font-semibold text-[#1C1917]">
                    Prof. Pereware Tiemo, Ph.D, MNLA
                  </p>
                  <p className="text-sm font-medium text-[#14452F]">University Librarian</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate('services')}
                    className="rounded-md border border-stone-300 bg-white px-4 py-2 text-xs sm:text-sm font-medium text-stone-800 hover:bg-stone-50 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                  >
                    Browse Our {LIBRARY_SERVICES.length} Services
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('digital-library')}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#14452F] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#0D3121] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span>Enter Digital Library</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          </RevealOnScroll>
        </div>
      </div>

      {/* Our Libraries Grid (13 Faculty & Institute Libraries from Image 1 & PDF Pages 1-2) */}
      <section aria-labelledby="our-libraries-heading" className="space-y-6 pt-2">
        <RevealOnScroll yOffset={18}>
          <div className="flex flex-col items-center text-center border-b border-stone-200 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
              Cross-Campus Collections
            </p>
            <h2
              id="our-libraries-heading"
              className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#1C1917] mt-1 [text-wrap:balance]"
            >
              Our Libraries
            </h2>
            <p className="text-sm text-stone-600 max-w-xl leading-relaxed mt-2.5">
              Select any faculty or institute library below to view its campus details or open its
              departmental e-journals.
            </p>
          </div>
        </RevealOnScroll>

        <StaggerRevealGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {OUR_LIBRARIES.map((lib) => {
            const isSelected = selectedLibrary?.id === lib.id;
            return (
              <StaggerRevealItem key={lib.id} className="flex">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenFacultyLibrary) {
                      onOpenFacultyLibrary(lib.id);
                    } else {
                      setSelectedLibrary(isSelected ? null : lib);
                    }
                  }}
                  className="group flex w-full flex-col justify-between rounded-lg border border-stone-200 bg-white p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-[#14452F]/40 hover:shadow-md cursor-pointer"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <Building2 className="h-4 w-4 mt-0.5 shrink-0 text-[#14452F]" />
                      <ChevronRight className="h-4 w-4 text-stone-400 group-hover:text-[#14452F] group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                    <h3 className="font-serif text-base font-semibold text-[#1C1917] group-hover:text-[#14452F] leading-snug transition-colors">
                      {lib.name}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">{lib.focus}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-stone-500 truncate pr-2">{lib.location}</span>
                    <span className="text-[#14452F] font-semibold flex items-center gap-1 group-hover:underline whitespace-nowrap">
                      <span>Explore</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              </StaggerRevealItem>
            );
          })}
        </StaggerRevealGrid>

        {/* Selected Library Inspector Strip */}
        <AnimatePresence>
          {selectedLibrary && (
            <motion.div
              key={selectedLibrary.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: INSTITUTIONAL_EASE }}
              className="rounded-lg border border-[#0B3B69]/30 bg-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="text-xs font-medium text-[#0B3B69]">
                  Selected Campus Library · {selectedLibrary.location}
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#1C1917]">
                  {selectedLibrary.name}
                </h3>
                <p className="text-sm text-stone-600">{selectedLibrary.focus}</p>
              </div>
              <button
                type="button"
                onClick={() => onSelectFacultyJournals(selectedLibrary.facultyId)}
                className="inline-flex items-center gap-2 rounded-md bg-[#14452F] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0D3121] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                <BookOpen className="h-4 w-4" />
                <span>Open Faculty E-Journals</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Contact Banner echoing Image 1 bottom strip */}
      <RevealOnScroll yOffset={24}>
        <section
          aria-label="Contact University Library"
          className="rounded-lg border border-stone-200 bg-[#0B3B69] text-white p-6 sm:p-8 lg:p-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-3">
              <p className="text-xs uppercase tracking-[0.16em] text-amber-300">
                Contact Us · Wilberforce Island
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white">
                University Library, Niger Delta University
              </h2>
              <p className="text-sm sm:text-base text-slate-200 max-w-xl leading-relaxed">
                Wilberforce Island · P.M.B. 071 · Yenagoa, Bayelsa State, Nigeria. Reach our library
                staff for database access credentials, e-journal suggestions, or scheduled research
                appointments.
              </p>
            </div>
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 lg:justify-end">
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-[#0B3B69] hover:bg-stone-100 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                <Mail className="h-4 w-4" />
                <span>Email / Schedule Appointment</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('digital-library')}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/35 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                <MapPin className="h-4 w-4" />
                <span>Digital Library Desk</span>
              </button>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap items-center gap-6 text-xs text-slate-200">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-amber-300" /> library@ndu.edu.ng
            </span>
            <span className="inline-flex items-center gap-1.5">
              <PhoneCall className="h-3.5 w-3.5 text-amber-300" /> System Librarian Inquiry Desk · Mon – Fri, 8:00am – 4:00pm
            </span>
          </div>
        </section>
      </RevealOnScroll>
    </div>
  );
}
