import { useState, useEffect, type FormEvent } from 'react';
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
  const [activeServices, setActiveServices] = useState<any[]>(LIBRARY_SERVICES);
  const categories = ['All', 'Core Services', 'Research & Digital', 'Collections & Facilities'];

  useEffect(() => {
    let isMounted = true;
    api.public
      .getSectionsAndLinks()
      .then((res) => {
        if (isMounted && res.success && res.allActiveLinks) {
          const serviceLinks = res.allActiveLinks.filter(
            (l) => l.section_id === 'sec-services' && l.is_active !== false
          );
          if (serviceLinks.length > 0) {
            setActiveServices(serviceLinks);
          }
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

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

export function NewsEventsView({ onOpenJournals }: { onOpenJournals: () => void }) {
  const [newsItems, setNewsItems] = useState<DynamicNews[]>(() =>
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
  const [selectedNews, setSelectedNews] = useState<DynamicNews | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api.public
      .getNews()
      .then((res) => {
        if (isMounted && res.success && res.news && res.news.length > 0) {
          setNewsItems(res.news.filter((n) => n.is_active !== false));
        }
      })
      .catch((err) => {
        console.error('Error fetching public news:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-8 space-y-8 animate-fade-in">
      <RevealOnLoad delay={0}>
        <div className="border-b border-stone-200 pb-6 space-y-2 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.14em] text-[#14452F] font-semibold">
            Official University News &amp; Bulletins
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#1C1917] [text-wrap:balance]">
            Library News, Circulars &amp; Events
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            Administrative circulars, university weekly bulletins, symposiums, ZOOM research conferences,
            and digital orientation schedules for Niger Delta University students and faculty.
          </p>
        </div>
      </RevealOnLoad>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {newsItems.map((item) => {
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
                <span className="truncate max-w-[180px] font-medium text-stone-600">{item.venue}</span>
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
                      <span>Download PDF</span>
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

      {/* News Detail Modal */}
      <AnimatePresence>
        {selectedNews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 border border-stone-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-[#14452F] bg-[#14452F]/10 px-2 py-0.5 rounded">
                    {selectedNews.category}
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-stone-900 leading-snug">
                    {selectedNews.title}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-stone-500 pt-1">
                    <span>Date: {selectedNews.date}</span>
                    <span>·</span>
                    <span>Venue: {selectedNews.venue}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedNews(null)}
                  className="rounded-lg p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-stone-700 leading-relaxed">
                <p className="font-semibold text-stone-900">{selectedNews.summary}</p>
                <div className="whitespace-pre-line text-stone-600">
                  {selectedNews.content || selectedNews.summary}
                </div>

                {selectedNews.file_path && (
                  <div className="pt-3 border-t border-stone-200">
                    <a
                      href={selectedNews.file_path.startsWith('/') ? selectedNews.file_path : `/uploads/resources/${selectedNews.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md bg-[#14452F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D3121] transition-colors"
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
                      <div className="flex items-center justify-between mt-1">
                        <code className="font-mono font-bold text-stone-900 text-sm select-all">{database.username}</code>
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
                  )}
                  {database.password && (
                    <div className="bg-white p-2.5 rounded border border-amber-200 shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-stone-500 block">Password</span>
                      <div className="flex items-center justify-between mt-1">
                        <code className="font-mono font-bold text-stone-900 text-sm select-all">{database.password}</code>
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
                  )}
                </div>
                <p className="text-[11px] text-amber-800 leading-tight">
                  Enter these credentials when prompted on the official database authentication screen.
                </p>
              </div>
            )}

            <div className="rounded-md border border-stone-200 bg-[#FBF9F5] p-3.5 text-xs text-stone-600">
              <strong className="text-stone-900">Access Method:</strong> {database.accessNote}
            </div>

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
