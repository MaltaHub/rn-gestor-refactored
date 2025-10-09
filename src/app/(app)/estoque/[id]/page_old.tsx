'use client';

import Link from "next/link";
import { useParams } from "next/navigation";

import { useVeiculos } from "@/hooks/use-estoque";
import type { VeiculoResumo } from "@/types/estoque";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
});

function formatCurrency(value?: number | null) {
  if (typeof value !== "number") {
    return "—";
  }

  return currencyFormatter.format(value);
}

function formatNumber(value?: number | null, suffix = "") {
  if (typeof value !== "number") {
    return "—";
  }

  const formatted = value.toLocaleString("pt-BR");
  return suffix ? `${formatted} ${suffix}` : formatted;
}

function formatEnum(value?: string | null) {
  if (!value) {
    return "Não informado";
  }

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return dateFormatter.format(parsed);
}

function formatText(value?: string | null) {
  if (!value) {
    return "—";
  }

  return value;
}

function formatBoolean(value?: boolean | null) {
  if (value == null) {
    return "Não informado";
  }

  return value ? "Sim" : "Não";
}

export default function EstoqueDetalhePage() {
  const params = useParams<{ id: string }>();
  const rawId = params?.id;
  const veiculoId = Array.isArray(rawId) ? rawId[0] : rawId ?? "";

  const {
    data: veiculo,
    isLoading,
  } = useVeiculos(veiculoId as string) as { data: VeiculoResumo | undefined; isLoading: boolean };

  if (!veiculoId) {
    return (
      <div className="bg-white px-6 py-10 text-zinc-900">
        <main className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4">
          <h1 className="text-2xl font-semibold text-zinc-800">
            Veículo inválido
          </h1>
          <p className="text-sm text-zinc-500">
            Não foi possível identificar o veículo solicitado.
          </p>
          <Link className="text-sm font-medium text-blue-600" href="/estoque">
            Voltar ao estoque
          </Link>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white px-6 py-10 text-zinc-900">
        <main className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-3 text-center">
          <p className="text-base font-medium text-zinc-600">
            Carregando informações do veículo...
          </p>
        </main>
      </div>
    );
  }

  if (!veiculo) {
    return (
      <div className="bg-white px-6 py-10 text-zinc-900">
        <main className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4">
          <h1 className="text-2xl font-semibold text-zinc-800">
            Veículo não encontrado
          </h1>
          <p className="text-sm text-zinc-500">
            O veículo solicitado não está disponível ou foi removido do estoque.
          </p>
          <Link className="text-sm font-medium text-blue-600" href="/estoque">
            Voltar ao estoque
          </Link>
        </main>
      </div>
    );
  }

  const {
    id,
    placa,
    chassi,
    hodometro,
    cor,
    estado_venda,
    estado_veiculo,
    estagio_documentacao,
    ano_fabricacao,
    ano_modelo,
    observacao,
    preco_venal,
    registrado_em,
    editado_em,
    modelo,
    //loja,
    //local,
    //documentacao,
    caracteristicas,
    //midia,
    //anuncios,
  }: VeiculoResumo = veiculo;

  const marca = modelo?.marca ?? "Marca não informada";
  const modeloNome = modelo?.nome ?? "Modelo não informado";
  //const lojaNome = loja?.loja?.nome ?? "Não atribuído";
  //const localNome = local?.nome ?? "Não informado";
  //const dataEntrada = loja?.data_entrada ?? documentacao?.data_entrada;
  //const totalFotos = midia?.controle?.qtd_fotos ?? midia?.fotos?.length ?? 0;
  //const anunciosAtivos = anuncios?.filter((item) => item.status === "ativo");
  //const statusDocumentacao = documentacao?.status_geral ?? estagio_documentacao;

  const documentacaoChecklist = [
    { label: "Multas", value: "Nada Consta!"},//documentacao?.tem_multas },
    { label: "Manual", value: "Sim!"},//documentacao?.tem_manual },
    { label: "Chave reserva", value: "Sim!"},//documentacao?.tem_chave_reserva },
    { label: "Nota fiscal de compra", value: "Sim!"},//documentacao?.tem_nf_compra },
    { label: "CRV", value: "Sim!"},//documentacao?.tem_crv },
    { label: "CRLV", value: "Sim!"},//documentacao?.tem_crlv },
    { label: "Dívidas ativas", value: "Nada Consta!"},//documentacao?.tem_dividas_ativas },
    { label: "Restrições", value: "Nada Consta!"},//documentacao?.tem_restricoes },
    { label: "Transferência iniciada", value: "Nada Consta!"},//documentacao?.transferencia_iniciada },
    { label: "Transferência concluída", value: "Sim!"},//documentacao?.transferencia_concluida },
    { label: "Vistoria realizada", value: "Sim!"},//documentacao?.vistoria_realizada },
    { label: "Vistoria aprovada", value: "Sim!"}//documentacao?.aprovada_vistoria },
  ];

  const resumoSituacao = [
    { label: "Estado de venda", value: formatEnum(estado_venda) },
    { label: "Estado do veículo", value: formatEnum(estado_veiculo) },
    {
      label: "Situação da documentação",
      value: formatEnum(estagio_documentacao),
    },
    { label: "Registrado em", value: formatDate(registrado_em) },
    { label: "Última atualização", value: formatDate(editado_em) },
  ];

  const informacoesGerais = [
    { label: "Ano fabricação", value: formatText(ano_fabricacao?.toString()) },
    { label: "Ano modelo", value: formatText(ano_modelo?.toString()) },
    { label: "Cor", value: formatText(cor) },
    { label: "Hodômetro", value: formatNumber(hodometro, "km") },
    { label: "Motor", value: formatText(modelo?.motor) },
    { label: "Combustível", value: formatEnum(modelo?.combustivel) },
    { label: "Câmbio", value: formatEnum(modelo?.tipo_cambio) },
    { label: "Portas", value: formatText(modelo?.portas?.toString()) },
    { label: "Lugares", value: formatText(modelo?.lugares?.toString()) },
  ];

  const localizacaoValores = [
    { label: "Data de entrada", value: formatDate(registrado_em) },
    { label: "Preço vitrine", value: formatCurrency(preco_venal ?? null) },
    {
      label: "Fotos cadastradas",
      value: "Em desenvolvimento" //totalFotos ? `${totalFotos} arquivo${totalFotos === 1 ? "" : "s"}` : "Sem fotos",
    },
    {
      label: "Anúncios ativos",
      value: "Em desenvolvimento" /*anunciosAtivos?.length
        ? `${anunciosAtivos.length} anúncio${anunciosAtivos.length === 1 ? "" : "s"}`
        : "Nenhum anúncio ativo",*/
    },
  ];

  return (
    <div className="bg-white px-6 py-10 text-zinc-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-blue-600">
              {formatEnum(estado_venda)}
            </span>
            <h1 className="text-3xl font-semibold text-zinc-900">
              {marca} {modeloNome}
            </h1>
            <p className="text-sm text-zinc-500">
              Placa {placa}
              {chassi ? ` • Chassi ${chassi}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap justify-start gap-3 md:justify-end">
            <Link
              className="inline-flex items-center justify-center rounded-full border border-blue-600 px-5 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-600 hover:text-white"
              href={`/editar/${id}`}
            >
              Atualizar dados
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-5 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
              href="/estoque"
            >
              Voltar ao estoque
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium text-zinc-800">Situação</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 text-sm text-zinc-600">
              {resumoSituacao.map(({ label, value }) => (
                <div key={label} className="flex flex-col">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {label}
                  </dt>
                  <dd className="mt-1 text-zinc-700">{value}</dd>
                </div>
              ))}
            </dl>
          </article>

          <article className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium text-zinc-800">Localização &amp; valores</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 text-sm text-zinc-600">
              {localizacaoValores.map(({ label, value }) => (
                <div key={label} className="flex flex-col">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {label}
                  </dt>
                  <dd className="mt-1 text-zinc-700">{value}</dd>
                </div>
              ))}
            </dl>
          </article>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-zinc-800">Informações gerais</h2>
          <dl className="mt-4 grid grid-cols-1 gap-4 text-sm text-zinc-600 sm:grid-cols-2 lg:grid-cols-3">
            {informacoesGerais.map(({ label, value }) => (
              <div key={label} className="flex flex-col">
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {label}
                </dt>
                <dd className="mt-1 text-zinc-700">{value}</dd>
              </div>
            ))}
            <div className="flex flex-col sm:col-span-2 lg:col-span-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Observação
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-zinc-700">
                {formatText(observacao)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-zinc-800">Documentação</h2>
          <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <dl className="grid gap-3 text-sm text-zinc-600">
              {documentacaoChecklist.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between rounded-md border border-zinc-100 bg-zinc-50 px-4 py-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {label}
                  </dt>
                  <dd className="text-sm font-medium text-zinc-700">
                    {formatBoolean(!!value)}
                  </dd>
                </div>
              ))}
            </dl>
            <dl className="space-y-4 text-sm text-zinc-600">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Observações gerais
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-zinc-700">
                  {formatText(observacao)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Observações multas
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-zinc-700">
                  {formatText("Nada Consta!")} {/*documentacao?.observacoes_multas*/}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Observações restrições
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-zinc-700">
                  {formatText("Nada Consta!")} {/*documentacao?.observacoes_restricoes*/}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {caracteristicas && caracteristicas.length > 0 && (
          <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium text-zinc-800">Características</h2>
            <ul className="mt-4 flex flex-wrap gap-2 text-sm">
              {caracteristicas.map((caracteristica) => (
                <li
                  key={caracteristica.id}
                  className="rounded-full bg-zinc-100 px-4 py-2 text-zinc-600"
                >
                  {caracteristica.nome}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
