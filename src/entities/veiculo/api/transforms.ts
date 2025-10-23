/**
 * Transformers para Veiculo
 * Adapters para transformar dados do banco para domínio
 */

import { BaseAdapter } from '@/shared/lib/transformers'
import { formatCurrency, formatPlaca } from '@/shared/lib/formatters'
import type { Veiculo, VeiculoDb } from '../model/types'
import { ESTADO_VENDA_LABELS, ESTADO_VEICULO_LABELS } from '../model/constants'

/**
 * Veiculo enriquecido para UI
 * Inclui dados formatados e derivados
 */
export interface VeiculoUI extends Veiculo {
  // Formatados
  placaFormatada: string
  precoFormatado: string | null
  hodometroFormatado: string

  // Labels
  estadoVendaLabel: string
  estadoVeiculoLabel: string

  // Derivados
  anoPrincipal: number | null
  descricao: string
}

/**
 * Adapter: Database → Domain
 * Transforma dados do Supabase para o tipo de domínio
 */
export class VeiculoDbAdapter extends BaseAdapter<VeiculoDb, Veiculo> {
  transform(db: VeiculoDb): Veiculo {
    return {
      id: db.id,
      placa: db.placa.toUpperCase(),
      chassi: db.chassi,
      ano_fabricacao: db.ano_fabricacao,
      ano_modelo: db.ano_modelo,
      cor: db.cor,
      hodometro: db.hodometro,
      estado_veiculo: db.estado_veiculo,
      estado_venda: db.estado_venda,
      observacao: db.observacao,
      preco_venal: db.preco_venal,
      local_id: db.local_id,
      modelo_id: db.modelo_id,
      empresa_id: db.empresa_id,
      registrado_em: db.registrado_em,
      registrado_por: db.registrado_por,
      editado_em: db.editado_em,
      editado_por: db.editado_por,
      estagio_documentacao: db.estagio_documentacao,
    }
  }
}

/**
 * Adapter: Domain → UI
 * Enriquece veículo com dados formatados para exibição
 */
export class VeiculoUIAdapter extends BaseAdapter<Veiculo, VeiculoUI> {
  transform(veiculo: Veiculo): VeiculoUI {
    const placaFormatada = formatPlaca(veiculo.placa)
    const precoFormatado = veiculo.preco_venal
      ? formatCurrency(veiculo.preco_venal)
      : null

    const hodometroFormatado = new Intl.NumberFormat('pt-BR').format(veiculo.hodometro) + ' km'

    const estadoVendaLabel = veiculo.estado_venda
      ? ESTADO_VENDA_LABELS[veiculo.estado_venda]
      : 'Não informado'

    const estadoVeiculoLabel = veiculo.estado_veiculo
      ? ESTADO_VEICULO_LABELS[veiculo.estado_veiculo]
      : 'Não informado'

    const anoPrincipal = veiculo.ano_modelo || veiculo.ano_fabricacao

    // Descrição básica do veículo
    const descricaoParts = [
      veiculo.cor,
      anoPrincipal,
      hodometroFormatado,
    ].filter(Boolean)

    const descricao = descricaoParts.length > 0
      ? descricaoParts.join(' • ')
      : 'Sem informações'

    return {
      ...veiculo,
      placaFormatada,
      precoFormatado,
      hodometroFormatado,
      estadoVendaLabel,
      estadoVeiculoLabel,
      anoPrincipal,
      descricao,
    }
  }
}

/**
 * Adapter composto: Database → UI
 * Composição dos dois adapters acima
 */
export const veiculoDbToUIAdapter = new VeiculoDbAdapter()
  .compose(new VeiculoUIAdapter())

/**
 * Instâncias singleton dos adapters
 */
export const veiculoDbAdapter = new VeiculoDbAdapter()
export const veiculoUIAdapter = new VeiculoUIAdapter()

/**
 * Helper functions para uso direto
 */
export function adaptVeiculoFromDb(db: VeiculoDb): Veiculo {
  return veiculoDbAdapter.transform(db)
}

export function adaptVeiculoToUI(veiculo: Veiculo): VeiculoUI {
  return veiculoUIAdapter.transform(veiculo)
}

export function adaptVeiculoFromDbToUI(db: VeiculoDb): VeiculoUI {
  return veiculoDbToUIAdapter.transform(db)
}
