/*
Batched backfill script to populate organization_id columns safely.
Usage (PowerShell):
  $env:DB_HOST='host'; $env:DB_USER='user'; $env:DB_PASSWORD='pw'; $env:DB_NAME='db'; node .\scripts\backfill\001-backfill-organization-id.js

This script runs in staging/production cautiously: it processes tables in batches and logs progress.
It attempts to infer organization_id using these rules (in order):
  - For rows that reference a user_id, use that user's current_organization_id or user_organizations primary org.
  - For rows that reference a resource (reward_id, achievement_id), use the resource's organization_id.
  - For users table, set organization_id from user_organizations (primary) or current_organization_id.

Always run on a copy/staging DB first and review affected rows. The script supports DRY_RUN mode.
*/

const mysql = require('mysql2/promise');

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '500', 10);
const DRY_RUN = process.env.DRY_RUN === '1' || false;

async function withDb(fn) {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'test'
  });
  try {
    await fn(conn);
  } finally {
    await conn.end();
  }
}

async function fetchIds(conn, table, idCol='id') {
  const [rows] = await conn.execute(
    `SELECT ${idCol} FROM ${table} WHERE organization_id IS NULL LIMIT ?`,
    [BATCH_SIZE]
  );
  return rows.map(r => r[idCol]);
}

async function updateByIds(conn, table, ids, setClause, params) {
  if (ids.length === 0) return 0;
  const placeholders = ids.map(()=>'?').join(',');
  const sql = `UPDATE ${table} SET ${setClause} WHERE id IN (${placeholders})`;
  if (DRY_RUN) {
    console.log('[DRY_RUN] Would run:', sql, 'params:', [...params, ...ids]);
    return ids.length;
  }
  const [res] = await conn.execute(sql, [...params, ...ids]);
  return res.affectedRows || 0;
}

async function backfillUsers(conn) {
  console.log('\nBackfilling users.organization_id...');
  // Prefer user_organizations primary record if available
  // Update users in batches
  while (true) {
    const ids = await fetchIds(conn, 'users');
    if (!ids.length) break;
    // For each id, compute org via user_organizations or current_organization_id
    const [rows] = await conn.query(
      `SELECT u.id, COALESCE(u.current_organization_id, (SELECT organization_id FROM user_organizations uu WHERE uu.user_id = u.id AND uu.is_primary = 1 LIMIT 1)) as org
       FROM users u WHERE u.id IN (${ids.map(()=>'?').join(',')})`, ids
    );
    const updates = [];
    for (const r of rows) {
      if (r.org) updates.push({ id: r.id, org: r.org });
    }
    if (updates.length) {
      const setSql = 'organization_id = ?';
      const updateIds = updates.map(u=>u.id);
      const resCount = await updateByIds(conn, 'users', updateIds, setSql, []);
      console.log('Updated users:', resCount);
    } else {
      console.log('No inferred orgs for this batch of users, skipping.');
      break;
    }
  }
}

async function backfillTableFromUser(conn, table, userCol='user_id') {
  console.log(`\nBackfilling ${table}.organization_id from ${userCol} -> users`);
  while (true) {
    const ids = await fetchIds(conn, table);
    if (!ids.length) break;
    const [rows] = await conn.query(
      `SELECT t.id, COALESCE(u.current_organization_id, (SELECT organization_id FROM user_organizations uu WHERE uu.user_id = u.id AND uu.is_primary = 1 LIMIT 1)) as org
       FROM ${table} t JOIN users u ON u.id = t.${userCol} WHERE t.id IN (${ids.map(()=>'?').join(',')})`, ids
    );
    const updates = rows.filter(r => r.org).map(r => ({ id: r.id, org: r.org }));
    if (updates.length) {
      const updateIds = updates.map(u => u.id);
      const resCount = await updateByIds(conn, table, updateIds, 'organization_id = ?', []);
      console.log(`Updated ${table}:`, resCount);
    } else {
      console.log(`No inferred orgs for this batch of ${table}, skipping further batches.`);
      break;
    }
  }
}

async function backfillTableFromResource(conn, table, resourceCol, resourceTable) {
  console.log(`\nBackfilling ${table}.organization_id from ${resourceTable}`);
  while (true) {
    const ids = await fetchIds(conn, table);
    if (!ids.length) break;
    const [rows] = await conn.query(
      `SELECT t.id, r.organization_id as org FROM ${table} t JOIN ${resourceTable} r ON r.id = t.${resourceCol} WHERE t.id IN (${ids.map(()=>'?').join(',')})`, ids
    );
    const updates = rows.filter(r => r.org).map(r => ({ id: r.id, org: r.org }));
    if (updates.length) {
      const updateIds = updates.map(u => u.id);
      const resCount = await updateByIds(conn, table, updateIds, 'organization_id = ?', []);
      console.log(`Updated ${table}:`, resCount);
    } else {
      console.log(`No inferred orgs for this batch of ${table}, skipping further batches.`);
      break;
    }
  }
}

async function run() {
  await withDb(async (conn) => {
    // users
    await backfillUsers(conn);

    // user_badges, user_rewards, user_achievements: reference user_id
    await backfillTableFromUser(conn, 'user_badges', 'user_id');
    await backfillTableFromUser(conn, 'user_rewards', 'user_id');
    await backfillTableFromUser(conn, 'user_achievements', 'user_id');

    // tasks: reference assigned_to (user)
    await backfillTableFromUser(conn, 'tasks', 'assigned_to');

    // rewards: if organization_id missing, nothing to infer conservatively (admin should set), but try resources created_by
    await backfillTableFromResource(conn, 'rewards', 'id', 'rewards');

    // achievements: try using achievements table itself (no-op) or skip
    // organization_departments likely already has org

    console.log('\nBackfill complete.');
  });
}

run().catch(err => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
