import React, { useState, useEffect } from 'react';
import { FaTimes, FaDiscord, FaEnvelope, FaCheckCircle, FaLock } from 'react-icons/fa';
import { supabase } from '../lib/supabase';

export default function ProfileModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: ''
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

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
      setFormData({
        full_name: user.user_metadata?.full_name || ''
      });
    } catch (error) {
      console.error('Error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleOpenModal = () => {
      setIsOpen(true);
      checkUser();
    };
    document.addEventListener('open-profile-modal', handleOpenModal);
    return () => document.removeEventListener('open-profile-modal', handleOpenModal);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Actualizar nombre
      const { error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          ...formData
        }
      });
      if (error) throw error;
      // Cambiar contraseña si se ha rellenado
      if (passwords.new && passwords.new === passwords.confirm) {
        const { error: passError } = await supabase.auth.updateUser({
          password: passwords.new
        });
        if (passError) throw passError;
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el perfil');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDiscordConnect = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'identify email guilds',
          queryParams: { prompt: 'consent' }
        }
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (error) {
      console.error('Error al conectar con Discord:', error);
      alert('Error al conectar con Discord');
    }
  };

  const handleDiscordDisconnect = async () => {
    try {
      await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          discord_connected: false,
          discord_id: null,
          discord_username: null,
          discord_avatar: null,
          avatar_url: null
        }
      });
      checkUser();
    } catch (error) {
      console.error('Error al desconectar Discord:', error);
      alert('Error al desconectar Discord');
    }
  };

  if (loading) return null;
  if (!user) return null;

  const hasDiscord = !!user.user_metadata?.discord_connected;
  const discordUsername = user.user_metadata?.discord_username;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-wineblack border border-neutral-gray/50 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl text-white font-bold">Editar Perfil</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-gray hover:text-white transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>
            {/* Email */}
            <div className="mb-4 p-4 rounded-lg bg-neutral-gray/20 flex items-center gap-3">
              <FaEnvelope className="text-redvelvet text-xl" />
              <div>
                <div className="text-white font-semibold">Cuenta de Email</div>
                <div className="text-neutral-gray text-sm">{user.email}</div>
              </div>
            </div>
            {/* Discord */}
            <div className="mb-4 p-4 rounded-lg bg-neutral-gray/20 flex items-center gap-3">
              <FaDiscord className="text-[#5865F2] text-xl" />
              <div className="flex-1">
                <div className="text-white font-semibold">Cuenta de Discord</div>
                {hasDiscord ? (
                  <div className="text-green-400 text-sm flex items-center gap-1">
                    Conectado como <span className="font-bold">{discordUsername}</span>
                  </div>
                ) : (
                  <div className="text-neutral-gray text-sm flex items-center gap-1">
                    No conectado
                  </div>
                )}
              </div>
              {hasDiscord ? (
                <button
                  type="button"
                  onClick={handleDiscordDisconnect}
                  className="text-red-500 font-semibold hover:underline ml-2"
                >Desconectar</button>
              ) : (
                <button
                  type="button"
                  onClick={handleDiscordConnect}
                  className="text-[#5865F2] font-semibold hover:underline ml-2"
                >Conectar</button>
              )}
            </div>
            {/* Perfil */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mb-2">
                <div className="text-white font-semibold mb-2">Información del Perfil</div>
                <label className="block text-white mb-2">Nombre Completo</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full bg-neutral-gray/20 border border-neutral-gray/50 rounded-md px-4 py-2 text-white focus:outline-none focus:border-redvelvet"
                />
              </div>
              {/* Cambiar contraseña */}
              <div className="mb-2">
                <div className="flex items-center gap-2 text-white font-semibold mb-2"><FaLock /> Cambiar Contraseña</div>
                <input
                  type="password"
                  name="current"
                  value={passwords.current}
                  onChange={handlePasswordChange}
                  placeholder="Contraseña Actual"
                  className="w-full bg-neutral-gray/20 border border-neutral-gray/50 rounded-md px-4 py-2 text-white mb-2 focus:outline-none focus:border-redvelvet"
                />
                <input
                  type="password"
                  name="new"
                  value={passwords.new}
                  onChange={handlePasswordChange}
                  placeholder="Nueva Contraseña"
                  className="w-full bg-neutral-gray/20 border border-neutral-gray/50 rounded-md px-4 py-2 text-white mb-2 focus:outline-none focus:border-redvelvet"
                />
                <input
                  type="password"
                  name="confirm"
                  value={passwords.confirm}
                  onChange={handlePasswordChange}
                  placeholder="Confirmar Nueva Contraseña"
                  className="w-full bg-neutral-gray/20 border border-neutral-gray/50 rounded-md px-4 py-2 text-white focus:outline-none focus:border-redvelvet"
                />
              </div>
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="w-full py-3 bg-redvelvet text-white rounded-md hover:bg-redvelvet/80 transition-colors text-lg font-bold"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 