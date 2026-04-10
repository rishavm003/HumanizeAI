-- ==========================================
-- MASTER SUPABASE SETUP SCRIPT (FIXED)
-- ==========================================
-- This script DROPS and RECREATES the tables to ensure correct 
-- ID types (UUID instead of BIGINT).

-- 0. Clean up existing (incorrect) tables
-- We drop in reverse order of dependencies
DROP TABLE IF EXISTS public.credit_transactions;
DROP TABLE IF EXISTS public.rewrites;
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.plans;

-- 1. Create Plans Table (Required first because profiles references it)
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  monthly_credits INTEGER NOT NULL DEFAULT 10,
  price_cents INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Profiles Table (Base)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  credits_remaining INTEGER DEFAULT 10,
  plan_id UUID REFERENCES public.plans(id),
  billing_anniversary DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Rewrites Table
CREATE TABLE public.rewrites (
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

-- 4. Create Credit Transactions Table
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, 
  reason VARCHAR(50) NOT NULL, 
  rewrite_id UUID REFERENCES public.rewrites(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Insert Default Plans
INSERT INTO public.plans (name, description, monthly_credits, price_cents) VALUES
  ('Free', 'Perfect for trying out', 10, 0),
  ('Starter', 'For casual writers', 50, 499),
  ('Pro', 'For content creators', 150, 999),
  ('Unlimited', 'For power users', 500, 1999)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  monthly_credits = EXCLUDED.monthly_credits,
  price_cents = EXCLUDED.price_cents;

-- 6. Functions for Atomic Credit Operations
CREATE OR REPLACE FUNCTION deduct_credit_atomic(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  UPDATE public.profiles
  SET credits_remaining = credits_remaining - 1
  WHERE id = p_user_id
    AND credits_remaining > 0
  RETURNING credits_remaining INTO new_balance;
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewrites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- 8. Policies (Hardened for Data Privacy)
-- Profiles: User can ONLY see and update their own record
CREATE POLICY "Users can only view own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can only update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Plans: Publicly viewable (non-sensitive)
CREATE POLICY "Plans are viewable by everyone" ON public.plans 
  FOR SELECT USING (true);

-- Rewrites: User can ONLY see and insert their own records
CREATE POLICY "Users can only view own rewrites" ON public.rewrites 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert own rewrites" ON public.rewrites 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions: User can ONLY see their own audit log
CREATE POLICY "Users can only view own transactions" ON public.credit_transactions 
  FOR SELECT USING (auth.uid() = user_id);


-- 9. Automated Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, plan_id)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email, 
    new.raw_user_meta_data->>'avatar_url',
    (SELECT id FROM public.plans WHERE name = 'Free' LIMIT 1)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

