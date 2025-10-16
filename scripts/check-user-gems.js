require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkUserGems() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  console.log('💎 VERIFICANDO GEMAS DE USUARIOS\n');
  console.log('================================\n');

  try {
    // Obtener usuarios con sus gemas
    const [users] = await connection.query(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.total_gems,
        o.name as org_name
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      WHERE u.role = 'admin'
      ORDER BY u.email
    `);

    console.log('👥 USUARIOS:\n');
    users.forEach(user => {
      console.log(`   ${user.email}`);
      console.log(`   - Nombre: ${user.first_name} ${user.last_name}`);
      console.log(`   - Organización: ${user.org_name}`);
      console.log(`   - Gemas: ${user.total_gems}`);
      console.log(`   - ID: ${user.id}\n`);
    });

    // Verificar historial de gemas
    console.log('📊 HISTORIAL DE GEMAS:\n');
    for (const user of users) {
      const [history] = await connection.query(`
        SELECT 
          gems_amount,
          description,
          source_type,
          created_at
        FROM gems_history
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 10
      `, [user.id]);

      console.log(`   ${user.email}:`);
      if (history.length === 0) {
        console.log(`      No hay historial de gemas\n`);
      } else {
        history.forEach(h => {
          const date = new Date(h.created_at).toLocaleString();
          console.log(`      ${h.gems_amount > 0 ? '+' : ''}${h.gems_amount} - ${h.description} (${date})`);
        });
        
        const total = history.reduce((sum, h) => sum + h.gems_amount, 0);
        console.log(`      Total en historial: ${total} gemas\n`);
      }
    }

    // Calcular gemas desde historial y comparar con total_gems
    console.log('🔍 VERIFICACIÓN DE INTEGRIDAD:\n');
    for (const user of users) {
      const [historySum] = await connection.query(`
        SELECT COALESCE(SUM(gems_amount), 0) as total
        FROM gems_history
        WHERE user_id = ?
      `, [user.id]);

      const historyTotal = historySum[0].total;
      const userTotal = user.total_gems;
      const match = historyTotal === userTotal;

      console.log(`   ${user.email}:`);
      console.log(`      Total en users.total_gems: ${userTotal}`);
      console.log(`      Total en gems_history: ${historyTotal}`);
      console.log(`      ${match ? '✅ Coincide' : '❌ NO COINCIDE'}\n`);

      if (!match) {
        console.log(`      ⚠️  Diferencia: ${historyTotal - userTotal}`);
        console.log(`      💡 Corrigiendo total_gems a ${historyTotal}...\n`);
        
        await connection.query(`
          UPDATE users SET total_gems = ? WHERE id = ?
        `, [historyTotal, user.id]);
        
        console.log(`      ✅ Corregido\n`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkUserGems();
