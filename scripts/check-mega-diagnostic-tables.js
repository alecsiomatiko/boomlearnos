const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Leer variables de entorno del archivo .env.local
function loadEnv() {
  try {
    const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
    const env = {};
    envFile.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        env[key.trim()] = value.trim().replace(/['"]/g, '');
      }
    });
    return env;
  } catch (error) {
    console.error('Error cargando .env.local:', error.message);
    return {};
  }
}

async function executeQuery(query, params = []) {
  const env = loadEnv();
  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT || 3306,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME
  });
  
  try {
    const [results] = await connection.execute(query, params);
    return results;
  } finally {
    await connection.end();
  }
}

async function checkMegaDiagnosticTables() {
  try {
    console.log('🔍 Buscando tablas relacionadas con mega diagnóstico...\n');

    // Listar todas las tablas
    const tables = await executeQuery('SHOW TABLES');
    console.log('=== TODAS LAS TABLAS ===');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`${index + 1}. ${tableName}`);
    });

    // Buscar tablas que contengan "diagnostic" o "module"
    const relevantTables = tables.filter(table => {
      const tableName = Object.values(table)[0].toString().toLowerCase();
      return tableName.includes('diagnostic') || tableName.includes('module') || tableName.includes('mega');
    });

    console.log('\n=== TABLAS RELEVANTES PARA MEGA DIAGNÓSTICO ===');
    if (relevantTables.length === 0) {
      console.log('No se encontraron tablas específicas para mega diagnóstico');
    } else {
      for (const table of relevantTables) {
        const tableName = Object.values(table)[0];
        console.log(`\n--- ESTRUCTURA DE ${tableName} ---`);
        try {
          const structure = await executeQuery(`DESCRIBE ${tableName}`);
          structure.forEach((col, index) => {
            console.log(`  ${index + 1}. ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
          });

          const count = await executeQuery(`SELECT COUNT(*) as count FROM ${tableName}`);
          console.log(`  Registros: ${count[0].count}`);
        } catch (error) {
          console.log(`  Error al verificar ${tableName}:`, error.message);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

checkMegaDiagnosticTables();
