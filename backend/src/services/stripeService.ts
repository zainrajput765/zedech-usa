import Stripe from 'stripe';

const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.includes('placeholder')) {
    return null;
  }
  return new Stripe(secretKey, {
    apiVersion: '2023-10-16' as any, // using stable typing API version
  });
};

export const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
  const stripe = getStripeClient();
  const amountInCents = Math.round(amount * 100);

  if (!stripe) {
    console.log(`[Stripe Mock] Created Payment Intent for ${amount} ${currency.toUpperCase()}`);
    return {
      id: `pi_mock_${Math.random().toString(36).substring(2, 15)}`,
      client_secret: `pi_mock_secret_${Math.random().toString(36).substring(2, 15)}`,
    };
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return {
    id: paymentIntent.id,
    client_secret: paymentIntent.client_secret,
  };
};

export const createCheckoutSession = async (items: Array<{ name: string; price: number; quantity: number; image?: string }>, successUrl: string, cancelUrl: string) => {
  const stripe = getStripeClient();

  if (!stripe) {
    console.log('[Stripe Mock] Created Checkout Session');
    return {
      id: `cs_mock_${Math.random().toString(36).substring(2, 15)}`,
      url: successUrl + '?session_id=mock_session_id',
    };
  }

  const lineItems = items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        images: item.image ? [item.image] : [],
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return {
    id: session.id,
    url: session.url,
  };
};
