import { Router } from 'express';
import { authGuard } from '../middleware/authGuard.js';
import { adminGuard } from '../middleware/adminGuard.js';
import db from '../lib/db.js';
import CreditService from '../services/CreditService.js';

const router = Router();

// Apply security middlewares to all admin routes
router.use(authGuard);
router.use(adminGuard);

/**
 * GET /api/admin/stats
 * Global platform overview
 */
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await db.getAdminStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/users
 * List all users with pagination
 */
router.get('/users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    
    const users = await db.getAllUsers(page, limit);
    res.json({ success: true, ...users });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/users/:id/credits
 * Manually update a user's credit balance
 */
router.post('/users/:id/credits', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    if (typeof amount !== 'number' || !reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount (number) and reason (string) are required' 
      });
    }

    // Use absolute value for adding, negative for removing
    let newBalance;
    if (amount > 0) {
      newBalance = await CreditService.addCredits(id, amount, reason, { 
        admin_id: req.user.id 
      });
    } else {
      // Manual deduction logic
      const { data, error } = await db.supabase.rpc('add_credits_atomic', {
        p_user_id: id,
        p_amount: amount // adding a negative number
      });
      
      if (error) throw error;
      newBalance = data;
      
      await CreditService.recordTransaction(id, amount, reason, null, {
        admin_id: req.user.id
      });
    }

    res.json({ 
      success: true, 
      message: `Successfully adjusted credits by ${amount}`,
      data: { newBalance }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/reset-credits-task
 * Scheduled task for monthly credit resets (Vercel Cron)
 */
router.get('/reset-credits-task', async (req, res, next) => {
  try {
    // 1. Fetch users for reset
    const users = await CreditService.getUsersForMonthlyReset();
    
    if (users.length === 0) {
      return res.json({ success: true, message: 'No users due for reset today' });
    }

    // 2. Perform resets
    const results = await Promise.allSettled(
      users.map(user => CreditService.resetMonthlyCredits(user.id))
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    
    res.json({ 
      success: true, 
      message: `Successfully reset credits for ${successCount}/${users.length} users` 
    });
  } catch (error) {
    next(error);
  }
});

export default router;
