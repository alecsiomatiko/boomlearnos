/*
Simple smoke test for admin endpoints.
Usage (PowerShell):
  $env:JWT_SECRET='your_jwt_secret'; $env:ADMIN_JWT='ey...'; node .\scripts\smoke-admin-test.js

This script sends GET requests to /api/admin/stats and /api/admin/users using ADMIN_JWT as Bearer token.
It expects your dev server to be running at http://localhost:3000. Adjust BASE_URL if needed.
*/

const fetch = require('node-fetch')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const token = process.env.ADMIN_JWT
if (!token) {
  console.error('Please set ADMIN_JWT env var with a valid admin JWT.');
  process.exit(2)
}

async function call(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  const text = await res.text()
  console.log(path, '=>', res.status)
  try { console.log(JSON.stringify(JSON.parse(text), null, 2)) } catch(e) { console.log(text) }
}

;(async () => {
  await call('/api/admin/stats')
  await call('/api/admin/users')
})().catch(err => { console.error(err); process.exit(1) })
