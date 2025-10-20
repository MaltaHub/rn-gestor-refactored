-- Ajusta policies do Storage para validar a empresa a partir do prefixo do objeto
-- usando a função public.empresa_do_usuario(uuid) ao invés da versão sem parâmetro
-- (que retorna apenas a primeira empresa do usuário)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Drop policies antigas
DROP POLICY IF EXISTS documents_select_same_company ON storage.objects;
DROP POLICY IF EXISTS documents_insert_same_company ON storage.objects;
DROP POLICY IF EXISTS documents_update_same_company ON storage.objects;
DROP POLICY IF EXISTS documents_delete_same_company ON storage.objects;

-- Recria policies utilizando empresa_do_usuario(uuid)
CREATE POLICY documents_select_same_company
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'documentos_veiculos'
    AND public.empresa_do_usuario((split_part(name, '/', 1))::uuid)
  );

CREATE POLICY documents_insert_same_company
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documentos_veiculos'
    AND public.empresa_do_usuario((split_part(name, '/', 1))::uuid)
  );

CREATE POLICY documents_update_same_company
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'documentos_veiculos'
    AND public.empresa_do_usuario((split_part(name, '/', 1))::uuid)
  )
  WITH CHECK (
    bucket_id = 'documentos_veiculos'
    AND public.empresa_do_usuario((split_part(name, '/', 1))::uuid)
  );

CREATE POLICY documents_delete_same_company
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'documentos_veiculos'
    AND public.empresa_do_usuario((split_part(name, '/', 1))::uuid)
  );

