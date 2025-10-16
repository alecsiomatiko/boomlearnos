-- 002-backfill-organization-id.sql
-- Idempotent backfill SQL to populate organization_id columns using conservative rules.
-- IMPORTANT: Run on a backup/staging first. This script updates rows in place in small batches.
-- MySQL does not have a built-in LIMIT for UPDATE with JOIN in a portable way across versions,
-- so we use a primary-key based batching approach when possible.

SET @schema = DATABASE();

-- Safety: ensure we run only if organization_id column exists
-- 1) Backfill users.organization_id from user_organizations (primary) or current_organization_id

-- Update users in batches using primary key ranges
-- Assumes users.id is numeric primary key
-- Set BATCH_SIZE as needed
SET @batch_size = 500;
SET @min_id = (SELECT COALESCE(MIN(id), 0) FROM users WHERE organization_id IS NULL);
SET @max_id = (SELECT COALESCE(MAX(id), 0) FROM users WHERE organization_id IS NULL);

SELECT CONCAT('Backfilling users from id ', @min_id, ' to ', @max_id) as info;

WHILE @min_id > 0 DO
  SET @upper = @min_id + @batch_size - 1;
  UPDATE users u
  LEFT JOIN (
    SELECT user_id, organization_id FROM user_organizations WHERE is_primary = 1
  ) uu ON uu.user_id = u.id
  SET u.organization_id = COALESCE(u.current_organization_id, uu.organization_id)
  WHERE u.id BETWEEN @min_id AND @upper AND (u.organization_id IS NULL OR u.organization_id = 0)
  ;
  SET @min_id = (SELECT COALESCE(MIN(id), 0) FROM users WHERE organization_id IS NULL AND id > @upper);
END WHILE;

-- 2) Backfill user_badges, user_rewards, user_achievements from users
-- These tables have user_id column

-- user_badges
UPDATE user_badges ub
JOIN users u ON u.id = ub.user_id
SET ub.organization_id = u.organization_id
WHERE ub.organization_id IS NULL;

-- user_rewards
UPDATE user_rewards ur
JOIN users u ON u.id = ur.user_id
SET ur.organization_id = u.organization_id
WHERE ur.organization_id IS NULL;

-- user_achievements
UPDATE user_achievements ua
JOIN users u ON u.id = ua.user_id
SET ua.organization_id = u.organization_id
WHERE ua.organization_id IS NULL;

-- 3) Backfill tasks from assigned_to (user)
UPDATE tasks t
JOIN users u ON u.id = t.assigned_to
SET t.organization_id = u.organization_id
WHERE t.organization_id IS NULL AND t.assigned_to IS NOT NULL;

-- 4) Backfill rewards: if rewards.organization_id is NULL, try to use a creator or owner field if exists (conservative)
-- If your rewards table has 'created_by' or 'owner_id', adjust accordingly. Otherwise leave NULL for manual review.
-- Example if created_by exists:
-- UPDATE rewards r JOIN users u ON u.id = r.created_by SET r.organization_id = u.organization_id WHERE r.organization_id IS NULL;

-- 5) organization_invitations: if department_id exists, inherit department.organization_id
UPDATE organization_invitations i
JOIN organization_departments d ON d.id = i.department_id
SET i.organization_id = d.organization_id
WHERE i.organization_id IS NULL AND i.department_id IS NOT NULL;

-- 6) For any remaining tables where organization can be inferred from a resource join (e.g., user_rewards -> rewards), do conservative joins
UPDATE user_rewards ur
JOIN rewards r ON r.id = ur.reward_id
SET ur.organization_id = r.organization_id
WHERE ur.organization_id IS NULL AND r.organization_id IS NOT NULL;

-- Final reporting: rows left with NULL organization_id
SELECT 'Remaining NULLs' as note;
SELECT 'users' as table_name, COUNT(*) as nulls FROM users WHERE organization_id IS NULL
UNION ALL
SELECT 'rewards', COUNT(*) FROM rewards WHERE organization_id IS NULL
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks WHERE organization_id IS NULL
UNION ALL
SELECT 'user_rewards', COUNT(*) FROM user_rewards WHERE organization_id IS NULL
UNION ALL
SELECT 'user_badges', COUNT(*) FROM user_badges WHERE organization_id IS NULL
UNION ALL
SELECT 'user_achievements', COUNT(*) FROM user_achievements WHERE organization_id IS NULL
UNION ALL
SELECT 'organization_invitations', COUNT(*) FROM organization_invitations WHERE organization_id IS NULL;

SELECT 'Backfill script complete' as status;
