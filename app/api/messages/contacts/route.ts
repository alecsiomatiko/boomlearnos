import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'
import { getCurrentUser } from '@/lib/server/auth'
import { getOrgIdForRequest } from '@/lib/server/org-utils'

export async function GET(request: NextRequest) {
  try {
    console.log('👥 [CONTACTS] Obteniendo contactos...')
    
    // ✅ AUTENTICACIÓN
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false })
    if (!organizationId) {
      return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 })
    }

    // Verificar permisos: solo admins o usuarios con permiso 'messages' pueden ver contactos
    if (user.role !== 'admin') {
      const [userPerms]: any = await executeQuery(
        'SELECT permissions FROM users WHERE id = ?',
        [user.id]
      );
      
      let permissions = {};
      try {
        permissions = userPerms[0]?.permissions ? JSON.parse(userPerms[0].permissions) : {};
      } catch (e) {
        console.warn('Error parsing permissions:', e);
      }
      
      if (!(permissions as any).messages) {
        return NextResponse.json({ 
          success: false, 
          error: 'No tienes permiso para usar mensajes' 
        }, { status: 403 })
      }
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const currentUserId = user.id

    console.log('👥 [CONTACTS] UserId:', currentUserId, 'OrgId:', organizationId, 'Search:', search)

    // Construir query base para obtener contactos de la organización
    let baseQuery = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.profile_image,
        u.first_login,
        d.name as department_name,
        d.color as department_color,
        (
          SELECT c.id
          FROM conversations c
          JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
          JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
          WHERE c.type = 'direct'
            AND cp1.user_id = ?
            AND cp2.user_id = u.id
          LIMIT 1
        ) as existing_conversation_id
      FROM users u
      LEFT JOIN organization_departments d ON u.department_id = d.id
      WHERE u.organization_id = ?
        AND u.id != ?
        AND u.id IS NOT NULL
    `

    const params: any[] = [currentUserId, organizationId, currentUserId]

    // Aplicar filtro de búsqueda si se proporciona
    if (search.trim()) {
      baseQuery += ` AND (
        LOWER(u.name) LIKE LOWER(?) OR
        LOWER(u.email) LIKE LOWER(?) OR
        LOWER(u.role) LIKE LOWER(?) OR
        LOWER(d.name) LIKE LOWER(?)
      )`
      const like = `%${search}%`
      params.push(like, like, like, like)
    }

    const finalQuery = baseQuery + ' ORDER BY u.name ASC'
    const contacts = await executeQuery(finalQuery, params) as any[]

    // Formatear contactos para el frontend
    const formattedContacts = contacts.map(contact => ({
      id: contact.id,
      name: contact.name || 'Usuario sin nombre',
      role: contact.role || 'Sin rol',
      avatar: contact.profile_image,
      online: false, // Esto requeriría un sistema de presencia en tiempo real
      department: contact.department_name || 'Sin departamento',
      departmentColor: contact.department_color || '#6B7280',
      email: contact.email || '',
      phone: contact.phone || '',
      status: contact.first_login ? 'Pendiente primer login' : 'Activo',
      existingConversationId: contact.existing_conversation_id
    }))

    return NextResponse.json({
      success: true,
      data: {
        contacts: formattedContacts
      }
    })
  } catch (error) {
    console.error('❌ [CONTACTS] Error completo:', error)
    console.error('❌ [CONTACTS] Stack:', (error as Error).stack)
    console.error('❌ [CONTACTS] Message:', (error as Error).message)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener contactos',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('👥 [CONTACTS] Creando conversación...')
    
    // ✅ AUTENTICACIÓN
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false })
    if (!organizationId) {
      return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 })
    }

    const { contactId } = await request.json()
    const userId = user.id

    console.log('👥 [CONTACTS] CreandoConversación:', userId, '→', contactId)

    if (!contactId) {
      return NextResponse.json(
        { success: false, error: 'ID de contacto requerido' },
        { status: 400 }
      )
    }

    // Verificar que el contacto está en la misma organización
    const usersCheck = await executeQuery(`
      SELECT organization_id FROM users WHERE id = ? AND organization_id = ?
    `, [contactId, organizationId]) as any[]

    if (usersCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se puede crear conversación con usuarios de otras organizaciones' },
        { status: 403 }
      )
    }

    // Verificar si ya existe una conversación directa entre estos usuarios
    const existingConversation = await executeQuery(`
      SELECT c.id
      FROM conversations c
      JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
      JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
      WHERE c.type = 'direct'
        AND cp1.user_id = ?
        AND cp2.user_id = ?
      LIMIT 1
    `, [userId, contactId]) as any[]

    if (existingConversation.length > 0) {
      console.log('👥 [CONTACTS] Conversación existente:', existingConversation[0].id)
      return NextResponse.json({
        success: true,
        data: {
          conversationId: existingConversation[0].id,
          isNew: false
        }
      })
    }

    // Crear nueva conversación directa
    const newConversationResult = await executeQuery(`
      INSERT INTO conversations (id, type, created_by)
      VALUES (UUID(), 'direct', ?)
    `, [userId]) as any

    // Obtener el ID de la conversación recién creada
    const [newConversation] = await executeQuery(`
      SELECT id FROM conversations WHERE created_by = ? ORDER BY created_at DESC LIMIT 1
    `, [userId]) as any[]

    const conversationId = newConversation.id

    console.log('✅ [CONTACTS] Nueva conversación creada:', conversationId)

    // Agregar ambos usuarios como participantes
    await executeQuery(`
      INSERT INTO conversation_participants (id, conversation_id, user_id)
      VALUES 
        (UUID(), ?, ?),
        (UUID(), ?, ?)
    `, [conversationId, userId, conversationId, contactId])

    return NextResponse.json({
      success: true,
      data: {
        conversationId: conversationId,
        isNew: true
      }
    })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear conversación' },
      { status: 500 }
    )
  }
}