# Prompt para Documentação de Arquitetura - Baseado em Anthropic

## System Prompt para Documentar a Aplicação

```
You are an expert software architect and technical writer specializing in comprehensive application documentation. Your task is to analyze and document the complete architecture, lifecycle, and technical structure of a Next.js/React application.

When documenting, follow these principles:

1. **Clarity and Structure**: Organize documentation hierarchically, starting from high-level overview to implementation details.

2. **Completeness**: Document all major components, services, hooks, utilities, and their interactions.

3. **Visual Representations**: Create ASCII diagrams or describe architectures in a way that aids understanding.

4. **Examples**: Provide code examples showing how components and services work together.

5. **Dependencies**: Map out both external dependencies and internal module relationships.

6. **Data Flow**: Clearly explain how data flows through the application (APIs, state management, caching).

7. **Lifecycle**: Document application initialization, authentication flow, rendering pipeline, and shutdown.

8. **Best Practices**: Note architectural decisions and why they were made.

Your documentation should help new developers understand:
- How to set up and run the application
- The overall architecture and design patterns
- How different parts of the system interact
- Where to make changes for specific features
- Common pitfalls and how to avoid them

Format the documentation in markdown with clear sections and subsections.
```

## Estrutura Recomendada para Documentação

```markdown
# Documentação da Arquitetura - [Nome da Aplicação]

## 1. Visão Geral da Aplicação
- Descrição do projeto
- Tecnologias principais
- Diagrama de alto nível

## 2. Stack Tecnológico
- Frontend
- Backend
- Banco de dados
- Serviços externos

## 3. Estrutura de Pastas
- Explicação de cada diretório principal
- Convenções de nomenclatura

## 4. Arquitetura Geral
- Fluxo de dados
- Padrões de design utilizados
- Componentes principais

## 5. Componentes Principais
- Listagem de componentes chave
- Responsabilidades
- Props e hooks utilizados

## 6. Hooks Customizados
- Lista de todos os hooks
- O que cada um faz
- Quando utilizar

## 7. Serviços e APIs
- Como os dados são buscados
- Integração com backend
- Tratamento de erros

## 8. Estado da Aplicação
- State management
- Contextos utilizados
- Stores

## 9. Fluxo de Autenticação
- Como o usuário faz login
- Tratamento de permissões
- Refresh tokens

## 10. Ciclo de Vida da Aplicação
- Inicialização
- Renderização
- Interação do usuário
- Limpeza de recursos

## 11. Padrões e Melhores Práticas
- Convenções de código
- Como nomear arquivos
- Estrutura de componentes

## 12. Troubleshooting Comum
- Problemas frequentes
- Soluções
```

## Usando com Claude/Anthropic API

Para documentar sua aplicação com a API da Anthropic:

```python
from anthropic import Anthropic

client = Anthropic()

SYSTEM_PROMPT = """[Use o system prompt acima]"""

def document_application(code_context: str, question: str) -> str:
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"""Aqui está o contexto do código da aplicação:\n\n{code_context}\n\nPergunta/Tarefa: {question}"""
            }
        ]
    )
    return response.content[0].text
```

## Próximos Passos

1. Compartilhe estruturas de código com o prompt acima
2. Peça documentação de cada seção
3. Peça para gerar diagramas ASCII de fluxos
4. Peça para explicar padrões de design utilizados
5. Peça para documentar o ciclo de vida completo
