import { supabase } from './supabase';

let authStateChangeCallback = null;
let isInitialized = false;
let authSubscription = null;

export const initAuth = async () => {
  if (isInitialized) {
    console.log('Auth ya está inicializado');
    return;
  }

  console.log('Inicializando auth...');
  isInitialized = true;

  // Limpiar suscripción anterior si existe
  if (authSubscription) {
    authSubscription.unsubscribe();
  }

  // Configurar el listener de cambios de estado
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('Cambio de estado de autenticación:', event, session);
    if (authStateChangeCallback) {
      authStateChangeCallback(session);
    }
  });

  authSubscription = subscription;

  // Limpiar la suscripción cuando se desmonte
  window.addEventListener('unload', () => {
    if (authSubscription) {
      authSubscription.unsubscribe();
    }
    isInitialized = false;
    authStateChangeCallback = null;
  });

  // Verificar el estado inicial
  return checkAuth();
};

export const checkAuth = async () => {
  try {
    console.log('Verificando estado de autenticación...');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error al obtener la sesión:', error);
      return null;
    }

    console.log('Sesión actual:', session);
    if (authStateChangeCallback) {
      authStateChangeCallback(session);
    }
    return session;
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    return null;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    console.log('Current user from getCurrentUser:', user);
    return user;
  } catch (error) {
    console.error('Error al obtener el usuario actual:', error);
    return null;
  }
};

export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Error al obtener la sesión actual:', error);
    return null;
  }
};

export const setAuthStateChangeCallback = (callback) => {
  authStateChangeCallback = callback;
}; 