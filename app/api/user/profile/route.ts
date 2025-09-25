import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [PROFILE] Obteniendo perfil - iniciando...')

    // Para simplificar el demo, vamos a obtener el usuario más reciente que completó el onboarding
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
      WHERE u.onboarding_step = 'completed'
      ORDER BY u.created_at DESC
      LIMIT 1
    `

    console.log('🔍 [PROFILE] Ejecutando consulta...')
    const result = await executeQuery(query, []) as any[]
    
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
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      position: user.position || '',
      bio: user.bio || '',
      city: user.city || '',
      profileImage: user.profile_image || '', // Ahora con la columna real
      organization: {
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

    // Obtener el usuario usando el mismo método exitoso que GET
    const userQuery = `
      SELECT id FROM users 
      WHERE onboarding_step = 'completed'
      ORDER BY created_at DESC
      LIMIT 1
    `
    
    const userResult = await executeQuery(userQuery, [])
    
    if (!Array.isArray(userResult) || userResult.length === 0) {
      console.log('❌ [PROFILE] No se encontró usuario para actualizar')
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const userId = (userResult[0] as any).id
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
