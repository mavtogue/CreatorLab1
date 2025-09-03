import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FaUser, FaCog, FaSignOutAlt, FaDiscord } from 'react-icons/fa';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(user);
    } catch (error) {
      console.error('Error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();

    // TEMPORALMENTE DESHABILITADO - Causa conflictos
    // const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    //   if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
    //     await checkUser();
    //   } else if (event === 'SIGNED_OUT') {
    //     setUser(null);
    //   }
    // });

    // return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cerrar sesión');
    }
  };

  const handleDiscordConnect = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'identify email guilds'
        }
      });

      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
      alert('Error al conectar con Discord');
    }
  };

  const handleDiscordDisconnect = async () => {
    try {
      await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          discord_id: null,
          discord_username: null,
          discord_avatar: null,
          discord_connected: false,
          avatar_url: null
        }
      });

      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al desconectar Discord');
    }
  };

  if (loading) {
    return (
      <div className="relative">
        <button className="flex items-center space-x-2 text-white hover:text-redvelvet transition-colors">
          <div className="w-8 h-8 rounded-full bg-neutral-gray/20 animate-pulse"></div>
        </button>
      </div>
    );
  }

  if (!user) return null;

  const hasDiscord = !!user.user_metadata?.discord_connected;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-white hover:text-redvelvet transition-colors"
      >
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-neutral-gray/20 flex items-center justify-center">
            <FaUser className="text-neutral-gray" />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-wineblack border border-neutral-gray/50 rounded-md shadow-lg py-1 z-50">
          <div className="px-4 py-2 border-b border-neutral-gray/30">
            <p className="text-white font-medium">{user.user_metadata?.full_name || 'Usuario'}</p>
            <p className="text-neutral-gray text-sm">{user.email}</p>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              document.dispatchEvent(new CustomEvent('open-profile-modal'));
            }}
            className="w-full px-4 py-2 text-left text-white hover:bg-neutral-gray/20 transition-colors flex items-center space-x-2"
          >
            <FaCog className="text-neutral-gray" />
            <span>Editar Perfil</span>
          </button>

          {hasDiscord ? (
            <button
              onClick={handleDiscordDisconnect}
              className="w-full px-4 py-2 text-left text-white hover:bg-neutral-gray/20 transition-colors flex items-center space-x-2"
            >
              <FaDiscord className="text-[#5865F2]" />
              <span>Desconectar Discord</span>
            </button>
          ) : (
            <button
              onClick={handleDiscordConnect}
              className="w-full px-4 py-2 text-left text-white hover:bg-neutral-gray/20 transition-colors flex items-center space-x-2"
            >
              <FaDiscord className="text-[#5865F2]" />
              <span>Conectar Discord</span>
            </button>
          )}

          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-left text-redvelvet hover:bg-neutral-gray/20 transition-colors flex items-center space-x-2"
          >
            <FaSignOutAlt />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );
} 