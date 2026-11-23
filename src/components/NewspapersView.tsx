import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Download,
  ExternalLink,
  FileText,
  Newspaper,
  Search,
  Building2,
  CheckCircle2,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { NduCrest } from './NduCrest';
import { RevealOnLoad, RevealOnScroll } from './MotionPrimitives';
import { api, type DynamicNewspaper } from '../services/api';
import { INITIAL_NEWSPAPERS, type NewspaperItem } from '../data/newspapersData';

interface NewspapersViewProps {
  onNavigateHome: () => void;
  onNavigateDigitalLibrary?: () => void;
}

export function NewspapersView({
  onNavigateHome,
  onNavigateDigitalLibrary,
}: NewspapersViewProps) {
  const [newspapers, setNewspapers] = useState<NewspaperItem[]>(INITIAL_NEWSPAPERS);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPublisher, setSelectedPublisher] = useState<string>('all');
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  // Fetch live newspapers uploaded by admin from backend
  const fetchNewspapers = async () => {
    setIsLoading(true);
    try {
      const res = await api.public.getNewspapers();
      if (res.success && Array.isArray(res.newspapers) && res.newspapers.length > 0) {
        // Map dynamic newspapers
        const mapped: NewspaperItem[] = res.newspapers.map((n: DynamicNewspaper) => ({
          id: n.id,
          title: n.title,
          edition: n.edition || 'Daily Edition',
          date: n.date,
          publisher: n.publisher || '',
          summary: n.summary || '',
          file_path: n.file_path || '',
          url: n.url || '',
          file_size: n.file_size || 'PDF Document',
          page_count: n.page_count,
          is_active: n.is_active,
          created_at: n.created_at,
        }));
        setNewspapers(mapped);
      } else {
        // Fall back to preloaded newspapers
        setNewspapers(INITIAL_NEWSPAPERS);
      }
    } catch {
      setNewspapers(INITIAL_NEWSPAPERS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewspapers();
  }, []);

  // Filtered publications
  const filteredPapers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return newspapers.filter((paper) => {
      if (selectedPublisher !== 'all' && paper.title !== selectedPublisher) {
        return false;
      }
      if (!q) return true;
      return (
        paper.title.toLowerCase().includes(q) ||
        paper.edition.toLowerCase().includes(q) ||
        paper.date.toLowerCase().includes(q) ||
        (paper.summary && paper.summary.toLowerCase().includes(q)) ||
        (paper.publisher && paper.publisher.toLowerCase().includes(q))
      );
    });
  }, [newspapers, searchQuery, selectedPublisher]);

  // Unique publication names for quick filters
  const publishers = useMemo(() => {
    const pubs = new Set<string>();
    newspapers.forEach((p) => pubs.add(p.title));
    return Array.from(pubs);
  }, [newspapers]);

  const handleDownload = (paper: NewspaperItem) => {
    const fileUrl = paper.file_path
      ? paper.file_path.startsWith('/') || paper.file_path.startsWith('http')
        ? paper.file_path
        : `/uploads/resources/${paper.file_path}`
      : paper.url || '#';

    // Trigger download
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = `${paper.title.replace(/\s+/g, '_')}_${paper.date.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccessId(paper.id);
    setTimeout(() => setDownloadSuccessId(null), 3000);
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-8 animate-fade-in">
      {/* Top Breadcrumb & Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 border-b border-stone-200 pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 font-medium text-[#14452F] hover:underline cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Home</span>
          </button>
          <span>/</span>
          {onNavigateDigitalLibrary && (
            <>
              <button
                type="button"
                onClick={onNavigateDigitalLibrary}
                className="hover:underline cursor-pointer text-stone-600"
              >
                Digital Library
              </button>
              <span>/</span>
            </>
          )}
          <span className="font-semibold text-stone-800">Newspapers Archive</span>
        </div>

        <div className="flex items-center gap-2 text-stone-500 text-[11px]">
          <Building2 className="h-3.5 w-3.5 text-[#14452F]" />
          <span>Serials &amp; Periodicals Division · NDU Main Library</span>
        </div>
      </div>

      {/* Hero Header Section */}
      <RevealOnLoad delay={0}>
        <div className="rounded-2xl border border-stone-200 bg-gradient-to-br from-white via-stone-50/50 to-emerald-50/30 p-6 sm:p-8 md:p-10 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 text-center md:text-left">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-semibold mx-auto md:mx-0">
                <Newspaper className="h-3.5 w-3.5 text-emerald-700" />
                <span>Daily Press &amp; Periodicals Collection</span>
                <span className="text-emerald-400">·</span>
                <span className="text-emerald-800 font-mono text-[11px]">
                  {newspapers.length} Editions Archived
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1C1917] [text-wrap:balance]">
                Daily Newspapers Archive
              </h1>

              <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl">
                Archived editions of national and regional Nigerian daily newspapers uploaded by the University Library
                for student learning, academic research, historical reference, and current awareness.
              </p>
            </div>

            <div className="shrink-0 flex flex-col items-center gap-2">
              <NduCrest className="h-20 w-auto drop-shadow-xs" />
              <span className="text-[10px] font-bold text-[#14452F] uppercase tracking-wider">
                NDU Central Library
              </span>
            </div>
          </div>
        </div>
      </RevealOnLoad>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search newspaper by title, headlines, date, or keywords…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-stone-50/50 pl-10 pr-4 py-2 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-[#14452F] focus:ring-1 focus:ring-[#14452F] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={fetchNewspapers}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-all cursor-pointer shadow-xs shrink-0"
            title="Refresh newspaper catalog"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-stone-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Checking…' : 'Refresh Catalog'}</span>
          </button>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar pt-1 border-t border-stone-100">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mr-1 shrink-0">
            Publisher:
          </span>
          <button
            type="button"
            onClick={() => setSelectedPublisher('all')}
            className={`px-3 py-1 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
              selectedPublisher === 'all'
                ? 'bg-[#14452F] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Publications ({newspapers.length})
          </button>

          {publishers.map((pub) => {
            const count = newspapers.filter((p) => p.title === pub).length;
            const isSelected = selectedPublisher === pub;
            return (
              <button
                key={pub}
                type="button"
                onClick={() => setSelectedPublisher(isSelected ? 'all' : pub)}
                className={`px-3 py-1 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0B3B69] text-white font-semibold shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>{pub}</span>
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

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl border border-stone-200 bg-white p-6 space-y-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-6 w-32 bg-stone-200 rounded" />
                <div className="h-5 w-20 bg-stone-100 rounded-full" />
              </div>
              <div className="h-4 w-40 bg-stone-200 rounded" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-stone-100 rounded" />
                <div className="h-4 w-5/6 bg-stone-100 rounded" />
              </div>
              <div className="pt-4 border-t border-stone-100 flex gap-2">
                <div className="h-9 flex-1 bg-stone-200 rounded-lg" />
                <div className="h-9 w-20 bg-stone-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Newspapers Cards Grid */}
      {!isLoading && (
        <>
          {filteredPapers.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center space-y-3">
              <Newspaper className="h-12 w-12 text-stone-300 mx-auto" />
              <h3 className="font-serif text-lg font-semibold text-stone-800">
                No Newspaper Editions Found
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                No archived newspaper matches your current search or publisher filter. Try clearing your search keywords.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedPublisher('all');
                }}
                className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-[#14452F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D3121] transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPapers.map((paper) => {
                const isDownloaded = downloadSuccessId === paper.id;
                const fileUrl = paper.file_path
                  ? paper.file_path.startsWith('/') || paper.file_path.startsWith('http')
                    ? paper.file_path
                    : `/uploads/resources/${paper.file_path}`
                  : paper.url || '#';

                return (
                  <RevealOnScroll key={paper.id} yOffset={10}>
                    <div className="flex flex-col justify-between h-full rounded-xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group">
                      <div className="space-y-3">
                        {/* Title and Edition Pill */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#14452F] shrink-0 group-hover:scale-105 transition-transform">
                              <Newspaper className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug group-hover:text-[#14452F] transition-colors">
                                {paper.title}
                              </h3>
                              <p className="text-[11px] text-stone-500 font-medium">
                                {paper.edition}
                              </p>
                            </div>
                          </div>

                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 shrink-0">
                            PDF Edition
                          </span>
                        </div>

                        {/* Date Banner (Prominently Displayed as requested) */}
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50/70 border border-emerald-200/70 text-[#14452F]">
                          <Calendar className="h-4 w-4 text-emerald-700 shrink-0" />
                          <span className="text-xs font-semibold">
                            {paper.date}
                          </span>
                        </div>

                        {/* Summary / Headlines */}
                        <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                          {paper.summary || 'Daily news archive and national headline reports archived for institutional access.'}
                        </p>

                        {/* Metadata row */}
                        <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                          <span className="truncate max-w-[180px]">
                            {paper.publisher || 'NDU Serials Collection'}
                          </span>
                          <span className="font-mono text-stone-600 font-medium">
                            {paper.file_size || (paper.page_count ? `${paper.page_count} Pages` : 'Digital Issue')}
                          </span>
                        </div>
                      </div>

                      {/* Download and Read Action Buttons */}
                      <div className="mt-5 pt-3 border-t border-stone-100 flex items-center gap-2">
                        {/* Primary Download Button */}
                        <button
                          type="button"
                          onClick={() => handleDownload(paper)}
                          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                            isDownloaded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#14452F] text-white hover:bg-[#0D3121] active:scale-98'
                          }`}
                        >
                          {isDownloaded ? (
                            <>
                              <FileCheck className="h-4 w-4 animate-bounce" />
                              <span>Downloaded!</span>
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4" />
                              <span>Download PDF</span>
                            </>
                          )}
                        </button>

                        {/* External View / Read Button */}
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-[#14452F] transition-colors cursor-pointer"
                          title="Open e-paper in new tab"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Read</span>
                        </a>
                      </div>
                    </div>
                  </RevealOnScroll>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Institutional Footer Notice */}
      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 sm:p-5 text-center text-xs text-stone-500 space-y-1">
        <p className="font-semibold text-stone-700">
          Niger Delta University Library Serials &amp; Newspapers Division
        </p>
        <p className="max-w-2xl mx-auto text-stone-500 text-[11px]">
          Physical hardcopies of daily publications dating back to inception are also preserved in the Serials Reading Room,
          Second Floor, Main University Library, Wilberforce Island.
        </p>
      </div>
    </div>
  );
}
