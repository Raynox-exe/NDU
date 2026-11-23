import express from 'express';
import { db } from '../db-index.js';

const router = express.Router();

// @route   GET /api/public/journals
// @desc    Get published and active journal issues with their articles
router.get('/journals', async (req, res) => {
  try {
    const journals = await db.journals.list(false); // Only published & visible
    const allArticles = await db.articles.list(false); // Only published & visible

    const result = (journals || []).map((j) => {
      const articles = (allArticles || []).filter((a) => String(a.journal_id) === String(j.id));
      return {
        ...j,
        articles,
      };
    });

    res.json({ success: true, journals: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   GET /api/public/articles
// @desc    Get published articles with optional volume/issue/search filter
router.get('/articles', async (req, res) => {
  try {
    const { volume, issue, search } = req.query;
    const journals = await db.journals.list(true);
    let articles = await db.articles.list(false);

    if (volume && issue) {
      const matchJournal = (journals || []).find(
        (j) => String(j.volume_no) === String(volume) && String(j.issue_no) === String(issue)
      );
      if (matchJournal) {
        articles = (articles || []).filter((a) => String(a.journal_id) === String(matchJournal.id));
      } else {
        articles = [];
      }
    }

    if (search) {
      const q = search.toLowerCase();
      articles = (articles || []).filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.authors.toLowerCase().includes(q) ||
          (a.abstract && a.abstract.toLowerCase().includes(q))
      );
    }

    const enriched = (articles || []).map((a) => {
      const j = (journals || []).find((journal) => String(journal.id) === String(a.journal_id));
      return {
        ...a,
        volume_no: j?.volume_no || null,
        issue_no: j?.issue_no || null,
        publication_year: j?.publication_year || null,
        journal_name: j?.name || 'NDU Research Journal',
      };
    });

    res.json({ success: true, articles: enriched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   GET /api/public/sections-and-links
// @desc    Get active sections, dropdowns, and links (disabled items filtered out)
router.get('/sections-and-links', async (req, res) => {
  try {
    const sections = await db.sections.list(false); // Only active
    const links = await db.links.list(false); // Only active

    // Group links by section
    const grouped = (sections || []).map((sec) => {
      const secLinks = (links || []).filter((l) => String(l.section_id) === String(sec.id));
      return {
        ...sec,
        links: secLinks,
      };
    });

    res.json({
      success: true,
      sections: grouped,
      allActiveLinks: links || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   GET /api/public/news
// @desc    Get active news & announcements
router.get('/news', async (req, res) => {
  try {
    const news = await db.news.list(false); // Only active
    res.json({ success: true, news: news || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   GET /api/public/journal-overrides
// @desc    Get catalog overrides (e.g. any departmental journal disabled by admin)
router.get('/journal-overrides', async (req, res) => {
  try {
    const overrides = await db.journalOverrides.getAll();
    res.json({ success: true, overrides: overrides || {} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   GET /api/public/newspapers
// @desc    Get active published newspapers
router.get('/newspapers', async (req, res) => {
  try {
    const newspapers = await db.newspapers.list(false);
    res.json({ success: true, newspapers: newspapers || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

export default router;
