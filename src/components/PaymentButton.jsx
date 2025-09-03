import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FaDiscord, FaLock } from 'react-icons/fa';

const PaymentButton = ({ 
  plan, 
  price, 
  tier, 
  className = "btn-primary w-full",
  children 
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkUser();
    
    // TEMPORALMENTE DESHABILITADO - Causa conflictos
    // const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    //   console.log('PaymentButton auth state changed:', event, session);
    //   if (event === 'SIGNED_IN') {
    //     setUser(session?.user);
    //     setIsAuthenticated(true);
    //     setIsAuthenticated(false);
    //   }
    // });

    // return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  const handlePayment = async () => {
    if (!isAuthenticated) {
      // Si no está autenticado, abrir modal de login
      console.log('Usuario no autenticado, abriendo modal de login...');
      document.dispatchEvent(new CustomEvent('open-login-modal'));
      return;
    }

    // Si está autenticado, proceder al pago
    console.log('Usuario autenticado, procediendo al pago...');
    setLoading(true);
    try {
      await initiatePayment();
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Error al procesar el pago. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async () => {
    try {
      console.log('Iniciando pago para:', { plan, tier, price, userId: user.id });
      
      // Verificar si Stripe está configurado
      const stripeKey = import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!stripeKey) {
        throw new Error('Stripe no está configurado. Por favor, configura las variables de entorno de Stripe.');
      }
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          tier,
          price,
          userId: user.id,
          userEmail: user.email,
          discordId: user.user_metadata?.discord_id || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error creating checkout session');
      }

      const { sessionId } = await response.json();
      console.log('Checkout session created:', sessionId);
      
      // Redirigir a Stripe Checkout
      const { loadStripe } = await import('@stripe/stripe-js');
      const stripe = await loadStripe(stripeKey);
      
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }
      
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Payment error:', error);
      
      // Si es un error de configuración, mostrar mensaje más amigable
      if (error.message.includes('Stripe no está configurado')) {
        alert('Sistema de pagos en desarrollo. Esta funcionalidad estará disponible pronto.');
      } else {
        alert('Error al procesar el pago. Por favor, inténtalo de nuevo.');
      }
      
      throw error;
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`${className} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Procesando...
        </div>
      ) : !isAuthenticated ? (
        <div className="flex items-center justify-center">
          <FaLock className="mr-2" />
          {children || `Pagar ${price}`}
        </div>
      ) : (
        <div className="flex items-center justify-center">
          {children || `Pagar ${price}`}
        </div>
      )}
    </button>
  );
};

export default PaymentButton; 