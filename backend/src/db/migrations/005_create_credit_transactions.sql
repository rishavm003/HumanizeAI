-- Create credit_transactions table for audit trail
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positive for addition, negative for deduction
  reason VARCHAR(50) NOT NULL, -- 'rewrite', 'monthly_reset', 'topup', 'bonus', 'refund'
  rewrite_id UUID REFERENCES public.rewrites(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_reason ON public.credit_transactions(reason);

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own transactions
CREATE POLICY "Users can view own credit transactions" 
  ON public.credit_transactions FOR SELECT 
  USING (auth.uid() = user_id);

-- System can insert transactions for any user
CREATE POLICY "System can insert credit transactions" 
  ON public.credit_transactions FOR INSERT 
  WITH CHECK (true);
