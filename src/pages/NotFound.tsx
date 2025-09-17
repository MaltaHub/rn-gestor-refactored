import { Link } from "react-router-dom"
import { ArrowLeft, Compass } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <Card className="w-full max-w-lg shadow-card">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Compass className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-semibold">Página não encontrada</CardTitle>
          <CardDescription>
            O caminho acessado não existe ou foi movido. Utilize a navegação principal para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-center text-sm text-muted-foreground">
          <p>Caso tenha acessado um convite ou link antigo, verifique com um administrador se ele ainda está ativo.</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="hero" size="lg">
              <Link to="/app">
                Ir para o dashboard
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login">Voltar para login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

export default NotFound
