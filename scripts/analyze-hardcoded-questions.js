const fs = require('fs');
const path = require('path');

function analyzeHardcodedQuestions() {
  console.log('🔍 ANÁLISIS COMPLETO DE PREGUNTAS HARDCODEADAS');
  console.log('=' .repeat(60));
  
  const files = [
    {
      path: 'lib/mega-diagnostic/etapa2-modulos-data.ts',
      name: 'Etapa 2 - Módulos de Diagnóstico'
    },
    {
      path: 'lib/mega-diagnostic/modulo0-data.ts', 
      name: 'Módulo 0 - BHAG y Propósito'
    },
    {
      path: 'lib/mega-diagnostic/etapa1-data.ts',
      name: 'Etapa 1 - Mapeo de Negocio'
    },
    {
      path: 'app/onboarding/diagnostico/page.tsx',
      name: 'Onboarding - Diagnóstico Inicial'
    },
    {
      path: 'lib/quiz-data.ts',
      name: 'Quiz General'
    }
  ];
  
  let totalFiles = 0;
  let totalQuestions = 0;
  let totalOptions = 0;
  
  for (const file of files) {
    const fullPath = path.join(process.cwd(), file.path);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ ${file.name}: Archivo no encontrado`);
      continue;
    }
    
    totalFiles++;
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Buscar diferentes patrones de preguntas
    const questionPatterns = [
      /pregunta\s*:\s*["']¿[^"']*["']/gi,
      /question\s*:\s*["']¿[^"']*["']/gi,
      /text\s*:\s*["']¿[^"']*["']/gi,
      /["']¿[^"']{20,}["']/g  // Cualquier string que empiece con ¿ y sea suficientemente largo
    ];
    
    const optionPatterns = [
      /opciones\s*:\s*\[/gi,
      /options\s*:\s*\[/gi,
      /text\s*:\s*["'][^¿][^"']{10,}["']/g  // Textos que no empiecen con ¿ (probables opciones)
    ];
    
    let fileQuestions = new Set();
    let fileOptions = new Set();
    
    for (const pattern of questionPatterns) {
      const matches = content.match(pattern) || [];
      matches.forEach(match => fileQuestions.add(match));
    }
    
    for (const pattern of optionPatterns) {
      const matches = content.match(pattern) || [];
      matches.forEach(match => fileOptions.add(match));
    }
    
    // Análisis específico por archivo
    let specificAnalysis = '';
    
    if (file.path.includes('etapa2-modulos-data.ts')) {
      const moduleMatches = content.match(/MÓDULO\s+\d+:/g) || [];
      const submoduleMatches = content.match(/Submódulo\s+\d+:/g) || [];
      specificAnalysis = `${moduleMatches.length} módulos, ${submoduleMatches.length} submódulos`;
    } else if (file.path.includes('modulo0-data.ts')) {
      const bhagMatches = content.match(/BHAG|propósito|motivación/gi) || [];
      specificAnalysis = `${bhagMatches.length} referencias BHAG/propósito`;
    } else if (file.path.includes('etapa1-data.ts')) {
      const businessMatches = content.match(/negocio|empresa|business/gi) || [];
      specificAnalysis = `${businessMatches.length} referencias de negocio`;
    } else if (file.path.includes('onboarding')) {
      const onboardingMatches = content.match(/useState|questions|steps/gi) || [];
      specificAnalysis = `${onboardingMatches.length} elementos de UI`;
    } else if (file.path.includes('quiz-data.ts')) {
      const quizMatches = content.match(/quiz|test|evaluación/gi) || [];
      specificAnalysis = `${quizMatches.length} referencias de quiz`;
    }
    
    console.log(`\n📄 ${file.name}`);
    console.log(`   📁 Archivo: ${file.path}`);
    console.log(`   📊 Preguntas encontradas: ${fileQuestions.size}`);
    console.log(`   📋 Opciones/arrays encontrados: ${fileOptions.size}`);
    console.log(`   🔍 Análisis específico: ${specificAnalysis}`);
    console.log(`   📏 Tamaño del archivo: ${Math.round(content.length / 1024)} KB`);
    
    if (fileQuestions.size > 5) {
      console.log(`   🚨 ALTA PRIORIDAD: Este archivo contiene muchas preguntas`);
      
      // Mostrar algunas preguntas de ejemplo
      const questions = Array.from(fileQuestions).slice(0, 3);
      console.log(`   📝 Ejemplos de preguntas:`);
      questions.forEach(q => {
        const clean = q.replace(/pregunta\s*:\s*["']/gi, '').replace(/["']/g, '').substring(0, 60);
        console.log(`      • ${clean}...`);
      });
    } else if (fileQuestions.size > 0) {
      console.log(`   🟡 PRIORIDAD MEDIA: Algunas preguntas encontradas`);
    } else {
      console.log(`   ✅ BAJA PRIORIDAD: Pocas o ninguna pregunta`);
    }
    
    totalQuestions += fileQuestions.size;
    totalOptions += fileOptions.size;
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RESUMEN GENERAL:');
  console.log(`   📁 Archivos analizados: ${totalFiles}`);
  console.log(`   📝 Total preguntas estimadas: ${totalQuestions}`);
  console.log(`   📋 Total opciones/arrays estimados: ${totalOptions}`);
  
  console.log('\n🎯 PLAN DE MIGRACIÓN RECOMENDADO:');
  console.log('   1. 🚨 PRIORIDAD ALTA: etapa2-modulos-data.ts (53+ preguntas detalladas)');
  console.log('   2. 🟡 PRIORIDAD MEDIA: modulo0-data.ts (BHAG y propósito)');
  console.log('   3. 🟡 PRIORIDAD MEDIA: etapa1-data.ts (mapeo de negocio)');
  console.log('   4. 🔍 REVISAR: onboarding/diagnostico/page.tsx (UI components)');
  console.log('   5. 🔍 REVISAR: quiz-data.ts (quiz general)');
  
  console.log('\n✅ SIGUIENTE PASO: Ejecutar migración de etapa2-modulos-data.ts');
}

analyzeHardcodedQuestions();
