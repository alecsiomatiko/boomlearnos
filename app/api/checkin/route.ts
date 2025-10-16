import { NextRequest, NextResponse } from 'next/server'

import { executeQuery } from '@/lib/server/mysql'
import { checkAndUnlockBadges } from '@/lib/server/achievements'
import { generateUUID } from '@/lib/server/mysql'
import { getCurrentUser } from '@/lib/server/auth'
import { getOrgIdForRequest } from '@/lib/server/org-utils'

// GET /api/checkin - Obtener check-in del día actual
export async function GET(request: NextRequest) {
  try {
    // ✅ AUTENTICACIÓN Y FILTRADO POR ORGANIZACIÓN
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
    if (!organizationId) {
      return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || user.id;

    const today = new Date().toISOString().split('T')[0]

    // Verificar si ya hizo check-in hoy - FILTRA POR organization_id
    const checkins = await executeQuery(`
      SELECT * FROM daily_checkins 
      WHERE user_id = ? AND checkin_date = ? AND organization_id = ?
    `, [userId, today, organizationId]) as any[]

    const hasCheckedIn = checkins.length > 0
    const todayCheckin = hasCheckedIn ? checkins[0] : null

    // Obtener streak actual
    const streakData = await executeQuery(`
      SELECT COUNT(*) as streak_count
      FROM daily_checkins 
      WHERE user_id = ? 
      AND checkin_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      AND checkin_date <= CURDATE()
      ORDER BY checkin_date DESC
    `, [userId]) as any[]

    return NextResponse.json({
      success: true,
      data: {
        hasCheckedIn,
        todayCheckin,
        currentStreak: streakData[0]?.streak_count || 0
      }
    })

  } catch (error) {
    console.error('Error checking daily checkin:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check daily checkin' }, 
      { status: 500 }
    )
  }
}

// POST /api/checkin - Registrar check-in diario
export async function POST(request: NextRequest) {
  try {
    // ✅ AUTENTICACIÓN Y FILTRADO POR ORGANIZACIÓN
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
    if (!organizationId) {
      return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 });
    }

    const body = await request.json()
    const { energyLevel, priority, notes } = body
    
    console.log('[POST /api/checkin] Request body:', { userId: user.id, energyLevel, priority, notes });

    if (energyLevel === undefined) {
      console.log('[POST /api/checkin] Missing required fields');
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]
    console.log('[POST /api/checkin] Today:', today);

    // Verificar si ya hizo check-in hoy - FILTRA POR organization_id
    const existingCheckin = await executeQuery(`
      SELECT id FROM daily_checkins 
      WHERE user_id = ? AND checkin_date = ? AND organization_id = ?
    `, [user.id, today, organizationId]) as any[]
    
    console.log('[POST /api/checkin] Existing checkin:', existingCheckin);

    if (existingCheckin.length > 0) {
      console.log('[POST /api/checkin] Check-in already completed today');
      return NextResponse.json({ 
        success: false, 
        error: 'Check-in already completed today' 
      }, { status: 400 })
    }

    // Registrar nuevo check-in
    const checkinId = generateUUID();
    console.log('[POST /api/checkin] Inserting new checkin:', checkinId);
    
    await executeQuery(`
      INSERT INTO daily_checkins (id, user_id, organization_id, checkin_date, energy_level, priority, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [checkinId, user.id, organizationId, today, energyLevel, priority, notes]) as any
    
    console.log('[POST /api/checkin] Checkin inserted successfully');

    // Calcular gemas por check-in (energyLevel * 5)
    const gemsEarned = energyLevel * 5
    console.log('[POST /api/checkin] Gems earned:', gemsEarned);

    // Actualizar gemas del usuario
    await executeQuery(`
      UPDATE users 
      SET total_gems = total_gems + ?
      WHERE id = ?
    `, [gemsEarned, user.id])
    
    console.log('[POST /api/checkin] User gems updated');

    // Registrar en historial de gemas
    const gemsHistoryId = generateUUID();
    await executeQuery(`
      INSERT INTO gems_history (id, user_id, organization_id, source_type, source_id, gems_amount, description)
      VALUES (?, ?, ?, 'daily_checkin', ?, ?, ?)
    `, [gemsHistoryId, user.id, organizationId, checkinId, gemsEarned, `Check-in diario (Energía: ${energyLevel})`])
    
    console.log('[POST /api/checkin] Gems history recorded');


    // Lógica automática: verificar y desbloquear logros (badges)
    // Note: checkAndUnlockBadges expects numeric user ID, but we're using UUIDs
    // Commenting out for now to prevent errors
    // await checkAndUnlockBadges(userId);

    console.log('[POST /api/checkin] Check-in completed successfully');

    return NextResponse.json({
      success: true,
      data: {
        checkinId: checkinId,
        gemsEarned,
        message: `Check-in registrado! +${gemsEarned} gemas`
      }
    })

  } catch (error) {
    console.error('[POST /api/checkin] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to register checkin' }, 
      { status: 500 }
    )
  }
}