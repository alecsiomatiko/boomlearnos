import { pool, generateUUID } from '@/lib/server/mysql';
import { etapa1DiagnosticoInicial } from '@/lib/mega-diagnostic/etapa1-data';
import { modulo0PropositoBHAG } from '@/lib/mega-diagnostic/modulo0-data';
import { etapa2Modulos } from '@/lib/mega-diagnostic/etapa2-modulos-data';

async function migrateDiagnosticData() {
  try {
    console.log('Starting diagnostic data migration...');

    // Clear existing data
    await pool.execute('DELETE FROM diagnostic_options');
    await pool.execute('DELETE FROM diagnostic_questions');
    await pool.execute('DELETE FROM diagnostic_submodules');
    await pool.execute('DELETE FROM diagnostic_modules');

    // Migrate Module 0 (BHAG)
    const mod0Id = generateUUID();
    await pool.execute(`
      INSERT INTO diagnostic_modules (id, module_code, title, description, icon, order_index)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [mod0Id, 'MOD0', modulo0PropositoBHAG.titulo, modulo0PropositoBHAG.descripcion, 'Compass', 0]);

    // Create a single submodule for Module 0
    const sub0Id = generateUUID();
    await pool.execute(`
      INSERT INTO diagnostic_submodules (id, module_id, submodule_code, title, order_index)
      VALUES (?, ?, ?, ?, ?)
    `, [sub0Id, mod0Id, 'SUB0_1', 'Propósito y BHAG', 1]);

    // Migrate Module 0 questions
    for (let i = 0; i < modulo0PropositoBHAG.questions.length; i++) {
      const question = modulo0PropositoBHAG.questions[i];
      const questionId = generateUUID();
      
      await pool.execute(`
        INSERT INTO diagnostic_questions (id, submodule_id, question_code, question_text, question_type, weight, order_index, feedback_text)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        questionId,
        sub0Id,
        question.id,
        question.pregunta,
        question.tipo,
        question.ponderacionPregunta,
        i + 1,
        question.feedbackImmediato || null
      ]);

      // Migrate options for this question
      for (let j = 0; j < question.opciones.length; j++) {
        const option = question.opciones[j];
        await pool.execute(`
          INSERT INTO diagnostic_options (id, question_id, option_code, option_text, weight, emoji, order_index)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          generateUUID(),
          questionId,
          option.id,
          option.text,
          option.ponderacion,
          option.emoji || null,
          j + 1
        ]);
      }
    }

    // Migrate Etapa 1 (Initial Diagnostic)
    const etapa1Id = generateUUID();
    await pool.execute(`
      INSERT INTO diagnostic_modules (id, module_code, title, description, icon, order_index)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [etapa1Id, 'ETAPA1', etapa1DiagnosticoInicial.titulo, etapa1DiagnosticoInicial.descripcion, 'Building', 1]);

    // Create a single submodule for Etapa 1
    const subEtapa1Id = generateUUID();
    await pool.execute(`
      INSERT INTO diagnostic_submodules (id, module_id, submodule_code, title, order_index)
      VALUES (?, ?, ?, ?, ?)
    `, [subEtapa1Id, etapa1Id, 'SUB_ETAPA1', 'Mapeo del Negocio', 1]);

    // Migrate Etapa 1 questions
    for (let i = 0; i < etapa1DiagnosticoInicial.questions.length; i++) {
      const question = etapa1DiagnosticoInicial.questions[i];
      const questionId = generateUUID();
      
      await pool.execute(`
        INSERT INTO diagnostic_questions (id, submodule_id, question_code, question_text, question_type, weight, order_index, feedback_text)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        questionId,
        subEtapa1Id,
        question.id,
        question.pregunta,
        question.tipo,
        question.ponderacionPregunta,
        i + 1,
        question.feedbackImmediato || null
      ]);

      // Migrate options for this question
      for (let j = 0; j < question.opciones.length; j++) {
        const option = question.opciones[j];
        await pool.execute(`
          INSERT INTO diagnostic_options (id, question_id, option_code, option_text, weight, emoji, order_index)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          generateUUID(),
          questionId,
          option.id,
          option.text,
          option.ponderacion,
          option.emoji || null,
          j + 1
        ]);
      }
    }

    // Migrate Etapa 2 modules
    for (let moduleIndex = 0; moduleIndex < etapa2Modulos.length; moduleIndex++) {
      const module = etapa2Modulos[moduleIndex];
      const moduleId = generateUUID();
      
      await pool.execute(`
        INSERT INTO diagnostic_modules (id, module_code, title, description, icon, order_index)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [moduleId, module.id, module.titulo, '', module.icon, moduleIndex + 2]);

      // Migrate submodules
      for (let subIndex = 0; subIndex < module.submodules.length; subIndex++) {
        const submodule = module.submodules[subIndex];
        const submoduleId = generateUUID();
        
        await pool.execute(`
          INSERT INTO diagnostic_submodules (id, module_id, submodule_code, title, order_index)
          VALUES (?, ?, ?, ?, ?)
        `, [submoduleId, moduleId, submodule.id, submodule.titulo, subIndex + 1]);

        // Migrate questions for this submodule
        for (let qIndex = 0; qIndex < submodule.preguntas.length; qIndex++) {
          const question = submodule.preguntas[qIndex];
          const questionId = generateUUID();
          
          await pool.execute(`
            INSERT INTO diagnostic_questions (id, submodule_id, question_code, question_text, question_type, weight, order_index)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            questionId,
            submoduleId,
            question.id,
            question.pregunta,
            question.tipo,
            question.ponderacionPregunta,
            qIndex + 1
          ]);

          // Migrate options for this question
          for (let oIndex = 0; oIndex < question.opciones.length; oIndex++) {
            const option = question.opciones[oIndex];
            await pool.execute(`
              INSERT INTO diagnostic_options (id, question_id, option_code, option_text, weight, order_index)
              VALUES (?, ?, ?, ?, ?, ?)
            `, [
              generateUUID(),
              questionId,
              option.id,
              option.text,
              option.ponderacion,
              oIndex + 1
            ]);
          }
        }
      }
    }

    console.log('Diagnostic data migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateDiagnosticData()
    .then(() => {
      console.log('Migration finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migrateDiagnosticData };