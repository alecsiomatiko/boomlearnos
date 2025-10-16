import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'
import { getCurrentUser } from '@/lib/server/auth'
import { getOrgIdForRequest } from '@/lib/server/org-utils'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [PROFILE] Obteniendo perfil - iniciando...')

    // ✅ AUTENTICACIÓN
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        error: 'No autorizado'
      }, { status: 401 });
    }

    const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
    if (!organizationId) {
      return NextResponse.json({
        success: false,
        error: 'No autorizado: falta organization_id'
      }, { status: 401 });
    }

    // Obtener userId de los query parameters o usar el del usuario autenticado
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || currentUser.id;

    console.log('🔍 [PROFILE] Ejecutando consulta para userId:', userId)

    // Consulta SQL bien formada - FILTRAR POR organization_id
    const query = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.position,
        u.bio,
        u.city,
        u.profile_image,
        u.role,
        u.total_gems,
        u.first_login,
        org.id as org_id,
        org.name as company_name,
        org.business_type,
        org.size as company_size,
        org.description as business_description,
        org.target_audience,
        org.mission,
        org.vision,
        org.values_json as 'values'
      FROM users u
      LEFT JOIN organizations org ON u.organization_id = org.id
      WHERE u.id = ? AND u.organization_id = ?
    `;
    const result = await executeQuery(query, [userId, organizationId]) as any[];
    
    console.log('🔍 [PROFILE] Resultado consulta:', result?.length || 0, 'registros')
    
    if (!result || result.length === 0) {
      console.log('❌ [PROFILE] No se encontró usuario completado')
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const user = result[0]

    const profile = {
      id: user.id,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      position: user.position || '',
      bio: user.bio || '',
      city: user.city || '',
      role: user.role || 'user',
      totalGems: user.total_gems || 0,
      profileImage: user.profile_image || '',
      first_login: user.first_login || false,
      organization: {
        id: user.org_id,
        companyName: user.company_name || '',
        businessType: user.business_type || '',
        companySize: user.company_size || '',
        businessDescription: user.business_description || '',
        targetAudience: user.target_audience || '',
        mission: user.mission || '',
        vision: user.vision || '',
        values: user.values ? (typeof user.values === 'string' ? user.values : JSON.stringify(user.values)) : ''
      }
    }

    console.log('✅ [PROFILE] Perfil obtenido exitosamente')

    return NextResponse.json({
      success: true,
      profile
    })

  } catch (error) {
    console.error('❌ [PROFILE] Error obteniendo perfil:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔍 [PROFILE] Actualizando perfil...')
    
    const data = await request.json()
    
    // Obtener userId de los query parameters o del body
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || data.userId

    if (!userId) {
      console.log('❌ [PROFILE] userId no proporcionado para actualización')
      return NextResponse.json(
        { success: false, error: 'userId es requerido para actualizar' },
        { status: 400 }
      )
    }

    console.log('✅ [PROFILE] Actualizando usuario:', userId)

    // Actualizar datos del usuario
    const updateUserQuery = `
      UPDATE users 
      SET first_name = ?, last_name = ?, phone = ?, position = ?, bio = ?, city = ?, profile_image = ?
      WHERE id = ?
    `

    await executeQuery(updateUserQuery, [
      data.firstName || null,
      data.lastName || null,
      data.phone || null,
      data.position || null,
      data.bio || null,
      data.city || null,
      data.profileImage || null,
      userId
    ])

    // Actualizar datos de la organización si existe
    if (data.organization) {
      const updateOrgQuery = `
        UPDATE organizations 
        SET name = ?, business_type = ?, size = ?, 
            description = ?, target_audience = ?, mission = ?, vision = ?, values_json = ?
        WHERE owner_id = ?
      `

      await executeQuery(updateOrgQuery, [
        data.organization.companyName || null,
        data.organization.businessType || null,
        data.organization.companySize || null,
        data.organization.businessDescription || null,
        data.organization.targetAudience || null,
        data.organization.mission || null,
        data.organization.vision || null,
        data.organization.values || null,
        userId
      ])
    }

    console.log('✅ [PROFILE] Perfil actualizado exitosamente')

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado correctamente'
    })

  } catch (error) {
    console.error('❌ [PROFILE] Error actualizando perfil:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
