import Stripe from 'stripe';
import { supabase } from '../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleCheckoutSessionCompleted(session) {
  const { userId, plan, tier, discordId } = session.metadata;
  
  // Crear o actualizar suscripción en Supabase
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_subscription_id: session.subscription,
      stripe_customer_id: session.customer,
      plan,
      tier,
      status: 'active',
      discord_id: discordId,
      current_period_start: new Date(session.subscription_data?.current_period_start * 1000),
      current_period_end: new Date(session.subscription_data?.current_period_end * 1000),
    });

  if (error) {
    console.error('Error saving subscription:', error);
    throw error;
  }

  // Actualizar metadatos del usuario
  await supabase.auth.updateUser({
    data: {
      subscription_tier: tier,
      subscription_status: 'active',
      stripe_customer_id: session.customer,
    }
  });
}

async function handleSubscriptionCreated(subscription) {
  const { userId, plan, tier, discordId } = subscription.metadata;
  
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      plan,
      tier,
      status: subscription.status,
      discord_id: discordId,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
    });

  if (error) {
    console.error('Error saving subscription:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }

  // Actualizar metadatos del usuario
  const { data: subData } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (subData) {
    await supabase.auth.updateUser({
      data: {
        subscription_tier: null,
        subscription_status: 'canceled',
      }
    });
  }
}

async function handlePaymentSucceeded(invoice) {
  // Registrar el pago exitoso
  const { error } = await supabase
    .from('payments')
    .insert({
      stripe_invoice_id: invoice.id,
      stripe_subscription_id: invoice.subscription,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'succeeded',
      paid_at: new Date(),
    });

  if (error) {
    console.error('Error saving payment:', error);
    throw error;
  }
}

async function handlePaymentFailed(invoice) {
  // Registrar el pago fallido
  const { error } = await supabase
    .from('payments')
    .insert({
      stripe_invoice_id: invoice.id,
      stripe_subscription_id: invoice.subscription,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'failed',
      failed_at: new Date(),
    });

  if (error) {
    console.error('Error saving failed payment:', error);
    throw error;
  }
} 