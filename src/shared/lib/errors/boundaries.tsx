/**
 * Error Boundaries React
 * Componentes para capturar erros em tempo de execução
 */

'use client'

import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { type ReactNode } from 'react'
import { handleError, logError } from './handler'
import { Link } from 'lucide-react'

//const errorUse = new isAppError()
/**
 * Componente de fallback padrão exibido quando há erro
 */
export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const appError = handleError(error)
  logError(appError)

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
      <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950">
        {/* Ícone de erro */}
        <div className="mb-4 flex justify-center">
          <svg
            className="h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Mensagem de erro */}
        <h2 className="mb-2 text-center text-lg font-semibold text-red-900 dark:text-red-100">
          Ops! Algo deu errado
        </h2>

        <p className="mb-4 text-center text-sm text-red-700 dark:text-red-300">
          {appError.message}
        </p>

        {/* Código do erro (apenas em desenvolvimento) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 rounded bg-red-100 p-3 dark:bg-red-900">
            <p className="text-xs font-mono text-red-800 dark:text-red-200">
              <strong>Code:</strong> {appError.code}
            </p>
            <p className="text-xs font-mono text-red-800 dark:text-red-200">
              <strong>Status:</strong> {appError.statusCode}
            </p>
          </div>
        )}

        {/* Botão de tentar novamente */}
        <button
          onClick={resetErrorBoundary}
          className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-600"
        >
          Tentar novamente
        </button>

        {/* Link para home */}
        <Link
          href="/"
          className="mt-3 block text-center text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
        >
          Voltar para o início
        </Link>
      </div>
    </div>
  )
}

/**
 * Error Boundary global
 * Captura erros não tratados em toda a aplicação
 */
export function ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        const appError = handleError(error)
        logError(appError)

        // Log de informações adicionais do React
        if (process.env.NODE_ENV === 'development') {
          console.error('React Error Info:', info)
        }
      }}
      onReset={() => {
        // Limpar estado ou redirecionar se necessário
        window.location.href = '/'
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}

/**
 * Error Boundary para rotas específicas
 * Permite personalizar o fallback por rota
 */
export function RouteErrorBoundary({
  children,
  fallback,
}: {
  children: ReactNode
  fallback?: (props: FallbackProps) => ReactNode
}) {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback || ErrorFallback}
      onError={(error) => {
        const appError = handleError(error)
        logError(appError)
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}

/**
 * HOC para envolver componentes com Error Boundary
 * @example
 * const SafeComponent = withErrorBoundary(MyComponent)
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: (props: FallbackProps) => ReactNode
) {
  return function ComponentWithErrorBoundary(props: P) {
    return (
      <RouteErrorBoundary fallback={fallback}>
        <Component {...props} />
      </RouteErrorBoundary>
    )
  }
}
