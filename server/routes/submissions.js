import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../db-index.js';
import { requireAuth } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const UPLOADS_MANUSCRIPTS_DIR = path.resolve(__dirname, '..', '..', 'public', 'uploads', 'manuscripts');
if (!fs.existsSync(UPLOADS_MANUSCRIPTS_DIR)) {
  fs.mkdirSync(UPLOADS_MANUSCRIPTS_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_MANUSCRIPTS_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const unique = `${cleanBase}-${Date.now()}${ext}`;
    cb(null, unique);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExts = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and Word documents (.pdf, .doc, .docx) are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter,
});

// @route   POST /api/submissions/upload
// @desc    Submit a manuscript for review
router.post('/upload', requireAuth, (req, res) => {
  upload.single('manuscriptFile')(req, res, async (err) => {
    if (err) {
      console.error('[UPLOAD ERROR]', err);
      return res.status(400).json({ success: false, message: err.message || 'File upload failed.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a manuscript file to upload.' });
    }

    const {
      title,
      area,
      area_other,
      abstract,
      author_name,
      author_email,
      author_institute,
      contact_number,
      country,
      co_authors,
    } = req.body;

    if (!title || !abstract) {
      return res.status(400).json({ success: false, message: 'Title and abstract are required.' });
    }

    let parsedCoAuthors = [];
    if (co_authors) {
      try {
        parsedCoAuthors = typeof co_authors === 'string' ? JSON.parse(co_authors) : co_authors;
      } catch (e) {
        parsedCoAuthors = [];
      }
    }

    const subjectArea = area === 'Other' && area_other ? area_other : area || 'General Research';

    try {
      const newSubmission = await db.submissions.create({
        user_id: req.user.id,
        title: title.trim(),
        subject_area: subjectArea,
        abstract: abstract.trim(),
        author_name: author_name?.trim() || req.user.full_name,
        author_email: author_email?.trim() || req.user.email,
        author_institute: author_institute?.trim() || 'Niger Delta University',
        contact_number: contact_number?.trim() || '',
        country: country?.trim() || 'Nigeria',
        co_authors: parsedCoAuthors,
        file_path: req.file.filename,
        status: 'pending',
      });

      // Notification to member
      await db.notifications.create({
        user_id: req.user.id,
        message: `Your manuscript "${newSubmission.title}" was submitted successfully and is awaiting review.`,
      });

      // Notify all admins
      const allUsers = (await db.users.list()) || [];
      const admins = allUsers.filter((u) => u.role === 'admin');
      for (const admin of admins) {
        await db.notifications.create({
          user_id: admin.id,
          message: `New manuscript received from ${req.user.full_name}: "${newSubmission.title}"`,
        });
      }

      res.status(201).json({
        success: true,
        message: 'Manuscript uploaded and submitted successfully!',
        submission: newSubmission,
      });
    } catch (dbErr) {
      console.error('[DB SUBMISSION ERROR]', dbErr);
      res.status(500).json({ success: false, message: 'Server error saving manuscript.' });
    }
  });
});

// @route   GET /api/submissions/my
// @desc    Get current member's submitted manuscripts
router.get('/my', requireAuth, async (req, res) => {
  try {
    const list = await db.submissions.getByUserId(req.user.id);
    res.json({ success: true, submissions: list || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   GET /api/submissions/stats
// @desc    Get current member's submission statistics
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const list = (await db.submissions.getByUserId(req.user.id)) || [];
    const stats = {
      total: list.length,
      pending: list.filter((s) => s.status === 'pending').length,
      under_review: list.filter((s) => s.status === 'under_review').length,
      accepted: list.filter((s) => s.status === 'accepted').length,
      rejected: list.filter((s) => s.status === 'rejected').length,
    };
    res.json({ success: true, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   GET /api/submissions/notifications
// @desc    Get current member's notifications
router.get('/notifications', requireAuth, async (req, res) => {
  try {
    const notifications = await db.notifications.getByUserId(req.user.id);
    res.json({ success: true, notifications: notifications || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   POST /api/submissions/notifications/mark-read
// @desc    Mark all notifications as read
router.post('/notifications/mark-read', requireAuth, async (req, res) => {
  try {
    await db.notifications.markAllRead(req.user.id);
    res.json({ success: true, message: 'Notifications marked as read.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

export default router;
