import { Router } from 'express';
import { authGuard } from '../middleware/authGuard.js';
import db from '../lib/db.js';

const router = Router();

/**
 * GET /api/profile
 * Returns the current user's profile, credits, and plan.
 */
router.get('/', authGuard, async (req, res, next) => {
  try {
    // The authGuard already attaches profile info to req.user
    res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/profile/transactions
 * Returns paginated credit transactions for the user.
 */
router.get('/transactions', authGuard, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { data: transactions, error } = await db.supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    res.json({
      success: true,
      data: transactions,
      page,
      limit,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/profile/stats
 * Returns the user's rewrite statistics.
 */
router.get('/stats', authGuard, async (req, res, next) => {
  try {
    const stats = await db.getStats(req.user.id);
    
    // Formula: 100 words = 5 mins saved (0.05 min per word)
    const minutesSaved = Math.round(stats.totalWords * 0.05);
    const hoursSaved = (minutesSaved / 60).toFixed(1);

    res.json({
      success: true,
      data: {
        words_humanized: stats.totalWords.toLocaleString(),
        total_rewrites: stats.totalRewrites,
        success_rate: '99.9%',
        time_saved: hoursSaved >= 1 ? `${hoursSaved}h` : `${minutesSaved}m`,
        trends: stats.trends,
        toneDistribution: stats.toneDistribution
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/profile/notifications
 * Updates user notification preferences.
 */
router.patch('/notifications', authGuard, async (req, res, next) => {
  try {
    const settings = req.body;
    const updatedProfile = await db.updateNotificationSettings(req.user.id, settings);
    
    res.json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/profile
 * Permanently deletes the user account.
 */
router.delete('/', authGuard, async (req, res, next) => {
  try {
    await db.deleteUserAccount(req.user.id);
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/profile/sessions
 * Returns list of active user sessions.
 */
router.get('/sessions', authGuard, async (req, res, next) => {
  try {
    const sessions = await db.listUserSessions(req.user.id);
    res.json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/profile/sessions
 * Tracks the current user session.
 */
router.post('/sessions', authGuard, async (req, res, next) => {
  try {
    const { session_id, user_agent, ip_address, browser_name, os_name } = req.body;
    await db.trackSession({
      user_id: req.user.id,
      session_id,
      user_agent,
      ip_address,
      browser_name,
      os_name
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/profile/sessions/others
 * Revokes all other sessions except the current one.
 */
router.delete('/sessions/others', authGuard, async (req, res, next) => {
  try {
    // 1. Supabase Admin global logout (scope: others)
    const { error } = await db.supabase.auth.admin.signOut(req.user.id, {
      scope: 'others'
    });
    
    if (error) throw error;
    
    // 2. Clean up our local table (keep current session)
    const currentSessionId = req.headers['x-session-id'];
    const { error: dbError } = await db.supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', req.user.id)
      .neq('session_id', currentSessionId);

    if (dbError) throw dbError;

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
