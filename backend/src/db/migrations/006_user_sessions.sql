-- 6. Create User Sessions Table for advanced management
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE NOT NULL, -- Supabase Session ID
  user_agent TEXT,
  ip_address TEXT,
  os_name TEXT,
  browser_name TEXT,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup by user
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own sessions
CREATE POLICY "Users can view their own sessions" 
  ON public.user_sessions FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Users can only delete their own sessions
CREATE POLICY "Users can delete their own sessions" 
  ON public.user_sessions FOR DELETE 
  USING (auth.uid() = user_id);
