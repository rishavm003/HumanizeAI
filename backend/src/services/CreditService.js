import { supabase } from '../lib/supabase.js';
import { getRedisClient } from '../lib/redis.js';

const CREDIT_CACHE_TTL = 300; // 5 minutes in seconds

class InsufficientCreditsError extends Error {
  constructor(message = 'Insufficient credits') {
    super(message);
    this.name = 'InsufficientCreditsError';
    this.statusCode = 402;
  }
}

export class CreditService {
  /**
   * Get user's credit balance
   * Uses Redis cache with fallback to database
   */
  static async getBalance(userId) {
    const cacheKey = `credits:${userId}`;
    
    try {
      // 1. Check Redis cache
      const redis = getRedisClient();
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached !== null) {
          return parseInt(cached, 10);
        }
      }
    } catch (error) {
      console.error('Redis cache error:', error);
      // Continue to database if cache fails
    }

    // 2. Query Supabase if cache miss
    let { data: profile, error } = await supabase
      .from('profiles')
      .select('credits_remaining')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Database error fetching credits:', error);
      throw new Error('Failed to fetch credit balance');
    }

    // Auto-create profile if it doesn't exist
    if (!profile) {
      console.log(`Auto-creating missing profile for user ${userId}`);
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          credits_remaining: 10,
          plan_id: (await supabase.from('plans').select('id').eq('name', 'Free').single()).data?.id
        })
        .select('credits_remaining')
        .single();
      
      if (!createError) {
        profile = newProfile;
      }
    }

    const balance = profile?.credits_remaining ?? 0;

    // 3. Write to Redis with TTL
    try {
      const redis = getRedisClient();
      if (redis) {
        await redis.setex(cacheKey, CREDIT_CACHE_TTL, balance.toString());
      }
    } catch (error) {
      console.error('Redis cache write error:', error);
      // Non-fatal, continue
    }

    return balance;
  }

  /**
   * Check if user has sufficient credits
   */
  static async checkSufficientCredits(userId, required = 1) {
    const balance = await this.getBalance(userId);
    return balance >= required;
  }

  /**
   * Deduct one credit atomically
   */
  static async deductCredit(userId, rewriteId) {
    // 1. Update database atomically using the RPC function we created
    const { data: newBalance, error: rpcError } = await supabase.rpc(
      'deduct_credit_atomic',
      { p_user_id: userId }
    );

    if (rpcError || newBalance === null) {
      console.error('Credit deduction failed:', rpcError?.message || 'Insufficient credits');
      throw new InsufficientCreditsError();
    }

    // 2. Invalidate Redis cache
    await this.invalidateCache(userId);

    // 3. Record transaction
    await this.recordTransaction(userId, -1, 'rewrite', rewriteId);

    return newBalance;
  }

  /**
   * Add credits to user account
   */
  static async addCredits(userId, amount, reason, metadata = {}) {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // 1. Update database using the atomic add function
    const { data: newBalance, error: rpcError } = await supabase.rpc(
      'add_credits_atomic',
      { p_user_id: userId, p_amount: amount }
    );

    if (rpcError) {
      console.error('Failed to add credits:', rpcError);
      throw new Error('Failed to add credits');
    }

    // 2. Invalidate Redis cache
    await this.invalidateCache(userId);

    // 3. Record transaction
    await this.recordTransaction(userId, amount, reason, null, metadata);

    return newBalance;
  }

  /**
   * Reset monthly credits based on user's plan
   */
  static async resetMonthlyCredits(userId) {
    // Get user's subscription plan
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('plan_id, plans(monthly_credits)')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('Failed to fetch user plan:', error);
      throw new Error('Failed to fetch user plan');
    }

    const monthlyCredits = profile.plans?.monthly_credits || 10; // Default to free plan

    // Reset credits to monthly allowance
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({ credits_remaining: monthlyCredits })
      .eq('id', userId)
      .select('credits_remaining')
      .single();

    if (updateError) {
      console.error('Failed to reset credits:', updateError);
      throw new Error('Failed to reset credits');
    }

    // Invalidate cache
    await this.invalidateCache(userId);

    // Record transaction
    await this.recordTransaction(userId, monthlyCredits, 'monthly_reset', null, {
      previous_balance: profile.credits_remaining || 0,
      plan_id: profile.plan_id,
    });

    return updated.credits_remaining;
  }

  /**
   * Get user's credit history
   */
  static async getCreditHistory(userId, limit = 50, cursor = null) {
    let query = supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch credit history:', error);
      throw new Error('Failed to fetch credit history');
    }

    return {
      transactions: data || [],
      nextCursor: data?.length === limit ? data[data.length - 1]?.created_at : null,
    };
  }

  /**
   * Update user's subscription plan
   */
  static async updateUserPlan(userId, planName) {
    // 1. Get the new plan details
    const { data: newPlan, error: planError } = await supabase
      .from('plans')
      .select('id, monthly_credits')
      .eq('name', planName)
      .single();

    if (planError || !newPlan) {
      console.error('Failed to find plan:', planName, planError);
      throw new Error('Invalid plan selected');
    }

    // 2. Update user profile
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        plan_id: newPlan.id,
        credits_remaining: newPlan.monthly_credits,
        billing_anniversary: new Date().toISOString().split('T')[0]
      })
      .eq('id', userId)
      .select('credits_remaining')
      .single();

    if (updateError) {
      console.error('Failed to update user plan:', updateError);
      throw new Error('Failed to update subscription');
    }

    // 3. Invalidate Redis cache
    await this.invalidateCache(userId);

    // 4. Record transaction
    await this.recordTransaction(userId, newPlan.monthly_credits, 'plan_change', null, {
      new_plan: planName,
    });

    return {
      newBalance: updated.credits_remaining,
      planName
    };
  }

  /**
   * Get user's plan details
   */
  static async getUserPlan(userId) {
    let { data: profile, error } = await supabase
      .from('profiles')
      .select('plan_id, credits_remaining, plans(name, monthly_credits)')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch user plan:', error);
      throw new Error('Failed to fetch user plan');
    }

    // Auto-create if missing
    if (!profile) {
      console.log(`Auto-creating missing profile in getUserPlan for user ${userId}`);
      const freePlan = (await supabase.from('plans').select('id, name, monthly_credits').eq('name', 'Free').single()).data;
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          credits_remaining: 10,
          plan_id: freePlan?.id
        })
        .select('plan_id, credits_remaining, plans(name, monthly_credits)')
        .single();
      
      if (!createError) {
        profile = newProfile;
      } else {
        // Fallback for UI if creation fails
        return {
          planId: freePlan?.id,
          planName: 'Free',
          monthlyAllowance: 10,
          currentBalance: 10,
        };
      }
    }

    return {
      planId: profile.plan_id,
      planName: profile.plans?.name || 'Free',
      monthlyAllowance: profile.plans?.monthly_credits || 10,
      currentBalance: profile.credits_remaining,
    };
  }

  /**
   * Invalidate user's credit cache
   */
  static async invalidateCache(userId) {
    try {
      const redis = getRedisClient();
      if (redis) {
        await redis.del(`credits:${userId}`);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
      // Non-fatal
    }
  }

  /**
   * Record a credit transaction
   */
  static async recordTransaction(userId, amount, reason, rewriteId = null, metadata = {}) {
    const { error } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount,
        reason,
        rewrite_id: rewriteId,
        metadata,
      });

    if (error) {
      console.error('Failed to record transaction:', error);
      // Non-fatal, don't throw
    }
  }

  /**
   * Get users whose billing anniversary is today
   */
  static async getUsersForMonthlyReset() {
    const today = new Date();
    const dayOfMonth = today.getDate();

    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, created_at')
      .filter('created_at', 'not.is', null)
      .filter('plan_id', 'not.is', null);

    if (error) {
      console.error('Failed to fetch users for reset:', error);
      throw new Error('Failed to fetch users');
    }

    // Filter users whose anniversary is today
    return (users || []).filter(user => {
      const createdDate = new Date(user.created_at);
      return createdDate.getDate() === dayOfMonth;
    });
  }
}

export { InsufficientCreditsError };
export default CreditService;
