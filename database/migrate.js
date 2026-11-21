/**
 * database/migrate.js
 * ─────────────────────────────────────────────────────────────
 * Complete one-click migration:
 * 1. Connects to MySQL (XAMPP default: root / no password)
 * 2. Creates `ndu_library` database if it doesn't exist
 * 3. Creates all tables from database/schema.sql
 * 4. Migrates all users, journals, articles, links, news, etc.
 *    from data/library_db.json
 *
 * Usage:
 *   1. Start Apache & MySQL in XAMPP Control Panel
 *   2. Run: npm run db:migrate
 * ─────────────────────────────────────────────────────────────
 */

import mysql from 'mysql2/promise';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_CONFIG = {
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'ndu_library',
};

function fmt(val) {
  return (val === undefined || val === null) ? null : val;
}

async function main() {
  console.log('========================================================');
  console.log('   NDU Library — MySQL Database Setup & Data Migration   ');
  console.log('========================================================\n');
  console.log(`Connecting to MySQL at ${DB_CONFIG.user}@${DB_CONFIG.host}:${DB_CONFIG.port}...`);

  // Step 1: Connect to server without DB first to ensure DB exists
  let initConn;
  try {
    initConn = await mysql.createConnection({
      host:     DB_CONFIG.host,
      port:     DB_CONFIG.port,
      user:     DB_CONFIG.user,
      password: DB_CONFIG.password,
    });
    console.log('Connected to MySQL server.');

    await initConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\`
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    console.log(`Database \`${DB_CONFIG.database}\` verified / created.`);
  } catch (err) {
    console.error('\n❌ Could not connect to MySQL server:');
    console.error('   ' + err.message);
    console.error('\n👉 Tips:');
    console.error('   1. Ensure XAMPP Control Panel is open and MySQL is started (green).');
    console.error('   2. If you set a root password in MySQL, add DB_PASSWORD=yourpass to .env');
    process.exit(1);
  } finally {
    if (initConn) await initConn.end();
  }

  // Step 2: Connect to the specific database
  const pool = mysql.createPool({
    ...DB_CONFIG,
    waitForConnections: true,
    connectionLimit: 10,
    multipleStatements: true,
  });

  try {
    // Step 3: Run schema.sql to ensure all tables exist
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (existsSync(schemaPath)) {
      console.log('Applying table schemas from schema.sql...');
      const schemaSql = readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      console.log('All tables created / verified.');
    }

    // Step 4: Load and migrate JSON data
    const jsonPath = path.join(__dirname, '..', 'data', 'library_db.json');
    if (!existsSync(jsonPath)) {
      console.log('No data/library_db.json found. Tables are ready with empty state.');
      return;
    }

    const data = JSON.parse(readFileSync(jsonPath, 'utf8'));

    // Users
    console.log(`👤  Migrating ${data.users?.length ?? 0} users...`);
    for (const u of data.users ?? []) {
      await pool.execute(
        `INSERT IGNORE INTO users (id, full_name, email, password, role, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [u.id, u.full_name, u.email, u.password, u.role, u.status ?? 'active', u.created_at]
      );
    }

    // Journals
    console.log(`📚  Migrating ${data.journals?.length ?? 0} journals...`);
    for (const j of data.journals ?? []) {
      await pool.execute(
        `INSERT IGNORE INTO journals (id, name, volume_no, issue_no, publication_year, status, is_visible, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [j.id, j.name, j.volume_no, j.issue_no, j.publication_year, j.status, j.is_visible ? 1 : 0, j.created_at]
      );
    }

    // Articles
    console.log(`📄  Migrating ${data.articles?.length ?? 0} articles...`);
    for (const a of data.articles ?? []) {
      await pool.execute(
        `INSERT IGNORE INTO articles
           (id, journal_id, submission_id, title, authors, abstract, content,
            page_range, file_path, download_enabled, is_visible, status, views, published_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          a.id, a.journal_id, fmt(a.submission_id), a.title, a.authors,
          fmt(a.abstract), fmt(a.content), fmt(a.page_range), fmt(a.file_path),
          a.download_enabled ? 1 : 0, a.is_visible ? 1 : 0,
          a.status ?? 'published', a.views ?? 0,
          fmt(a.published_at), a.created_at,
        ]
      );
    }

    // Submissions
    console.log(`📝  Migrating ${data.submissions?.length ?? 0} submissions...`);
    for (const s of data.submissions ?? []) {
      const authorName = s.author_name || s.authors || 'Unknown Author';
      const authorEmail = s.author_email || s.email || 'researcher@ndu.edu.ng';
      const affiliation = s.author_institute || s.affiliation || null;
      const keywords = Array.isArray(s.keywords) ? s.keywords.join(', ') : (s.keywords || null);

      await pool.execute(
        `INSERT IGNORE INTO submissions
           (id, user_id, title, authors, abstract, keywords, affiliation,
            email, file_path, status, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          s.id, fmt(s.user_id), s.title, authorName, fmt(s.abstract),
          fmt(keywords), fmt(affiliation), authorEmail, fmt(s.file_path),
          s.status ?? 'pending', s.submitted_at || new Date().toISOString(),
        ]
      );
    }

    // Sections
    console.log(`📂  Migrating ${data.sections?.length ?? 0} sections...`);
    for (const s of data.sections ?? []) {
      await pool.execute(
        `INSERT IGNORE INTO sections (id, title, icon, sort_order, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [s.id, s.title, fmt(s.icon), s.order ?? 0, s.is_active ? 1 : 0, s.created_at ?? new Date().toISOString()]
      );
    }

    // Links
    console.log(`🔗  Migrating ${data.links?.length ?? 0} links...`);
    for (const l of data.links ?? []) {
      const label = l.label || l.name || 'Untitled Link';
      const url = l.url || '';
      await pool.execute(
        `INSERT IGNORE INTO links (id, section_id, label, url, description, icon, sort_order, is_active, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          l.id,
          fmt(l.section_id),
          label,
          url,
          fmt(l.description),
          fmt(l.icon),
          l.order ?? 0,
          l.is_active ? 1 : 0,
          l.updated_at || new Date().toISOString(),
        ]
      );
    }

    // News
    console.log(`📰  Migrating ${data.news?.length ?? 0} news items...`);
    for (const n of data.news ?? []) {
      const dateTag = n.date_tag || n.date || 'Current Announcement';
      const fullContent = n.full_content || n.content || '';
      const pdfPath = n.pdf_path || n.file_path || null;

      await pool.execute(
        `INSERT IGNORE INTO news
           (id, title, category, date_tag, venue, summary, full_content, pdf_path, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          n.id, n.title, fmt(n.category), fmt(dateTag), fmt(n.venue),
          fmt(n.summary), fmt(fullContent), fmt(pdfPath),
          n.is_active ? 1 : 0, n.created_at || new Date().toISOString(),
        ]
      );
    }

    // Journal Overrides
    const overrides = data.journal_overrides ?? {};
    const entries = Object.entries(overrides);
    console.log(`⚙️   Migrating ${entries.length} journal overrides...`);
    for (const [journalId, override] of entries) {
      await pool.execute(
        `INSERT IGNORE INTO journal_overrides (journal_id, is_active)
         VALUES (?, ?)`,
        [journalId, override.is_active ? 1 : 0]
      );
    }

    console.log('\n✅  Setup & Migration successfully completed!');
    console.log('   All tables and initial data are live in MySQL.');
    console.log('   To enable MySQL in the app, add DB_HOST=localhost to your .env file.\n');
  } catch (err) {
    console.error('\n❌  Error during migration:', err.message);
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
