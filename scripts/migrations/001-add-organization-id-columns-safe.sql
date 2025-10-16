-- 001-add-organization-id-columns-safe.sql
-- SAFE idempotent migration: checks if TABLE exists before altering
-- Requires MySQL 5.7+; uses INFORMATION_SCHEMA checks
-- Safe to run multiple times

SET @schema = DATABASE();

-- Helper procedure: add column if table and column both exist
DROP PROCEDURE IF EXISTS safe_add_org_column;
DELIMITER $$
CREATE PROCEDURE safe_add_org_column(IN tbl VARCHAR(64), IN cols TEXT)
BEGIN
  DECLARE table_exists INT DEFAULT 0;
  DECLARE col_exists INT DEFAULT 0;
  
  -- Check if table exists
  SELECT COUNT(*) INTO table_exists 
  FROM INFORMATION_SCHEMA.TABLES 
  WHERE TABLE_SCHEMA = @schema AND TABLE_NAME = tbl;
  
  IF table_exists > 0 THEN
    -- Table exists, check if organization_id column exists
    SELECT COUNT(*) INTO col_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema 
      AND TABLE_NAME = tbl 
      AND COLUMN_NAME = 'organization_id';
    
    IF col_exists = 0 THEN
      -- Column doesn't exist, add it
      SET @sql = CONCAT('ALTER TABLE ', tbl, ' ADD COLUMN ', cols);
      PREPARE stmt FROM @sql;
      EXECUTE stmt;
      DEALLOCATE PREPARE stmt;
      SELECT CONCAT('✅ Added organization_id to ', tbl) as status;
    ELSE
      SELECT CONCAT('ℹ️  Table ', tbl, ' already has organization_id') as status;
    END IF;
  ELSE
    SELECT CONCAT('⚠️  Table ', tbl, ' does not exist - skipping') as status;
  END IF;
END$$
DELIMITER ;

-- Apply to each table
CALL safe_add_org_column('users', 'organization_id INT NULL, current_organization_id INT NULL');
CALL safe_add_org_column('achievements', 'organization_id INT NULL');
CALL safe_add_org_column('rewards', 'organization_id INT NULL');
CALL safe_add_org_column('tasks', 'organization_id INT NULL');
CALL safe_add_org_column('teams', 'organization_id INT NULL');
CALL safe_add_org_column('organization_departments', 'organization_id INT NULL');
CALL safe_add_org_column('user_badges', 'organization_id INT NULL');
CALL safe_add_org_column('user_rewards', 'organization_id INT NULL');
CALL safe_add_org_column('user_achievements', 'organization_id INT NULL');
CALL safe_add_org_column('organization_invitations', 'organization_id INT NULL');
CALL safe_add_org_column('daily_checkins', 'organization_id INT NULL');
CALL safe_add_org_column('user_gems', 'organization_id INT NULL');
CALL safe_add_org_column('user_medals', 'organization_id INT NULL');
CALL safe_add_org_column('diagnostic_answers', 'organization_id INT NULL');
CALL safe_add_org_column('gems_history', 'organization_id INT NULL');

-- Create indexes (safe - won't error if already exists)
DROP PROCEDURE IF EXISTS create_index_if_missing;
DELIMITER $$
CREATE PROCEDURE create_index_if_missing(IN tbl VARCHAR(64), IN idxname VARCHAR(64), IN cols VARCHAR(255))
BEGIN
  DECLARE table_exists INT DEFAULT 0;
  DECLARE idx_exists INT DEFAULT 0;
  
  -- Check if table exists
  SELECT COUNT(*) INTO table_exists 
  FROM INFORMATION_SCHEMA.TABLES 
  WHERE TABLE_SCHEMA = @schema AND TABLE_NAME = tbl;
  
  IF table_exists > 0 THEN
    -- Check if index exists
    SELECT COUNT(*) INTO idx_exists 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = @schema 
      AND TABLE_NAME = tbl 
      AND INDEX_NAME = idxname;
      
    IF idx_exists = 0 THEN
      SET @s = CONCAT('CREATE INDEX ', idxname, ' ON ', tbl, '(', cols, ')');
      PREPARE st FROM @s;
      EXECUTE st;
      DEALLOCATE PREPARE st;
      SELECT CONCAT('✅ Created index ', idxname, ' on ', tbl) as status;
    ELSE
      SELECT CONCAT('ℹ️  Index ', idxname, ' already exists on ', tbl) as status;
    END IF;
  END IF;
END$$
DELIMITER ;

CALL create_index_if_missing('users', 'idx_users_org', 'organization_id');
CALL create_index_if_missing('achievements', 'idx_achievements_org', 'organization_id');
CALL create_index_if_missing('rewards', 'idx_rewards_org', 'organization_id');
CALL create_index_if_missing('tasks', 'idx_tasks_org', 'organization_id');
CALL create_index_if_missing('organization_departments', 'idx_org_depts_org', 'organization_id');
CALL create_index_if_missing('user_badges', 'idx_user_badges_org', 'organization_id');
CALL create_index_if_missing('user_rewards', 'idx_user_rewards_org', 'organization_id');
CALL create_index_if_missing('user_achievements', 'idx_user_achievements_org', 'organization_id');

-- Clean up helpers
DROP PROCEDURE IF EXISTS safe_add_org_column;
DROP PROCEDURE IF EXISTS create_index_if_missing;

-- Final status
SELECT '🎉 Migration completed successfully' as final_status;
