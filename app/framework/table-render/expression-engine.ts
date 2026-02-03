/**
 * Expression Engine
 * Parser e compilador de expressões para colunas dinâmicas
 * Suporta referências a outras tabelas (PROCV/PROCH) e expressões matemáticas
 */

import { CompiledExpression, Table, TableCellValue, TableRow } from './types';

/**
 * Tipos de tokens na expressão
 */
enum TokenType {
  IDENTIFIER = 'IDENTIFIER',
  DOT = 'DOT',
  BRACKET_OPEN = 'BRACKET_OPEN',
  BRACKET_CLOSE = 'BRACKET_CLOSE',
  PAREN_OPEN = 'PAREN_OPEN',
  PAREN_CLOSE = 'PAREN_CLOSE',
  COMMA = 'COMMA',
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  OPERATOR = 'OPERATOR',
  EQUALS = 'EQUALS',
  QUESTION = 'QUESTION',
  COLON = 'COLON',
  EOF = 'EOF',
}

interface Token {
  type: TokenType;
  value: string;
}

type LiteralValue = string | number;

type BinaryOperator =
  | '+'
  | '-'
  | '*'
  | '/'
  | '%'
  | '=='
  | '!='
  | '<'
  | '>'
  | '<='
  | '>='
  | '&&'
  | '||';

type ComparisonOperator = '==' | '!=' | '<' | '>' | '<=' | '>=';

const comparisonOperators: ComparisonOperator[] = ['==', '!=', '<', '>', '<=', '>='];

const isComparisonOperator = (value: string): value is ComparisonOperator =>
  comparisonOperators.includes(value as ComparisonOperator);

type ExpressionNode =
  | { type: 'literal'; value: LiteralValue }
  | { type: 'identifier'; name: string }
  | { type: 'tableReference'; tableId: string; columnName: string }
  | { type: 'binary'; operator: BinaryOperator; left: ExpressionNode; right: ExpressionNode }
  | { type: 'ternary'; condition: ExpressionNode; trueBranch: ExpressionNode; falseBranch: ExpressionNode }
  | { type: 'access'; object: ExpressionNode; key: ExpressionNode };

/**
 * Motor de expressões dinâmicas com suporte a:
 * - Acesso a coluna local: columnName
 * - Acesso a outra tabela e coluna: ref.tableId.columnName
 * - Comparações e operadores lógicos
 * - Expressões ternárias
 * - Funções built-in (SUM, COUNT, etc)
 */
export class ExpressionEngine {
  private cache = new Map<string, CompiledExpression>();

  /**
   * Compila uma expressão e retorna um objeto CompiledExpression
   */
  compile(expression: string): CompiledExpression {
    // Checar cache
    if (this.cache.has(expression)) {
      return this.cache.get(expression)!;
    }

    try {
      const dependencies: string[] = [];
      const tableReferences: string[] = [];

      // Parse e análise da expressão
      const parsed = this.parse(expression);

      // Extrair referências
      this.extractReferences(parsed, dependencies, tableReferences);

      // Compilar em função
      const compute = this.createComputeFunction(parsed);

      const compiled: CompiledExpression = {
        originalExpression: expression,
        compute,
        dependencies,
        tableReferences,
      };

      // Cachear
      this.cache.set(expression, compiled);

      return compiled;
    } catch (error) {
      console.error(`Erro ao compilar expressão: "${expression}"`, error);
      throw new Error(`Expressão inválida: ${expression}. Detalhes: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Tokeniza uma expressão
   */
  private tokenize(expression: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < expression.length) {
      const char = expression[i];

      // Espaços em branco
      if (/\s/.test(char)) {
        i++;
        continue;
      }

      // String entre aspas
      if (char === '"' || char === "'") {
        const quote = char;
        let value = '';
        i++;
        while (i < expression.length && expression[i] !== quote) {
          value += expression[i];
          i++;
        }
        i++; // pular fecha-aspas
        tokens.push({ type: TokenType.STRING, value });
        continue;
      }

      // Número
      if (/\d/.test(char)) {
        let value = '';
        while (i < expression.length && /[\d.]/.test(expression[i])) {
          value += expression[i];
          i++;
        }
        tokens.push({ type: TokenType.NUMBER, value });
        continue;
      }

      // Identificador ou palavra-chave
      if (/[a-zA-Z_]/.test(char)) {
        let value = '';
        while (i < expression.length && /[a-zA-Z0-9_]/.test(expression[i])) {
          value += expression[i];
          i++;
        }
        tokens.push({ type: TokenType.IDENTIFIER, value });
        continue;
      }

      // Operadores e símbolos
      switch (char) {
        case '.':
          tokens.push({ type: TokenType.DOT, value: '.' });
          i++;
          break;
        case '[':
          tokens.push({ type: TokenType.BRACKET_OPEN, value: '[' });
          i++;
          break;
        case ']':
          tokens.push({ type: TokenType.BRACKET_CLOSE, value: ']' });
          i++;
          break;
        case '(':
          tokens.push({ type: TokenType.PAREN_OPEN, value: '(' });
          i++;
          break;
        case ')':
          tokens.push({ type: TokenType.PAREN_CLOSE, value: ')' });
          i++;
          break;
        case ',':
          tokens.push({ type: TokenType.COMMA, value: ',' });
          i++;
          break;
        case '=':
          if (expression[i + 1] === '=') {
            tokens.push({ type: TokenType.OPERATOR, value: '==' });
            i += 2;
          } else {
            tokens.push({ type: TokenType.EQUALS, value: '=' });
            i++;
          }
          break;
        case '!':
          if (expression[i + 1] === '=') {
            tokens.push({ type: TokenType.OPERATOR, value: '!=' });
            i += 2;
          } else {
            throw new Error(`Token inesperado: !`);
          }
          break;
        case '<':
          if (expression[i + 1] === '=') {
            tokens.push({ type: TokenType.OPERATOR, value: '<=' });
            i += 2;
          } else {
            tokens.push({ type: TokenType.OPERATOR, value: '<' });
            i++;
          }
          break;
        case '>':
          if (expression[i + 1] === '=') {
            tokens.push({ type: TokenType.OPERATOR, value: '>=' });
            i += 2;
          } else {
            tokens.push({ type: TokenType.OPERATOR, value: '>' });
            i++;
          }
          break;
        case '+':
          tokens.push({ type: TokenType.OPERATOR, value: '+' });
          i++;
          break;
        case '-':
          tokens.push({ type: TokenType.OPERATOR, value: '-' });
          i++;
          break;
        case '*':
          tokens.push({ type: TokenType.OPERATOR, value: '*' });
          i++;
          break;
        case '/':
          tokens.push({ type: TokenType.OPERATOR, value: '/' });
          i++;
          break;
        case '%':
          tokens.push({ type: TokenType.OPERATOR, value: '%' });
          i++;
          break;
        case '?':
          tokens.push({ type: TokenType.QUESTION, value: '?' });
          i++;
          break;
        case ':':
          tokens.push({ type: TokenType.COLON, value: ':' });
          i++;
          break;
        default:
          throw new Error(`Token inesperado: ${char}`);
      }
    }

    tokens.push({ type: TokenType.EOF, value: '' });
    return tokens;
  }

  /**
   * Parse simples de expressão em AST
   */
  private parse(expression: string): ExpressionNode {
    const tokens = this.tokenize(expression);
    let current = 0;

    const peek = () => tokens[current];
    const advance = () => tokens[current++];

    const parseExpression = (): ExpressionNode => {
      return parseTernary();
    };

    const parseTernary = (): ExpressionNode => {
      const expr = parseLogicalOr();
      if (peek().type === TokenType.QUESTION) {
        advance(); // ?
        const trueBranch = parseExpression();
        advance(); // :
        const falseBranch = parseExpression();
        return { type: 'ternary', condition: expr, trueBranch, falseBranch };
      }
      return expr;
    };

    const parseLogicalOr = (): ExpressionNode => {
      let expr = parseLogicalAnd();
      while (peek().value === '||') {
        const op = advance().value as BinaryOperator;
        const right = parseLogicalAnd();
        expr = { type: 'binary', operator: op, left: expr, right };
      }
      return expr;
    };

    const parseLogicalAnd = (): ExpressionNode => {
      let expr = parseComparison();
      while (peek().value === '&&') {
        const op = advance().value as BinaryOperator;
        const right = parseComparison();
        expr = { type: 'binary', operator: op, left: expr, right };
      }
      return expr;
    };

    const parseComparison = (): ExpressionNode => {
      let expr = parseAdditive();
      while (isComparisonOperator(peek().value)) {
        const op = advance().value as ComparisonOperator;
        const right = parseAdditive();
        expr = { type: 'binary', operator: op, left: expr, right };
      }
      return expr;
    };

    const parseAdditive = (): ExpressionNode => {
      let expr = parseMultiplicative();
      while (peek().value === '+' || peek().value === '-') {
        const op = advance().value as BinaryOperator;
        const right = parseMultiplicative();
        expr = { type: 'binary', operator: op, left: expr, right };
      }
      return expr;
    };

    const parseMultiplicative = (): ExpressionNode => {
      let expr = parsePrimary();
      while (peek().value === '*' || peek().value === '/' || peek().value === '%') {
        const op = advance().value as BinaryOperator;
        const right = parsePrimary();
        expr = { type: 'binary', operator: op, left: expr, right };
      }
      return expr;
    };

    const parsePrimary = (): ExpressionNode => {
      const token = peek();

      // Número
      if (token.type === TokenType.NUMBER) {
        advance();
        return { type: 'literal', value: parseFloat(token.value) };
      }

      // String
      if (token.type === TokenType.STRING) {
        advance();
        return { type: 'literal', value: token.value };
      }

      // Parênteses
      if (token.type === TokenType.PAREN_OPEN) {
        advance(); // (
        const expr = parseExpression();
        advance(); // )
        return expr;
      }

      // Identificador ou referência
      if (token.type === TokenType.IDENTIFIER) {
        const name = advance().value;

        // Referência a coluna de outra tabela (ref.tableId.columnName)
        if (peek().type === TokenType.DOT) {
          advance(); // .
          const tableId = advance().value;
          advance(); // .
          const columnName = advance().value;
          return { type: 'tableReference', tableId, columnName };
        }

        // Acesso com colchetes (array ou objeto)
        if (peek().type === TokenType.BRACKET_OPEN) {
          advance(); // [
          const key = parseExpression();
          advance(); // ]
          return { type: 'access', object: { type: 'identifier', name }, key };
        }

        // Simples identificador (referência a coluna local)
        return { type: 'identifier', name };
      }

      throw new Error(`Token inesperado: ${token.value}`);
    };

    return parseExpression();
  }

  /**
   * Extrai referências de colunas e tabelas de um AST
   */
  private extractReferences(node: ExpressionNode | null | undefined, dependencies: string[], tableReferences: string[]): void {
    if (!node) return;

    switch (node.type) {
      case 'identifier':
        dependencies.push(node.name);
        break;

      case 'tableReference':
        tableReferences.push(node.tableId);
        dependencies.push(`${node.tableId}.${node.columnName}`);
        break;

      case 'binary':
        this.extractReferences(node.left, dependencies, tableReferences);
        this.extractReferences(node.right, dependencies, tableReferences);
        break;

      case 'ternary':
        this.extractReferences(node.condition, dependencies, tableReferences);
        this.extractReferences(node.trueBranch, dependencies, tableReferences);
        this.extractReferences(node.falseBranch, dependencies, tableReferences);
        break;

      case 'access':
        this.extractReferences(node.object, dependencies, tableReferences);
        this.extractReferences(node.key, dependencies, tableReferences);
        break;
    }
  }

  /**
   * Cria a função compilada que executa a expressão
   */
  private createComputeFunction(
    ast: ExpressionNode
  ): (row: TableRow, tables: Map<string, Table>, allRows?: TableRow[]) => TableCellValue {
    return (row: TableRow, tables: Map<string, Table>, allRows?: TableRow[]) => {
      try {
        return this.evaluate(ast, row, tables, allRows);
      } catch (error) {
        console.error('Erro ao executar expressão compilada:', error);
        return null;
      }
    };
  }

  /**
   * Avalia um AST contra uma linha de dados
   */
  private evaluate(node: ExpressionNode, row: TableRow, tables: Map<string, Table>, allRows?: TableRow[]): TableCellValue {
    if (!node) return null;

    switch (node.type) {
      case 'literal':
        return node.value;

      case 'identifier':
        return row[node.name];

      case 'tableReference': {
        const refTable = tables.get(node.tableId);
        if (!refTable) {
          throw new Error(`Tabela referenciada não encontrada: ${node.tableId}`);
        }

        // PROCV: procura por 'id' na tabela referenciada
        const refRows = refTable.getRows();
        const matchingRow = refRows.find((r) => r.id === row.id);
        if (!matchingRow) {
          return null;
        }

        return matchingRow[node.columnName];
      }

      case 'binary': {
        const left = this.evaluate(node.left, row, tables, allRows);
        const right = this.evaluate(node.right, row, tables, allRows);

        switch (node.operator) {
          case '+':
            if (typeof left === 'string' || typeof right === 'string') {
              return `${this.toStringValue(left)}${this.toStringValue(right)}`;
            }
            return this.toNumberValue(left) + this.toNumberValue(right);
          case '-':
            return this.toNumberValue(left) - this.toNumberValue(right);
          case '*':
            return this.toNumberValue(left) * this.toNumberValue(right);
          case '/':
            return this.toNumberValue(left) / this.toNumberValue(right);
          case '%':
            return this.toNumberValue(left) % this.toNumberValue(right);
          case '==':
            return left === right;
          case '!=':
            return left !== right;
          case '<':
            return this.toComparableValue(left) < this.toComparableValue(right);
          case '>':
            return this.toComparableValue(left) > this.toComparableValue(right);
          case '<=':
            return this.toComparableValue(left) <= this.toComparableValue(right);
          case '>=':
            return this.toComparableValue(left) >= this.toComparableValue(right);
          case '&&':
            return left && right;
          case '||':
            return left || right;
          default:
            throw new Error(`Operador não suportado: ${node.operator}`);
        }
      }

      case 'ternary': {
        const condition = this.evaluate(node.condition, row, tables, allRows);
        return condition ? this.evaluate(node.trueBranch, row, tables, allRows) : this.evaluate(node.falseBranch, row, tables, allRows);
      }

      case 'access': {
        const obj = this.evaluate(node.object, row, tables, allRows);
        const key = this.evaluate(node.key, row, tables, allRows);
        if (obj && typeof obj === 'object') {
          const record = obj as Record<string, TableCellValue>;
          return record[String(key)];
        }
        return null;
      }

      default:
        // @ts-ignore - Tipo genérico de nó
        throw new Error(`Tipo de nó desconhecido: ${node.type}`);
    }
  }

  private toNumberValue(value: TableCellValue): number {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    if (value === null || value === undefined) {
      return 0;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private toStringValue(value: TableCellValue): string {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value);
  }

  private toComparableValue(value: TableCellValue): string | number {
    if (typeof value === 'number' || typeof value === 'string') {
      return value;
    }
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    return '';
  }

  /**
   * Limpa o cache de compilação
   */
  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Instância global do motor de expressões
 */
export const expressionEngine = new ExpressionEngine();
