-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Update the handle_new_user function to include role with default 'user'
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'avatar_url', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the user RISHAVKUMARMISHRA010@GMAIL.COM to admin
-- NOTE: Please run this manually in the Supabase SQL Editor if needed
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'RISHAVKUMARMISHRA010@GMAIL.COM';
