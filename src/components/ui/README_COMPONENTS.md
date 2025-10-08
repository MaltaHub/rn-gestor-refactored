# Sistema de Componentes UI

Este diretório contém componentes UI reutilizáveis construídos com **Design Tokens** e **Compound Components Pattern**.

## 🎨 Design Tokens

Todos os componentes usam tokens de design centralizados de `@/config/tokens`:

- **SPACING**: Espaçamentos consistentes (xs, sm, md, lg, xl, 2xl, 3xl, 4xl)
- **FONT_SIZE**: Tamanhos de fonte (xs, sm, base, lg, xl, 2xl, 3xl, 4xl)
- **FONT_WEIGHT**: Pesos de fonte (normal, medium, semibold, bold)
- **BORDER_RADIUS**: Bordas arredondadas (none, sm, md, lg, xl, 2xl, full)
- **SHADOWS**: Sombras (sm, md, lg, xl, inner, none)
- **TRANSITIONS**: Transições (fast, base, slow)

## 📦 Componentes Disponíveis

### Button

Botão com suporte a variantes, cores customizadas e ícones.

```tsx
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// Variantes pré-definidas
<Button variant="primary">Clique aqui</Button>
<Button variant="secondary">Secundário</Button>
<Button variant="outline">Com borda</Button>
<Button variant="ghost">Fantasma</Button>
<Button variant="danger">Perigo</Button>

// Tamanhos
<Button size="sm">Pequeno</Button>
<Button size="md">Médio</Button>
<Button size="lg">Grande</Button>

// Com ícone
<Button icon={<Plus size={16} />} iconPosition="left">
  Adicionar
</Button>

// Loading state
<Button isLoading>Salvando...</Button>

// Cores customizadas
<Button customColor={{
  bg: '#FF5733',
  text: '#FFF',
  hover: '#C70039',
  focus: '#900C3F'
}}>
  Custom
</Button>
```

### Card (Compound Component)

Card com composição flexível usando sub-componentes.

```tsx
import { Card } from '@/components/ui/card';

// Uso básico
<Card variant="default" padding="xl">
  Conteúdo do card
</Card>

// Compound components
<Card variant="elevated">
  <Card.Header 
    title="Título do Card"
    subtitle="Subtítulo opcional"
    action={<button>Ação</button>}
  />
  
  <Card.Body>
    Conteúdo principal do card
  </Card.Body>
  
  <Card.Footer align="right">
    <Button variant="outline">Cancelar</Button>
    <Button variant="primary">Confirmar</Button>
  </Card.Footer>
</Card>

// Cores customizadas
<Card customColors={{ bg: '#F0F0F0', border: '#333' }}>
  Card com cores customizadas
</Card>
```

### Input

Input com label, ícones e validação.

```tsx
import { Input } from '@/components/ui/input';
import { Search, Mail } from 'lucide-react';

// Input básico
<Input 
  label="E-mail" 
  placeholder="seu@email.com"
  type="email"
/>

// Com ícones
<Input 
  label="Pesquisar"
  leftIcon={<Search size={18} />}
/>

// Com erro
<Input 
  label="Senha"
  type="password"
  error="Senha deve ter no mínimo 6 caracteres"
/>

// Tamanhos
<Input inputSize="sm" />
<Input inputSize="md" />
<Input inputSize="lg" />
```

### Badge

Badge para status, categorias ou contadores.

```tsx
import { Badge } from '@/components/ui/badge';

// Variantes semânticas
<Badge variant="default">Padrão</Badge>
<Badge variant="success">Sucesso</Badge>
<Badge variant="warning">Aviso</Badge>
<Badge variant="danger">Erro</Badge>
<Badge variant="info">Info</Badge>

// Tamanhos
<Badge size="sm">Pequeno</Badge>
<Badge size="md">Médio</Badge>

// Cores customizadas
<Badge customColors={{ bg: '#E91E63', text: '#FFF' }}>
  Custom
</Badge>
```

## 🔧 Customização

### Criar variante personalizada

```tsx
import { Button } from '@/components/ui/button';
import { SPACING, FONT_SIZE } from '@/config';

function MyCustomButton() {
  return (
    <Button 
      customColor={{
        bg: 'var(--custom-color)',
        text: '#FFF',
        hover: 'var(--custom-hover)',
        focus: 'var(--custom-focus)'
      }}
      style={{
        padding: `${SPACING.md} ${SPACING.xl}`,
        fontSize: FONT_SIZE.lg
      }}
    >
      Botão Customizado
    </Button>
  );
}
```

### Estender componentes

```tsx
import { forwardRef } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';

interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, ...props }, ref) => {
    return (
      <Button ref={ref} {...props}>
        {icon}
      </Button>
    );
  }
);
```

## 🎯 Boas Práticas

1. **Use tokens de design** ao invés de valores hardcoded
2. **Prefira variantes pré-definidas** para consistência
3. **Use cores customizadas** apenas quando necessário
4. **Mantenha acessibilidade** com aria-labels e roles apropriados
5. **Type safety** - aproveite os tipos TypeScript dos componentes
