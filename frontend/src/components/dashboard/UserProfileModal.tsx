import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Save, Eye, EyeOff, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';

interface UserProfileData {
  id: string;
  name: string;
  email: string;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(false);

  // Obtener perfil del usuario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen]);

  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name,
        email: profileData.email,
        password: ''
      });
    }
  }, [profileData]);

  const fetchUserProfile = async () => {
    setFetchingProfile(true);
    try {
      const response = await fetch(`${API_URL}/user/get-user-profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setProfileData(data.user);
      } else {
        toast.error(data.message || 'Error al obtener el perfil');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error de conexión al obtener el perfil');
    } finally {
      setFetchingProfile(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    const loadingToast = toast.loading('Actualizando perfil...');

    try {
      // Solo enviar campos que han cambiado
      const updates: any = {};
      
      if (formData.name !== profileData?.name && formData.name.trim()) {
        updates.name = formData.name.trim();
      }
      
      if (formData.email !== profileData?.email && formData.email.trim()) {
        updates.email = formData.email.trim();
      }
      
      if (formData.password.trim()) {
        updates.password = formData.password;
      }

      // Verificar si hay cambios
      if (Object.keys(updates).length === 0) {
        toast.dismiss(loadingToast);
        toast.error('No hay cambios para actualizar');
        return;
      }

      const response = await fetch(`${API_URL}/user/update-user-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
        credentials: 'include',
      });

      const data = await response.json();
      toast.dismiss(loadingToast);

      if (response.ok) {
        toast.success('Perfil actualizado correctamente');

        setProfileData(data.user);
        setFormData(prev => ({ ...prev, password: '' }));
        setIsEditing(false);
      } else {
        toast.error(data.message || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.dismiss(loadingToast);
      toast.error('Error de conexión al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        name: profileData.name,
        email: profileData.email,
        password: ''
      });
    }
    setIsEditing(false);
    setShowPassword(false);
  };

  const handleClose = () => {
    handleCancel();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-800 shadow-2xl transition-all border border-slate-700/50">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <User className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">
                  Perfil de Usuario
                </h3>
                <p className="text-sm text-slate-400">
                  {isEditing ? 'Editando información' : 'Ver y editar información'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {fetchingProfile ? (
              // Loading state
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                  <span className="text-slate-300">Cargando perfil...</span>
                </div>
              </div>
            ) : profileData ? (
              <div className="space-y-6">
                {/* Nombre */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                        isEditing
                          ? 'border-slate-600/50 bg-slate-700/50 focus:ring-blue-500/50 focus:border-blue-500/50'
                          : 'border-slate-600/30 bg-slate-700/30 cursor-not-allowed'
                      }`}
                      placeholder="Tu nombre completo"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                        isEditing
                          ? 'border-slate-600/50 bg-slate-700/50 focus:ring-blue-500/50 focus:border-blue-500/50'
                          : 'border-slate-600/30 bg-slate-700/30 cursor-not-allowed'
                      }`}
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                {/* Contraseña (solo en modo edición) */}
                {isEditing && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Nueva contraseña
                      <span className="text-slate-500 text-xs ml-1">(opcional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-12 py-3 border border-slate-600/50 rounded-lg bg-slate-700/50 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                        placeholder="Dejar vacío para mantener actual"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Error state
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="text-red-400 mb-2">❌</div>
                  <p className="text-slate-300">Error al cargar el perfil</p>
                  <button
                    onClick={fetchUserProfile}
                    className="mt-2 text-sm text-blue-400 hover:text-blue-300"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {profileData && (
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-700/50 bg-slate-800/50">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Guardar cambios</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Editar perfil</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;