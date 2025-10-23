/**
 * Base Adapter Pattern
 * Classe abstrata para transformações de dados
 * Permite composição e reutilização de transformações
 */

/**
 * Adapter base genérico
 * @template TInput - Tipo de entrada
 * @template TOutput - Tipo de saída
 */
export abstract class BaseAdapter<TInput, TOutput> {
  /**
   * Transforma um único item
   * Deve ser implementado por classes concretas
   */
  abstract transform(input: TInput): TOutput

  /**
   * Transforma um array de itens
   * @param inputs - Array de itens a serem transformados
   * @returns Array de itens transformados
   */
  transformMany(inputs: TInput[]): TOutput[] {
    return inputs.map((input) => this.transform(input))
  }

  /**
   * Transforma item se não for null/undefined
   * @param input - Item a ser transformado (pode ser null/undefined)
   * @returns Item transformado ou null
   */
  transformOptional(input: TInput | null | undefined): TOutput | null {
    if (input === null || input === undefined) return null
    return this.transform(input)
  }

  /**
   * Compõe este adapter com outro
   * Permite encadear transformações
   * @param next - Próximo adapter na cadeia
   * @returns Novo adapter composto
   *
   * @example
   * const dbToEntity = new DbAdapter()
   * const entityToView = new ViewAdapter()
   * const dbToView = dbToEntity.compose(entityToView)
   */
  compose<TNext>(next: BaseAdapter<TOutput, TNext>): BaseAdapter<TInput, TNext> {
    return new ComposedAdapter(this, next)
  }

  /**
   * Aplica transformação assíncrona
   * Útil para adapters que precisam fazer chamadas assíncronas
   */
  async transformAsync(input: TInput): Promise<TOutput> {
    return this.transform(input)
  }

  /**
   * Transforma array de forma assíncrona
   */
  async transformManyAsync(inputs: TInput[]): Promise<TOutput[]> {
    return Promise.all(inputs.map((input) => this.transformAsync(input)))
  }
}

/**
 * Adapter composto (resultado de .compose())
 * @internal
 */
class ComposedAdapter<TInput, TMiddle, TOutput> extends BaseAdapter<TInput, TOutput> {
  constructor(
    private first: BaseAdapter<TInput, TMiddle>,
    private second: BaseAdapter<TMiddle, TOutput>
  ) {
    super()
  }

  transform(input: TInput): TOutput {
    const middle = this.first.transform(input)
    return this.second.transform(middle)
  }

  override async transformAsync(input: TInput): Promise<TOutput> {
    const middle = await this.first.transformAsync(input)
    return this.second.transformAsync(middle)
  }
}

/**
 * Adapter identidade (retorna o mesmo valor)
 * Útil para testes ou como adapter padrão
 */
export class IdentityAdapter<T> extends BaseAdapter<T, T> {
  transform(input: T): T {
    return input
  }
}

/**
 * Adapter que aplica uma função de transformação
 * Útil para transformações simples sem criar classe
 */
export class FunctionAdapter<TInput, TOutput> extends BaseAdapter<TInput, TOutput> {
  constructor(private fn: (input: TInput) => TOutput) {
    super()
  }

  transform(input: TInput): TOutput {
    return this.fn(input)
  }
}

/**
 * Helper para criar adapter a partir de função
 * @param fn - Função de transformação
 * @returns Novo adapter
 *
 * @example
 * const toUpperCase = createAdapter((str: string) => str.toUpperCase())
 */
export function createAdapter<TInput, TOutput>(
  fn: (input: TInput) => TOutput
): BaseAdapter<TInput, TOutput> {
  return new FunctionAdapter(fn)
}
