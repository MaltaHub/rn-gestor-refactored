-- Seed custom roles needed by migrations when running Supabase CLI shadow DB.
-- These roles mirror roles that exist in the remote project but are absent locally.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rpc_executor') THEN
    CREATE ROLE rpc_executor NOLOGIN;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'cli_user') THEN
    CREATE ROLE cli_user NOLOGIN;
  END IF;
END $$;

-- Stub for storage.create_bucket to allow migrations to run in
-- Supabase CLI shadow DBs that may lack the Storage extension.
-- This is a no-op implementation used only during diffing/pull.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'storage' AND p.proname = 'create_bucket'
  ) THEN
    -- Ensure schema exists so function can be created
    CREATE SCHEMA IF NOT EXISTS storage;

    CREATE OR REPLACE FUNCTION storage.create_bucket(
      bucket_id text,
      is_public boolean DEFAULT false
    ) RETURNS void
    LANGUAGE plpgsql
    AS $$
    BEGIN
      -- no-op stub used for shadow DB only
      RETURN;
    END;
    $$;
  END IF;
END $$;
