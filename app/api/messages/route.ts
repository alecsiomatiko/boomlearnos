import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'

// GET /api/messages - Obtener conversaciones y mensajes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const conversationId = searchParams.get('conversationId')
    const type = searchParams.get('type') || 'all' // all, conversations, messages

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
    }

    // Si se solicita una conversación específica
    if (conversationId) {
      // Verificar que el usuario tenga acceso a la conversación
      const [conversation] = await executeQuery(`
        SELECT c.*, 
               u1.name as creator_name,
               u2.name as recipient_name
        FROM conversations c
        LEFT JOIN users u1 ON c.created_by = u1.id
        LEFT JOIN users u2 ON c.recipient_id = u2.id
        WHERE c.id = ? AND (c.created_by = ? OR c.recipient_id = ?)
      `, [conversationId, userId, userId]) as any[]

      if (!conversation) {
        return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 })
      }

      // Obtener mensajes de la conversación
      const messages = await executeQuery(`
        SELECT m.*, u.name as sender_name, COALESCE(u.avatar_url, u.profile_image) as sender_avatar
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = ?
        ORDER BY m.created_at ASC
      `, [conversationId]) as any[]

      // Marcar mensajes como leídos
      await executeQuery(`
        UPDATE messages 
        SET is_read = TRUE, read_at = NOW()
        WHERE conversation_id = ? AND sender_id != ? AND is_read = FALSE
      `, [conversationId, userId])

      return NextResponse.json({
        success: true,
        data: {
          conversation: {
            id: conversation.id,
            title: conversation.title,
            createdBy: conversation.created_by,
            recipientId: conversation.recipient_id,
            creatorName: conversation.creator_name,
            recipientName: conversation.recipient_name,
            isActive: conversation.is_active,
            createdAt: conversation.created_at,
            lastActivity: conversation.last_activity
          },
          messages: messages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            senderId: msg.sender_id,
            senderName: msg.sender_name,
            senderAvatar: msg.sender_avatar,
            messageType: msg.message_type,
            isRead: msg.is_read,
            readAt: msg.read_at,
            createdAt: msg.created_at,
            isOwnMessage: msg.sender_id == userId
          }))
        }
      })
    }

    // Obtener lista de conversaciones del usuario
    const conversations = await executeQuery(`
      SELECT DISTINCT
        c.id,
        c.title,
        c.created_by,
        c.recipient_id,
        c.is_active,
        c.created_at,
        c.last_activity,
        CASE 
          WHEN c.created_by = ? THEN recipient.name
          ELSE creator.name
        END as other_user_name,
        CASE 
          WHEN c.created_by = ? THEN COALESCE(recipient.avatar_url, recipient.profile_image)
          ELSE COALESCE(creator.avatar_url, creator.profile_image)
        END as other_user_avatar,
        (SELECT content FROM messages 
         WHERE conversation_id = c.id 
         ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*) FROM messages 
         WHERE conversation_id = c.id 
         AND sender_id != ? 
         AND is_read = FALSE) as unread_count
      FROM conversations c
      LEFT JOIN users creator ON c.created_by = creator.id
      LEFT JOIN users recipient ON c.recipient_id = recipient.id
      WHERE c.created_by = ? OR c.recipient_id = ?
      ORDER BY c.last_activity DESC, c.created_at DESC
    `, [userId, userId, userId, userId, userId]) as any[]

    // Obtener estadísticas
    const [stats] = await executeQuery(`
      SELECT 
        COUNT(DISTINCT c.id) as total_conversations,
        SUM(CASE WHEN c.is_active THEN 1 ELSE 0 END) as active_conversations,
        (SELECT COUNT(*) FROM messages m
         JOIN conversations c2 ON m.conversation_id = c2.id
         WHERE (c2.created_by = ? OR c2.recipient_id = ?)
         AND m.sender_id != ?
         AND m.is_read = FALSE) as total_unread
      FROM conversations c
      WHERE c.created_by = ? OR c.recipient_id = ?
    `, [userId, userId, userId, userId, userId]) as any[]

    return NextResponse.json({
      success: true,
      data: {
        conversations: conversations.map((conv: any) => ({
          id: conv.id,
          title: conv.title,
          otherUserName: conv.other_user_name,
          otherUserAvatar: conv.other_user_avatar,
          lastMessage: conv.last_message,
          unreadCount: conv.unread_count,
          isActive: conv.is_active,
          lastActivity: conv.last_activity,
          createdAt: conv.created_at
        })),
        stats: {
          totalConversations: stats?.total_conversations || 0,
          activeConversations: stats?.active_conversations || 0,
          totalUnread: stats?.total_unread || 0
        }
      }
    })

  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' }, 
      { status: 500 }
    )
  }
}

// POST /api/messages - Crear nueva conversación o enviar mensaje
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { senderId, recipientId, conversationId, content, messageType = 'text' } = body

    if (!senderId || !content) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    let finalConversationId = conversationId

    // Si no hay conversationId, crear nueva conversación
    if (!conversationId && recipientId) {
      // Verificar si ya existe una conversación entre estos usuarios
      const [existingConversation] = await executeQuery(`
        SELECT id FROM conversations
        WHERE (created_by = ? AND recipient_id = ?) 
           OR (created_by = ? AND recipient_id = ?)
        ORDER BY created_at DESC
        LIMIT 1
      `, [senderId, recipientId, recipientId, senderId]) as any[]

      if (existingConversation) {
        finalConversationId = existingConversation.id
      } else {
        // Obtener nombres para el título
        const [senderData] = await executeQuery('SELECT name FROM users WHERE id = ?', [senderId]) as any[]
        const [recipientData] = await executeQuery('SELECT name FROM users WHERE id = ?', [recipientId]) as any[]
        
        const title = `${senderData?.name || 'Usuario'} - ${recipientData?.name || 'Usuario'}`
        
        const conversationResult = await executeQuery(`
          INSERT INTO conversations (title, created_by, recipient_id, is_active, last_activity)
          VALUES (?, ?, ?, TRUE, NOW())
        `, [title, senderId, recipientId]) as any

        finalConversationId = conversationResult.insertId
      }
    }

    if (!finalConversationId) {
      return NextResponse.json({ success: false, error: 'Conversation ID required' }, { status: 400 })
    }

    // Crear el mensaje
    const messageResult = await executeQuery(`
      INSERT INTO messages (conversation_id, sender_id, content, message_type, is_read)
      VALUES (?, ?, ?, ?, FALSE)
    `, [finalConversationId, senderId, content, messageType]) as any

    // Actualizar última actividad de la conversación
    await executeQuery(`
      UPDATE conversations 
      SET last_activity = NOW()
      WHERE id = ?
    `, [finalConversationId])

    // Obtener datos del mensaje creado
    const [newMessage] = await executeQuery(`
      SELECT m.*, u.name as sender_name, COALESCE(u.avatar_url, u.profile_image) as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `, [messageResult.insertId]) as any[]

    return NextResponse.json({
      success: true,
      data: {
          message: {
          id: newMessage.id,
          conversationId: newMessage.conversation_id,
          content: newMessage.content,
          senderId: newMessage.sender_id,
          senderName: newMessage.sender_name,
            senderAvatar: newMessage.sender_avatar,
          messageType: newMessage.message_type,
          isRead: newMessage.is_read,
          createdAt: newMessage.created_at
        }
      }
    })

  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create message' }, 
      { status: 500 }
    )
  }
}

// PUT /api/messages - Marcar mensajes como leídos
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageIds, conversationId, userId } = body

    if (messageIds && messageIds.length > 0) {
      // Marcar mensajes específicos como leídos
      const placeholders = messageIds.map(() => '?').join(',')
      await executeQuery(`
        UPDATE messages 
        SET is_read = TRUE, read_at = NOW()
        WHERE id IN (${placeholders}) AND sender_id != ?
      `, [...messageIds, userId])
    } else if (conversationId) {
      // Marcar todos los mensajes de una conversación como leídos
      await executeQuery(`
        UPDATE messages 
        SET is_read = TRUE, read_at = NOW()
        WHERE conversation_id = ? AND sender_id != ? AND is_read = FALSE
      `, [conversationId, userId])
    }

    return NextResponse.json({
      success: true,
      message: 'Messages marked as read'
    })

  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to mark messages as read' }, 
      { status: 500 }
    )
  }
}