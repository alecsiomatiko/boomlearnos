"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  Send,
  Search,
  Phone,
  Video,
  MoreHorizontal,
  Paperclip,
  Smile,
  Info,
  Users,
  FileText,
  CheckSquare,
  Pin,
  Settings,
} from "lucide-react"
import { initializeAndGetUserData } from "@/lib/data-utils"
import type { User } from "@/types"

export default function MensajesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [selectedChat, setSelectedChat] = useState<number | null>(1)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"directorio" | "chats">("chats")
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    const currentUser = initializeAndGetUserData()
    setUser(currentUser)
  }, [])

  const conversations = [
    {
      id: 1,
      name: "Equipo de Marketing",
      role: "Grupo",
      avatar: "/placeholder.svg?height=40&width=40&text=EM",
      lastMessage: "Ana: ¿Revisamos la nueva campaña de redes sociales para el Q4?",
      timestamp: "10:30 AM",
      unread: 3,
      online: true,
      type: "group",
      members: 5,
      sharedFiles: 3,
      sharedTasks: 2,
      isPinned: true,
      lastActivity: "Hace 2 min",
      description: "Equipo encargado de las estrategias de marketing digital y campañas publicitarias.",
    },
    {
      id: 2,
      name: "JUAN PABLO",
      role: "Administrador",
      avatar: "/placeholder.svg?height=40&width=40&text=JP",
      lastMessage: "El deploy de producción está programado para mañana a las 3 PM",
      timestamp: "9:45 AM",
      unread: 0,
      online: true,
      type: "direct",
      members: 1,
      sharedFiles: 8,
      sharedTasks: 5,
      isPinned: false,
      lastActivity: "En línea",
      description: "Administrador del sistema con acceso completo a todas las funcionalidades.",
    },
    {
      id: 3,
      name: "JUAN PABLO",
      role: "Administrador",
      avatar: "/placeholder.svg?height=40&width=40&text=JP",
      lastMessage: "Los reportes de engagement están listos para revisión",
      timestamp: "Ayer",
      unread: 1,
      online: false,
      type: "direct",
      members: 1,
      sharedFiles: 2,
      sharedTasks: 1,
      isPinned: false,
      lastActivity: "Hace 2 horas",
      description: "Conversación secundaria para temas administrativos específicos.",
    },
  ]

  const directoryContacts = [
    {
      id: 1,
      name: "Ana García",
      role: "Gerente de Ventas",
      avatar: "/placeholder.svg?height=40&width=40&text=AG",
      online: true,
      department: "Ventas",
      email: "ana.garcia@empresa.com",
      phone: "+1 234 567 8901",
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      role: "Desarrollador Senior",
      avatar: "/placeholder.svg?height=40&width=40&text=CR",
      online: false,
      department: "Desarrollo",
      email: "carlos.rodriguez@empresa.com",
      phone: "+1 234 567 8902",
    },
    {
      id: 3,
      name: "María López",
      role: "Especialista en Marketing",
      avatar: "/placeholder.svg?height=40&width=40&text=ML",
      online: true,
      department: "Marketing",
      email: "maria.lopez@empresa.com",
      phone: "+1 234 567 8903",
    },
    {
      id: 4,
      name: "Luis Martínez",
      role: "Analista de Datos",
      avatar: "/placeholder.svg?height=40&width=40&text=LM",
      online: false,
      department: "Análisis",
      email: "luis.martinez@empresa.com",
      phone: "+1 234 567 8904",
    },
    {
      id: 5,
      name: "Sofia Chen",
      role: "Diseñadora UX/UI",
      avatar: "/placeholder.svg?height=40&width=40&text=SC",
      online: true,
      department: "Diseño",
      email: "sofia.chen@empresa.com",
      phone: "+1 234 567 8905",
    },
  ]

  // Mensajes específicos para cada conversación
  const messagesByConversation: { [key: number]: any[] } = {
    1: [
      {
        id: 1,
        senderId: 2,
        senderName: "Ana García",
        content: "Hola, ¿cómo va el proyecto de redes sociales?",
        timestamp: "10:25 AM",
        type: "text",
        reactions: ["👍"],
        isRead: true,
      },
      {
        id: 2,
        senderId: "me",
        senderName: "Tú",
        content: "¡Avanzando bien! Estamos terminando la fase de diseño",
        timestamp: "10:26 AM",
        type: "text",
        reactions: [],
        isRead: true,
      },
      {
        id: 3,
        senderId: 2,
        senderName: "Ana García",
        content: "Perfecto! ¿Necesitas ayuda con algo?",
        timestamp: "10:27 AM",
        type: "text",
        reactions: [],
        isRead: true,
      },
      {
        id: 4,
        senderId: "me",
        senderName: "Tú",
        content: "Sí, necesito revisar los mockups. ¿Podrías darme tu opinión?",
        timestamp: "10:28 AM",
        type: "text",
        reactions: [],
        isRead: false,
      },
    ],
    2: [
      {
        id: 1,
        senderId: 2,
        senderName: "JUAN PABLO",
        content: "¿Podemos revisar la campaña de redes sociales para el próximo trimestre?",
        timestamp: "10:25 AM",
        type: "text",
        reactions: ["👍", "❤️"],
        isRead: true,
      },
      {
        id: 2,
        senderId: "me",
        senderName: "Tú",
        content: "¡Por supuesto! Los números del último mes se ven muy prometedores. ¿Tienes los reportes listos?",
        timestamp: "10:26 AM",
        type: "text",
        reactions: [],
        isRead: true,
      },
      {
        id: 3,
        senderId: 2,
        senderName: "JUAN PABLO",
        content: "Adjunto el análisis de engagement de las últimas campañas",
        timestamp: "10:27 AM",
        type: "file",
        fileName: "Analisis_Engagement_Q3.pdf",
        reactions: ["📊"],
        isRead: true,
      },
      {
        id: 4,
        senderId: 2,
        senderName: "JUAN PABLO",
        content: "Excelente trabajo equipo. ¿Podemos programar una reunión para mañana?",
        timestamp: "10:28 AM",
        type: "text",
        reactions: [],
        isRead: true,
      },
      {
        id: 5,
        senderId: "me",
        senderName: "Tú",
        content: "Perfecto, ¿qué tal a las 2 PM en la sala de juntas?",
        timestamp: "10:29 AM",
        type: "text",
        reactions: [],
        isRead: false,
      },
    ],
    3: [
      {
        id: 1,
        senderId: 2,
        senderName: "JUAN PABLO",
        content: "Los reportes de la semana están listos para revisión",
        timestamp: "9:15 AM",
        type: "text",
        reactions: [],
        isRead: true,
      },
      {
        id: 2,
        senderId: "me",
        senderName: "Tú",
        content: "Perfecto, ¿podrías enviarlos por email también?",
        timestamp: "9:16 AM",
        type: "text",
        reactions: [],
        isRead: true,
      },
      {
        id: 3,
        senderId: 2,
        senderName: "JUAN PABLO",
        content: "¡Claro! Ya los envié. Revisa tu bandeja de entrada",
        timestamp: "9:17 AM",
        type: "text",
        reactions: ["✅"],
        isRead: false,
      },
    ],
  }

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredContacts = directoryContacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectedConversation = conversations.find((conv) => conv.id === selectedChat)
  const currentMessages = selectedChat ? messagesByConversation[selectedChat] || [] : []

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
      }, 1000)
      setNewMessage("")
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Main Chat Interface - Fixed 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
          {/* Column 1: Sidebar - Conversations List */}
          <div className="lg:col-span-3">
            <Card className="bg-white shadow-lg border-0 rounded-3xl h-full">
              <CardHeader className="pb-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rounded-2xl border-gray-200 bg-gray-50"
                  />
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 rounded-2xl p-1">
                  <button
                    onClick={() => setActiveTab("directorio")}
                    className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeTab === "directorio"
                        ? "bg-red-500 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Directorio
                  </button>
                  <button
                    onClick={() => setActiveTab("chats")}
                    className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeTab === "chats" ? "bg-red-500 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Chats
                  </button>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="space-y-1 max-h-[500px] overflow-y-auto">
                  {activeTab === "chats"
                    ? filteredConversations.map((conversation) => (
                        <motion.div
                          key={conversation.id}
                          whileHover={{ scale: 1.02 }}
                          className={`p-3 mx-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                            selectedChat === conversation.id ? "bg-red-500 text-white" : "hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedChat(conversation.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                                <AvatarFallback className="bg-red-100 text-red-600 text-sm font-bold">
                                  {conversation.name === "Equipo de Marketing" ? "EM" : "JP"}
                                </AvatarFallback>
                              </Avatar>
                              {conversation.online && (
                                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {conversation.isPinned && (
                                    <Pin
                                      className={`h-3 w-3 ${selectedChat === conversation.id ? "text-white" : "text-gray-400"}`}
                                    />
                                  )}
                                  <h3
                                    className={`font-bold text-sm truncate ${
                                      selectedChat === conversation.id ? "text-white" : "text-gray-900"
                                    }`}
                                  >
                                    {conversation.name}
                                  </h3>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span
                                    className={`text-xs ${
                                      selectedChat === conversation.id ? "text-white/80" : "text-gray-500"
                                    }`}
                                  >
                                    {conversation.timestamp}
                                  </span>
                                  {conversation.unread > 0 && (
                                    <Badge className="bg-red-500 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center p-0 ml-1">
                                      {conversation.unread}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p
                                className={`text-xs truncate ${
                                  selectedChat === conversation.id ? "text-white/80" : "text-gray-600"
                                }`}
                              >
                                {conversation.lastMessage}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    : filteredContacts.map((contact) => (
                        <motion.div
                          key={contact.id}
                          whileHover={{ scale: 1.02 }}
                          className="p-3 mx-3 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-gray-50"
                          onClick={() => {
                            setActiveTab("chats")
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                                <AvatarFallback className="bg-gray-200 text-gray-700 text-sm font-bold">
                                  {contact.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              {contact.online && (
                                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-sm text-gray-900 truncate">{contact.name}</h3>
                              <p className="text-xs text-gray-600 truncate">
                                {contact.role} • {contact.department}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Column 2: Main Chat Area */}
          <div className="lg:col-span-6">
            <Card className="bg-white shadow-lg border-0 rounded-3xl h-full flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={selectedConversation.avatar || "/placeholder.svg"}
                            alt={selectedConversation.name}
                          />
                          <AvatarFallback className="bg-red-500 text-white font-bold">
                            {selectedConversation.name === "Equipo de Marketing" ? "EM" : "JP"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-lg">{selectedConversation.name}</h3>
                            {selectedConversation.isPinned && <Pin className="h-4 w-4 text-gray-400" />}
                          </div>
                          <p className="text-sm text-gray-600">
                            {selectedConversation.type === "group"
                              ? `${selectedConversation.members} miembros • ${selectedConversation.lastActivity}`
                              : selectedConversation.online
                                ? "En línea"
                                : selectedConversation.lastActivity}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" className="rounded-full hover:bg-gray-100">
                          <Phone className="h-5 w-5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="rounded-full hover:bg-gray-100">
                          <Video className="h-5 w-5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="rounded-full hover:bg-gray-100">
                          <Settings className="h-5 w-5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="rounded-full hover:bg-gray-100">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages Area */}
                  <CardContent className="flex-1 p-6 overflow-y-auto">
                    <div className="space-y-4">
                      {currentMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === "me" ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[70%] ${message.senderId === "me" ? "order-2" : "order-1"}`}>
                            <div
                              className={`p-4 rounded-2xl ${
                                message.senderId === "me" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              {message.type === "file" ? (
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  <span className="text-sm font-medium">{message.fileName}</span>
                                </div>
                              ) : (
                                <p className="text-sm">{message.content}</p>
                              )}

                              {message.reactions && message.reactions.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                  {message.reactions.map((reaction, index) => (
                                    <span key={index} className="text-xs bg-white/20 rounded-full px-2 py-1">
                                      {reaction}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div
                              className={`flex items-center gap-2 mt-2 ${
                                message.senderId === "me" ? "justify-end" : "justify-start"
                              }`}
                            >
                              <p className="text-xs text-gray-500">{message.timestamp}</p>
                              {message.senderId === "me" && (
                                <div className={`text-xs ${message.isRead ? "text-blue-500" : "text-gray-400"}`}>
                                  {message.isRead ? "Leído" : "Enviado"}
                                </div>
                              )}
                            </div>
                          </div>
                          {message.senderId !== "me" && (
                            <Avatar className="h-8 w-8 order-1 mr-3">
                              <AvatarFallback className="bg-red-100 text-red-600 text-xs font-bold">
                                {message.senderName === "Ana García"
                                  ? "AG"
                                  : message.senderName === "JUAN PABLO"
                                    ? "JP"
                                    : message.senderName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}

                      {/* Typing Indicator */}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-red-100 text-red-600 text-xs font-bold">
                                {selectedConversation.name === "Equipo de Marketing" ? "EM" : "JP"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="bg-gray-100 rounded-2xl p-4">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div
                                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.1s" }}
                                ></div>
                                <div
                                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.2s" }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {/* Message Input */}
                  <div className="p-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <Button size="icon" variant="ghost" className="rounded-full hover:bg-gray-100">
                        <Paperclip className="h-5 w-5" />
                      </Button>
                      <div className="flex-1 relative">
                        <Input
                          placeholder="Escribe tu mensaje..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                          className="rounded-2xl border-gray-200 bg-gray-50 pr-12"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full hover:bg-gray-200"
                        >
                          <Smile className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        onClick={handleSendMessage}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full"
                        size="icon"
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="font-bold text-xl text-gray-700 mb-2">Selecciona una conversación</h3>
                    <p className="text-gray-600">Elige una conversación para comenzar a chatear</p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Column 3: Information Panel - Always visible when chat is selected */}
          {selectedConversation && (
            <div className="lg:col-span-3">
              <Card className="bg-white shadow-lg border-0 rounded-3xl h-full">
                <CardHeader className="pb-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-gray-900">Información</h3>
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-gray-100">
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Conversation Avatar and Name */}
                  <div className="text-center">
                    <Avatar className="h-16 w-16 mx-auto mb-4">
                      <AvatarImage
                        src={selectedConversation.avatar || "/placeholder.svg"}
                        alt={selectedConversation.name}
                      />
                      <AvatarFallback className="bg-red-500 text-white font-bold text-lg">
                        {selectedConversation.name === "Equipo de Marketing" ? "EM" : "JP"}
                      </AvatarFallback>
                    </Avatar>
                    <h4 className="font-bold text-lg text-gray-900 mb-1">{selectedConversation.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{selectedConversation.role}</p>
                    <p className="text-xs text-gray-500">{selectedConversation.lastActivity}</p>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedConversation.members} miembro{selectedConversation.members > 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedConversation.type === "group" ? "Grupo de trabajo" : "Conversación directa"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                      <div className="p-2 bg-green-100 rounded-full">
                        <FileText className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedConversation.sharedFiles} archivo{selectedConversation.sharedFiles > 1 ? "s" : ""}{" "}
                          compartido{selectedConversation.sharedFiles > 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-gray-500">Documentos y medios</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <CheckSquare className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedConversation.sharedTasks} tarea{selectedConversation.sharedTasks > 1 ? "s" : ""}{" "}
                          compartida{selectedConversation.sharedTasks > 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-gray-500">Pendientes y completadas</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <Button variant="outline" className="w-full justify-start gap-2 rounded-2xl bg-transparent">
                      <FileText className="h-4 w-4" />
                      Ver archivos compartidos
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2 rounded-2xl bg-transparent">
                      <CheckSquare className="h-4 w-4" />
                      Ver tareas compartidas
                    </Button>
                    {selectedConversation.type === "group" && (
                      <Button variant="outline" className="w-full justify-start gap-2 rounded-2xl bg-transparent">
                        <Users className="h-4 w-4" />
                        Ver miembros del grupo
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
