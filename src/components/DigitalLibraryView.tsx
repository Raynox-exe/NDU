import { useEffect, useMemo, useState } from 'react';
import {
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  Laptop,
  Mail,
  Search,
  Trash2,
  X,
  Download,
  BookOpen,
  FileText,
  Lock,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { FACULTY_CATALOGS, TOTAL_JOURNAL_COUNT } from '../data/journalsIndex';
import type { JournalEntry } from '../data/journalTypes';
import { DATABASE_RESOURCES, type DatabaseResource } from '../data/libraryMeta';
import { HeroSlideBanner } from './HeroSlideBanner';
import { INSTITUTIONAL_EASE, RevealOnLoad, RevealOnScroll } from './MotionPrimitives';
import { NduCrest } from './NduCrest';
import { api, type JournalIssue, type Article, type DynamicLink } from '../services/api';

interface DigitalLibraryViewProps {
  selectedFacultyId: string;
  onChangeFacultyId: (facultyId: string) => void;
  onSelectDatabase: (db: DatabaseResource) => void;
  onContactLibrarian: () => void;
  onNavigateServices: () => void;
  onNavigateNewspapers?: () => void;
}

const BOOKMARKS_KEY = 'ndu_library_bookmarked_journals_v1';

export function DigitalLibraryView({
  selectedFacultyId,
  onChangeFacultyId,
  onSelectDatabase,
  onContactLibrarian,
  onNavigateServices,
  onNavigateNewspapers,
}: DigitalLibraryViewProps) {
  const [expandedFacultyId, setExpandedFacultyId] = useState<string>(selectedFacultyId);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>('All');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedList, setCopiedList] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const raw = window.localStorage.getItem(BOOKMARKS_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  const [viewMode, setViewMode] = useState<'digest' | 'departmental'>('digest');
  const [digestJournals, setDigestJournals] = useState<JournalIssue[]>([]);
  const [digestArticles, setDigestArticles] = useState<Article[]>([]);
  const [selectedVolume, setSelectedVolume] = useState<string>('all');
  const [digestSearch, setDigestSearch] = useState<string>('');
  const [expandedAbstracts, setExpandedAbstracts] = useState<Record<string, boolean>>({});
  const [journalOverrides, setJournalOverrides] = useState<Record<string, { is_active?: boolean }>>({});
  const [dynamicDatabases, setDynamicDatabases] = useState<DynamicLink[]>([]);

  // Fetch dynamic published articles, volumes, overrides, and databases
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.public.getJournals(),
      api.public.getArticles(),
      api.public.getJournalOverrides(),
      api.public.getSectionsAndLinks(),
    ])
      .then(([jRes, aRes, oRes, slRes]) => {
        if (!isMounted) return;
        if (jRes.success && jRes.journals) setDigestJournals(jRes.journals);
        if (aRes.success && aRes.articles) setDigestArticles(aRes.articles);
        if (oRes.success && oRes.overrides) setJournalOverrides(oRes.overrides);
        if (slRes.success && slRes.allActiveLinks) {
          const dbLinks = slRes.allActiveLinks.filter(
            (l) => l.section_id === 'sec-databases' && l.is_active !== false
          );
          if (dbLinks.length > 0) setDynamicDatabases(dbLinks);
        }
      })
      .catch((e) => console.error('Error fetching digital library dynamic data:', e));

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch {
      // Ignore storage quota issues
    }
  }, [bookmarks]);

  const activeFaculty = useMemo(
    () => FACULTY_CATALOGS.find((f) => f.id === selectedFacultyId) ?? FACULTY_CATALOGS[0],
    [selectedFacultyId],
  );

  // Keep department synced whenever faculty changes
  useEffect(() => {
    setExpandedFacultyId(activeFaculty.id);
    if (!activeFaculty.departments.some((d) => d.id === selectedDeptId)) {
      // Default to first department with the richest list if available, else first dept
      const preferred =
        activeFaculty.departments.find((d) => d.journals.length > 5) ??
        activeFaculty.departments[0];
      setSelectedDeptId(preferred?.id ?? '');
      setSubCategoryFilter('All');
    }
  }, [activeFaculty, selectedDeptId]);

  const activeDepartment = useMemo(
    () =>
      activeFaculty.departments.find((d) => d.id === selectedDeptId) ??
      activeFaculty.departments[0],
    [activeFaculty, selectedDeptId],
  );

  const subCategories = useMemo(() => {
    if (!activeDepartment) return [];
    const cats = Array.from(
      new Set(
        activeDepartment.journals
          .map((j) => j.subCategory)
          .filter((v): v is string => Boolean(v)),
      ),
    );
    return cats;
  }, [activeDepartment]);

  const toggleBookmark = (journalId: string) => {
    setBookmarks((prev) =>
      prev.includes(journalId) ? prev.filter((id) => id !== journalId) : [...prev, journalId],
    );
  };

  const handleCopyMeta = (journal: JournalEntry) => {
    const parts = [journal.title];
    if (journal.issn) parts.push(`ISSN ${journal.issn}`);
    if (journal.eissn) parts.push(`eISSN ${journal.eissn}`);
    if (journal.startYear) parts.push(`Start year ${journal.startYear}`);
    if (journal.url) parts.push(journal.url);
    navigator.clipboard?.writeText(parts.join(' · '));
    setCopiedId(journal.id);
    window.setTimeout(() => setCopiedId((prev) => (prev === journal.id ? null : prev)), 1800);
  };

  // Global flattened search results or bookmarks view
  const globalFlatJournals = useMemo(() => {
    const list: Array<JournalEntry & { facultyName: string; facultyId: string; deptName: string; deptId: string }> = [];
    for (const fac of FACULTY_CATALOGS) {
      for (const dept of fac.departments) {
        for (const j of dept.journals) {
          // Check if admin has disabled this journal
          const o = journalOverrides[j.id];
          if (o?.is_active === false) continue;
          list.push({
            ...j,
            ...(o?.title ? { title: o.title } : {}),
            ...(o?.url ? { url: o.url } : {}),
            ...(o?.issn !== undefined && o.issn !== null ? { issn: o.issn } : {}),
            ...(o?.eissn !== undefined && o.eissn !== null ? { eissn: o.eissn } : {}),
            facultyName: fac.shortName,
            facultyId: fac.id,
            deptName: dept.name,
            deptId: dept.id,
          });
        }

        // Custom added journals for this department
        for (const [id, o] of Object.entries(journalOverrides)) {
          if (o.department_id === dept.id && o.is_custom && o.is_active !== false) {
            list.push({
              id,
              title: o.title || 'Untitled Journal',
              url: o.url || '',
              issn: o.issn || '',
              eissn: o.eissn || '',
              facultyName: fac.shortName,
              facultyId: fac.id,
              deptName: dept.name,
              deptId: dept.id,
            } as any);
          }
        }
      }
    }
    return list;
  }, [journalOverrides]);

  const readingListJournals = useMemo(
    () => globalFlatJournals.filter((j) => bookmarks.includes(j.id)),
    [globalFlatJournals, bookmarks],
  );

  const handleCopyReadingList = () => {
    if (readingListJournals.length === 0) return;
    const text = readingListJournals
      .map((j, idx) => {
        const meta = [j.facultyName, j.deptName];
        if (j.issn) meta.push(`ISSN ${j.issn}`);
        if (j.url) meta.push(j.url);
        return `${idx + 1}. ${j.title} (${meta.join(' · ')})`;
      })
      .join('\n');
    navigator.clipboard?.writeText(text);
    setCopiedList(true);
    window.setTimeout(() => setCopiedList(false), 2000);
  };

  const handleClearReadingList = () => {
    setBookmarks([]);
    setShowBookmarksOnly(false);
  };

  const displayedJournals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (showBookmarksOnly) {
      return globalFlatJournals.filter(
        (j) =>
          bookmarks.includes(j.id) &&
          (!q ||
            j.title.toLowerCase().includes(q) ||
            j.deptName.toLowerCase().includes(q) ||
            j.facultyName.toLowerCase().includes(q) ||
            (j.issn && j.issn.toLowerCase().includes(q)) ||
            (j.eissn && j.eissn.toLowerCase().includes(q))),
      );
    }

    if (q.length >= 2) {
      return globalFlatJournals.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.deptName.toLowerCase().includes(q) ||
          j.facultyName.toLowerCase().includes(q) ||
          (j.issn && j.issn.toLowerCase().includes(q)) ||
          (j.eissn && j.eissn.toLowerCase().includes(q)),
      );
    }

    if (!activeDepartment) return [];
    const baseList = activeDepartment.journals
      .filter((j) => journalOverrides[j.id]?.is_active !== false)
      .map((j) => {
        const o = journalOverrides[j.id];
        return {
          ...j,
          ...(o?.title ? { title: o.title } : {}),
          ...(o?.url ? { url: o.url } : {}),
          ...(o?.issn !== undefined && o.issn !== null ? { issn: o.issn } : {}),
          ...(o?.eissn !== undefined && o.eissn !== null ? { eissn: o.eissn } : {}),
          facultyName: activeFaculty.shortName,
          facultyId: activeFaculty.id,
          deptName: activeDepartment.name,
          deptId: activeDepartment.id,
        };
      });

    const customList = Object.entries(journalOverrides)
      .filter(
        ([id, o]: [string, any]) =>
          o.department_id === activeDepartment.id &&
          o.is_custom &&
          o.is_active !== false &&
          !activeDepartment.journals.some((j) => j.id === id),
      )
      .map(([id, o]: [string, any]) => ({
        id,
        title: o.title || 'Untitled Journal',
        url: o.url || '',
        issn: o.issn || '',
        eissn: o.eissn || '',
        facultyName: activeFaculty.shortName,
        facultyId: activeFaculty.id,
        deptName: activeDepartment.name,
        deptId: activeDepartment.id,
      }));

    return [...baseList, ...customList]
      .filter((j) => subCategoryFilter === 'All' || (j as any).subCategory === subCategoryFilter);
  }, [
    searchQuery,
    showBookmarksOnly,
    bookmarks,
    globalFlatJournals,
    activeDepartment,
    activeFaculty,
    subCategoryFilter,
    journalOverrides,
  ]);

  const handleFacultyDropdownToggle = (facultyId: string) => {
    onChangeFacultyId(facultyId);
    setShowBookmarksOnly(false);
    setSearchQuery('');
    setSubCategoryFilter('All');
    setExpandedFacultyId((prev) => (prev === facultyId ? facultyId : facultyId));
    const fac = FACULTY_CATALOGS.find((f) => f.id === facultyId);
    if (fac) {
      const preferred =
        fac.departments.find((d) => d.journals.length > 5) ?? fac.departments[0];
      setSelectedDeptId(preferred?.id ?? '');
    }
  };

  const handleSelectDepartment = (facultyId: string, deptId: string) => {
    onChangeFacultyId(facultyId);
    setSelectedDeptId(deptId);
    setSubCategoryFilter('All');
    setShowBookmarksOnly(false);
    setSearchQuery('');
    const anchor = document.getElementById('e-journals-directory');
    anchor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDatabaseClick = (db: DatabaseResource) => {
    if (db.url) {
      window.open(db.url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (db.internalRoute === 'journals') {
      const anchor = document.getElementById('e-journals-directory');
      anchor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (db.internalRoute === 'services') {
      onNavigateServices();
      return;
    }
    if (db.internalRoute === 'newspapers') {
      if (onNavigateNewspapers) onNavigateNewspapers();
      else onNavigateServices();
      return;
    }
    if (db.internalRoute === 'digital-computers') {
      const el = document.getElementById('digital-computers-policy');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onSelectDatabase(db);
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
      {/* 3-Column Layout mirroring IMG_0969_7441928f.jpeg (Databases | Center E-Library & Journals | Open Access Faculties) */}
      <div className="grid grid-cols-1 lg:grid-cols-[235px_minmax(0,1fr)_275px] xl:grid-cols-[255px_minmax(0,1fr)_295px] gap-6 xl:gap-8 items-start">
        {/* LEFT COLUMN: DATA BASES (PDF Page 4 & Image 2) */}
        <aside
          aria-label="Digital Library Databases"
          className="order-3 lg:order-1"
        >
          <RevealOnLoad delay={0.08} yOffset={16} className="rounded-lg border border-stone-200 bg-white p-4 sm:p-5">
            <div className="border-b border-stone-200 pb-3 mb-2">
              <h2 className="font-serif text-lg font-semibold tracking-tight text-[#1C1917]">
                Databases
              </h2>
              <p className="text-[11px] font-medium text-stone-500 mt-0.5">
                Electronic Resources &amp; Services
              </p>
            </div>

            <ul className="divide-y divide-stone-100">
              {(dynamicDatabases.length > 0 ? dynamicDatabases : DATABASE_RESOURCES).map((db: any) => {
                const isDirectExternal = Boolean(db.url);

                if (isDirectExternal && db.url) {
                  return (
                    <li key={db.id}>
                      <a
                        href={db.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex min-h-[36px] w-full items-center justify-between gap-2 py-2 text-left text-[13px] font-medium text-[#0B3B69] hover:text-[#14452F]"
                      >
                        <span className="group-hover:underline underline-offset-2 leading-snug">
                          {db.name}
                        </span>
                        <ExternalLink className="h-3 w-3 text-stone-400 group-hover:text-[#14452F] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </a>
                    </li>
                  );
                }

                return (
                  <li key={db.id}>
                    <button
                      type="button"
                      onClick={() => handleDatabaseClick(db)}
                      className="group flex min-h-[36px] w-full items-center justify-between gap-2 py-2 text-left text-[13px] font-medium text-[#0B3B69] hover:text-[#14452F] cursor-pointer"
                    >
                      <span className="group-hover:underline underline-offset-2 leading-snug">
                        {db.name}
                      </span>
                      {db.url && (
                        <ExternalLink className="h-3 w-3 text-stone-400 group-hover:text-[#14452F] group-hover:translate-x-0.5 transition-all shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </RevealOnLoad>
        </aside>

        {/* CENTER COLUMN: Main Digital Library Banner, Computers Policy, & Departmental Open Access Journals */}
        <div className="order-1 lg:order-2 min-w-0 space-y-6">
          {/* Header Lockup matching Image 2 */}
          <RevealOnLoad delay={0.03} yOffset={14} className="rounded-lg border border-stone-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 pb-5 border-b border-stone-200">
              <NduCrest className="h-16 w-auto shrink-0 self-start sm:self-center" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#14452F]">
                  Niger Delta University
                </p>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B3B69] tracking-tight leading-[1.18] mt-1 [text-wrap:balance]">
                  DIGITAL LIBRARY RESOURCES AND SERVICES
                </h1>
              </div>
            </div>

            <div className="mt-5">
              <HeroSlideBanner mode="digital" />
            </div>

            {/* Digital Library Narrative + Second Floor Computers Policy (PDF Page 4 & Image 2) */}
            <RevealOnScroll yOffset={18} className="mt-6 rounded-lg border border-[#0D3121]/20 bg-[#14452F] text-white p-5 sm:p-7 space-y-5">
              <div className="space-y-3 text-sm sm:text-[15px] leading-relaxed text-stone-100">
                <p>
                  The Niger Delta University Digital Library resources and services offers you
                  access to e-journals, books and other online materials beyond the physical reach.
                </p>
                <p>
                  Niger Delta University subscribes to various electronic databases as well as
                  numerous online resources that can be used for teaching, learning and research
                  activities. These e-databases can be accessed from the digital library computers,
                  smartphones or tablets connected to the internet.
                </p>
              </div>

              <div
                id="digital-computers-policy"
                className="border-t border-white/20 pt-5 space-y-2.5"
              >
                <div className="flex items-center gap-2 text-amber-300">
                  <Laptop className="h-4 w-4 shrink-0" />
                  <h2 className="font-serif text-lg font-semibold text-white">
                    The Digital Library Computers
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-stone-100/95">
                  The computers in the digital library are located at the second floor. They are
                  available to users for browsing the internet for academic purposes and other
                  activities such as writing and editing documents, online classes and learning
                  platforms, preparing presentations of slides, online conferences, sending and
                  receiving emails, and many other activities.
                </p>
                <p className="rounded-md border border-amber-300/30 bg-black/20 px-4 py-3 text-xs sm:text-sm text-amber-100 leading-relaxed">
                  <strong>Important Notice:</strong> Downloaded documents or personal files should
                  not be saved on the digital library computers. The computers are configured to
                  automatically delete such files and downloaded documents.
                </p>
              </div>
            </RevealOnScroll>
          </RevealOnLoad>

          {/* OPEN ACCESS E-JOURNALS EXPLORER (PDF Pages 5-41) */}
          <RevealOnScroll yOffset={22}>
            <section
              id="e-journals-directory"
              aria-labelledby="ejournals-heading"
              className="rounded-lg border border-stone-200 bg-white p-5 sm:p-6 space-y-5"
            >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#14452F] font-semibold">
                  Faculties &amp; Departments Directory
                </p>
                <h2
                  id="ejournals-heading"
                  className="font-serif text-2xl font-semibold tracking-tight text-[#1C1917] mt-1"
                >
                  Open Access E-Journals
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl leading-relaxed">
                  Browse {TOTAL_JOURNAL_COUNT}+ free online journals compiled by the University
                  Library, organized by Faculty and Department.
                </p>
              </div>

              <button
                type="button"
                onClick={onContactLibrarian}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Mail className="h-3.5 w-3.5 text-[#0B3B69]" />
                <span>Ask System Librarian</span>
              </button>
            </div>

            {/* View Mode Switcher: Peer-Reviewed Research Digest vs Departmental Catalog */}
            <div className="flex flex-wrap items-center gap-2 bg-stone-100 p-1.5 rounded-lg border border-stone-200">
              <button
                type="button"
                onClick={() => setViewMode('digest')}
                className={`flex-1 min-h-[40px] px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  viewMode === 'digest'
                    ? 'bg-[#14452F] text-white shadow-sm'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>NDU Research Digest &amp; Published Volumes ({digestArticles.filter(a => a.is_visible !== false).length} Papers)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('departmental')}
                className={`flex-1 min-h-[40px] px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  viewMode === 'departmental'
                    ? 'bg-[#14452F] text-white shadow-sm'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Departmental Open Access E-Journals Directory ({TOTAL_JOURNAL_COUNT}+ Titles)</span>
              </button>
            </div>

            {viewMode === 'digest' ? (
              /* NDU RESEARCH DIGEST & PUBLISHED VOLUMES VIEW */
              <div className="space-y-5 animate-fade-in">
                {/* Volume selector & Search */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[#FBF9F5] p-3.5 sm:p-4 rounded-md border border-stone-200">
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-600 mb-1.5">
                      Select Journal Issue / Volume
                    </label>
                    <div className="relative">
                      <select
                        value={selectedVolume}
                        onChange={(e) => setSelectedVolume(e.target.value)}
                        className="w-full min-h-[44px] appearance-none rounded-md border border-stone-300 bg-white pl-3.5 pr-10 text-xs sm:text-sm font-medium text-stone-900 focus:border-[#0B3B69] focus:outline-none cursor-pointer"
                      >
                        <option value="all">All Published Volumes &amp; Issues</option>
                        {digestJournals.map((j) => (
                          <option key={j.id} value={j.id}>
                            {j.name || `Vol ${j.volume_no}, Issue ${j.issue_no} (${j.publication_year})`}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                    </div>
                  </div>

                  <div className="sm:col-span-7">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-600 mb-1.5">
                      Search Published Articles
                    </label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                      <input
                        type="search"
                        value={digestSearch}
                        onChange={(e) => setDigestSearch(e.target.value)}
                        placeholder="Search by article title, author, or keyword..."
                        className="w-full min-h-[44px] rounded-md border border-stone-300 bg-white pl-10 pr-10 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#0B3B69] focus:outline-none"
                      />
                      {digestSearch && (
                        <button
                          type="button"
                          onClick={() => setDigestSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Published Articles List */}
                <div className="space-y-4">
                  {digestArticles
                    .filter((a) => a.is_visible !== false)
                    .filter((a) => selectedVolume === 'all' || a.journal_id === selectedVolume)
                    .filter((a) => {
                      if (!digestSearch.trim()) return true;
                      const q = digestSearch.toLowerCase();
                      return (
                        a.title.toLowerCase().includes(q) ||
                        a.authors.toLowerCase().includes(q) ||
                        (a.abstract && a.abstract.toLowerCase().includes(q))
                      );
                    }).length === 0 ? (
                    <div className="rounded-lg border border-dashed border-stone-300 p-8 text-center text-xs text-stone-500">
                      No published articles matched your selection.
                    </div>
                  ) : (
                    digestArticles
                      .filter((a) => a.is_visible !== false)
                      .filter((a) => selectedVolume === 'all' || a.journal_id === selectedVolume)
                      .filter((a) => {
                        if (!digestSearch.trim()) return true;
                        const q = digestSearch.toLowerCase();
                        return (
                          a.title.toLowerCase().includes(q) ||
                          a.authors.toLowerCase().includes(q) ||
                          (a.abstract && a.abstract.toLowerCase().includes(q))
                        );
                      })
                      .map((art) => {
                        const isExpanded = Boolean(expandedAbstracts[art.id]);
                        return (
                          <article
                            key={art.id}
                            className="rounded-lg border border-stone-200 bg-white p-5 space-y-3.5 shadow-xs hover:border-stone-300 transition-all"
                          >
                            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                              <span className="font-semibold text-[#14452F] bg-[#14452F]/10 px-2 py-0.5 rounded">
                                {art.journal_name || 'NDU Research Journal'}
                              </span>
                              {art.page_range && (
                                <>
                                  <span>·</span>
                                  <span>Pages {art.page_range}</span>
                                </>
                              )}
                              {art.published_at && (
                                <>
                                  <span>·</span>
                                  <span>Published {new Date(art.published_at).toLocaleDateString()}</span>
                                </>
                              )}
                            </div>

                            <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-snug">
                              {art.title}
                            </h3>

                            <div className="text-xs font-semibold text-stone-700">
                              Authors: <span className="font-normal text-stone-600">{art.authors}</span>
                            </div>

                            <div className="text-xs text-stone-600 leading-relaxed">
                              <p className={isExpanded ? '' : 'line-clamp-3'}>
                                <strong>Abstract: </strong>
                                {art.abstract}
                              </p>
                              {art.abstract && art.abstract.length > 200 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedAbstracts((prev) => ({
                                      ...prev,
                                      [art.id]: !prev[art.id],
                                    }))
                                  }
                                  className="text-[11px] font-semibold text-[#0B3B69] hover:underline mt-1 cursor-pointer"
                                >
                                  {isExpanded ? 'Show Less ▲' : 'Read Full Abstract ▼'}
                                </button>
                              )}
                            </div>

                            <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                              <span className="text-[11px] text-stone-400">
                                Double-blind peer-reviewed research manuscript
                              </span>

                              {art.download_enabled && art.file_path ? (
                                <a
                                  href={`/uploads/published/${art.file_path}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-md bg-[#14452F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D3121] shadow-sm transition-all"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  <span>Download Full Paper (PDF)</span>
                                </a>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-500 border border-stone-200">
                                  <Lock className="h-3 w-3" />
                                  <span>PDF Download Restricted by Admin</span>
                                </span>
                              )}
                            </div>
                          </article>
                        );
                      })
                  )}
                </div>
              </div>
            ) : (
            /* DEPARTMENTAL OPEN ACCESS CATALOG */
            <>
            {/* Mobile & Quick Faculty/Department Dropdown Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[#FBF9F5] p-3.5 sm:p-4 rounded-md border border-stone-200">
              <div className="min-w-0">
                <label
                  htmlFor="faculty-select"
                  className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-600 mb-1.5"
                >
                  Faculty
                </label>
                <div className="relative">
                  <select
                    id="faculty-select"
                    value={activeFaculty.id}
                    onChange={(e) => handleFacultyDropdownToggle(e.target.value)}
                    className="w-full min-h-[44px] appearance-none rounded-md border border-stone-300 bg-white pl-3.5 pr-10 text-sm font-medium text-stone-900 focus:border-[#0B3B69] focus:outline-none truncate cursor-pointer"
                  >
                    {FACULTY_CATALOGS.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                </div>
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="department-select"
                  className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-600 mb-1.5"
                >
                  Department
                </label>
                <div className="relative">
                  <select
                    id="department-select"
                    value={activeDepartment?.id ?? ''}
                    onChange={(e) => {
                      setSelectedDeptId(e.target.value);
                      setSubCategoryFilter('All');
                      setShowBookmarksOnly(false);
                      setSearchQuery('');
                    }}
                    className="w-full min-h-[44px] appearance-none rounded-md border border-stone-300 bg-white pl-3.5 pr-10 text-sm font-medium text-stone-900 focus:border-[#0B3B69] focus:outline-none truncate cursor-pointer"
                  >
                    {activeFaculty.departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.journals.length})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                </div>
              </div>
            </div>

            {/* Search + Bookmarks Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search all journals by title, department, or ISSN..."
                  aria-label="Search open access journals"
                  className="w-full min-h-[44px] rounded-md border border-stone-300 bg-white pl-10 pr-10 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#0B3B69] focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowBookmarksOnly((prev) => !prev)}
                className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border px-4 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  showBookmarksOnly
                    ? 'border-[#14452F] bg-[#14452F] text-white'
                    : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Bookmark className="h-3.5 w-3.5" />
                <span>My Reading List ({bookmarks.length})</span>
              </button>
            </div>

            {/* Active Context Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
              <div>
                {showBookmarksOnly ? (
                  <h3 className="font-serif text-lg font-semibold text-[#1C1917]">
                    My Reading List
                  </h3>
                ) : searchQuery.trim().length >= 2 ? (
                  <h3 className="font-serif text-lg font-semibold text-[#1C1917]">
                    Search Results Across All Departments
                  </h3>
                ) : (
                  <div>
                    <p className="text-xs text-stone-500">
                      {activeFaculty.name} · {activeDepartment?.name}
                    </p>
                    <h3 className="font-serif text-lg font-semibold text-[#1C1917]">
                      {activeDepartment?.name} Open Access Journals
                    </h3>
                    {activeDepartment?.note && (
                      <p className="text-xs text-stone-600 mt-0.5">{activeDepartment.note}</p>
                    )}
                  </div>
                )}
              </div>

              <span className="font-mono text-xs text-stone-500 tabular-nums">
                {displayedJournals.length}{' '}
                {displayedJournals.length === 1 ? 'journal' : 'journals'}
              </span>
            </div>

            {/* Sub-category filter tabs (e.g. for Geology sections) */}
            {!showBookmarksOnly && searchQuery.trim().length < 2 && subCategories.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 p-1 rounded-md">
                {['All', ...subCategories].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSubCategoryFilter(cat)}
                    className={`rounded px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      subCategoryFilter === cat
                        ? 'bg-white text-[#0B3B69] shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Journals List */}
            {displayedJournals.length === 0 ? (
              <div className="rounded-md border border-stone-200 bg-[#FBF9F5] p-8 text-center space-y-2">
                <p className="font-serif text-base font-medium text-stone-800">
                  {showBookmarksOnly
                    ? 'Your reading list is empty'
                    : 'No matching journals found'}
                </p>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  {showBookmarksOnly
                    ? 'Click "Save" beside any journal to add it to your personal My Reading List.'
                    : 'Try adjusting your search keywords or selecting another department from the directory.'}
                </p>
                {(showBookmarksOnly || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowBookmarksOnly(false);
                      setSearchQuery('');
                    }}
                    className="mt-2 inline-flex rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <motion.div
                key={`${activeFaculty.id}-${activeDepartment?.id ?? 'none'}-${subCategoryFilter}-${showBookmarksOnly ? 'saved' : 'all'}-${searchQuery.trim().length >= 2 ? 'search' : 'browse'}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: INSTITUTIONAL_EASE }}
                className="divide-y divide-stone-200 border border-stone-200 rounded-md overflow-hidden"
              >
                {displayedJournals.map((journal, idx) => {
                  const isBookmarked = bookmarks.includes(journal.id);
                  const isCopied = copiedId === journal.id;
                  const fallbackLookupUrl = `https://doaj.org/search/journals?source=${encodeURIComponent(
                    JSON.stringify({
                      query: {
                        query_string: {
                          query: journal.issn || journal.title,
                          default_operator: 'AND',
                        },
                      },
                    }),
                  )}`;
                  const targetHref = journal.url || fallbackLookupUrl;

                  return (
                    <div
                      key={`${journal.id}-${idx}`}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-4 py-3.5 hover:bg-[#FBF9F5]/80 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <span className="font-mono text-xs text-stone-400 tabular-nums shrink-0 w-8 pt-0.5">
                          {String(journal.sn ?? idx + 1).padStart(2, '0')}
                        </span>

                        <div className="min-w-0 flex-1 space-y-1">
                          <a
                            href={targetHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm font-semibold text-[#0B3B69] hover:text-[#14452F] hover:underline underline-offset-2 leading-snug break-words"
                          >
                            {journal.title}
                          </a>

                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-stone-500">
                            {(searchQuery.trim().length >= 2 || showBookmarksOnly) && (
                              <>
                                <span className="font-medium text-stone-700">
                                  {journal.facultyName} · {journal.deptName}
                                </span>
                                {(journal.issn || journal.eissn || journal.startYear || journal.subCategory) && (
                                  <span aria-hidden="true">·</span>
                                )}
                              </>
                            )}
                            {journal.subCategory && (
                              <>
                                <span>{journal.subCategory}</span>
                                {(journal.issn || journal.eissn || journal.startYear) && (
                                  <span aria-hidden="true">·</span>
                                )}
                              </>
                            )}
                            {journal.issn && (
                              <span className="font-mono tabular-nums">ISSN {journal.issn}</span>
                            )}
                            {journal.eissn && (
                              <>
                                {journal.issn && <span aria-hidden="true">·</span>}
                                <span className="font-mono tabular-nums">eISSN {journal.eissn}</span>
                              </>
                            )}
                            {journal.startYear && (
                              <>
                                {(journal.issn || journal.eissn) && <span aria-hidden="true">·</span>}
                                <span className="font-mono tabular-nums">
                                  Since {journal.startYear}
                                </span>
                              </>
                            )}
                            {journal.formerTitle && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="italic">Formerly {journal.formerTitle}</span>
                              </>
                            )}
                            {journal.url && (
                              <>
                                {(journal.issn || journal.eissn || journal.startYear || searchQuery.trim().length >= 2) && (
                                  <span aria-hidden="true">·</span>
                                )}
                                <span className="text-stone-400 truncate max-w-[260px]">
                                  {journal.url.replace(/^https?:\/\//, '')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-11 sm:pl-0 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyMeta(journal)}
                          title="Copy journal reference"
                          aria-label={`Copy citation info for ${journal.title}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 cursor-pointer"
                        >
                          {isCopied ? (
                            <Check className="h-3.5 w-3.5 text-[#14452F]" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleBookmark(journal.id)}
                          title={isBookmarked ? 'Remove from My Reading List' : 'Save to My Reading List'}
                          aria-label={
                            isBookmarked
                              ? `Remove ${journal.title} from My Reading List`
                              : `Save ${journal.title} to My Reading List`
                          }
                          className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            isBookmarked
                              ? 'border-[#14452F] bg-[#14452F] text-white hover:bg-[#0D3121]'
                              : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <Bookmark
                            className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-current' : ''}`}
                          />
                          <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                        </button>

                        <a
                          href={targetHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#0B3B69]/30 bg-[#0B3B69]/5 px-3 text-xs font-semibold text-[#0B3B69] hover:bg-[#0B3B69] hover:text-white transition-colors whitespace-nowrap shrink-0"
                        >
                          <span>{journal.url ? 'Open' : 'DOAJ'}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
            </>
            )}
            </section>
          </RevealOnScroll>

          {/* DEDICATED PERSONAL READING LIST SECTION */}
          <RevealOnScroll yOffset={22}>
            <section
              id="my-reading-list"
              aria-labelledby="reading-list-heading"
              className="rounded-lg border border-stone-200 bg-white p-5 sm:p-6 space-y-4"
            >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#14452F] font-semibold">
                  Personal Researcher Shelf
                </p>
                <div className="flex items-baseline gap-2.5 mt-0.5">
                  <h2
                    id="reading-list-heading"
                    className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#1C1917]"
                  >
                    My Reading List
                  </h2>
                  <span className="font-mono text-xs text-stone-500 tabular-nums">
                    {readingListJournals.length}{' '}
                    {readingListJournals.length === 1 ? 'saved journal' : 'saved journals'}
                  </span>
                </div>
              </div>

              {readingListJournals.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyReadingList}
                    className="inline-flex h-9 items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {copiedList ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#14452F]" />
                        <span>Copied List</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Citations</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleClearReadingList}
                    className="inline-flex h-9 items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 text-xs font-medium text-stone-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50/50 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Clear All</span>
                  </button>
                </div>
              )}
            </div>

            {readingListJournals.length === 0 ? (
              <div className="rounded-md border border-stone-200 bg-[#FBF9F5] p-6 text-center space-y-1.5">
                <p className="font-serif text-base font-medium text-stone-800">
                  No journals saved to My Reading List yet
                </p>
                <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                  Click the <strong>Save</strong> button on any open access journal above to pin it
                  here for quick access across sessions.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-200 border border-stone-200 rounded-md overflow-hidden">
                <AnimatePresence initial={false}>
                  {readingListJournals.map((journal, idx) => {
                    const fallbackLookupUrl = `https://doaj.org/search/journals?source=${encodeURIComponent(
                      JSON.stringify({
                        query: {
                          query_string: {
                            query: journal.issn || journal.title,
                            default_operator: 'AND',
                          },
                        },
                      }),
                    )}`;
                    const targetHref = journal.url || fallbackLookupUrl;

                    return (
                      <motion.div
                        key={`reading-${journal.id}`}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.24, ease: INSTITUTIONAL_EASE }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-4 py-3.5 hover:bg-[#FBF9F5]/80 transition-colors"
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <span className="font-mono text-xs text-stone-400 tabular-nums shrink-0 w-8 pt-0.5">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <a
                              href={targetHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm font-semibold text-[#0B3B69] hover:text-[#14452F] hover:underline underline-offset-2 leading-snug break-words"
                            >
                              {journal.title}
                            </a>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-stone-500">
                              <span>
                                {journal.facultyName} · {journal.deptName}
                              </span>
                              {journal.issn && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-mono tabular-nums">ISSN {journal.issn}</span>
                                </>
                              )}
                              {journal.eissn && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-mono tabular-nums">eISSN {journal.eissn}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pl-11 sm:pl-0 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleBookmark(journal.id)}
                            aria-label={`Remove ${journal.title} from My Reading List`}
                            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-stone-200 bg-white px-3 text-xs font-medium text-stone-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50/50 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Remove</span>
                          </button>
                          <a
                            href={targetHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#0B3B69]/30 bg-[#0B3B69]/5 px-3 text-xs font-semibold text-[#0B3B69] hover:bg-[#0B3B69] hover:text-white transition-colors whitespace-nowrap"
                          >
                            <span>{journal.url ? 'Open' : 'DOAJ'}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
            </section>
          </RevealOnScroll>
        </div>

        {/* RIGHT COLUMN: Open Access e-journal Faculty -> Department Drop Box (PDF Page 5 & Image 2) */}
        <aside
          aria-label="Open Access E-Journals by Faculty"
          className="order-2 lg:order-3 rounded-lg border border-stone-200 bg-white p-4 sm:p-5 lg:sticky lg:top-20"
        >
          <RevealOnLoad delay={0.1} yOffset={16}>
            <div className="border-b border-stone-200 pb-3 mb-3">
              <h2 className="font-serif text-lg font-semibold tracking-tight text-[#1C1917]">
                Open Access E-Journals
              </h2>
              <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                Free online journals compiled by the university library. Select a faculty below to
                expand its departments.
              </p>
            </div>

            <div className="space-y-1">
              {FACULTY_CATALOGS.map((faculty) => {
                const isExpanded = expandedFacultyId === faculty.id;
                const isActiveFaculty = activeFaculty.id === faculty.id;
                const journalTotal = faculty.departments.reduce(
                  (acc, d) => acc + d.journals.length,
                  0,
                );

                return (
                  <div
                    key={faculty.id}
                    className="border-b border-stone-100 last:border-b-0 pb-1"
                  >
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() => {
                        if (isExpanded && isActiveFaculty) {
                          setExpandedFacultyId('');
                        } else {
                          handleFacultyDropdownToggle(faculty.id);
                        }
                      }}
                      className={`flex w-full items-center justify-between gap-2.5 rounded-md px-2.5 py-2.5 text-left text-[13px] font-semibold transition-colors cursor-pointer ${
                        isActiveFaculty
                          ? 'bg-[#14452F]/10 text-[#14452F]'
                          : 'text-stone-800 hover:bg-stone-50 hover:text-[#0B3B69]'
                      }`}
                    >
                      <span className="leading-snug min-w-0">{faculty.shortName}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="w-7 text-right font-mono text-[11px] font-normal text-stone-500 tabular-nums">
                          {journalTotal}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-[#14452F]" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-stone-400" />
                        )}
                      </div>
                    </button>

                    {/* Department Drop Box (PDF Page 5 requirement) */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.24, ease: INSTITUTIONAL_EASE }}
                          className="overflow-hidden"
                        >
                          <div className="mt-1.5 mb-2 rounded-md border border-stone-200/90 bg-[#FBF9F5] p-1.5 space-y-0.5">
                            {faculty.departments.map((dept) => {
                              const isDeptActive =
                                isActiveFaculty && activeDepartment?.id === dept.id;
                              return (
                                <button
                                  key={dept.id}
                                  type="button"
                                  onClick={() => handleSelectDepartment(faculty.id, dept.id)}
                                  className={`flex w-full items-center justify-between gap-2 rounded px-2.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                                    isDeptActive
                                      ? 'bg-[#0B3B69] font-semibold text-white'
                                      : 'text-stone-700 hover:bg-white hover:text-[#0B3B69]'
                                  }`}
                                >
                                  <span className="leading-snug min-w-0">{dept.name}</span>
                                  <span
                                    className={`w-7 text-right font-mono text-[11px] tabular-nums shrink-0 ${
                                      isDeptActive ? 'text-amber-200' : 'text-stone-400'
                                    }`}
                                  >
                                    {dept.journals.length}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200 text-xs text-stone-600 space-y-2">
              <p className="leading-relaxed">
                For e-journal or database suggestions, contact the Systems Librarian.
              </p>
              <button
                type="button"
                onClick={onContactLibrarian}
                className="text-xs font-semibold text-[#0B3B69] hover:underline cursor-pointer"
              >
                Contact Systems Librarian →
              </button>
            </div>
          </RevealOnLoad>
        </aside>
      </div>
    </div>
  );
}
