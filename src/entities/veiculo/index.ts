/**
 * Entidade Veiculo
 * Public API da entidade - exporta apenas o necessário
 */

// Model
export * from './model'

// API
export { veiculoRepository } from './api/repository'
export * from './api/queries'
export * from './api/transforms'

// UI
export * from './ui'
