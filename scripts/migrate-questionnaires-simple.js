// Cargar variables de entorno desde .env.local
const fs = require('fs');
const path = require('path');

// Función para cargar variables de entorno
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '../.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        if (key && value) {
          process.env[key] = value;
        }
      }
    });
    
    console.log('✅ Variables de entorno cargadas');
  } catch (error) {
    console.error('⚠️  No se pudo cargar .env.local:', error.message);
  }
}

loadEnv();

// Usar MySQL2
const mysql = require('mysql2/promise');

// Configuración de MySQL
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
};

console.log('🔍 Configuración MySQL:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port
});

let connection;

// Función para ejecutar queries en MySQL
async function executeQuery(query, params = []) {
  try {
    if (!connection) {
      connection = await mysql.createConnection(dbConfig);
      console.log('✅ Conexión MySQL establecida');
    }
    
    console.log('🔍 Ejecutando query:', query.substring(0, 100) + '...');
    const [rows] = await connection.execute(query, params);
    return rows;
  } catch (error) {
    console.error('❌ Error en query:', error.message);
    throw error;
  }
}

// Datos de los módulos hardcodeados
const modulosData = [
  {
    id: 'MOD1',
    titulo: 'MÓDULO 1: Organización y Roles',
    submodules: [
      { id: 'MOD1_SUB1', titulo: 'Estructura Organizacional' },
      { id: 'MOD1_SUB2', titulo: 'Definición de Roles' },
      { id: 'MOD1_SUB3', titulo: 'Responsabilidades' }
    ]
  },
  {
    id: 'MOD2',
    titulo: 'MÓDULO 2: Procesos y Sistemas',
    submodules: [
      { id: 'MOD2_SUB1', titulo: 'Mapeo de Procesos' },
      { id: 'MOD2_SUB2', titulo: 'Automatización' },
      { id: 'MOD2_SUB3', titulo: 'Sistemas de Información' }
    ]
  },
  {
    id: 'MOD3',
    titulo: 'MÓDULO 3: Ventas y Marketing',
    submodules: [
      { id: 'MOD3_SUB1', titulo: 'Estrategia de Ventas' },
      { id: 'MOD3_SUB2', titulo: 'Marketing Digital' },
      { id: 'MOD3_SUB3', titulo: 'Customer Journey' }
    ]
  },
  {
    id: 'MOD4',
    titulo: 'MÓDULO 4: Finanzas y Métricas',
    submodules: [
      { id: 'MOD4_SUB1', titulo: 'Control Financiero' },
      { id: 'MOD4_SUB2', titulo: 'KPIs y Métricas' },
      { id: 'MOD4_SUB3', titulo: 'Presupuestos' }
    ]
  },
  {
    id: 'MOD5',
    titulo: 'MÓDULO 5: Liderazgo y Cultura',
    submodules: [
      { id: 'MOD5_SUB1', titulo: 'Estilo de Liderazgo' },
      { id: 'MOD5_SUB2', titulo: 'Cultura Organizacional' },
      { id: 'MOD5_SUB3', titulo: 'Comunicación' }
    ]
  },
  {
    id: 'MOD6',
    titulo: 'MÓDULO 6: Innovación y Producto',
    submodules: [
      { id: 'MOD6_SUB1', titulo: 'Desarrollo de Productos' },
      { id: 'MOD6_SUB2', titulo: 'Innovación' },
      { id: 'MOD6_SUB3', titulo: 'I+D' }
    ]
  },
  {
    id: 'MOD7',
    titulo: 'MÓDULO 7: Operaciones y Calidad',
    submodules: [
      { id: 'MOD7_SUB1', titulo: 'Gestión de Operaciones' },
      { id: 'MOD7_SUB2', titulo: 'Control de Calidad' },
      { id: 'MOD7_SUB3', titulo: 'Mejora Continua' }
    ]
  },
  {
    id: 'MOD8',
    titulo: 'MÓDULO 8: Recursos Humanos',
    submodules: [
      { id: 'MOD8_SUB1', titulo: 'Gestión del Talento' },
      { id: 'MOD8_SUB2', titulo: 'Capacitación' },
      { id: 'MOD8_SUB3', titulo: 'Evaluación de Desempeño' }
    ]
  },
  {
    id: 'MOD9',
    titulo: 'MÓDULO 9: Tecnología y Sistemas',
    submodules: [
      { id: 'MOD9_SUB1', titulo: 'Infraestructura IT' },
      { id: 'MOD9_SUB2', titulo: 'Digitalización' },
      { id: 'MOD9_SUB3', titulo: 'Ciberseguridad' }
    ]
  },
  {
    id: 'MOD10',
    titulo: 'MÓDULO 10: Estrategia Competitiva',
    submodules: [
      { id: 'MOD10_SUB1', titulo: 'Análisis Competitivo' },
      { id: 'MOD10_SUB2', titulo: 'Posicionamiento' },
      { id: 'MOD10_SUB3', titulo: 'Ventaja Competitiva' }
    ]
  },
  {
    id: 'MOD11',
    titulo: 'MÓDULO 11: Sostenibilidad y RSE',
    submodules: [
      { id: 'MOD11_SUB1', titulo: 'Responsabilidad Social' },
      { id: 'MOD11_SUB2', titulo: 'Sostenibilidad' },
      { id: 'MOD11_SUB3', titulo: 'Impacto Ambiental' }
    ]
  },
  {
    id: 'MOD12',
    titulo: 'MÓDULO 12: Expansión y Crecimiento',
    submodules: [
      { id: 'MOD12_SUB1', titulo: 'Estrategia de Crecimiento' },
      { id: 'MOD12_SUB2', titulo: 'Nuevos Mercados' },
      { id: 'MOD12_SUB3', titulo: 'Escalabilidad' }
    ]
  },
  {
    id: 'MOD13',
    titulo: 'MÓDULO 13: Evaluación Integral',
    submodules: [
      { id: 'MOD13_SUB1', titulo: 'Diagnóstico Final' },
      { id: 'MOD13_SUB2', titulo: 'Plan de Acción' },
      { id: 'MOD13_SUB3', titulo: 'Seguimiento' }
    ]
  }
];

console.log('🚀 INICIANDO MIGRACIÓN DE MÓDULOS MEGA-DIAGNÓSTICO');

async function migrarModulos() {
  try {
    console.log('\n=== PASO 1: VERIFICANDO CONEXIÓN MYSQL ===');
    
    // Probar conexión
    await executeQuery('SELECT 1 as test');
    console.log('✅ Conexión a MySQL exitosa');
    
    // Verificar que las tablas existan
    const tables = await executeQuery(`
      SELECT TABLE_NAME as table_name
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME IN ('diagnostic_modules', 'diagnostic_submodules')
    `, [dbConfig.database]);
    
    console.log('✅ Tablas disponibles:', tables.map(t => t.table_name));

    console.log('\n=== PASO 2: MIGRANDO MÓDULOS ===');
    
    for (let moduleIndex = 0; moduleIndex < modulosData.length; moduleIndex++) {
      const modulo = modulosData[moduleIndex];
      
      console.log(`\n--- Migrando ${modulo.titulo} ---`);
      
      // Insertar módulo principal
      const moduleResult = await executeQuery(`
        INSERT INTO diagnostic_modules (
          module_code, title, description, estimated_time_minutes, 
          is_active, order_index, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          description = VALUES(description),
          updated_at = NOW()
      `, [
        modulo.id,
        modulo.titulo,
        `Módulo ${moduleIndex + 1} del mega-diagnóstico empresarial`,
        60, // tiempo estimado
        1,  // activo
        moduleIndex + 3 // orden de display (después de onboarding y otros)
      ]);
      
      // Obtener el ID del módulo recién insertado o existente
      const [moduleData] = await executeQuery(`
        SELECT id FROM diagnostic_modules WHERE module_code = ?
      `, [modulo.id]);
      
      const moduleId = moduleData[0].id;
      
      // Migrar submódulos
      for (let subIndex = 0; subIndex < modulo.submodules.length; subIndex++) {
        const submodulo = modulo.submodules[subIndex];
        
        await executeQuery(`
          INSERT INTO diagnostic_submodules (
            module_id, submodule_code, title, description,
            order_index, created_at
          ) VALUES (?, ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            description = VALUES(description)
        `, [
          moduleId,
          submodulo.id,
          submodulo.titulo,
          `Submódulo ${subIndex + 1} - ${submodulo.titulo}`,
          subIndex + 1
        ]);
        
        console.log(`  ✅ Submódulo: ${submodulo.titulo}`);
      }
      
      console.log(`✅ ${modulo.titulo}: ${modulo.submodules.length} submódulos migrados`);
    }
    
    console.log('\n=== PASO 3: VERIFICANDO MIGRACIÓN ===');
    await verificarMigracion();
    
    console.log('\n🎉 ¡MIGRACIÓN COMPLETADA CON ÉXITO!');
    
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión MySQL cerrada');
    }
  }
}

// Función para verificar la migración
async function verificarMigracion() {
  console.log('\n=== VERIFICACIÓN DE MIGRACIÓN ===');
  
  const modules = await executeQuery('SELECT COUNT(*) as count FROM diagnostic_modules');
  const submodules = await executeQuery('SELECT COUNT(*) as count FROM diagnostic_submodules');
  
  console.log(`📊 Resultados de migración:`);
  console.log(`   • Módulos: ${modules[0].count}`);
  console.log(`   • Submódulos: ${submodules[0].count}`);
  
  // Mostrar algunos ejemplos
  const modulesList = await executeQuery('SELECT module_code, title FROM diagnostic_modules ORDER BY order_index LIMIT 15');
  console.log('\n📋 Módulos en base de datos:');
  modulesList.forEach(mod => {
    console.log(`   • ${mod.module_code}: ${mod.title}`);
  });
}

// Ejecutar migración
if (require.main === module) {
  migrarModulos()
    .then(() => {
      console.log('\n🎉 ¡TODOS LOS MÓDULOS MIGRADOS EXITOSAMENTE!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en migración:', error);
      process.exit(1);
    });
}

module.exports = {
  migrarModulos,
  verificarMigracion
};
