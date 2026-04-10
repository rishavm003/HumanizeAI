import express from 'express';
import { stripe } from '../lib/stripe.js';
import { CreditService } from '../services/CreditService.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Stripe Webhook Endpoint
// IMPORTANT: This route MUST use express.raw({ type: 'application/json' }) 
// so Stripe can verify the payload signature.
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const planName = session.metadata.planName;

        if (userId && planName) {
          console.log(`Payment confirmed for user ${userId}. Upgrading to plan: ${planName}`);
          await CreditService.updateUserPlan(userId, planName);
        }
        break;
      }
      
      // Handle other event types if needed
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
