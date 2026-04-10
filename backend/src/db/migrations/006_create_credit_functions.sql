-- Function to atomically deduct a credit
-- Returns the new balance or NULL if insufficient credits
CREATE OR REPLACE FUNCTION deduct_credit_atomic(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  -- Attempt to deduct one credit, but only if balance > 0
  UPDATE public.profiles
  SET credits_remaining = credits_remaining - 1
  WHERE id = p_user_id
    AND credits_remaining > 0
  RETURNING credits_remaining INTO new_balance;
  
  -- If no row was updated (insufficient credits), return NULL
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely add credits
CREATE OR REPLACE FUNCTION add_credits_atomic(p_user_id UUID, p_amount INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  UPDATE public.profiles
  SET credits_remaining = credits_remaining + p_amount
  WHERE id = p_user_id
  RETURNING credits_remaining INTO new_balance;
  
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset credits to a specific amount
CREATE OR REPLACE FUNCTION reset_credits_atomic(p_user_id UUID, p_new_amount INTEGER)
RETURNS INTEGER AS $$
DECLARE
  old_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- Get old balance for logging
  SELECT credits_remaining INTO old_balance
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Reset to new amount
  UPDATE public.profiles
  SET credits_remaining = p_new_amount,
      billing_anniversary = CURRENT_DATE
  WHERE id = p_user_id
  RETURNING credits_remaining INTO new_balance;
  
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
