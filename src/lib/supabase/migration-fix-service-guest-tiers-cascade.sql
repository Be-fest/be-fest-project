-- Migration: Fix service_guest_tiers foreign key constraint
-- Purpose: Add ON DELETE CASCADE to service_guest_tiers.service_id foreign key
-- This fixes the issue where services cannot be deleted due to foreign key constraints

-- Drop the existing foreign key constraint
ALTER TABLE public.service_guest_tiers
DROP CONSTRAINT service_guest_tiers_service_id_fkey;

-- Recreate the foreign key with ON DELETE CASCADE
ALTER TABLE public.service_guest_tiers
ADD CONSTRAINT service_guest_tiers_service_id_fkey
FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;

-- Verify the constraint was created correctly
SELECT constraint_name, table_name, column_name, referenced_table_name
FROM information_schema.key_column_usage
WHERE table_name = 'service_guest_tiers' AND column_name = 'service_id';
