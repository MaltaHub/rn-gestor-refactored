/**
 * Formatadores de strings
 * Centraliza lógica de formatação e manipulação de strings
 */

/**
 * Formata placa de veículo no padrão brasileiro
 * @param placa - String com a placa (com ou sem formatação)
 * @returns Placa formatada (ex: "ABC-1234" ou "ABC1D23")
 */
export function formatPlaca(placa: string | null | undefined): string {
  if (!placa) return '-'

  // Remove tudo exceto letras e números
  const cleaned = placa.replace(/[^A-Z0-9]/gi, '').toUpperCase()

  if (cleaned.length === 0) return '-'

  // Placa padrão antigo (ABC-1234)
  if (cleaned.length === 7 && /^[A-Z]{3}[0-9]{4}$/.test(cleaned)) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
  }

  // Placa Mercosul (ABC1D23)
  if (cleaned.length === 7 && /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(cleaned)) {
    return cleaned
  }

  // Retorna sem formatação se não corresponder aos padrões
  return cleaned
}

/**
 * Normaliza placa removendo formatação
 * @param placa - String com a placa
 * @returns Placa sem formatação (apenas letras e números em maiúsculas)
 */
export function normalizePlaca(placa: string | null | undefined): string {
  if (!placa) return ''
  return placa.replace(/[^A-Z0-9]/gi, '').toUpperCase()
}

/**
 * Formata CPF
 * @param cpf - String com CPF (com ou sem formatação)
 * @returns CPF formatado (ex: "123.456.789-00")
 */
export function formatCPF(cpf: string | null | undefined): string {
  if (!cpf) return '-'

  const cleaned = cpf.replace(/\D/g, '')

  if (cleaned.length !== 11) return cpf

  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Formata CNPJ
 * @param cnpj - String com CNPJ (com ou sem formatação)
 * @returns CNPJ formatado (ex: "12.345.678/0001-00")
 */
export function formatCNPJ(cnpj: string | null | undefined): string {
  if (!cnpj) return '-'

  const cleaned = cnpj.replace(/\D/g, '')

  if (cleaned.length !== 14) return cnpj

  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

/**
 * Formata telefone
 * @param phone - String com telefone (com ou sem formatação)
 * @returns Telefone formatado (ex: "(11) 98765-4321" ou "(11) 3456-7890")
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '-'

  const cleaned = phone.replace(/\D/g, '')

  // Celular (11 dígitos)
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  // Fixo (10 dígitos)
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }

  return phone
}

/**
 * Trunca string com ellipsis
 * @param str - String a ser truncada
 * @param maxLength - Comprimento máximo
 * @returns String truncada com "..." se necessário
 */
export function truncate(str: string | null | undefined, maxLength: number): string {
  if (!str) return ''
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

/**
 * Capitaliza primeira letra de cada palavra
 * @param str - String a ser capitalizada
 * @returns String com primeiras letras maiúsculas
 */
export function capitalize(str: string | null | undefined): string {
  if (!str) return ''

  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Gera slug a partir de string
 * @param str - String a ser convertida
 * @returns Slug (ex: "meu-titulo-exemplo")
 */
export function slugify(str: string | null | undefined): string {
  if (!str) return ''

  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim()
}
