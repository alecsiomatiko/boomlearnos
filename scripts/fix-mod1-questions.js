const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno manualmente
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

async function fixMod1Questions() {
    console.log('✅ Variables de entorno cargadas');
    console.log('🔧 MOVIENDO PREGUNTAS DEL MÓDULO 1 DE MOD13 A MOD1');
    console.log('==================================================');

    let connection;
    try {
        // Conectar a MySQL
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });
        console.log('✅ Conectado a MySQL');

        // Primero verificar la estructura de las tablas
        const [moduleColumns] = await connection.execute(`DESCRIBE diagnostic_modules`);
        console.log('🔍 Columnas en diagnostic_modules:');
        moduleColumns.forEach(col => console.log(`   ${col.Field} (${col.Type})`));

        const [submoduleColumns] = await connection.execute(`DESCRIBE diagnostic_submodules`);
        console.log('🔍 Columnas en diagnostic_submodules:');
        submoduleColumns.forEach(col => console.log(`   ${col.Field} (${col.Type})`));

        // 1. Obtener información del MOD1 y su submódulo
        const [mod1Info] = await connection.execute(`
            SELECT id, module_code, title
            FROM diagnostic_modules 
            WHERE module_code = 'MOD1'
            LIMIT 1
        `);

        if (mod1Info.length === 0) {
            throw new Error('No se encontró el MÓDULO 1');
        }

        const [submodules] = await connection.execute(`
            SELECT id, submodule_code, title 
            FROM diagnostic_submodules 
            WHERE module_id = ?
        `, [mod1Info[0].id]);

        if (submodules.length === 0) {
            throw new Error('No se encontró submódulo para el MÓDULO 1');
        }

        console.log(`🎯 MÓDULO 1: ${mod1Info[0].title} (${mod1Info[0].module_code})`);
        console.log(`📂 Submódulo: ${submodules[0].title} (${submodules[0].submodule_code})`);

        // 2. Buscar preguntas con código m1s que están en otros módulos
        const [wrongQuestions] = await connection.execute(`
            SELECT dq.id, dq.question_code as code, dq.question_text as text, dq.submodule_id,
                   dm.title as current_module_title, dm.module_code as current_module_code,
                   ds.title as current_submodule_title, ds.submodule_code as current_submodule_code
            FROM diagnostic_questions dq
            JOIN diagnostic_submodules ds ON dq.submodule_id = ds.id
            JOIN diagnostic_modules dm ON ds.module_id = dm.id
            WHERE dq.question_code LIKE 'm1s%' AND ds.module_id != ?
            ORDER BY dq.question_code
        `, [mod1Info[0].id]);

        if (wrongQuestions.length === 0) {
            console.log('✅ No hay preguntas del MÓDULO 1 en módulos incorrectos');
            return;
        }

        console.log(`\n📝 Encontradas ${wrongQuestions.length} preguntas del MÓDULO 1 en módulo incorrecto:`);
        wrongQuestions.forEach(q => {
            console.log(`   ${q.code}: ${q.text.substring(0, 50)}...`);
            console.log(`   📁 Actualmente en: ${q.current_module_code} - ${q.current_submodule_code}`);
        });

        // 3. Mover las preguntas al submódulo correcto del MOD1
        console.log(`\n🔄 Moviendo preguntas al MÓDULO 1...`);
        
        for (const question of wrongQuestions) {
            await connection.execute(`
                UPDATE diagnostic_questions 
                SET submodule_id = ?
                WHERE id = ?
            `, [submodules[0].id, question.id]);
            
            console.log(`✅ Movida: ${question.code} → MOD1`);
        }

        // 4. Verificar el resultado
        const [mod1Questions] = await connection.execute(`
            SELECT dq.id, dq.question_code as code, dq.question_text as text
            FROM diagnostic_questions dq
            JOIN diagnostic_submodules ds ON dq.submodule_id = ds.id
            JOIN diagnostic_modules dm ON ds.module_id = dm.id
            WHERE dm.id = ?
            ORDER BY dq.question_code
        `, [mod1Info[0].id]);

        console.log(`\n🎉 RESULTADO FINAL:`);
        console.log(`📊 El MÓDULO 1 ahora tiene ${mod1Questions.length} preguntas:`);
        mod1Questions.forEach(q => {
            console.log(`   ✅ ${q.code}: ${q.text.substring(0, 60)}...`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexión cerrada');
        }
    }
}

// Ejecutar el script
fixMod1Questions().catch(console.error);
