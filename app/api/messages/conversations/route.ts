import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'
import { getCurrentUser } from '@/lib/server/auth'
import { getOrgIdForRequest } from '@/lib/server/org-utils'

export async function GET(request: NextRequest) {
  try {
    console.log('💬 [CONVERSATIONS] Obteniendo conversaciones...')
    
    // ✅ AUTENTICACIÓN
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false })
    if (!organizationId) {
      return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 })
    }

    const currentUserId = user.id
    console.log('💬 [CONVERSATIONS] UserId:', currentUserId, 'OrgId:', organizationId)

    // Obtener conversaciones del usuario con información del último mensaje
    // MySQL doesn't support DISTINCT ON, so use a subquery for last message
    const conversations = await executeQuery(
      `SELECT c.id, c.name, c.type, c.description, c.created_at, c.updated_at,
              lm.last_message_content, lm.last_message_type, lm.last_message_time, lm.last_sender_name,
              IFNULL(unread_counts.unread_count, 0) as unread_count,
              IFNULL(member_counts.member_count, 0) as member_count,
              CASE WHEN c.type = 'direct' THEN other_user.name ELSE c.name END as display_name,
              CASE WHEN c.type = 'direct' THEN other_user.role ELSE 'Grupo' END as display_role,
              CASE WHEN c.type = 'direct' THEN other_user.profile_image ELSE NULL END as profile_image
       FROM conversations c
       JOIN conversation_participants cp ON c.id = cp.conversation_id
       LEFT JOIN (
         SELECT m.conversation_id, m.content as last_message_content, m.message_type as last_message_type, m.created_at as last_message_time, u.name as last_sender_name
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE (m.id) IN (
           SELECT MAX(id) FROM messages GROUP BY conversation_id
         )
       ) lm ON c.id = lm.conversation_id
       LEFT JOIN (
         SELECT conversation_id, COUNT(*) as unread_count
         FROM messages m2
         WHERE m2.created_at > '1970-01-01' AND m2.sender_id != ? AND m2.id IS NOT NULL
         GROUP BY conversation_id
       ) unread_counts ON c.id = unread_counts.conversation_id
       LEFT JOIN (
         SELECT conversation_id, COUNT(*) as member_count
         FROM conversation_participants cp2
         GROUP BY conversation_id
       ) member_counts ON c.id = member_counts.conversation_id
       LEFT JOIN (
         SELECT cp3.conversation_id, u.id, u.name, u.role, u.profile_image
         FROM conversation_participants cp3
         JOIN users u ON cp3.user_id = u.id
         WHERE cp3.user_id != ?
       ) other_user ON other_user.conversation_id = c.id
       WHERE cp.user_id = ?
       ORDER BY COALESCE(lm.last_message_time, c.created_at) DESC`,
      [currentUserId, currentUserId, currentUserId]
    ) as any[]

    // Formatear las conversaciones para el frontend
    const formattedConversations = conversations.map(conv => {
      const lastMessageTime = conv.last_message_time
      let timeDisplay = 'Sin mensajes'
      
      if (lastMessageTime) {
        const messageDate = new Date(lastMessageTime)
        const now = new Date()
        const diffHours = Math.abs(now.getTime() - messageDate.getTime()) / (1000 * 60 * 60)
        
        if (diffHours < 24) {
          timeDisplay = messageDate.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        } else if (diffHours < 48) {
          timeDisplay = 'Ayer'
        } else {
          timeDisplay = messageDate.toLocaleDateString('es-ES', { 
            month: 'short', 
            day: 'numeric' 
          })
        }
      }

      let lastMessagePreview = 'Sin mensajes'
      if (conv.last_message_content) {
        if (conv.last_message_type === 'file') {
          lastMessagePreview = `📎 Archivo adjunto`
        } else if (conv.last_message_type === 'image') {
          lastMessagePreview = `📷 Imagen`
        } else {
          const prefix = conv.last_sender_name ? `${conv.last_sender_name}: ` : ''
          lastMessagePreview = `${prefix}${conv.last_message_content}`
          if (lastMessagePreview.length > 50) {
            lastMessagePreview = lastMessagePreview.substring(0, 50) + '...'
          }
        }
      }

      return {
        id: conv.id,
        name: conv.display_name || 'Conversación sin nombre',
        role: conv.display_role || 'Grupo',
        avatar: conv.profile_image || null,
        lastMessage: lastMessagePreview,
        timestamp: timeDisplay,
        unread: conv.unread_count || 0,
        online: false, // Esto requeriría un sistema de presencia en tiempo real
        type: conv.type,
        members: conv.member_count || 0,
        sharedFiles: 0, // Esto se podría calcular después si es necesario
        sharedTasks: 0, // Esto se podría calcular después si es necesario
        isPinned: false, // Columna no existe en DB, siempre false
        lastActivity: timeDisplay,
        description: conv.description || ''
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        conversations: formattedConversations
      }
    })
  } catch (error) {
    console.error('❌ [CONVERSATIONS] Error completo:', error)
    console.error('❌ [CONVERSATIONS] Stack:', (error as Error).stack)
    console.error('❌ [CONVERSATIONS] Message:', (error as Error).message)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener conversaciones',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}