'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Shield, Phone, Mail, Building2, Key, MessageCircle, CheckCircle, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { useOrgApi } from '@/hooks/useOrgApi';

interface Department {
  id: number;
  name: string;
  color: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  first_login: boolean;
  permissions: {
    tasks_view_team: boolean;
    tasks_assign_others: boolean;
    messages: boolean;
    achievements: boolean;
    checkin: boolean;
    team: boolean;
  };
  department_id: number | null;
  department_name: string | null;
  department_color: string | null;
  created_at: string;
}

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  department_id: number | null;
  permissions: {
    tasks_view_team: boolean;
    tasks_assign_others: boolean;
    messages: boolean;
    achievements: boolean;
    checkin: boolean;
    team: boolean;
  };
}

export default function UsersAdminPage() {
  const orgApi = useOrgApi();
  
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserCredentials, setNewUserCredentials] = useState<{ email: string; password: string; phone: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    department_id: null,
    permissions: {
      tasks_view_team: false,
      tasks_assign_others: false,
      messages: true,
      achievements: true,
      checkin: false,
      team: false
    }
  });

  // Helper functions for API calls
  const get = async (url: string) => {
    const response = await orgApi(url, { method: 'GET' });
    if (!response.ok) throw new Error('Error en la petición');
    return response.json();
  };

  const post = async (url: string, data: any) => {
    const response = await orgApi(url, { method: 'POST', body: data });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error en la petición');
    }
    return response.json();
  };

  const put = async (url: string, data: any) => {
    const response = await orgApi(url, { method: 'PUT', body: data });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error en la petición');
    }
    return response.json();
  };

  const del = async (url: string) => {
    const response = await orgApi(url, { method: 'DELETE' });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error en la petición');
    }
    return response.json();
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, deptsData] = await Promise.all([
        get('/api/admin/users'),
        get('/api/admin/departments')
      ]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setDepartments(Array.isArray(deptsData) ? deptsData : []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const length = 12;
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: `Boom${password}!` }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Actualizar usuario
        await put(`/api/admin/users/${editingUser.id}`, formData);
        await loadData();
        closeModal();
      } else {
        // Crear nuevo usuario
        const response = await post('/api/admin/users', formData);
        
        // Mostrar modal de WhatsApp con credenciales
        setNewUserCredentials({
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        });
        setIsWhatsAppModalOpen(true);
        
        await loadData();
        closeModal();
      }
    } catch (error: any) {
      alert(error.message || 'Error al guardar usuario');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
      await del(`/api/admin/users/${userId}`);
      await loadData();
    } catch (error) {
      alert('Error al eliminar usuario');
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      department_id: null,
      permissions: {
        tasks_view_team: false,
        tasks_assign_others: false,
        messages: true,
        achievements: true,
        checkin: false,
        team: false
      }
    });
    generatePassword(); // Auto-generar password
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: '', // No mostramos el password actual
      department_id: user.department_id,
      permissions: user.permissions || {
        tasks_view_team: false,
        tasks_assign_others: false,
        messages: true,
        achievements: true,
        checkin: false,
        team: false
      }
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const shareWhatsApp = (credentials: { email: string; password: string; phone: string }) => {
    const message = `¡Bienvenido a BoomlearnOS! 🚀\n\nTus credenciales de acceso son:\n📧 Email: ${credentials.email}\n🔑 Password: ${credentials.password}\n\n🔗 Ingresa aquí: ${window.location.origin}/login\n\n⚠️ Por seguridad, deberás cambiar tu contraseña en el primer inicio de sesión.`;
    
    const phone = credentials.phone.replace(/\D/g, ''); // Remover caracteres no numéricos
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    setIsWhatsAppModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
                  <p className="text-gray-600 mt-1">
                    Administra colaboradores y permisos de acceso
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Nuevo Usuario
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Usuarios</p>
                  <p className="text-2xl font-bold text-blue-900">{users.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Activos</p>
                  <p className="text-2xl font-bold text-green-900">
                    {users.filter(u => !u.first_login).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
              <div className="flex items-center gap-3">
                <Key className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-sm text-amber-600 font-medium">Primer Login</p>
                  <p className="text-2xl font-bold text-amber-900">
                    {users.filter(u => u.first_login).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Usuario</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contacto</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Departamento</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Permisos</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-red-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{user.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.department_name ? (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: user.department_color || '#6B7280' }}
                          ></div>
                          <span className="text-sm font-medium text-gray-700">
                            {user.department_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Sin departamento</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.first_login ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                          <Key className="w-3 h-3" />
                          Primer Login
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                          <CheckCircle className="w-3 h-3" />
                          Activo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.permissions?.tasks_view_team && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                            Ver Equipo
                          </span>
                        )}
                        {user.permissions?.tasks_assign_others && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs">
                            Asignar
                          </span>
                        )}
                        {!user.permissions?.tasks_view_team && !user.permissions?.tasks_assign_others && (
                          <span className="text-xs text-gray-400">Básicos</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No hay usuarios registrados</p>
              <button
                onClick={openCreateModal}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Crear primer usuario
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar Usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {editingUser ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-600" />
                  Información Personal
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email * (para login)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="usuario@empresa.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono/WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="52XXXXXXXXXX"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={formData.department_id || ''}
                      onChange={(e) => setFormData({ ...formData, department_id: e.target.value ? Number(e.target.value) : null })}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none"
                    >
                      <option value="">Sin departamento</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Inicial {editingUser && '(dejar vacío para no cambiar)'}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required={!editingUser}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Contraseña segura"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {!editingUser && (
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="px-4 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium whitespace-nowrap"
                      >
                        Generar
                      </button>
                    )}
                  </div>
                  {!editingUser && (
                    <p className="text-xs text-gray-500 mt-1">
                      El usuario deberá cambiar esta contraseña en su primer login
                    </p>
                  )}
                </div>
              </div>

              {/* Permisos */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Permisos de Acceso
                </h3>

                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <p className="text-sm text-red-800 font-medium mb-3">
                    ✅ Acceso por defecto (siempre activo):
                  </p>
                  <ul className="text-sm text-red-700 space-y-1 ml-4">
                    <li>• Dashboard personal</li>
                    <li>• Mis tareas (solo las propias)</li>
                    <li>• Mi perfil</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200">
                    <input
                      type="checkbox"
                      checked={formData.permissions.tasks_view_team}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, tasks_view_team: e.target.checked }
                      })}
                      className="mt-1 w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">👁️ Ver tareas del equipo</p>
                      <p className="text-sm text-gray-600">Puede ver todas las tareas de la organización</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200">
                    <input
                      type="checkbox"
                      checked={formData.permissions.tasks_assign_others}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, tasks_assign_others: e.target.checked }
                      })}
                      className="mt-1 w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">👥 Asignar tareas a otros</p>
                      <p className="text-sm text-gray-600">Puede crear tareas y delegarlas a colaboradores</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200">
                    <input
                      type="checkbox"
                      checked={formData.permissions.messages}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, messages: e.target.checked }
                      })}
                      className="mt-1 w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">💬 Mensajes</p>
                      <p className="text-sm text-gray-600">Acceso al sistema de mensajería interna</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200">
                    <input
                      type="checkbox"
                      checked={formData.permissions.achievements}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, achievements: e.target.checked }
                      })}
                      className="mt-1 w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">🏆 Logros</p>
                      <p className="text-sm text-gray-600">Ver sus logros y progreso personal</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200">
                    <input
                      type="checkbox"
                      checked={formData.permissions.checkin}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, checkin: e.target.checked }
                      })}
                      className="mt-1 w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">✅ Check-in</p>
                      <p className="text-sm text-gray-600">Registro de asistencia y estado diario</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200">
                    <input
                      type="checkbox"
                      checked={formData.permissions.team}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, team: e.target.checked }
                      })}
                      className="mt-1 w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">👨‍💼 Equipo</p>
                      <p className="text-sm text-gray-600">Ver miembros del equipo y departamentos</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg font-medium"
                >
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal WhatsApp */}
      {isWhatsAppModalOpen && newUserCredentials && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <MessageCircle className="w-6 h-6" />
                Usuario Creado
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-800 font-medium mb-3">
                  ✅ Usuario creado exitosamente
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-gray-600">Email:</p>
                      <p className="font-mono font-semibold text-gray-900">{newUserCredentials.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Key className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-gray-600">Password:</p>
                      <p className="font-mono font-semibold text-gray-900">{newUserCredentials.password}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-gray-600">WhatsApp:</p>
                      <p className="font-mono font-semibold text-gray-900">{newUserCredentials.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Comparte estas credenciales con el colaborador por WhatsApp:
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsWhatsAppModalOpen(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => shareWhatsApp(newUserCredentials)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg font-medium"
                >
                  <MessageCircle className="w-5 h-5" />
                  Enviar por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
