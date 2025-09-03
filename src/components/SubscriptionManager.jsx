import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FaCrown, FaCalendar, FaCreditCard, FaTimes, FaCheck } from 'react-icons/fa';

export default function SubscriptionManager() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
      }

      setSubscription(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!subscription) return;

    setCanceling(true);
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.stripe_subscription_id,
        }),
      });

      if (!response.ok) {
        throw new Error('Error canceling subscription');
      }

      // Actualizar estado local
      setSubscription(prev => ({
        ...prev,
        status: 'canceled',
        canceled_at: new Date().toISOString(),
      }));

      alert('Suscripción cancelada exitosamente');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Error al cancelar la suscripción');
    } finally {
      setCanceling(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTierColor = (tier) => {
    const colors = {
      'Bronce': 'text-[#CD7F32]',
      'Plata': 'text-[#C0C0C0]',
      'Oro': 'text-[#FFD700]',
      'Diamante': 'text-[#B9F2FF]',
      'Diamante+': 'text-[#FF69B4]',
      'Server Booster': 'text-[#FF6B6B]',
    };
    return colors[tier] || 'text-redvelvet';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-redvelvet"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center p-8">
        <FaTimes className="w-12 h-12 text-neutral-gray mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Sin Suscripción Activa</h3>
        <p className="text-neutral-gray mb-4">
          No tienes una suscripción activa en este momento.
        </p>
        <button 
          onClick={() => window.location.href = '/comunidad'}
          className="btn-primary"
        >
          Ver Planes
        </button>
      </div>
    );
  }

  return (
    <div className="bg-neutral-gray/10 backdrop-blur-md p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FaCrown className={`w-8 h-8 ${getTierColor(subscription.tier)} mr-3`} />
          <div>
            <h3 className="text-2xl font-bold text-white">{subscription.tier}</h3>
            <p className="text-neutral-gray">Plan {subscription.plan}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
          subscription.status === 'active' 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          {subscription.status === 'active' ? 'Activa' : 'Cancelada'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="flex items-center">
          <FaCalendar className="w-5 h-5 text-neutral-gray mr-3" />
          <div>
            <p className="text-sm text-neutral-gray">Próximo pago</p>
            <p className="text-white font-semibold">
              {formatDate(subscription.current_period_end)}
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <FaCreditCard className="w-5 h-5 text-neutral-gray mr-3" />
          <div>
            <p className="text-sm text-neutral-gray">ID de Suscripción</p>
            <p className="text-white font-mono text-sm">
              {subscription.stripe_subscription_id.slice(-8)}
            </p>
          </div>
        </div>
      </div>

      {subscription.discord_id && (
        <div className="bg-neutral-gray/20 p-4 rounded-lg mb-6">
          <div className="flex items-center">
            <FaCheck className="w-5 h-5 text-green-400 mr-3" />
            <div>
              <p className="text-white font-semibold">Discord Conectado</p>
              <p className="text-neutral-gray text-sm">
                Tu cuenta de Discord está vinculada a esta suscripción
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button 
          onClick={() => window.location.href = '/comunidad'}
          className="btn-secondary flex-1"
        >
          Cambiar Plan
        </button>
        
        {subscription.status === 'active' && (
          <button 
            onClick={cancelSubscription}
            disabled={canceling}
            className="btn-primary bg-red-600 hover:bg-red-700 flex-1"
          >
            {canceling ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Cancelando...
              </div>
            ) : (
              'Cancelar Suscripción'
            )}
          </button>
        )}
      </div>

      {subscription.canceled_at && (
        <div className="mt-4 p-4 bg-yellow-500/20 rounded-lg">
          <p className="text-yellow-400 text-sm">
            <strong>Nota:</strong> Tu suscripción será cancelada el{' '}
            {formatDate(subscription.current_period_end)}. 
            Podrás seguir disfrutando de los beneficios hasta esa fecha.
          </p>
        </div>
      )}
    </div>
  );
} 