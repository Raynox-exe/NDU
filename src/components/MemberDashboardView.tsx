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
} from 'lucide-react';
import { api, type Submission, type Notification, type User } from '../services/api';

interface MemberDashboardViewProps {
  user: User;
  onLogout: () => void;
  onNavigateHome: () => void;
}

export function MemberDashboardView({ user, onLogout }: MemberDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'submit' | 'articles' | 'notifications'>('overview');
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

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-8 space-y-8 animate-fade-in">
      {/* Top Header Banner */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded bg-[#14452F]/10 px-2 py-0.5 text-xs font-semibold text-[#14452F]">
              <UserCheck className="h-3.5 w-3.5" /> Researcher Portal
            </span>
            <span className="text-xs text-stone-500">· NDU Scholarly Transmission System</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Welcome, {user.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Submit scholarly manuscripts, track editorial status, and receive notifications from the University Library Editorial Board.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('submit')}
            className="flex items-center gap-1.5 rounded-md bg-[#14452F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D3121] shadow-sm transition-all cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Submit Manuscript</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-md border border-stone-300 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#14452F] text-white'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('submit')}
          className={`flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'submit'
              ? 'bg-[#14452F] text-white'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <Upload className="h-4 w-4" />
          <span>Submit Manuscript</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('articles')}
          className={`flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'articles'
              ? 'bg-[#14452F] text-white'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <FileCheck className="h-4 w-4" />
          <span>My Manuscripts ({submissions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`relative flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-[#14452F] text-white'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Notifications</span>
          {unreadNotifs > 0 && (
            <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
              {unreadNotifs}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-1 border-l-4 border-l-[#14452F]">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Total Submissions
              </span>
              <div className="text-3xl font-bold text-stone-900">{submissions.length}</div>
              <p className="text-[11px] text-stone-500">Transmitted research articles</p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-1 border-l-4 border-l-amber-500">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Pending Editorial Review
              </span>
              <div className="text-3xl font-bold text-amber-600">{pendingCount}</div>
              <p className="text-[11px] text-stone-500">Awaiting reviewer assignment</p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-1 border-l-4 border-l-blue-600">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Under Peer Review
              </span>
              <div className="text-3xl font-bold text-blue-600">{underReviewCount}</div>
              <p className="text-[11px] text-stone-500">Active evaluation in progress</p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-1 border-l-4 border-l-emerald-600">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Accepted &amp; Published
              </span>
              <div className="text-3xl font-bold text-emerald-600">{acceptedCount}</div>
              <p className="text-[11px] text-stone-500">Approved for Journal Volumes</p>
            </div>
          </div>

          {/* Quick submission trigger callout */}
          <div className="rounded-xl border border-[#14452F]/20 bg-gradient-to-r from-[#14452F]/5 to-transparent p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-[#14452F]">
                Ready to submit an academic research paper?
              </h3>
              <p className="text-xs text-stone-600 max-w-2xl">
                Submit your manuscript in Word (.doc, .docx) or PDF format. The Niger Delta University Library review committee will examine the study and transmit official notifications to your dashboard.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('submit')}
              className="rounded-md bg-[#14452F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D3121] shadow transition-all cursor-pointer whitespace-nowrap"
            >
              Start New Submission →
            </button>
          </div>

          {/* Recent Submissions Snippet */}
          <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
              <h3 className="font-serif text-base font-semibold text-stone-900">
                Recent Submissions
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('articles')}
                className="text-xs font-semibold text-[#0B3B69] hover:underline cursor-pointer"
              >
                View all ({submissions.length})
              </button>
            </div>

            <div className="divide-y divide-stone-100">
              {loading ? (
                <div className="p-8 text-center text-xs text-stone-500">Loading submissions...</div>
              ) : submissions.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-500">
                  No manuscripts submitted yet. Click &quot;Submit Manuscript&quot; to begin.
                </div>
              ) : (
                submissions.slice(0, 3).map((sub) => (
                  <div key={sub.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-stone-800">{sub.title}</span>
                      </div>
                      <p className="text-xs text-stone-500 line-clamp-1">{sub.abstract}</p>
                      <div className="flex items-center gap-3 text-[11px] text-stone-400">
                        <span>Area: {sub.subject_area}</span>
                        <span>·</span>
                        <span>{new Date(sub.submitted_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          sub.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : sub.status === 'under_review'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {sub.status === 'accepted' && <CheckCircle2 className="h-3 w-3" />}
                        {sub.status === 'pending' && <Clock className="h-3 w-3" />}
                        {sub.status === 'rejected' && <AlertCircle className="h-3 w-3" />}
                        {sub.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUBMIT MANUSCRIPT */}
      {activeTab === 'submit' && (
        <div className="rounded-xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="border-b border-stone-200 pb-4 space-y-1">
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Submit Research Manuscript
            </h2>
            <p className="text-xs text-stone-500">
              Provide comprehensive bibliographic details and manuscript documentation for editorial board evaluation.
            </p>
          </div>

          {submitFeedback && (
            <div
              className={`p-4 rounded-lg text-xs font-medium border flex items-start gap-2.5 ${
                submitFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {submitFeedback.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              )}
              <span>{submitFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handleManuscriptSubmit} className="space-y-6">
            {/* Section 1: Article Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#14452F] flex items-center gap-1.5 border-b border-stone-100 pb-2">
                <FileText className="h-4 w-4" /> 1. Article Information
              </h3>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Assessment of Digital Library Utilization Patterns among Faculty Members"
                  className="w-full rounded-md border border-stone-300 px-3.5 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#14452F] focus:ring-1 focus:ring-[#14452F] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Subject Area / Faculty Discipline *
                  </label>
                  <select
                    value={subjectArea}
                    onChange={(e) => setSubjectArea(e.target.value)}
                    className="w-full rounded-md border border-stone-300 px-3.5 py-2 text-sm text-stone-900 bg-white focus:border-[#14452F] focus:ring-1 focus:ring-[#14452F] outline-none"
                  >
                    <option value="Environmental Science">Environmental Science &amp; Ecology</option>
                    <option value="Agriculture">Agriculture, Fisheries &amp; Forestry</option>
                    <option value="Medical Sciences">Medical, Nursing &amp; Health Sciences</option>
                    <option value="Law">Law &amp; Legal Studies</option>
                    <option value="Education">Education &amp; Library Science</option>
                    <option value="Engineering">Engineering &amp; Technology</option>
                    <option value="Social Sciences">Social Sciences &amp; Economics</option>
                    <option value="Arts & Humanities">Arts, History &amp; Humanities</option>
                    <option value="Peace & Conflict Resolution">Peace &amp; Conflict Resolution</option>
                    <option value="Other">Other (Specify Custom Area)</option>
                  </select>
                </div>

                {subjectArea === 'Other' && (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Specify Custom Subject Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={customArea}
                      onChange={(e) => setCustomArea(e.target.value)}
                      placeholder="e.g. Marine Biotechnology"
                      className="w-full rounded-md border border-stone-300 px-3.5 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#14452F] focus:ring-1 focus:ring-[#14452F] outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Abstract * (Maximum 500 words)
                </label>
                <textarea
                  required
                  rows={5}
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder="Provide a concise summary detailing research objectives, methodology, core findings, and recommendations..."
                  className="w-full rounded-md border border-stone-300 px-3.5 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#14452F] focus:ring-1 focus:ring-[#14452F] outline-none"
                />
              </div>
            </div>

            {/* Section 2: Author Details */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#14452F] flex items-center gap-1.5 border-b border-stone-100 pb-2">
                <UserCheck className="h-4 w-4" /> 2. Primary Author &amp; Co-Authors
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Primary Author Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Full name with academic title"
                    className="w-full rounded-md border border-stone-300 px-3.5 py-2 text-sm text-stone-900 focus:border-[#14452F] focus:ring-1 focus:ring-[#14452F] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Author Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    placeholder="institutional@ndu.edu.ng"
                    className="w-full rounded-md border border-stone-300 px-3.5 py-2 text-sm text-stone-900 focus:border-[#14452F] focus:ring-1 focus:ring-[#14452F] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Institutional Affiliation &amp; Department *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={authorInstitute}
                    onChange={(e) => setAuthorInstitute(e.target.value)}
                    placeholder="e.g. Faculty of Agricultural Technology, Niger Delta University"
                    className="w-full rounded-md border border-stone-300 pl-9 pr-3 py-2 text-sm text-stone-900 focus:border-[#14452F] focus:ring-1 focus:ring-[#14452F] outline-none"
                  />
                </div>
              </div>

              {/* Co-Authors dynamic list */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700">
                    Contributing Co-Authors ({coAuthors.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddCoAuthor}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#14452F] hover:underline cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Co-Author</span>
                  </button>
                </div>

                {coAuthors.map((coa, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-stone-200 bg-stone-50/70 p-3.5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-600">Co-Author #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCoAuthor(idx)}
                        className="text-stone-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Co-Author Name"
                        value={coa.name}
                        onChange={(e) => handleCoAuthorChange(idx, 'name', e.target.value)}
                        className="rounded border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 outline-none focus:border-[#14452F]"
                      />
                      <input
                        type="text"
                        placeholder="Institution / Dept"
                        value={coa.institute}
                        onChange={(e) => handleCoAuthorChange(idx, 'institute', e.target.value)}
                        className="rounded border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 outline-none focus:border-[#14452F]"
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={coa.email}
                        onChange={(e) => handleCoAuthorChange(idx, 'email', e.target.value)}
                        className="rounded border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 outline-none focus:border-[#14452F]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Manuscript Upload & Contact */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#14452F] flex items-center gap-1.5 border-b border-stone-100 pb-2">
                <Upload className="h-4 w-4" /> 3. File Upload &amp; Contact
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+234 (803) 000-0000"
                    className="w-full rounded-md border border-stone-300 px-3.5 py-2 text-sm text-stone-900 focus:border-[#14452F] focus:ring-1 focus:ring-[#14452F] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-md border border-stone-300 px-3.5 py-2 text-sm text-stone-900 focus:border-[#14452F] focus:ring-1 focus:ring-[#14452F] outline-none"
                  />
                </div>
              </div>

              {/* Upload Box */}
              <div className="rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 p-6 text-center space-y-2 hover:border-[#14452F] transition-colors">
                <Upload className="mx-auto h-8 w-8 text-stone-400" />
                <div className="text-sm font-semibold text-stone-700">
                  Select Manuscript File (.doc, .docx, .pdf)
                </div>
                <p className="text-xs text-stone-500">
                  Files up to 25MB supported. Ensure blind review version removes identifiable metadata if required.
                </p>
                <div className="pt-2">
                  <input
                    type="file"
                    required
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="text-xs text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#14452F] file:text-white hover:file:bg-[#0D3121] file:cursor-pointer"
                  />
                </div>
                {file && (
                  <div className="mt-2 text-xs font-semibold text-emerald-700">
                    ✓ Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#14452F] py-3 text-sm font-semibold text-white shadow-md hover:bg-[#0D3121] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <span>Transmitting Manuscript to Editorial System...</span>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Finalize &amp; Transmit Manuscript</span>
                </>
              )}
            </button>
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
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm max-w-3xl mx-auto space-y-4">
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

          <div className="divide-y divide-stone-100 space-y-2">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400">
                No notifications at this time.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-lg flex items-start gap-3 transition-colors ${
                    notif.is_read ? 'bg-white' : 'bg-amber-50/60 border border-amber-200/50'
                  }`}
                >
                  <Bell
                    className={`h-4 w-4 shrink-0 mt-0.5 ${
                      notif.is_read ? 'text-stone-400' : 'text-amber-600'
                    }`}
                  />
                  <div className="space-y-0.5 flex-1 text-xs">
                    <p className={`text-stone-800 ${notif.is_read ? '' : 'font-semibold'}`}>
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-stone-400">
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
