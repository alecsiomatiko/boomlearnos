const mysql = require('mysql2/promise');

async function seedDepartments() {
  const conn = await mysql.createConnection({
    host: '151.106.99.1',
    user: 'u191251575_BoomlearnOS',
    password: 'Cerounocero.com20182417',
    database: 'u191251575_BoomlearnOS'
  });

  console.log('✅ Conectado a la base de datos');

  try {
    // Obtener organización principal
    const [orgs] = await conn.execute(
      'SELECT id, name FROM organizations ORDER BY created_at ASC LIMIT 1'
    );
    const mainOrg = orgs[0];
    console.log(`🏢 Organización: ${mainOrg.name} (${mainOrg.id})`);

    // Departamentos profesionales de ejemplo
    const departments = [
      {
        name: 'Dirección General',
        description: 'Dirección ejecutiva y toma de decisiones estratégicas',
        color: '#1E40AF',
        active: true
      },
      {
        name: 'Recursos Humanos',
        description: 'Gestión del talento, reclutamiento, capacitación y bienestar del personal',
        color: '#10B981',
        active: true
      },
      {
        name: 'Marketing y Comunicación',
        description: 'Estrategias de marketing, publicidad, relaciones públicas y comunicación corporativa',
        color: '#EC4899',
        active: true
      },
      {
        name: 'Ventas',
        description: 'Desarrollo de negocios, gestión de clientes y cumplimiento de objetivos comerciales',
        color: '#F59E0B',
        active: true
      },
      {
        name: 'Tecnología e Innovación',
        description: 'Desarrollo de software, infraestructura tecnológica y transformación digital',
        color: '#8B5CF6',
        active: true
      },
      {
        name: 'Finanzas y Contabilidad',
        description: 'Administración financiera, contabilidad, presupuestos y tesorería',
        color: '#059669',
        active: true
      },
      {
        name: 'Operaciones',
        description: 'Gestión de procesos operativos, logística y eficiencia organizacional',
        color: '#EF4444',
        active: true
      },
      {
        name: 'Atención al Cliente',
        description: 'Soporte, servicio al cliente y gestión de experiencia del usuario',
        color: '#06B6D4',
        active: true
      },
      {
        name: 'Legal y Cumplimiento',
        description: 'Asesoría jurídica, contratos y cumplimiento normativo',
        color: '#6366F1',
        active: true
      },
      {
        name: 'Calidad y Mejora Continua',
        description: 'Sistemas de gestión de calidad, auditorías y optimización de procesos',
        color: '#14B8A6',
        active: true
      }
    ];

    console.log(`\n📦 Insertando ${departments.length} departamentos...`);

    for (const dept of departments) {
      await conn.execute(
        `INSERT INTO organization_departments 
          (organization_id, name, description, color, active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          mainOrg.id,
          dept.name,
          dept.description,
          dept.color,
          dept.active ? 1 : 0
        ]
      );
      console.log(`  ✅ ${dept.name}`);
    }

    // Resumen
    console.log('\n📊 RESUMEN:');
    const [summary] = await conn.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) as active_count
      FROM organization_departments WHERE organization_id = ?`,
      [mainOrg.id]
    );

    const stats = summary[0];
    console.log(`  🏢 Total: ${stats.total} departamentos`);
    console.log(`  ✅ Activos: ${stats.active_count}`);
    console.log(`  ❌ Inactivos: ${stats.total - stats.active_count}`);
    console.log(`  🏢 Organización: ${mainOrg.name}`);

    console.log('\n✅ Departamentos creados exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await conn.end();
  }
}

seedDepartments().catch(console.error);
