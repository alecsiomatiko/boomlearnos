Migration & Backfill Plan

Goal
----
Add `organization_id` to tables missing it and populate values safely so all admin APIs can be simplified to rely on server-side org scoping.

Principles
----------
- Idempotent: running the migration multiple times should not change results or fail.
- Safe: perform in staging first, run in small batches, and provide DRY_RUN mode.
- Auditable: log affected rows and provide validation queries.
- Reversible: provide a rollback plan (backups and snapshots) before running in prod.

High-level steps
-----------------
1. Run the DDL migration to add `organization_id` columns (safe, idempotent). File: `scripts/migrations/001-add-organization-id-columns.sql`.
2. Run the backfill script in DRY_RUN to inspect the rows it would affect.
   - `DRY_RUN=1 DB_HOST=... DB_USER=... DB_PASSWORD=... DB_NAME=... node .\scripts\backfill\001-backfill-organization-id.js`
3. Review logs and spot-check rows in staging.
4. Run backfill without DRY_RUN. Monitor and validate.
5. Once backfill validated, add NOT NULL constraints and foreign keys (if desired) in a small migration with checks.

Backfill strategy
------------------
- Users: populate `users.organization_id` from `user_organizations` primary record, or from `users.current_organization_id` if available.
- Rows referencing a `user_id`: use that user's organization.
- Rows referencing a resource (reward_id, achievement_id): use the resource's organization_id when present.
- If an organization cannot be inferred, do NOT assign a default org; log these rows for manual review.

Batching & performance
----------------------
- Backfill script uses batch size (default 500). Adjust using `BATCH_SIZE` env var.
- Run during low-traffic windows for production. For large tables, increase batch size in staging until acceptable.

Validation queries (after backfill)
-----------------------------------
-- Find rows still missing organization_id
SELECT COUNT(*) FROM tasks WHERE organization_id IS NULL;
SELECT COUNT(*) FROM rewards WHERE organization_id IS NULL;
SELECT COUNT(*) FROM user_rewards WHERE organization_id IS NULL;

-- Spot check an example row and linked user/org
SELECT t.*, u.id as user_id, u.current_organization_id FROM tasks t JOIN users u ON u.id = t.assigned_to WHERE t.organization_id IS NULL LIMIT 10;

Rollback plan
-------------
1. Always take a DB backup/snapshot before running in prod.
2. If incorrect updates occur, you can restore from backup or run targeted UPDATEs using the backup mapping.
3. As an emergency measure, set `DRY_RUN=1` and re-evaluate before re-running without DRY_RUN.

Runbook (PowerShell)
---------------------
# Run migration DDL
mysql -u DB_USER -p -h DB_HOST DB_NAME < .\scripts\migrations\001-add-organization-id-columns.sql

# Dry-run backfill
$env:DRY_RUN=1; $env:DB_HOST='...'; $env:DB_USER='...'; $env:DB_PASSWORD='...'; $env:DB_NAME='...'; node .\scripts\backfill\001-backfill-organization-id.js

# Real backfill
$env:DRY_RUN=0; $env:DB_HOST='...'; $env:DB_USER='...'; $env:DB_PASSWORD='...'; $env:DB_NAME='...'; node .\scripts\backfill\001-backfill-organization-id.js

Post-migration cleanup
-----------------------
- After validating backfill, consider adding NOT NULL and FK constraints on critical tables.
- Remove INFORMATION_SCHEMA-based fallbacks in the app code and simplify queries to always use `organization_id`.

Contact
-------
If you'd like, I can:
- Add more tables to the migration/backfill set.
- Produce a one-off mapping report (rows that couldn't be inferred) for manual review.
- Convert the backfill script to a more robust job with retries and progress checkpoints.
