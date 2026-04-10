-- Create plans table for subscription tiers
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  monthly_credits INTEGER NOT NULL DEFAULT 10,
  price_cents INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default plans
INSERT INTO public.plans (name, description, monthly_credits, price_cents) VALUES
  ('Free', 'Perfect for trying out', 10, 0),
  ('Starter', 'For casual writers', 50, 499),
  ('Pro', 'For content creators', 150, 999),
  ('Unlimited', 'For power users', 500, 1999)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  monthly_credits = EXCLUDED.monthly_credits,
  price_cents = EXCLUDED.price_cents;

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read plans
CREATE POLICY "Plans are viewable by everyone" 
  ON public.plans FOR SELECT 
  USING (true);
