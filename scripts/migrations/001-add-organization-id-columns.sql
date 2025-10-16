-- 001-add-organization-id-columns.sql
-- Idempotent migration to add organization_id columns to common tables.
-- Requires MySQL 5.7+; uses INFORMATION_SCHEMA checks so it's idempotent.
-- Run in a transaction where possible; test on staging first.

SET @schema = DATABASE();

-- Helper: add column if missing
-- For each table: check INFORMATION_SCHEMA and ALTER if missing

-- users
SELECT COUNT(*) INTO @cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@schema AND TABLE_NAME='users' AND COLUMN_NAME='organization_id';
SET @sql = IF(@cnt=0, 'ALTER TABLE users ADD COLUMN organization_id INT NULL, ADD COLUMN current_organization_id INT NULL', 'SELECT 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- achievements
SELECT COUNT(*) INTO @cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@schema AND TABLE_NAME='achievements' AND COLUMN_NAME='organization_id';
SET @sql = IF(@cnt=0, 'ALTER TABLE achievements ADD COLUMN organization_id INT NULL', 'SELECT 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- rewards
SELECT COUNT(*) INTO @cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@schema AND TABLE_NAME='rewards' AND COLUMN_NAME='organization_id';
SET @sql = IF(@cnt=0, 'ALTER TABLE rewards ADD COLUMN organization_id INT NULL', 'SELECT 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- tasks
SELECT COUNT(*) INTO @cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@schema AND TABLE_NAME='tasks' AND COLUMN_NAME='organization_id';
SET @sql = IF(@cnt=0, 'ALTER TABLE tasks ADD COLUMN organization_id INT NULL', 'SELECT 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- teams
SELECT COUNT(*) INTO @cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@schema AND TABLE_NAME='teams' AND COLUMN_NAME='organization_id';
SET @sql = IF(@cnt=0, 'ALTER TABLE teams ADD COLUMN organization_id INT NULL', 'SELECT 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- organization_departments
SELECT COUNT(*) INTO @cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@schema AND TABLE_NAME='organization_departments' AND COLUMN_NAME='organization_id';
SET @sql = IF(@cnt=0, 'ALTER TABLE organization_departments ADD COLUMN organization_id INT NULL', 'SELECT 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- user_badges
SELECT COUNT(*) INTO @cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@schema AND TABLE_NAME='user_badges' AND COLUMN_NAME='organization_id';
SET @sql = IF(@cnt=0, 'ALTER TABLE user_badges ADD COLUMN organization_id INT NULL', 'SELECT 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- user_rewards
SELECT COUNT(*) INTO @cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@schema AND TABLE_NAME='user_rewards' AND COLUMN_NAME='organization_id';
SET @sql = IF(@cnt=0, 'ALTER TABLE user_rewards ADD COLUMN organization_id INT NULL', 'SELECT 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- user_achievements
SELECT COUNT(*) INTO @cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@schema AND TABLE_NAME='user_achievements' AND COLUMN_NAME='organization_id';
SET @sql = IF(@cnt=0, 'ALTER TABLE user_achievements ADD COLUMN organization_id INT NULL', 'SELECT 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- organization_invitations
SELECT COUNT(*) INTO @cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@schema AND TABLE_NAME='organization_invitations' AND COLUMN_NAME='organization_id';
SET @sql = IF(@cnt=0, 'ALTER TABLE organization_invitations ADD COLUMN organization_id INT NULL', 'SELECT 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Optional: add indexes (best-effort; may error if names collide). Wrap in handler to ignore errors.
-- Create index helper
DROP PROCEDURE IF EXISTS create_index_if_missing;
DELIMITER $$
CREATE PROCEDURE create_index_if_missing(IN tbl VARCHAR(64), IN idxname VARCHAR(64), IN cols VARCHAR(255))
BEGIN
  DECLARE cnt INT DEFAULT 0;
  SELECT COUNT(*) INTO cnt FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=@schema AND TABLE_NAME=tbl AND INDEX_NAME=idxname;
  IF cnt = 0 THEN
    SET @s = CONCAT('CREATE INDEX ', idxname, ' ON ', tbl, '(', cols, ')');
    PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;
  END IF;
END$$
DELIMITER ;

CALL create_index_if_missing('users','idx_users_org','organization_id');
CALL create_index_if_missing('achievements','idx_achievements_org','organization_id');
CALL create_index_if_missing('rewards','idx_rewards_org','organization_id');
CALL create_index_if_missing('tasks','idx_tasks_org','organization_id');
CALL create_index_if_missing('organization_departments','idx_org_depts_org','organization_id');

-- Clean up helper
DROP PROCEDURE IF EXISTS create_index_if_missing;

-- End of migration
SELECT 'OK' as migration_status;
