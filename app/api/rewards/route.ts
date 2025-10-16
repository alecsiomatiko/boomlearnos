import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'
import { getCurrentUser } from '@/lib/server/auth'
import { getOrgIdForRequest } from '@/lib/server/org-utils'

// GET /api/rewards - Obtener recompensas disponibles y canjeadas
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
    const category = searchParams.get('category')

    // Obtener datos del usuario - VERIFICA organization_id
    const [userData] = await executeQuery(`
      SELECT name, total_gems, level 
      FROM users 
      WHERE id = ? AND organization_id = ?
    `, [userId, organizationId]) as any[]

    if (!userData) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Obtener recompensas disponibles - FILTRA POR organization_id
    let rewardsQuery = `
      SELECT 
        r.*,
        CASE 
          WHEN r.stock_limit > 0 AND r.claimed_count >= r.stock_limit THEN FALSE
          ELSE r.is_available 
        END as available,
        CASE 
          WHEN ${userData.total_gems} >= r.cost THEN TRUE
          ELSE FALSE 
        END as can_afford
      FROM rewards r
      WHERE r.is_available = TRUE AND r.organization_id = ?
    `

    const params: any[] = [organizationId]
    if (category && category !== 'all') {
      rewardsQuery += ' AND r.category = ?'
      params.push(category)
    }

    rewardsQuery += ' ORDER BY r.cost ASC, r.title ASC'

    const rewards = await executeQuery(rewardsQuery, params) as any[]

    // Obtener recompensas canjeadas por el usuario
    const userRewards = await executeQuery(`
      SELECT 
        ur.*,
        r.title,
        r.description,
        r.category,
        r.rarity,
        r.icon
      FROM user_rewards ur
      JOIN rewards r ON r.id = ur.reward_id
      WHERE ur.user_id = ?
      ORDER BY ur.claimed_at DESC
    `, [userId]) as any[]

    // Obtener categorías disponibles - FILTRA POR organization_id
    const categories = await executeQuery(`
      SELECT DISTINCT category, COUNT(*) as count
      FROM rewards 
      WHERE is_available = TRUE AND organization_id = ?
      GROUP BY category
      ORDER BY category
    `, [organizationId]) as any[]

    const formattedRewards = rewards.map((reward: any) => ({
      id: reward.id,
      title: reward.title,
      description: reward.description,
      cost: reward.cost,
      category: reward.category,
      rarity: reward.rarity,
      icon: reward.icon,
      available: reward.available,
      canAfford: reward.can_afford,
      claimedByUser: 0, // Por ahora, después implementaremos el seguimiento por usuario
      stock: reward.stock_limit,
      maxClaimsPerUser: null
    }))

    const formattedUserRewards = userRewards.map((userReward: any) => ({
      id: userReward.id,
      title: userReward.title,
      description: userReward.description,
      category: userReward.category,
      rarity: userReward.rarity,
      icon: userReward.icon,
      gemsSpent: userReward.gems_spent,
      status: userReward.status,
      claimedAt: userReward.claimed_at,
      deliveredAt: userReward.delivered_at,
      notes: userReward.notes
    }))

    return NextResponse.json({
      success: true,
      data: {
        user: {
          name: userData.name,
          totalGems: userData.total_gems,
          level: userData.level
        },
        rewards: formattedRewards,
        userRewards: formattedUserRewards,
        categories: categories.map((cat: any) => ({
          key: cat.category,
          label: cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
          count: cat.count
        })),
        stats: {
          totalRewardsAvailable: rewards.filter((r: any) => r.available).length,
          totalRewardsClaimed: userRewards.length,
          totalGemsSpent: userRewards.reduce((sum: number, ur: any) => sum + ur.gems_spent, 0)
        }
      }
    })

  } catch (error) {
    console.error('Error fetching rewards:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rewards' }, 
      { status: 500 }
    )
  }
}

// POST /api/rewards - Canjear recompensa
export async function POST(request: NextRequest) {
  try {
    console.log('🎁 [REWARDS] Iniciando canje de recompensa...')
    
    // ✅ AUTENTICACIÓN
    const user = await getCurrentUser(request);
    console.log('🎁 [REWARDS] Usuario autenticado:', user?.id)
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
    console.log('🎁 [REWARDS] OrganizationId:', organizationId)
    
    if (!organizationId) {
      return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 });
    }

    const body = await request.json()
    const { rewardId, notes } = body
    const userId = user.id;

    console.log('🎁 [REWARDS] RewardId:', rewardId, 'UserId:', userId)

    if (!rewardId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Verificar datos del usuario - CON organization_id
    const [userData] = await executeQuery(`
      SELECT total_gems 
      FROM users 
      WHERE id = ? AND organization_id = ?
    `, [userId, organizationId]) as any[]

    console.log('🎁 [REWARDS] Gemas del usuario:', userData?.total_gems)

    if (!userData) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Verificar disponibilidad de la recompensa - CON organization_id
    const [rewardData] = await executeQuery(`
      SELECT * FROM rewards 
      WHERE id = ? AND organization_id = ? AND is_available = TRUE
    `, [rewardId, organizationId]) as any[]

    console.log('🎁 [REWARDS] Recompensa encontrada:', rewardData?.title, 'Costo:', rewardData?.cost)

    if (!rewardData) {
      return NextResponse.json({ success: false, error: 'Reward not found or not available' }, { status: 404 })
    }

    // Verificar si el usuario tiene suficientes gemas
    if (userData.total_gems < rewardData.cost) {
      console.log('❌ [REWARDS] Gemas insuficientes:', userData.total_gems, '<', rewardData.cost)
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient gems',
        required: rewardData.cost,
        available: userData.total_gems
      }, { status: 400 })
    }

    // Verificar límite de stock
    if (rewardData.stock_limit > 0 && rewardData.claimed_count >= rewardData.stock_limit) {
      return NextResponse.json({ success: false, error: 'Reward out of stock' }, { status: 400 })
    }

    // Iniciar transacción
    await executeQuery('START TRANSACTION', [])

    try {
      console.log('🎁 [REWARDS] Iniciando transacción...')
      
      // Registrar el canje
      const claimResult = await executeQuery(`
        INSERT INTO user_rewards (id, user_id, reward_id, gems_spent, status, notes, organization_id)
        VALUES (UUID(), ?, ?, ?, 'pending', ?, ?)
      `, [userId, rewardId, rewardData.cost, notes || null, organizationId]) as any

      console.log('✅ [REWARDS] Canje registrado')

      // Deducir gemas del usuario
      await executeQuery(`
        UPDATE users 
        SET total_gems = total_gems - ?
        WHERE id = ?
      `, [rewardData.cost, userId])

      console.log('✅ [REWARDS] Gemas deducidas:', rewardData.cost)

      // Registrar en historial de gemas (con organization_id y source_id como UUID)
      await executeQuery(`
        INSERT INTO gems_history (id, user_id, source_type, source_id, gems_amount, description, organization_id)
        VALUES (UUID(), ?, 'reward_claim', ?, ?, ?, ?)
      `, [userId, rewardId, -rewardData.cost, `Recompensa canjeada: ${rewardData.title}`, organizationId])

      console.log('✅ [REWARDS] Historial actualizado')

      // Actualizar contador de la recompensa
      await executeQuery(`
        UPDATE rewards 
        SET claimed_count = claimed_count + 1
        WHERE id = ?
      `, [rewardId])

      console.log('✅ [REWARDS] Contador actualizado')

      // Confirmar transacción
      await executeQuery('COMMIT', [])

      console.log('✅ [REWARDS] Transacción completada exitosamente')

      return NextResponse.json({
        success: true,
        data: {
          claimId: claimResult.insertId,
          message: `Recompensa "${rewardData.title}" canjeada exitosamente`,
          gemsSpent: rewardData.cost,
          remainingGems: userData.total_gems - rewardData.cost,
          status: 'pending'
        }
      })

    } catch (transactionError) {
      console.error('❌ [REWARDS] Error en transacción:', transactionError)
      // Revertir transacción en caso de error
      await executeQuery('ROLLBACK', [])
      throw transactionError
    }

  } catch (error) {
    console.error('Error claiming reward:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to claim reward' }, 
      { status: 500 }
    )
  }
}

// PUT /api/rewards/status - Actualizar estado de recompensa canjeada (admin)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { claimId, status, notes, deliveredAt } = body

    if (!claimId || !status) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const validStatuses = ['pending', 'approved', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
    }

    const result = await executeQuery(`
      UPDATE user_rewards 
      SET 
        status = ?,
        notes = COALESCE(?, notes),
        delivered_at = CASE WHEN ? = 'delivered' THEN COALESCE(?, NOW()) ELSE delivered_at END
      WHERE id = ?
    `, [status, notes, status, deliveredAt, claimId])

    return NextResponse.json({
      success: true,
      message: 'Reward status updated successfully'
    })

  } catch (error) {
    console.error('Error updating reward status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update reward status' }, 
      { status: 500 }
    )
  }
}