-- 003-finalize-constraints.sql
-- After you ran the backfill and validated that organization_id is populated correctly,
-- run this script to add NOT NULL constraints and optionally foreign keys.
-- WARNING: do NOT run until you validated backfill in staging and have a DB backup.

SET @schema = DATABASE();

-- Example: make users.organization_id NOT NULL and add FK (adjust constraint names as needed)
ALTER TABLE users
  MODIFY COLUMN organization_id INT NOT NULL;

ALTER TABLE organization_departments
  MODIFY COLUMN organization_id INT NOT NULL;

ALTER TABLE teams
  MODIFY COLUMN organization_id INT NOT NULL;

ALTER TABLE achievements
  MODIFY COLUMN organization_id INT NOT NULL;

ALTER TABLE rewards
  MODIFY COLUMN organization_id INT NOT NULL;

ALTER TABLE tasks
  MODIFY COLUMN organization_id INT NOT NULL;

ALTER TABLE user_badges
  MODIFY COLUMN organization_id INT NOT NULL;

ALTER TABLE user_rewards
  MODIFY COLUMN organization_id INT NOT NULL;

ALTER TABLE user_achievements
  MODIFY COLUMN organization_id INT NOT NULL;

ALTER TABLE organization_invitations
  MODIFY COLUMN organization_id INT NOT NULL;

-- Add foreign keys (optional). To add FK you must ensure referenced organization table exists and rows exist.
-- Example assumes a table `organizations(id)` exists.
-- Uncomment and adjust if you have an organizations table and want FK enforcement.

-- ALTER TABLE users ADD CONSTRAINT fk_users_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
-- ALTER TABLE organization_departments ADD CONSTRAINT fk_depts_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
-- ALTER TABLE teams ADD CONSTRAINT fk_teams_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
-- ALTER TABLE achievements ADD CONSTRAINT fk_achievements_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
-- ALTER TABLE rewards ADD CONSTRAINT fk_rewards_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- Create or ensure indexes (idempotent behavior is not trivial here; create index only if not exists)
CREATE INDEX idx_users_organization_id ON users (organization_id);
CREATE INDEX idx_achievements_organization_id ON achievements (organization_id);
CREATE INDEX idx_rewards_organization_id ON rewards (organization_id);
CREATE INDEX idx_tasks_organization_id ON tasks (organization_id);
CREATE INDEX idx_user_rewards_organization_id ON user_rewards (organization_id);

SELECT 'Finalize constraints complete' as status;
