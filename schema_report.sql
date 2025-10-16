/* 1) Columnas relevantes por tabla */
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('users','achievements','rewards','tasks','teams','organization_departments','user_badges','user_rewards','user_achievements','organization_invitations')
  AND COLUMN_NAME IN ('organization_id','current_organization_id','created_by','assigned_to','user_id','owner_id');

/* 2) SHOW CREATE TABLE (sólo si existen) */
SHOW TABLES LIKE 'users';
SHOW CREATE TABLE users;
SHOW TABLES LIKE 'achievements';
SHOW CREATE TABLE achievements;
SHOW TABLES LIKE 'rewards';
SHOW CREATE TABLE rewards;
SHOW TABLES LIKE 'tasks';
SHOW CREATE TABLE tasks;
SHOW TABLES LIKE 'user_badges';
SHOW CREATE TABLE user_badges;
SHOW TABLES LIKE 'user_rewards';
SHOW CREATE TABLE user_rewards;
SHOW TABLES LIKE 'user_achievements';
SHOW CREATE TABLE user_achievements;
SHOW TABLES LIKE 'organization_departments';
SHOW CREATE TABLE organization_departments;
SHOW TABLES LIKE 'organization_invitations';
SHOW CREATE TABLE organization_invitations;

/* 3) Conteos y NULLs (cuánto hay pendiente) */
SELECT 'users_total' as metric, COUNT(*) as value FROM users;
SELECT 'users_org_null' as metric, COUNT(*) as value FROM users WHERE (organization_id IS NULL OR organization_id = 0);
SELECT 'achievements_total', COUNT(*) FROM achievements;
SELECT 'achievements_org_null', COUNT(*) FROM achievements WHERE (organization_id IS NULL OR organization_id = 0);
SELECT 'rewards_total', COUNT(*) FROM rewards;
SELECT 'rewards_org_null', COUNT(*) FROM rewards WHERE (organization_id IS NULL OR organization_id = 0);
SELECT 'tasks_total', COUNT(*) FROM tasks;
SELECT 'tasks_org_null', COUNT(*) FROM tasks WHERE (organization_id IS NULL OR organization_id = 0);
SELECT 'user_rewards_total', COUNT(*) FROM user_rewards;
SELECT 'user_rewards_org_null', COUNT(*) FROM user_rewards WHERE (organization_id IS NULL OR organization_id = 0);
SELECT 'user_badges_total', COUNT(*) FROM user_badges;
SELECT 'user_badges_org_null', COUNT(*) FROM user_badges WHERE (organization_id IS NULL OR organization_id = 0);
SELECT 'user_achievements_total', COUNT(*) FROM user_achievements;
SELECT 'user_achievements_org_null', COUNT(*) FROM user_achievements WHERE (organization_id IS NULL OR organization_id = 0);
SELECT 'organization_invitations_total', COUNT(*) FROM organization_invitations;
SELECT 'organization_invitations_org_null', COUNT(*) FROM organization_invitations WHERE (organization_id IS NULL OR organization_id = 0);
