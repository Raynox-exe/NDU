-- =============================================================
--  NDU Library & E-Library — MySQL Schema
--  Run this in phpMyAdmin or MySQL CLI to create the database
--  Compatible with: XAMPP (MySQL 5.7+ / MariaDB 10.3+)
-- =============================================================

CREATE DATABASE IF NOT EXISTS ndu_library
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ndu_library;

-- ─── USERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          VARCHAR(64)  PRIMARY KEY,
  full_name   VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,       -- bcrypt hash
  role        VARCHAR(32)  NOT NULL DEFAULT 'researcher',
  status      VARCHAR(32)  NOT NULL DEFAULT 'active',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── JOURNALS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS journals (
  id               VARCHAR(64)  PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  volume_no        INT          NOT NULL,
  issue_no         INT          NOT NULL,
  publication_year INT          NOT NULL,
  status           VARCHAR(32)  NOT NULL DEFAULT 'draft',
  is_visible       TINYINT(1)   NOT NULL DEFAULT 1,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── ARTICLES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS articles (
  id               VARCHAR(64)   PRIMARY KEY,
  journal_id       VARCHAR(64)   NOT NULL,
  submission_id    VARCHAR(64)   DEFAULT NULL,
  title            TEXT          NOT NULL,
  authors          TEXT          NOT NULL,
  abstract         TEXT,
  content          TEXT,
  page_range       VARCHAR(64)   DEFAULT NULL,
  file_path        VARCHAR(255)  DEFAULT NULL,
  download_enabled TINYINT(1)    NOT NULL DEFAULT 1,
  is_visible       TINYINT(1)    NOT NULL DEFAULT 1,
  status           VARCHAR(32)   NOT NULL DEFAULT 'published',
  views            INT           NOT NULL DEFAULT 0,
  published_at     DATETIME      DEFAULT NULL,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── SUBMISSIONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS submissions (
  id             VARCHAR(64)  PRIMARY KEY,
  user_id        VARCHAR(64)  DEFAULT NULL,
  title          TEXT         NOT NULL,
  authors        TEXT         NOT NULL,
  abstract       TEXT,
  keywords       TEXT,
  affiliation    VARCHAR(255) DEFAULT NULL,
  email          VARCHAR(255) NOT NULL,
  file_path      VARCHAR(255) DEFAULT NULL,
  status         VARCHAR(32)  NOT NULL DEFAULT 'pending',
  reviewer_notes TEXT,
  submitted_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── QUICK-LINK SECTIONS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS sections (
  id         VARCHAR(64)  PRIMARY KEY,
  title      VARCHAR(255) NOT NULL,
  icon       VARCHAR(64)  DEFAULT NULL,
  sort_order INT          NOT NULL DEFAULT 0,
  is_active  TINYINT(1)   NOT NULL DEFAULT 1,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── QUICK LINKS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS links (
  id          VARCHAR(64)  PRIMARY KEY,
  section_id  VARCHAR(64)  DEFAULT NULL,
  label       VARCHAR(255) NOT NULL,
  url         TEXT         NOT NULL,
  description TEXT,
  icon        VARCHAR(64)  DEFAULT NULL,
  sort_order  INT          NOT NULL DEFAULT 0,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── NEWS / ANNOUNCEMENTS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS news (
  id           VARCHAR(64)  PRIMARY KEY,
  title        TEXT         NOT NULL,
  category     VARCHAR(128) DEFAULT NULL,
  date_tag     VARCHAR(64)  DEFAULT NULL,
  venue        VARCHAR(255) DEFAULT NULL,
  summary      TEXT,
  full_content TEXT,
  pdf_path     VARCHAR(255) DEFAULT NULL,
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── NOTIFICATIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         VARCHAR(64) PRIMARY KEY,
  user_id    VARCHAR(64) DEFAULT NULL,
  message    TEXT        NOT NULL,
  is_read    TINYINT(1)  NOT NULL DEFAULT 0,
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── JOURNAL OVERRIDES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS journal_overrides (
  journal_id    VARCHAR(128) PRIMARY KEY,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  title         VARCHAR(255) DEFAULT NULL,
  url           TEXT         DEFAULT NULL,
  issn          VARCHAR(64)  DEFAULT NULL,
  eissn         VARCHAR(64)  DEFAULT NULL,
  department_id VARCHAR(128) DEFAULT NULL,
  is_custom     TINYINT(1)   NOT NULL DEFAULT 0,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_articles_journal   ON articles(journal_id);
CREATE INDEX IF NOT EXISTS idx_links_section      ON links(section_id);
CREATE INDEX IF NOT EXISTS idx_news_created       ON news(created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_user   ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- ─── AUDIT LOGS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          VARCHAR(64)  NOT NULL PRIMARY KEY,
  admin_id    VARCHAR(64)  NOT NULL,
  admin_name  VARCHAR(255) NOT NULL DEFAULT 'Administrator',
  action      VARCHAR(255) NOT NULL,
  details     TEXT         DEFAULT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin    ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created  ON audit_logs(created_at);
