/**
 * server/db-index.js — unified database entry point
 * ─────────────────────────────────────────────────────────────
 * Auto-selects adapter based on environment:
 *
 *   DB_HOST is set  →  MySQL (XAMPP / production MySQL server)
 *   DB_HOST not set →  JSON file (local dev, no MySQL needed)
 *
 * To switch to MySQL:
 *   Add these to your .env file:
 *     DB_HOST=localhost
 *     DB_PORT=3306
 *     DB_USER=root
 *     DB_PASSWORD=
 *     DB_NAME=ndu_library
 *
 * Usage in route files:
 *   import { db } from '../db-index.js';
 *   const news = await db.news.list();
 * ─────────────────────────────────────────────────────────────
 */

let db;

if (process.env.DB_HOST) {
  // ── MySQL mode ────────────────────────────────────────────
  const { default: mysqlDb } = await import('./db-mysql.js');
  db = mysqlDb;
  console.log(`[DB] MySQL mode active → ${process.env.DB_USER || 'root'}@${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || 'ndu_library'}`);
} else {
  // ── JSON file mode (zero-config local dev) ────────────────
  const { db: jsonDb } = await import('./db.js');
  db = jsonDb;
  console.log('[DB] Using JSON file (set DB_HOST in .env to switch to MySQL)');
}

export { db };
export default db;
