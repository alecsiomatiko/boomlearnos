// Script para migrar módulos del mega-diagnóstico a MySQL
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

// Datos de módulos a migrar
const modulosData = [
  {
    code: 'MOD2',
    title: 'MÓDULO 2: Procesos y Sistemas',
    submodules: [
      { code: 'MOD2_SUB1', title: 'Mapeo de Procesos' },
      { code: 'MOD2_SUB2', title: 'Automatización' },
      { code: 'MOD2_SUB3', title: 'Sistemas de Información' }
    ]
  },
  {
    code: 'MOD3',
    title: 'MÓDULO 3: Ventas y Marketing',
    submodules: [
      { code: 'MOD3_SUB1', title: 'Estrategia de Ventas' },
      { code: 'MOD3_SUB2', title: 'Marketing Digital' },
      { code: 'MOD3_SUB3', title: 'Customer Journey' }
    ]
  },
  {
    code: 'MOD4',
    title: 'MÓDULO 4: Finanzas y Métricas',
    submodules: [
      { code: 'MOD4_SUB1', title: 'Control Financiero' },
      { code: 'MOD4_SUB2', title: 'KPIs y Métricas' },
      { code: 'MOD4_SUB3', title: 'Presupuestos' }
    ]
  },
  {
    code: 'MOD5',
    title: 'MÓDULO 5: Liderazgo y Cultura',
    submodules: [
      { code: 'MOD5_SUB1', title: 'Estilo de Liderazgo' },
      { code: 'MOD5_SUB2', title: 'Cultura Organizacional' },
      { code: 'MOD5_SUB3', title: 'Comunicación' }
    ]
  }
];

async function migrarModulos() {
  let connection;
  
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a MySQL');
    
    console.log('\n🚀 INICIANDO MIGRACIÓN DE MÓDULOS');
    
    for (let i = 0; i < modulosData.length; i++) {
      const modulo = modulosData[i];
      console.log(`\n--- Procesando ${modulo.title} ---`);
      
      // Verificar si el módulo ya existe
      const [existingModules] = await connection.execute(
        'SELECT id FROM diagnostic_modules WHERE module_code = ?',
        [modulo.code]
      );
      
      let moduleId;
      
      if (existingModules.length > 0) {
        moduleId = existingModules[0].id;
        console.log(`  ⚠️  Módulo ya existe, actualizando...`);
        
        // Actualizar módulo existente
        await connection.execute(`
          UPDATE diagnostic_modules 
          SET title = ?, description = ?, updated_at = NOW() 
          WHERE module_code = ?
        `, [
          modulo.title,
          `Módulo del mega-diagnóstico empresarial`,
          modulo.code
        ]);
      } else {
        // Crear nuevo módulo
        moduleId = uuidv4();
        
        await connection.execute(`
          INSERT INTO diagnostic_modules (
            id, module_code, title, description, estimated_time_minutes, 
            is_active, order_index, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          moduleId,
          modulo.code,
          modulo.title,
          `Módulo del mega-diagnóstico empresarial`,
          60,
          1,
          i + 10  // order_index alto para que aparezcan después
        ]);
        
        console.log(`  ✅ Módulo creado: ${modulo.title}`);
      }
      
      // Procesar submódulos
      for (let j = 0; j < modulo.submodules.length; j++) {
        const submodulo = modulo.submodules[j];
        
        // Verificar si submódulo existe
        const [existingSubmodules] = await connection.execute(
          'SELECT id FROM diagnostic_submodules WHERE submodule_code = ?',
          [submodulo.code]
        );
        
        if (existingSubmodules.length > 0) {
          // Actualizar submódulo existente
          await connection.execute(`
            UPDATE diagnostic_submodules 
            SET title = ?, description = ? 
            WHERE submodule_code = ?
          `, [
            submodulo.title,
            `Submódulo: ${submodulo.title}`,
            submodulo.code
          ]);
          
          console.log(`    ⚠️  Submódulo actualizado: ${submodulo.title}`);
        } else {
          // Crear nuevo submódulo
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
    }
    
    // Verificar resultado
    console.log('\n=== VERIFICACIÓN FINAL ===');
    const [totalModules] = await connection.execute('SELECT COUNT(*) as count FROM diagnostic_modules');
    const [totalSubmodules] = await connection.execute('SELECT COUNT(*) as count FROM diagnostic_submodules');
    
    console.log(`📊 Total en base de datos:`);
    console.log(`   • Módulos: ${totalModules[0].count}`);
    console.log(`   • Submódulos: ${totalSubmodules[0].count}`);
    
    console.log('\n🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!');
    
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
migrarModulos()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
