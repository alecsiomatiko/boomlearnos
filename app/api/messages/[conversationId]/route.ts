import { NextRequest, NextResponse } from 'next/server'
import { executeQuery, pool } from '@/lib/server/mysql'
import { getCurrentUser } from '@/lib/server/auth'
import { getOrgIdForRequest } from '@/lib/server/org-utils'

export async function GET(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    console.log('💬 [MESSAGES] Obteniendo mensajes...')
    
    // ✅ AUTENTICACIÓN
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false })
    if (!organizationId) {
      return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 })
    }

    const { conversationId } = await params
    const currentUserId = user.id

    console.log('💬 [MESSAGES] ConversationId:', conversationId, 'UserId:', currentUserId)

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'ID de conversación requerido' },
        { status: 400 }
      )
    }

    // Verificar que el usuario es participante de la conversación
    const participantCheck = await executeQuery(
      'SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [conversationId, currentUserId]
    ) as any[]

    if (participantCheck.length === 0) {
      return NextResponse.json({ success: false, error: 'No tienes acceso a esta conversación' }, { status: 403 })
    }

    // Obtener mensajes de la conversación
    const messages = await executeQuery(
      `SELECT m.id, m.content, m.message_type, m.file_url, m.created_at,
              u.id as sender_id, u.name as sender_name, u.profile_image as sender_avatar
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC`,
      [conversationId]
    ) as any[]

    // Obtener reacciones por mensaje y agregarlas en JS (opcional - tabla puede no existir)
    const messageIds = messages.map(m => m.id)
    let reactionsByMessage: Record<string, any[]> = {}
    if (messageIds.length > 0) {
      try {
        const placeholders = messageIds.map(() => '?').join(',')
        const reactionsRaw = await executeQuery(
          `SELECT mr.message_id, mr.reaction, COUNT(*) as reaction_count, GROUP_CONCAT(u.name SEPARATOR ',') as user_names
           FROM message_reactions mr
           JOIN users u ON mr.user_id = u.id
           WHERE mr.message_id IN (${placeholders})
           GROUP BY mr.message_id, mr.reaction`,
          messageIds
        ) as any[]

        reactionsRaw.forEach(r => {
          if (!reactionsByMessage[r.message_id]) reactionsByMessage[r.message_id] = []
          reactionsByMessage[r.message_id].push({ reaction: r.reaction, count: r.reaction_count, users: (r.user_names || '').split(',') })
        })
      } catch (error) {
        console.log('⚠️ [MESSAGES] Tabla message_reactions no existe, continuando sin reacciones')
        // Continuar sin reacciones si la tabla no existe
      }
    }

    // Formatear mensajes para el frontend
    const formattedMessages = messages.map(msg => {
      const messageTime = new Date(msg.created_at)
      const timeDisplay = messageTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      const reactionData = reactionsByMessage[msg.id] || []
      const reactions = reactionData.flatMap((r: any) => Array(r.count).fill(r.reaction))

      return {
        id: msg.id,
        senderId: msg.sender_id.toString() === currentUserId ? 'me' : msg.sender_id,
        senderName: msg.sender_id.toString() === currentUserId ? 'Tú' : msg.sender_name,
        senderAvatar: msg.sender_avatar,
        content: msg.content,
        timestamp: timeDisplay,
        type: msg.message_type || 'text',
        fileUrl: msg.file_url,
        reactions: reactions,
        isRead: true
      }
    })

    // Actualizar last_read_at del usuario para esta conversación
    // NOTA: Comentado porque last_read_at no existe en conversation_participants
    // await executeQuery('UPDATE conversation_participants SET last_read_at = CURRENT_TIMESTAMP WHERE conversation_id = ? AND user_id = ?', [conversationId, currentUserId])

    return NextResponse.json({
      success: true,
      data: {
        messages: formattedMessages
      }
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener mensajes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    console.log('💬 [MESSAGES] Enviando mensaje...')
    
    // ✅ AUTENTICACIÓN
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false })
    if (!organizationId) {
      return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 })
    }

    const { conversationId } = await params
    const { content, type = 'text', fileName, fileUrl, replyTo } = await request.json()
    const userId = user.id

    console.log('💬 [MESSAGES] ConversationId:', conversationId, 'UserId:', userId, 'Content:', content?.substring(0, 50))

    if (!conversationId || !content) {
      return NextResponse.json(
        { success: false, error: 'Datos de mensaje incompletos' },
        { status: 400 }
      )
    }

    // Verificar que el usuario es participante de la conversación
    const participantCheckPost = await executeQuery(
      'SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    ) as any[]

    if (participantCheckPost.length === 0) {
      return NextResponse.json({ success: false, error: 'No tienes acceso a esta conversación' }, { status: 403 })
    }

    // Insertar el nuevo mensaje
    const conn = await pool.getConnection()
    let insertId: number | null = null
    try {
      const [insertResult] = await conn.query(
        `INSERT INTO messages (conversation_id, sender_id, content, message_type, created_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [conversationId, userId, content, type]
      ) as any
      insertId = insertResult.insertId
    } finally {
      conn.release()
    }

    // Actualizar timestamp de la conversación
    await executeQuery('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [conversationId])

    // Obtener información del remitente para la respuesta
    const senderInfo = await executeQuery('SELECT name, profile_image FROM users WHERE id = ?', [userId]) as any[]
    const sender = senderInfo[0]
    const [newRow] = await executeQuery('SELECT created_at FROM messages WHERE id = ?', [insertId]) as any[]
    const messageTime = new Date(newRow.created_at)
    const timeDisplay = messageTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

    return NextResponse.json({
      success: true,
      data: {
        message: {
          id: insertId,
          senderId: 'me',
          senderName: 'Tú',
          senderAvatar: sender.profile_image,
          content: content,
          timestamp: timeDisplay,
          type: type,
          reactions: [],
          isRead: true
        }
      }
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { success: false, error: 'Error al enviar mensaje' },
      { status: 500 }
    )
  }
}