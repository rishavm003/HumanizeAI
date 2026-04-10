-- Migration: Add Notification Settings to Profiles
-- Description: Adds columns for granular notification control.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notify_usage BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS notify_marketing BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notify_security BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS notify_status BOOLEAN DEFAULT TRUE;

-- Update existing profiles (if any) to have these defaults
UPDATE public.profiles 
SET 
  notify_usage = TRUE,
  notify_marketing = FALSE,
  notify_security = TRUE,
  notify_status = TRUE
WHERE notify_usage IS NULL;
