const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// Cargar variables de entorno
function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      if (key && value) process.env[key] = value;
    }
  });
}

loadEnv();

async function checkDatabaseState() {
  console.log('🔍 VERIFICANDO ESTADO DE BASE DE DATOS DESPUÉS DE MIGRACIÓN');
  console.log('=' .repeat(60));
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    console.log('✅ Conectado a MySQL');
    
    // 1. Verificar módulos
    console.log('\n📋 MÓDULOS EN LA BASE DE DATOS:');
    const [modules] = await connection.execute(`
      SELECT id, module_code, title, order_index 
      FROM diagnostic_modules 
      ORDER BY order_index
    `);
    
    modules.forEach((module, index) => {
      console.log(`   ${index + 1}. ID: ${module.id} | Código: ${module.module_code} | Título: ${module.title}`);
    });
    
    // 2. Verificar submódulos y preguntas por módulo
    console.log('\n📊 PREGUNTAS POR MÓDULO:');
    for (const module of modules) {
      const [questionCount] = await connection.execute(`
        SELECT COUNT(q.id) as question_count
        FROM diagnostic_questions q
        JOIN diagnostic_submodules s ON q.submodule_id = s.id
        WHERE s.module_id = ?
      `, [module.id]);
      
      console.log(`   📁 ${module.title}: ${questionCount[0].question_count} preguntas`);
      
      if (questionCount[0].question_count > 0) {
        // Mostrar algunas preguntas de ejemplo
        const [sampleQuestions] = await connection.execute(`
          SELECT q.question_text
          FROM diagnostic_questions q
          JOIN diagnostic_submodules s ON q.submodule_id = s.id
          WHERE s.module_id = ?
          LIMIT 2
        `, [module.id]);
        
        sampleQuestions.forEach(q => {
          console.log(`      • ${q.question_text.substring(0, 50)}...`);
        });
      }
    }
    
    // 3. Totales
    const [totalQuestions] = await connection.execute('SELECT COUNT(*) as count FROM diagnostic_questions');
    const [totalOptions] = await connection.execute('SELECT COUNT(*) as count FROM diagnostic_options');
    
    console.log('\n📈 TOTALES:');
    console.log(`   • Módulos: ${modules.length}`);
    console.log(`   • Preguntas: ${totalQuestions[0].count}`);
    console.log(`   • Opciones: ${totalOptions[0].count}`);
    
    // 4. Verificar primer módulo con preguntas
    const [firstModuleWithQuestions] = await connection.execute(`
      SELECT m.id, m.title, COUNT(q.id) as question_count
      FROM diagnostic_modules m
      JOIN diagnostic_submodules s ON s.module_id = m.id
      JOIN diagnostic_questions q ON q.submodule_id = s.id
      GROUP BY m.id, m.title
      ORDER BY question_count DESC
      LIMIT 1
    `);
    
    if (firstModuleWithQuestions.length > 0) {
      console.log('\n🎯 MÓDULO RECOMENDADO PARA PRUEBAS:');
      console.log(`   ID: ${firstModuleWithQuestions[0].id}`);
      console.log(`   Título: ${firstModuleWithQuestions[0].title}`);
      console.log(`   Preguntas: ${firstModuleWithQuestions[0].question_count}`);
      console.log(`   URL de prueba: http://localhost:3000/api/diagnostic/questions?moduleId=${firstModuleWithQuestions[0].id}`);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDatabaseState();
