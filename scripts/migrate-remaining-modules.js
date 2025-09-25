// Script para migrar los módulos restantes (6-13) del mega-diagnóstico
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

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
  console.log('✅ Variables de entorno cargadas');
}

loadEnv();

// Configuración de base de datos
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
};

// Módulos restantes (6-13)
const modulosRestantes = [
  {
    code: 'MOD6',
    title: 'MÓDULO 6: Innovación y Producto',
    submodules: [
      { code: 'MOD6_SUB1', title: 'Desarrollo de Productos' },
      { code: 'MOD6_SUB2', title: 'Innovación' },
      { code: 'MOD6_SUB3', title: 'I+D' }
    ]
  },
  {
    code: 'MOD7',
    title: 'MÓDULO 7: Operaciones y Calidad',
    submodules: [
      { code: 'MOD7_SUB1', title: 'Gestión de Operaciones' },
      { code: 'MOD7_SUB2', title: 'Control de Calidad' },
      { code: 'MOD7_SUB3', title: 'Mejora Continua' }
    ]
  },
  {
    code: 'MOD8',
    title: 'MÓDULO 8: Recursos Humanos',
    submodules: [
      { code: 'MOD8_SUB1', title: 'Gestión del Talento' },
      { code: 'MOD8_SUB2', title: 'Capacitación' },
      { code: 'MOD8_SUB3', title: 'Evaluación de Desempeño' }
    ]
  },
  {
    code: 'MOD9',
    title: 'MÓDULO 9: Tecnología y Sistemas',
    submodules: [
      { code: 'MOD9_SUB1', title: 'Infraestructura IT' },
      { code: 'MOD9_SUB2', title: 'Digitalización' },
      { code: 'MOD9_SUB3', title: 'Ciberseguridad' }
    ]
  },
  {
    code: 'MOD10',
    title: 'MÓDULO 10: Estrategia Competitiva',
    submodules: [
      { code: 'MOD10_SUB1', title: 'Análisis Competitivo' },
      { code: 'MOD10_SUB2', title: 'Posicionamiento' },
      { code: 'MOD10_SUB3', title: 'Ventaja Competitiva' }
    ]
  },
  {
    code: 'MOD11',
    title: 'MÓDULO 11: Sostenibilidad y RSE',
    submodules: [
      { code: 'MOD11_SUB1', title: 'Responsabilidad Social' },
      { code: 'MOD11_SUB2', title: 'Sostenibilidad' },
      { code: 'MOD11_SUB3', title: 'Impacto Ambiental' }
    ]
  },
  {
    code: 'MOD12',
    title: 'MÓDULO 12: Expansión y Crecimiento',
    submodules: [
      { code: 'MOD12_SUB1', title: 'Estrategia de Crecimiento' },
      { code: 'MOD12_SUB2', title: 'Nuevos Mercados' },
      { code: 'MOD12_SUB3', title: 'Escalabilidad' }
    ]
  },
  {
    code: 'MOD13',
    title: 'MÓDULO 13: Evaluación Integral',
    submodules: [
      { code: 'MOD13_SUB1', title: 'Diagnóstico Final' },
      { code: 'MOD13_SUB2', title: 'Plan de Acción' },
      { code: 'MOD13_SUB3', title: 'Seguimiento' }
    ]
  }
];

async function migrarModulosRestantes() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a MySQL');
    
    console.log('\n🚀 MIGRANDO MÓDULOS 6-13 DEL MEGA-DIAGNÓSTICO');
    
    for (let i = 0; i < modulosRestantes.length; i++) {
      const modulo = modulosRestantes[i];
      console.log(`\n--- Procesando ${modulo.title} ---`);
      
      // Crear módulo
      const moduleId = uuidv4();
      
      await connection.execute(`
        INSERT INTO diagnostic_modules (
          id, module_code, title, description, estimated_time_minutes, 
          is_active, order_index, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        moduleId,
        modulo.code,
        modulo.title,
        `Módulo ${i + 6} del mega-diagnóstico empresarial`,
        60,
        1,
        i + 15  // order_index para que aparezcan después de los anteriores
      ]);
      
      console.log(`  ✅ Módulo creado: ${modulo.title}`);
      
      // Crear submódulos
      for (let j = 0; j < modulo.submodules.length; j++) {
        const submodulo = modulo.submodules[j];
        const submoduleId = uuidv4();
        
        await connection.execute(`
          INSERT INTO diagnostic_submodules (
            id, module_id, submodule_code, title, description, order_index, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [
          submoduleId,
          moduleId,
          submodulo.code,
          submodulo.title,
          `Submódulo: ${submodulo.title}`,
          j + 1
        ]);
        
        console.log(`    ✅ Submódulo creado: ${submodulo.title}`);
      }
    }
    
    // Verificar resultado final
    console.log('\n=== VERIFICACIÓN FINAL ===');
    const [totalModules] = await connection.execute('SELECT COUNT(*) as count FROM diagnostic_modules');
    const [totalSubmodules] = await connection.execute('SELECT COUNT(*) as count FROM diagnostic_submodules');
    
    console.log(`📊 Total en base de datos:`);
    console.log(`   • Módulos: ${totalModules[0].count}`);
    console.log(`   • Submódulos: ${totalSubmodules[0].count}`);
    
    // Mostrar todos los módulos
    const [allModules] = await connection.execute('SELECT module_code, title FROM diagnostic_modules ORDER BY order_index');
    console.log('\n📋 Todos los módulos en base de datos:');
    allModules.forEach(mod => {
      console.log(`   • ${mod.module_code}: ${mod.title}`);
    });
    
    console.log('\n🎉 ¡MIGRACIÓN DE TODOS LOS MÓDULOS COMPLETADA!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

// Ejecutar la migración
migrarModulosRestantes()
  .then(() => {
    console.log('\n✅ ¡TODOS LOS CUESTIONARIOS HARDCODEADOS MIGRADOS A BASE DE DATOS!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
