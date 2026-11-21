/**
 * server/db-mysql.js
 * ─────────────────────────────────────────────────────────────
 * MySQL adapter — 100% API-compatible replacement for server/db.js
 * Uses mysql2/promise connection pool.
 *
 * Automatically activated by server/db-index.js when DB_HOST is set.
 * ─────────────────────────────────────────────────────────────
 */

import mysql from 'mysql2/promise';

// ── Connection pool (reads from .env) ─────────────────────────
const pool = mysql.createPool({
  host:            process.env.DB_HOST     || 'localhost',
  port:            Number(process.env.DB_PORT) || 3306,
  user:            process.env.DB_USER     || 'root',
  password:        process.env.DB_PASSWORD || '',
  database:        process.env.DB_NAME     || 'ndu_library',
  waitForConnections: true,
  connectionLimit:    10,
  charset:            'utf8mb4',
});

// ── Helpers ───────────────────────────────────────────────────
async function q(sql, params = []) {
  const safeParams = params.map((p) => (p === undefined ? null : p));
  const [rows] = await pool.execute(sql, safeParams);
  return rows;
}
function one(rows) { return rows[0] ?? null; }
function bool(val) { return val ? 1 : 0; }

// ═══════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════
export const users = {
  async list() {
    return q('SELECT * FROM users ORDER BY created_at ASC');
  },
  async findById(id) {
    return one(await q('SELECT * FROM users WHERE id = ? LIMIT 1', [id]));
  },
  async findByEmail(email) {
    return one(await q('SELECT * FROM users WHERE email = ? LIMIT 1', [email]));
  },
  async create(data) {
    const { id = `u-${Date.now()}`, full_name, email, password, role = 'researcher', status = 'active' } = data;
    await q(
      'INSERT INTO users (id, full_name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, full_name, email, password, role, status]
    );
    return this.findById(id);
  },
  async update(id, updates) {
    const fields = [];
    const vals = [];
    for (const [k, v] of Object.entries(updates)) {
      if (['full_name', 'email', 'role', 'status', 'password'].includes(k)) {
        fields.push(`\`${k}\` = ?`);
        vals.push(v);
      }
    }
    if (!fields.length) return this.findById(id);
    vals.push(id);
    await q(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, vals);
    return this.findById(id);
  },
  async delete(id) {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

// ═══════════════════════════════════════════════════════════════
// JOURNALS
// ═══════════════════════════════════════════════════════════════
export const journals = {
  async list(includeHidden = true) {
    const where = includeHidden ? '' : 'WHERE is_visible = 1';
    return q(`SELECT * FROM journals ${where} ORDER BY publication_year DESC, volume_no DESC`);
  },
  async findById(id) {
    return one(await q('SELECT * FROM journals WHERE id = ? LIMIT 1', [id]));
  },
  async create(data) {
    const { id = `j-${Date.now()}`, name, volume_no, issue_no, publication_year, status = 'draft', is_visible = true } = data;
    await q(
      'INSERT INTO journals (id, name, volume_no, issue_no, publication_year, status, is_visible) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, Number(volume_no), Number(issue_no), Number(publication_year), status, bool(is_visible)]
    );
    return this.findById(id);
  },
  async update(id, updates) {
    const allowed = ['name', 'volume_no', 'issue_no', 'publication_year', 'status', 'is_visible'];
    const fields = [], vals = [];
    for (const [k, v] of Object.entries(updates)) {
      if (allowed.includes(k)) {
        fields.push(`\`${k}\` = ?`);
        vals.push(k === 'is_visible' ? bool(v) : v);
      }
    }
    if (!fields.length) return this.findById(id);
    vals.push(id);
    await q(`UPDATE journals SET ${fields.join(', ')} WHERE id = ?`, vals);
    return this.findById(id);
  },
  async deploy(id) {
    return this.update(id, { status: 'published', is_visible: true });
  },
  async delete(id) {
    const [result] = await pool.execute('DELETE FROM journals WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

// ═══════════════════════════════════════════════════════════════
// ARTICLES
// ═══════════════════════════════════════════════════════════════
export const articles = {
  async list(includeHidden = true) {
    const where = includeHidden ? '' : "WHERE is_visible = 1 AND status = 'published'";
    return q(`SELECT * FROM articles ${where} ORDER BY created_at DESC`);
  },
  async getByJournal(journalId) {
    return q('SELECT * FROM articles WHERE journal_id = ? ORDER BY page_range ASC', [journalId]);
  },
  async listByJournal(journalId) {
    return this.getByJournal(journalId);
  },
  async findById(id) {
    return one(await q('SELECT * FROM articles WHERE id = ? LIMIT 1', [id]));
  },
  async create(data) {
    const {
      id = `art-${Date.now()}`, journal_id, submission_id = null, title, authors, abstract = null,
      content = null, page_range = null, file_path = null, download_enabled = true,
      is_visible = true, status = 'published', views = 0, published_at = null,
    } = data;
    await q(
      `INSERT INTO articles
         (id, journal_id, submission_id, title, authors, abstract, content,
          page_range, file_path, download_enabled, is_visible, status, views, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, journal_id, submission_id, title, authors, abstract, content,
       page_range, file_path, bool(download_enabled), bool(is_visible), status, views, published_at]
    );
    return this.findById(id);
  },
  async update(id, updates) {
    const allowed = ['title', 'authors', 'abstract', 'content', 'page_range', 'file_path', 'download_enabled', 'is_visible', 'status', 'views'];
    const boolFields = ['download_enabled', 'is_visible'];
    const fields = [], vals = [];
    for (const [k, v] of Object.entries(updates)) {
      if (allowed.includes(k)) {
        fields.push(`\`${k}\` = ?`);
        vals.push(boolFields.includes(k) ? bool(v) : v);
      }
    }
    if (!fields.length) return this.findById(id);
    vals.push(id);
    await q(`UPDATE articles SET ${fields.join(', ')} WHERE id = ?`, vals);
    return this.findById(id);
  },
  async incrementViews(id) {
    await q('UPDATE articles SET views = views + 1 WHERE id = ?', [id]);
    return one(await q('SELECT views FROM articles WHERE id = ? LIMIT 1', [id]));
  },
  async delete(id) {
    const [result] = await pool.execute('DELETE FROM articles WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

// ═══════════════════════════════════════════════════════════════
// SUBMISSIONS
// ═══════════════════════════════════════════════════════════════
export const submissions = {
  async list() {
    return q('SELECT * FROM submissions ORDER BY submitted_at DESC');
  },
  async findById(id) {
    return one(await q('SELECT * FROM submissions WHERE id = ? LIMIT 1', [id]));
  },
  async getByUserId(userId) {
    return q('SELECT * FROM submissions WHERE user_id = ? ORDER BY submitted_at DESC', [userId]);
  },
  async findByUser(userId) {
    return this.getByUserId(userId);
  },
  async create(data) {
    const id = data.id || `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const userId = data.user_id ?? null;
    const title = data.title;
    const authors = data.authors || data.author_name || 'Unknown Author';
    const abstract = data.abstract ?? null;
    const keywords = data.keywords ? (Array.isArray(data.keywords) ? data.keywords.join(', ') : String(data.keywords)) : null;
    const affiliation = data.affiliation || data.author_institute || null;
    const email = data.email || data.author_email || 'researcher@ndu.edu.ng';
    const filePath = data.file_path || data.filePath || null;
    const status = data.status || 'pending';

    await q(
      `INSERT INTO submissions (id, user_id, title, authors, abstract, keywords, affiliation, email, file_path, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, title, authors, abstract, keywords, affiliation, email, filePath, status]
    );
    return this.findById(id);
  },
  async update(id, updates) {
    const allowed = ['status', 'reviewer_notes', 'file_path'];
    const fields = [], vals = [];
    for (const [k, v] of Object.entries(updates)) {
      if (allowed.includes(k)) {
        fields.push(`\`${k}\` = ?`);
        vals.push(v);
      }
    }
    if (!fields.length) return this.findById(id);
    vals.push(id);
    await q(`UPDATE submissions SET ${fields.join(', ')} WHERE id = ?`, vals);
    return this.findById(id);
  },
  async delete(id) {
    const [result] = await pool.execute('DELETE FROM submissions WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

// ═══════════════════════════════════════════════════════════════
// SECTIONS
// ═══════════════════════════════════════════════════════════════
export const sections = {
  async list(includeInactive = true) {
    const where = includeInactive ? '' : 'WHERE is_active = 1';
    return q(`SELECT * FROM sections ${where} ORDER BY sort_order ASC`);
  },
  async findById(id) {
    return one(await q('SELECT * FROM sections WHERE id = ? LIMIT 1', [id]));
  },
  async create(data) {
    const { id = `sec-${Date.now()}`, title, icon = null, order: sort_order = 0, is_active = true } = data;
    await q(
      'INSERT INTO sections (id, title, icon, sort_order, is_active) VALUES (?, ?, ?, ?, ?)',
      [id, title, icon, sort_order, bool(is_active)]
    );
    return this.findById(id);
  },
  async update(id, updates) {
    const map = { title: 'title', icon: 'icon', order: 'sort_order', is_active: 'is_active' };
    const fields = [], vals = [];
    for (const [k, v] of Object.entries(updates)) {
      if (map[k]) {
        fields.push(`\`${map[k]}\` = ?`);
        vals.push(k === 'is_active' ? bool(v) : v);
      }
    }
    if (!fields.length) return this.findById(id);
    vals.push(id);
    await q(`UPDATE sections SET ${fields.join(', ')} WHERE id = ?`, vals);
    return this.findById(id);
  },
  async toggleActive(id, isActive) {
    await q('UPDATE sections SET is_active = ? WHERE id = ?', [bool(isActive), id]);
    return this.findById(id);
  },
  async delete(id) {
    const [result] = await pool.execute('DELETE FROM sections WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

// ═══════════════════════════════════════════════════════════════
// LINKS
// ═══════════════════════════════════════════════════════════════
export const links = {
  async list(includeInactive = true) {
    const where = includeInactive ? '' : 'WHERE is_active = 1';
    return q(`SELECT * FROM links ${where} ORDER BY sort_order ASC`);
  },
  async getBySection(sectionId, includeInactive = false) {
    const extra = includeInactive ? '' : 'AND is_active = 1';
    return q(`SELECT * FROM links WHERE section_id = ? ${extra} ORDER BY sort_order ASC`, [sectionId]);
  },
  async findById(id) {
    return one(await q('SELECT * FROM links WHERE id = ? LIMIT 1', [id]));
  },
  async create(data) {
    const { id = `lnk-${Date.now()}`, section_id = null, label, url, description = null, icon = null, order: sort_order = 0, is_active = true } = data;
    await q(
      'INSERT INTO links (id, section_id, label, url, description, icon, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, section_id, label, url, description, icon, sort_order, bool(is_active)]
    );
    return this.findById(id);
  },
  async update(id, updates) {
    const map = { section_id: 'section_id', label: 'label', url: 'url', description: 'description', icon: 'icon', order: 'sort_order', is_active: 'is_active' };
    const fields = [], vals = [];
    for (const [k, v] of Object.entries(updates)) {
      if (map[k]) {
        fields.push(`\`${map[k]}\` = ?`);
        vals.push(k === 'is_active' ? bool(v) : v);
      }
    }
    if (!fields.length) return this.findById(id);
    vals.push(id);
    await q(`UPDATE links SET ${fields.join(', ')} WHERE id = ?`, vals);
    return this.findById(id);
  },
  async toggleActive(id, isActive) {
    await q('UPDATE links SET is_active = ? WHERE id = ?', [bool(isActive), id]);
    return this.findById(id);
  },
  async delete(id) {
    const [result] = await pool.execute('DELETE FROM links WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

// ═══════════════════════════════════════════════════════════════
// NEWS
// ═══════════════════════════════════════════════════════════════
export const news = {
  async list(includeInactive = true) {
    const where = includeInactive ? '' : 'WHERE is_active = 1';
    return q(`SELECT * FROM news ${where} ORDER BY created_at DESC`);
  },
  async findById(id) {
    return one(await q('SELECT * FROM news WHERE id = ? LIMIT 1', [id]));
  },
  async create(data) {
    const id = data.id || `news-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const title = data.title;
    const category = data.category || 'Bulletins & Circulars';
    const dateTag = data.date_tag || data.date || 'Current Announcement';
    const venue = data.venue || 'Niger Delta University';
    const summary = data.summary ?? null;
    const fullContent = data.full_content || data.content || '';
    const pdfPath = data.pdf_path || data.file_path || null;
    const isActive = data.is_active !== undefined ? bool(data.is_active) : 1;

    await q(
      `INSERT INTO news (id, title, category, date_tag, venue, summary, full_content, pdf_path, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, category, dateTag, venue, summary, fullContent, pdfPath, isActive]
    );
    return this.findById(id);
  },
  async update(id, updates) {
    const allowed = ['title', 'category', 'date_tag', 'venue', 'summary', 'full_content', 'pdf_path', 'is_active'];
    const fields = [], vals = [];
    for (const [k, v] of Object.entries(updates)) {
      if (allowed.includes(k)) {
        fields.push(`\`${k}\` = ?`);
        vals.push(k === 'is_active' ? bool(v) : v);
      }
    }
    if (!fields.length) return this.findById(id);
    vals.push(id);
    await q(`UPDATE news SET ${fields.join(', ')} WHERE id = ?`, vals);
    return this.findById(id);
  },
  async toggleActive(id, isActive) {
    await q('UPDATE news SET is_active = ? WHERE id = ?', [bool(isActive), id]);
    return this.findById(id);
  },
  async delete(id) {
    const [result] = await pool.execute('DELETE FROM news WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════
export const notifications = {
  async listForUser(userId) {
    return q('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  },
  async getByUserId(userId) {
    return this.listForUser(userId);
  },
  async create(data) {
    const { id = `notif-${Date.now()}`, user_id, message } = data;
    await q('INSERT INTO notifications (id, user_id, message) VALUES (?, ?, ?)', [id, user_id, message]);
    return one(await q('SELECT * FROM notifications WHERE id = ? LIMIT 1', [id]));
  },
  async markRead(id) {
    await q('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    return one(await q('SELECT * FROM notifications WHERE id = ? LIMIT 1', [id]));
  },
  async markAllRead(userId) {
    await q('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
    return true;
  },
};

// ═══════════════════════════════════════════════════════════════
// JOURNAL OVERRIDES
// ═══════════════════════════════════════════════════════════════
export const journalOverrides = {
  async getAll() {
    const rows = await q('SELECT * FROM journal_overrides');
    return Object.fromEntries(rows.map((r) => [r.journal_id, r]));
  },
  async set(journalId, overrideData) {
    const current = (await one(await q('SELECT * FROM journal_overrides WHERE journal_id = ? LIMIT 1', [journalId]))) || {};
    const is_active = overrideData.is_active !== undefined ? overrideData.is_active : (current.is_active !== undefined ? current.is_active : 1);
    const title = overrideData.title !== undefined ? overrideData.title : (current.title || null);
    const url = overrideData.url !== undefined ? overrideData.url : (current.url || null);
    const issn = overrideData.issn !== undefined ? overrideData.issn : (current.issn || null);
    const eissn = overrideData.eissn !== undefined ? overrideData.eissn : (current.eissn || null);
    const department_id = overrideData.department_id !== undefined ? overrideData.department_id : (current.department_id || null);
    const is_custom = overrideData.is_custom !== undefined ? (overrideData.is_custom ? 1 : 0) : (current.is_custom || 0);

    await q(
      `INSERT INTO journal_overrides (journal_id, is_active, title, url, issn, eissn, department_id, is_custom)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         is_active = VALUES(is_active),
         title = VALUES(title),
         url = VALUES(url),
         issn = VALUES(issn),
         eissn = VALUES(eissn),
         department_id = VALUES(department_id),
         is_custom = VALUES(is_custom),
         updated_at = NOW()`,
      [journalId, bool(is_active), title, url, issn, eissn, department_id, is_custom]
    );
    return one(await q('SELECT * FROM journal_overrides WHERE journal_id = ? LIMIT 1', [journalId]));
  },
  async toggle(journalId, isActive) {
    return this.set(journalId, { is_active: isActive });
  },
  async delete(journalId) {
    await q('DELETE FROM journal_overrides WHERE journal_id = ?', [journalId]);
    return true;
  },
};

// ── Default export (matches shape of server/db.js) ────────────
export const db = {
  users,
  journals,
  articles,
  submissions,
  sections,
  links,
  news,
  notifications,
  journalOverrides,
};

export default db;
