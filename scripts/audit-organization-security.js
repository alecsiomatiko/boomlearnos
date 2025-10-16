require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🔍 AUDITANDO SEGURIDAD MULTI-TENANT\n');
console.log('=====================================\n');

const criticalApis = [
  { path: 'app/api/tasks/route.ts', table: 'tasks', critical: true },
  { path: 'app/api/achievements/route.ts', table: 'achievements', critical: true },
  { path: 'app/api/rewards/route.ts', table: 'rewards', critical: true },
  { path: 'app/api/badges/route.ts', table: 'user_badges', critical: true },
  { path: 'app/api/checkin/route.ts', table: 'daily_checkins', critical: true },
  { path: 'app/api/gems/route.ts', table: 'gems_history', critical: true },
  { path: 'app/api/admin/tasks/route.ts', table: 'tasks', critical: true },
  { path: 'app/api/admin/achievements/route.ts', table: 'achievements', critical: true },
  { path: 'app/api/admin/rewards/route.ts', table: 'rewards', critical: true },
  { path: 'app/api/admin/users/route.ts', table: 'users', critical: true },
  { path: 'app/api/admin/invites/route.ts', table: 'organization_invitations', critical: true },
];

const results = {
  secure: [],
  vulnerable: [],
  missing: []
};

for (const api of criticalApis) {
  const fullPath = path.join(process.cwd(), api.path);
  
  if (!fs.existsSync(fullPath)) {
    results.missing.push(api);
    continue;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Verificar si usa getOrgIdForRequest
  const hasOrgCheck = content.includes('getOrgIdForRequest');
  
  // Verificar si filtra por organization_id en queries
  const hasOrgFilter = content.includes('organization_id = ?') || 
                       content.includes('WHERE organization_id') ||
                       content.includes('AND organization_id');
  
  // Verificar si usa requireAdmin o getCurrentUser
  const hasAuth = content.includes('requireAdmin') || 
                  content.includes('getCurrentUser');

  if (hasOrgCheck && hasOrgFilter) {
    results.secure.push({ ...api, hasAuth });
  } else {
    results.vulnerable.push({ 
      ...api, 
      hasOrgCheck, 
      hasOrgFilter, 
      hasAuth,
      reason: !hasOrgCheck ? 'No usa getOrgIdForRequest' : 'No filtra por organization_id'
    });
  }
}

console.log('✅ APIs SEGURAS:\n');
results.secure.forEach(api => {
  console.log(`   ${api.path}`);
  console.log(`      Table: ${api.table} | Auth: ${api.hasAuth ? 'Sí' : 'No'}`);
});

console.log('\n❌ APIs VULNERABLES:\n');
results.vulnerable.forEach(api => {
  console.log(`   ${api.path}`);
  console.log(`      Table: ${api.table}`);
  console.log(`      Razón: ${api.reason}`);
  console.log(`      OrgCheck: ${api.hasOrgCheck ? '✓' : '✗'} | OrgFilter: ${api.hasOrgFilter ? '✓' : '✗'} | Auth: ${api.hasAuth ? '✓' : '✗'}`);
  console.log('');
});

console.log('\n⚠️  ARCHIVOS FALTANTES:\n');
results.missing.forEach(api => {
  console.log(`   ${api.path}`);
});

console.log('\n📊 RESUMEN:\n');
console.log(`   Seguras: ${results.secure.length}`);
console.log(`   Vulnerables: ${results.vulnerable.length}`);
console.log(`   Faltantes: ${results.missing.length}`);

if (results.vulnerable.length > 0) {
  console.log('\n🚨 ACCIÓN REQUERIDA:');
  console.log('   Las APIs vulnerables NO filtran por organization_id');
  console.log('   Esto permite que un admin vea datos de otra organización');
  console.log('\n   Solución: Agregar getOrgIdForRequest() y WHERE organization_id = ?');
}

process.exit(results.vulnerable.length > 0 ? 1 : 0);
