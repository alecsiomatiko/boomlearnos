const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

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

async function migrateMod1Complete() {
  console.log('🚀 MIGRACIÓN COMPLETA DEL MÓDULO 1');
  console.log('=' .repeat(50));
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    console.log('✅ Conectado a MySQL');

    // Verificar MÓDULO 1
    const [mod1] = await connection.execute(
      'SELECT id, module_code, title FROM diagnostic_modules WHERE module_code = "MOD1"'
    );

    const mod1Id = mod1[0].id;
    console.log(`📁 MÓDULO 1: ${mod1[0].title} (${mod1Id})`);

    // Verificar submódulos del MÓDULO 1
    const [mod1Submodules] = await connection.execute(
      'SELECT id, title FROM diagnostic_submodules WHERE module_id = ?',
      [mod1Id]
    );

    let targetSubmoduleId;
    if (mod1Submodules.length === 0) {
      // Crear submódulo para MÓDULO 1
      console.log('🔧 Creando submódulo para MÓDULO 1...');
      targetSubmoduleId = uuidv4();
      await connection.execute(`
        INSERT INTO diagnostic_submodules (
          id, module_id, submodule_code, title, description, order_index, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [
        targetSubmoduleId,
        mod1Id,
        'sub1_org_roles',
        'Organización y Roles',
        'Preguntas sobre estructura organizacional y roles',
        1
      ]);
      console.log('✅ Submódulo creado exitosamente');
    } else {
      targetSubmoduleId = mod1Submodules[0].id;
      console.log(`📁 Usando submódulo existente: ${mod1Submodules[0].title}`);
    }

    // Definir preguntas directamente (extracción manual para mejor precisión)
    const mod1Questions = [
      {
        id: "m1s1q1",
        pregunta: "¿Cómo describirías el organigrama de tu empresa en la actualidad?",
        peso: 1,
        tipo: "single",
        opciones: [
          { id: "o1", text: "No existe de forma formal", peso: 1 },
          { id: "o2", text: "Yo asumo la mayoría de las funciones", peso: 2 },
          { id: "o3", text: "Hay roles, pero no muy definidos", peso: 3 },
          { id: "o4", text: "Existe una estructura clara y cada persona conoce su función", peso: 4 },
        ]
      },
      {
        id: "m1s1q2",
        pregunta: "¿Quién toma las decisiones clave en la empresa?",
        peso: 1,
        tipo: "single",
        opciones: [
          { id: "o1", text: "Yo solo", peso: 1 },
          { id: "o2", text: "Mi socio(a) y yo (con ciertas fricciones)", peso: 2 },
          { id: "o3", text: "Un equipo o comité", peso: 4 },
          { id: "o4", text: "No existe claridad al respecto", peso: 0 },
        ]
      },
      {
        id: "m1s1q3",
        pregunta: "¿Tus colaboradores conocen las metas y responsabilidades que les corresponden?",
        peso: 1,
        tipo: "single",
        opciones: [
          { id: "o1", text: "Sí, cada uno tiene objetivos claros", peso: 4 },
          { id: "o2", text: "Más o menos, seguimos improvisando", peso: 2 },
          { id: "o3", text: "No, todos hacen diversas tareas sin un plan", peso: 1 },
          { id: "o4", text: "Solo yo sé los objetivos concretos", peso: 1 },
        ]
      },
      {
        id: "m1s2q1",
        pregunta: "¿Qué nivel de delegación manejas?",
        peso: 1,
        tipo: "single",
        opciones: [
          { id: "o1", text: "Realizo prácticamente todas las actividades", peso: 1 },
          { id: "o2", text: "Delego, pero reviso todos los detalles", peso: 2 },
          { id: "o3", text: "Existen líderes responsables de cada área", peso: 4 },
          { id: "o4", text: "Me dedico a dirigir o vender, delegando el resto", peso: 3 },
        ]
      },
      {
        id: "m1s2q2",
        pregunta: "¿Cuál es tu estilo de liderazgo?",
        peso: 1,
        tipo: "single",
        opciones: [
          { id: "o1", text: "Estricto y apresurado", peso: 1 },
          { id: "o2", text: "Amigable, pero con desorganización", peso: 2 },
          { id: "o3", text: "Visionario y centrado en objetivos", peso: 3 },
          { id: "o4", text: "Mentor con un método establecido", peso: 4 },
        ]
      }
    ];

    console.log(`📊 Migrando ${mod1Questions.length} preguntas para MÓDULO 1`);

    let questionsAdded = 0;
    let optionsAdded = 0;

    for (let i = 0; i < mod1Questions.length; i++) {
      const question = mod1Questions[i];
      
      // Verificar si la pregunta ya existe
      const [existingQuestion] = await connection.execute(
        'SELECT id FROM diagnostic_questions WHERE question_code = ?',
        [question.id]
      );
      
      if (existingQuestion.length === 0) {
        const questionUuid = uuidv4();
        
        // Insertar pregunta
        await connection.execute(`
          INSERT INTO diagnostic_questions (
            id, question_code, submodule_id, question_text, question_type,
            weight, order_index, is_optional, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          questionUuid,
          question.id,
          targetSubmoduleId,
          question.pregunta,
          question.tipo,
          question.peso,
          i + 1,
          0
        ]);
        
        questionsAdded++;
        
        // Migrar opciones
        for (let j = 0; j < question.opciones.length; j++) {
          const option = question.opciones[j];
          const optionUuid = uuidv4();
          
          await connection.execute(`
            INSERT INTO diagnostic_options (
              id, option_code, question_id, option_text, weight,
              order_index, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW())
          `, [
            optionUuid,
            `${question.id}_${option.id}`,
            questionUuid,
            option.text,
            option.peso,
            j + 1
          ]);
          
          optionsAdded++;
        }
        
        console.log(`  ✅ ${question.id}: ${question.pregunta.substring(0, 50)}... (${question.opciones.length} opciones)`);
      } else {
        console.log(`  ⏭️  ${question.id}: Ya existe`);
      }
    }

    // Verificar estado final
    const [finalCount] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM diagnostic_questions q
      JOIN diagnostic_submodules ds ON q.submodule_id = ds.id
      JOIN diagnostic_modules dm ON ds.module_id = dm.id
      WHERE dm.module_code = 'MOD1'
    `);

    console.log(`\n🎉 ¡MIGRACIÓN DEL MÓDULO 1 COMPLETADA!`);
    console.log(`📈 Preguntas añadidas: ${questionsAdded}`);
    console.log(`📈 Opciones añadidas: ${optionsAdded}`);
    console.log(`📊 Total preguntas en MÓDULO 1: ${finalCount[0].count}`);

    // Mostrar estado global
    const [globalCount] = await connection.execute(`
      SELECT dm.module_code, dm.title, COUNT(q.id) as question_count
      FROM diagnostic_modules dm
      LEFT JOIN diagnostic_submodules ds ON dm.id = ds.module_id
      LEFT JOIN diagnostic_questions q ON ds.id = q.submodule_id
      GROUP BY dm.id, dm.module_code, dm.title
      ORDER BY dm.module_code
    `);

    console.log(`\n📊 ESTADO GLOBAL DE TODOS LOS MÓDULOS:`);
    console.log('=' .repeat(60));
    globalCount.forEach(row => {
      const status = row.question_count > 0 ? '✅' : '❌';
      console.log(`${status} ${row.module_code}: ${row.title} (${row.question_count} preguntas)`);
    });

    await connection.end();
    console.log('\n🔌 Conexión cerrada');
    console.log('🎯 TODA LA MIGRACIÓN ESTÁ COMPLETADA 🎯');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

migrateMod1Complete();
