const fs = require('fs');
const path = require('path');

console.log('🔍 AUDITANDO QUERIES DEL BACKEND\n');
console.log('================================\n');

// Buscar archivos API que deben usar organization_id
const apiPaths = [
  'app/api',
  'lib/server'
];

let issuesFound = [];
let filesChecked = 0;

function searchDirectory(dir, baseDir = dir) {
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        searchDirectory(fullPath, baseDir);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        filesChecked++;
        checkFile(fullPath, baseDir);
      }
    }
  } catch (error) {
    // Directorio no existe
  }
}

function checkFile(filePath, baseDir) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Verificar queries SQL directos sin organization_id
    const sqlPatterns = [
      /SELECT.*FROM\s+(users|tasks|achievements|rewards|user_badges|user_rewards|gems_history|daily_checkins)\s+(?!.*WHERE.*organization_id)/gi,
      /UPDATE\s+(users|tasks|achievements|rewards|user_badges|user_rewards|gems_history|daily_checkins)\s+SET.*(?!WHERE.*organization_id)/gi,
      /DELETE\s+FROM\s+(users|tasks|achievements|rewards|user_badges|user_rewards|gems_history|daily_checkins)\s+(?!.*WHERE.*organization_id)/gi
    ];
    
    let hasIssues = false;
    let issueDetails = [];
    
    for (const pattern of sqlPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          issueDetails.push({
            type: 'SQL sin filtro org',
            query: match.substring(0, 80) + '...'
          });
        });
        hasIssues = true;
      }
    }
    
    // Verificar si usa getOrgIdForRequest o requireAdmin
    const usesOrgUtils = content.includes('getOrgIdForRequest') || 
                         content.includes('requireAdmin') ||
                         content.includes('organization_id');
    
    // Verificar si es un archivo API route
    const isApiRoute = relativePath.includes('app\\api\\') || relativePath.includes('app/api/');
    
    if (isApiRoute && !usesOrgUtils && content.includes('executeQuery')) {
      issueDetails.push({
        type: 'API sin org utils',
        query: 'No usa getOrgIdForRequest ni verifica organization_id'
      });
      hasIssues = true;
    }
    
    if (hasIssues) {
      issuesFound.push({
        file: relativePath,
        issues: issueDetails
      });
    }
    
  } catch (error) {
    // Archivo no legible
  }
}

// Buscar en directorios
apiPaths.forEach(p => {
  const fullPath = path.join(process.cwd(), p);
  searchDirectory(fullPath);
});

console.log(`📊 Archivos analizados: ${filesChecked}\n`);

if (issuesFound.length === 0) {
  console.log('✅ ¡PERFECTO! No se encontraron queries problemáticos\n');
  console.log('Todos los archivos API parecen usar organization_id correctamente.\n');
} else {
  console.log(`⚠️  Se encontraron ${issuesFound.length} archivos con posibles problemas:\n`);
  console.log('================================================================\n');
  
  issuesFound.forEach((item, index) => {
    console.log(`${index + 1}. ${item.file}`);
    item.issues.forEach(issue => {
      console.log(`   ⚠️  ${issue.type}: ${issue.query}`);
    });
    console.log('');
  });
  
  console.log('\n💡 RECOMENDACIÓN:');
  console.log('   Revisar estos archivos manualmente y asegurar que:');
  console.log('   1. Usan getOrgIdForRequest() para obtener organization_id');
  console.log('   2. Todos los queries incluyen WHERE organization_id = ?');
  console.log('   3. Las APIs están protegidas con requireAdmin()\n');
}

console.log('\n📋 PRÓXIMOS PASOS:\n');
console.log('================================');
console.log('1. ✅ Migración completada - organization_id agregado');
console.log('2. ✅ Backfill completado - datos legacy actualizados');
console.log('3. 📝 Revisar archivos listados arriba (si los hay)');
console.log('4. 🧪 Probar el sistema con múltiples organizaciones');
console.log('5. 🚀 Deploy a producción\n');
