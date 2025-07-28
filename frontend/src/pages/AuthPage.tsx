import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { API_URL } from '../config';
import { toast } from "react-hot-toast";
import { userStore } from '../store/userStore'; 
import { useNavigate } from 'react-router-dom';

interface FormData {
  name?: string;
  email: string;
  password: string;
}

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  
  // Usar el store
  const { setUser } = userStore();
  const navigate = useNavigate(); // Para redirección después del login

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const endpoint = isLogin ? `${API_URL}/auth/login-user` : `${API_URL}/auth/register-user`;
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Éxito:', data);
        toast.success(data.message);

        setUser(data.user);
        navigate('/dashboard');

      } else {
        console.error('Error:', data);
        toast.error(data.message || 'Error en la autenticación');
      }
    } catch (error) {
      console.error('Error de red:', error);
      toast.error('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '' });
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header con Toggle */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-t-2xl border border-slate-700/50">
          <div className="flex rounded-t-2xl overflow-hidden">
            <button
              onClick={() => !isLogin && toggleAuthMode()}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-300 ${
                isLogin
                  ? 'bg-blue-900/80 text-blue-100 shadow-lg'
                  : 'bg-slate-700/30 text-slate-400 hover:text-slate-300'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => isLogin && toggleAuthMode()}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-300 ${
                !isLogin
                  ? 'bg-blue-900/80 text-blue-100 shadow-lg'
                  : 'bg-slate-700/30 text-slate-400 hover:text-slate-300'
              }`}
            >
              Registrarse
            </button>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-slate-800/70 backdrop-blur-sm rounded-b-2xl border-x border-b border-slate-700/50 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-2">
              {isLogin ? 'Bienvenido de nuevo' : 'Crear cuenta'}
            </h2>
            <p className="text-slate-400 text-sm">
              {isLogin 
                ? 'Ingresa tus credenciales para continuar' 
                : 'Completa la información para registrarte'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Nombre (solo en registro) */}
            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                  Nombre completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-600/50 rounded-lg bg-slate-700/50 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                    placeholder="Tu nombre completo"
                  />
                </div>
              </div>
            )}

            {/* Campo Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-600/50 rounded-lg bg-slate-700/50 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-12 py-3 border border-slate-600/50 rounded-lg bg-slate-700/50 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                  placeholder={isLogin ? 'Tu contraseña' : 'Mínimo 6 caracteres'}
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

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-medium rounded-lg transition-all hover:cursor-pointer disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </div>
              ) : (
                isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              <button
                onClick={toggleAuthMode}
                className="ml-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;