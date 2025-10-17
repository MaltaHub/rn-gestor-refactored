


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


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."app_role" AS ENUM (
    'admin',
    'gerente',
    'usuario',
    'proprietario'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE TYPE "public"."estado_veiculo" AS ENUM (
    'novo',
    'seminovo',
    'usado',
    'sucata',
    'limpo',
    'sujo'
);


ALTER TYPE "public"."estado_veiculo" OWNER TO "postgres";


CREATE TYPE "public"."estado_venda" AS ENUM (
    'disponivel',
    'reservado',
    'vendido',
    'repassado',
    'restrito'
);


ALTER TYPE "public"."estado_venda" OWNER TO "postgres";


CREATE TYPE "public"."forma_pagamento" AS ENUM (
    'dinheiro',
    'pix',
    'transferencia',
    'cartao_credito',
    'cartao_debito',
    'financiamento',
    'consorcio',
    'misto'
);


ALTER TYPE "public"."forma_pagamento" OWNER TO "postgres";


CREATE TYPE "public"."papel_usuario_empresa" AS ENUM (
    'proprietario',
    'administrador',
    'gerente',
    'consultor',
    'usuario'
);


ALTER TYPE "public"."papel_usuario_empresa" OWNER TO "postgres";


CREATE TYPE "public"."status_documentacao" AS ENUM (
    'pendente',
    'em_andamento',
    'aguardando_cliente',
    'aguardando_terceiros',
    'concluida',
    'com_pendencias',
    'bloqueada'
);


ALTER TYPE "public"."status_documentacao" OWNER TO "postgres";


CREATE TYPE "public"."status_venda" AS ENUM (
    'negociacao',
    'aprovada',
    'finalizada',
    'cancelada',
    'devolvida'
);


ALTER TYPE "public"."status_venda" OWNER TO "postgres";


CREATE TYPE "public"."tipo_cambio" AS ENUM (
    'manual',
    'automatico',
    'cvt',
    'outro',
    'automatizado'
);


ALTER TYPE "public"."tipo_cambio" OWNER TO "postgres";


CREATE TYPE "public"."tipo_carroceria" AS ENUM (
    'sedan',
    'hatch',
    'camioneta',
    'suv',
    'suv compacto',
    'suv medio',
    'van',
    'buggy',
    'picape'
);


ALTER TYPE "public"."tipo_carroceria" OWNER TO "postgres";


CREATE TYPE "public"."tipo_combustivel" AS ENUM (
    'gasolina',
    'alcool',
    'flex',
    'diesel',
    'eletrico',
    'hibrido'
);


ALTER TYPE "public"."tipo_combustivel" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."convidar_membro"("p_empresa_id" "uuid", "p_usuario_convidado_id" "uuid", "p_papel" "public"."papel_usuario_empresa", "p_convidado_por" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
    v_convite_id UUID;
    v_token VARCHAR;
BEGIN
    IF NOT EXISTS(
        SELECT 1 FROM membros_empresa 
        WHERE empresa_id = p_empresa_id AND usuario_id = p_convidado_por 
        AND papel IN ('proprietario', 'administrador') AND ativo = true
    ) THEN
        RETURN json_build_object('sucesso', false, 'erro', 'Sem permissão para convidar membros');
    END IF;
    
    IF EXISTS(SELECT 1 FROM membros_empresa WHERE empresa_id = p_empresa_id AND usuario_id = p_usuario_convidado_id) THEN
        RETURN json_build_object('sucesso', false, 'erro', 'Usuário já é membro da empresa');
    END IF;
    
    INSERT INTO convites_empresa (empresa_id, convidado_por_usuario_id, usuario_convidado_id, expira_em)
    VALUES (p_empresa_id, p_convidado_por, p_usuario_convidado_id, NOW() + INTERVAL '7 days')
    RETURNING id, token INTO v_convite_id, v_token;
    
    RETURN json_build_object('sucesso', true, 'convite_id', v_convite_id, 'token', v_token);
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('sucesso', false, 'erro', 'Erro interno: ' || SQLERRM);
END;$$;


ALTER FUNCTION "public"."convidar_membro"("p_empresa_id" "uuid", "p_usuario_convidado_id" "uuid", "p_papel" "public"."papel_usuario_empresa", "p_convidado_por" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."criar_empresa"("p_nome" "text", "p_dominio" "text" DEFAULT NULL::"text") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_empresa_id UUID;
    v_usuario_id UUID := auth.uid();
BEGIN
    -- Validação: nome é obrigatório
    IF p_nome IS NULL OR LENGTH(TRIM(p_nome)) = 0 THEN
        RETURN json_build_object(
            'sucesso', false,
            'erro', 'Nome da empresa é obrigatório'
        );
    END IF;

    -- Verifica se usuário já tem empresa
    IF EXISTS (
        SELECT 1
        FROM membros_empresa m
        WHERE m.usuario_id = v_usuario_id
          AND m.ativo = true
    ) THEN
        RETURN json_build_object(
            'sucesso', false,
            'erro', 'Usuário já é proprietário ou membro de uma empresa'
        );
    END IF;

    -- Valida domínio se informado
    IF p_dominio IS NOT NULL
       AND EXISTS (SELECT 1 FROM empresas e WHERE e.dominio = p_dominio) THEN
        RETURN json_build_object(
            'sucesso', false,
            'erro', 'Domínio já está em uso'
        );
    END IF;

    -- Cria empresa
    INSERT INTO empresas (nome, dominio)
    VALUES (p_nome, p_dominio)
    RETURNING id INTO v_empresa_id;

    -- Cria vínculo como proprietário
    INSERT INTO membros_empresa (empresa_id, usuario_id, papel, ativo)
    VALUES (v_empresa_id, v_usuario_id, 'proprietario', true);

    RETURN json_build_object(
        'sucesso', true,
        'empresa_id', v_empresa_id,
        'mensagem', 'Empresa criada com sucesso'
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'sucesso', false,
            'erro', 'Erro interno: ' || SQLERRM
        );
END;
$$;


ALTER FUNCTION "public"."criar_empresa"("p_nome" "text", "p_dominio" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."empresa_do_usuario"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    empresa_id UUID;
BEGIN
    SELECT m.empresa_id
    INTO empresa_id
    FROM membros_empresa m
    WHERE m.usuario_id = auth.uid()
      AND m.ativo = true
    LIMIT 1;

    RETURN empresa_id; -- pode retornar UUID ou NULL
END;
$$;


ALTER FUNCTION "public"."empresa_do_usuario"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."empresa_do_usuario"("p_empresa_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    existe BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM membros_empresa m
        WHERE m.usuario_id = auth.uid()
          AND m.empresa_id = p_empresa_id
          AND m.ativo = true
    )
    INTO existe;

    RETURN existe;
END;
$$;


ALTER FUNCTION "public"."empresa_do_usuario"("p_empresa_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."executor"("p_operacao" "text", "p_payload" json) RETURNS json
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_uid  uuid := auth.uid();
  v_emp  uuid := NULLIF(p_payload->>'empresa_id','')::uuid;
  v_resp json;
BEGIN
  -- Autenticação
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- Switch de operações
  CASE p_operacao

    WHEN 'criar_empresa' THEN
      v_resp := (
        SELECT json_build_object('ok', true, 'msg', 'empresa criada')
      );

    WHEN 'atualizar_empresa' THEN
      v_resp := (
        SELECT json_build_object('ok', true, 'msg', 'empresa atualizada')
      );

    WHEN 'deletar_empresa' THEN
      v_resp := (
        SELECT json_build_object('ok', true, 'msg', 'empresa deletada')
      );

    WHEN 'criar_veiculo' THEN
      v_resp := (
        SELECT json_build_object('ok', true, 'msg', 'veículo criado')
      );

    -- adicione outros cases conforme necessário
    ELSE
      RAISE EXCEPTION 'operation_not_found: %', p_operacao;
  END CASE;

  RETURN v_resp;
END;
$$;


ALTER FUNCTION "public"."executor"("p_operacao" "text", "p_payload" json) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fotos_gerenciar"("p_operacao" "text", "p_empresa_id" "uuid", "p_veiculo_id" "uuid", "p_loja_id" "uuid", "p_payload" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$declare
  v_uid    uuid := auth.uid();
  v_now    timestamptz := now();
  v_limite int := 30;   -- limite de fotos por grupo
  v_qtd    int;
  r record; -- precisa disso para usar FOR r IN SELECT
begin
  -- Autenticação
  if v_uid is null then
    return jsonb_build_object('sucesso', false, 'erro', 'nao_autenticado');
  end if;

  -- Sanidade dos ids
  if p_empresa_id is null or p_veiculo_id is null or p_loja_id is null then
    return jsonb_build_object('sucesso', false, 'erro', 'ids_invalidos');
  end if;

  -- =========================
  -- LISTAR
  -- =========================
  if p_operacao = 'listar' then
    return jsonb_build_object(
      'sucesso', true,
      'fotos',
      coalesce((
        select jsonb_agg(to_jsonb(f) order by f.ordem)
        from (
          select id, path, e_capa, ordem, criado_em, atualizado_em
          from public.fotos_metadados
          where empresa_id = p_empresa_id
            and veiculo_id = p_veiculo_id
            and loja_id    = p_loja_id
          order by ordem
        ) f
      ), '[]'::jsonb),
      'tem_fotos',
      coalesce((
        select to_jsonb(t)
        from public.tem_fotos t
        where t.empresa_id = p_empresa_id
          and t.veiculo_id = p_veiculo_id
          and t.loja_id    = p_loja_id
      ), jsonb_build_object('qtd_fotos', 0, 'ultima_atualizacao', null))
    );
  end if;

  -- =========================
  -- ADICIONAR
  -- =========================
  if p_operacao = 'adicionar' then
    select count(*) into v_qtd
    from public.fotos_metadados
    where empresa_id = p_empresa_id
      and veiculo_id = p_veiculo_id
      and loja_id    = p_loja_id;

    if v_qtd >= v_limite then
      return jsonb_build_object('sucesso', false, 'erro', 'limite_atingido');
    end if;

    for r in
      select
        (elem->>'path')::text                        as path,
        coalesce((elem->>'e_capa')::boolean, false)  as e_capa_local
      from jsonb_array_elements(coalesce(p_payload->'arquivos','[]'::jsonb)) elem
    loop
      exit when v_qtd >= v_limite;
      v_qtd := v_qtd + 1;

      insert into public.fotos_metadados (
        empresa_id, veiculo_id, loja_id, path, e_capa, ordem, criado_em, atualizado_em
      ) values (
        p_empresa_id, p_veiculo_id, p_loja_id, r.path, false, v_qtd, v_now, v_now
      );

      if r.e_capa_local then
        update public.fotos_metadados
           set e_capa = false
         where empresa_id = p_empresa_id
           and veiculo_id = p_veiculo_id
           and loja_id    = p_loja_id;

        update public.fotos_metadados
           set e_capa = true, atualizado_em = v_now
         where empresa_id = p_empresa_id
           and veiculo_id = p_veiculo_id
           and loja_id    = p_loja_id
           and ordem      = v_qtd;
      end if;
    end loop;

    insert into public.tem_fotos (empresa_id, veiculo_id, loja_id, qtd_fotos, ultima_atualizacao)
    values (p_empresa_id, p_veiculo_id, p_loja_id, v_qtd, v_now)
    on conflict (empresa_id, veiculo_id, loja_id)
    do update set qtd_fotos = excluded.qtd_fotos,
                 ultima_atualizacao = excluded.ultima_atualizacao;

    return jsonb_build_object('sucesso', true);
  end if;

  -- =========================
  -- REMOVER
  -- =========================
  -- REMOVER: p_payload = { ids: [uuid, ...] }
if p_operacao = 'remover' then
  delete from public.fotos_metadados f
  where f.empresa_id = p_empresa_id
    and f.veiculo_id = p_veiculo_id
    and f.loja_id    = p_loja_id
    and f.id in (
      select e::uuid
      from jsonb_array_elements_text(coalesce(p_payload->'ids','[]'::jsonb)) e
    );

  -- Recompacta ordens (1..n) após deletar
  with renum as (
    select id,
           row_number() over (order by ordem, id) as ordem_final
    from public.fotos_metadados
    where empresa_id = p_empresa_id
      and veiculo_id = p_veiculo_id
      and loja_id    = p_loja_id
  )
  update public.fotos_metadados f
     set ordem = renum.ordem_final,
         atualizado_em = v_now
    from renum
   where f.id = renum.id;

  -- Recalcula qtd_fotos
  update public.tem_fotos t
     set qtd_fotos = coalesce((
           select count(*) from public.fotos_metadados
           where empresa_id = p_empresa_id
             and veiculo_id = p_veiculo_id
             and loja_id    = p_loja_id
         ), 0),
         ultima_atualizacao = v_now
   where t.empresa_id = p_empresa_id
     and t.veiculo_id = p_veiculo_id
     and t.loja_id    = p_loja_id;

  return jsonb_build_object('sucesso', true);
end if;


  -- =========================
  -- REORDENAR
  -- =========================
  if p_operacao = 'reordenar' then
  with
  cur as (
    select f.id,
           coalesce(reqs.ordem, 1000 + f.ordem) as peso
    from public.fotos_metadados f
    left join lateral (
      select (e->>'id')::uuid as id,
             (e->>'ordem')::int as ordem
      from jsonb_array_elements(coalesce(p_payload->'ordens','[]')) e
      where (e->>'id')::uuid = f.id
    ) reqs on true
    where f.empresa_id = p_empresa_id
      and f.veiculo_id = p_veiculo_id
      and f.loja_id    = p_loja_id
    for update
  ),
  final as (
    -- sempre gera 1..N únicos
    select id, row_number() over (order by peso, id) as ordem_final
    from cur
  )
  update public.fotos_metadados f
     set ordem = fn.ordem_final,
         atualizado_em = v_now
    from final fn
   where f.id = fn.id;

  return jsonb_build_object('sucesso', true);
end if;


  -- =========================
  -- SET_CAPA
  -- =========================
  if p_operacao = 'set_capa' then
    update public.fotos_metadados
       set e_capa = false
     where empresa_id = p_empresa_id
       and veiculo_id = p_veiculo_id
       and loja_id    = p_loja_id;

    update public.fotos_metadados
       set e_capa = true, atualizado_em = v_now
     where empresa_id = p_empresa_id
       and veiculo_id = p_veiculo_id
       and loja_id    = p_loja_id
       and id         = (p_payload->>'id')::uuid;

    return jsonb_build_object('sucesso', true);
  end if;

  -- =========================
  -- SUBSTITUIR
  -- =========================
  if p_operacao = 'substituir' then
    update public.fotos_metadados
       set path = (p_payload->>'novo_path')::text,
           atualizado_em = v_now
     where empresa_id = p_empresa_id
       and veiculo_id = p_veiculo_id
       and loja_id    = p_loja_id
       and id         = (p_payload->>'id')::uuid;

    return jsonb_build_object('sucesso', true);
  end if;

  return jsonb_build_object('sucesso', false, 'erro', 'operacao_invalida');
end;$$;


ALTER FUNCTION "public"."fotos_gerenciar"("p_operacao" "text", "p_empresa_id" "uuid", "p_veiculo_id" "uuid", "p_loja_id" "uuid", "p_payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gerenciar_anuncios"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados" json, "p_anuncio_id" "uuid" DEFAULT NULL::"uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
    v_validacao JSON;
    v_resultado JSON;
    v_anuncio_id UUID;
BEGIN
    SELECT verificar_permissao(
        CASE p_operacao
            WHEN 'criar' THEN 'criar_anuncio'
            WHEN 'atualizar' THEN 'atualizar_anuncio'
            WHEN 'sincronizar' THEN 'sincronizar_anuncio'
            WHEN 'deletar' THEN 'deletar_anuncio'
        END::operacao_sistema,
        p_empresa_id
    ) INTO v_validacao;
    
    IF NOT (v_validacao->>'permitido')::BOOLEAN THEN
        RETURN json_build_object('sucesso', false, 'erro', 'Sem permissão para esta operação');
    END IF;
    
    CASE p_operacao
        WHEN 'criar' THEN
            INSERT INTO anuncios (
                empresa_id, loja_id, entidade_id, tipo_anuncio, plataforma_id,
                autor_id, titulo, descricao, preco, status
            ) VALUES (
                p_empresa_id,
                (p_dados->>'loja_id')::UUID,
                (p_dados->>'entidade_id')::UUID,
                p_dados->>'tipo_anuncio',
                (p_dados->>'plataforma_id')::UUID,
                auth.uid(),
                p_dados->>'titulo',
                p_dados->>'descricao',
                (p_dados->>'preco')::DECIMAL,
                COALESCE(p_dados->>'status', 'ativo')
            ) RETURNING id INTO v_anuncio_id;
            
            v_resultado := json_build_object('sucesso', true, 'anuncio_id', v_anuncio_id);
            
        WHEN 'atualizar' THEN
            UPDATE anuncios SET
                titulo = COALESCE(p_dados->>'titulo', titulo),
                descricao = COALESCE(p_dados->>'descricao', descricao),
                preco = COALESCE((p_dados->>'preco')::DECIMAL, preco),
                status = COALESCE(p_dados->>'status', status),
                atualizado_em = NOW()
            WHERE id = p_anuncio_id AND empresa_id = p_empresa_id;
            
            v_resultado := json_build_object('sucesso', true, 'mensagem', 'Anúncio atualizado');
            
        WHEN 'sincronizar' THEN
            UPDATE anuncios SET
                visualizacoes = COALESCE((p_dados->>'visualizacoes')::INTEGER, visualizacoes),
                favoritos = COALESCE((p_dados->>'favoritos')::INTEGER, favoritos),
                mensagens = COALESCE((p_dados->>'mensagens')::INTEGER, mensagens),
                link_anuncio = COALESCE(p_dados->>'link_anuncio', link_anuncio),
                atualizado_em = NOW()
            WHERE id = p_anuncio_id AND empresa_id = p_empresa_id;
            
            v_resultado := json_build_object('sucesso', true, 'mensagem', 'Anúncio sincronizado');
            
        WHEN 'deletar' THEN
            DELETE FROM anuncios WHERE id = p_anuncio_id AND empresa_id = p_empresa_id;
            v_resultado := json_build_object('sucesso', true, 'mensagem', 'Anúncio removido');
    END CASE;
    
    RETURN v_resultado;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('sucesso', false, 'erro', 'Erro interno: ' || SQLERRM);
END;$$;


ALTER FUNCTION "public"."gerenciar_anuncios"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados" json, "p_anuncio_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gerenciar_documentacao"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados" json, "p_veiculo_id" "uuid" DEFAULT NULL::"uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
    v_validacao JSON;
    v_resultado JSON;
BEGIN
    SELECT verificar_permissao(
        CASE p_operacao
            WHEN 'atualizar' THEN 'atualizar_documentacao'
            WHEN 'upload_documento' THEN 'upload_documentos'
            WHEN 'concluir_transferencia' THEN 'gerenciar_transferencia'
        END::operacao_sistema,
        p_empresa_id
    ) INTO v_validacao;
    
    IF NOT (v_validacao->>'permitido')::BOOLEAN THEN
        RETURN json_build_object('sucesso', false, 'erro', 'Sem permissão para esta operação');
    END IF;
    
    CASE p_operacao
        WHEN 'atualizar' THEN
            SELECT rpc_atualizar_documentacao_veiculo(p_veiculo_id, p_dados, auth.uid()) INTO v_resultado;
        WHEN 'concluir_transferencia' THEN
            UPDATE documentacao_veiculos SET
                transferencia_concluida = true,
                data_transferencia = NOW(),
                status_geral = 'concluida',
                atualizado_em = NOW()
            WHERE empresa_id = p_empresa_id AND veiculo_id = p_veiculo_id;
            
            v_resultado := json_build_object('sucesso', true, 'mensagem', 'Transferência concluída');
        WHEN 'upload_documento' THEN
            v_resultado := json_build_object(
                'sucesso', true,
                'mensagem', 'Upload processado',
                'bucket_path', p_dados->>'bucket_path'
            );
    END CASE;
    
    RETURN v_resultado;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('sucesso', false, 'erro', 'Erro interno: ' || SQLERRM);
END;$$;


ALTER FUNCTION "public"."gerenciar_documentacao"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados" json, "p_veiculo_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gerenciar_empresa"("p_operacao" character varying, "p_dados" json, "p_empresa_id" "uuid" DEFAULT NULL::"uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
    v_validacao JSON;
    v_resultado JSON;
    v_nova_empresa_id UUID;
BEGIN
    CASE p_operacao
        WHEN 'criar' THEN
            SELECT rpc_criar_empresa(
                p_dados->>'nome',
                p_dados->>'dominio',
                auth.uid()
            ) INTO v_resultado;
            
            IF (v_resultado->>'sucesso')::BOOLEAN THEN
                v_nova_empresa_id := (v_resultado->>'empresa_id')::UUID;
                PERFORM rpc_inicializar_permissoes_empresa(v_nova_empresa_id, auth.uid());
            END IF;
            
        WHEN 'atualizar' THEN
            SELECT verificar_permissao('atualizar_empresa', p_empresa_id)
            INTO v_validacao;
            
            IF NOT (v_validacao->>'permitido')::BOOLEAN THEN
                RETURN json_build_object(
                    'sucesso', false,
                    'erro', 'Sem permissão para atualizar empresa'
                );
            END IF;
            
            UPDATE empresas SET
                nome = COALESCE(p_dados->>'nome', nome),
                dominio = COALESCE(p_dados->>'dominio', dominio),
                atualizado_em = NOW()
            WHERE id = p_empresa_id;
            
            v_resultado := json_build_object(
                'sucesso', true,
                'mensagem', 'Empresa atualizada com sucesso'
            );
            
        ELSE
            RETURN json_build_object(
                'sucesso', false,
                'erro', 'Operação inválida: ' || p_operacao
            );
    END CASE;
    
    RETURN v_resultado;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('sucesso', false, 'erro', 'Erro interno: ' || SQLERRM);
END;$$;


ALTER FUNCTION "public"."gerenciar_empresa"("p_operacao" character varying, "p_dados" json, "p_empresa_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gerenciar_membros"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados_membro" json, "p_usuario_alvo" "uuid" DEFAULT NULL::"uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
    v_validacao JSON;
    v_resultado JSON;
BEGIN
    SELECT verificar_permissao(
        CASE p_operacao
            WHEN 'convidar' THEN 'convidar_membro'
            WHEN 'atualizar' THEN 'atualizar_membro'
            WHEN 'remover' THEN 'remover_membro'
        END::operacao_sistema,
        p_empresa_id, p_usuario_alvo
    ) INTO v_validacao;
    
    IF NOT (v_validacao->>'permitido')::BOOLEAN THEN
        RETURN json_build_object('sucesso', false, 'erro', 'Sem permissão para esta operação');
    END IF;
    
    CASE p_operacao
        WHEN 'convidar' THEN
            SELECT rpc_convidar_membro(
                p_empresa_id,
                (p_dados_membro->>'usuario_convidado_id')::UUID,
                (p_dados_membro->>'papel')::papel_usuario_empresa,
                auth.uid()
            ) INTO v_resultado;
        WHEN 'atualizar' THEN
            SELECT rpc_atualizar_membro_empresa(
                p_empresa_id, p_usuario_alvo,
                (p_dados_membro->>'novo_papel')::papel_usuario_empresa,
                (p_dados_membro->>'ativo')::BOOLEAN,
                auth.uid()
            ) INTO v_resultado;
        WHEN 'remover' THEN
            UPDATE membros_empresa SET ativo = false WHERE empresa_id = p_empresa_id AND usuario_id = p_usuario_alvo;
            v_resultado := json_build_object('sucesso', true, 'mensagem', 'Membro removido com sucesso');
    END CASE;
    
    RETURN v_resultado;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('sucesso', false, 'erro', 'Erro interno: ' || SQLERRM);
END;$$;


ALTER FUNCTION "public"."gerenciar_membros"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados_membro" json, "p_usuario_alvo" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gerenciar_promocoes"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados" json, "p_promocao_id" "uuid" DEFAULT NULL::"uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
    v_validacao JSON;
    v_resultado JSON;
    v_promocao_id UUID;
BEGIN
    SELECT verificar_permissao(
        CASE p_operacao
            WHEN 'criar' THEN 'criar_promocao'
            WHEN 'atualizar' THEN 'atualizar_promocao'
            WHEN 'deletar' THEN 'deletar_promocao'
            ELSE 'atualizar_promocao'
        END::operacao_sistema,
        p_empresa_id
    ) INTO v_validacao;
    
    IF NOT (v_validacao->>'permitido')::BOOLEAN THEN
        RETURN json_build_object('sucesso', false, 'erro', 'Sem permissão para esta operação');
    END IF;
    
    CASE p_operacao
        WHEN 'criar' THEN
            INSERT INTO promocoes (
                empresa_id, veiculo_loja_id, anuncio_id, tipo_promocao,
                preco_promocional, data_inicio, data_fim, autor_id
            ) VALUES (
                p_empresa_id,
                (p_dados->>'veiculo_loja_id')::UUID,
                (p_dados->>'anuncio_id')::UUID,
                p_dados->>'tipo_promocao',
                (p_dados->>'preco_promocional')::DECIMAL,
                (p_dados->>'data_inicio')::TIMESTAMPTZ,
                (p_dados->>'data_fim')::TIMESTAMPTZ,
                auth.uid()
            ) RETURNING id INTO v_promocao_id;
            
            v_resultado := json_build_object('sucesso', true, 'promocao_id', v_promocao_id);
            
        WHEN 'atualizar' THEN
            UPDATE promocoes SET
                preco_promocional = COALESCE((p_dados->>'preco_promocional')::DECIMAL, preco_promocional),
                data_inicio = COALESCE((p_dados->>'data_inicio')::TIMESTAMPTZ, data_inicio),
                data_fim = COALESCE((p_dados->>'data_fim')::TIMESTAMPTZ, data_fim),
                atualizado_em = NOW()
            WHERE id = p_promocao_id AND empresa_id = p_empresa_id;
            
            v_resultado := json_build_object('sucesso', true, 'mensagem', 'Promoção atualizada');
            
        WHEN 'ativar' THEN
            UPDATE promocoes SET ativo = true, atualizado_em = NOW()
            WHERE id = p_promocao_id AND empresa_id = p_empresa_id;
            v_resultado := json_build_object('sucesso', true, 'mensagem', 'Promoção ativada');
            
        WHEN 'desativar' THEN
            UPDATE promocoes SET ativo = false, atualizado_em = NOW()
            WHERE id = p_promocao_id AND empresa_id = p_empresa_id;
            v_resultado := json_build_object('sucesso', true, 'mensagem', 'Promoção desativada');
            
        WHEN 'deletar' THEN
            DELETE FROM promocoes WHERE id = p_promocao_id AND empresa_id = p_empresa_id;
            v_resultado := json_build_object('sucesso', true, 'mensagem', 'Promoção removida');
    END CASE;
    
    RETURN v_resultado;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('sucesso', false, 'erro', 'Erro interno: ' || SQLERRM);
END;$$;


ALTER FUNCTION "public"."gerenciar_promocoes"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados" json, "p_promocao_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gerenciar_repetidos"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados" json, "p_repetido_id" "uuid" DEFAULT NULL::"uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
    v_validacao JSON;
    v_resultado JSON;
    v_repetido_id UUID;
BEGIN
    SELECT verificar_permissao('cadastrar_veiculo'::operacao_sistema, p_empresa_id)
    INTO v_validacao;
    
    IF NOT (v_validacao->>'permitido')::BOOLEAN THEN
        RETURN json_build_object('sucesso', false, 'erro', 'Sem permissão para gerenciar repetidos');
    END IF;
    
    CASE p_operacao
        WHEN 'criar_grupo' THEN
            INSERT INTO repetidos (
                empresa_id, modelo_id, ano_fabricacao_padrao, ano_modelo_padrao,
                cor_padrao, min_hodometro, max_hodometro, registrado_por
            ) VALUES (
                p_empresa_id,
                (p_dados->>'modelo_id')::UUID,
                (p_dados->>'ano_fabricacao_padrao')::INTEGER,
                (p_dados->>'ano_modelo_padrao')::INTEGER,
                p_dados->>'cor_padrao',
                (p_dados->>'min_hodometro')::INTEGER,
                (p_dados->>'max_hodometro')::INTEGER,
                auth.uid()
            ) RETURNING id INTO v_repetido_id;
            
            v_resultado := json_build_object('sucesso', true, 'repetido_id', v_repetido_id);
            
        WHEN 'adicionar_veiculo' THEN
            INSERT INTO veiculos_repetidos (repetido_id, veiculo_id, empresa_id, similaridade_score)
            VALUES (
                p_repetido_id,
                (p_dados->>'veiculo_id')::UUID,
                p_empresa_id,
                (p_dados->>'similaridade_score')::DECIMAL
            );
            
            v_resultado := json_build_object('sucesso', true, 'mensagem', 'Veículo adicionado ao grupo');
            
        WHEN 'remover_veiculo' THEN
            DELETE FROM veiculos_repetidos 
            WHERE repetido_id = p_repetido_id 
            AND veiculo_id = (p_dados->>'veiculo_id')::UUID 
            AND empresa_id = p_empresa_id;
            
            v_resultado := json_build_object('sucesso', true, 'mensagem', 'Veículo removido do grupo');
            
        WHEN 'atualizar_padrao' THEN
            UPDATE repetidos SET
                cor_padrao = COALESCE(p_dados->>'cor_padrao', cor_padrao),
                min_hodometro = COALESCE((p_dados->>'min_hodometro')::INTEGER, min_hodometro),
                max_hodometro = COALESCE((p_dados->>'max_hodometro')::INTEGER, max_hodometro),
                alterado_em = NOW(),
                alterado_por = auth.uid()
            WHERE id = p_repetido_id AND empresa_id = p_empresa_id;
            
            v_resultado := json_build_object('sucesso', true, 'mensagem', 'Padrão atualizado');
    END CASE;
    
    RETURN v_resultado;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('sucesso', false, 'erro', 'Erro interno: ' || SQLERRM);
END;$$;


ALTER FUNCTION "public"."gerenciar_repetidos"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados" json, "p_repetido_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."limpar_notificacoes_antigas"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  DELETE FROM notificacoes
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;


ALTER FUNCTION "public"."limpar_notificacoes_antigas"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."listar_usuarios"() RETURNS TABLE("id" "uuid", "email" "text", "name" "text", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NOT public.user_is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  RETURN QUERY
  SELECT 
    au.id,
    au.email::text,
    au.raw_user_meta_data->>'name' as name,
    au.created_at
  FROM auth.users au
  ORDER BY au.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."listar_usuarios"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rpc_atualizar_status_venda"("p_venda_id" "uuid", "p_status" "public"."status_venda", "p_data_entrega" timestamp with time zone, "p_observacoes" "text", "p_usuario_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  IF p_venda_id IS NULL OR p_status IS NULL THEN
    RETURN jsonb_build_object('sucesso',false,'erro','Parâmetros obrigatórios ausentes');
  END IF;

  UPDATE public.vendas SET
    status_venda   = p_status,
    data_entrega   = COALESCE(p_data_entrega, data_entrega),
    observacoes    = COALESCE(p_observacoes, observacoes),
    atualizado_em  = now(),
    atualizado_por = p_usuario_id
  WHERE id = p_venda_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('sucesso',false,'erro','Venda não encontrada');
  END IF;

  RETURN jsonb_build_object('sucesso',true,'venda_id',p_venda_id,'novo_status',p_status::text);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('sucesso',false,'erro','Erro ao atualizar status: '||SQLERRM);
END;
$$;


ALTER FUNCTION "public"."rpc_atualizar_status_venda"("p_venda_id" "uuid", "p_status" "public"."status_venda", "p_data_entrega" timestamp with time zone, "p_observacoes" "text", "p_usuario_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rpc_configuracoes"("p_payload" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$DECLARE
  v_uid         uuid := auth.uid();
  v_empresa_id  uuid := public.empresa_do_usuario();

  -- Recebidos
  v_raw_operacao text := trim(both from COALESCE(p_payload->>'operacao',''));
  v_tipo          text := NULL;
  v_operacao      text := NULL;

  -- Dados úteis
  v_dados   jsonb := COALESCE(p_payload->'dados', p_payload);
  v_alvo_id uuid  := COALESCE((p_payload->>'id')::uuid, (v_dados->>'id')::uuid);
  v_novo_id uuid;

  -- Auxiliar p/ split
  v_parts text[];
BEGIN
  -- Autenticação & vínculo
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('sucesso', false, 'erro', 'Usuário não autenticado');
  END IF;

  IF v_empresa_id IS NULL THEN
    RETURN jsonb_build_object('sucesso', false, 'erro', 'Usuário não está vinculado a uma empresa ativa');
  END IF;

  -- Validação básica
  IF v_raw_operacao IS NULL OR v_raw_operacao = '' THEN
    RETURN jsonb_build_object(
      'sucesso', false,
      'erro', 'Operação não informada no payload',
      'payload', p_payload
    );
  END IF;

  -- Normaliza e tenta extrair "tipo/operacao"
  -- Aceita espaços ao redor do "/"
  IF position('/' in v_raw_operacao) > 0 THEN
    v_parts := regexp_split_to_array(v_raw_operacao, '\s*/\s*');
    IF array_length(v_parts, 1) <> 2
    THEN
      RETURN jsonb_build_object(
        'sucesso', false,
        'erro', 'Formato inválido de operação. Use "tipo/operacao" (ex.: "modelo/criar").',
        'valor_recebido', v_raw_operacao
      );
    END IF;

    v_tipo     := lower(trim(both from v_parts[1]));
    v_operacao := lower(trim(both from v_parts[2]));
  ELSE
    -- Retrocompatibilidade: se não veio com "/", usa campo "tipo" do payload
    v_tipo     := lower(trim(both from COALESCE(p_payload->>'tipo','')));
    v_operacao := lower(trim(both from v_raw_operacao));
  END IF;

  IF v_operacao IS NULL OR v_operacao = '' THEN
    RETURN jsonb_build_object('sucesso',false,'erro','Operação não informada no payload','payload',p_payload);
  END IF;

  IF v_tipo IS NULL OR v_tipo = '' THEN
    RETURN jsonb_build_object('sucesso',false,'erro','Tipo de configuração não informado');
  END IF;

  CASE v_tipo
    WHEN 'modelo' THEN
      CASE v_operacao
        WHEN 'criar' THEN
          INSERT INTO public.modelos (
            empresa_id, marca, nome, edicao, carroceria, combustivel,
            tipo_cambio, motor, cambio, cilindros, valvulas, lugares, portas
          ) VALUES (
            v_empresa_id,
            v_dados->>'marca',
            v_dados->>'nome',
            v_dados->>'edicao',
            NULLIF(v_dados->>'carroceria','')::tipo_carroceria,
            NULLIF(v_dados->>'combustivel','')::tipo_combustivel,
            NULLIF(v_dados->>'tipo_cambio','')::tipo_cambio,
            v_dados->>'motor',
            v_dados->>'cambio',
            NULLIF(v_dados->>'cilindros','')::integer,
            NULLIF(v_dados->>'valvulas','')::integer,
            NULLIF(v_dados->>'lugares','')::integer,
            NULLIF(v_dados->>'portas','')::integer
          ) RETURNING id INTO v_novo_id;

          RETURN jsonb_build_object('sucesso',true,'modelo_id',v_novo_id);

        WHEN 'atualizar' THEN
          UPDATE public.modelos SET
            marca        = COALESCE(v_dados->>'marca', marca),
            nome         = COALESCE(v_dados->>'nome', nome),
            edicao       = COALESCE(v_dados->>'edicao', edicao),
            carroceria   = COALESCE(NULLIF(v_dados->>'carroceria','')::tipo_carroceria, carroceria),
            combustivel  = COALESCE(NULLIF(v_dados->>'combustivel','')::tipo_combustivel, combustivel),
            tipo_cambio  = COALESCE(NULLIF(v_dados->>'tipo_cambio','')::tipo_cambio, tipo_cambio),
            motor        = COALESCE(v_dados->>'motor', motor),
            cambio       = COALESCE(v_dados->>'cambio', cambio),
            cilindros    = COALESCE(NULLIF(v_dados->>'cilindros','')::integer, cilindros),
            valvulas     = COALESCE(NULLIF(v_dados->>'valvulas','')::integer, valvulas),
            lugares      = COALESCE(NULLIF(v_dados->>'lugares','')::integer, lugares),
            portas       = COALESCE(NULLIF(v_dados->>'portas','')::integer, portas),
            atualizado_em = now()
          WHERE id = v_alvo_id AND empresa_id = v_empresa_id;

          IF NOT FOUND THEN
            RETURN jsonb_build_object('sucesso',false,'erro','Modelo não encontrado');
          END IF;

          RETURN jsonb_build_object('sucesso',true,'mensagem','Modelo atualizado');

        WHEN 'excluir' THEN
          DELETE FROM public.modelos
          WHERE id = v_alvo_id AND empresa_id = v_empresa_id;

          IF NOT FOUND THEN
            RETURN jsonb_build_object('sucesso',false,'erro','Modelo não encontrado');
          END IF;

          RETURN jsonb_build_object('sucesso',true,'mensagem','Modelo removido');
      END CASE;

    WHEN 'caracteristica' THEN
      CASE v_operacao
        WHEN 'criar' THEN
          INSERT INTO public.caracteristicas (empresa_id, nome)
          VALUES (v_empresa_id, v_dados->>'nome')
          RETURNING id INTO v_novo_id;

          RETURN jsonb_build_object('sucesso',true,'caracteristica_id',v_novo_id);

        WHEN 'atualizar' THEN
          UPDATE public.caracteristicas SET
            nome = COALESCE(v_dados->>'nome', nome)
          WHERE id = v_alvo_id AND empresa_id = v_empresa_id;

          IF NOT FOUND THEN
            RETURN jsonb_build_object('sucesso',false,'erro','Característica não encontrada');
          END IF;

          RETURN jsonb_build_object('sucesso',true,'mensagem','Característica atualizada');

        WHEN 'excluir' THEN
          DELETE FROM public.caracteristicas
          WHERE id = v_alvo_id AND empresa_id = v_empresa_id;

          IF NOT FOUND THEN
            RETURN jsonb_build_object('sucesso',false,'erro','Característica não encontrada');
          END IF;

          RETURN jsonb_build_object('sucesso',true,'mensagem','Característica removida');
      END CASE;

    WHEN 'local' THEN
      CASE v_operacao
        WHEN 'criar' THEN
          INSERT INTO public.locais (empresa_id, nome)
          VALUES (v_empresa_id, v_dados->>'nome')
          RETURNING id INTO v_novo_id;

          RETURN jsonb_build_object('sucesso',true,'local_id',v_novo_id);

        WHEN 'atualizar' THEN
          UPDATE public.locais SET
            nome = COALESCE(v_dados->>'nome', nome)
          WHERE id = v_alvo_id AND empresa_id = v_empresa_id;

          IF NOT FOUND THEN
            RETURN jsonb_build_object('sucesso',false,'erro','Local não encontrado');
          END IF;

          RETURN jsonb_build_object('sucesso',true,'mensagem','Local atualizado');

        WHEN 'excluir' THEN
          DELETE FROM public.locais
          WHERE id = v_alvo_id AND empresa_id = v_empresa_id;

          IF NOT FOUND THEN
            RETURN jsonb_build_object('sucesso',false,'erro','Local não encontrado');
          END IF;

          RETURN jsonb_build_object('sucesso',true,'mensagem','Local removido');
      END CASE;

    WHEN 'loja' THEN
      CASE v_operacao
        WHEN 'criar' THEN
          INSERT INTO public.lojas (empresa_id, nome)
          VALUES (v_empresa_id, v_dados->>'nome')
          RETURNING id INTO v_novo_id;

          RETURN jsonb_build_object('sucesso',true,'loja_id',v_novo_id);

        WHEN 'atualizar' THEN
          UPDATE public.lojas SET
            nome = COALESCE(v_dados->>'nome', nome)
          WHERE id = v_alvo_id AND empresa_id = v_empresa_id;

          IF NOT FOUND THEN
            RETURN jsonb_build_object('sucesso',false,'erro','Loja não encontrada');
          END IF;

          RETURN jsonb_build_object('sucesso',true,'mensagem','Loja atualizada');

        WHEN 'excluir' THEN
          DELETE FROM public.lojas
          WHERE id = v_alvo_id AND empresa_id = v_empresa_id;

          IF NOT FOUND THEN
            RETURN jsonb_build_object('sucesso',false,'erro','Loja não encontrada');
          END IF;

          RETURN jsonb_build_object('sucesso',true,'mensagem','Loja removida');
      END CASE;

    WHEN 'plataforma' THEN
      CASE v_operacao
        WHEN 'criar' THEN
          INSERT INTO public.plataformas (empresa_id, nome)
          VALUES (v_empresa_id, v_dados->>'nome')
          RETURNING id INTO v_novo_id;

          RETURN jsonb_build_object('sucesso',true,'plataforma_id',v_novo_id);

        WHEN 'atualizar' THEN
          UPDATE public.plataformas SET
            nome = COALESCE(v_dados->>'nome', nome)
          WHERE id = v_alvo_id AND empresa_id = v_empresa_id;

          IF NOT FOUND THEN
            RETURN jsonb_build_object('sucesso',false,'erro','Plataforma não encontrada');
          END IF;

          RETURN jsonb_build_object('sucesso',true,'mensagem','Plataforma atualizada');

        WHEN 'excluir' THEN
          DELETE FROM public.plataformas
          WHERE id = v_alvo_id AND empresa_id = v_empresa_id;

          IF NOT FOUND THEN
            RETURN jsonb_build_object('sucesso',false,'erro','Plataforma não encontrada');
          END IF;

          RETURN jsonb_build_object('sucesso',true,'mensagem','Plataforma removida');
      END CASE;

      WHEN 'unidade_loja' THEN
  CASE v_operacao
    WHEN 'criar' THEN
      -- Garantir que a loja pertence à empresa do token
      IF NOT EXISTS (
        SELECT 1
        FROM public.lojas l
        WHERE l.id = NULLIF(v_dados->>'loja_id','')::uuid
          AND l.empresa_id = v_empresa_id
      ) THEN
        RETURN jsonb_build_object('sucesso', false, 'erro', 'Loja inválida ou não pertence à empresa');
      END IF;

      INSERT INTO public.unidades_loja (
        empresa_id, loja_id, nome, logradouro, cep
      ) VALUES (
        v_empresa_id,
        NULLIF(v_dados->>'loja_id','')::uuid,
        v_dados->>'nome',
        NULLIF(v_dados->>'logradouro',''),
        -- normaliza CEP removendo caracteres não numéricos; mantém NULL se vier vazio
        NULLIF(regexp_replace(COALESCE(v_dados->>'cep',''), '\D', '', 'g'),'')
      )
      RETURNING id INTO v_novo_id;

      RETURN jsonb_build_object('sucesso', true, 'unidade_loja_id', v_novo_id);

    WHEN 'atualizar' THEN
      UPDATE public.unidades_loja ul SET
        nome       = COALESCE(v_dados->>'nome', ul.nome),
        logradouro = COALESCE(NULLIF(v_dados->>'logradouro',''), ul.logradouro),
        cep        = COALESCE(
                       NULLIF(regexp_replace(COALESCE(v_dados->>'cep',''), '\D', '', 'g'), ''),
                       ul.cep
                     )
      WHERE ul.id = v_alvo_id
        AND ul.empresa_id = v_empresa_id;

      IF NOT FOUND THEN
        RETURN jsonb_build_object('sucesso', false, 'erro', 'Unidade de loja não encontrada');
      END IF;

      RETURN jsonb_build_object('sucesso', true, 'mensagem', 'Unidade de loja atualizada');

    WHEN 'excluir' THEN
      DELETE FROM public.unidades_loja ul
      WHERE ul.id = v_alvo_id
        AND ul.empresa_id = v_empresa_id;

      IF NOT FOUND THEN
        RETURN jsonb_build_object('sucesso', false, 'erro', 'Unidade de loja não encontrada');
      END IF;

      RETURN jsonb_build_object('sucesso', true, 'mensagem', 'Unidade de loja removida');
  END CASE;

    ELSE
      RETURN jsonb_build_object('sucesso',false,'erro', format('Tipo %s não suportado', v_tipo));
  END CASE;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('sucesso',false,'erro','Erro interno: '||SQLERRM);
END;$$;


ALTER FUNCTION "public"."rpc_configuracoes"("p_payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rpc_registrar_venda"("p_empresa_id" "uuid", "p_venda" "jsonb", "p_usuario_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_id uuid;
  v_veiculo_id uuid := NULLIF(p_venda->>'veiculo_id','')::uuid;
  v_loja_id    uuid := NULLIF(p_venda->>'loja_id','')::uuid;
  v_fp         forma_pagamento := NULLIF(p_venda->>'forma_pagamento','')::forma_pagamento;
  v_preco      numeric := NULLIF(p_venda->>'preco_venda','')::numeric;
  v_cliente    text    := NULLIF(p_venda->>'cliente_nome','');
  v_doc        text    := NULLIF(p_venda->>'cliente_cpf_cnpj','');
  v_vendedor   uuid    := NULLIF(p_venda->>'vendedor_id','')::uuid;
BEGIN
  -- validações essenciais
  IF p_empresa_id IS NULL THEN
    RETURN jsonb_build_object('sucesso',false,'erro','empresa_id ausente');
  END IF;
  IF v_veiculo_id IS NULL OR v_loja_id IS NULL THEN
    RETURN jsonb_build_object('sucesso',false,'erro','veiculo_id e loja_id são obrigatórios');
  END IF;
  IF v_cliente IS NULL OR v_doc IS NULL THEN
    RETURN jsonb_build_object('sucesso',false,'erro','Dados do cliente obrigatórios (nome e cpf/cnpj)');
  END IF;
  IF v_preco IS NULL OR v_fp IS NULL THEN
    RETURN jsonb_build_object('sucesso',false,'erro','preco_venda e forma_pagamento são obrigatórios');
  END IF;
  IF v_vendedor IS NULL THEN
    RETURN jsonb_build_object('sucesso',false,'erro','vendedor_id é obrigatório');
  END IF;

  -- opcional: garantir que o veículo pertence à empresa
  PERFORM 1 FROM public.veiculos v
   WHERE v.id = v_veiculo_id AND v.empresa_id = p_empresa_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('sucesso',false,'erro','Veículo não pertence à empresa');
  END IF;

  INSERT INTO public.vendas (
    empresa_id, loja_id, veiculo_id,
    cliente_nome, cliente_cpf_cnpj, cliente_telefone, cliente_email, cliente_endereco,
    vendedor_id,
    preco_venda, preco_entrada, valor_financiado, forma_pagamento,
    instituicao_financeira, numero_parcelas, valor_parcela,
    tem_seguro, seguradora, valor_seguro,
    observacoes,
    data_previsao_entrega,
    criado_por  -- data_venda tem DEFAULT now(); status_venda tem DEFAULT 'negociacao'
  ) VALUES (
    p_empresa_id,
    v_loja_id,
    v_veiculo_id,
    v_cliente,
    v_doc,
    NULLIF(p_venda->>'cliente_telefone',''),
    NULLIF(p_venda->>'cliente_email',''),
    NULLIF(p_venda->>'cliente_endereco',''),
    v_vendedor,
    v_preco,
    NULLIF(p_venda->>'preco_entrada','')::numeric,
    NULLIF(p_venda->>'valor_financiado','')::numeric,
    v_fp,
    NULLIF(p_venda->>'instituicao_financeira',''),
    NULLIF(p_venda->>'numero_parcelas','')::integer,
    NULLIF(p_venda->>'valor_parcela','')::numeric,
    COALESCE((p_venda->>'tem_seguro')::boolean,false),
    NULLIF(p_venda->>'seguradora',''),
    NULLIF(p_venda->>'valor_seguro','')::numeric,
    NULLIF(p_venda->>'observacoes',''),
    NULLIF(p_venda->>'data_previsao_entrega','')::timestamptz,
    p_usuario_id
  ) RETURNING id INTO v_id;

  RETURN jsonb_build_object('sucesso',true,'venda_id',v_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('sucesso',false,'erro','Erro ao registrar venda: '||SQLERRM);
END;
$$;


ALTER FUNCTION "public"."rpc_registrar_venda"("p_empresa_id" "uuid", "p_venda" "jsonb", "p_usuario_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rpc_veiculos"("p_payload" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  v_uid         uuid := auth.uid();
  v_operacao    text := trim(both from coalesce(p_payload->>'operacao',''));
  v_empresa_id  uuid := public.empresa_do_usuario();

  v_dados       jsonb := coalesce(p_payload->'dados', p_payload);
  v_veiculo     jsonb := coalesce(p_payload->'veiculo', v_dados);

  v_veiculo_id       uuid := coalesce((p_payload->>'id')::uuid, (v_veiculo->>'id')::uuid);
  v_novo_veiculo_id  uuid;

  v_caracteristicas  uuid[] := '{}';
  v_caracteristica_id uuid;

  v_alvo_veiculos uuid[] := '{}';
  v_alvo uuid;
  v_total int := 0;

  -- arrays jsonb
  v_json_caracts jsonb := coalesce(
    p_payload->'caracteristicas',
    p_payload->'caracteristica_ids',
    v_dados->'caracteristicas',
    v_dados->'caracteristica_ids',
    '[]'::jsonb
  );

  v_json_caracts_add jsonb := coalesce(
    p_payload->'adicionar_caracteristicas',
    v_dados->'adicionar_caracteristicas',
    '[]'::jsonb
  );

  v_json_caracts_del jsonb := coalesce(
    p_payload->'remover_caracteristicas',
    v_dados->'remover_caracteristicas',
    '[]'::jsonb
  );
begin
  if v_uid is null then
    return jsonb_build_object('sucesso',false,'erro','Usuário não autenticado');
  end if;

  if v_empresa_id is null then
    return jsonb_build_object('sucesso',false,'erro','Usuário não está vinculado a uma empresa ativa');
  end if;

  if v_operacao is null or v_operacao = '' then
    return jsonb_build_object('sucesso',false,'erro','Operação não informada no payload');
  end if;

  case v_operacao

    when 'criar' then
      if v_veiculo is null or v_veiculo = '{}'::jsonb then
        return jsonb_build_object('sucesso',false,'erro','Dados do veículo não informados no payload');
      end if;

      if exists (
        select 1
          from public.veiculos v
         where v.empresa_id = v_empresa_id
           and v.placa = v_veiculo->>'placa'
      ) then
        return jsonb_build_object('sucesso',false,'erro','Placa já cadastrada na empresa');
      end if;

      insert into public.veiculos (
        empresa_id, modelo_id, local_id, placa, cor, hodometro,
        ano_fabricacao, ano_modelo, chassi, estado_veiculo,
        estado_venda, preco_venal, estagio_documentacao, observacao,
        registrado_por, registrado_em, editado_por, editado_em
      )
      values (
        v_empresa_id,
        nullif(v_veiculo->>'modelo_id','')::uuid,
        nullif(v_veiculo->>'local_id','')::uuid,
        v_veiculo->>'placa',
        v_veiculo->>'cor',
        nullif(v_veiculo->>'hodometro','')::integer,
        nullif(v_veiculo->>'ano_fabricacao','')::integer,
        nullif(v_veiculo->>'ano_modelo','')::integer,
        v_veiculo->>'chassi',
        nullif(v_veiculo->>'estado_veiculo','')::estado_veiculo,
        nullif(v_veiculo->>'estado_venda','')::estado_venda,
        nullif(v_veiculo->>'preco_venal','')::numeric,
        nullif(v_veiculo->>'estagio_documentacao','')::status_documentacao,
        v_veiculo->>'observacao',
        v_uid, now(), v_uid, now()
      )
      returning id into v_novo_veiculo_id;

      -- inserir características (se vier array)
      if jsonb_typeof(v_json_caracts) = 'array' then
        select coalesce(
                 array_agg(
                   nullif(
                     case
                       when jsonb_typeof(e.elem) = 'object' then e.elem->>'id' -- [{id,nome}]
                       else trim(both '"' from e.elem::text)                  -- ["uuid"] ou [uuid]
                     end
                   ,'')::uuid
                 ),
                 '{}'::uuid[]
               )
          into v_caracteristicas
          from jsonb_array_elements(v_json_caracts) as e(elem);

        foreach v_caracteristica_id in array v_caracteristicas loop
          insert into public.caracteristicas_veiculos (id, empresa_id, veiculo_id, caracteristica_id)
          values (gen_random_uuid(), v_empresa_id, v_novo_veiculo_id, v_caracteristica_id)
          on conflict do nothing;
        end loop;
      end if;

      return jsonb_build_object(
        'sucesso', true,
        'veiculo_id', v_novo_veiculo_id,
        'mensagem','Veículo cadastrado com sucesso',
        'caracteristicas_inseridas', v_caracteristicas
      );

    when 'atualizar' then
      if v_veiculo_id is null then
        return jsonb_build_object('sucesso',false,'erro','veiculo_id ausente no payload');
      end if;

      update public.veiculos set
        modelo_id       = coalesce(nullif(v_veiculo->>'modelo_id','')::uuid, modelo_id),
        local_id        = coalesce(nullif(v_veiculo->>'local_id','')::uuid, local_id),
        cor             = coalesce(nullif(v_veiculo->>'cor',''), cor),
        hodometro       = coalesce(nullif(v_veiculo->>'hodometro','')::integer, hodometro),
        estado_veiculo  = coalesce(nullif(v_veiculo->>'estado_veiculo','')::estado_veiculo, estado_veiculo),
        estado_venda    = coalesce(nullif(v_veiculo->>'estado_venda','')::estado_venda, estado_venda),
        preco_venal     = coalesce(nullif(v_veiculo->>'preco_venal','')::numeric, preco_venal),
        observacao      = coalesce(nullif(v_veiculo->>'observacao',''), observacao),
        editado_em      = now(),
        editado_por     = v_uid
      where id = v_veiculo_id
        and empresa_id = v_empresa_id;

      if not found then
        return jsonb_build_object('sucesso',false,'erro','Veículo não encontrado para a empresa');
      end if;

      -- adicionar características (se vier array)
      if jsonb_typeof(v_json_caracts_add) = 'array' then
        select coalesce(
                 array_agg(
                   nullif(
                     case
                       when jsonb_typeof(e.elem) = 'object' then e.elem->>'id'
                       else trim(both '"' from e.elem::text)
                     end
                   ,'')::uuid
                 ),
                 '{}'::uuid[]
               )
          into v_caracteristicas
          from jsonb_array_elements(v_json_caracts_add) as e(elem);

        foreach v_caracteristica_id in array v_caracteristicas loop
          insert into public.caracteristicas_veiculos (id, empresa_id, veiculo_id, caracteristica_id)
          values (gen_random_uuid(), v_empresa_id, v_veiculo_id, v_caracteristica_id)
          on conflict do nothing;
        end loop;
      end if;

      -- remover características (se vier array)
      if jsonb_typeof(v_json_caracts_del) = 'array' then
        select coalesce(
                 array_agg(
                   nullif(
                     case
                       when jsonb_typeof(e.elem) = 'object' then e.elem->>'id'
                       else trim(both '"' from e.elem::text)
                     end
                   ,'')::uuid
                 ),
                 '{}'::uuid[]
               )
          into v_caracteristicas
          from jsonb_array_elements(v_json_caracts_del) as e(elem);

        -- remove apenas do veículo e empresa atuais
        delete from public.caracteristicas_veiculos
         where empresa_id = v_empresa_id
           and veiculo_id = v_veiculo_id
           and caracteristica_id = any (v_caracteristicas);
      end if;

      return jsonb_build_object(
        'sucesso',true,
        'veiculo_id',v_veiculo_id,
        'mensagem','Veículo atualizado com sucesso',
        'caracteristicas_afetadas', v_caracteristicas
      );

    when 'aplicar_caracteristicas' then
      -- veículos-alvo
      select coalesce(array_agg(nullif(trim(both '"' from e.elem::text), '')::uuid), '{}'::uuid[])
        into v_alvo_veiculos
        from jsonb_array_elements(coalesce(p_payload->'veiculo_ids', v_dados->'veiculo_ids', '[]'::jsonb)) as e(elem);

      if (v_alvo_veiculos is null or array_length(v_alvo_veiculos,1)=0) and v_veiculo_id is not null then
        v_alvo_veiculos := array[v_veiculo_id];
      end if;

      if v_alvo_veiculos is null or array_length(v_alvo_veiculos,1)=0 then
        return jsonb_build_object('sucesso',false,'erro','Nenhum veículo informado no payload');
      end if;

      -- características
      select coalesce(
               array_agg(
                 nullif(
                   case
                     when jsonb_typeof(e.elem)='object' then e.elem->>'id'
                     else trim(both '"' from e.elem::text)
                   end
                 ,'')::uuid
               ),
               '{}'::uuid[]
             )
        into v_caracteristicas
        from jsonb_array_elements(
          coalesce(
            p_payload->'caracteristicas',
            p_payload->'caracteristica_ids',
            v_dados->'caracteristicas',
            v_dados->'caracteristica_ids',
            '[]'::jsonb
          )
        ) as e(elem);

      foreach v_alvo in array v_alvo_veiculos loop
        foreach v_caracteristica_id in array v_caracteristicas loop
          insert into public.caracteristicas_veiculos (id, empresa_id, veiculo_id, caracteristica_id)
          values (gen_random_uuid(), v_empresa_id, v_alvo, v_caracteristica_id)
          on conflict do nothing;
          v_total := v_total + 1;
        end loop;
      end loop;

      return jsonb_build_object('sucesso',true,'mensagem','Características aplicadas em lote','total_aplicadas',v_total);

    else
      return jsonb_build_object('sucesso',false,'erro', format('Operação %s não suportada', v_operacao));
  end case;

exception when others then
  return jsonb_build_object('sucesso',false,'erro','Erro interno: '||SQLERRM);
end;
$$;


ALTER FUNCTION "public"."rpc_veiculos"("p_payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rpc_vendas"("p_payload" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_operacao text := trim(both from COALESCE(p_payload->>'operacao',''));
  v_empresa_id uuid := public.empresa_do_usuario();
  v_dados jsonb := COALESCE(p_payload->'dados', p_payload);
  v_venda jsonb := COALESCE(p_payload->'venda', v_dados);
  v_venda_id uuid := COALESCE((p_payload->>'venda_id')::uuid, (v_venda->>'id')::uuid);
  v_status_text text;
  v_status status_venda;
  v_data_entrega timestamptz := COALESCE(NULLIF(p_payload->>'data_entrega','')::timestamptz, NULLIF(v_dados->>'data_entrega','')::timestamptz);
  v_observacoes text := COALESCE(p_payload->>'observacoes', v_dados->>'observacoes');
  v_resultado jsonb := '{}';
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('sucesso',false,'erro','Usuário não autenticado');
  END IF;

  IF v_empresa_id IS NULL THEN
    RETURN jsonb_build_object('sucesso',false,'erro','Usuário não está vinculado a uma empresa ativa');
  END IF;

  IF v_operacao IS NULL OR v_operacao = '' THEN
    RETURN jsonb_build_object('sucesso',false,'erro','Operação não informada no payload');
  END IF;

  CASE v_operacao
    WHEN 'registrar' THEN
      -- GARANTA que rpc_registrar_venda exista com (uuid, jsonb, uuid)
      v_resultado := (public.rpc_registrar_venda(
        v_empresa_id,
        COALESCE(v_dados->'venda', v_dados),  -- jsonb
        v_uid
      ))::jsonb;
      RETURN COALESCE(v_resultado, jsonb_build_object('sucesso', true));

    WHEN 'atualizar_status','cancelar','finalizar' THEN
      IF v_venda_id IS NULL THEN
        RETURN jsonb_build_object('sucesso',false,'erro','venda_id ausente no payload');
      END IF;

      v_status_text := CASE v_operacao
        WHEN 'cancelar'  THEN 'cancelada'
        WHEN 'finalizar' THEN 'finalizada'
        ELSE COALESCE(p_payload->>'novo_status', v_dados->>'novo_status')
      END;

      IF v_status_text IS NULL OR v_status_text = '' THEN
        RETURN jsonb_build_object('sucesso',false,'erro','novo_status não informado');
      END IF;

      v_status := v_status_text::status_venda;

      -- GARANTA que rpc_atualizar_status_venda exista com (uuid, status_venda, timestamptz, text, uuid)
      v_resultado := (public.rpc_atualizar_status_venda(
        v_venda_id, v_status, v_data_entrega, v_observacoes, v_uid
      ))::jsonb;

      RETURN COALESCE(v_resultado, jsonb_build_object('sucesso', true));

    ELSE
      RETURN jsonb_build_object('sucesso',false,'erro', format('Operação %s não suportada', v_operacao));
  END CASE;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('sucesso',false,'erro','Erro interno: '||SQLERRM);
END;
$$;


ALTER FUNCTION "public"."rpc_vendas"("p_payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_has_role"("_user_id" "uuid", "_role" "public"."app_role", "_empresa_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role AND empresa_id = _empresa_id
  );
$$;


ALTER FUNCTION "public"."user_has_role"("_user_id" "uuid", "_role" "public"."app_role", "_empresa_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_is_admin"("_user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'proprietario')
  );
$$;


ALTER FUNCTION "public"."user_is_admin"("_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."veiculos_audit_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.veiculos_audit(operacao, registro_id, autor, evento_em, valor_novo)
    VALUES ('INSERT', NEW.id, COALESCE((SELECT auth.uid()), NULL), now(), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- For UPDATE, store full row old and new and also per-column entries for changed columns
    INSERT INTO public.veiculos_audit(operacao, registro_id, autor, evento_em, valor_antigo, valor_novo)
    VALUES ('UPDATE', NEW.id, COALESCE((SELECT auth.uid()), NULL), now(), to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.veiculos_audit(operacao, registro_id, autor, evento_em, valor_antigo)
    VALUES ('DELETE', OLD.id, COALESCE((SELECT auth.uid()), NULL), now(), to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."veiculos_audit_trigger"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."veiculos_loja_audit_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.veiculos_loja_audit(operacao, registro_id, autor, evento_em, valor_novo)
    VALUES ('INSERT', NEW.id, COALESCE((SELECT auth.uid()), NULL), now(), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.veiculos_loja_audit(operacao, registro_id, autor, evento_em, valor_antigo, valor_novo)
    VALUES ('UPDATE', NEW.id, COALESCE((SELECT auth.uid()), NULL), now(), to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.veiculos_loja_audit(operacao, registro_id, autor, evento_em, valor_antigo)
    VALUES ('DELETE', OLD.id, COALESCE((SELECT auth.uid()), NULL), now(), to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."veiculos_loja_audit_trigger"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."anuncios" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "loja_id" "uuid",
    "entidade_id" "uuid" NOT NULL,
    "tipo_anuncio" character varying NOT NULL,
    "plataforma_id" "uuid" NOT NULL,
    "autor_id" "uuid",
    "titulo" character varying NOT NULL,
    "titulo_original" character varying,
    "descricao" "text",
    "descricao_original" "text",
    "preco" numeric(10,2),
    "preco_original" numeric(10,2),
    "status" character varying DEFAULT 'ativo'::character varying,
    "identificador_fisico" character varying,
    "tipo_identificador_fisico" character varying,
    "link_anuncio" character varying,
    "data_publicacao" timestamp with time zone,
    "data_vencimento" timestamp with time zone,
    "visualizacoes" integer DEFAULT 0,
    "favoritos" integer DEFAULT 0,
    "mensagens" integer DEFAULT 0,
    "criado_em" timestamp with time zone DEFAULT "now"(),
    "atualizado_em" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "anuncios_preco_check" CHECK (("preco" >= (0)::numeric)),
    CONSTRAINT "anuncios_tipo_anuncio_check" CHECK ((("tipo_anuncio")::"text" = ANY ((ARRAY['repetido'::character varying, 'unico'::character varying])::"text"[])))
);


ALTER TABLE "public"."anuncios" OWNER TO "postgres";


COMMENT ON TABLE "public"."anuncios" IS 'Anúncios publicados nas diferentes plataformas';



CREATE TABLE IF NOT EXISTS "public"."caracteristicas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "nome" character varying NOT NULL
);


ALTER TABLE "public"."caracteristicas" OWNER TO "postgres";


COMMENT ON TABLE "public"."caracteristicas" IS 'Características personalizáveis dos veículos por empresa';



CREATE TABLE IF NOT EXISTS "public"."caracteristicas_repetidos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "repetido_id" "uuid" NOT NULL,
    "caracteristica_id" "uuid" NOT NULL
);


ALTER TABLE "public"."caracteristicas_repetidos" OWNER TO "postgres";


COMMENT ON TABLE "public"."caracteristicas_repetidos" IS 'Valores padrão das características para grupos de repetidos';



CREATE TABLE IF NOT EXISTS "public"."caracteristicas_veiculos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "veiculo_id" "uuid" NOT NULL,
    "caracteristica_id" "uuid" NOT NULL
);


ALTER TABLE "public"."caracteristicas_veiculos" OWNER TO "postgres";


COMMENT ON TABLE "public"."caracteristicas_veiculos" IS 'Valores das características específicas de cada veículo';



CREATE TABLE IF NOT EXISTS "public"."convites_empresa" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "convidado_por_usuario_id" "uuid" NOT NULL,
    "usuario_convidado_id" "uuid" NOT NULL,
    "token" character varying DEFAULT ("gen_random_uuid"())::"text" NOT NULL,
    "status" character varying DEFAULT 'pendente'::character varying,
    "criado_em" timestamp with time zone DEFAULT "now"(),
    "expira_em" timestamp with time zone NOT NULL,
    "consumido_em" timestamp with time zone,
    CONSTRAINT "convites_empresa_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pendente'::character varying, 'aceito'::character varying, 'rejeitado'::character varying, 'expirado'::character varying])::"text"[])))
);


ALTER TABLE "public"."convites_empresa" OWNER TO "postgres";


COMMENT ON TABLE "public"."convites_empresa" IS 'Convites pendentes para membros se juntarem às empresas';



CREATE TABLE IF NOT EXISTS "public"."documentacao_veiculos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "veiculo_id" "uuid" NOT NULL,
    "loja_id" "uuid",
    "status_geral" "public"."status_documentacao" DEFAULT 'pendente'::"public"."status_documentacao" NOT NULL,
    "tem_crlv" boolean DEFAULT false,
    "tem_crv" boolean DEFAULT false,
    "tem_nf_compra" boolean DEFAULT false,
    "tem_chave_reserva" boolean DEFAULT false,
    "tem_manual" boolean DEFAULT false,
    "tem_multas" boolean DEFAULT false,
    "valor_multas" numeric(10,2) DEFAULT 0,
    "tem_dividas_ativas" boolean DEFAULT false,
    "valor_dividas_ativas" numeric(10,2) DEFAULT 0,
    "tem_precatorios" boolean DEFAULT false,
    "tem_embargos" boolean DEFAULT false,
    "tem_restricoes" boolean DEFAULT false,
    "transferencia_iniciada" boolean DEFAULT false,
    "transferencia_concluida" boolean DEFAULT false,
    "data_transferencia" timestamp with time zone,
    "vistoria_realizada" boolean DEFAULT false,
    "data_vistoria" timestamp with time zone,
    "aprovada_vistoria" boolean DEFAULT false,
    "observacoes_gerais" "text",
    "observacoes_multas" "text",
    "observacoes_restricoes" "text",
    "responsavel_id" "uuid",
    "data_entrada" timestamp with time zone DEFAULT "now"(),
    "data_conclusao" timestamp with time zone,
    "criado_em" timestamp with time zone DEFAULT "now"(),
    "atualizado_em" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."documentacao_veiculos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."empresas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" character varying NOT NULL,
    "dominio" character varying,
    "ativo" boolean DEFAULT true,
    "criado_em" timestamp with time zone DEFAULT "now"(),
    "atualizado_em" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."empresas" OWNER TO "postgres";


COMMENT ON TABLE "public"."empresas" IS 'Tabela de empresas/organizações que utilizam o sistema';



CREATE TABLE IF NOT EXISTS "public"."fotos_metadados" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "veiculo_id" "uuid" NOT NULL,
    "loja_id" "uuid" NOT NULL,
    "path" character varying NOT NULL,
    "e_capa" boolean DEFAULT false NOT NULL,
    "criado_em" timestamp with time zone DEFAULT "now"() NOT NULL,
    "atualizado_em" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ordem" smallint NOT NULL,
    CONSTRAINT "fotos_ordem_check" CHECK ((("ordem" >= 1) AND ("ordem" <= 1000)))
);


ALTER TABLE "public"."fotos_metadados" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."locais" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "nome" character varying NOT NULL
);


ALTER TABLE "public"."locais" OWNER TO "postgres";


COMMENT ON TABLE "public"."locais" IS 'Locais onde os veículos podem estar armazenados';



CREATE TABLE IF NOT EXISTS "public"."lojas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "nome" character varying NOT NULL
);


ALTER TABLE "public"."lojas" OWNER TO "postgres";


COMMENT ON TABLE "public"."lojas" IS 'Lojas ou pontos de venda da empresa';



CREATE TABLE IF NOT EXISTS "public"."membros_empresa" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "usuario_id" "uuid" NOT NULL,
    "papel" "public"."papel_usuario_empresa" DEFAULT 'usuario'::"public"."papel_usuario_empresa",
    "ativo" boolean DEFAULT true,
    "criado_em" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."membros_empresa" OWNER TO "postgres";


COMMENT ON TABLE "public"."membros_empresa" IS 'Membros das empresas com seus respectivos papéis';



CREATE TABLE IF NOT EXISTS "public"."modelos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "marca" character varying NOT NULL,
    "nome" character varying NOT NULL,
    "edicao" character varying,
    "carroceria" "public"."tipo_carroceria",
    "combustivel" "public"."tipo_combustivel",
    "tipo_cambio" "public"."tipo_cambio",
    "motor" character varying,
    "cambio" character varying,
    "cilindros" integer,
    "valvulas" integer,
    "lugares" integer,
    "portas" integer,
    "cabine" character varying,
    "tracao" character varying,
    "ano_inicial" integer,
    "ano_final" integer,
    "criado_em" timestamp with time zone DEFAULT "now"(),
    "atualizado_em" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "modelos_ano_final_check" CHECK ((("ano_final" >= 1900) AND (("ano_final")::numeric <= (EXTRACT(year FROM "now"()) + (2)::numeric)))),
    CONSTRAINT "modelos_ano_inicial_check" CHECK ((("ano_inicial" >= 1900) AND (("ano_inicial")::numeric <= (EXTRACT(year FROM "now"()) + (2)::numeric)))),
    CONSTRAINT "modelos_check" CHECK ((("ano_final" IS NULL) OR ("ano_final" >= "ano_inicial"))),
    CONSTRAINT "modelos_cilindros_check" CHECK (("cilindros" > 0)),
    CONSTRAINT "modelos_lugares_check" CHECK ((("lugares" > 0) AND ("lugares" <= 50))),
    CONSTRAINT "modelos_portas_check" CHECK ((("portas" > 0) AND ("portas" <= 6))),
    CONSTRAINT "modelos_valvulas_check" CHECK (("valvulas" > 0))
);


ALTER TABLE "public"."modelos" OWNER TO "postgres";


COMMENT ON TABLE "public"."modelos" IS 'Modelos de veículos com especificações técnicas detalhadas';



COMMENT ON COLUMN "public"."modelos"."carroceria" IS 'Tipo de carroceria do veículo (sedan, hatch, suv, etc.)';



COMMENT ON COLUMN "public"."modelos"."cilindros" IS 'Número de cilindros do motor';



COMMENT ON COLUMN "public"."modelos"."valvulas" IS 'Número de válvulas do motor';



COMMENT ON COLUMN "public"."modelos"."lugares" IS 'Capacidade de passageiros';



COMMENT ON COLUMN "public"."modelos"."portas" IS 'Número de portas do veículo';



CREATE TABLE IF NOT EXISTS "public"."notificacoes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "titulo" "text" NOT NULL,
    "mensagem" "text" NOT NULL,
    "tipo" "text" DEFAULT 'info'::"text",
    "lida" boolean DEFAULT false,
    "data" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "notificacoes_tipo_check" CHECK (("tipo" = ANY (ARRAY['info'::"text", 'success'::"text", 'warning'::"text", 'error'::"text"])))
);


ALTER TABLE "public"."notificacoes" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."notificacoes_nao_lidas_count" WITH ("security_invoker"='on') AS
 SELECT "user_id",
    "count"(*) AS "total"
   FROM "public"."notificacoes"
  WHERE ("lida" = false)
  GROUP BY "user_id";


ALTER VIEW "public"."notificacoes_nao_lidas_count" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notificacoes_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "token" "text" NOT NULL,
    "atualizado_em" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notificacoes_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."permissoes_papel" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "papel" "public"."papel_usuario_empresa" NOT NULL,
    "operacao" "text" NOT NULL,
    "permitido" boolean DEFAULT true NOT NULL,
    "condicoes_extras" "jsonb",
    "criado_em" timestamp with time zone DEFAULT "now"(),
    "atualizado_em" timestamp with time zone DEFAULT "now"(),
    "criado_por" "uuid",
    "atualizado_por" "uuid"
);


ALTER TABLE "public"."permissoes_papel" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."plataformas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "nome" character varying NOT NULL
);


ALTER TABLE "public"."plataformas" OWNER TO "postgres";


COMMENT ON TABLE "public"."plataformas" IS 'Plataformass onde os anúncios são publicados';



CREATE TABLE IF NOT EXISTS "public"."promocoes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "veiculo_loja_id" "uuid",
    "anuncio_id" "uuid",
    "tipo_promocao" character varying NOT NULL,
    "preco_promocional" numeric(10,2) NOT NULL,
    "data_inicio" timestamp with time zone NOT NULL,
    "data_fim" timestamp with time zone,
    "autor_id" "uuid" NOT NULL,
    "ativo" boolean DEFAULT true,
    "criado_em" timestamp with time zone DEFAULT "now"(),
    "atualizado_em" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "promocoes_check" CHECK (("data_fim" > "data_inicio")),
    CONSTRAINT "promocoes_check1" CHECK ((((("tipo_promocao")::"text" = 'loja'::"text") AND ("veiculo_loja_id" IS NOT NULL) AND ("anuncio_id" IS NULL)) OR ((("tipo_promocao")::"text" = 'anuncio'::"text") AND ("anuncio_id" IS NOT NULL) AND ("veiculo_loja_id" IS NULL)))),
    CONSTRAINT "promocoes_preco_promocional_check" CHECK (("preco_promocional" >= (0)::numeric)),
    CONSTRAINT "promocoes_tipo_promocao_check" CHECK ((("tipo_promocao")::"text" = ANY ((ARRAY['loja'::character varying, 'anuncio'::character varying])::"text"[])))
);


ALTER TABLE "public"."promocoes" OWNER TO "postgres";


COMMENT ON TABLE "public"."promocoes" IS 'Promoções aplicadas a veículos em loja ou anúncios com preços especiais e período de vigência';



COMMENT ON COLUMN "public"."promocoes"."tipo_promocao" IS 'Define se a promoção é aplicada a loja ou anuncio';



COMMENT ON COLUMN "public"."promocoes"."preco_promocional" IS 'Preço especial durante o período promocional';



COMMENT ON COLUMN "public"."promocoes"."data_inicio" IS 'Data e hora de início da promoção';



COMMENT ON COLUMN "public"."promocoes"."data_fim" IS 'Data e hora de término da promoção';



COMMENT ON COLUMN "public"."promocoes"."ativo" IS 'Indica se a promoção está ativa (pode ser desativada manualmente)';



CREATE TABLE IF NOT EXISTS "public"."repetidos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "modelo_id" "uuid" NOT NULL,
    "ano_fabricacao_padrao" integer NOT NULL,
    "ano_modelo_padrao" integer NOT NULL,
    "cor_padrao" character varying NOT NULL,
    "min_hodometro" integer NOT NULL,
    "max_hodometro" integer NOT NULL,
    "registrado_em" timestamp with time zone DEFAULT "now"(),
    "registrado_por" "uuid",
    "alterado_em" timestamp with time zone DEFAULT "now"(),
    "alterado_por" "uuid"
);


ALTER TABLE "public"."repetidos" OWNER TO "postgres";


COMMENT ON TABLE "public"."repetidos" IS 'Agrupamentos de veículos similares para detecção de duplicatas';



CREATE TABLE IF NOT EXISTS "public"."tem_fotos" (
    "empresa_id" "uuid" NOT NULL,
    "veiculo_id" "uuid" NOT NULL,
    "loja_id" "uuid" NOT NULL,
    "qtd_fotos" smallint DEFAULT 0 NOT NULL,
    "ultima_atualizacao" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "tem_fotos_qtd_fotos_check" CHECK ((("qtd_fotos" >= 0) AND ("qtd_fotos" <= 30)))
);


ALTER TABLE "public"."tem_fotos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."unidades_loja" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "loja_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" "text" NOT NULL,
    "logradouro" "text",
    "cep" "text",
    "inaugurado_em" timestamp with time zone DEFAULT "now"() NOT NULL,
    "fechado_em" timestamp with time zone
);


ALTER TABLE "public"."unidades_loja" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."app_role" NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "criado_em" timestamp with time zone DEFAULT "now"(),
    "criado_por" "uuid"
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."veiculos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "modelo_id" "uuid",
    "local_id" "uuid",
    "placa" character varying NOT NULL,
    "cor" character varying,
    "hodometro" integer NOT NULL,
    "ano_fabricacao" integer,
    "ano_modelo" integer,
    "chassi" character varying,
    "estado_veiculo" "public"."estado_veiculo",
    "estado_venda" "public"."estado_venda" NOT NULL,
    "preco_venal" numeric(10,2),
    "estagio_documentacao" character varying,
    "observacao" "text",
    "registrado_em" timestamp with time zone DEFAULT "now"() NOT NULL,
    "registrado_por" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "editado_em" timestamp with time zone DEFAULT "now"() NOT NULL,
    "editado_por" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    CONSTRAINT "veiculos_ano_fabricacao_check" CHECK ((("ano_fabricacao" >= 1900) AND (("ano_fabricacao")::numeric <= (EXTRACT(year FROM "now"()) + (2)::numeric)))),
    CONSTRAINT "veiculos_ano_modelo_check" CHECK ((("ano_modelo" >= 1900) AND (("ano_modelo")::numeric <= (EXTRACT(year FROM "now"()) + (2)::numeric)))),
    CONSTRAINT "veiculos_check" CHECK ((("ano_modelo" IS NULL) OR ("ano_fabricacao" IS NULL) OR ("ano_modelo" >= "ano_fabricacao"))),
    CONSTRAINT "veiculos_hodometro_check" CHECK (("hodometro" >= 0)),
    CONSTRAINT "veiculos_preco_venal_check" CHECK (("preco_venal" >= (0)::numeric))
);


ALTER TABLE "public"."veiculos" OWNER TO "postgres";


COMMENT ON TABLE "public"."veiculos" IS 'Tabela principal de veículos do estoque';



CREATE TABLE IF NOT EXISTS "public"."veiculos_audit" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "operacao" "text" NOT NULL,
    "tabela" "text" DEFAULT 'veiculos'::"text" NOT NULL,
    "registro_id" "uuid",
    "autor" "uuid",
    "evento_em" timestamp with time zone DEFAULT "now"(),
    "coluna" "text",
    "valor_antigo" "jsonb",
    "valor_novo" "jsonb"
);


ALTER TABLE "public"."veiculos_audit" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."veiculos_loja" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "veiculo_id" "uuid" NOT NULL,
    "loja_id" "uuid" NOT NULL,
    "preco" numeric(10,2),
    "data_entrada" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."veiculos_loja" OWNER TO "postgres";


COMMENT ON TABLE "public"."veiculos_loja" IS 'Relacionamento entre veículos e lojas onde estão sendo vendidos';



CREATE TABLE IF NOT EXISTS "public"."veiculos_loja_audit" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "operacao" "text" NOT NULL,
    "tabela" "text" DEFAULT 'veiculos_loja'::"text" NOT NULL,
    "registro_id" "uuid",
    "autor" "uuid",
    "evento_em" timestamp with time zone DEFAULT "now"(),
    "coluna" "text",
    "valor_antigo" "jsonb",
    "valor_novo" "jsonb"
);


ALTER TABLE "public"."veiculos_loja_audit" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."veiculos_repetidos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "repetido_id" "uuid" NOT NULL,
    "veiculo_id" "uuid" NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "similaridade_score" numeric(3,2),
    "criado_em" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."veiculos_repetidos" OWNER TO "postgres";


COMMENT ON TABLE "public"."veiculos_repetidos" IS 'Relacionamento many-to-many entre veículos e grupos de repetidos';



CREATE TABLE IF NOT EXISTS "public"."vendas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "loja_id" "uuid" NOT NULL,
    "veiculo_id" "uuid" NOT NULL,
    "cliente_nome" character varying NOT NULL,
    "cliente_cpf_cnpj" character varying NOT NULL,
    "cliente_telefone" character varying,
    "cliente_email" character varying,
    "cliente_endereco" "text",
    "vendedor_id" "uuid" NOT NULL,
    "preco_venda" numeric(12,2) NOT NULL,
    "preco_entrada" numeric(12,2) DEFAULT 0,
    "valor_financiado" numeric(12,2) DEFAULT 0,
    "forma_pagamento" "public"."forma_pagamento" NOT NULL,
    "instituicao_financeira" character varying,
    "numero_parcelas" integer,
    "valor_parcela" numeric(10,2),
    "tem_seguro" boolean DEFAULT false,
    "seguradora" character varying,
    "valor_seguro" numeric(10,2),
    "data_venda" timestamp with time zone DEFAULT "now"() NOT NULL,
    "data_entrega" timestamp with time zone,
    "data_previsao_entrega" timestamp with time zone,
    "status_venda" "public"."status_venda" DEFAULT 'negociacao'::"public"."status_venda" NOT NULL,
    "observacoes" "text",
    "comissao_vendedor" numeric(10,2),
    "comissao_loja" numeric(10,2),
    "criado_em" timestamp with time zone DEFAULT "now"(),
    "atualizado_em" timestamp with time zone DEFAULT "now"(),
    "criado_por" "uuid" NOT NULL,
    "atualizado_por" "uuid",
    CONSTRAINT "vendas_check" CHECK ((("preco_entrada" + "valor_financiado") <= "preco_venda")),
    CONSTRAINT "vendas_comissao_loja_check" CHECK (("comissao_loja" >= (0)::numeric)),
    CONSTRAINT "vendas_comissao_vendedor_check" CHECK (("comissao_vendedor" >= (0)::numeric)),
    CONSTRAINT "vendas_numero_parcelas_check" CHECK (("numero_parcelas" > 0)),
    CONSTRAINT "vendas_preco_entrada_check" CHECK (("preco_entrada" >= (0)::numeric)),
    CONSTRAINT "vendas_preco_venda_check" CHECK (("preco_venda" > (0)::numeric)),
    CONSTRAINT "vendas_valor_financiado_check" CHECK (("valor_financiado" >= (0)::numeric)),
    CONSTRAINT "vendas_valor_parcela_check" CHECK (("valor_parcela" >= (0)::numeric)),
    CONSTRAINT "vendas_valor_seguro_check" CHECK (("valor_seguro" >= (0)::numeric))
);


ALTER TABLE "public"."vendas" OWNER TO "postgres";


ALTER TABLE ONLY "public"."anuncios"
    ADD CONSTRAINT "anuncios_loja_id_plataforma_id_key" UNIQUE ("loja_id", "plataforma_id");



ALTER TABLE ONLY "public"."anuncios"
    ADD CONSTRAINT "anuncios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."caracteristicas"
    ADD CONSTRAINT "caracteristicas_empresa_id_nome_key" UNIQUE ("empresa_id", "nome");



ALTER TABLE ONLY "public"."caracteristicas"
    ADD CONSTRAINT "caracteristicas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."caracteristicas_repetidos"
    ADD CONSTRAINT "caracteristicas_repetidos_empresa_id_repetido_id_caracteris_key" UNIQUE ("empresa_id", "repetido_id", "caracteristica_id");



ALTER TABLE ONLY "public"."caracteristicas_repetidos"
    ADD CONSTRAINT "caracteristicas_repetidos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."caracteristicas_veiculos"
    ADD CONSTRAINT "caracteristicas_veiculos_empresa_id_veiculo_id_caracteristi_key" UNIQUE ("empresa_id", "veiculo_id", "caracteristica_id");



ALTER TABLE ONLY "public"."caracteristicas_veiculos"
    ADD CONSTRAINT "caracteristicas_veiculos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."convites_empresa"
    ADD CONSTRAINT "convites_empresa_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."convites_empresa"
    ADD CONSTRAINT "convites_empresa_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."documentacao_veiculos"
    ADD CONSTRAINT "documentacao_veiculos_empresa_id_veiculo_id_key" UNIQUE ("empresa_id", "veiculo_id");



ALTER TABLE ONLY "public"."documentacao_veiculos"
    ADD CONSTRAINT "documentacao_veiculos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."empresas"
    ADD CONSTRAINT "empresas_dominio_key" UNIQUE ("dominio");



ALTER TABLE ONLY "public"."empresas"
    ADD CONSTRAINT "empresas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fotos_metadados"
    ADD CONSTRAINT "fotos_veiculo_por_loja_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."locais"
    ADD CONSTRAINT "locais_empresa_id_nome_key" UNIQUE ("empresa_id", "nome");



ALTER TABLE ONLY "public"."locais"
    ADD CONSTRAINT "locais_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lojas"
    ADD CONSTRAINT "lojas_empresa_id_nome_key" UNIQUE ("empresa_id", "nome");



ALTER TABLE ONLY "public"."lojas"
    ADD CONSTRAINT "lojas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."membros_empresa"
    ADD CONSTRAINT "membros_empresa_empresa_id_usuario_id_key" UNIQUE ("empresa_id", "usuario_id");



ALTER TABLE ONLY "public"."membros_empresa"
    ADD CONSTRAINT "membros_empresa_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."modelos"
    ADD CONSTRAINT "modelos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notificacoes"
    ADD CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notificacoes_tokens"
    ADD CONSTRAINT "notificacoes_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notificacoes_tokens"
    ADD CONSTRAINT "notificacoes_tokens_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."permissoes_papel"
    ADD CONSTRAINT "permissoes_empresa_empresa_id_papel_operacao_key" UNIQUE ("empresa_id", "papel", "operacao");



ALTER TABLE ONLY "public"."permissoes_papel"
    ADD CONSTRAINT "permissoes_empresa_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plataformas"
    ADD CONSTRAINT "plataformas_empresa_id_nome_key" UNIQUE ("empresa_id", "nome");



ALTER TABLE ONLY "public"."plataformas"
    ADD CONSTRAINT "plataformas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promocoes"
    ADD CONSTRAINT "promocoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."repetidos"
    ADD CONSTRAINT "repetidos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tem_fotos"
    ADD CONSTRAINT "tem_fotos_pkey" PRIMARY KEY ("empresa_id", "veiculo_id", "loja_id");



ALTER TABLE ONLY "public"."unidades_loja"
    ADD CONSTRAINT "unidades_loja_loja_id_nome_unique" UNIQUE ("loja_id", "nome");



ALTER TABLE ONLY "public"."unidades_loja"
    ADD CONSTRAINT "unidades_loja_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_empresa_id_role_key" UNIQUE ("user_id", "empresa_id", "role");



ALTER TABLE ONLY "public"."veiculos_audit"
    ADD CONSTRAINT "veiculos_audit_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."veiculos"
    ADD CONSTRAINT "veiculos_chassi_key" UNIQUE ("chassi");



ALTER TABLE ONLY "public"."veiculos_loja_audit"
    ADD CONSTRAINT "veiculos_loja_audit_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."veiculos_loja"
    ADD CONSTRAINT "veiculos_loja_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."veiculos"
    ADD CONSTRAINT "veiculos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."veiculos"
    ADD CONSTRAINT "veiculos_placa_key" UNIQUE ("placa");



ALTER TABLE ONLY "public"."veiculos_repetidos"
    ADD CONSTRAINT "veiculos_repetidos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."veiculos_repetidos"
    ADD CONSTRAINT "veiculos_repetidos_repetido_id_veiculo_id_key" UNIQUE ("repetido_id", "veiculo_id");



ALTER TABLE ONLY "public"."vendas"
    ADD CONSTRAINT "vendas_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_anuncios_data_publicacao" ON "public"."anuncios" USING "btree" ("data_publicacao");



CREATE INDEX "idx_anuncios_empresa_id" ON "public"."anuncios" USING "btree" ("empresa_id");



CREATE INDEX "idx_anuncios_loja_id" ON "public"."anuncios" USING "btree" ("loja_id");



CREATE INDEX "idx_anuncios_plataforma_id" ON "public"."anuncios" USING "btree" ("plataforma_id");



CREATE INDEX "idx_anuncios_status" ON "public"."anuncios" USING "btree" ("status");



CREATE INDEX "idx_documentacao_empresa_id" ON "public"."documentacao_veiculos" USING "btree" ("empresa_id");



CREATE INDEX "idx_documentacao_loja_id" ON "public"."documentacao_veiculos" USING "btree" ("loja_id");



CREATE INDEX "idx_documentacao_pendencias" ON "public"."documentacao_veiculos" USING "btree" ("tem_multas", "tem_dividas_ativas", "tem_restricoes");



CREATE INDEX "idx_documentacao_responsavel" ON "public"."documentacao_veiculos" USING "btree" ("responsavel_id");



CREATE INDEX "idx_documentacao_status" ON "public"."documentacao_veiculos" USING "btree" ("status_geral");



CREATE INDEX "idx_documentacao_veiculo_id" ON "public"."documentacao_veiculos" USING "btree" ("veiculo_id");



CREATE INDEX "idx_fotos_loja_empresa_id" ON "public"."fotos_metadados" USING "btree" ("empresa_id");



CREATE INDEX "idx_fotos_loja_loja_id" ON "public"."fotos_metadados" USING "btree" ("loja_id");



CREATE INDEX "idx_fotos_loja_veiculo_id" ON "public"."fotos_metadados" USING "btree" ("veiculo_id");



CREATE INDEX "idx_membros_empresa_empresa_id" ON "public"."membros_empresa" USING "btree" ("empresa_id");



CREATE INDEX "idx_membros_empresa_usuario_id" ON "public"."membros_empresa" USING "btree" ("usuario_id");



CREATE INDEX "idx_modelo_empresa_id" ON "public"."modelos" USING "btree" ("empresa_id");



CREATE INDEX "idx_modelo_marca" ON "public"."modelos" USING "btree" ("marca");



CREATE INDEX "idx_modelo_nome" ON "public"."modelos" USING "btree" ("nome");



CREATE INDEX "idx_notificacoes_created_at" ON "public"."notificacoes" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_notificacoes_lida" ON "public"."notificacoes" USING "btree" ("user_id", "lida");



CREATE INDEX "idx_notificacoes_tokens_user_id" ON "public"."notificacoes_tokens" USING "btree" ("user_id");



CREATE INDEX "idx_notificacoes_user_id" ON "public"."notificacoes" USING "btree" ("user_id");



CREATE INDEX "idx_promocoes_anuncio_id" ON "public"."promocoes" USING "btree" ("anuncio_id");



CREATE INDEX "idx_promocoes_ativo" ON "public"."promocoes" USING "btree" ("ativo");



CREATE INDEX "idx_promocoes_datas" ON "public"."promocoes" USING "btree" ("data_inicio", "data_fim");



CREATE INDEX "idx_promocoes_empresa_id" ON "public"."promocoes" USING "btree" ("empresa_id");



CREATE INDEX "idx_promocoes_tipo" ON "public"."promocoes" USING "btree" ("tipo_promocao");



CREATE INDEX "idx_promocoes_veiculo_loja_id" ON "public"."promocoes" USING "btree" ("veiculo_loja_id");



CREATE INDEX "idx_promocoes_vigentes" ON "public"."promocoes" USING "btree" ("data_inicio", "data_fim", "ativo") WHERE ("ativo" = true);



CREATE INDEX "idx_repetidos_empresa_id" ON "public"."repetidos" USING "btree" ("empresa_id");



CREATE INDEX "idx_repetidos_modelo_id" ON "public"."repetidos" USING "btree" ("modelo_id");



CREATE INDEX "idx_veiculos_empresa_id" ON "public"."veiculos" USING "btree" ("empresa_id");



CREATE INDEX "idx_veiculos_estado_venda" ON "public"."veiculos" USING "btree" ("estado_venda");



CREATE INDEX "idx_veiculos_loja_empresa_id" ON "public"."veiculos_loja" USING "btree" ("empresa_id");



CREATE INDEX "idx_veiculos_loja_loja_id" ON "public"."veiculos_loja" USING "btree" ("loja_id");



CREATE INDEX "idx_veiculos_loja_veiculo_id" ON "public"."veiculos_loja" USING "btree" ("veiculo_id");



CREATE INDEX "idx_veiculos_modelo_id" ON "public"."veiculos" USING "btree" ("modelo_id");



CREATE INDEX "idx_veiculos_placa" ON "public"."veiculos" USING "btree" ("placa");



CREATE INDEX "idx_vendas_cliente_cpf" ON "public"."vendas" USING "btree" ("cliente_cpf_cnpj");



CREATE INDEX "idx_vendas_data_venda" ON "public"."vendas" USING "btree" ("data_venda");



CREATE INDEX "idx_vendas_empresa_id" ON "public"."vendas" USING "btree" ("empresa_id");



CREATE INDEX "idx_vendas_forma_pagamento" ON "public"."vendas" USING "btree" ("forma_pagamento");



CREATE INDEX "idx_vendas_loja_id" ON "public"."vendas" USING "btree" ("loja_id");



CREATE INDEX "idx_vendas_status" ON "public"."vendas" USING "btree" ("status_venda");



CREATE INDEX "idx_vendas_veiculo_id" ON "public"."vendas" USING "btree" ("veiculo_id");



CREATE INDEX "idx_vendas_vendedor_id" ON "public"."vendas" USING "btree" ("vendedor_id");



CREATE UNIQUE INDEX "uq_foto_capa_unica" ON "public"."fotos_metadados" USING "btree" ("empresa_id", "veiculo_id", "loja_id") WHERE "e_capa";



CREATE UNIQUE INDEX "uq_foto_path_por_grupo" ON "public"."fotos_metadados" USING "btree" ("empresa_id", "veiculo_id", "loja_id", "path");



CREATE OR REPLACE TRIGGER "update_notificacoes_tokens_updated_at" BEFORE UPDATE ON "public"."notificacoes_tokens" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_notificacoes_updated_at" BEFORE UPDATE ON "public"."notificacoes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "veiculos_audit_trig" AFTER INSERT OR DELETE OR UPDATE ON "public"."veiculos" FOR EACH ROW EXECUTE FUNCTION "public"."veiculos_audit_trigger"();



CREATE OR REPLACE TRIGGER "veiculos_loja_audit_trig" AFTER INSERT OR DELETE OR UPDATE ON "public"."veiculos_loja" FOR EACH ROW EXECUTE FUNCTION "public"."veiculos_loja_audit_trigger"();



ALTER TABLE ONLY "public"."anuncios"
    ADD CONSTRAINT "anuncios_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id");



ALTER TABLE ONLY "public"."anuncios"
    ADD CONSTRAINT "anuncios_loja_id_fkey" FOREIGN KEY ("loja_id") REFERENCES "public"."lojas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."anuncios"
    ADD CONSTRAINT "anuncios_plataforma_id_fkey" FOREIGN KEY ("plataforma_id") REFERENCES "public"."plataformas"("id");



ALTER TABLE ONLY "public"."caracteristicas"
    ADD CONSTRAINT "caracteristicas_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id");



ALTER TABLE ONLY "public"."caracteristicas_repetidos"
    ADD CONSTRAINT "caracteristicas_repetidos_caracteristica_id_fkey" FOREIGN KEY ("caracteristica_id") REFERENCES "public"."caracteristicas"("id");



ALTER TABLE ONLY "public"."caracteristicas_repetidos"
    ADD CONSTRAINT "caracteristicas_repetidos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id");



ALTER TABLE ONLY "public"."caracteristicas_repetidos"
    ADD CONSTRAINT "caracteristicas_repetidos_repetido_id_fkey" FOREIGN KEY ("repetido_id") REFERENCES "public"."repetidos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."caracteristicas_veiculos"
    ADD CONSTRAINT "caracteristicas_veiculos_caracteristica_id_fkey" FOREIGN KEY ("caracteristica_id") REFERENCES "public"."caracteristicas"("id");



ALTER TABLE ONLY "public"."caracteristicas_veiculos"
    ADD CONSTRAINT "caracteristicas_veiculos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id");



ALTER TABLE ONLY "public"."caracteristicas_veiculos"
    ADD CONSTRAINT "caracteristicas_veiculos_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "public"."veiculos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."convites_empresa"
    ADD CONSTRAINT "convites_empresa_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id");



ALTER TABLE ONLY "public"."documentacao_veiculos"
    ADD CONSTRAINT "documentacao_veiculos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id");



ALTER TABLE ONLY "public"."documentacao_veiculos"
    ADD CONSTRAINT "documentacao_veiculos_loja_id_fkey" FOREIGN KEY ("loja_id") REFERENCES "public"."lojas"("id");



ALTER TABLE ONLY "public"."documentacao_veiculos"
    ADD CONSTRAINT "documentacao_veiculos_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "public"."veiculos"("id");



ALTER TABLE ONLY "public"."fotos_metadados"
    ADD CONSTRAINT "fotos_veiculo_por_loja_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id");



ALTER TABLE ONLY "public"."fotos_metadados"
    ADD CONSTRAINT "fotos_veiculo_por_loja_loja_id_fkey" FOREIGN KEY ("loja_id") REFERENCES "public"."lojas"("id");



ALTER TABLE ONLY "public"."fotos_metadados"
    ADD CONSTRAINT "fotos_veiculo_por_loja_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "public"."veiculos"("id");



ALTER TABLE ONLY "public"."locais"
    ADD CONSTRAINT "locais_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id");



ALTER TABLE ONLY "public"."lojas"
    ADD CONSTRAINT "lojas_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id");



ALTER TABLE ONLY "public"."membros_empresa"
    ADD CONSTRAINT "membros_empresa_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id");



ALTER TABLE ONLY "public"."modelos"
    ADD CONSTRAINT "modelos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id");



ALTER TABLE ONLY "public"."notificacoes_tokens"
    ADD CONSTRAINT "notificacoes_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notificacoes"
    ADD CONSTRAINT "notificacoes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."permissoes_papel"
    ADD CONSTRAINT "permissoes_empresa_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."plataformas"
    ADD CONSTRAINT "plataformas_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id");



ALTER TABLE ONLY "public"."promocoes"
    ADD CONSTRAINT "promocoes_anuncio_id_fkey" FOREIGN KEY ("anuncio_id") REFERENCES "public"."anuncios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."promocoes"
    ADD CONSTRAINT "promocoes_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id");



ALTER TABLE ONLY "public"."promocoes"
    ADD CONSTRAINT "promocoes_veiculo_loja_id_fkey" FOREIGN KEY ("veiculo_loja_id") REFERENCES "public"."veiculos_loja"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."repetidos"
    ADD CONSTRAINT "repetidos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id");



ALTER TABLE ONLY "public"."repetidos"
    ADD CONSTRAINT "repetidos_modelo_id_fkey" FOREIGN KEY ("modelo_id") REFERENCES "public"."modelos"("id");



ALTER TABLE ONLY "public"."tem_fotos"
    ADD CONSTRAINT "tem_fotos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id");



ALTER TABLE ONLY "public"."tem_fotos"
    ADD CONSTRAINT "tem_fotos_loja_id_fkey" FOREIGN KEY ("loja_id") REFERENCES "public"."lojas"("id");



ALTER TABLE ONLY "public"."tem_fotos"
    ADD CONSTRAINT "tem_fotos_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "public"."veiculos"("id");



ALTER TABLE ONLY "public"."unidades_loja"
    ADD CONSTRAINT "unidades_loja_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id");



ALTER TABLE ONLY "public"."unidades_loja"
    ADD CONSTRAINT "unidades_loja_loja_id_fkey" FOREIGN KEY ("loja_id") REFERENCES "public"."lojas"("id");



ALTER TABLE ONLY "public"."veiculos"
    ADD CONSTRAINT "veiculos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id");



ALTER TABLE ONLY "public"."veiculos_loja"
    ADD CONSTRAINT "veiculos_loja_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id");



ALTER TABLE ONLY "public"."veiculos_loja"
    ADD CONSTRAINT "veiculos_loja_loja_id_fkey" FOREIGN KEY ("loja_id") REFERENCES "public"."lojas"("id");



ALTER TABLE ONLY "public"."veiculos_loja"
    ADD CONSTRAINT "veiculos_loja_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "public"."veiculos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."veiculos"
    ADD CONSTRAINT "veiculos_modelo_id_fkey" FOREIGN KEY ("modelo_id") REFERENCES "public"."modelos"("id");



ALTER TABLE ONLY "public"."veiculos_repetidos"
    ADD CONSTRAINT "veiculos_repetidos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id");



ALTER TABLE ONLY "public"."veiculos_repetidos"
    ADD CONSTRAINT "veiculos_repetidos_repetido_id_fkey" FOREIGN KEY ("repetido_id") REFERENCES "public"."repetidos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."veiculos_repetidos"
    ADD CONSTRAINT "veiculos_repetidos_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "public"."veiculos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vendas"
    ADD CONSTRAINT "vendas_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id");



ALTER TABLE ONLY "public"."vendas"
    ADD CONSTRAINT "vendas_loja_id_fkey" FOREIGN KEY ("loja_id") REFERENCES "public"."lojas"("id");



ALTER TABLE ONLY "public"."vendas"
    ADD CONSTRAINT "vendas_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "public"."veiculos"("id");



CREATE POLICY "Service role can insert notifications" ON "public"."notificacoes" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can manage
   their own tokens" ON "public"."notificacoes_tokens" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read their own notifications" ON "public"."notificacoes" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own notifications" ON "public"."notificacoes" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "admins_can_manage_memberships" ON "public"."membros_empresa" TO "authenticated" USING ("public"."user_is_admin"("auth"."uid"())) WITH CHECK ("public"."user_is_admin"("auth"."uid"()));



CREATE POLICY "admins_can_manage_roles" ON "public"."user_roles" TO "authenticated" USING ("public"."user_is_admin"("auth"."uid"())) WITH CHECK ("public"."user_is_admin"("auth"."uid"()));



ALTER TABLE "public"."anuncios" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "anuncios_select_policy" ON "public"."anuncios" FOR SELECT TO "authenticated" USING ("public"."empresa_do_usuario"("empresa_id"));



ALTER TABLE "public"."caracteristicas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."caracteristicas_repetidos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "caracteristicas_repetidos_select_policy" ON "public"."caracteristicas_repetidos" FOR SELECT TO "authenticated" USING ("public"."empresa_do_usuario"("empresa_id"));



CREATE POLICY "caracteristicas_select_policy" ON "public"."caracteristicas" FOR SELECT TO "authenticated" USING ("public"."empresa_do_usuario"("empresa_id"));



ALTER TABLE "public"."caracteristicas_veiculos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "caracteristicas_veiculos_select_policy" ON "public"."caracteristicas_veiculos" FOR SELECT TO "authenticated" USING ("public"."empresa_do_usuario"("empresa_id"));



ALTER TABLE "public"."convites_empresa" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "convites_select_policy" ON "public"."convites_empresa" FOR SELECT TO "authenticated" USING ((("usuario_convidado_id" = "auth"."uid"()) OR "public"."empresa_do_usuario"("empresa_id")));



ALTER TABLE "public"."documentacao_veiculos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "documentacao_veiculos_select_policy" ON "public"."documentacao_veiculos" FOR SELECT TO "authenticated" USING ("public"."empresa_do_usuario"("empresa_id"));



ALTER TABLE "public"."empresas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "empresas_insert_policy" ON "public"."empresas" FOR INSERT TO "authenticated" WITH CHECK ("public"."user_is_admin"("auth"."uid"()));



CREATE POLICY "empresas_select_policy" ON "public"."empresas" FOR SELECT TO "authenticated" USING ("public"."empresa_do_usuario"("id"));



CREATE POLICY "empresas_update_policy" ON "public"."empresas" FOR UPDATE TO "authenticated" USING (("public"."user_has_role"("auth"."uid"(), 'admin'::"public"."app_role", "id") OR "public"."user_has_role"("auth"."uid"(), 'proprietario'::"public"."app_role", "id"))) WITH CHECK (("public"."user_has_role"("auth"."uid"(), 'admin'::"public"."app_role", "id") OR "public"."user_has_role"("auth"."uid"(), 'proprietario'::"public"."app_role", "id")));



ALTER TABLE "public"."fotos_metadados" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "fotos_veiculo_por_loja_select_policy" ON "public"."fotos_metadados" FOR SELECT TO "authenticated" USING ("public"."empresa_do_usuario"("empresa_id"));



ALTER TABLE "public"."locais" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "locais_select_policy" ON "public"."locais" FOR SELECT TO "authenticated" USING ("public"."empresa_do_usuario"("empresa_id"));



ALTER TABLE "public"."lojas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "lojas_delete_policy" ON "public"."lojas" FOR DELETE TO "authenticated" USING (("public"."empresa_do_usuario"("empresa_id") AND ("public"."user_has_role"("auth"."uid"(), 'admin'::"public"."app_role", "empresa_id") OR "public"."user_has_role"("auth"."uid"(), 'proprietario'::"public"."app_role", "empresa_id"))));



CREATE POLICY "lojas_insert_policy" ON "public"."lojas" FOR INSERT TO "authenticated" WITH CHECK (("public"."empresa_do_usuario"("empresa_id") AND ("public"."user_has_role"("auth"."uid"(), 'admin'::"public"."app_role", "empresa_id") OR "public"."user_has_role"("auth"."uid"(), 'proprietario'::"public"."app_role", "empresa_id") OR "public"."user_has_role"("auth"."uid"(), 'gerente'::"public"."app_role", "empresa_id"))));



CREATE POLICY "lojas_select_policy" ON "public"."lojas" FOR SELECT TO "authenticated" USING ("public"."empresa_do_usuario"("empresa_id"));



CREATE POLICY "lojas_update_policy" ON "public"."lojas" FOR UPDATE TO "authenticated" USING ("public"."empresa_do_usuario"("empresa_id")) WITH CHECK (("public"."empresa_do_usuario"("empresa_id") AND ("public"."user_has_role"("auth"."uid"(), 'admin'::"public"."app_role", "empresa_id") OR "public"."user_has_role"("auth"."uid"(), 'proprietario'::"public"."app_role", "empresa_id") OR "public"."user_has_role"("auth"."uid"(), 'gerente'::"public"."app_role", "empresa_id"))));



ALTER TABLE "public"."membros_empresa" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "membros_select_policy" ON "public"."membros_empresa" FOR SELECT TO "authenticated" USING (("usuario_id" = "auth"."uid"()));



ALTER TABLE "public"."modelos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "modelos_select_policy" ON "public"."modelos" FOR SELECT TO "authenticated" USING ("public"."empresa_do_usuario"("empresa_id"));



ALTER TABLE "public"."notificacoes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notificacoes_tokens" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "permissoes_empresa_select_policy" ON "public"."permissoes_papel" FOR SELECT TO "authenticated" USING ((("empresa_id" IS NULL) OR "public"."empresa_do_usuario"("empresa_id")));



ALTER TABLE "public"."permissoes_papel" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plataformas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "plataformas_select_policy" ON "public"."plataformas" FOR SELECT TO "authenticated" USING ("public"."empresa_do_usuario"("empresa_id"));



ALTER TABLE "public"."promocoes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "promocoes_select_policy" ON "public"."promocoes" FOR SELECT TO "authenticated" USING ("public"."empresa_do_usuario"("empresa_id"));



CREATE POLICY "read same company" ON "public"."tem_fotos" FOR SELECT TO "authenticated" USING (("empresa_id" = "public"."empresa_do_usuario"()));



ALTER TABLE "public"."repetidos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "repetidos_select_policy" ON "public"."repetidos" FOR SELECT TO "authenticated" USING ("public"."empresa_do_usuario"("empresa_id"));



CREATE POLICY "select bao" ON "public"."unidades_loja" FOR SELECT TO "authenticated" USING ("public"."empresa_do_usuario"("empresa_id"));



ALTER TABLE "public"."tem_fotos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."unidades_loja" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_can_view_their_memberships" ON "public"."membros_empresa" FOR SELECT TO "authenticated" USING (("usuario_id" = "auth"."uid"()));



CREATE POLICY "users_can_view_their_roles" ON "public"."user_roles" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."veiculos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."veiculos_audit" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "veiculos_delete_policy" ON "public"."veiculos" FOR DELETE TO "authenticated" USING (("public"."empresa_do_usuario"("empresa_id") AND ("public"."user_has_role"("auth"."uid"(), 'admin'::"public"."app_role", "empresa_id") OR "public"."user_has_role"("auth"."uid"(), 'proprietario'::"public"."app_role", "empresa_id") OR "public"."user_has_role"("auth"."uid"(), 'gerente'::"public"."app_role", "empresa_id"))));



CREATE POLICY "veiculos_insert_policy" ON "public"."veiculos" FOR INSERT TO "authenticated" WITH CHECK ("public"."empresa_do_usuario"("empresa_id"));



ALTER TABLE "public"."veiculos_loja" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."veiculos_loja_audit" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "veiculos_loja_delete_policy" ON "public"."veiculos_loja" FOR DELETE TO "authenticated" USING ("public"."empresa_do_usuario"("empresa_id"));



CREATE POLICY "veiculos_loja_insert_policy" ON "public"."veiculos_loja" FOR INSERT TO "authenticated" WITH CHECK ("public"."empresa_do_usuario"("empresa_id"));



CREATE POLICY "veiculos_loja_select_policy" ON "public"."veiculos_loja" FOR SELECT TO "authenticated" USING ("public"."empresa_do_usuario"("empresa_id"));



CREATE POLICY "veiculos_loja_update_policy" ON "public"."veiculos_loja" FOR UPDATE TO "authenticated" USING ("public"."empresa_do_usuario"("empresa_id")) WITH CHECK ("public"."empresa_do_usuario"("empresa_id"));



ALTER TABLE "public"."veiculos_repetidos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "veiculos_repetidos_select_policy" ON "public"."veiculos_repetidos" FOR SELECT TO "authenticated" USING ("public"."empresa_do_usuario"("empresa_id"));



CREATE POLICY "veiculos_select_policy" ON "public"."veiculos" FOR SELECT TO "authenticated" USING ("public"."empresa_do_usuario"("empresa_id"));



CREATE POLICY "veiculos_update_policy" ON "public"."veiculos" FOR UPDATE TO "authenticated" USING ("public"."empresa_do_usuario"("empresa_id")) WITH CHECK ("public"."empresa_do_usuario"("empresa_id"));



ALTER TABLE "public"."vendas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "vendas_select_policy" ON "public"."vendas" FOR SELECT TO "authenticated" USING ("public"."empresa_do_usuario"("empresa_id"));



CREATE POLICY "write same company" ON "public"."fotos_metadados" TO "authenticated" USING (("empresa_id" = "public"."empresa_do_usuario"())) WITH CHECK (("empresa_id" = "public"."empresa_do_usuario"()));



CREATE POLICY "write same company" ON "public"."tem_fotos" TO "authenticated" USING (("empresa_id" = "public"."empresa_do_usuario"())) WITH CHECK (("empresa_id" = "public"."empresa_do_usuario"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT ALL ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "rpc_executor";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "cli_user";

























































































































































REVOKE ALL ON FUNCTION "public"."convidar_membro"("p_empresa_id" "uuid", "p_usuario_convidado_id" "uuid", "p_papel" "public"."papel_usuario_empresa", "p_convidado_por" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."convidar_membro"("p_empresa_id" "uuid", "p_usuario_convidado_id" "uuid", "p_papel" "public"."papel_usuario_empresa", "p_convidado_por" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."convidar_membro"("p_empresa_id" "uuid", "p_usuario_convidado_id" "uuid", "p_papel" "public"."papel_usuario_empresa", "p_convidado_por" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."criar_empresa"("p_nome" "text", "p_dominio" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."criar_empresa"("p_nome" "text", "p_dominio" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."criar_empresa"("p_nome" "text", "p_dominio" "text") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."empresa_do_usuario"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."empresa_do_usuario"() TO "service_role";
GRANT ALL ON FUNCTION "public"."empresa_do_usuario"() TO "authenticated";



REVOKE ALL ON FUNCTION "public"."empresa_do_usuario"("p_empresa_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."empresa_do_usuario"("p_empresa_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."empresa_do_usuario"("p_empresa_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."executor"("p_operacao" "text", "p_payload" json) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."executor"("p_operacao" "text", "p_payload" json) TO "service_role";
GRANT ALL ON FUNCTION "public"."executor"("p_operacao" "text", "p_payload" json) TO "authenticated";



GRANT ALL ON FUNCTION "public"."fotos_gerenciar"("p_operacao" "text", "p_empresa_id" "uuid", "p_veiculo_id" "uuid", "p_loja_id" "uuid", "p_payload" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."gerenciar_anuncios"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados" json, "p_anuncio_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."gerenciar_anuncios"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados" json, "p_anuncio_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."gerenciar_anuncios"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados" json, "p_anuncio_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."gerenciar_documentacao"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados" json, "p_veiculo_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."gerenciar_documentacao"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados" json, "p_veiculo_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."gerenciar_documentacao"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados" json, "p_veiculo_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."gerenciar_empresa"("p_operacao" character varying, "p_dados" json, "p_empresa_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."gerenciar_empresa"("p_operacao" character varying, "p_dados" json, "p_empresa_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."gerenciar_empresa"("p_operacao" character varying, "p_dados" json, "p_empresa_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."gerenciar_membros"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados_membro" json, "p_usuario_alvo" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."gerenciar_membros"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados_membro" json, "p_usuario_alvo" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."gerenciar_membros"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados_membro" json, "p_usuario_alvo" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."gerenciar_promocoes"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados" json, "p_promocao_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."gerenciar_promocoes"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados" json, "p_promocao_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."gerenciar_promocoes"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados" json, "p_promocao_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."gerenciar_repetidos"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados" json, "p_repetido_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."gerenciar_repetidos"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados" json, "p_repetido_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."gerenciar_repetidos"("p_empresa_id" "uuid", "p_operacao" character varying, "p_dados" json, "p_repetido_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."limpar_notificacoes_antigas"() TO "service_role";



GRANT ALL ON FUNCTION "public"."listar_usuarios"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rpc_atualizar_status_venda"("p_venda_id" "uuid", "p_status" "public"."status_venda", "p_data_entrega" timestamp with time zone, "p_observacoes" "text", "p_usuario_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."rpc_atualizar_status_venda"("p_venda_id" "uuid", "p_status" "public"."status_venda", "p_data_entrega" timestamp with time zone, "p_observacoes" "text", "p_usuario_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."rpc_configuracoes"("p_payload" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."rpc_configuracoes"("p_payload" "jsonb") TO "authenticated";



GRANT ALL ON FUNCTION "public"."rpc_registrar_venda"("p_empresa_id" "uuid", "p_venda" "jsonb", "p_usuario_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."rpc_registrar_venda"("p_empresa_id" "uuid", "p_venda" "jsonb", "p_usuario_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."rpc_veiculos"("p_payload" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."rpc_vendas"("p_payload" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."rpc_vendas"("p_payload" "jsonb") TO "authenticated";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_has_role"("_user_id" "uuid", "_role" "public"."app_role", "_empresa_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."user_is_admin"("_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."veiculos_audit_trigger"() TO "service_role";



GRANT ALL ON FUNCTION "public"."veiculos_loja_audit_trigger"() TO "service_role";


















GRANT ALL ON TABLE "public"."anuncios" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."anuncios" TO "rpc_executor";
GRANT SELECT ON TABLE "public"."anuncios" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."anuncios" TO "cli_user";



GRANT ALL ON TABLE "public"."caracteristicas" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."caracteristicas" TO "rpc_executor";
GRANT SELECT ON TABLE "public"."caracteristicas" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."caracteristicas" TO "cli_user";



GRANT ALL ON TABLE "public"."caracteristicas_repetidos" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."caracteristicas_repetidos" TO "rpc_executor";
GRANT SELECT ON TABLE "public"."caracteristicas_repetidos" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."caracteristicas_repetidos" TO "cli_user";



GRANT ALL ON TABLE "public"."caracteristicas_veiculos" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."caracteristicas_veiculos" TO "rpc_executor";
GRANT SELECT ON TABLE "public"."caracteristicas_veiculos" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."caracteristicas_veiculos" TO "cli_user";



GRANT ALL ON TABLE "public"."convites_empresa" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."convites_empresa" TO "rpc_executor";
GRANT SELECT ON TABLE "public"."convites_empresa" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."convites_empresa" TO "cli_user";



GRANT ALL ON TABLE "public"."documentacao_veiculos" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."documentacao_veiculos" TO "rpc_executor";
GRANT SELECT ON TABLE "public"."documentacao_veiculos" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."documentacao_veiculos" TO "cli_user";



GRANT ALL ON TABLE "public"."empresas" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."empresas" TO "rpc_executor";
GRANT SELECT ON TABLE "public"."empresas" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."empresas" TO "cli_user";



GRANT ALL ON TABLE "public"."fotos_metadados" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."fotos_metadados" TO "rpc_executor";
GRANT SELECT ON TABLE "public"."fotos_metadados" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."fotos_metadados" TO "cli_user";



GRANT ALL ON TABLE "public"."locais" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."locais" TO "rpc_executor";
GRANT SELECT ON TABLE "public"."locais" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."locais" TO "cli_user";



GRANT ALL ON TABLE "public"."lojas" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."lojas" TO "rpc_executor";
GRANT SELECT ON TABLE "public"."lojas" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."lojas" TO "cli_user";



GRANT ALL ON TABLE "public"."membros_empresa" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."membros_empresa" TO "rpc_executor";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."membros_empresa" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."membros_empresa" TO "cli_user";



GRANT ALL ON TABLE "public"."modelos" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."modelos" TO "rpc_executor";
GRANT SELECT ON TABLE "public"."modelos" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."modelos" TO "cli_user";



GRANT SELECT ON TABLE "public"."notificacoes" TO "anon";
GRANT SELECT ON TABLE "public"."notificacoes" TO "authenticated";
GRANT ALL ON TABLE "public"."notificacoes" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."notificacoes" TO "cli_user";



GRANT SELECT ON TABLE "public"."notificacoes_nao_lidas_count" TO "anon";
GRANT SELECT ON TABLE "public"."notificacoes_nao_lidas_count" TO "authenticated";
GRANT ALL ON TABLE "public"."notificacoes_nao_lidas_count" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."notificacoes_nao_lidas_count" TO "cli_user";



GRANT SELECT ON TABLE "public"."notificacoes_tokens" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."notificacoes_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."notificacoes_tokens" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."notificacoes_tokens" TO "cli_user";



GRANT ALL ON TABLE "public"."permissoes_papel" TO "service_role";
GRANT SELECT ON TABLE "public"."permissoes_papel" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."permissoes_papel" TO "cli_user";



GRANT ALL ON TABLE "public"."plataformas" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."plataformas" TO "rpc_executor";
GRANT SELECT ON TABLE "public"."plataformas" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."plataformas" TO "cli_user";



GRANT ALL ON TABLE "public"."promocoes" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."promocoes" TO "rpc_executor";
GRANT SELECT ON TABLE "public"."promocoes" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."promocoes" TO "cli_user";



GRANT ALL ON TABLE "public"."repetidos" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."repetidos" TO "rpc_executor";
GRANT SELECT ON TABLE "public"."repetidos" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."repetidos" TO "cli_user";



GRANT ALL ON TABLE "public"."tem_fotos" TO "service_role";
GRANT SELECT ON TABLE "public"."tem_fotos" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."tem_fotos" TO "cli_user";



GRANT SELECT ON TABLE "public"."unidades_loja" TO "anon";
GRANT SELECT ON TABLE "public"."unidades_loja" TO "authenticated";
GRANT ALL ON TABLE "public"."unidades_loja" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."unidades_loja" TO "cli_user";



GRANT SELECT ON TABLE "public"."user_roles" TO "anon";
GRANT SELECT ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."user_roles" TO "cli_user";



GRANT ALL ON TABLE "public"."veiculos" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."veiculos" TO "rpc_executor";
GRANT SELECT ON TABLE "public"."veiculos" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."veiculos" TO "cli_user";



GRANT SELECT ON TABLE "public"."veiculos_audit" TO "anon";
GRANT SELECT ON TABLE "public"."veiculos_audit" TO "authenticated";
GRANT ALL ON TABLE "public"."veiculos_audit" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."veiculos_audit" TO "cli_user";



GRANT ALL ON TABLE "public"."veiculos_loja" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."veiculos_loja" TO "rpc_executor";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."veiculos_loja" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."veiculos_loja" TO "cli_user";



GRANT SELECT ON TABLE "public"."veiculos_loja_audit" TO "anon";
GRANT SELECT ON TABLE "public"."veiculos_loja_audit" TO "authenticated";
GRANT ALL ON TABLE "public"."veiculos_loja_audit" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."veiculos_loja_audit" TO "cli_user";



GRANT ALL ON TABLE "public"."veiculos_repetidos" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."veiculos_repetidos" TO "rpc_executor";
GRANT SELECT ON TABLE "public"."veiculos_repetidos" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."veiculos_repetidos" TO "cli_user";



GRANT ALL ON TABLE "public"."vendas" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."vendas" TO "rpc_executor";
GRANT SELECT ON TABLE "public"."vendas" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."vendas" TO "cli_user";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO "cli_user";































RESET ALL;
