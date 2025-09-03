import Stripe from 'stripe';

// Verificar si Stripe está configurado
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY no está configurada. Los pagos no funcionarán.');
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verificar si Stripe está configurado
  if (!stripe) {
    return res.status(503).json({ 
      error: 'Sistema de pagos no configurado',
      message: 'Stripe no está configurado. Por favor, configura las variables de entorno de Stripe.'
    });
  }

  try {
    const { plan, tier, price, userId, userEmail, discordId } = req.body;

    // Validar datos requeridos
    if (!plan || !tier || !price || !userId || !userEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Crear la sesión de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `CreatorLab - ${tier}`,
              description: `Membresía ${tier} de CreatorLab`,
              images: ['https://your-domain.com/logos/LOGOWHITE.png'],
            },
            unit_amount: Math.round(parseFloat(price.replace('$', '').replace('/mes', '')) * 100), // Convertir a centavos
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4322'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4322'}/comunidad`,
      customer_email: userEmail,
      metadata: {
        userId,
        plan,
        tier,
        discordId: discordId || '',
      },
      subscription_data: {
        metadata: {
          userId,
          plan,
          tier,
          discordId: discordId || '',
        },
      },
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Error creating checkout session',
      message: error.message 
    });
  }
} 