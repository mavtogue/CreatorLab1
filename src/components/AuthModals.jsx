import React, { useState, useEffect } from 'react';
import { FaDiscord, FaGoogle, FaTimes } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { initAuth } from '../lib/auth';

// Login Modal Component
export function LoginModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  useEffect(() => {
    const handleOpenModal = () => {
      setIsOpen(true);
      setError(null);
    };
    
    document.addEventListener('open-login-modal', handleOpenModal);
    
    return () => {
      document.removeEventListener('open-login-modal', handleOpenModal);
    };
  }, []);

  useEffect(() => {
    // TEMPORALMENTE DESHABILITADO - Causa conflictos
    // const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    //   console.log('Auth state changed:', event, session);
    //   if (event === 'SIGNED_IN') {
    //     setIsOpen(false);
    //     setLoading(false);
    //     setFormData({ email: '', password: '' });
    //     // Recargar la página para actualizar la UI
    //     window.location.reload();
    //   }
    // });
    // return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Intentando iniciar sesión con:', formData.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      console.log('Inicio de sesión exitoso:', data);
      
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleDiscordLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Iniciando login con Discord...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'identify email guilds'
        }
      });
      
      if (error) throw error;
      
      console.log('Discord OAuth data:', data);
      
      if (data?.url) {
        console.log('Redirigiendo a Discord OAuth:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió URL de redirección de Discord');
      }
    } catch (error) {
      console.error('Error en login con Discord:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Iniciando login con Google...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        console.log('Redirigiendo a Google OAuth:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió URL de redirección de Google');
      }
    } catch (error) {
      console.error('Error en login con Google:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="relative w-full max-w-md bg-wineblack border border-neutral-gray/50 rounded-xl shadow-xl p-6">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-neutral-gray hover:text-white transition-colors"
          disabled={loading}
        >
          <FaTimes size={20} />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Bienvenido de nuevo</h2>
        
        <div className="space-y-4 mb-6">
          <button 
            onClick={handleDiscordLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#5865F2] text-white rounded-md hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            <FaDiscord size={20} />
            <span>{loading ? 'Conectando...' : 'Continuar con Discord'}</span>
          </button>
          
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-gray-800 rounded-md hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            <FaGoogle size={20} />
            <span>{loading ? 'Conectando...' : 'Continuar con Google'}</span>
          </button>
        </div>
        
        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-neutral-gray/30"></div>
          <span className="flex-shrink mx-4 text-neutral-gray">o</span>
          <div className="flex-grow border-t border-neutral-gray/30"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-gray mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 bg-neutral-gray/20 border border-neutral-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-redvelvet"
              placeholder="tu@email.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-gray mb-1">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 bg-neutral-gray/20 border border-neutral-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-redvelvet"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-redvelvet text-white rounded-md hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsOpen(false);
              document.dispatchEvent(new CustomEvent('open-register-modal'));
            }}
            className="text-neutral-gray hover:text-white transition-colors"
            disabled={loading}
          >
            ¿No tienes una cuenta? Regístrate
          </button>
        </div>
      </div>
    </div>
  );
}

// Register Modal Component
export function RegisterModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const handleOpenModal = () => setIsOpen(true);
    document.addEventListener('open-register-modal', handleOpenModal);
    
    return () => {
      document.removeEventListener('open-register-modal', handleOpenModal);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: '',
            username: '',
            bio: '',
            website: '',
            twitter: '',
            instagram: '',
            youtube: '',
            tiktok: '',
            discord_connected: false,
            discord_id: null,
            discord_username: null,
            discord_avatar: null,
            avatar_url: null
          }
        }
      });

      if (error) throw error;

      // Cerrar el modal y limpiar el formulario
      setIsOpen(false);
      setFormData({ email: '', password: '', confirmPassword: '' });
      
      // Mostrar mensaje de éxito
      alert('¡Registro exitoso! Por favor, verifica tu email para activar tu cuenta.');
    } catch (error) {
      console.error('Error al registrarse:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordRegister = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'identify email guilds'
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error en registro con Discord:', error);
      setError(error.message);
    }
  };

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="relative w-full max-w-md bg-wineblack border border-neutral-gray/50 rounded-xl shadow-xl p-6 animate-[fadeIn_0.3s_ease-in-out]">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-neutral-gray hover:text-white transition-colors"
        >
          <FaTimes size={20} />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Crear cuenta</h2>
        
        <div className="space-y-4 mb-6">
          <button 
            onClick={handleDiscordRegister}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#5865F2] text-white rounded-md hover:bg-opacity-90 transition-all"
          >
            <FaDiscord size={20} />
            <span>Continuar con Discord</span>
          </button>
          
          <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-gray-800 rounded-md hover:bg-opacity-90 transition-all">
            <FaGoogle size={20} />
            <span>Continuar con Google</span>
          </button>
        </div>
        
        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-neutral-gray/30"></div>
          <span className="flex-shrink mx-4 text-neutral-gray">o</span>
          <div className="flex-grow border-t border-neutral-gray/30"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="register-email" className="block text-sm font-medium text-neutral-gray mb-1">
              Email
            </label>
            <input
              type="email"
              id="register-email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 bg-neutral-gray/20 border border-neutral-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-redvelvet"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="register-password" className="block text-sm font-medium text-neutral-gray mb-1">
              Contraseña
            </label>
            <input
              type="password"
              id="register-password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 bg-neutral-gray/20 border border-neutral-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-redvelvet"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label htmlFor="register-confirm-password" className="block text-sm font-medium text-neutral-gray mb-1">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="register-confirm-password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-4 py-3 bg-neutral-gray/20 border border-neutral-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-redvelvet"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-redvelvet text-white rounded-md hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsOpen(false);
              document.dispatchEvent(new CustomEvent('open-login-modal'));
            }}
            className="text-neutral-gray hover:text-white transition-colors"
          >
            ¿Ya tienes una cuenta? Inicia sesión
          </button>
        </div>
      </div>
    </div>
  );
}