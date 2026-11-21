import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Bell,
  Plus,
  Trash2,
  FileCheck,
  Download,
  Building,
  UserCheck,
  Send,
  Menu,
  X,
  RefreshCw,
  Home,
  LogOut,
  LayoutDashboard,
  ChevronRight,
} from 'lucide-react';
import { api, type Submission, type Notification, type User } from '../services/api';

interface MemberDashboardViewProps {
  user: User;
  onLogout: () => void;
  onNavigateHome: () => void;
}

export function MemberDashboardView({ user, onLogout, onNavigateHome }: MemberDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'submit' | 'articles' | 'notifications'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for submitting manuscript
  const [title, setTitle] = useState('');
  const [subjectArea, setSubjectArea] = useState('Environmental Science');
  const [customArea, setCustomArea] = useState('');
  const [abstract, setAbstract] = useState('');
  const [authorName, setAuthorName] = useState(user.full_name || '');
  const [authorEmail, setAuthorEmail] = useState(user.email || '');
  const [authorInstitute, setAuthorInstitute] = useState('Niger Delta University');
  const [contactNumber, setContactNumber] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [file, setFile] = useState<File | null>(null);
  const [coAuthors, setCoAuthors] = useState<Array<{ name: string; institute: string; email: string }>>([]);

  const [submitting, setSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subRes, notifRes] = await Promise.all([
        api.submissions.getMySubmissions(),
        api.submissions.getNotifications(),
      ]);
      if (subRes.success) setSubmissions(subRes.submissions);
      if (notifRes.success) setNotifications(notifRes.notifications);
    } catch (err) {
      console.error('Error fetching member data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddCoAuthor = () => {
    if (coAuthors.length >= 6) return;
    setCoAuthors([...coAuthors, { name: '', institute: '', email: '' }]);
  };

  const handleRemoveCoAuthor = (index: number) => {
    setCoAuthors(coAuthors.filter((_, i) => i !== index));
  };

  const handleCoAuthorChange = (index: number, field: 'name' | 'institute' | 'email', value: string) => {
    const updated = [...coAuthors];
    updated[index][field] = value;
    setCoAuthors(updated);
  };

  const handleManuscriptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setSubmitFeedback({ type: 'error', message: 'Please select a manuscript file (.pdf, .doc, .docx)' });
      return;
    }

    setSubmitting(true);
    setSubmitFeedback(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('area', subjectArea);
    if (subjectArea === 'Other') {
      formData.append('area_other', customArea);
    }
    formData.append('abstract', abstract);
    formData.append('author_name', authorName);
    formData.append('author_email', authorEmail);
    formData.append('author_institute', authorInstitute);
    formData.append('contact_number', contactNumber);
    formData.append('country', country);
    formData.append('co_authors', JSON.stringify(coAuthors));
    formData.append('manuscriptFile', file);

    try {
      const res = await api.submissions.upload(formData);
      if (res.success) {
        setSubmitFeedback({
          type: 'success',
          message: 'Manuscript uploaded and submitted for peer review successfully!',
        });
        // Reset form
        setTitle('');
        setAbstract('');
        setFile(null);
        setCoAuthors([]);
        // Refresh submissions
        loadData();
        setTimeout(() => setActiveTab('articles'), 1200);
      } else {
        setSubmitFeedback({ type: 'error', message: res.message || 'Submission failed.' });
      }
    } catch (err: any) {
      setSubmitFeedback({ type: 'error', message: err.message || 'Network error submitting paper.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkNotificationsRead = async () => {
    await api.submissions.markNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const acceptedCount = submissions.filter((s) => s.status === 'accepted').length;
  const underReviewCount = submissions.filter((s) => s.status === 'under_review').length;
  const unreadNotifs = notifications.filter((n) => !n.is_read).length;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'submit', label: 'Submit Manuscript', icon: Upload },
    {
      id: 'articles',
      label: 'My Manuscripts',
      icon: FileText,
      badge: submissions.length,
      badgeColor: 'bg-emerald-600',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotifs > 0 ? unreadNotifs : null,
      badgeColor: 'bg-amber-500',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] bg-stone-100 flex flex-col animate-fade-in">
      {/* ── Top Header Bar (matches Admin Console) ── */}
      <header className="bg-[#0D3121] text-white shadow-md sticky top-16 sm:top-20 z-30">
        <div className="flex items-center justify-between px-4 sm:px-6 h-14">
          {/* Left: hamburger + branding */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer text-white"
              aria-label="Toggle sidebar"
              title="Toggle sidebar navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <UserCheck className="h-5 w-5 text-emerald-400" />
              <span className="font-sans font-bold text-base sm:text-lg tracking-tight text-white leading-tight">
                Researcher Dashboard
              </span>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              title="Sync / Refresh data"
              className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Home className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Public Site</span>
              </button>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium bg-red-700/80 hover:bg-red-700 text-white transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main body: sidebar + content (matches Admin Console layout) ── */}
      <div className="flex relative items-start flex-1 min-h-[calc(100vh-7.5rem)] sm:min-h-[calc(100vh-8.5rem)] bg-stone-100">
        {/* ── Sidebar ── */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
          } flex-shrink-0 transition-all duration-300 bg-[#14452F] sticky top-[7.5rem] sm:top-[8.5rem] h-[calc(100vh-7.5rem)] sm:h-[calc(100vh-8.5rem)] flex flex-col shadow-lg z-20`}
        >
          {/* Nav items */}
          <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400/70">
              Researcher Portal
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#14452F] shadow-sm font-semibold'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge != null && (
                    <span
                      className={`flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        isActive ? 'bg-[#14452F] text-white' : `${item.badgeColor || 'bg-stone-500'} text-white`
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-[#14452F]" />}
                </button>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="px-4 py-4 border-t border-white/10 space-y-1.5 text-white/70 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-medium text-white truncate">{user.full_name}</span>
            </div>
            <div className="text-[11px] text-white/50 truncate">{user.email}</div>
          </div>
        </aside>

        {/* ── Content area ── */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome card */}
              <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded bg-[#14452F]/10 px-2 py-0.5 text-xs font-semibold text-[#14452F]">
                      <UserCheck className="h-3.5 w-3.5" /> Researcher Console
                    </span>
                    <span className="text-xs text-stone-500">· Scholarly Manuscript Transmission System</span>
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                    Welcome, {user.full_name}
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-600">
                    Submit scholarly manuscripts, track editorial status, and receive notifications from the University Library Editorial Board.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('submit')}
                  className="flex items-center gap-1.5 rounded-md bg-[#14452F] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0D3121] shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Submit New Manuscript</span>
                </button>
              </div>

              {/* Status Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Transmitted</span>
                    <FileText className="h-4 w-4 text-[#14452F]" />
                  </div>
                  <div className="text-2xl font-bold font-serif text-stone-900">{submissions.length}</div>
                  <p className="text-[11px] text-stone-500">Manuscripts registered in system</p>
                </div>

                <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-xs font-semibold uppercase tracking-wider">Pending Review</span>
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold font-serif text-amber-600">{pendingCount}</div>
                  <p className="text-[11px] text-stone-500">Awaiting editorial assessment</p>
                </div>

                <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-xs font-semibold uppercase tracking-wider">Under Editorial Review</span>
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold font-serif text-blue-600">{underReviewCount}</div>
                  <p className="text-[11px] text-stone-500">With peer review committee</p>
                </div>

                <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-xs font-semibold uppercase tracking-wider">Accepted for Volume</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold font-serif text-emerald-700">{acceptedCount}</div>
                  <p className="text-[11px] text-stone-500">Approved for publication issue</p>
                </div>
              </div>

              {/* Recent Submissions */}
              <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <h3 className="font-serif text-lg font-bold text-stone-900">Recent Transmissions</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('articles')}
                    className="text-xs font-semibold text-[#14452F] hover:underline"
                  >
                    View All ({submissions.length})
                  </button>
                </div>

                {submissions.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-500">
                    You have not submitted any manuscripts yet. Click "Submit Manuscript" to begin.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submissions.slice(0, 3).map((sub) => (
                      <div
                        key={sub.id}
                        className="rounded-lg border border-stone-200/80 p-4 hover:border-stone-300 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold text-stone-900">{sub.title}</h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                            <span>Subject: {sub.subject_area}</span>
                            <span>•</span>
                            <span>Date: {new Date(sub.submitted_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider text-[11px] shrink-0 ${
                            sub.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sub.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : sub.status === 'under_review'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {sub.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SUBMIT MANUSCRIPT */}
          {activeTab === 'submit' && (
            <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm max-w-4xl space-y-6">
              <div className="border-b border-stone-200 pb-4">
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  Transmit Scholarly Manuscript
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  Upload your research for peer review and editorial assessment for official Niger Delta University publications.
                </p>
              </div>

              {submitFeedback && (
                <div
                  className={`p-4 rounded-lg flex items-center gap-3 text-xs font-semibold ${
                    submitFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {submitFeedback.type === 'success' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                  )}
                  <span>{submitFeedback.message}</span>
                </div>
              )}

              <form onSubmit={handleManuscriptSubmit} className="space-y-6 text-xs">
                {/* 1. Paper Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-stone-900 text-sm border-b border-stone-100 pb-2">
                    1. Manuscript Identification
                  </h3>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Manuscript Full Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Hydrocarbon Fingerprinting and Wetland Remediation in Bayelsa State"
                      className="w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 focus:border-[#14452F] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">
                        Discipline / Subject Area *
                      </label>
                      <select
                        value={subjectArea}
                        onChange={(e) => setSubjectArea(e.target.value)}
                        className="w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 focus:border-[#14452F] focus:outline-none"
                      >
                        <option value="Environmental Science">Environmental Science</option>
                        <option value="Petroleum Engineering">Petroleum Engineering</option>
                        <option value="Library & Information Science">Library & Information Science</option>
                        <option value="Medical & Health Sciences">Medical & Health Sciences</option>
                        <option value="Law & Legal Studies">Law & Legal Studies</option>
                        <option value="Chemical Sciences">Chemical Sciences</option>
                        <option value="Management & Social Sciences">Management & Social Sciences</option>
                        <option value="Agricultural Engineering">Agricultural Engineering</option>
                        <option value="Other">Other Disciplines</option>
                      </select>
                    </div>

                    {subjectArea === 'Other' && (
                      <div>
                        <label className="block font-medium text-stone-700 mb-1">
                          Specify Discipline *
                        </label>
                        <input
                          type="text"
                          required
                          value={customArea}
                          onChange={(e) => setCustomArea(e.target.value)}
                          placeholder="e.g. Marine Biology & Coastal Ecology"
                          className="w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 focus:border-[#14452F] focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Abstract (150 – 300 words) *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={abstract}
                      onChange={(e) => setAbstract(e.target.value)}
                      placeholder="Provide a concise summary outlining problem statement, methodology, principal findings, and academic significance..."
                      className="w-full rounded-md border border-stone-300 p-3 text-stone-900 focus:border-[#14452F] focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* 2. Corresponding Author */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-stone-900 text-sm border-b border-stone-100 pb-2">
                    2. Principal Corresponding Author
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 focus:border-[#14452F] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Institutional Email *</label>
                      <input
                        type="email"
                        required
                        value={authorEmail}
                        onChange={(e) => setAuthorEmail(e.target.value)}
                        className="w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 focus:border-[#14452F] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Affiliated Institution *</label>
                      <input
                        type="text"
                        required
                        value={authorInstitute}
                        onChange={(e) => setAuthorInstitute(e.target.value)}
                        className="w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 focus:border-[#14452F] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Phone / WhatsApp Contact</label>
                      <input
                        type="text"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        placeholder="+234 (800) 000-0000"
                        className="w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 focus:border-[#14452F] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 focus:border-[#14452F] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Co-Authors */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <h3 className="font-semibold text-stone-900 text-sm">
                      3. Co-Authors (Optional)
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddCoAuthor}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#14452F] hover:underline"
                    >
                      <Plus className="h-3 w-3" /> Add Co-Author
                    </button>
                  </div>

                  {coAuthors.map((co, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-stone-200 bg-stone-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-700">Co-Author #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCoAuthor(idx)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={co.name}
                          onChange={(e) => handleCoAuthorChange(idx, 'name', e.target.value)}
                          className="rounded border border-stone-300 px-2.5 py-1.5 bg-white text-stone-900 focus:border-[#14452F] focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Institution / Department"
                          value={co.institute}
                          onChange={(e) => handleCoAuthorChange(idx, 'institute', e.target.value)}
                          className="rounded border border-stone-300 px-2.5 py-1.5 bg-white text-stone-900 focus:border-[#14452F] focus:outline-none"
                        />
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={co.email}
                          onChange={(e) => handleCoAuthorChange(idx, 'email', e.target.value)}
                          className="rounded border border-stone-300 px-2.5 py-1.5 bg-white text-stone-900 focus:border-[#14452F] focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 4. File Attachment */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-stone-900 text-sm border-b border-stone-100 pb-2">
                    4. Manuscript File Upload *
                  </h3>

                  <div className="rounded-lg border-2 border-dashed border-stone-300 p-6 text-center hover:border-[#14452F] transition-colors">
                    <input
                      type="file"
                      id="manuscript-file-input"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                      className="hidden"
                    />
                    <label
                      htmlFor="manuscript-file-input"
                      className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                    >
                      <Upload className="h-8 w-8 text-stone-400" />
                      <div className="font-semibold text-stone-700">
                        {file ? file.name : 'Click to select manuscript file or drag & drop'}
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Permitted formats: .pdf, .doc, .docx · Maximum file size: 25MB
                      </p>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-md bg-[#14452F] px-6 py-2.5 font-semibold text-white hover:bg-[#0D3121] shadow transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    <span>{submitting ? 'Transmitting...' : 'Submit Manuscript for Review'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: MY MANUSCRIPTS */}
          {activeTab === 'articles' && (
            <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm space-y-4 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-900">
                    Transmitted Manuscripts &amp; Articles
                  </h2>
                  <p className="text-xs text-stone-500">
                    Track status updates, editorial feedback, and publication dates for your research.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('submit')}
                  className="rounded-md bg-[#14452F] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0D3121] cursor-pointer"
                >
                  + Submit New
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Manuscript Title</th>
                      <th className="py-3 px-4">Subject Area</th>
                      <th className="py-3 px-4">Submission Date</th>
                      <th className="py-3 px-4">Peer Review Status</th>
                      <th className="py-3 px-4">Actions / Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {submissions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-stone-400">
                          No manuscripts found in your researcher account.
                        </td>
                      </tr>
                    ) : (
                      submissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="py-4 px-4 font-semibold text-stone-900 max-w-xs">
                            <div className="truncate">{sub.title}</div>
                            {sub.co_authors && sub.co_authors.length > 0 && (
                              <div className="text-[11px] text-stone-500">
                                +{sub.co_authors.length} co-author(s)
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 text-stone-600">{sub.subject_area}</td>
                          <td className="py-4 px-4 text-stone-500 whitespace-nowrap">
                            {new Date(sub.submitted_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider text-[11px] ${
                                sub.status === 'accepted'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : sub.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : sub.status === 'under_review'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {sub.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-4 px-4 space-y-1">
                            {sub.file_path && (
                              <a
                                href={`/uploads/manuscripts/${sub.file_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B3B69] hover:underline"
                              >
                                <Download className="h-3 w-3" /> Download File
                              </a>
                            )}
                            {sub.admin_feedback && (
                              <div className="p-2 rounded bg-stone-100 text-[11px] text-stone-700 border border-stone-200">
                                <span className="font-semibold text-stone-900">Editorial Feedback:</span>{' '}
                                {sub.admin_feedback}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm max-w-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-900">
                    Editorial Notifications
                  </h2>
                  <p className="text-xs text-stone-500">
                    Direct updates on review milestones, publication assignments, and calls for papers.
                  </p>
                </div>
                {unreadNotifs > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkNotificationsRead}
                    className="text-xs font-semibold text-[#14452F] hover:underline cursor-pointer"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-400">
                    No notifications yet. You will receive updates here as your manuscripts progress through peer review.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 rounded-lg border transition-colors flex items-start gap-3 ${
                        n.is_read
                          ? 'bg-stone-50/70 border-stone-200 text-stone-700'
                          : 'bg-emerald-50/40 border-emerald-200 text-stone-900 font-medium'
                      }`}
                    >
                      <Bell
                        className={`h-4 w-4 mt-0.5 shrink-0 ${
                          n.is_read ? 'text-stone-400' : 'text-emerald-700'
                        }`}
                      />
                      <div className="space-y-1 flex-1">
                        <p className="text-xs leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-stone-400">
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
