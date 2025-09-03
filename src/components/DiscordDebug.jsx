import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function DiscordDebug() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error obteniendo sesión:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleDiscordLogin = async () => {
    try {
      setLoading(true);
      
      // Debug: mostrar la URL que se está enviando
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('🔍 Debug Discord OAuth:');
      console.log('  - Origin:', window.location.origin);
      console.log('  - Puerto:', window.location.port);
      console.log('  - URL completa:', redirectUrl);
      console.log('  - Protocolo:', window.location.protocol);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: redirectUrl
        }
      });
      
      if (error) {
        console.error('❌ Error de Supabase:', error);
        alert('Error al conectar con Discord: ' + error.message);
      } else {
        console.log('✅ OAuth iniciado correctamente');
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error);
      alert('Error inesperado: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error al cerrar sesión:', error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-redvelvet mx-auto"></div>
        <p className="text-white mt-2">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="bg-wineblack p-6 rounded-lg border border-redvelvet">
      <h3 className="text-xl font-bold text-white mb-4">Estado de Discord OAuth</h3>
      
      {!user ? (
        <div className="space-y-4">
          <p className="text-neutral-gray">No hay usuario autenticado</p>
          <button
            onClick={handleDiscordLogin}
            disabled={loading}
            className="w-full bg-discord-blue hover:bg-discord-blue/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Conectando...' : 'Conectar con Discord'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-neutral-gray/10 p-4 rounded-lg">
            <h4 className="font-semibold text-white mb-2">Usuario Autenticado:</h4>
            <p className="text-neutral-gray text-sm">Email: {user.email}</p>
            <p className="text-neutral-gray text-sm">ID: {user.id}</p>
            {user.user_metadata?.discord_username && (
              <p className="text-neutral-gray text-sm">Discord: {user.user_metadata.discord_username}</p>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full bg-redvelvet hover:bg-redvelvet/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          </button>
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t border-neutral-gray/20">
        <h4 className="font-semibold text-white mb-2">Información de Sesión:</h4>
        <div className="text-xs text-neutral-gray bg-neutral-gray/10 p-2 rounded overflow-auto max-h-32">
          <p><strong>Estado:</strong> {loading ? 'Procesando...' : (user ? 'Autenticado' : 'No autenticado')}</p>
          <p><strong>Usuario ID:</strong> {user?.id || 'N/A'}</p>
          <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
          <p><strong>Discord:</strong> {user?.user_metadata?.discord_username || 'No conectado'}</p>
        </div>
      </div>
    </div>
  );
} 