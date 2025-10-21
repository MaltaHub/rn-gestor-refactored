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

-- Enum tipo_documento_veiculo
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'tipo_documento_veiculo' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.tipo_documento_veiculo AS ENUM (
      'crlv','crv','manual','nota_fiscal_compra','vistoria','laudo','contrato','comprovante','outros'
    );
  END IF;
END $$;

-- Tabela de metadados
CREATE TABLE IF NOT EXISTS public.documentos_veiculos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  veiculo_id uuid NOT NULL,
  documentacao_id uuid NULL,
  loja_provocada_id uuid NULL,
  tipo public.tipo_documento_veiculo NOT NULL,
  path varchar NOT NULL,
  nome_original varchar NOT NULL,
  content_type varchar NULL,
  tamanho_bytes integer NULL,
  observacao text NULL,
  hash_sha256 char(64) NULL,
  criado_em timestamptz NOT NULL DEFAULT now(),
  criado_por text NULL
);

-- FKs
ALTER TABLE public.documentos_veiculos
  ADD CONSTRAINT documentos_veiculos_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE public.documentos_veiculos
  ADD CONSTRAINT documentos_veiculos_veiculo_id_fkey FOREIGN KEY (veiculo_id) REFERENCES public.veiculos(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE public.documentos_veiculos
  ADD CONSTRAINT documentos_veiculos_loja_provocada_id_fkey FOREIGN KEY (loja_provocada_id) REFERENCES public.lojas(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE public.documentos_veiculos
  ADD CONSTRAINT documentos_veiculos_documentacao_id_fkey FOREIGN KEY (documentacao_id) REFERENCES public.documentacao_veiculos(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;

-- Índices
CREATE INDEX IF NOT EXISTS idx_documentos_empresa_id ON public.documentos_veiculos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_documentos_veiculo_id ON public.documentos_veiculos(veiculo_id);
CREATE INDEX IF NOT EXISTS idx_documentos_loja_provocada_id ON public.documentos_veiculos(loja_provocada_id);
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON public.documentos_veiculos(tipo);
CREATE INDEX IF NOT EXISTS idx_documentos_criado_em ON public.documentos_veiculos(criado_em);
CREATE UNIQUE INDEX IF NOT EXISTS uq_documento_path_por_veiculo ON public.documentos_veiculos(empresa_id, veiculo_id, path);

-- RLS
ALTER TABLE public.documentos_veiculos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS documentos_read_same_company ON public.documentos_veiculos;
CREATE POLICY documentos_read_same_company
  ON public.documentos_veiculos
  FOR SELECT
  TO authenticated
  USING (empresa_id = public.empresa_do_usuario());

DROP POLICY IF EXISTS documentos_write_same_company ON public.documentos_veiculos;
CREATE POLICY documentos_write_same_company
  ON public.documentos_veiculos
  TO authenticated
  USING (empresa_id = public.empresa_do_usuario())
  WITH CHECK (empresa_id = public.empresa_do_usuario());

-- Bucket privado de documentos (ignora em ambientes sem Storage, ex.: shadow DB da CLI)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'storage') THEN
    PERFORM 1 FROM storage.buckets WHERE id = 'documentos_veiculos';
    IF NOT FOUND THEN
      PERFORM storage.create_bucket('documentos_veiculos', false);
    END IF;
  END IF;
END$$;

-- Policies no storage (prefixo por empresa_id)
DO $$ BEGIN
  -- SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'documents_select_same_company'
  ) THEN
    CREATE POLICY documents_select_same_company
      ON storage.objects FOR SELECT TO authenticated
      USING (
        bucket_id = 'documentos_veiculos'
        AND (split_part(name, '/', 1) = public.empresa_do_usuario()::text)
      );
  END IF;

  -- INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'documents_insert_same_company'
  ) THEN
    CREATE POLICY documents_insert_same_company
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'documentos_veiculos'
        AND (split_part(name, '/', 1) = public.empresa_do_usuario()::text)
      );
  END IF;

  -- UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'documents_update_same_company'
  ) THEN
    CREATE POLICY documents_update_same_company
      ON storage.objects FOR UPDATE TO authenticated
      USING (
        bucket_id = 'documentos_veiculos'
        AND (split_part(name, '/', 1) = public.empresa_do_usuario()::text)
      )
      WITH CHECK (
        bucket_id = 'documentos_veiculos'
        AND (split_part(name, '/', 1) = public.empresa_do_usuario()::text)
      );
  END IF;

  -- DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'documents_delete_same_company'
  ) THEN
    CREATE POLICY documents_delete_same_company
      ON storage.objects FOR DELETE TO authenticated
      USING (
        bucket_id = 'documentos_veiculos'
        AND (split_part(name, '/', 1) = public.empresa_do_usuario()::text)
      );
  END IF;
END $$;

-- RPC documentos_gerenciar
CREATE OR REPLACE FUNCTION public.documentos_gerenciar(
  p_operacao text,
  p_empresa_id uuid,
  p_veiculo_id uuid,
  p_loja_provocada_id uuid DEFAULT NULL,
  p_payload jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb := '{}'::jsonb;
BEGIN
  IF p_operacao = 'listar' THEN
    RETURN jsonb_build_object(
      'sucesso', true,
      'documentos', (
        SELECT coalesce(jsonb_agg(x.* ORDER BY x.criado_em ASC), '[]'::jsonb)
        FROM (
          SELECT d.*, l.nome as loja_nome
          FROM public.documentos_veiculos d
          LEFT JOIN public.lojas l ON l.id = d.loja_provocada_id
          WHERE d.empresa_id = p_empresa_id AND d.veiculo_id = p_veiculo_id
        ) x
      )
    );
  ELSIF p_operacao = 'adicionar' THEN
    -- p_payload: { arquivos: [{ path, nome_original, content_type, tamanho_bytes, observacao, tipo }] }
    PERFORM 1 FROM jsonb_array_elements(COALESCE(p_payload->'arquivos', '[]'::jsonb)) AS a(obj);
    FOR SELECT (a.obj->>'path')::text AS path,
               (a.obj->>'nome_original')::text AS nome_original,
               (a.obj->>'content_type')::text AS content_type,
               NULLIF(a.obj->>'tamanho_bytes','')::int AS tamanho_bytes,
               (a.obj->>'observacao')::text AS observacao,
               (a.obj->>'tipo')::text AS tipo
        FROM jsonb_array_elements(COALESCE(p_payload->'arquivos', '[]'::jsonb)) a
    LOOP
      INSERT INTO public.documentos_veiculos(
        empresa_id, veiculo_id, loja_provocada_id, tipo, path,
        nome_original, content_type, tamanho_bytes, observacao, criado_por
      ) VALUES (
        p_empresa_id, p_veiculo_id, p_loja_provocada_id, (tipo)::public.tipo_documento_veiculo, path,
        nome_original, content_type, tamanho_bytes, observacao, auth.uid()::text
      ) ON CONFLICT DO NOTHING;
    END LOOP;
    RETURN jsonb_build_object('sucesso', true);
  ELSIF p_operacao = 'remover' THEN
    -- p_payload: { ids: [uuid, ...] }
    DELETE FROM public.documentos_veiculos d
     WHERE d.empresa_id = p_empresa_id AND d.veiculo_id = p_veiculo_id
       AND d.id IN (SELECT (jsonb_array_elements_text(p_payload->'ids'))::uuid);
    RETURN jsonb_build_object('sucesso', true);
  ELSIF p_operacao = 'atualizar_info' THEN
    -- p_payload: { id: uuid, tipo?: text, observacao?: text }
    UPDATE public.documentos_veiculos SET
      tipo = COALESCE((p_payload->>'tipo')::public.tipo_documento_veiculo, tipo),
      observacao = COALESCE(p_payload->>'observacao', observacao)
    WHERE id = (p_payload->>'id')::uuid AND empresa_id = p_empresa_id AND veiculo_id = p_veiculo_id;
    RETURN jsonb_build_object('sucesso', true);
  ELSE
    RETURN jsonb_build_object('sucesso', false, 'erro', 'operacao_invalida');
  END IF;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('sucesso', false, 'erro', SQLERRM);
END;$$;

GRANT ALL ON FUNCTION public.documentos_gerenciar(text, uuid, uuid, uuid, jsonb) TO service_role;
GRANT ALL ON FUNCTION public.documentos_gerenciar(text, uuid, uuid, uuid, jsonb) TO authenticated;
