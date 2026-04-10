import { supabase } from '../lib/supabase.js';

export const authGuard = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
        statusCode: 401,
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
        statusCode: 401,
      });
    }

    // Get profile from public.profiles with plan details
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*, plans(*)')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError);
    }

    console.log(`[AuthGuard] User: ${user.email}, Role: ${profile?.role || 'user'}`);

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      fullName: profile?.full_name || user.user_metadata?.full_name || '',
      credits: profile?.credits_remaining || 0,
      plan: profile?.plans || null,
      role: profile?.role || 'user',
      createdAt: user.created_at,
    };

    next();
  } catch (error) {
    next(error);
  }
};
