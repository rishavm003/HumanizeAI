-- Add credits and plan fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS credits_remaining INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.plans(id),
ADD COLUMN IF NOT EXISTS billing_anniversary DATE;

-- Create index for efficient credit balance queries
CREATE INDEX IF NOT EXISTS idx_profiles_credits ON public.profiles(credits_remaining);

-- Create index for billing anniversary queries (for monthly reset cron)
CREATE INDEX IF NOT EXISTS idx_profiles_anniversary ON public.profiles(billing_anniversary);
