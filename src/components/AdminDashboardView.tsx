import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileText,
  BookOpen,
  Link2,
  Newspaper,
  Users,
  CheckCircle2,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Download,
  Eye,
  EyeOff,
  FolderPlus,
  Rocket,
  RefreshCw,
  Search,
  ExternalLink,
  Menu,
  X,
  Home,
  LogOut,
  LayoutDashboard,
  ChevronRight,
  GraduationCap,
  Filter,
} from 'lucide-react';
import {
  api,
  type User,
  type Submission,
  type JournalIssue,
  type Article,
  type DynamicSection,
  type DynamicLink,
  type DynamicNews,
} from '../services/api';
import { FACULTY_CATALOGS, TOTAL_JOURNAL_COUNT } from '../data/journalsIndex';

interface AdminDashboardViewProps {
  user: User;
  onLogout: () => void;
  onNavigateHome: () => void;
}

export function AdminDashboardView({ user, onLogout, onNavigateHome }: AdminDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'submissions' | 'journals' | 'articles' | 'links' | 'news' | 'overrides' | 'users'
  >('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [journals, setJournals] = useState<JournalIssue[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [sections, setSections] = useState<DynamicSection[]>([]);
  const [links, setLinks] = useState<DynamicLink[]>([]);
  const [news, setNews] = useState<DynamicNews[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [overrides, setOverrides] = useState<Record<string, { is_active?: boolean }>>({});

  // Modals & form states
  const [reviewModalSub, setReviewModalSub] = useState<Submission | null>(null);
  const [reviewAction, setReviewAction] = useState<'accept' | 'reject'>('accept');
  const [reviewFeedback, setReviewFeedback] = useState('');

  // Journal creation
  const [showCreateJournalModal, setShowCreateJournalModal] = useState(false);
  const [journalVol, setJournalVol] = useState(14);
  const [journalIssueNo, setJournalIssueNo] = useState(1);
  const [journalYear, setJournalYear] = useState(2026);
  const [journalTitle, setJournalTitle] = useState('');

  // Assign article
  const [assignModalSub, setAssignModalSub] = useState<Submission | null>(null);
  const [targetJournalId, setTargetJournalId] = useState('');
  const [assignPages, setAssignPages] = useState('1 - 15');
  const [assignDownloads, setAssignDownloads] = useState(true);

  // Section modal
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState<DynamicSection | null>(null);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionType, setSectionType] = useState<'dropdown' | 'section' | 'tab'>('dropdown');
  const [sectionTarget, setSectionTarget] = useState<'header_dropdown' | 'digital_library' | 'homepage'>('header_dropdown');
  const [sectionDesc, setSectionDesc] = useState('');

  // Link modal
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState<DynamicLink | null>(null);
  const [linkSectionId, setLinkSectionId] = useState('sec-services');
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDesc, setLinkDesc] = useState('');
  const [linkCategory, setLinkCategory] = useState('Core Services');
  const [linkBadge, setLinkBadge] = useState('');
  const [linkFile, setLinkFile] = useState<File | null>(null);
  const [linkActionType, setLinkActionType] = useState<'external' | 'detail' | 'digital-library' | 'journals'>('external');

  // News modal
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNews, setEditingNews] = useState<DynamicNews | null>(null);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState('Library Announcements');
  const [newsDate, setNewsDate] = useState('November 2026');
  const [newsVenue, setNewsVenue] = useState('Niger Delta University');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsFile, setNewsFile] = useState<File | null>(null);

  // Search filter for links
  const [linkFilterSection, setLinkFilterSection] = useState<string>('all');
  const [linkSearchQuery, setLinkSearchQuery] = useState('');

  // E-Journal Catalog filter
  const [catalogFacultyFilter, setCatalogFacultyFilter] = useState('all');
  const [catalogSearch, setCatalogSearch] = useState('');

  // Article edit modal
  const [showArticleEditModal, setShowArticleEditModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articleEditTitle, setArticleEditTitle] = useState('');
  const [articleEditAuthors, setArticleEditAuthors] = useState('');
  const [articleEditPageRange, setArticleEditPageRange] = useState('');

  // Journal edit modal
  const [showJournalEditModal, setShowJournalEditModal] = useState(false);
  const [editingJournalItem, setEditingJournalItem] = useState<JournalIssue | null>(null);
  const [journalEditName, setJournalEditName] = useState('');
  const [journalEditYear, setJournalEditYear] = useState(2026);
  const [journalEditVol, setJournalEditVol] = useState(14);
  const [journalEditIssue, setJournalEditIssue] = useState(1);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        statsData,
        subsData,
        journalsData,
        articlesData,
        sectionsData,
        linksData,
        newsData,
        usersData,
        overridesData,
      ] = await Promise.all([
        api.admin.getStats(),
        api.admin.getSubmissions(),
        api.admin.getJournals(),
        api.admin.getArticles(),
        api.admin.getSections(),
        api.admin.getLinks(),
        api.admin.getNews(),
        api.admin.getUsers(),
        api.public.getJournalOverrides(),
      ]);

      if (statsData.success) setStats(statsData.stats);
      if (subsData.success) setSubmissions(subsData.submissions);
      if (journalsData.success) setJournals(journalsData.journals);
      if (articlesData.success) setArticles(articlesData.articles);
      if (sectionsData.success) setSections(sectionsData.sections);
      if (linksData.success) setLinks(linksData.links);
      if (newsData.success) setNews(newsData.news);
      if (usersData.success) setUsers(usersData.users);
      if (overridesData.success) setOverrides(overridesData.overrides);
    } catch (err) {
      console.error('Error loading admin portal data:', err);
      showToast('Failed to load some admin datasets.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalSub) return;

    try {
      const res = await api.admin.reviewSubmission(reviewModalSub.id, reviewAction, reviewFeedback);
      if (res.success) {
        showToast(`Submission marked as ${reviewAction === 'accept' ? 'ACCEPTED' : 'REJECTED'}.`);
        setReviewModalSub(null);
        setReviewFeedback('');
        loadAllData();
      } else {
        showToast(res.message || 'Error processing review', 'error');
      }
    } catch (err: any) {
      showToast('Error reviewing submission', 'error');
    }
  };

  const handleCreateJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.admin.createJournal({
        volume_no: Number(journalVol),
        issue_no: Number(journalIssueNo),
        publication_year: Number(journalYear),
        name: journalTitle,
      });
      if (res.success) {
        showToast('New Journal Issue created as Draft.');
        setShowCreateJournalModal(false);
        setJournalTitle('');
        loadAllData();
      }
    } catch (err) {
      showToast('Failed to create journal issue', 'error');
    }
  };

  const handleDeployJournal = async (id: string) => {
    if (!window.confirm('Deploy this journal volume live to the public website?')) return;
    try {
      const res = await api.admin.deployJournal(id);
      if (res.success) {
        showToast('Journal Issue deployed live successfully!');
        loadAllData();
      }
    } catch (err) {
      showToast('Deploy failed', 'error');
    }
  };

  const handleAssignArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalSub || !targetJournalId) return;

    try {
      const res = await api.admin.assignArticle({
        journal_id: targetJournalId,
        sub_id: assignModalSub.id,
        pages: assignPages,
        download_enabled: assignDownloads,
      });
      if (res.success) {
        showToast('Manuscript successfully assigned and published into journal issue!');
        setAssignModalSub(null);
        loadAllData();
      }
    } catch (err) {
      showToast('Failed to publish article into issue', 'error');
    }
  };

  const handleToggleArticleVisibility = async (art: Article) => {
    try {
      const newVisible = !art.is_visible;
      const res = await api.admin.updateArticle(art.id, { is_visible: newVisible });
      if (res.success) {
        showToast(`Article visibility set to: ${newVisible ? 'Visible on website' : 'Hidden from website'}`);
        loadAllData();
      }
    } catch (err) {
      showToast('Failed to update article visibility', 'error');
    }
  };

  const handleToggleArticleDownloads = async (art: Article) => {
    try {
      const newDownload = !art.download_enabled;
      const res = await api.admin.updateArticle(art.id, { download_enabled: newDownload });
      if (res.success) {
        showToast(`Article downloads set to: ${newDownload ? 'Enabled' : 'Disabled'}`);
        loadAllData();
      }
    } catch (err) {
      showToast('Failed to update download toggle', 'error');
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm('Permanently remove this article?')) return;
    try {
      const res = await api.admin.deleteArticle(id);
      if (res.success) {
        showToast('Article removed from catalog.');
        loadAllData();
      }
    } catch (err) {
      showToast('Error removing article', 'error');
    }
  };

  // Section Handlers
  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSection) {
        const res = await api.admin.updateSection(editingSection.id, {
          title: sectionTitle,
          type: sectionType,
          target_nav: sectionTarget,
          description: sectionDesc,
        });
        if (res.success) showToast('Section updated successfully.');
      } else {
        const res = await api.admin.createSection({
          title: sectionTitle,
          type: sectionType,
          target_nav: sectionTarget,
          description: sectionDesc,
        });
        if (res.success) showToast('New Section/Dropdown created.');
      }
      setShowSectionModal(false);
      setEditingSection(null);
      setSectionTitle('');
      setSectionDesc('');
      loadAllData();
    } catch (err) {
      showToast('Error saving section', 'error');
    }
  };

  const handleToggleSectionActive = async (sec: DynamicSection) => {
    try {
      const newActive = !sec.is_active;
      const res = await api.admin.updateSection(sec.id, { is_active: newActive });
      if (res.success) {
        showToast(`Section ${newActive ? 'Enabled' : 'Disabled & Hidden from website'}`);
        loadAllData();
      }
    } catch (err) {
      showToast('Failed to update section', 'error');
    }
  };

  // Link Handlers (The core requirement: disable and update for every link!)
  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalUrl = linkUrl;
      let finalFilePath = editingLink?.file_path || '';

      // If user uploaded a new resource file, upload it first
      if (linkFile) {
        const uploadRes = await api.admin.uploadResourceFile(linkFile);
        if (uploadRes.success) {
          finalFilePath = uploadRes.file_path;
          finalUrl = uploadRes.url;
        }
      }

      if (editingLink) {
        const res = await api.admin.updateLink(editingLink.id, {
          section_id: linkSectionId,
          name: linkName,
          url: finalUrl,
          file_path: finalFilePath,
          description: linkDesc,
          category: linkCategory,
          badge: linkBadge,
          action_type: linkActionType,
        });
        if (res.success) showToast('Link updated successfully.');
      } else {
        const res = await api.admin.createLink({
          section_id: linkSectionId,
          name: linkName,
          url: finalUrl,
          file_path: finalFilePath,
          description: linkDesc,
          category: linkCategory,
          badge: linkBadge,
          action_type: linkActionType,
        });
        if (res.success) showToast('New Link & Resource created.');
      }

      setShowLinkModal(false);
      setEditingLink(null);
      setLinkFile(null);
      setLinkName('');
      setLinkUrl('');
      setLinkDesc('');
      setLinkBadge('');
      loadAllData();
    } catch (err) {
      showToast('Error saving link', 'error');
    }
  };

  const handleToggleLinkActive = async (lnk: DynamicLink) => {
    try {
      const newActive = !lnk.is_active;
      const res = await api.admin.updateLink(lnk.id, { is_active: newActive });
      if (res.success) {
        showToast(`Link "${lnk.name}" is now ${newActive ? 'ACTIVE (Visible)' : 'DISABLED (Hidden from Website)'}`);
        loadAllData();
      }
    } catch (err) {
      showToast('Failed to toggle link', 'error');
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!window.confirm('Delete this link permanently?')) return;
    try {
      const res = await api.admin.deleteLink(id);
      if (res.success) {
        showToast('Link deleted.');
        loadAllData();
      }
    } catch (err) {
      showToast('Error deleting link', 'error');
    }
  };

  // News Handlers
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let filePath = editingNews?.file_path || '';
      if (newsFile) {
        const uploadRes = await api.admin.uploadResourceFile(newsFile);
        if (uploadRes.success && uploadRes.file_path) {
          filePath = uploadRes.file_path;
        }
      }

      if (editingNews) {
        const res = await api.admin.updateNews(editingNews.id, {
          title: newsTitle,
          category: newsCategory,
          date: newsDate,
          venue: newsVenue,
          summary: newsSummary,
          content: newsContent,
          file_path: filePath,
        });
        if (res.success) showToast('News item updated.');
      } else {
        const res = await api.admin.createNews({
          title: newsTitle,
          category: newsCategory,
          date: newsDate,
          venue: newsVenue,
          summary: newsSummary,
          content: newsContent,
          file_path: filePath,
        });
        if (res.success) showToast('New News announcement published.');
      }
      setShowNewsModal(false);
      setEditingNews(null);
      setNewsTitle('');
      setNewsSummary('');
      setNewsContent('');
      setNewsFile(null);
      loadAllData();
    } catch (err) {
      showToast('Error saving news item', 'error');
    }
  };

  const handleToggleNewsActive = async (item: DynamicNews) => {
    try {
      const newActive = !item.is_active;
      const res = await api.admin.updateNews(item.id, { is_active: newActive });
      if (res.success) {
        showToast(`News item set to: ${newActive ? 'Live on website' : 'Disabled/Hidden'}`);
        loadAllData();
      }
    } catch (err) {
      showToast('Error updating news status', 'error');
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!window.confirm('Delete this news announcement?')) return;
    try {
      const res = await api.admin.deleteNews(id);
      if (res.success) {
        showToast('News item removed.');
        loadAllData();
      }
    } catch (err) {
      showToast('Error removing news', 'error');
    }
  };

  // E-Journal Catalog toggle
  const handleToggleJournalOverride = async (journalId: string, currentlyActive: boolean) => {
    const newActive = !currentlyActive;
    try {
      await api.admin.toggleJournalOverride(journalId, newActive);
      setOverrides((prev) => ({ ...prev, [journalId]: { is_active: newActive } }));
      showToast(`Journal ${newActive ? 'enabled' : 'hidden'} on Digital Library.`);
    } catch {
      showToast('Failed to update journal visibility.', 'error');
    }
  };

  // Article edit handlers
  const handleOpenArticleEdit = (a: Article) => {
    setEditingArticle(a);
    setArticleEditTitle(a.title);
    setArticleEditAuthors(Array.isArray(a.authors) ? (a.authors as string[]).join(', ') : String(a.authors ?? ''));
    setArticleEditPageRange(a.page_range ?? '');
    setShowArticleEditModal(true);
  };
  const handleSaveArticleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    try {
      const res = await api.admin.updateArticle(editingArticle.id, {
        title: articleEditTitle,
        authors: articleEditAuthors,
        page_range: articleEditPageRange,
      });
      if (res.success) {
        showToast('Article updated.');
        setShowArticleEditModal(false);
        loadAllData();
      } else showToast(res.error || 'Failed to update article', 'error');
    } catch {
      showToast('Error updating article', 'error');
    }
  };

  // Journal issue edit handlers
  const handleOpenJournalEdit = (j: JournalIssue) => {
    setEditingJournalItem(j);
    setJournalEditName(j.name);
    setJournalEditYear(j.publication_year ?? 2026);
    setJournalEditVol(j.volume_no ?? 14);
    setJournalEditIssue(j.issue_no ?? 1);
    setShowJournalEditModal(true);
  };
  const handleSaveJournalEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJournalItem) return;
    try {
      const res = await api.admin.updateJournal(editingJournalItem.id, {
        name: journalEditName,
        publication_year: journalEditYear,
        volume_no: journalEditVol,
        issue_no: journalEditIssue,
      });
      if (res.success) {
        showToast('Journal issue updated.');
        setShowJournalEditModal(false);
        loadAllData();
      } else showToast(res.error || 'Failed to update journal', 'error');
    } catch {
      showToast('Error updating journal', 'error');
    }
  };

  // Filtered links
  const filteredLinks = links.filter((l) => {
    const matchesSection = linkFilterSection === 'all' || l.section_id === linkFilterSection;
    const matchesSearch =
      !linkSearchQuery ||
      l.name.toLowerCase().includes(linkSearchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(linkSearchQuery.toLowerCase());
    return matchesSection && matchesSearch;
  });

  const readyToPublishSubmissions = submissions.filter(
    (s) => s.status === 'accepted' && !articles.some((a) => a.submission_id === s.id)
  );

  // Nav items config
  const navItems = [
    { id: 'overview', label: 'Overview & Stats', icon: LayoutDashboard, badge: null },
    {
      id: 'submissions',
      label: 'Manuscript Queue',
      icon: FileText,
      badge: submissions.filter((s) => s.status === 'pending').length || null,
      badgeColor: 'bg-amber-500',
    },
    { id: 'journals', label: 'Journal Issues', icon: BookOpen, badge: journals.length || null, badgeColor: 'bg-[#0B3B69]' },
    { id: 'articles', label: 'Published Articles', icon: Rocket, badge: articles.length || null, badgeColor: 'bg-emerald-600' },
    { id: 'links', label: 'Links & Resources', icon: Link2, badge: links.length || null, badgeColor: 'bg-stone-500' },
    { id: 'news', label: 'News & Bulletins', icon: Newspaper, badge: news.length || null, badgeColor: 'bg-purple-600' },
    { id: 'overrides', label: 'E-Journal Catalog', icon: GraduationCap, badge: TOTAL_JOURNAL_COUNT, badgeColor: 'bg-indigo-600' },
    { id: 'users', label: 'Users & Roles', icon: Users, badge: users.length || null, badgeColor: 'bg-stone-500' },
  ] as const;

  const activeNavItem = navItems.find((n) => n.id === activeTab);

  return (
    <div className="min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] bg-stone-100 flex flex-col animate-fade-in">
      {/* Toast popup */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-white text-xs font-semibold animate-slide-in ${
            toast.type === 'success' ? 'bg-[#14452F]' : 'bg-red-600'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── Top Header Bar ── */}
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
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span className="font-sans font-bold text-base sm:text-lg tracking-tight text-white leading-tight">
                Admin Dashboard
              </span>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadAllData}
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

      {/* ── Main body: sidebar + content ── */}
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
              Management
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
                      ? 'bg-white text-[#14452F] shadow-sm'
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
                        isActive ? 'bg-[#14452F] text-white' : `${('badgeColor' in item ? item.badgeColor : 'bg-stone-500')} text-white`
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

        </aside>


        {/* ── Content Panel ── */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Breadcrumb / page title */}
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Admin Console</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-stone-800">{activeNavItem?.label ?? activeTab}</span>
          </div>

      {/* ==================================================== */}
      {/* TAB 1: OVERVIEW & STATS */}
      {/* ==================================================== */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-1 border-l-4 border-l-[#14452F]">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Total Researchers
              </span>
              <div className="text-3xl font-bold text-stone-900">{stats.totalResearchers}</div>
              <p className="text-[11px] text-stone-500">Registered academic authors</p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-1 border-l-4 border-l-amber-500">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Pending Submissions
              </span>
              <div className="text-3xl font-bold text-amber-600">{stats.pendingReviews}</div>
              <p className="text-[11px] text-stone-500">Requires editorial review action</p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-1 border-l-4 border-l-blue-600">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Published Research Papers
              </span>
              <div className="text-3xl font-bold text-blue-600">{stats.publishedArticles}</div>
              <p className="text-[11px] text-stone-500">Live in university digital digest</p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-1 border-l-4 border-l-emerald-600">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Controlled Links &amp; Sources
              </span>
              <div className="text-3xl font-bold text-emerald-600">
                {stats.activeLinks} <span className="text-xs text-stone-400 font-normal">/ {stats.totalLinks} active</span>
              </div>
              <p className="text-[11px] text-stone-500">Services, Databases &amp; Publications</p>
            </div>
          </div>

          {/* Quick Action Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-base">
                <FileText className="h-5 w-5 text-[#14452F]" />
                <span>Review Pending Papers</span>
              </div>
              <p className="text-xs text-stone-600">
                {stats.pendingReviews} submission(s) currently awaiting administrative acceptance or rejection.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('submissions')}
                className="w-full rounded-md bg-[#14452F] py-2 text-xs font-semibold text-white hover:bg-[#0D3121] cursor-pointer"
              >
                Go to Peer Review Queue →
              </button>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-base">
                <Link2 className="h-5 w-5 text-[#0B3B69]" />
                <span>Manage Links &amp; Dropdowns</span>
              </div>
              <p className="text-xs text-stone-600">
                Add new links, update existing URLs/sources, toggle active/disabled states, or create dropdowns.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('links')}
                className="w-full rounded-md bg-[#0B3B69] py-2 text-xs font-semibold text-white hover:bg-[#082847] cursor-pointer"
              >
                Open Links Control Module →
              </button>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-base">
                <BookOpen className="h-5 w-5 text-amber-600" />
                <span>Deploy Journal Volumes</span>
              </div>
              <p className="text-xs text-stone-600">
                Create new volumes, assign accepted papers, and deploy live to the public e-journal repository.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('journals')}
                className="w-full rounded-md bg-stone-800 py-2 text-xs font-semibold text-white hover:bg-stone-900 cursor-pointer"
              >
                Manage Journal Issues →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: SUBMISSIONS & PEER REVIEW QUEUE */}
      {/* ==================================================== */}
      {activeTab === 'submissions' && (
        <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm space-y-4 p-6">
          <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900">
                Scholarly Transmission Queue
              </h2>
              <p className="text-xs text-stone-500">
                Review transmitted manuscripts, evaluate abstracts and full documents, and approve or reject submissions.
              </p>
            </div>
            <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
              {submissions.length} Total Transmissions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Researcher &amp; Affiliation</th>
                  <th className="py-3 px-4">Manuscript Title</th>
                  <th className="py-3 px-4">Subject Area</th>
                  <th className="py-3 px-4">Date Submitted</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400">
                      No manuscripts in queue.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-4 px-4 font-semibold text-stone-900">
                      <div>{sub.author_name}</div>
                      <div className="text-[11px] text-stone-500 font-normal">{sub.author_institute}</div>
                      <div className="text-[11px] text-stone-400">{sub.author_email}</div>
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <div className="font-semibold text-stone-800 line-clamp-2">{sub.title}</div>
                      {sub.file_path && (
                        <a
                          href={`/uploads/manuscripts/${sub.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B3B69] hover:underline mt-1"
                        >
                          <Download className="h-3 w-3" /> View Submitted Manuscript
                        </a>
                      )}
                    </td>
                    <td className="py-4 px-4 text-stone-600">{sub.subject_area}</td>
                    <td className="py-4 px-4 text-stone-500 whitespace-nowrap">
                      {new Date(sub.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
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
                    <td className="py-4 px-4 whitespace-nowrap space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReviewModalSub(sub);
                          setReviewAction('accept');
                          setReviewFeedback('');
                        }}
                        className="rounded bg-[#14452F] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0D3121] cursor-pointer"
                      >
                        Review Paper
                      </button>

                      {sub.status === 'accepted' && (
                        <button
                          type="button"
                          onClick={() => {
                            setAssignModalSub(sub);
                            setTargetJournalId(journals[0]?.id || '');
                          }}
                          className="rounded bg-[#0B3B69] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#082847] cursor-pointer"
                        >
                          Publish to Issue
                        </button>
                      )}
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: JOURNAL VOLUMES & ISSUES */}
      {/* ==================================================== */}
      {activeTab === 'journals' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Journal Issues &amp; Volumes
                </h2>
                <p className="text-xs text-stone-500">
                  Create journal volumes, assign accepted papers, and deploy live issues.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateJournalModal(true)}
                className="flex items-center gap-1.5 rounded-md bg-[#14452F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D3121] cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Journal Issue</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Issue Name &amp; Volume</th>
                    <th className="py-3 px-4">Publication Year</th>
                    <th className="py-3 px-4">Articles Count</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Deployment Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {journals.map((j) => {
                    const issueArticles = articles.filter((a) => a.journal_id === j.id);
                    return (
                      <tr key={j.id} className="hover:bg-stone-50/60">
                        <td className="py-4 px-4 font-semibold text-stone-900">
                          {j.name || `Vol ${j.volume_no}, Issue ${j.issue_no}`}
                        </td>
                        <td className="py-4 px-4 text-stone-600">{j.publication_year}</td>
                        <td className="py-4 px-4 text-stone-600">{issueArticles.length} papers</td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                              j.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {j.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 space-x-2">
                          {j.status === 'draft' ? (
                            <button
                              type="button"
                              onClick={() => handleDeployJournal(j.id)}
                              className="inline-flex items-center gap-1 rounded bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 cursor-pointer"
                            >
                              <Rocket className="h-3 w-3" />
                              <span>Deploy Live</span>
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-emerald-700">✓ Live on Website</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenJournalEdit(j)}
                            className="rounded bg-[#0B3B69] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#082847] cursor-pointer"
                            title="Edit Journal Issue"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Manuscripts Ready for Publication section */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Accepted Manuscripts Awaiting Issue Assignment ({readyToPublishSubmissions.length})
            </h3>
            {readyToPublishSubmissions.length === 0 ? (
              <p className="text-xs text-stone-500">No accepted manuscripts waiting to be published.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {readyToPublishSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="rounded-lg border border-stone-200 bg-stone-50 p-4 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-semibold text-xs text-stone-900">{sub.title}</h4>
                      <p className="text-[11px] text-stone-500 mt-1">Author: {sub.author_name} ({sub.author_institute})</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAssignModalSub(sub);
                        setTargetJournalId(journals[0]?.id || '');
                      }}
                      className="rounded bg-[#0B3B69] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#082847] cursor-pointer self-start"
                    >
                      Assign to Issue →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: PUBLISHED ARTICLES MANAGER */}
      {/* ==================================================== */}
      {activeTab === 'articles' && (
        <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm space-y-4 p-6">
          <div className="border-b border-stone-200 pb-4">
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Published Research Articles Directory
            </h2>
            <p className="text-xs text-stone-500">
              Manipulate article visibility, toggle download permissions, and update bibliographic records.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Article Title &amp; Authors</th>
                  <th className="py-3 px-4">Journal Issue</th>
                  <th className="py-3 px-4">Page Range</th>
                  <th className="py-3 px-4">Visibility on Website</th>
                  <th className="py-3 px-4">PDF Downloads</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {articles.map((art) => (
                  <tr key={art.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-4 px-4 max-w-sm">
                      <div className="font-semibold text-stone-900">{art.title}</div>
                      <div className="text-[11px] text-stone-500 font-normal">{art.authors}</div>
                    </td>
                    <td className="py-4 px-4 text-stone-600 whitespace-nowrap">
                      {art.journal_name || 'NDU Journal'}
                    </td>
                    <td className="py-4 px-4 text-stone-500">{art.page_range || '1 - 10'}</td>

                    {/* Visibility Toggle Switch */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleArticleVisibility(art)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          art.is_visible !== false
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {art.is_visible !== false ? (
                          <>
                            <Eye className="h-3.5 w-3.5" />
                            <span>Visible</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3.5 w-3.5" />
                            <span>Disabled</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Download Toggle Switch */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleArticleDownloads(art)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          art.download_enabled
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                        }`}
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>{art.download_enabled ? 'Allowed' : 'Restricted'}</span>
                      </button>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap space-x-2">
                      {art.file_path && (
                        <a
                          href={`/uploads/published/${art.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-stone-500 hover:text-[#0B3B69]"
                          title="View PDF"
                        >
                          <ExternalLink className="h-4 w-4 inline" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenArticleEdit(art)}
                        className="rounded bg-[#0B3B69] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#082847] cursor-pointer"
                        title="Edit Metadata"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteArticle(art.id)}
                        className="p-1 text-stone-400 hover:text-red-600 cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 5: DYNAMIC LINKS & DROPDOWNS CONTROL CENTER */}
      {/* (THE CORE USER REQUIREMENT) */}
      {/* ==================================================== */}
      {activeTab === 'links' && (
        <div className="space-y-6">
          {/* Section Management Header Card */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Navigation Sections &amp; Dropdown Menus
                </h2>
                <p className="text-xs text-stone-500">
                  Create new sections and dropdown menus in the header navigation, digital library, and homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingSection(null);
                  setSectionTitle('');
                  setSectionDesc('');
                  setShowSectionModal(true);
                }}
                className="flex items-center gap-1.5 rounded-md bg-[#14452F] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0D3121] cursor-pointer"
              >
                <FolderPlus className="h-4 w-4" />
                <span>+ Create New Section/Dropdown</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {sections.map((sec) => {
                const secLinksCount = links.filter((l) => l.section_id === sec.id).length;
                return (
                  <div
                    key={sec.id}
                    className={`rounded-lg border p-4 space-y-3 transition-all ${
                      sec.is_active
                        ? 'border-stone-200 bg-stone-50'
                        : 'border-red-200 bg-red-50/40 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                          {sec.type} · {sec.target_nav}
                        </span>
                        <h4 className="font-bold text-sm text-stone-900 leading-tight mt-0.5">
                          {sec.title}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleSectionActive(sec)}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                          sec.is_active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {sec.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </div>

                    <p className="text-xs text-stone-500 line-clamp-2">
                      {sec.description || 'Custom library navigation section.'}
                    </p>

                    <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-200/60">
                      <span>{secLinksCount} link(s) assigned</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSection(sec);
                          setSectionTitle(sec.title);
                          setSectionType(sec.type);
                          setSectionTarget(sec.target_nav as any);
                          setSectionDesc(sec.description || '');
                          setShowSectionModal(true);
                        }}
                        className="text-[#0B3B69] font-semibold hover:underline cursor-pointer"
                      >
                        Edit Section
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Links & Resources Table Card */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  All Frontend Links &amp; Resources
                </h2>
                <p className="text-xs text-stone-500">
                  Every link and source has a direct <strong>Disable/Enable module</strong> and an <strong>Update/Edit module</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingLink(null);
                    setLinkName('');
                    setLinkUrl('');
                    setLinkDesc('');
                    setLinkBadge('');
                    setLinkFile(null);
                    setShowLinkModal(true);
                  }}
                  className="flex items-center gap-1.5 rounded-md bg-[#14452F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D3121] cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Link / Resource</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50 p-3 rounded-lg border border-stone-200">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-semibold text-stone-600 whitespace-nowrap">
                  Filter by Section:
                </span>
                <select
                  value={linkFilterSection}
                  onChange={(e) => setLinkFilterSection(e.target.value)}
                  className="rounded border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 outline-none"
                >
                  <option value="all">All Sections ({links.length})</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search links by name or description..."
                  value={linkSearchQuery}
                  onChange={(e) => setLinkSearchQuery(e.target.value)}
                  className="w-full rounded border border-stone-300 bg-white pl-8 pr-3 py-1.5 text-xs text-stone-900 outline-none"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Link Name &amp; Target Section</th>
                    <th className="py-3 px-4">URL / Uploaded File</th>
                    <th className="py-3 px-4">Category / Badge</th>
                    <th className="py-3 px-4">Disable / Enable Switch</th>
                    <th className="py-3 px-4">Update &amp; Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredLinks.map((lnk) => {
                    const sec = sections.find((s) => s.id === lnk.section_id);
                    return (
                      <tr
                        key={lnk.id}
                        className={`transition-colors ${
                          lnk.is_active ? 'hover:bg-stone-50/60' : 'bg-red-50/30 text-stone-400'
                        }`}
                      >
                        <td className="py-4 px-4 max-w-xs">
                          <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                            <span>{lnk.name}</span>
                            {lnk.file_path && (
                              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-mono">
                                PDF
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-500 font-normal">
                            Section: {sec?.title || lnk.section_id}
                          </div>
                          <div className="text-[11px] text-stone-400 line-clamp-1">{lnk.description}</div>
                        </td>

                        <td className="py-4 px-4 max-w-xs truncate text-stone-600 font-mono text-[11px]">
                          {lnk.url ? (
                            <a
                              href={lnk.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#0B3B69] hover:underline flex items-center gap-1"
                            >
                              <span className="truncate">{lnk.url}</span>
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-stone-400">Internal Library Action ({lnk.action_type})</span>
                          )}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="text-stone-700">{lnk.category}</span>
                          {lnk.badge && (
                            <span className="ml-1.5 rounded bg-stone-200 px-1.5 py-0.5 text-[10px] font-semibold text-stone-700">
                              {lnk.badge}
                            </span>
                          )}
                        </td>

                        {/* LIVE DISABLE / ENABLE SWITCH */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleLinkActive(lnk)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                              lnk.is_active
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {lnk.is_active ? (
                              <>
                                <Eye className="h-3.5 w-3.5" />
                                <span>Active (Visible)</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3.5 w-3.5" />
                                <span>Disabled (Hidden)</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* UPDATE & ACTIONS MODULE */}
                        <td className="py-4 px-4 whitespace-nowrap space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingLink(lnk);
                              setLinkSectionId(lnk.section_id);
                              setLinkName(lnk.name);
                              setLinkUrl(lnk.url);
                              setLinkDesc(lnk.description);
                              setLinkCategory(lnk.category);
                              setLinkBadge(lnk.badge || '');
                              setLinkActionType(lnk.action_type as any);
                              setShowLinkModal(true);
                            }}
                            className="inline-flex items-center gap-1 rounded bg-[#0B3B69] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#082847] cursor-pointer"
                          >
                            <Edit2 className="h-3 w-3" />
                            <span>Update Link</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLink(lnk.id)}
                            className="p-1 text-stone-400 hover:text-red-600 cursor-pointer"
                            title="Delete Link"
                          >
                            <Trash2 className="h-4 w-4 inline" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 6: DYNAMIC NEWS & BULLETINS */}
      {/* ==================================================== */}
      {activeTab === 'news' && (
        <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm space-y-4 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900">
                Library News, Bulletins &amp; Announcements
              </h2>
              <p className="text-xs text-stone-500">
                Publish new circulars and events, update existing content, or toggle visibility.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingNews(null);
                setNewsTitle('');
                setNewsSummary('');
                setNewsContent('');
                setShowNewsModal(true);
              }}
              className="flex items-center gap-1.5 rounded-md bg-[#14452F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D3121] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ Post News Announcement</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Headline &amp; Venue</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Visibility on Website</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {news.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/60">
                    <td className="py-4 px-4 max-w-sm">
                      <div className="font-semibold text-stone-900 flex items-center gap-1.5 flex-wrap">
                        <span>{item.title}</span>
                        {item.file_path && (
                          <a
                            href={item.file_path.startsWith('/') ? item.file_path : `/uploads/resources/${item.file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-1 hover:bg-red-200"
                            title="View / Download Attached PDF"
                          >
                            <Download className="h-3 w-3" />
                            PDF
                          </a>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500 font-normal">Venue: {item.venue}</div>
                      <div className="text-[11px] text-stone-400 line-clamp-1">{item.summary}</div>
                    </td>
                    <td className="py-4 px-4 text-stone-600">{item.category}</td>
                    <td className="py-4 px-4 text-stone-500 whitespace-nowrap">{item.date}</td>

                    {/* Disable / Enable Toggle */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleNewsActive(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          item.is_active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {item.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        <span>{item.is_active ? 'Live' : 'Hidden'}</span>
                      </button>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNews(item);
                          setNewsTitle(item.title);
                          setNewsCategory(item.category);
                          setNewsDate(item.date);
                          setNewsVenue(item.venue);
                          setNewsSummary(item.summary);
                          setNewsContent(item.content);
                          setShowNewsModal(true);
                        }}
                        className="rounded bg-[#0B3B69] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#082847] cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNews(item.id)}
                        className="p-1 text-stone-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 7: E-JOURNAL CATALOG OVERRIDES */}
      {/* ==================================================== */}
      {activeTab === 'overrides' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
            <div className="border-b border-stone-200 pb-4 space-y-1">
              <h2 className="font-sans text-xl font-bold text-stone-900">
                Departmental E-Journal Catalog Control
              </h2>
              <p className="text-xs text-stone-500">
                Enable or disable individual open-access journals from appearing in the Digital Library.
                Covers {TOTAL_JOURNAL_COUNT}+ titles across all NDU faculties and departments.
              </p>
            </div>

            {/* Faculty filter + search */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-stone-50 p-3 rounded-lg border border-stone-200">
              <select
                value={catalogFacultyFilter}
                onChange={(e) => setCatalogFacultyFilter(e.target.value)}
                className="rounded border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 outline-none cursor-pointer"
              >
                <option value="all">All Faculties ({TOTAL_JOURNAL_COUNT} journals)</option>
                {FACULTY_CATALOGS.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search journals by title or ISSN…"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full rounded border border-stone-300 bg-white pl-8 pr-3 py-1.5 text-xs text-stone-900 outline-none"
                />
              </div>
            </div>

            {/* Faculty sections */}
            {FACULTY_CATALOGS
              .filter((f) => catalogFacultyFilter === 'all' || f.id === catalogFacultyFilter)
              .map((faculty) => {
                const facultyJournalCount = faculty.departments.reduce((s, d) => s + d.journals.length, 0);
                return (
                  <div key={faculty.id} className="space-y-3">
                    <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                      <GraduationCap className="h-4 w-4 text-indigo-600 shrink-0" />
                      <h3 className="font-bold text-sm text-stone-900">{faculty.name}</h3>
                      <span className="ml-auto text-xs text-stone-500">{facultyJournalCount} journal{facultyJournalCount !== 1 ? 's' : ''}</span>
                    </div>
                    {faculty.departments.map((dept) => {
                      const deptJournals = dept.journals.filter((j) =>
                        !catalogSearch.trim() ||
                        j.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                        (j.issn && j.issn.includes(catalogSearch)) ||
                        (j.eissn && j.eissn.includes(catalogSearch))
                      );
                      if (deptJournals.length === 0) return null;
                      return (
                        <div key={dept.id} className="rounded-lg border border-stone-200 overflow-hidden">
                          <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2 flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-900">{dept.name}</span>
                            <span className="text-[10px] text-indigo-600">{deptJournals.length} journal{deptJournals.length !== 1 ? 's' : ''}</span>
                          </div>
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider">
                                <th className="py-2 px-3">Journal Title</th>
                                <th className="py-2 px-3 hidden sm:table-cell">ISSN / eISSN</th>
                                <th className="py-2 px-3">Visibility</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                              {deptJournals.map((j) => {
                                const isActive = overrides[j.id]?.is_active !== false;
                                return (
                                  <tr key={j.id} className={`transition-colors ${isActive ? 'hover:bg-stone-50/60' : 'bg-red-50/40'}`}>
                                    <td className="py-2.5 px-3 font-medium text-stone-900 max-w-xs">
                                      {j.url ? (
                                        <a href={j.url} target="_blank" rel="noopener noreferrer" className="text-[#0B3B69] hover:underline inline-flex items-center gap-1">
                                          {j.title}<ExternalLink className="h-3 w-3 shrink-0" />
                                        </a>
                                      ) : j.title}
                                    </td>
                                    <td className="py-2.5 px-3 text-stone-500 font-mono text-[11px] hidden sm:table-cell">
                                      {[j.issn, j.eissn].filter(Boolean).join(' / ') || '—'}
                                    </td>
                                    <td className="py-2.5 px-3">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleJournalOverride(j.id, isActive)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                                          isActive
                                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                        }`}
                                      >
                                        {isActive
                                          ? <><Eye className="h-3.5 w-3.5" /><span>Visible</span></>
                                          : <><EyeOff className="h-3.5 w-3.5" /><span>Hidden</span></>}
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 8: USERS & ROLES */}
      {/* ==================================================== */}
      {activeTab === 'users' && (
        <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm space-y-4 p-6">
          <div className="border-b border-stone-200 pb-4">
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Registered Portal Users &amp; Roles
            </h2>
            <p className="text-xs text-stone-500">
              Manage permissions, researcher accounts, and administrative staff.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Registration Date</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/60">
                    <td className="py-4 px-4 font-semibold text-stone-900">
                      <div>{u.full_name}</div>
                      <div className="text-[11px] text-stone-500 font-normal">{u.email}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="rounded bg-blue-100 text-blue-800 px-2 py-0.5 text-[11px] font-semibold uppercase">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`font-semibold text-[11px] ${
                          u.status === 'active' ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        ● {u.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-stone-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={async () => {
                          const newStatus = u.status === 'active' ? 'suspended' : 'active';
                          await api.admin.updateUser(u.id, { status: newStatus });
                          showToast(`User status set to ${newStatus}`);
                          loadAllData();
                        }}
                        className="text-xs text-[#0B3B69] font-semibold hover:underline cursor-pointer"
                      >
                        {u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: REVIEW SUBMISSION (PEER REVIEW) */}
      {/* ==================================================== */}
      {reviewModalSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-5 border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Review Manuscript Submission
              </h3>
              <button
                type="button"
                onClick={() => setReviewModalSub(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 bg-stone-50 p-4 rounded-lg text-xs">
              <div className="font-bold text-sm text-[#14452F]">{reviewModalSub.title}</div>
              <div className="text-stone-600">
                Author: <strong>{reviewModalSub.author_name}</strong> ({reviewModalSub.author_institute})
              </div>
              <div className="text-stone-600">Discipline: {reviewModalSub.subject_area}</div>
              <p className="text-stone-700 pt-1 border-t border-stone-200 italic">
                &quot;{reviewModalSub.abstract}&quot;
              </p>
              {reviewModalSub.file_path && (
                <div className="pt-2">
                  <a
                    href={`/uploads/manuscripts/${reviewModalSub.file_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B3B69] hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" /> Download Manuscript File ({reviewModalSub.file_path})
                  </a>
                </div>
              )}
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Editorial Decision *
                </label>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="decision"
                      value="accept"
                      checked={reviewAction === 'accept'}
                      onChange={() => setReviewAction('accept')}
                    />
                    <span className="text-emerald-700">Accept for Publication</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="decision"
                      value="reject"
                      checked={reviewAction === 'reject'}
                      onChange={() => setReviewAction('reject')}
                    />
                    <span className="text-red-700">Reject / Request Major Revisions</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Editorial Feedback &amp; Reviewer Notes for Author *
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Provide detailed feedback on peer-review comments, required formatting adjustments, or congratulations on acceptance..."
                  className="w-full rounded border border-stone-300 p-2.5 text-xs text-stone-900 focus:border-[#14452F] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalSub(null)}
                  className="rounded border border-stone-300 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#14452F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D3121]"
                >
                  Submit Editorial Decision &amp; Notify Researcher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: ASSIGN ARTICLE TO JOURNAL ISSUE */}
      {/* ==================================================== */}
      {assignModalSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-5 border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Publish Manuscript into Journal Issue
              </h3>
              <button
                type="button"
                onClick={() => setAssignModalSub(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <div className="bg-stone-50 p-3 rounded text-xs space-y-1">
              <span className="font-bold text-stone-900">{assignModalSub.title}</span>
              <p className="text-stone-500">{assignModalSub.author_name}</p>
            </div>

            <form onSubmit={handleAssignArticle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Target Journal Issue Volume *
                </label>
                <select
                  required
                  value={targetJournalId}
                  onChange={(e) => setTargetJournalId(e.target.value)}
                  className="w-full rounded border border-stone-300 bg-white p-2 text-xs text-stone-900 outline-none"
                >
                  {journals.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.name || `Vol ${j.volume_no}, Issue ${j.issue_no} (${j.publication_year})`} [
                      {j.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Published Page Range (e.g. 104 - 118) *
                </label>
                <input
                  type="text"
                  required
                  value={assignPages}
                  onChange={(e) => setAssignPages(e.target.value)}
                  placeholder="e.g. 1 - 15"
                  className="w-full rounded border border-stone-300 p-2 text-xs text-stone-900 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="downPerm"
                  checked={assignDownloads}
                  onChange={(e) => setAssignDownloads(e.target.checked)}
                />
                <label htmlFor="downPerm" className="text-xs font-medium text-stone-700 cursor-pointer">
                  Allow public readers to download full manuscript PDF
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalSub(null)}
                  className="rounded border border-stone-300 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#0B3B69] px-4 py-2 text-xs font-semibold text-white hover:bg-[#082847]"
                >
                  Publish Live into Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: CREATE JOURNAL ISSUE */}
      {/* ==================================================== */}
      {showCreateJournalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Create New Journal Issue
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateJournalModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJournal} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Volume No *</label>
                  <input
                    type="number"
                    required
                    value={journalVol}
                    onChange={(e) => setJournalVol(Number(e.target.value))}
                    className="w-full rounded border border-stone-300 p-2 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Issue No *</label>
                  <input
                    type="number"
                    required
                    value={journalIssueNo}
                    onChange={(e) => setJournalIssueNo(Number(e.target.value))}
                    className="w-full rounded border border-stone-300 p-2 text-xs text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Publication Year *
                </label>
                <input
                  type="number"
                  required
                  value={journalYear}
                  onChange={(e) => setJournalYear(Number(e.target.value))}
                  className="w-full rounded border border-stone-300 p-2 text-xs text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Custom Issue Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Volume 14, Issue 1 (December 2026)"
                  value={journalTitle}
                  onChange={(e) => setJournalTitle(e.target.value)}
                  className="w-full rounded border border-stone-300 p-2 text-xs text-stone-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateJournalModal(false)}
                  className="rounded border border-stone-300 px-3.5 py-2 text-xs font-medium text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#14452F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D3121]"
                >
                  Save as Draft Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: DYNAMIC SECTION / DROPDOWN MODAL */}
      {/* ==================================================== */}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {editingSection ? 'Update Section / Dropdown' : 'Create New Section / Dropdown'}
              </h3>
              <button
                type="button"
                onClick={() => setShowSectionModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Section / Dropdown Title *
                </label>
                <input
                  type="text"
                  required
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  placeholder="e.g. Research Grant Portals"
                  className="w-full rounded border border-stone-300 p-2 text-xs text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Display Type
                  </label>
                  <select
                    value={sectionType}
                    onChange={(e) => setSectionType(e.target.value as any)}
                    className="w-full rounded border border-stone-300 bg-white p-2 text-xs text-stone-900"
                  >
                    <option value="dropdown">Dropdown Menu</option>
                    <option value="section">Page Grid Section</option>
                    <option value="tab">Filter Tab</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Placement Target
                  </label>
                  <select
                    value={sectionTarget}
                    onChange={(e) => setSectionTarget(e.target.value as any)}
                    className="w-full rounded border border-stone-300 bg-white p-2 text-xs text-stone-900"
                  >
                    <option value="header_dropdown">Header Dropdown</option>
                    <option value="digital_library">Digital Library View</option>
                    <option value="homepage">Homepage Portals</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={sectionDesc}
                  onChange={(e) => setSectionDesc(e.target.value)}
                  placeholder="Brief summary explaining this group of resources..."
                  className="w-full rounded border border-stone-300 p-2 text-xs text-stone-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSectionModal(false)}
                  className="rounded border border-stone-300 px-3.5 py-2 text-xs font-medium text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#14452F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D3121]"
                >
                  {editingSection ? 'Update Section' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 5: LINK & RESOURCE MODAL (UPDATE / ADD MODULE) */}
      {/* ==================================================== */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {editingLink ? 'Update Link & Resource Module' : 'Add New Link / Resource'}
                </h3>
                <p className="text-[11px] text-stone-500">
                  Configure URL, target dropdown/section, or upload a downloadable PDF/document.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Target Section / Dropdown *
                </label>
                <select
                  required
                  value={linkSectionId}
                  onChange={(e) => setLinkSectionId(e.target.value)}
                  className="w-full rounded border border-stone-300 bg-white p-2 text-xs text-stone-900"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.type} - {s.target_nav})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Resource / Link Name *
                </label>
                <input
                  type="text"
                  required
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  placeholder="e.g. Westlaw International Legal Database"
                  className="w-full rounded border border-stone-300 p-2 text-xs text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={linkCategory}
                    onChange={(e) => setLinkCategory(e.target.value)}
                    placeholder="e.g. Research & Digital"
                    className="w-full rounded border border-stone-300 p-2 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Badge Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={linkBadge}
                    onChange={(e) => setLinkBadge(e.target.value)}
                    placeholder="e.g. New, Weekly, Core"
                    className="w-full rounded border border-stone-300 p-2 text-xs text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Destination URL (External or Internal)
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded border border-stone-300 p-2 text-xs text-stone-900"
                />
              </div>

              {/* Upload Resource File (PDF/Doc) */}
              <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-3.5 space-y-2">
                <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Upload className="h-3.5 w-3.5 text-[#14452F]" />
                  <span>Attach / Upload Downloadable Resource File (PDF/Document)</span>
                </label>
                <p className="text-[11px] text-stone-500">
                  Upload an institutional handbook, report, guide, or bulletin file to be served automatically.
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xlsx"
                  onChange={(e) => setLinkFile(e.target.files?.[0] || null)}
                  className="text-xs text-stone-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-[#14452F] file:text-white"
                />
                {editingLink?.file_path && (
                  <div className="text-[11px] text-blue-700 font-medium">
                    Current Attached File: {editingLink.file_path}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Description / Access Summary *
                </label>
                <textarea
                  rows={3}
                  required
                  value={linkDesc}
                  onChange={(e) => setLinkDesc(e.target.value)}
                  placeholder="Comprehensive description of this research resource or service..."
                  className="w-full rounded border border-stone-300 p-2 text-xs text-stone-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="rounded border border-stone-300 px-3.5 py-2 text-xs font-medium text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#14452F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D3121]"
                >
                  {editingLink ? 'Update Link Record' : 'Save & Publish Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 6: NEWS & ANNOUNCEMENT MODAL */}
      {/* ==================================================== */}
      {showNewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {editingNews ? 'Update News Article' : 'Publish New Announcement'}
              </h3>
              <button
                type="button"
                onClick={() => setShowNewsModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNews} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Headline / Title *</label>
                <input
                  type="text"
                  required
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  placeholder="e.g. Call for Papers: Special Edition"
                  className="w-full rounded border border-stone-300 p-2 text-xs text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={newsCategory}
                    onChange={(e) => setNewsCategory(e.target.value)}
                    className="w-full rounded border border-stone-300 bg-white p-2 text-xs text-stone-900"
                  >
                    <option value="Bulletins & Circulars">Bulletins &amp; Circulars</option>
                    <option value="Library Announcements">Library Announcements</option>
                    <option value="Seminars & Workshops">Seminars &amp; Workshops</option>
                    <option value="Call for Papers">Call for Papers</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Date Tag</label>
                  <input
                    type="text"
                    value={newsDate}
                    onChange={(e) => setNewsDate(e.target.value)}
                    className="w-full rounded border border-stone-300 p-2 text-xs text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Venue / Platform</label>
                <input
                  type="text"
                  value={newsVenue}
                  onChange={(e) => setNewsVenue(e.target.value)}
                  className="w-full rounded border border-stone-300 p-2 text-xs text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Summary *</label>
                <textarea
                  rows={2}
                  required
                  value={newsSummary}
                  onChange={(e) => setNewsSummary(e.target.value)}
                  className="w-full rounded border border-stone-300 p-2 text-xs text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Full Content</label>
                <textarea
                  rows={4}
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                  className="w-full rounded border border-stone-300 p-2 text-xs text-stone-900"
                />
              </div>

              {/* Attach PDF Document Upload Box */}
              <div className="rounded-lg border-2 border-dashed border-stone-300 p-4 bg-stone-50/70 hover:bg-stone-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-[#14452F]" />
                    <span>Attach Circular / Official Document (PDF)</span>
                  </label>
                  {newsFile && (
                    <button
                      type="button"
                      onClick={() => setNewsFile(null)}
                      className="text-[11px] text-red-600 hover:underline font-semibold cursor-pointer"
                    >
                      Remove File
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    id="news-pdf-input"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setNewsFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#14452F] file:text-white hover:file:bg-[#0D3121] cursor-pointer"
                  />
                </div>

                {newsFile && (
                  <div className="mt-2.5 flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded px-2.5 py-1.5 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Selected: {newsFile.name} ({(newsFile.size / 1024).toFixed(0)} KB)</span>
                  </div>
                )}

                {editingNews?.file_path && !newsFile && (
                  <div className="mt-2.5 flex items-center gap-2 text-xs text-stone-700 bg-stone-100 border border-stone-200 rounded px-2.5 py-1.5">
                    <FileText className="h-3.5 w-3.5 text-stone-500 shrink-0" />
                    <span className="truncate">Current attached file: {editingNews.file_path.split('/').pop()}</span>
                    <span className="text-[10px] text-stone-400">(Choose a new file to replace)</span>
                  </div>
                )}

                <p className="text-[11px] text-stone-500 mt-2">
                  Supported formats: <strong>PDF</strong>, DOC, DOCX. When uploaded, a green <strong>Download PDF</strong> button will be visible on the public news announcement.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewsModal(false)}
                  className="rounded border border-stone-300 px-3.5 py-2 text-xs font-medium text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#14452F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D3121]"
                >
                  {editingNews ? 'Update News' : 'Publish News Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* ARTICLE EDIT MODAL */}
      {/* ==================================================== */}
      {showArticleEditModal && editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-sans font-bold text-stone-900 text-base">Edit Article Metadata</h3>
              <button type="button" onClick={() => setShowArticleEditModal(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveArticleEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Article Title</label>
                <input
                  type="text"
                  value={articleEditTitle}
                  onChange={(e) => setArticleEditTitle(e.target.value)}
                  required
                  className="w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none focus:border-[#0B3B69]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Authors (comma-separated)</label>
                <input
                  type="text"
                  value={articleEditAuthors}
                  onChange={(e) => setArticleEditAuthors(e.target.value)}
                  className="w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none focus:border-[#0B3B69]"
                  placeholder="e.g. Dr. A. Smith, Prof. B. Jones"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Page Range</label>
                <input
                  type="text"
                  value={articleEditPageRange}
                  onChange={(e) => setArticleEditPageRange(e.target.value)}
                  className="w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none focus:border-[#0B3B69]"
                  placeholder="e.g. 1 - 15"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowArticleEditModal(false)} className="rounded border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="rounded bg-[#14452F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D3121] cursor-pointer">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* JOURNAL ISSUE EDIT MODAL */}
      {/* ==================================================== */}
      {showJournalEditModal && editingJournalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-sans font-bold text-stone-900 text-base">Edit Journal Issue</h3>
              <button type="button" onClick={() => setShowJournalEditModal(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveJournalEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Journal Issue Name</label>
                <input
                  type="text"
                  value={journalEditName}
                  onChange={(e) => setJournalEditName(e.target.value)}
                  required
                  className="w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none focus:border-[#0B3B69]"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Volume No.</label>
                  <input
                    type="number"
                    value={journalEditVol}
                    onChange={(e) => setJournalEditVol(Number(e.target.value))}
                    className="w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none focus:border-[#0B3B69]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Issue No.</label>
                  <input
                    type="number"
                    value={journalEditIssue}
                    onChange={(e) => setJournalEditIssue(Number(e.target.value))}
                    className="w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none focus:border-[#0B3B69]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={journalEditYear}
                    onChange={(e) => setJournalEditYear(Number(e.target.value))}
                    className="w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none focus:border-[#0B3B69]"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowJournalEditModal(false)} className="rounded border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="rounded bg-[#14452F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D3121] cursor-pointer">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        </main>
      </div>
    </div>
  );
}
