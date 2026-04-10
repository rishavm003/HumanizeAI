-- Create rewrites table to store humanization history
CREATE TABLE IF NOT EXISTS public.rewrites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input_text TEXT NOT NULL,
  output_text TEXT NOT NULL,
  tone VARCHAR(50),
  word_count INTEGER,
  credits_used INTEGER DEFAULT 1,
  llm_provider VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user history queries
CREATE INDEX IF NOT EXISTS idx_rewrites_user_id ON public.rewrites(user_id);
CREATE INDEX IF NOT EXISTS idx_rewrites_created_at ON public.rewrites(created_at DESC);

-- Enable RLS
ALTER TABLE public.rewrites ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rewrites
CREATE POLICY "Users can view own rewrites" 
  ON public.rewrites FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own rewrites
CREATE POLICY "Users can insert own rewrites" 
  ON public.rewrites FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
