import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { FaTimes, FaEnvelope, FaLock } from 'react-icons/fa';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Iniciando proceso de login...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('Login exitoso, datos del usuario:', data.user);
      console.log('Metadatos del usuario:', data.user.user_metadata);

      // Verificar si el usuario tiene una conexión de Discord en la base de datos
      console.log('Verificando conexión de Discord en la base de datos...');
      const { data: discordConnection, error: discordError } = await supabase
        .from('discord_connections')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      console.log('Resultado de la verificación de Discord:', { discordConnection, discordError });

      if (discordError && discordError.code !== 'PGRST116') {
        console.error('Error al verificar conexión de Discord:', discordError);
      }

      if (discordConnection) {
        console.log('Conexión de Discord encontrada, intentando reconectar...');
        
        // Intentar reconectar con Discord
        const { data: discordData, error: oauthError } = await supabase.auth.signInWithOAuth({
          provider: 'discord',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            scopes: 'identify email guilds',
            queryParams: {
              prompt: 'consent'
            }
          }
        });

        console.log('Respuesta de OAuth de Discord:', { discordData, oauthError });

        if (oauthError) {
          console.error('Error al reconectar con Discord:', oauthError);
        } else if (discordData?.url) {
          console.log('Redirigiendo a Discord para autorización...');
          window.location.href = discordData.url;
          return;
        }
      } else {
        console.log('No se encontró conexión de Discord en la base de datos');
      }

      // Solo cerrar el modal si no hubo redirección a Discord
      console.log('Cerrando modal de login...');
      document.dispatchEvent(new CustomEvent('close-login-modal'));
    } catch (error) {
      console.error('Error en el proceso de login:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="relative w-full max-w-md bg-wineblack border border-neutral-gray/50 rounded-xl shadow-xl p-6">
        <button 
          onClick={() => document.dispatchEvent(new CustomEvent('close-login-modal'))}
          className="absolute top-4 right-4 text-neutral-gray hover:text-white transition-colors"
        >
          <FaTimes size={20} />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Iniciar Sesión</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-gray mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-neutral-gray" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-gray/20 border border-neutral-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-redvelvet"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-gray mb-1">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-neutral-gray" />
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-gray/20 border border-neutral-gray/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-redvelvet"
                placeholder="••••••••"
                required
              />
            </div>
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
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          <div className="text-center text-neutral-gray text-sm">
            ¿No tienes una cuenta?{' '}
            <button
              type="button"
              onClick={() => {
                document.dispatchEvent(new CustomEvent('close-login-modal'));
                document.dispatchEvent(new CustomEvent('open-register-modal'));
              }}
              className="text-redvelvet hover:text-red-400 transition-colors"
            >
              Regístrate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 