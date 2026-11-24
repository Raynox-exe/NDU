/**
 * NDU Library Client API Service
 * Handles Authentication, Submissions, Dynamic Links/Sections, Articles, and News.
 */

const API_BASE = ''; // Same origin (relative URL) so works seamlessly in dev proxy & production

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'researcher' | 'editor';
  status: 'active' | 'suspended' | 'pending';
  created_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  title: string;
  subject_area: string;
  abstract: string;
  author_name: string;
  author_email: string;
  author_institute: string;
  contact_number: string;
  country: string;
  co_authors: Array<{ name: string; institute?: string; email?: string }>;
  file_path: string;
  status: 'pending' | 'under_review' | 'accepted' | 'rejected';
  admin_feedback?: string;
  submitted_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface JournalIssue {
  id: string;
  name: string;
  volume_no: number;
  issue_no: number;
  publication_year: number;
  status: 'draft' | 'published';
  is_visible: boolean;
  created_at: string;
  articles?: Article[];
}

export interface Article {
  id: string;
  journal_id: string;
  submission_id?: string | null;
  title: string;
  authors: string;
  abstract: string;
  content: string;
  page_range?: string;
  file_path?: string;
  download_enabled: boolean;
  is_visible: boolean;
  status: 'published' | 'draft' | 'disabled';
  views: number;
  published_at?: string;
  created_at: string;
  volume_no?: number | null;
  issue_no?: number | null;
  publication_year?: number | null;
  journal_name?: string;
}

export interface DynamicSection {
  id: string;
  title: string;
  type: 'dropdown' | 'section' | 'tab';
  target_nav: 'header_dropdown' | 'footer' | 'digital_library' | 'homepage';
  order: number;
  is_active: boolean;
  description?: string;
  links?: DynamicLink[];
}

export interface DynamicLink {
  id: string;
  section_id: string;
  name: string;
  url: string;
  file_path?: string;
  description: string;
  category: string;
  badge?: string;
  action_type: 'external' | 'digital-library' | 'journals' | 'detail' | 'file';
  order: number;
  is_active: boolean;
  updated_at?: string;
}

export interface DynamicNews {
  id: string;
  title: string;
  category: string;
  date: string;
  venue: string;
  summary: string;
  content: string;
  file_path?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface DynamicNewspaper {
  id: string;
  title: string;
  edition: string;
  date: string;
  publisher?: string;
  summary: string;
  file_path?: string;
  cover_image?: string;
  url?: string;
  file_size?: string;
  page_count?: number;
  is_active: boolean;
  created_at: string;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('ndu_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Authentication
  auth: {
    async register(fullName: string, email: string, password: string) {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('ndu_token', data.token);
        localStorage.setItem('ndu_user', JSON.stringify(data.user));
      }
      return data;
    },

    async login(email: string, password: string) {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('ndu_token', data.token);
        localStorage.setItem('ndu_user', JSON.stringify(data.user));
      }
      return data;
    },

    async getStatus() {
      const token = localStorage.getItem('ndu_token');
      if (!token) return { loggedIn: false, user: null };
      try {
        const res = await fetch(`${API_BASE}/api/auth/status`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (!data.loggedIn) {
          localStorage.removeItem('ndu_token');
          localStorage.removeItem('ndu_user');
        }
        return data;
      } catch (e) {
        return { loggedIn: false, user: null };
      }
    },

    logout() {
      localStorage.removeItem('ndu_token');
      localStorage.removeItem('ndu_user');
      fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' }).catch(() => {});
    },

    getCurrentUser(): User | null {
      const saved = localStorage.getItem('ndu_user');
      if (!saved) return null;
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    },
  },

  // Member Submissions Pipeline
  submissions: {
    async upload(formData: FormData) {
      const token = localStorage.getItem('ndu_token');
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/submissions/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });
      return res.json();
    },

    async getMySubmissions(): Promise<{ success: boolean; submissions: Submission[] }> {
      const res = await fetch(`${API_BASE}/api/submissions/my`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    },

    async getMyStats() {
      const res = await fetch(`${API_BASE}/api/submissions/stats`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    },

    async getNotifications(): Promise<{ success: boolean; notifications: Notification[] }> {
      const res = await fetch(`${API_BASE}/api/submissions/notifications`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    },

    async markNotificationsRead() {
      const res = await fetch(`${API_BASE}/api/submissions/notifications/mark-read`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return res.json();
    },
  },

  // Public Endpoints
  public: {
    async getJournals(): Promise<{ success: boolean; journals: JournalIssue[] }> {
      const res = await fetch(`${API_BASE}/api/public/journals`);
      return res.json();
    },

    async getArticles(volume?: string | number, issue?: string | number, search?: string): Promise<{ success: boolean; articles: Article[] }> {
      const params = new URLSearchParams();
      if (volume) params.set('volume', String(volume));
      if (issue) params.set('issue', String(issue));
      if (search) params.set('search', search);

      const res = await fetch(`${API_BASE}/api/public/articles?${params.toString()}`);
      return res.json();
    },

    async getSectionsAndLinks(): Promise<{
      success: boolean;
      sections: DynamicSection[];
      allActiveLinks: DynamicLink[];
    }> {
      const res = await fetch(`${API_BASE}/api/public/sections-and-links`);
      return res.json();
    },

    async getNews(): Promise<{ success: boolean; news: DynamicNews[] }> {
      const res = await fetch(`${API_BASE}/api/public/news`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.news)) {
        return {
          ...data,
          news: data.news.map((n: any) => ({
            ...n,
            date: n.date || n.date_tag || 'Current Notice',
            content: n.content || n.full_content || n.summary || '',
            file_path: n.file_path || n.pdf_path || null,
            is_active: n.is_active !== undefined ? Boolean(n.is_active) : true,
          })),
        };
      }
      return data;
    },

    async getJournalOverrides(): Promise<{ success: boolean; overrides: Record<string, { is_active?: boolean }> }> {
      const res = await fetch(`${API_BASE}/api/public/journal-overrides`);
      return res.json();
    },

    async getNewspapers(): Promise<{ success: boolean; newspapers: DynamicNewspaper[] }> {
      try {
        const res = await fetch(`${API_BASE}/api/public/newspapers`);
        const data = await res.json();
        if (data && data.success && Array.isArray(data.newspapers)) {
          return data;
        }
      } catch (e) {
        // Fallback handled by caller
      }
      return { success: false, newspapers: [] };
    },
  },

  // Admin Endpoints
  admin: {
    async getStats() {
      const res = await fetch(`${API_BASE}/api/admin/stats`, { headers: getAuthHeaders() });
      return res.json();
    },

    // Submissions review
    async getSubmissions(): Promise<{ success: boolean; submissions: Submission[] }> {
      const res = await fetch(`${API_BASE}/api/admin/submissions`, { headers: getAuthHeaders() });
      return res.json();
    },

    async reviewSubmission(id: string, action: 'accept' | 'reject', feedback: string) {
      const res = await fetch(`${API_BASE}/api/admin/submissions/${id}/review`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action, feedback }),
      });
      return res.json();
    },

    // Journals
    async getJournals(): Promise<{ success: boolean; journals: JournalIssue[] }> {
      const res = await fetch(`${API_BASE}/api/admin/journals`, { headers: getAuthHeaders() });
      return res.json();
    },

    async createJournal(data: { volume_no: number; issue_no: number; publication_year: number; name?: string }) {
      const res = await fetch(`${API_BASE}/api/admin/journals`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    },

    async updateJournal(id: string, updates: Partial<JournalIssue>) {
      const res = await fetch(`${API_BASE}/api/admin/journals/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      return res.json();
    },

    async deployJournal(id: string) {
      const res = await fetch(`${API_BASE}/api/admin/journals/${id}/deploy`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return res.json();
    },

    async deleteJournal(id: string) {
      const res = await fetch(`${API_BASE}/api/admin/journals/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return res.json();
    },

    // Articles
    async getArticles(): Promise<{ success: boolean; articles: Article[] }> {
      const res = await fetch(`${API_BASE}/api/admin/articles`, { headers: getAuthHeaders() });
      return res.json();
    },

    async assignArticle(data: { journal_id: string; sub_id: string; pages: string; download_enabled?: boolean }) {
      const res = await fetch(`${API_BASE}/api/admin/articles/assign`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    },

    async updateArticle(id: string, updates: Partial<Article>) {
      const res = await fetch(`${API_BASE}/api/admin/articles/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      return res.json();
    },

    async deleteArticle(id: string) {
      const res = await fetch(`${API_BASE}/api/admin/articles/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return res.json();
    },

    // Dynamic Sections & Dropdowns
    async getSections(): Promise<{ success: boolean; sections: DynamicSection[] }> {
      const res = await fetch(`${API_BASE}/api/admin/sections`, { headers: getAuthHeaders() });
      return res.json();
    },

    async createSection(data: Partial<DynamicSection>) {
      const res = await fetch(`${API_BASE}/api/admin/sections`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    },

    async updateSection(id: string, updates: Partial<DynamicSection>) {
      const res = await fetch(`${API_BASE}/api/admin/sections/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      return res.json();
    },

    async deleteSection(id: string) {
      const res = await fetch(`${API_BASE}/api/admin/sections/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return res.json();
    },

    // Dynamic Links & Resources (every link has disable & update!)
    async getLinks(): Promise<{ success: boolean; links: DynamicLink[] }> {
      const res = await fetch(`${API_BASE}/api/admin/links`, { headers: getAuthHeaders() });
      return res.json();
    },

    async createLink(data: Partial<DynamicLink>) {
      const res = await fetch(`${API_BASE}/api/admin/links`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    },

    async updateLink(id: string, updates: Partial<DynamicLink>) {
      const res = await fetch(`${API_BASE}/api/admin/links/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      return res.json();
    },

    async deleteLink(id: string) {
      const res = await fetch(`${API_BASE}/api/admin/links/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return res.json();
    },

    async uploadResourceFile(file: File) {
      const token = localStorage.getItem('ndu_token');
      const formData = new FormData();
      formData.append('resourceFile', file);

      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/admin/links/upload-resource`, {
        method: 'POST',
        headers,
        body: formData,
      });
      return res.json();
    },

    // Dynamic News
    async getNews(): Promise<{ success: boolean; news: DynamicNews[] }> {
      const res = await fetch(`${API_BASE}/api/admin/news`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data && data.success && Array.isArray(data.news)) {
        return {
          ...data,
          news: data.news.map((n: any) => ({
            ...n,
            date: n.date || n.date_tag || 'Current Notice',
            content: n.content || n.full_content || n.summary || '',
            file_path: n.file_path || n.pdf_path || null,
            is_active: n.is_active !== undefined ? Boolean(n.is_active) : true,
          })),
        };
      }
      return data;
    },

    async createNews(data: Partial<DynamicNews>) {
      const res = await fetch(`${API_BASE}/api/admin/news`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    },

    async updateNews(id: string, updates: Partial<DynamicNews>) {
      const res = await fetch(`${API_BASE}/api/admin/news/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      return res.json();
    },

    async deleteNews(id: string) {
      const res = await fetch(`${API_BASE}/api/admin/news/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return res.json();
    },

    // E-Journal Overrides
    async toggleJournalOverride(journalId: string, isActive: boolean) {
      const res = await fetch(`${API_BASE}/api/admin/journal-overrides/${journalId}/toggle`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_active: isActive }),
      });
      return res.json();
    },

    async saveJournalOverride(journalId: string, data: { title?: string; url?: string; issn?: string; eissn?: string; is_active?: boolean; department_id?: string; is_custom?: boolean }) {
      const res = await fetch(`${API_BASE}/api/admin/journal-overrides/${journalId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    },

    async deleteJournalOverride(journalId: string) {
      const res = await fetch(`${API_BASE}/api/admin/journal-overrides/${journalId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return res.json();
    },

    // Newspapers Management
    async getNewspapers(): Promise<{ success: boolean; newspapers: DynamicNewspaper[] }> {
      const res = await fetch(`${API_BASE}/api/admin/newspapers`, { headers: getAuthHeaders() });
      return res.json();
    },

    async createNewspaper(data: Partial<DynamicNewspaper>) {
      const res = await fetch(`${API_BASE}/api/admin/newspapers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    },

    async updateNewspaper(id: string, updates: Partial<DynamicNewspaper>) {
      const res = await fetch(`${API_BASE}/api/admin/newspapers/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      return res.json();
    },

    async deleteNewspaper(id: string) {
      const res = await fetch(`${API_BASE}/api/admin/newspapers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return res.json();
    },

    // Users
    async getUsers(): Promise<{ success: boolean; users: User[] }> {
      const res = await fetch(`${API_BASE}/api/admin/users`, { headers: getAuthHeaders() });
      return res.json();
    },

    async updateUser(id: string, updates: Partial<User>) {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      return res.json();
    },

    async verifyUser(id: string): Promise<{ success: boolean; message: string; user: User }> {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}/verify`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return res.json();
    },

    async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return res.json();
    },
  },
};
