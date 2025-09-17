-- Script de funções de negócio e objetos auxiliares necessários para
-- suportar os fluxos portados de rn-gestor-auto no front-end web.
-- As funções são idempotentes (CREATE OR REPLACE) para facilitar ajustes
-- iterativos durante a migração.

set search_path to public;

-- 1. Provisionamento de empresa multi-tenant ---------------------------------
create or replace function public.criar_empresa(
  p_nome text,
  p_dominio text default null,
  p_usuario_proprietario_id uuid
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_empresa_id uuid := gen_random_uuid();
  v_loja_id uuid := gen_random_uuid();
  v_result jsonb;
begin
  insert into public.empresas (id, nome, dominio, criado_em, ativo)
  values (v_empresa_id, trim(p_nome), nullif(p_dominio, ''), now(), true);

  insert into public.lojas (id, empresa_id, nome, criado_em, ativo)
  values (v_loja_id, v_empresa_id, 'Loja principal', now(), true);

  insert into public.membros_empresa (empresa_id, usuario_id, papel, ativo, criado_em)
  values (v_empresa_id, p_usuario_proprietario_id, 'proprietario', true, now());

  v_result := jsonb_build_object(
    'empresa_id', v_empresa_id,
    'loja_principal_id', v_loja_id
  );

  return v_result;
end;
$$;

-- 2. Gestão de convites e membros -------------------------------------------
create or replace function public.gerenciar_membros(
  p_empresa_id uuid,
  p_operacao text,
  p_dados_membro jsonb
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_token text := nullif(p_dados_membro->> 'token', '');
  v_email text := trim(p_dados_membro->> 'email');
  v_papel public.papel_usuario_empresa := coalesce(
    (p_dados_membro->> 'papel')::public.papel_usuario_empresa,
    'colaborador'
  );
  v_convidado uuid := nullif(p_dados_membro->> 'usuario_id', '')::uuid;
  v_convite record;
  v_result jsonb := jsonb_build_object('status', 'ok');
begin
  if p_operacao = 'criar_convite' then
    insert into public.convites_empresa (
      empresa_id,
      usuario_convidado_id,
      convidado_por_usuario_id,
      expira_em,
      status
    )
    values (
      p_empresa_id,
      v_convidado,
      nullif(p_dados_membro->> 'convidado_por', '')::uuid,
      now() + interval '7 days',
      'pendente'
    )
    returning * into v_convite;

    return v_result || jsonb_build_object('convite_id', v_convite.id);
  elsif p_operacao = 'aceitar_convite' then
    if v_token is null then
      raise exception 'Token de convite obrigatório';
    end if;

    select *
      into v_convite
      from public.convites_empresa
     where empresa_id = p_empresa_id
       and token = v_token
       and status = any(array['pendente','enviado'])
     for update;

    if not found then
      raise exception 'Convite inválido ou já utilizado';
    end if;

    update public.convites_empresa
       set status = 'consumido', consumido_em = now()
     where id = v_convite.id;

    insert into public.membros_empresa (empresa_id, usuario_id, papel, ativo, criado_em)
    values (p_empresa_id, v_convite.usuario_convidado_id, v_papel, true, now())
    on conflict (empresa_id, usuario_id)
      do update set ativo = true, papel = excluded.papel;

    return v_result || jsonb_build_object('membro_id', v_convite.usuario_convidado_id);
  elsif p_operacao = 'revogar_convite' then
    update public.convites_empresa
       set status = 'revogado', consumido_em = now()
     where empresa_id = p_empresa_id and token = v_token;
    return v_result;
  elsif p_operacao = 'remover_membro' then
    update public.membros_empresa
       set ativo = false
     where empresa_id = p_empresa_id and usuario_id = nullif(p_dados_membro->> 'usuario_id', '')::uuid;
    return v_result;
  end if;

  return v_result;
end;
$$;

-- 3. Operações sobre veículos ------------------------------------------------
create or replace function public.cadastrar_veiculo(
  p_empresa_id uuid,
  p_usuario_id uuid,
  p_dados_veiculo jsonb,
  p_caracteristicas uuid[] default null
) returns public.veiculos
language plpgsql
security definer
as $$
declare
  v_placa text := upper(p_dados_veiculo->> 'placa');
  v_veiculo public.veiculos;
  v_hodometro numeric := coalesce((p_dados_veiculo->> 'hodometro')::numeric, 0);
  v_preco numeric := nullif(p_dados_veiculo->> 'preco_venal', '')::numeric;
begin
  insert into public.veiculos (
    empresa_id,
    placa,
    cor,
    estado_venda,
    hodometro,
    preco_venal,
    estagio_documentacao,
    estado_veiculo,
    modelo_id,
    local_id,
    observacao,
    ano_modelo,
    ano_fabricacao,
    chassi,
    registrado_em,
    registrado_por,
    editado_em,
    editado_por
  )
  values (
    p_empresa_id,
    v_placa,
    coalesce(p_dados_veiculo->> 'cor', 'Indefinido'),
    coalesce((p_dados_veiculo->> 'estado_venda')::public.estado_venda, 'disponivel'),
    v_hodometro,
    v_preco,
    p_dados_veiculo->> 'estagio_documentacao',
    (p_dados_veiculo->> 'estado_veiculo')::public.estado_veiculo,
    nullif(p_dados_veiculo->> 'modelo_id', '')::uuid,
    nullif(p_dados_veiculo->> 'local_id', '')::uuid,
    nullif(p_dados_veiculo->> 'observacao', ''),
    nullif(p_dados_veiculo->> 'ano_modelo', '')::integer,
    nullif(p_dados_veiculo->> 'ano_fabricacao', '')::integer,
    nullif(p_dados_veiculo->> 'chassi', ''),
    now(),
    coalesce(p_usuario_id::text, current_setting('request.jwt.claim.sub', true)),
    now(),
    coalesce(p_usuario_id::text, current_setting('request.jwt.claim.sub', true))
  )
  returning * into v_veiculo;

  if p_caracteristicas is not null then
    insert into public.caracteristicas_veiculos (empresa_id, veiculo_id, caracteristica_id)
    select p_empresa_id, v_veiculo.id, unnest(p_caracteristicas);
  end if;

  return v_veiculo;
end;
$$;

create or replace function public.atualizar_veiculo(
  p_empresa_id uuid,
  p_usuario_id uuid,
  p_veiculo_id uuid,
  p_dados_atualizacao jsonb
) returns public.veiculos
language plpgsql
security definer
as $$
declare
  v_atualizado public.veiculos;
begin
  update public.veiculos
     set cor = coalesce(p_dados_atualizacao->> 'cor', cor),
         estado_venda = coalesce((p_dados_atualizacao->> 'estado_venda')::public.estado_venda, estado_venda),
         estado_veiculo = coalesce((p_dados_atualizacao->> 'estado_veiculo')::public.estado_veiculo, estado_veiculo),
         hodometro = coalesce((p_dados_atualizacao->> 'hodometro')::numeric, hodometro),
         preco_venal = coalesce((p_dados_atualizacao->> 'preco_venal')::numeric, preco_venal),
         observacao = coalesce(p_dados_atualizacao->> 'observacao', observacao),
         local_id = coalesce(nullif(p_dados_atualizacao->> 'local_id', '')::uuid, local_id),
         modelo_id = coalesce(nullif(p_dados_atualizacao->> 'modelo_id', '')::uuid, modelo_id),
         editado_em = now(),
         editado_por = coalesce(p_usuario_id::text, editado_por)
   where id = p_veiculo_id and empresa_id = p_empresa_id
  returning * into v_atualizado;

  if not found then
    raise exception 'Veículo % não encontrado para a empresa informada', p_veiculo_id;
  end if;

  return v_atualizado;
end;
$$;

create or replace function public.gerenciar_veiculos(
  p_empresa_id uuid,
  p_operacao text,
  p_veiculo_id uuid,
  p_dados_veiculo jsonb default null
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_result jsonb := jsonb_build_object('status', 'ok');
  v_motivo text := p_dados_veiculo->> 'motivo';
begin
  if p_operacao = 'remover' then
    delete from public.veiculos
     where id = p_veiculo_id
       and empresa_id = p_empresa_id;
    return v_result || jsonb_build_object('removido', true);
  elsif p_operacao = 'arquivar' then
    update public.veiculos
       set estado_venda = 'arquivado'
     where id = p_veiculo_id and empresa_id = p_empresa_id;
    return v_result || jsonb_build_object('arquivado', true);
  end if;

  return v_result;
end;
$$;

-- 4. Relatórios auxiliares ---------------------------------------------------
create or replace function public.obter_veiculos_ociosos(
  p_empresa_id uuid
) returns table (
  veiculo_id uuid,
  placa text,
  modelo text,
  loja_id uuid,
  dias_sem_anuncio integer,
  estado_venda public.estado_venda
)
language sql
security definer
as $$
  select
    v.id as veiculo_id,
    v.placa,
    coalesce(m.marca || ' ' || m.nome, 'Modelo não informado') as modelo,
    vl.loja_id,
    coalesce(date_part('day', now() - max(a.data_publicacao)), 999)::integer as dias_sem_anuncio,
    v.estado_venda
  from public.veiculos v
  left join public.veiculos_loja vl
    on vl.veiculo_id = v.id and vl.empresa_id = v.empresa_id and vl.data_saida is null
  left join public.anuncios a
    on a.entidade_id = vl.id and a.empresa_id = v.empresa_id and a.status = 'ativo'
  left join public.modelos m
    on m.id = v.modelo_id
  where v.empresa_id = p_empresa_id
  group by v.id, v.placa, modelo, vl.loja_id, v.estado_venda;
$$;

create or replace view public.view_sugestoes_duplicados as
select
  vr.veiculo_id,
  vr.repetido_id,
  vr.empresa_id,
  vr.similaridade_score,
  v.placa as placa_principal,
  v2.placa as placa_repetida,
  v.modelo_id,
  v2.modelo_id as modelo_repetido
from public.veiculos_repetidos vr
join public.veiculos v on v.id = vr.veiculo_id
join public.veiculos v2 on v2.id = vr.repetido_id;

-- 5. Função utilitária: empresa do usuário -----------------------------------
create or replace function public.empresa_do_usuario()
returns uuid
language sql
security definer
set search_path = public
as $$
  select m.empresa_id
    from public.membros_empresa m
   where m.usuario_id = nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
     and coalesce(m.ativo, true)
   order by m.criado_em desc
   limit 1;
$$;

