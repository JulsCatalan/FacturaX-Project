import React, { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { userStore } from '../store/userStore';
import { API_URL } from '../config';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const clearUser = userStore(state => state.clearUser);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/logout-user`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        clearUser();
        toast.success('Sesión cerrada correctamente');
        navigate('/auth');
      } else {
        toast.error('Error al cerrar sesión');
      }
    } catch {
      toast.error('Error de conexión al cerrar sesión');
    }
  };

  return (
    <nav className="bg-slate-900 shadow-md fixed top-0 z-50 w-full">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo con enlace al inicio */}
        <Link
          to="/"
          className="text-white text-xl font-bold tracking-wide select-none"
        >
          FacturaX
        </Link>

        {/* Menú Desktop */}
        <div className="hidden md:flex items-center space-x-6">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition"
            title="Cerrar Sesión"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Salir</span>
          </button>
        </div>

        {/* Menú móvil */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-slate-300 hover:text-white focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Menú móvil desplegable */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <button
            onClick={() => {
              handleLogout();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-6 py-3 flex items-center space-x-2 text-red-500 hover:bg-red-700 transition"
            title="Cerrar Sesión"
          >
            <LogOut className="w-5 h-5" />
            <span>Salir</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
