import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  BookOpen,
  GraduationCap,
  Search,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Copy,
  Check,
  Share2,
  FileText,
  Sparkles,
  Layers,
  MapPin,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { OUR_LIBRARIES, type CampusLibrary } from '../data/libraryMeta';
import { FACULTY_CATALOGS } from '../data/journalsIndex';
import { api } from '../services/api';

interface FacultyLibraryViewProps {
  libraryId: string;
  onBack: () => void;
  onOpenManuscriptSubmission: () => void;
  onContactLibrarian: () => void;
  onSelectOtherLibrary: (libraryId: string) => void;
}

export function FacultyLibraryView({
  libraryId,
  onBack,
  onOpenManuscriptSubmission,
  onContactLibrarian,
  onSelectOtherLibrary,
}: FacultyLibraryViewProps) {
  // Find matching library metadata
  const library = useMemo(() => {
    return (
      OUR_LIBRARIES.find((lib) => lib.id === libraryId || lib.facultyId === libraryId) ||
      OUR_LIBRARIES[0]
    );
  }, [libraryId]);

  // Find matching faculty catalog with departments and journals
  const facultyCatalog = useMemo(() => {
    return (
      FACULTY_CATALOGS.find((f) => f.id === library.facultyId) ||
      FACULTY_CATALOGS.find((f) => f.id.toLowerCase().includes(library.id.toLowerCase())) ||
      FACULTY_CATALOGS[0]
    );
  }, [library]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [overrides, setOverrides] = useState<Record<string, any>>({});

  // Fetch live overrides so admin toggles, edits, and newly added links show up
  useEffect(() => {
    let isMounted = true;
    api.public.getJournalOverrides().then((res) => {
      if (isMounted && res.success && res.overrides) {
        setOverrides(res.overrides);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize all departments as expanded by default
  useEffect(() => {
    if (facultyCatalog) {
      setExpandedDepts(new Set(facultyCatalog.departments.map((d) => d.id)));
    }
  }, [facultyCatalog]);

  const toggleDept = (deptId: string) => {
    setExpandedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(deptId)) next.delete(deptId);
      else next.add(deptId);
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedDepts(new Set(facultyCatalog.departments.map((d) => d.id)));
  };

  const handleCollapseAll = () => {
    setExpandedDepts(new Set());
  };

  const handleCopyCitation = (title: string, url?: string, id?: string) => {
    const text = `${title} · Niger Delta University ${facultyCatalog.name} · ${url || 'https://library.ndu.edu.ng'}`;
    navigator.clipboard?.writeText(text);
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
    }
  };

  // Compute processed departments with overrides and custom added journals
  const processedDepartments = useMemo(() => {
    return facultyCatalog.departments.map((dept) => {
      // Base journals from static index
      const baseJournals = dept.journals
        .filter((j) => overrides[j.id]?.is_active !== false)
        .map((j) => {
          const o = overrides[j.id];
          return {
            id: j.id,
            title: o?.title || j.title,
            url: o?.url || j.url,
            issn: o?.issn !== undefined && o.issn !== null ? o.issn : j.issn,
            eissn: o?.eissn !== undefined && o.eissn !== null ? o.eissn : j.eissn,
            isCustom: false,
          };
        });

      // Custom added journals from overrides for this department
      const customJournals = Object.entries(overrides)
        .filter(
          ([id, o]) =>
            o.department_id === dept.id &&
            o.is_custom &&
            o.is_active !== false &&
            !dept.journals.some((j) => j.id === id),
        )
        .map(([id, o]) => ({
          id,
          title: o.title || 'Untitled Journal',
          url: o.url || '',
          issn: o.issn || '',
          eissn: o.eissn || '',
          isCustom: true,
        }));

      const allJournals = [...baseJournals, ...customJournals];

      // Filter by search query
      const q = searchQuery.toLowerCase().trim();
      const filteredJournals = allJournals.filter((j) => {
        if (!q) return true;
        return (
          j.title.toLowerCase().includes(q) ||
          dept.name.toLowerCase().includes(q) ||
          (j.issn && j.issn.toLowerCase().includes(q)) ||
          (j.eissn && j.eissn.toLowerCase().includes(q))
        );
      });

      return {
        ...dept,
        journals: filteredJournals,
        totalCount: allJournals.length,
      };
    });
  }, [facultyCatalog, overrides, searchQuery]);

  // Total visible journals in this faculty
  const totalFacultyJournals = useMemo(() => {
    return processedDepartments.reduce((acc, d) => acc + d.totalCount, 0);
  }, [processedDepartments]);

  const matchingDepartments = useMemo(() => {
    return processedDepartments.filter((dept) => {
      if (selectedDeptId !== 'all' && dept.id !== selectedDeptId) return false;
      if (searchQuery.trim() && dept.journals.length === 0) return false;
      return true;
    });
  }, [processedDepartments, selectedDeptId, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FBF9F5] pb-20 animate-fade-in">
      {/* Top Breadcrumb & Return Bar */}
      <div className="bg-white border-b border-stone-200">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#14452F] hover:text-[#0D3121] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>← Back to All Campus Libraries</span>
          </button>

          <nav aria-label="Breadcrumb" className="text-xs text-stone-500 flex items-center gap-1.5">
            <span className="hover:text-stone-900 cursor-pointer" onClick={onBack}>
              Home
            </span>
            <ChevronRight className="h-3 w-3 text-stone-400" />
            <span className="hover:text-stone-900 cursor-pointer" onClick={onBack}>
              Our Libraries
            </span>
            <ChevronRight className="h-3 w-3 text-stone-400" />
            <span className="font-semibold text-stone-800">{library.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#14452F] to-[#0D3121] text-white py-12 sm:py-16">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 flex flex-col items-center">
          <div className="max-w-4xl w-full text-center flex flex-col items-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs mx-auto">
              <Building2 className="h-3.5 w-3.5 text-amber-300" />
              <span>NDU Campus Faculty Library</span>
              <span className="text-white/40">·</span>
              <span className="text-amber-300 font-mono text-[11px]">{library.location}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight text-center">
              {library.name}
            </h1>

            <p className="text-sm sm:text-base text-stone-200 leading-relaxed max-w-2xl text-center mx-auto">
              {library.focus}
            </p>

            {/* Quick Metadata Stats Strip - Centered */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-3xl mx-auto">
              <div className="rounded-lg bg-white/10 p-3 sm:p-4 backdrop-blur-xs text-center flex flex-col items-center justify-center">
                <div className="text-[11px] uppercase tracking-wider text-stone-300 font-medium">
                  Departments
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {facultyCatalog.departments.length}
                </div>
              </div>

              <div className="rounded-lg bg-white/10 p-3 sm:p-4 backdrop-blur-xs text-center flex flex-col items-center justify-center">
                <div className="text-[11px] uppercase tracking-wider text-stone-300 font-medium">
                  Total Journals
                </div>
                <div className="text-xl sm:text-2xl font-bold text-amber-300 mt-1">
                  {totalFacultyJournals}+
                </div>
              </div>

              <div className="rounded-lg bg-white/10 p-3 sm:p-4 backdrop-blur-xs text-center flex flex-col items-center justify-center">
                <div className="text-[11px] uppercase tracking-wider text-stone-300 font-medium">
                  Access Status
                </div>
                <div className="text-xs sm:text-sm font-semibold text-emerald-300 mt-1.5 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Open Access 24/7</span>
                </div>
              </div>

              <div className="rounded-lg bg-white/10 p-3 sm:p-4 backdrop-blur-xs text-center flex flex-col items-center justify-center">
                <div className="text-[11px] uppercase tracking-wider text-stone-300 font-medium">
                  Physical Hours
                </div>
                <div className="text-xs sm:text-sm font-semibold text-stone-100 mt-1.5 flex items-center justify-center gap-1.5">
                  <Clock className="h-4 w-4 text-stone-300 shrink-0" />
                  <span>Mon – Fri, 8am – 4pm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Search, Department Consortia, and Journal Catalogs */}
      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 -mt-6">
        <div className="space-y-6">
          {/* Search & Filter Header Card */}
          <div className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  placeholder={`Search ${library.name} journals by title, ISSN, or department…`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-white pl-10 pr-4 py-2.5 text-sm text-stone-900 outline-none focus:border-[#14452F] focus:ring-1 focus:ring-[#14452F] transition-all"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-600 whitespace-nowrap">
                    Department:
                  </span>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-900 outline-none cursor-pointer"
                  >
                    <option value="all">
                      All {facultyCatalog.departments.length} Departments ({totalFacultyJournals}{' '}
                      journals)
                    </option>
                    {facultyCatalog.departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleExpandAll}
                    className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    Expand All
                  </button>
                  <button
                    type="button"
                    onClick={handleCollapseAll}
                    className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    Collapse All
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Department Pill Jump Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
              <button
                type="button"
                onClick={() => setSelectedDeptId('all')}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedDeptId === 'all'
                    ? 'bg-[#14452F] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                All Departments ({facultyCatalog.departments.length})
              </button>
              {facultyCatalog.departments.map((d) => {
                const count = processedDepartments.find((pd) => pd.id === d.id)?.totalCount || 0;
                const isSelected = selectedDeptId === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDeptId(isSelected ? 'all' : d.id)}
                    className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#0B3B69] text-white font-semibold shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <span>{d.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Department Listings and Journals */}
          <div className="space-y-6">
            {matchingDepartments.length === 0 ? (
              <div className="rounded-xl border border-stone-200 bg-white p-12 text-center space-y-3">
                <BookOpen className="h-10 w-10 text-stone-300 mx-auto" />
                <h3 className="font-serif text-lg font-semibold text-stone-800">
                  No Journals Found Matching Your Search
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Try adjusting your search keywords or select &quot;All Departments&quot; to browse
                  all available open-access journals.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDeptId('all');
                  }}
                  className="rounded-lg bg-[#14452F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D3121] transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              matchingDepartments.map((dept) => {
                const isExpanded = expandedDepts.has(dept.id);
                return (
                  <div
                    key={dept.id}
                    id={`dept-${dept.id}`}
                    className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden transition-all"
                  >
                    {/* Department Header */}
                    <button
                      type="button"
                      onClick={() => toggleDept(dept.id)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 bg-stone-50/80 hover:bg-stone-100/70 border-b border-stone-200 text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="p-1 rounded bg-[#14452F]/10 text-[#14452F]">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </span>
                        <div>
                          <h3 className="font-sans font-bold text-base sm:text-lg text-stone-900 leading-tight">
                            {dept.name}
                          </h3>
                          <p className="text-xs text-stone-500 font-normal mt-0.5">
                            Departmental Academic Research Catalog &amp; E-Journals
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                          {dept.journals.length} Open E-Journal{dept.journals.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </button>

                    {/* Department Journals Grid */}
                    {isExpanded && (
                      <div className="p-4 sm:p-6 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {dept.journals.map((journal) => (
                            <div
                              key={journal.id}
                              className="rounded-lg border border-stone-200 bg-stone-50/50 p-4 flex flex-col justify-between hover:border-[#14452F]/40 hover:bg-white hover:shadow-xs transition-all duration-200 space-y-3"
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                    <Sparkles className="h-2.5 w-2.5" />
                                    <span>Open Access</span>
                                  </span>

                                  {journal.isCustom && (
                                    <span className="inline-flex items-center text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                      Custom Link
                                    </span>
                                  )}
                                </div>

                                <h4 className="font-sans font-semibold text-sm text-stone-900 leading-snug">
                                  {journal.title}
                                </h4>

                                {(journal.issn || journal.eissn) && (
                                  <div className="text-[11px] text-stone-500 font-mono flex items-center gap-2">
                                    {journal.issn && <span>ISSN: {journal.issn}</span>}
                                    {journal.eissn && <span>eISSN: {journal.eissn}</span>}
                                  </div>
                                )}
                              </div>

                              <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                                {journal.url ? (
                                  <a
                                    href={journal.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 font-semibold text-[#0B3B69] hover:underline hover:text-[#082847] transition-colors"
                                  >
                                    <span>Browse Portal</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                ) : (
                                  <span className="text-stone-400 text-[11px]">NDU Institutional Journal</span>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopyCitation(journal.title, journal.url, journal.id)
                                  }
                                  className="p-1.5 rounded hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                                  title="Copy Citation"
                                >
                                  {copiedId === journal.id ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Other Faculties Navigation Carousel / Grid */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Explore Other NDU Faculty Libraries
                </h3>
                <p className="text-xs text-stone-500">
                  Switch to any other campus or institute library collection
                </p>
              </div>
              <button
                type="button"
                onClick={onBack}
                className="text-xs font-semibold text-[#14452F] hover:underline cursor-pointer"
              >
                View All Libraries →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {OUR_LIBRARIES.filter((l) => l.id !== library.id).map((otherLib) => (
                <button
                  key={otherLib.id}
                  type="button"
                  onClick={() => onSelectOtherLibrary(otherLib.id)}
                  className="rounded-lg border border-stone-200 bg-stone-50 p-3.5 text-left hover:border-[#14452F]/40 hover:bg-white hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                    <span className="truncate">{otherLib.location}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="font-semibold text-xs text-stone-900 group-hover:text-[#14452F] transition-colors leading-snug">
                    {otherLib.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
