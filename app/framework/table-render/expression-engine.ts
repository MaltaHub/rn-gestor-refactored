/**
 * Expression Engine
 * Parser e compilador de expressões para colunas dinâmicas
 * Suporta referências a outras tabelas (PROCV/PROCH) e expressões matemáticas
 */

import { CompiledExpression, ExpressionContext, Table, TableColumn, TableRow } from './types';
import { tableRegistry } from './registry';

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
  private parse(expression: string): any {
    const tokens = this.tokenize(expression);
    let current = 0;

    const peek = () => tokens[current];
    const advance = () => tokens[current++];

    const parseExpression = (): any => {
      return parseTernary();
    };

    const parseTernary = (): any => {
      let expr = parseLogicalOr();
      if (peek().type === TokenType.QUESTION) {
        advance(); // ?
        const trueBranch = parseExpression();
        advance(); // :
        const falseBranch = parseExpression();
        return { type: 'ternary', condition: expr, trueBranch, falseBranch };
      }
      return expr;
    };

    const parseLogicalOr = (): any => {
      let expr = parseLogicalAnd();
      while (peek().value === '||') {
        const op = advance().value;
        const right = parseLogicalAnd();
        expr = { type: 'binary', operator: op, left: expr, right };
      }
      return expr;
    };

    const parseLogicalAnd = (): any => {
      let expr = parseComparison();
      while (peek().value === '&&') {
        const op = advance().value;
        const right = parseComparison();
        expr = { type: 'binary', operator: op, left: expr, right };
      }
      return expr;
    };

    const parseComparison = (): any => {
      let expr = parseAdditive();
      while (['==', '!=', '<', '>', '<=', '>='].includes(peek().value as any)) {
        const op = advance().value;
        const right = parseAdditive();
        expr = { type: 'binary', operator: op, left: expr, right };
      }
      return expr;
    };

    const parseAdditive = (): any => {
      let expr = parseMultiplicative();
      while (peek().value === '+' || peek().value === '-') {
        const op = advance().value;
        const right = parseMultiplicative();
        expr = { type: 'binary', operator: op, left: expr, right };
      }
      return expr;
    };

    const parseMultiplicative = (): any => {
      let expr = parsePrimary();
      while (peek().value === '*' || peek().value === '/' || peek().value === '%') {
        const op = advance().value;
        const right = parsePrimary();
        expr = { type: 'binary', operator: op, left: expr, right };
      }
      return expr;
    };

    const parsePrimary = (): any => {
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
  private extractReferences(node: any, dependencies: string[], tableReferences: string[]): void {
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
    ast: any
  ): (row: TableRow, tables: Map<string, Table>, allRows?: TableRow[]) => any {
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
  private evaluate(node: any, row: TableRow, tables: Map<string, Table>, allRows?: TableRow[]): any {
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
            return left + right;
          case '-':
            return left - right;
          case '*':
            return left * right;
          case '/':
            return left / right;
          case '%':
            return left % right;
          case '==':
            return left === right;
          case '!=':
            return left !== right;
          case '<':
            return left < right;
          case '>':
            return left > right;
          case '<=':
            return left <= right;
          case '>=':
            return left >= right;
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
        return obj?.[key];
      }

      default:
        throw new Error(`Tipo de nó desconhecido: ${node.type}`);
    }
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
