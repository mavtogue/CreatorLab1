import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { subscribeToAuthEvents, getCurrentUser, getCurrentSession } from '../lib/auth';

export default function SimpleDebug() {
  const [user, setUser] = useState(getCurrentUser());
  const [session, setSession] = useState(getCurrentSession());
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    console.log('🔍 SimpleDebug: Componente montado');
    
    // Suscribirse al sistema centralizado
    const unsubscribe = subscribeToAuthEvents((session, event, user) => {
      console.log('🔍 SimpleDebug: Evento recibido:', event, user?.email);
      setEventCount(prev => prev + 1);
      setSession(session);
      setUser(user);
    });

    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="bg-wineblack p-6 rounded-lg border border-redvelvet max-w-md mx-auto">
      <h3 className="text-xl font-bold text-white mb-4">🔍 Debug Simple</h3>
      
      <div className="space-y-4 text-sm">
        <div className="bg-neutral-gray/10 p-3 rounded">
          <p className="text-white"><strong>Estado:</strong></p>
          <p className="text-neutral-gray">{user ? '✅ Autenticado' : '❌ No autenticado'}</p>
        </div>
        
        <div className="bg-neutral-gray/10 p-3 rounded">
          <p className="text-white"><strong>Usuario:</strong></p>
          <p className="text-neutral-gray">{user?.email || 'N/A'}</p>
          <p className="text-neutral-gray text-xs">ID: {user?.id || 'N/A'}</p>
        </div>
        
        <div className="bg-neutral-gray/10 p-3 rounded">
          <p className="text-white"><strong>Eventos recibidos:</strong></p>
          <p className="text-neutral-gray">{eventCount}</p>
        </div>
        
        <div className="space-y-2">
          {!user ? (
            <button
              onClick={handleLogin}
              className="w-full bg-discord-blue hover:bg-discord-blue/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Conectar Discord
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full bg-redvelvet hover:bg-redvelvet/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 