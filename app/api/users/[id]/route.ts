import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/mysql'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    console.log('[GET /api/users/[id]] Fetching user:', userId)

    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.query(
        `SELECT id, email, first_name, last_name, role, level, total_gems, current_streak, 
         longest_streak, energy, last_checkin, organization_id, current_organization_id, 
         created_at, updated_at
         FROM users 
         WHERE id = ?`,
        [userId]
      )

      const users = rows as any[]
      if (users.length === 0) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        )
      }

      const user = users[0]
      
      // Convert to camelCase for frontend
      const userData = {
        id: user.id,
        email: user.email,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        level: user.level?.toString() || '1',
        total_gems: user.total_gems || 0,
        currentStreak: user.current_streak || 0,
        longestStreak: user.longest_streak || 0,
        energy: user.energy || 0,
        lastCheckin: user.last_checkin,
        organizationId: user.organization_id,
        currentOrganizationId: user.current_organization_id,
      }

      console.log('[GET /api/users/[id]] User data:', userData)

      return NextResponse.json({
        success: true,
        data: userData
      })
    } finally {
      conn.release()
    }
  } catch (error) {
    console.error('[GET /api/users/[id]] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}
