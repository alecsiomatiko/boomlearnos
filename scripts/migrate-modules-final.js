const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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

const { v4: uuidv4 } = require('uuid');

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

let connection;

// Función para ejecutar queries en MySQL
async function executeQuery(query, params = []) {
  try {
    if (!connection) {
      connection = await mysql.createConnection(dbConfig);
      console.log('✅ Conexión MySQL establecida');
    }
    
    const [rows] = await connection.execute(query, params);
    return rows;
  } catch (error) {
    console.error('❌ Error en query:', error.message);
    throw error;
  }
}

// Datos de los módulos hardcodeados (mismos que antes)
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
  }
  // Solo 5 módulos para empezar
];

console.log('🚀 MIGRACIÓN CORREGIDA - USANDO UUIDs');

async function migrarModulosCorregido() {
  try {
    console.log('\n=== VERIFICANDO CONEXIÓN ===');
    await executeQuery('SELECT 1 as test');
    console.log('✅ Conexión exitosa');

    console.log('\n=== MIGRANDO MÓDULOS ===');
    
    for (let moduleIndex = 0; moduleIndex < modulosData.length; moduleIndex++) {
      const modulo = modulosData[moduleIndex];
      const moduleUUID = uuidv4();
      
      console.log(`\n--- Migrando ${modulo.titulo} ---`);
      
      // Verificar si ya existe
      const existingModule = await executeQuery(`
        SELECT id FROM diagnostic_modules WHERE module_code = ?
      `, [modulo.id]);
      
      let moduleId;
      
      if (existingModule.length > 0) {
        moduleId = existingModule[0].id;
        console.log(`  ⚠️  Módulo ya existe con ID: ${moduleId}`);
        
        // Actualizar el título si es necesario
        await executeQuery(`
          UPDATE diagnostic_modules 
          SET title = ?, description = ?, updated_at = NOW() 
          WHERE module_code = ?
        `, [
          modulo.titulo,
          `Módulo ${moduleIndex + 1} del mega-diagnóstico empresarial`,
          modulo.id
        ]);
      } else {
        // Insertar nuevo módulo
        await executeQuery(`
          INSERT INTO diagnostic_modules (
            id, module_code, title, description, estimated_time_minutes, 
            is_active, order_index, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          moduleUUID,
          modulo.id,
          modulo.titulo,
          `Módulo ${moduleIndex + 1} del mega-diagnóstico empresarial`,
          60, // tiempo estimado
          1,  // activo
          moduleIndex + 3 // orden después de otros módulos
        ]);
        
        moduleId = moduleUUID;
        console.log(`  ✅ Módulo creado con ID: ${moduleId}`);
      }
      
      // Migrar submódulos
      for (let subIndex = 0; subIndex < modulo.submodules.length; subIndex++) {
        const submodulo = modulo.submodules[subIndex];
        const submoduleUUID = uuidv4();
        
        // Verificar si submódulo ya existe
        const existingSubmodule = await executeQuery(`
          SELECT id FROM diagnostic_submodules WHERE submodule_code = ?
        `, [submodulo.id]);
        
        if (existingSubmodule.length > 0) {
          console.log(`    ⚠️  Submódulo ${submodulo.titulo} ya existe`);
          
          // Actualizar
          await executeQuery(`
            UPDATE diagnostic_submodules 
            SET title = ?, description = ? 
            WHERE submodule_code = ?
          `, [
            submodulo.titulo,
            `Submódulo ${subIndex + 1} - ${submodulo.titulo}`,
            submodulo.id
          ]);
        } else {
          // Insertar nuevo submódulo
          await executeQuery(`
            INSERT INTO diagnostic_submodules (
              id, module_id, submodule_code, title, description,
              order_index, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW())
          `, [
            submoduleUUID,
            moduleId,
            submodulo.id,
            submodulo.titulo,
            `Submódulo ${subIndex + 1} - ${submodulo.titulo}`,
            subIndex + 1
          ]);
          
          console.log(`    ✅ Submódulo creado: ${submodulo.titulo}`);
        }
      }
      
      console.log(`✅ ${modulo.titulo}: ${modulo.submodules.length} submódulos procesados`);
    }
    
    console.log('\n=== VERIFICACIÓN FINAL ===');
    await verificarMigracion();
    
    console.log('\n🎉 ¡MIGRACIÓN COMPLETADA CON ÉXITO!');
    
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

async function verificarMigracion() {
  const modules = await executeQuery('SELECT COUNT(*) as count FROM diagnostic_modules');
  const submodules = await executeQuery('SELECT COUNT(*) as count FROM diagnostic_submodules');
  
  console.log(`📊 Total en base de datos:`);
  console.log(`   • Módulos: ${modules[0].count}`);
  console.log(`   • Submódulos: ${submodules[0].count}`);
  
  const modulesList = await executeQuery('SELECT module_code, title FROM diagnostic_modules ORDER BY order_index');
  console.log('\n📋 Todos los módulos:');
  modulesList.forEach(mod => {
    console.log(`   • ${mod.module_code}: ${mod.title}`);
  });
}

// Ejecutar migración
if (require.main === module) {
  migrarModulosCorregido()
    .then(() => {
      console.log('\n🎉 ¡MIGRACIÓN EXITOSA!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}
