import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Download,
  ExternalLink,
  FileText,
  Building2,
  FileCheck,
} from 'lucide-react';
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
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  // Fetch live newspapers uploaded by admin from backend
  const fetchNewspapers = async () => {
    setIsLoading(true);
    try {
      const res = await api.public.getNewspapers();
      if (res.success && Array.isArray(res.newspapers) && res.newspapers.length > 0) {
        const mapped: NewspaperItem[] = res.newspapers.map((n: DynamicNewspaper) => ({
          id: n.id,
          title: n.title,
          edition: n.edition || 'Daily Edition',
          date: n.date,
          publisher: n.publisher || '',
          summary: n.summary || '',
          file_path: n.file_path || '',
          cover_image: n.cover_image || '',
          url: n.url || '',
          file_size: n.file_size || 'PDF Document',
          page_count: n.page_count,
          is_active: n.is_active,
          created_at: n.created_at,
        }));
        setNewspapers(mapped);
      } else {
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

      {/* Hero Header Section - Centered */}
      <RevealOnLoad delay={0}>
        <div className="rounded-2xl border border-stone-200 bg-gradient-to-br from-white via-stone-50/50 to-emerald-50/30 p-6 sm:p-8 md:p-10 shadow-xs relative overflow-hidden text-center">
          <div className="space-y-3 max-w-2xl mx-auto">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1C1917] [text-wrap:balance]">
              Daily Newspapers Archive
            </h1>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              Archived editions of national and regional Nigerian daily newspapers uploaded by the University Library
              for student learning, academic research, historical reference, and current awareness.
            </p>
          </div>
        </div>
      </RevealOnLoad>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="max-w-2xl mx-auto rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 space-y-6 animate-pulse">
          <div className="w-full h-[450px] bg-stone-200 rounded-xl" />
          <div className="h-7 w-48 bg-stone-200 rounded" />
          <div className="h-4 w-64 bg-stone-100 rounded" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-stone-100 rounded" />
            <div className="h-4 w-5/6 bg-stone-100 rounded" />
          </div>
          <div className="flex gap-3">
            <div className="h-12 flex-1 bg-stone-200 rounded-xl" />
            <div className="h-12 w-28 bg-stone-100 rounded-xl" />
          </div>
        </div>
      )}

      {/* Newspaper Showcase with First Page PDF Preview */}
      {!isLoading && (
        <div className="max-w-2xl mx-auto">
          {newspapers.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center space-y-3">
              <FileText className="h-12 w-12 text-stone-300 mx-auto" />
              <h3 className="font-serif text-lg font-semibold text-stone-800">
                No Newspaper Editions Available
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                No archived newspaper is currently published.
              </p>
            </div>
          ) : (
            newspapers.map((paper) => {
              const isDownloaded = downloadSuccessId === paper.id;
              const fileUrl = paper.file_path
                ? paper.file_path.startsWith('/') || paper.file_path.startsWith('http')
                  ? paper.file_path
                  : `/uploads/resources/${paper.file_path}`
                : paper.url || '#';
              const coverUrl =
                paper.cover_image || '/uploads/resources/thisday_nov_21_2026_cover.jpg';

              return (
                <RevealOnScroll key={paper.id} yOffset={10}>
                  <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-8 shadow-xs hover:shadow-md transition-all space-y-6">
                    {/* First Page Preview of PDF */}
                    <div className="relative group/preview overflow-hidden rounded-xl border border-stone-200 bg-stone-50 shadow-inner flex justify-center items-center">
                      <img
                        src={coverUrl}
                        alt={`${paper.title} - First Page Preview (${paper.date})`}
                        className="w-full max-h-[620px] object-contain rounded-lg transition-transform duration-300 group-hover/preview:scale-[1.01]"
                      />
                      <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-xs text-white text-[11px] font-medium tracking-wide flex items-center gap-1.5 shadow-md">
                        <FileText className="h-3.5 w-3.5 text-emerald-400" />
                        <span>First Page Preview · {paper.page_count || 40} Pages</span>
                      </div>
                    </div>

                    {/* Metadata & Headline Highlights */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 pb-3">
                        <div>
                          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                            {paper.title}
                          </h2>
                          <p className="text-xs sm:text-sm text-stone-500 font-medium">
                            {paper.edition}
                          </p>
                        </div>

                        {/* Date Banner */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[#14452F] shrink-0 self-start sm:self-auto">
                          <Calendar className="h-4 w-4 text-emerald-700 shrink-0" />
                          <span className="text-xs sm:text-sm font-semibold">
                            {paper.date}
                          </span>
                        </div>
                      </div>

                      {/* Headlines Summary */}
                      {paper.summary && (
                        <div className="space-y-1.5 bg-stone-50 rounded-xl p-4 border border-stone-200/70">
                          <span className="text-[11px] font-bold text-[#14452F] uppercase tracking-wider block">
                            Key Headlines &amp; Reports
                          </span>
                          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                            {paper.summary}
                          </p>
                        </div>
                      )}

                      {/* Publisher and Page Count Details */}
                      <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 pt-1">
                        <span>
                          Publisher: <strong className="text-stone-700">{paper.publisher || 'Leaders & Company Limited'}</strong>
                        </span>
                        <span className="font-mono text-stone-600 font-medium">
                          {paper.file_size || '5.5 MB'} · {paper.page_count ? `${paper.page_count} Pages Complete` : 'Digital PDF'}
                        </span>
                      </div>

                      {/* Download and Read Buttons Below */}
                      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleDownload(paper)}
                          className={`flex-1 inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs ${
                            isDownloaded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#14452F] text-white hover:bg-[#0D3121] active:scale-[0.99]'
                          }`}
                        >
                          {isDownloaded ? (
                            <>
                              <FileCheck className="h-5 w-5 animate-bounce" />
                              <span>Downloaded Successfully!</span>
                            </>
                          ) : (
                            <>
                              <Download className="h-5 w-5" />
                              <span>Download PDF ({paper.file_size || '5.5 MB'})</span>
                            </>
                          )}
                        </button>

                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-6 py-3.5 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:text-[#14452F] hover:border-emerald-300 transition-all cursor-pointer shadow-xs"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Read</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>
              );
            })
          )}
        </div>
      )}

      {/* Institutional Footer Notice */}
      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 sm:p-5 text-center text-xs text-stone-500 space-y-1 max-w-2xl mx-auto">
        <p className="font-semibold text-stone-700">
          Niger Delta University Library Serials &amp; Newspapers Division
        </p>
        <p className="text-stone-500 text-[11px]">
          Physical hardcopies of daily publications dating back to inception are also preserved in the Serials Reading Room,
          Second Floor, Main University Library, Wilberforce Island.
        </p>
      </div>
    </div>
  );
}
