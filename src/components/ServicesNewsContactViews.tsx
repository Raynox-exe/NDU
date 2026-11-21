import { useState, useEffect, useMemo, type FormEvent } from 'react';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  X,
  FileText,
  Download,
  Key,
  Copy,
  Check,
  Search,
  RefreshCw,
  Bell,
  Newspaper,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  LIBRARY_NEWS_EVENTS,
  LIBRARY_SERVICES,
  type DatabaseResource,
  type LibraryServiceItem,
} from '../data/libraryMeta';
import {
  INSTITUTIONAL_EASE,
  RevealOnLoad,
  RevealOnScroll,
  StaggerRevealGrid,
  StaggerRevealItem,
} from './MotionPrimitives';
import { api, type DynamicNews, type DynamicLink } from '../services/api';

interface ServicesViewProps {
  highlightedServiceId?: string;
  onOpenDigitalLibrary: () => void;
  onOpenJournals: () => void;
}

export function ServicesView({
  highlightedServiceId,
  onOpenDigitalLibrary,
  onOpenJournals,
}: ServicesViewProps) {
  const [category, setCategory] = useState<string>('All');
  // Always use the static LIBRARY_SERVICES — dynamic DB links are raw URL objects
  // that don't carry the service card fields (description, location, hours, badge).
  const activeServices = LIBRARY_SERVICES;
  const categories = ['All', 'Core Services', 'Research & Digital', 'Collections & Facilities'];

  const filtered = activeServices.filter(
    (s) => category === 'All' || s.category === category
  );

  const handleAction = (svc: any) => {
    if (svc.url) {
      window.open(svc.url, '_blank', 'noopener,noreferrer');
      return;
    }
    const act = svc.actionType || svc.action_type;
    if (act === 'journals') {
      onOpenJournals();
    } else if (act === 'digital-library') {
      onOpenDigitalLibrary();
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-8 space-y-8">
      <RevealOnLoad delay={0}>
        <div className="border-b border-stone-200 pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.14em] text-[#14452F] font-semibold">
              Niger Delta University Library
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#1C1917] [text-wrap:balance]">
              Our Library Services
            </h1>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              Comprehensive circulation, reference, bindery, repository, OPAC/Koha, faculty library,
              and digital library services supporting scholarship across Wilberforce Island.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-stone-100 p-1 rounded-md self-start shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  category === cat
                    ? 'bg-white text-[#14452F] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </RevealOnLoad>

      <StaggerRevealGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((svc: any) => {
          const isHighlighted = highlightedServiceId === svc.id;
          const actionType = svc.actionType || svc.action_type;
          return (
            <StaggerRevealItem key={svc.id} className="flex">
              <article
                className={`flex w-full flex-col justify-between rounded-lg border p-6 transition-all duration-200 ${
                  isHighlighted
                    ? 'border-[#0B3B69] bg-[#0B3B69]/5 ring-2 ring-[#0B3B69]/20'
                    : 'border-stone-200 bg-white hover:-translate-y-0.5 hover:border-stone-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#14452F]">
                      {svc.category}
                    </span>
                    {svc.badge && (
                      <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold text-stone-600">
                        {svc.badge}
                      </span>
                    )}
                  </div>
                  <h2 className="font-serif text-xl font-semibold text-[#1C1917] leading-snug">
                    {svc.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {svc.description || svc.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 space-y-2 mt-4 text-xs text-stone-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    <span>{svc.location || 'Main University Library & Online'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    <span>{svc.hours || 'Mon – Fri · 8:00am – 4:00pm'}</span>
                  </div>

                  {svc.url ? (
                    <div className="pt-2">
                      <a
                        href={svc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B3B69] hover:underline"
                      >
                        <span>Open Resource Portal</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ) : actionType !== 'detail' ? (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleAction(svc)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B3B69] hover:text-[#14452F] cursor-pointer"
                      >
                        <span>
                          {actionType === 'journals'
                            ? 'Browse NDU Open Access Journals'
                            : 'Open Digital Library Portal'}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : null}
                </div>
              </article>
            </StaggerRevealItem>
          );
        })}
      </StaggerRevealGrid>
    </div>
  );
}

export function NewsEventsView({ onOpenJournals: _onOpenJournals }: { onOpenJournals: () => void }) {
  // Start with empty array — static fallback only used if API fetch fails and returns nothing
  const [newsItems, setNewsItems] = useState<DynamicNews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<DynamicNews | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNews = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setIsRefreshing(true);
    try {
      const res = await api.public.getNews();
      if (res.success && res.news && res.news.length > 0) {
        setNewsItems(res.news.filter((n) => n.is_active !== false));
      } else if (!silent) {
        // Fall back to static data if API returns nothing
        setNewsItems(
          LIBRARY_NEWS_EVENTS.map((item) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            date: item.date,
            venue: item.venue,
            summary: item.summary,
            content: item.summary,
            is_active: true,
            created_at: new Date().toISOString(),
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching public news:', err);
      if (!silent) {
        setNewsItems(
          LIBRARY_NEWS_EVENTS.map((item) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            date: item.date,
            venue: item.venue,
            summary: item.summary,
            content: item.summary,
            is_active: true,
            created_at: new Date().toISOString(),
          }))
        );
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Compute available categories dynamically
  const categories = useMemo(() => {
    const cats = new Set<string>();
    newsItems.forEach((n) => {
      if (n.category) cats.add(n.category);
    });
    return Array.from(cats);
  }, [newsItems]);

  // Filtered news items
  const filteredNews = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return newsItems.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        (item.summary && item.summary.toLowerCase().includes(q)) ||
        (item.venue && item.venue.toLowerCase().includes(q)) ||
        (item.content && item.content.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q))
      );
    });
  }, [newsItems, selectedCategory, searchQuery]);

  const latestNews = newsItems[0];

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-8 space-y-8 animate-fade-in">
      {/* Header with Title and Live Updates Banner */}
      <RevealOnLoad delay={0}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>Live Announcements &amp; University Bulletins</span>
              <span className="text-stone-300">·</span>
              <span className="text-emerald-700 font-mono text-[11px]">
                {isLoading ? '…' : `${newsItems.length} Published`}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#1C1917] [text-wrap:balance]">
              Library News, Circulars &amp; Events
            </h1>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              Administrative circulars, university weekly bulletins, symposiums, ZOOM research conferences,
              and digital orientation schedules for Niger Delta University students, researchers, and faculty.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchNews()}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 active:scale-98 transition-all cursor-pointer self-start md:self-auto shadow-xs shrink-0"
            title="Refresh latest announcements"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-stone-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Checking Updates…' : 'Refresh Updates'}</span>
          </button>
        </div>
      </RevealOnLoad>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-stone-200 bg-white p-6 space-y-4 animate-pulse">
              <div className="flex gap-2">
                <div className="h-5 w-28 bg-stone-200 rounded" />
                <div className="h-5 w-24 bg-stone-100 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-6 w-full bg-stone-200 rounded" />
                <div className="h-5 w-4/5 bg-stone-100 rounded" />
              </div>
              <div className="h-12 w-full bg-stone-100 rounded" />
              <div className="flex justify-between pt-2 border-t border-stone-100">
                <div className="h-4 w-32 bg-stone-100 rounded" />
                <div className="h-4 w-24 bg-stone-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Latest Featured News Banner (if present) */}
      {!isLoading && latestNews && (
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50/70 to-stone-50 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <Bell className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>CURRENT PUBLISHED BULLETIN</span>
              <span>·</span>
              <span className="text-stone-500 font-normal">{latestNews.date}</span>
            </div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-snug">
              {latestNews.title}
            </h2>
            <p className="text-xs text-stone-600 line-clamp-2 max-w-3xl">
              {latestNews.summary}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSelectedNews(latestNews)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#14452F] hover:bg-[#0D3121] px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer shrink-0 shadow-xs self-start sm:self-auto"
          >
            <span>Read Bulletin</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      {!isLoading && (
      <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search announcements by headline, venue, or keywords…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white pl-9 pr-3 py-2 text-xs text-stone-900 outline-none focus:border-[#14452F] focus:ring-1 focus:ring-[#14452F] transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-600 whitespace-nowrap">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-900 outline-none cursor-pointer"
            >
              <option value="all">All Categories ({newsItems.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c} ({newsItems.filter((n) => n.category === c).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#14452F] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Updates ({newsItems.length})
          </button>
          {categories.map((cat) => {
            const count = newsItems.filter((n) => n.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat)}
                className={`px-3 py-1 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0B3B69] text-white font-semibold shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>{cat}</span>
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
      )}

      {/* News Cards Grid */}
      {!isLoading && (filteredNews.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-12 text-center space-y-3">
          <Newspaper className="h-10 w-10 text-stone-300 mx-auto" />
          <h3 className="font-serif text-lg font-semibold text-stone-800">
            No Bulletins Found
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {searchQuery
              ? `No announcements match "${searchQuery}". Try clearing your search.`
              : 'There are currently no active announcements in this category.'}
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="rounded-lg bg-[#14452F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D3121] transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNews.map((item) => {
            const filePath = item.file_path
              ? item.file_path.startsWith('/')
                ? item.file_path
                : `/uploads/resources/${item.file_path}`
              : null;

            return (
              <article
                key={item.id}
                className="flex w-full flex-col justify-between rounded-xl border border-stone-200 bg-white p-6 space-y-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                    <span className="font-semibold text-[#14452F] bg-[#14452F]/10 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    {filePath && (
                      <span className="font-bold text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        PDF Attached
                      </span>
                    )}
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {item.date}
                    </span>
                  </div>

                  <h2 className="font-serif text-xl font-bold text-stone-900 leading-snug">
                    {item.title}
                  </h2>

                  <p className="text-sm text-stone-600 leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
                  <span className="truncate max-w-[200px] font-medium text-stone-600 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    <span>{item.venue}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {filePath && (
                      <a
                        href={filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 px-3 py-1.5 rounded-md text-xs transition-colors"
                        title="Download Attached PDF"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>PDF</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedNews(item)}
                      className="font-semibold text-[#0B3B69] hover:underline px-2 py-1.5 cursor-pointer whitespace-nowrap"
                    >
                      Read Announcement →
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ))}

      {/* News Detail Modal */}
      <AnimatePresence>
        {selectedNews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 border border-stone-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-[#14452F] bg-[#14452F]/10 px-2.5 py-0.5 rounded-full">
                    {selectedNews.category}
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-stone-900 leading-snug pt-1">
                    {selectedNews.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{selectedNews.date}</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{selectedNews.venue}</span>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedNews(null)}
                  className="rounded-lg p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-stone-700 leading-relaxed">
                <p className="font-semibold text-stone-900 bg-stone-50 p-4 rounded-lg border border-stone-100">
                  {selectedNews.summary}
                </p>
                <div className="whitespace-pre-line text-stone-600 leading-relaxed">
                  {selectedNews.content || selectedNews.summary}
                </div>

                {selectedNews.file_path && (
                  <div className="pt-4 border-t border-stone-200">
                    <a
                      href={
                        selectedNews.file_path.startsWith('/')
                          ? selectedNews.file_path
                          : `/uploads/resources/${selectedNews.file_path}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#14452F] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0D3121] transition-colors shadow-xs"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Attached Circular / Document (PDF)</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSelectedNews(null)}
                  className="rounded-md border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ContactView() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('E-Journals / Database Suggestion');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-8 space-y-8">
      <RevealOnLoad delay={0}>
        <div className="border-b border-stone-200 pb-6 space-y-2 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.14em] text-[#14452F] font-semibold">
            University Library Desk
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#1C1917] [text-wrap:balance]">
            Contact Us
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            Reach the University Librarian’s office or the Systems Librarian for database access,
            open access e-journal suggestions, and scheduled research appointments.
          </p>
        </div>
      </RevealOnLoad>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Official Address Block */}
        <RevealOnScroll yOffset={18} className="lg:col-span-5 rounded-lg border border-stone-200 bg-white p-6 sm:p-8 space-y-6">
          <div className="space-y-1 border-b border-stone-100 pb-3">
            <p className="text-xs uppercase tracking-[0.12em] text-stone-500 font-semibold">
              Official Mailing Address
            </p>
            <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
              University Library
            </h2>
          </div>

          <address className="not-italic text-sm sm:text-base text-stone-700 leading-relaxed space-y-1">
            <p className="font-semibold text-[#14452F]">Niger Delta University</p>
            <p>Wilberforce Island</p>
            <p>P.M.B. 071</p>
            <p>Yenagoa</p>
            <p>Bayelsa State</p>
            <p>Nigeria.</p>
          </address>

          <div className="border-t border-stone-200 pt-5 space-y-3 text-sm text-stone-700">
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-[#0B3B69] shrink-0" />
              <span>Email: library@ndu.edu.ng</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-[#14452F] shrink-0" />
              <span>Opening Hours: Monday – Friday · 8:00am – 4:00pm</span>
            </div>
          </div>
        </RevealOnScroll>

        {/* Interactive Librarian Inquiry Form */}
        <RevealOnScroll delay={0.08} yOffset={18} className="lg:col-span-7 rounded-lg border border-stone-200 bg-white p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="submitted"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: INSTITUTIONAL_EASE }}
                className="py-8 text-center space-y-4"
              >
                <CheckCircle2 className="h-10 w-10 text-[#14452F] mx-auto" />
                <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
                  Inquiry Recorded for Library Staff
                </h2>
                <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                  Thank you, {name}. Your request regarding <strong>{topic}</strong> has been
                  prepared for the NDU Library &amp; Systems Librarian desk ({email}).
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setMessage('');
                  }}
                  className="rounded-md bg-[#0B3B69] px-4 py-2 text-xs font-semibold text-white hover:bg-[#082c4f] cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="border-b border-stone-100 pb-3">
                  <h2 className="font-serif text-xl font-semibold text-[#1C1917]">
                    Schedule an Appointment or Contact Systems Librarian
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Full Name / Matric or Staff ID
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Joyce C. Oyadonghan"
                      className="w-full min-h-[44px] rounded-md border border-stone-300 px-3.5 text-sm focus:border-[#0B3B69] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@ndu.edu.ng"
                      className="w-full min-h-[44px] rounded-md border border-stone-300 px-3.5 text-sm focus:border-[#0B3B69] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-topic" className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Inquiry Category
                  </label>
                  <div className="relative">
                    <select
                      id="contact-topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full min-h-[44px] appearance-none rounded-md border border-stone-300 bg-white pl-3.5 pr-10 text-sm text-stone-900 focus:border-[#0B3B69] focus:outline-none cursor-pointer"
                    >
                      <option>E-Journals / Database Suggestion</option>
                      <option>EBSCOHost / HINARI / Law Database Credentials</option>
                      <option>Schedule Research Appointment</option>
                      <option>NDU Institutional Repository / Thesis Submission</option>
                      <option>Koha OPAC / Circulation Clearance</option>
                      <option>News &amp; Announcements Inquiry</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-msg" className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Message or Journal Request
                  </label>
                  <textarea
                    id="contact-msg"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your faculty, department, or inquiry..."
                    className="w-full rounded-md border border-stone-300 p-3.5 text-sm focus:border-[#0B3B69] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-md bg-[#14452F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0D3121] active:scale-[0.98] transition-all cursor-pointer"
                >
                  Submit Inquiry
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </RevealOnScroll>
      </div>
    </div>
  );
}

interface DatabaseModalProps {
  database: DatabaseResource | null;
  onClose: () => void;
}

export function DatabaseModal({ database, onClose }: DatabaseModalProps) {
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  // Default masked (hidden) — user clicks eye to reveal
  const [showUser, setShowUser] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const copyToClipboard = (text: string, type: 'user' | 'pass') => {
    navigator.clipboard.writeText(text);
    if (type === 'user') {
      setCopiedUser(true);
      setTimeout(() => setCopiedUser(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {database && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="db-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.24, ease: INSTITUTIONAL_EASE }}
            className="w-full max-w-lg rounded-lg border border-stone-200 bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#14452F]">
                  {database.group}
                </p>
                <h2 id="db-modal-title" className="font-serif text-xl font-semibold text-[#1C1917] mt-0.5">
                  {database.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close database dialog"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm text-stone-700 leading-relaxed">{database.description}</p>

            {/* Credentials Card if available */}
            {(database.username || database.password) && (
              <div className="rounded-lg border border-amber-300 bg-amber-50/80 p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs tracking-wide uppercase">
                  <Key className="h-4 w-4 text-amber-700" />
                  <span>Subscribed Access Credentials</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {database.username && (
                    <div className="bg-white p-2.5 rounded border border-amber-200 shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-stone-500 block">Username</span>
                      <div className="flex items-center justify-between mt-1 gap-1">
                        <code className="font-mono font-bold text-stone-900 text-sm select-all flex-1 overflow-hidden">
                          {showUser ? database.username : '•'.repeat(Math.min(database.username.length, 12))}
                        </code>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowUser((v) => !v)}
                            className="p-1 hover:bg-stone-100 rounded text-stone-500 transition-colors cursor-pointer"
                            title={showUser ? 'Hide Username' : 'Show Username'}
                          >
                            {showUser ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(database.username!, 'user')}
                            className="p-1 hover:bg-stone-100 rounded text-stone-600 transition-colors cursor-pointer"
                            title="Copy Username"
                          >
                            {copiedUser ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {database.password && (
                    <div className="bg-white p-2.5 rounded border border-amber-200 shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-stone-500 block">Password</span>
                      <div className="flex items-center justify-between mt-1 gap-1">
                        <code className="font-mono font-bold text-stone-900 text-sm select-all flex-1 overflow-hidden">
                          {showPass ? database.password : '•'.repeat(Math.min(database.password.length, 12))}
                        </code>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowPass((v) => !v)}
                            className="p-1 hover:bg-stone-100 rounded text-stone-500 transition-colors cursor-pointer"
                            title={showPass ? 'Hide Password' : 'Show Password'}
                          >
                            {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(database.password!, 'pass')}
                            className="p-1 hover:bg-stone-100 rounded text-stone-600 transition-colors cursor-pointer"
                            title="Copy Password"
                          >
                            {copiedPass ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-amber-800 leading-tight">
                  Enter these credentials when prompted on the official database authentication screen.
                </p>
              </div>
            )}

            {/* Access Method hidden — credentials shown via eye-icon toggle above */}

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Close
              </button>
              {database.url && (
                <a
                  href={database.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#0B3B69] px-4 py-2 text-xs font-semibold text-white hover:bg-[#082c4f] transition-colors"
                >
                  <span>Open Database Portal</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
