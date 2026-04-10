import { Router } from 'express';
import { authGuard } from '../middleware/authGuard.js';
import db from '../lib/db.js';
import redis from '../lib/redis.js';
import CreditService from '../services/CreditService.js';
import { getPrimaryAdapter } from '../adapters/index.js';

const router = Router();

/**
 * POST /api/rewrite
 * Performs text humanization, handles locking, and manages credits.
 */
router.post('/', authGuard, async (req, res, next) => {
  const userId = req.user.id;
  const lockKey = `lock:rewrite:${userId}`;
  
  try {
    const { text, tone } = req.body;

    if (!text || !tone) {
      return res.status(400).json({ error: 'Text and tone are required' });
    }

    // 1. Acquire distributed lock to prevent concurrent sessions/double charges
    const locked = await redis.acquireLock(lockKey, 30);
    if (!locked) {
      return res.status(429).json({ error: 'A rewrite is already in progress' });
    }

    // 2. Check for sufficient credits
    if (req.user.credits < 1) {
      await redis.releaseLock(lockKey);
      return res.status(403).json({ error: 'Insufficient credits' });
    }

    // 3. Execute adapter-based LLM completion
    const adapter = getPrimaryAdapter();
    const systemPrompt = ''; // The Groq adapter handles the system instructions internally
    
    let outputText = await adapter.complete(systemPrompt, text, { tone });
    
    if (typeof outputText !== 'string') {
      outputText = JSON.stringify(outputText);
    }
    
    const wordCount = text.trim().split(/\s+/).length;

    // 4. Insert Rewrite Record
    const rewrite = await db.insertRewrite({
      user_id: userId,
      input_text: text,
      output_text: outputText,
      tone: tone,
      word_count: wordCount,
      credits_used: 1,
      llm_provider: process.env.LLM_PROVIDER || adapter.name || 'unknown'
    });

    // 5. Atomic Credit Decrement + Audit Transaction via CreditService
    await CreditService.deductCredit(userId, rewrite.id);

    // 6. Release Lock
    await redis.releaseLock(lockKey);

    res.json({
      success: true,
      data: rewrite
    });

  } catch (error) {
    // Ensure lock is released even on error
    await redis.releaseLock(lockKey);
    next(error);
  }
});

/**
 * GET /api/rewrite/history
 * Returns the rewrite history for the user.
 */
router.get('/history', authGuard, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await db.getRewriteHistory(userId, page, limit);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

export default router;
