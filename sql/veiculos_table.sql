create table public.veiculos (
  id uuid not null default gen_random_uuid (),
  empresa_id uuid not null,
  modelo_id uuid null,
  local_id uuid null,
  placa character varying not null,
  cor character varying null,
  hodometro integer not null,
  ano_fabricacao integer null,
  ano_modelo integer null,
  chassi character varying null,
  estado_veiculo public.estado_veiculo null,
  estado_venda public.estado_venda not null,
  preco_venal numeric(10, 2) null,
  estagio_documentacao character varying null,
  observacao text null,
  registrado_em timestamp with time zone not null default now(),
  registrado_por uuid not null default auth.uid (),
  editado_em timestamp with time zone not null default now(),
  editado_por uuid not null default auth.uid (),
  constraint veiculos_pkey primary key (id),
  constraint veiculos_chassi_key unique (chassi),
  constraint veiculos_placa_key unique (placa),
  constraint veiculos_modelo_id_fkey foreign key (modelo_id) references modelos (id),
  constraint veiculos_empresa_id_fkey foreign key (empresa_id) references empresas (id),
  constraint veiculos_preco_venal_check check ((preco_venal >= 0::numeric)),
  constraint veiculos_ano_modelo_check check ((ano_modelo >= 1900) and ((ano_modelo)::numeric <= (extract(year from now()) + 2)::numeric)),
  constraint veiculos_check check ((ano_modelo is null) or (ano_fabricacao is null) or (ano_modelo >= ano_fabricacao)),
  constraint veiculos_hodometro_check check ((hodometro >= 0)),
  constraint veiculos_ano_fabricacao_check check ((ano_fabricacao >= 1900) and ((ano_fabricacao)::numeric <= (extract(year from now()) + 2)::numeric))
) TABLESPACE pg_default;

create index IF not exists idx_veiculos_empresa_id on public.veiculos using btree (empresa_id) TABLESPACE pg_default;

create index IF not exists idx_veiculos_modelo_id on public.veiculos using btree (modelo_id) TABLESPACE pg_default;

create index IF not exists idx_veiculos_estado_venda on public.veiculos using btree (estado_venda) TABLESPACE pg_default;

create index IF not exists idx_veiculos_placa on public.veiculos using btree (placa) TABLESPACE pg_default;

create trigger veiculos_audit_trig
  after INSERT
  or DELETE
  or UPDATE on public.veiculos
  for each row
  execute function public.veiculos_audit_trigger ();
