import { Router } from 'express';
import { CreditService, InsufficientCreditsError } from '../services/CreditService.js';
import { authGuard } from '../middleware/authGuard.js';

const router = Router();

// GET /api/credits - Get current balance and plan info
router.get('/', authGuard, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const [balance, plan] = await Promise.all([
      CreditService.getBalance(userId),
      CreditService.getUserPlan(userId),
    ]);

    res.json({
      success: true,
      data: {
        balance,
        role: req.user.role,
        plan: plan.planId,
        planName: plan.planName,
        monthlyAllowance: plan.monthlyAllowance,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/credits/history - Get credit transaction history
router.get('/history', authGuard, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const cursor = req.query.cursor || null;

    const history = await CreditService.getCreditHistory(userId, limit, cursor);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/credits/invoices - Fetch user invoices directly from Stripe using Email lookup
router.get('/invoices', authGuard, async (req, res, next) => {
  try {
    const email = req.user.email;
    
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.json({
        success: true,
        data: [], // Graceful fallback
        message: 'Stripe is not configured in this environment.'
      });
    }

    const { stripe } = await import('../lib/stripe.js');
    
    // Search for Stripe customer by email
    const customers = await stripe.customers.search({
      query: `email:'${email}'`,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return res.json({
        success: true,
        data: [], // No customer found
      });
    }

    const customerId = customers.data[0].id;

    // Fetch invoices for this customer
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 20,
    });

    res.json({
      success: true,
      data: invoices.data,
    });
  } catch (error) {
    console.error('Invoice fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve invoices from billing provider' });
  }
});

// POST /api/credits/topup - Create Stripe payment intent for credit top-up
router.post('/topup', authGuard, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { packageId } = req.body;

    // Credit package definitions
    const packages = {
      'starter': { credits: 50, price: 499, name: 'Starter' },      // $4.99
      'pro': { credits: 150, price: 999, name: 'Pro' },              // $9.99
      'unlimited': { credits: 500, price: 1999, name: 'Unlimited' }, // $19.99
    };

    const selectedPackage = packages[packageId];
    if (!selectedPackage) {
      return res.status(400).json({
        success: false,
        error: 'Invalid package',
        message: 'Please select a valid credit package',
      });
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({
        success: false,
        error: 'Payment unavailable',
        message: 'Payment processing is temporarily unavailable',
      });
    }

    // Import Stripe dynamically
    const stripe = await import('stripe').then(m => m.default(process.env.STRIPE_SECRET_KEY));

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: selectedPackage.price,
      currency: 'usd',
      metadata: {
        userId,
        packageId,
        credits: selectedPackage.credits,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Store pending transaction in Redis (for webhook verification)
    await redis.setex(
      `payment_intent:${paymentIntent.id}`,
      3600, // 1 hour
      JSON.stringify({
        userId,
        packageId,
        credits: selectedPackage.credits,
      })
    );

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        package: selectedPackage,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/credits/create-checkout-session - Initiate plan upgrade via Stripe
router.post('/create-checkout-session', authGuard, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { planName } = req.body;

    if (!planName) {
      return res.status(400).json({
        success: false,
        error: 'Missing Plan',
        message: 'Please select a plan',
      });
    }

    // Mapping plans to prices (Reverted to original USD prices)
    const prices = {
      'Starter': 499, // $4.99
      'Pro': 999,    // $9.99
      'Unlimited': 1999, // $19.99
    };

    const priceAmount = prices[planName];
    if (!priceAmount && planName !== 'Free') {
       throw new Error('Invalid plan selection');
    }

    // Import stripe client
    const { stripe } = await import('../lib/stripe.js');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${planName} Plan`,
              description: `Upgrade to ${planName} for additional credits and features.`,
            },
            unit_amount: priceAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      client_reference_id: userId,
      metadata: { planName },
      success_url: `${process.env.FRONTEND_URL}/app/billing?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/app/billing?canceled=true`,
    });

    res.json({
      success: true,
      data: { url: session.url },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/credits/packages - Get available credit packages
router.get('/packages', authGuard, async (req, res, next) => {
  try {
    const packages = [
      { id: 'starter', credits: 50, price: 499, name: 'Starter', popular: false },
      { id: 'pro', credits: 150, price: 999, name: 'Pro', popular: true },
      { id: 'unlimited', credits: 500, price: 1999, name: 'Unlimited', popular: false },
    ];

    res.json({
      success: true,
      data: { packages },
    });
  } catch (error) {
    next(error);
  }
});

// Error handler for credit-specific errors
router.use((error, req, res, next) => {
  if (error instanceof InsufficientCreditsError) {
    return res.status(402).json({
      success: false,
      error: 'Insufficient Credits',
      message: error.message,
      statusCode: 402,
    });
  }
  next(error);
});

export default router;
