import supabase from './supabase.js';

/**
 * Fetches a user's profile and their associated plan details.
 * @param {string} userId - The UUID of the user.
 */
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, plans(*)')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error.message);
    throw error;
  }
  return data;
};

/**
 * Atomic decrement of user credits.
 * This requires the `decrement_credits` function to be define in Migration 2.
 * @param {string} userId - The UUID of the user.
 * @param {number} amount - The amount to decrement.
 */
export const updateCredits = async (userId, amount) => {
  const { data, error } = await supabase.rpc('decrement_credits', {
    target_user_id: userId,
    decrement_amount: amount
  });

  if (error) {
    console.error('Error updating credits:', error.message);
    throw error;
  }
  return data;
};

/**
 * Inserts a new rewrite record.
 * @param {Object} rewriteData - The rewrite data to insert.
 */
export const insertRewrite = async (rewriteData) => {
  const { data, error } = await supabase
    .from('rewrites')
    .insert([rewriteData])
    .select()
    .single();

  if (error) {
    console.error('Error inserting rewrite:', error.message);
    throw error;
  }
  return data;
};

/**
 * Records a credit transaction for auditing.
 * @param {Object} transactionData - The transaction details.
 */
export const insertCreditTransaction = async (transactionData) => {
  const { data, error } = await supabase
    .from('credit_transactions')
    .insert([transactionData])
    .select()
    .single();

  if (error) {
    console.error('Error inserting credit transaction:', error.message);
    throw error;
  }
  return data;
};

/**
 * Fetches paginated rewrite history for a user.
 * @param {string} userId - The UUID of the user.
 * @param {number} page - The page number (starting from 1).
 * @param {number} limit - Items per page.
 */
export const getRewriteHistory = async (userId, page = 1, limit = 10) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('rewrites')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching rewrite history:', error.message);
    throw error;
  }

  return { data, total: count };
};

/**
 * Calculates detailed statistics for a user, including trends and tones.
 * @param {string} userId - The UUID of the user.
 */
export const getStats = async (userId) => {
  console.log(`[Stats] Fetching data for user: ${userId}`);
  
  const { data: rewrites, error } = await supabase
    .from('rewrites')
    .select('created_at, word_count, tone')
    .eq('user_id', userId);

  if (error) {
    console.error('[Stats] DB Error:', error.message);
    throw error;
  }

  console.log(`[Stats] Found ${rewrites?.length || 0} records`);

  // 1. Total Words
  const totalWords = rewrites.reduce((acc, curr) => acc + (curr.word_count || 0), 0);

  // 2. Trend Data (Last 7 Days)
  const trends = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    const dayTotal = rewrites
      .filter(r => {
        if (!r.created_at) return false;
        try {
          // Normalize both to YYYY-MM-DD
          const rDate = new Date(r.created_at).toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD
          const trackDate = d.toLocaleDateString('en-CA');
          return rDate === trackDate;
        } catch (e) {
          return false;
        }
      })
      .reduce((acc, curr) => acc + (Number(curr.word_count) || 0), 0);
      
    return { date: dateStr, count: dayTotal };
  }).reverse();

  // 3. Tone Distribution
  const tones = {};
  rewrites.forEach(r => {
    const tone = r.tone || 'Natural';
    tones[tone] = (tones[tone] || 0) + 1;
  });
  
  const totalRewrites = rewrites.length;
  const toneDistribution = Object.entries(tones).map(([label, count]) => ({
    label,
    percent: Math.round((count / (totalRewrites || 1)) * 100)
  }));

  return {
    totalWords,
    totalRewrites,
    trends,
    toneDistribution
  };
};

/**
 * Updates a user's notification preferences.
 */
export const updateNotificationSettings = async (userId, settings) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(settings)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Permanently deletes a user account and all associated data.
 * Uses the service role client for auth deletion.
 */
export const deleteUserAccount = async (userId) => {
  // Supabase Auth deletion (cascades to public.profiles and other tables)
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) throw error;
  return true;
};

/**
 * Tracks a user session with device metadata.
 */
export const trackSession = async (sessionData) => {
  const { data, error } = await supabase
    .from('user_sessions')
    .upsert([sessionData], { onConflict: 'session_id' })
    .select()
    .single();

  if (error) {
    console.error('Error tracking session:', error.message);
    throw error;
  }
  return data;
};

/**
 * Lists active sessions for a user.
 */
export const listUserSessions = async (userId) => {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('last_active', { ascending: false });

  if (error) {
    console.error('Error listing user sessions:', error.message);
    throw error;
  }
  return data;
};

/**
 * [ADMIN] Fetches all users with their plan and credit details.
 */
export const getAllUsers = async (page = 1, limit = 50) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('profiles')
    .select('*, plans(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { data, total: count };
};

/**
 * [ADMIN] Fetches global platform statistics.
 */
export const getAdminStats = async () => {
  const [
    { count: totalUsers },
    { count: totalRewrites },
    { data: creditsTotal },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('rewrites').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('credits_remaining'),
  ]);

  const activeCredits = creditsTotal.reduce((acc, curr) => acc + (curr.credits_remaining || 0), 0);

  return {
    totalUsers,
    totalRewrites,
    activeCredits,
    lastUpdated: new Date().toISOString()
  };
};

export default {
  supabase,
  getUserProfile,
  updateCredits,
  insertRewrite,
  insertCreditTransaction,
  getRewriteHistory,
  getStats,
  updateNotificationSettings,
  deleteUserAccount,
  trackSession,
  listUserSessions,
  getAllUsers,
  getAdminStats,
};
