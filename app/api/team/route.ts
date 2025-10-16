// Si existe un endpoint POST para alta de colaboradores, forzar role = 'user' en la inserción
// Ejemplo de lógica a agregar en el handler POST:
// const { ...userData } = await request.json();
// await executeQuery('INSERT INTO users (...) VALUES (..., 'user', ...)', [...]);
// Si ya existe, asegúrate de que el campo role se fije a 'user' y no se pueda modificar por el frontend.
import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
});

// GET /api/team - Obtener miembros del equipo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currentUserId = searchParams.get('userId')
    const department = searchParams.get('department') || 'all'
    const search = searchParams.get('search') || ''
    
    if (!currentUserId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario requerido' 
      }, { status: 400 })
    }

    // Obtener organización y permisos del usuario actual
    const [currentUserResult]: any = await pool.query(
      'SELECT organization_id, permissions, role FROM users WHERE id = ?',
      [currentUserId]
    );
    if (!Array.isArray(currentUserResult) || currentUserResult.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario no encontrado' 
      }, { status: 404 })
    }
    
    const currentUser = currentUserResult[0];
    const organizationId = currentUser.organization_id;

    // Verificar permisos: solo admins o usuarios con permiso 'team' pueden ver el equipo
    if (currentUser.role !== 'admin') {
      let permissions = {};
      try {
        permissions = currentUser.permissions ? JSON.parse(currentUser.permissions) : {};
      } catch (e) {
        console.warn('Error parsing permissions:', e);
      }
      
      if (!(permissions as any).team) {
        return NextResponse.json({ 
          success: false, 
          error: 'No tienes permiso para ver el equipo' 
        }, { status: 403 })
      }
    }

    // Obtener miembros del equipo con sus departamentos (incluye al usuario actual)
    let teamQuery = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.profile_image,
        u.total_gems,
        u.created_at as join_date,
        u.first_login,
        d.name as department_name,
        d.color as department_color
      FROM users u
      LEFT JOIN organization_departments d ON u.department_id = d.id
      WHERE u.organization_id = ?
    `;
    let teamParams = [organizationId];

    // Aplicar filtros
    if (department !== 'all') {
      teamQuery += ' AND d.name = ?';
      teamParams.push(department);
    }

    if (search) {
      teamQuery += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.role LIKE ?)';
      const like = `%${search}%`;
      teamParams.push(like, like, like);
    }
    teamQuery += ' ORDER BY u.role DESC, u.name ASC';

  const [teamMembers]: any = await pool.query(teamQuery, teamParams);
  console.log('DEBUG teamMembers:', JSON.stringify(teamMembers));

    // Obtener estadísticas de rendimiento para cada miembro (defensivo)
    const membersWithStats = await Promise.all(
      (teamMembers as any[]).map(async (member: any) => {
        try {
          // Defaults
          let stats = { total_tasks: 0, completed_tasks: 0, avg_rating: null };
          let achievementCount = 0;

          // Obtener estadísticas de tareas (defensivo)
          try {
            const [taskStatsRows]: any = await pool.query(
              `SELECT 
                COUNT(*) as total_tasks,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
                AVG(CASE WHEN status = 'completed' AND rating IS NOT NULL THEN rating ELSE NULL END) as avg_rating
              FROM tasks 
              WHERE assigned_to = ?`,
              [member.id]
            );
            stats = taskStatsRows[0] || stats;
          } catch (innerErr) {
            console.warn('WARN: task stats query failed for member', member.id, (innerErr as any)?.message || innerErr);
          }

          // Obtener logros desbloqueados (tolerante a esquema diferente)
          try {
            const [achievementsRows]: any = await pool.query(
              `SELECT COUNT(*) as total_achievements FROM user_achievements WHERE user_id = ?`,
              [member.id]
            );
            achievementCount = achievementsRows[0]?.total_achievements || 0;
          } catch (innerErr) {
            console.warn('WARN: achievements query failed for member', member.id, (innerErr as any)?.message || innerErr);
            achievementCount = 0;
          }

          // Calcular score de performance (0-100)
          const completionRate = stats.total_tasks > 0 ? (stats.completed_tasks / stats.total_tasks) * 100 : 0;
          const ratingScore = stats.avg_rating ? (stats.avg_rating / 5) * 100 : 50;
          const gemsScore = Math.min((member.total_gems / 1000) * 10, 20);
          const achievementScore = Math.min(achievementCount * 5, 30);

          const performanceScore = Math.round(
            (completionRate * 0.4) + (ratingScore * 0.3) + (gemsScore * 0.15) + (achievementScore * 0.15)
          );

          return {
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role || 'Empleado',
            department: member.department_name || 'Sin asignar',
            departmentColor: member.department_color || '#6B7280',
            profileImage: member.profile_image,
            totalGems: member.total_gems || 0,
            joinDate: member.join_date,
            performance: Math.min(Math.max(performanceScore, 0), 100),
            stats: {
              totalTasks: stats.total_tasks,
              completedTasks: stats.completed_tasks,
              completionRate: Math.round(completionRate),
              avgRating: stats.avg_rating ? parseFloat(stats.avg_rating).toFixed(1) : null,
              achievements: achievementCount
            },
            status: member.first_login ? 'pending' : 'active',
            phone: member.phone || null
          };
        } catch (err) {
          console.error('Error building member stats for', member.id, err);
          return {
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role || 'Empleado',
            department: member.department_name || 'Sin asignar',
            departmentColor: member.department_color || '#6B7280',
            profileImage: member.profile_image,
            totalGems: member.total_gems || 0,
            joinDate: member.join_date,
            performance: 0,
            stats: { totalTasks: 0, completedTasks: 0, completionRate: 0, avgRating: null, achievements: 0 },
            status: 'active',
            phone: member.phone || null
          };
        }
      })
    );

    // Obtener estadísticas generales del equipo
    const [generalStatsRows]: any = await pool.query(
      `SELECT 
        COUNT(DISTINCT u.id) as total_members,
        COUNT(DISTINCT d.id) as total_departments,
        AVG(u.total_gems) as avg_gems
      FROM users u
      LEFT JOIN organization_departments d ON u.department_id = d.id
      WHERE u.organization_id = ?`,
      [organizationId]
    );
    const stats = generalStatsRows[0] || { total_members: 0, total_departments: 0, avg_gems: 0 };

    // Obtener departamentos disponibles
    const [departments]: any = await pool.query(
      `SELECT 
        d.name,
        d.color,
        COUNT(u.id) as member_count
      FROM organization_departments d
      LEFT JOIN users u ON d.id = u.department_id AND u.organization_id = ?
      WHERE d.organization_id = ?
      GROUP BY d.id, d.name, d.color
      ORDER BY d.name ASC`,
      [organizationId, organizationId]
    );

    return NextResponse.json({
      success: true,
      data: {
        teamMembers: membersWithStats,
        departments: (departments as any[]).map((dept: any) => ({
          name: dept.name,
          color: dept.color,
          memberCount: dept.member_count
        })),
        stats: {
          totalMembers: stats.total_members,
          totalDepartments: stats.total_departments,
          avgGems: Math.round(stats.avg_gems || 0),
          departments: (departments as any[]).map((dept: any) => ({
            name: dept.name,
            count: dept.member_count
          }))
        }
      }
    })
  } catch (error) {
    console.error('Error fetching team data:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener datos del equipo' },
      { status: 500 }
    )
  }
}