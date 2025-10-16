-- Migration: create missing tables and add missing columns
-- Run this on your MySQL instance (adjust schema/database name if needed).

-- 1) Create task_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS task_comments (
  id VARCHAR(36) PRIMARY KEY,
  task_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2) Add notes column to daily_checkins if missing
ALTER TABLE daily_checkins
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3) Add rating column to tasks if missing (rating typically 1-5, allow NULL)
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS rating TINYINT NULL;

-- 4) Sanity checks: ensure gems_history and users.total_gems exist
-- (These are no-ops if columns already exist)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS total_gems INT DEFAULT 0;

ALTER TABLE gems_history
  ADD COLUMN IF NOT EXISTS id VARCHAR(36) PRIMARY KEY;

-- End of migration
