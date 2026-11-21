import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Apply admin guard to all routes
router.use(requireAdmin);

const UPLOADS_RESOURCES_DIR = path.resolve(__dirname, '..', '..', 'public', 'uploads', 'resources');
const UPLOADS_PUBLISHED_DIR = path.resolve(__dirname, '..', '..', 'public', 'uploads', 'published');
const UPLOADS_MANUSCRIPTS_DIR = path.resolve(__dirname, '..', '..', 'public', 'uploads', 'manuscripts');

[UPLOADS_RESOURCES_DIR, UPLOADS_PUBLISHED_DIR].forEach((d) => {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
});

// Resource file upload storage
const resourceStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_RESOURCES_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `res_${cleanBase}_${Date.now()}${ext}`);
  },
});
const uploadResource = multer({
  storage: resourceStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// ==========================================
// 1. STATS OVERVIEW
// ==========================================
router.get('/stats', (req, res) => {
  try {
    const users = db.users.list();
    const submissions = db.submissions.list();
    const articles = db.articles.list();
    const journals = db.journals.list();
    const links = db.links.list();
    const sections = db.sections.list();
    const news = db.news.list();

    res.json({
      success: true,
      stats: {
        totalResearchers: users.filter((u) => u.role === 'researcher').length,
        totalSubmissions: submissions.length,
        pendingReviews: submissions.filter((s) => s.status === 'pending').length,
        publishedArticles: articles.filter((a) => a.status === 'published' && a.is_visible !== false).length,
        totalJournals: journals.length,
        totalLinks: links.length,
        activeLinks: links.filter((l) => l.is_active !== false).length,
        totalSections: sections.length,
        totalNews: news.length,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching stats.' });
  }
});

// ==========================================
// 2. SUBMISSIONS & PEER REVIEW PIPELINE
// ==========================================
router.get('/submissions', (req, res) => {
  try {
    const submissions = db.submissions.list();
    res.json({ success: true, submissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.post('/submissions/:id/review', (req, res) => {
  const { action, feedback } = req.body;
  const subId = req.params.id;

  try {
    const submission = db.submissions.findById(subId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    const updated = db.submissions.update(subId, {
      status: newStatus,
      admin_feedback: feedback || '',
    });

    // Notify author
    const notifMsg =
      action === 'accept'
        ? `Congratulations! Your manuscript "${submission.title}" has been ACCEPTED for publication in the NDU Library Journal series. Admin Feedback: ${feedback || 'Approved for publication issue assignment.'}`
        : `Your manuscript "${submission.title}" has been reviewed and requires revision or was not accepted. Feedback: ${feedback || 'No additional comments.'}`;

    db.notifications.create({
      user_id: submission.user_id,
      message: notifMsg,
    });

    res.json({
      success: true,
      message: `Submission marked as ${newStatus} and researcher notified.`,
      submission: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error processing review.' });
  }
});

// ==========================================
// 3. JOURNAL VOLUMES & ISSUES
// ==========================================
router.get('/journals', (req, res) => {
  try {
    const list = db.journals.list(true);
    res.json({ success: true, journals: list });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.post('/journals', (req, res) => {
  const { volume_no, issue_no, publication_year, name } = req.body;
  if (!volume_no || !issue_no || !publication_year) {
    return res.status(400).json({
      success: false,
      message: 'Volume number, issue number, and publication year are required.',
    });
  }

  try {
    const journalName = name?.trim() || `Volume ${volume_no}, Issue ${issue_no} (${publication_year})`;
    const newJournal = db.journals.create({
      volume_no: Number(volume_no),
      issue_no: Number(issue_no),
      publication_year: Number(publication_year),
      name: journalName,
      status: 'draft',
      is_visible: true,
    });

    res.status(201).json({
      success: true,
      message: 'New journal issue created as Draft.',
      journal: newJournal,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.put('/journals/:id', (req, res) => {
  try {
    const updated = db.journals.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Journal not found.' });
    res.json({ success: true, message: 'Journal issue updated.', journal: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.post('/journals/:id/deploy', (req, res) => {
  try {
    const deployed = db.journals.deploy(req.params.id);
    if (!deployed) return res.status(404).json({ success: false, message: 'Journal issue not found.' });
    res.json({ success: true, message: 'Journal issue successfully deployed live to frontend!', journal: deployed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.delete('/journals/:id', (req, res) => {
  try {
    const deleted = db.journals.delete(req.params.id);
    res.json({ success: deleted, message: deleted ? 'Journal removed.' : 'Journal not found.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ==========================================
// 4. ARTICLES & ASSIGNMENT TO ISSUES
// ==========================================
router.get('/articles', (req, res) => {
  try {
    const articles = db.articles.list(true);
    const journals = db.journals.list(true);
    // Enrich with volume/issue metadata
    const enriched = articles.map((a) => {
      const journal = journals.find((j) => String(j.id) === String(a.journal_id));
      return {
        ...a,
        volume_no: journal?.volume_no || null,
        issue_no: journal?.issue_no || null,
        publication_year: journal?.publication_year || null,
        journal_name: journal?.name || 'Unassigned Volume',
      };
    });
    res.json({ success: true, articles: enriched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.post('/articles/assign', (req, res) => {
  const { journal_id, sub_id, pages, download_enabled } = req.body;

  try {
    const sub = db.submissions.findById(sub_id);
    if (!sub) return res.status(404).json({ success: false, message: 'Manuscript submission not found.' });

    const journal = db.journals.findById(journal_id);
    if (!journal) return res.status(404).json({ success: false, message: 'Target journal issue not found.' });

    // Copy manuscript file to published directory
    if (sub.file_path) {
      const sourcePath = path.join(UPLOADS_MANUSCRIPTS_DIR, sub.file_path);
      const destPath = path.join(UPLOADS_PUBLISHED_DIR, sub.file_path);
      if (fs.existsSync(sourcePath) && !fs.existsSync(destPath)) {
        try {
          fs.copyFileSync(sourcePath, destPath);
        } catch (copyErr) {
          console.error('[COPY FILE WARNING]', copyErr);
        }
      }
    }

    const newArticle = db.articles.create({
      journal_id,
      submission_id: sub.id,
      title: sub.title,
      authors: sub.author_name,
      abstract: sub.abstract,
      content: 'Official published manuscript from NDU Library journals system.',
      page_range: pages || '1 - 10',
      file_path: sub.file_path,
      download_enabled: download_enabled !== false,
      is_visible: true,
      status: 'published',
    });

    // Notify author of publication
    db.notifications.create({
      user_id: sub.user_id,
      message: `Your manuscript "${sub.title}" is now PUBLISHED in ${journal.name} (Pages: ${newArticle.page_range}). It is live in the NDU Library e-journal repository!`,
    });

    res.status(201).json({
      success: true,
      message: 'Article assigned and published into journal issue successfully!',
      article: newArticle,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error publishing article.' });
  }
});

router.put('/articles/:id', (req, res) => {
  try {
    const updated = db.articles.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Article not found.' });
    res.json({ success: true, message: 'Article details updated.', article: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.delete('/articles/:id', (req, res) => {
  try {
    const deleted = db.articles.delete(req.params.id);
    res.json({ success: deleted, message: deleted ? 'Article removed.' : 'Article not found.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ==========================================
// 5. DYNAMIC SECTIONS & DROPDOWNS
// ==========================================
router.get('/sections', (req, res) => {
  try {
    const sections = db.sections.list(true);
    res.json({ success: true, sections });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.post('/sections', (req, res) => {
  const { title, type, target_nav, description } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'Section title is required.' });

  try {
    const newSection = db.sections.create({
      title: title.trim(),
      type: type || 'dropdown',
      target_nav: target_nav || 'header_dropdown',
      description: description?.trim() || '',
      is_active: true,
    });
    res.status(201).json({ success: true, message: 'Section/Dropdown created.', section: newSection });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.put('/sections/:id', (req, res) => {
  try {
    const updated = db.sections.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Section not found.' });
    res.json({ success: true, message: 'Section updated.', section: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.delete('/sections/:id', (req, res) => {
  try {
    const deleted = db.sections.delete(req.params.id);
    res.json({ success: deleted, message: deleted ? 'Section deleted.' : 'Section not found.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ==========================================
// 6. DYNAMIC LINKS & RESOURCES (DISABLE & UPDATE MODULE)
// ==========================================
router.get('/links', (req, res) => {
  try {
    const links = db.links.list(true);
    res.json({ success: true, links });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.post('/links', (req, res) => {
  const { section_id, name, url, description, category, badge, action_type, file_path } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Link name is required.' });

  try {
    const newLink = db.links.create({
      section_id: section_id || 'sec-services',
      name: name.trim(),
      url: url?.trim() || '',
      file_path: file_path || '',
      description: description?.trim() || '',
      category: category?.trim() || 'General Resource',
      badge: badge?.trim() || '',
      action_type: action_type || (url ? 'external' : 'detail'),
      is_active: true,
    });
    res.status(201).json({ success: true, message: 'Resource link created.', link: newLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.put('/links/:id', (req, res) => {
  try {
    const updated = db.links.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Link not found.' });
    res.json({ success: true, message: 'Link updated successfully.', link: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.delete('/links/:id', (req, res) => {
  try {
    const deleted = db.links.delete(req.params.id);
    res.json({ success: deleted, message: deleted ? 'Link deleted.' : 'Link not found.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Upload resource file (e.g. PDF handbook, guide, report)
router.post('/links/upload-resource', uploadResource.single('resourceFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }
  const relativePath = `/uploads/resources/${req.file.filename}`;
  res.json({
    success: true,
    message: 'File uploaded successfully!',
    file_path: req.file.filename,
    url: relativePath,
    originalName: req.file.originalname,
  });
});

// ==========================================
// 7. DYNAMIC NEWS & BULLETINS
// ==========================================
router.get('/news', (req, res) => {
  try {
    const news = db.news.list(true);
    res.json({ success: true, news });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.post('/news', (req, res) => {
  const { title, category, date, venue, summary, content, file_path, image_url } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'News title is required.' });

  try {
    const newNews = db.news.create({
      title: title.trim(),
      category: category?.trim() || 'Bulletins & Circulars',
      date: date?.trim() || 'Current Announcement',
      venue: venue?.trim() || 'Niger Delta University',
      summary: summary?.trim() || '',
      content: content?.trim() || '',
      file_path: file_path || '',
      image_url: image_url || '',
      is_active: true,
    });
    res.status(201).json({ success: true, message: 'News item published.', news: newNews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.put('/news/:id', (req, res) => {
  try {
    const updated = db.news.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'News item not found.' });
    res.json({ success: true, message: 'News item updated.', news: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.delete('/news/:id', (req, res) => {
  try {
    const deleted = db.news.delete(req.params.id);
    res.json({ success: deleted, message: deleted ? 'News item removed.' : 'News item not found.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ==========================================
// 8. E-JOURNAL CATALOG OVERRIDES (DISABLE ANY INDIVIDUAL JOURNAL)
// ==========================================
router.get('/journal-overrides', (req, res) => {
  try {
    const overrides = db.journalOverrides.getAll();
    res.json({ success: true, overrides });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.post('/journal-overrides/:id/toggle', (req, res) => {
  const { is_active } = req.body;
  try {
    const updated = db.journalOverrides.toggle(req.params.id, is_active);
    res.json({ success: true, message: `Journal entry visibility toggled to ${is_active ? 'active' : 'disabled'}.`, override: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ==========================================
// 9. USERS DIRECTORY & ROLE MANAGEMENT
// ==========================================
router.get('/users', (req, res) => {
  try {
    const users = db.users.list();
    res.json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.put('/users/:id', (req, res) => {
  const { role, status } = req.body;
  try {
    const updated = db.users.update(req.params.id, { role, status });
    if (!updated) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'User updated.', user: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

export default router;
