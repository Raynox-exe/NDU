import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../db-index.js';
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
router.get('/stats', async (req, res) => {
  try {
    const users = (await db.users.list()) || [];
    const submissions = (await db.submissions.list()) || [];
    const articles = (await db.articles.list()) || [];
    const journals = (await db.journals.list()) || [];
    const links = (await db.links.list()) || [];
    const sections = (await db.sections.list()) || [];
    const news = (await db.news.list()) || [];

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
router.get('/submissions', async (req, res) => {
  try {
    const submissions = await db.submissions.list();
    res.json({ success: true, submissions: submissions || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.post('/submissions/:id/review', async (req, res) => {
  const { action, feedback } = req.body;
  const subId = req.params.id;

  try {
    const submission = await db.submissions.findById(subId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    const updated = await db.submissions.update(subId, {
      status: newStatus,
      admin_feedback: feedback || '',
    });

    // Notify author
    const notifMsg =
      action === 'accept'
        ? `Congratulations! Your manuscript "${submission.title}" has been ACCEPTED for publication in the NDU Library Journal series. Admin Feedback: ${feedback || 'Approved for publication issue assignment.'}`
        : `Your manuscript "${submission.title}" has been reviewed and requires revision or was not accepted. Feedback: ${feedback || 'No additional comments.'}`;

    await db.notifications.create({
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
router.get('/journals', async (req, res) => {
  try {
    const list = await db.journals.list(true);
    res.json({ success: true, journals: list || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.post('/journals', async (req, res) => {
  const { name, volume_no, issue_no, publication_year, status } = req.body;
  if (!name || !volume_no || !issue_no || !publication_year) {
    return res.status(400).json({ success: false, message: 'Volume, issue, year, and name are required.' });
  }

  try {
    const newJournal = await db.journals.create({
      name: name.trim(),
      volume_no: Number(volume_no),
      issue_no: Number(issue_no),
      publication_year: Number(publication_year),
      status: status || 'draft',
      is_visible: true,
    });
    res.status(201).json({ success: true, message: 'Journal issue created.', journal: newJournal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error creating journal issue.' });
  }
});

router.put('/journals/:id', async (req, res) => {
  try {
    const updated = await db.journals.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Journal issue not found.' });
    res.json({ success: true, message: 'Journal issue updated.', journal: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.post('/journals/:id/deploy', async (req, res) => {
  try {
    const deployed = await db.journals.deploy(req.params.id);
    if (!deployed) return res.status(404).json({ success: false, message: 'Journal issue not found.' });
    res.json({ success: true, message: 'Journal deployed and published to digital library catalog!', journal: deployed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error deploying journal.' });
  }
});

router.delete('/journals/:id', async (req, res) => {
  try {
    const deleted = await db.journals.delete(req.params.id);
    res.json({ success: deleted, message: deleted ? 'Journal issue deleted.' : 'Journal issue not found.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ==========================================
// 4. PUBLISHED ARTICLES MANAGEMENT
// ==========================================
router.get('/articles', async (req, res) => {
  try {
    const articles = (await db.articles.list(true)) || [];
    const journals = (await db.journals.list(true)) || [];

    const enriched = articles.map((a) => {
      const j = journals.find((journal) => String(journal.id) === String(a.journal_id));
      return {
        ...a,
        journal_name: j?.name || 'Unassigned Volume',
        volume_no: j?.volume_no,
        issue_no: j?.issue_no,
      };
    });

    res.json({ success: true, articles: enriched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Publish accepted submission to journal volume
router.post('/articles/publish-submission', async (req, res) => {
  const { sub_id, journal_id, page_range, custom_title, custom_authors } = req.body;

  if (!sub_id || !journal_id) {
    return res.status(400).json({ success: false, message: 'Submission ID and Target Journal are required.' });
  }

  try {
    const sub = await db.submissions.findById(sub_id);
    if (!sub) return res.status(404).json({ success: false, message: 'Submission not found.' });

    const journal = await db.journals.findById(journal_id);
    if (!journal) return res.status(404).json({ success: false, message: 'Target journal issue not found.' });

    let finalPdf = sub.file_path;
    if (sub.file_path) {
      const source = path.join(UPLOADS_MANUSCRIPTS_DIR, sub.file_path);
      const dest = path.join(UPLOADS_PUBLISHED_DIR, sub.file_path);
      if (fs.existsSync(source) && !fs.existsSync(dest)) {
        try {
          fs.copyFileSync(source, dest);
        } catch (e) {
          console.warn('Could not copy to published directory:', e);
        }
      }
    }

    const newArticle = await db.articles.create({
      journal_id,
      submission_id: sub.id,
      title: custom_title || sub.title,
      authors: custom_authors || sub.authors,
      abstract: sub.abstract,
      page_range: page_range || '1-10',
      file_path: finalPdf,
      download_enabled: true,
      is_visible: true,
      status: 'published',
      published_at: new Date().toISOString(),
    });

    await db.submissions.update(sub.id, { status: 'published' });

    if (sub.user_id) {
      await db.notifications.create({
        user_id: sub.user_id,
        message: `Your paper "${newArticle.title}" is officially PUBLISHED in ${journal.name}!`,
      });
    }

    res.status(201).json({
      success: true,
      message: `Paper successfully published to ${journal.name}!`,
      article: newArticle,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error publishing article.' });
  }
});

router.put('/articles/:id', async (req, res) => {
  try {
    const updated = await db.articles.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Article not found.' });
    res.json({ success: true, message: 'Article updated successfully.', article: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.delete('/articles/:id', async (req, res) => {
  try {
    const deleted = await db.articles.delete(req.params.id);
    res.json({ success: deleted, message: deleted ? 'Article removed from issue.' : 'Article not found.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ==========================================
// 5. QUICK-LINK SECTIONS
// ==========================================
router.get('/sections', async (req, res) => {
  try {
    const sections = await db.sections.list(true);
    res.json({ success: true, sections: sections || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.post('/sections', async (req, res) => {
  const { title, icon } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'Section title is required.' });

  try {
    const newSection = await db.sections.create({
      title: title.trim(),
      icon: icon || 'Folder',
      is_active: true,
    });
    res.status(201).json({ success: true, message: 'Section created.', section: newSection });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.put('/sections/:id', async (req, res) => {
  try {
    const updated = await db.sections.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Section not found.' });
    res.json({ success: true, message: 'Section updated.', section: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.delete('/sections/:id', async (req, res) => {
  try {
    const deleted = await db.sections.delete(req.params.id);
    res.json({ success: deleted, message: deleted ? 'Section deleted.' : 'Section not found.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ==========================================
// 6. DYNAMIC LINKS MANAGEMENT
// ==========================================
router.get('/links', async (req, res) => {
  try {
    const links = await db.links.list(true);
    res.json({ success: true, links: links || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.post('/links', async (req, res) => {
  const { section_id, label, url, description, icon } = req.body;
  if (!section_id || !label || !url) {
    return res.status(400).json({ success: false, message: 'Section, label, and URL are required.' });
  }

  try {
    const newLink = await db.links.create({
      section_id,
      label: label.trim(),
      url: url.trim(),
      description: description?.trim() || '',
      icon: icon || 'ExternalLink',
      is_active: true,
    });
    res.status(201).json({ success: true, message: 'Link created successfully.', link: newLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.put('/links/:id', async (req, res) => {
  try {
    const updated = await db.links.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Link not found.' });
    res.json({ success: true, message: 'Link updated successfully.', link: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.delete('/links/:id', async (req, res) => {
  try {
    const deleted = await db.links.delete(req.params.id);
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
router.get('/news', async (req, res) => {
  try {
    const news = await db.news.list(true);
    res.json({ success: true, news: news || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.post('/news', async (req, res) => {
  const { title, category, date, venue, summary, content, file_path, image_url } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'News title is required.' });

  try {
    const newNews = await db.news.create({
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

router.put('/news/:id', async (req, res) => {
  try {
    const updated = await db.news.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'News item not found.' });
    res.json({ success: true, message: 'News item updated.', news: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.delete('/news/:id', async (req, res) => {
  try {
    const deleted = await db.news.delete(req.params.id);
    res.json({ success: deleted, message: deleted ? 'News item removed.' : 'News item not found.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ==========================================
// 8. E-JOURNAL CATALOG OVERRIDES (DISABLE ANY INDIVIDUAL JOURNAL)
// ==========================================
router.get('/journal-overrides', async (req, res) => {
  try {
    const overrides = await db.journalOverrides.getAll();
    res.json({ success: true, overrides: overrides || {} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.post('/journal-overrides/:id/toggle', async (req, res) => {
  const { is_active } = req.body;
  try {
    const updated = await db.journalOverrides.toggle(req.params.id, is_active);
    res.json({ success: true, message: `Journal entry visibility toggled to ${is_active ? 'active' : 'disabled'}.`, override: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.post('/journal-overrides/:id', async (req, res) => {
  try {
    const updated = await db.journalOverrides.set(req.params.id, req.body);
    res.json({ success: true, message: 'Journal entry updated.', override: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.delete('/journal-overrides/:id', async (req, res) => {
  try {
    if (db.journalOverrides.delete) {
      await db.journalOverrides.delete(req.params.id);
    }
    res.json({ success: true, message: 'Journal override deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ==========================================
// 9. USERS DIRECTORY & ROLE MANAGEMENT
// ==========================================
router.get('/users', async (req, res) => {
  try {
    const users = await db.users.list();
    res.json({ success: true, users: users || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.put('/users/:id', async (req, res) => {
  const { role, status } = req.body;
  try {
    const updated = await db.users.update(req.params.id, { role, status });
    if (!updated) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'User updated.', user: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.post('/users/:id/verify', async (req, res) => {
  try {
    const user = await db.users.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const updated = await db.users.update(req.params.id, { status: 'active' });

    // Notify the user that their account is verified
    try {
      await db.notifications.create({
        user_id: user.id,
        message: `Your researcher account has been approved and verified by the Library Administrator! You can now log in and submit research manuscripts.`,
      });
    } catch (notifErr) {
      console.warn('[ADMIN] Could not create verification notification:', notifErr);
    }

    res.json({
      success: true,
      message: `User ${user.full_name} has been verified and approved.`,
      user: updated,
    });
  } catch (err) {
    console.error('[ADMIN VERIFY USER ERROR]', err);
    res.status(500).json({ success: false, message: 'Server error verifying user.' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const success = await db.users.delete(req.params.id);
    if (!success) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'User account removed.' });
  } catch (err) {
    console.error('[ADMIN DELETE USER ERROR]', err);
    res.status(500).json({ success: false, message: 'Server error deleting user.' });
  }
});

// ==========================================
// 10. NEWSPAPERS UPLOAD & MANAGEMENT
// ==========================================
router.get('/newspapers', async (req, res) => {
  try {
    const newspapers = await db.newspapers.list(true);
    res.json({ success: true, newspapers: newspapers || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.post('/newspapers', async (req, res) => {
  const { title, edition, date, publisher, summary, file_path, url, file_size, page_count } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'Newspaper title is required.' });

  try {
    const newPaper = await db.newspapers.create({
      title: title.trim(),
      edition: edition?.trim() || 'Daily Edition',
      date: date?.trim() || new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      publisher: publisher?.trim() || '',
      summary: summary?.trim() || '',
      file_path: file_path || '',
      url: url?.trim() || '',
      file_size: file_size || '',
      page_count: page_count ? Number(page_count) : undefined,
    });
    res.status(201).json({ success: true, message: 'Newspaper edition uploaded.', newspaper: newPaper });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.put('/newspapers/:id', async (req, res) => {
  try {
    const updated = await db.newspapers.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Newspaper not found.' });
    res.json({ success: true, message: 'Newspaper updated.', newspaper: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.delete('/newspapers/:id', async (req, res) => {
  try {
    const deleted = await db.newspapers.delete(req.params.id);
    res.json({ success: deleted, message: deleted ? 'Newspaper deleted.' : 'Newspaper not found.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

export default router;
