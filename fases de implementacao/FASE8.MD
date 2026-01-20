# ✨ FASE 8: Polimento

**Duração Estimada:** Semana 5  
**Objetivo:** UX, performance e acessibilidade

---

## 📋 Checklist de Tarefas

- [ ] 8.1 Implementar loading states
- [ ] 8.2 Implementar empty states
- [ ] 8.3 Melhorar error handling
- [ ] 8.4 Garantir responsividade mobile
- [ ] 8.5 Adicionar acessibilidade (ARIA)
- [ ] 8.6 Otimizações de performance
- [ ] 8.7 Testes manuais completos
- [ ] 8.8 Ajustes finais de UI

---

## 8.1 Loading States

### Skeleton para Lista de Orçamentos

**`components/features/orcamentos-list-skeleton.tsx`:**

```typescript
import { Skeleton } from '@/components/ui/skeleton'

export function OrcamentosListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-4 space-y-4">
          {/* Header da tabela */}
          <div className="flex gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-16" />
          </div>
          
          {/* Linhas */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Loading Spinner Global

**`components/ui/loading.tsx`:**

```typescript
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingProps {
  className?: string
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Loading({ className, text, size = 'md' }: LoadingProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizes[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}
```

### Page Loading

**`app/(dashboard)/loading.tsx`:**

```typescript
import { Loading } from '@/components/ui/loading'

export default function DashboardLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loading size="lg" text="Carregando..." />
    </div>
  )
}
```

---

## 8.2 Empty States

### Empty State Genérico

**`components/ui/empty-state.tsx`:**

```typescript
import { LucideIcon } from 'lucide-react'
import { Button } from './button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-lg border p-12 text-center">
      <div className="mx-auto w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        {description}
      </p>
      {action && (
        action.href ? (
          <Button asChild>
            <a href={action.href}>{action.label}</a>
          </Button>
        ) : (
          <Button onClick={action.onClick}>{action.label}</Button>
        )
      )}
    </div>
  )
}
```

### Uso:

```typescript
import { FileText, Search, AlertCircle } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'

// Nenhum orçamento
<EmptyState
  icon={FileText}
  title="Nenhum orçamento encontrado"
  description="Crie seu primeiro orçamento para começar a usar o sistema."
  action={{ label: 'Criar Orçamento', href: '/orcamentos/novo' }}
/>

// Busca sem resultados
<EmptyState
  icon={Search}
  title="Nenhum resultado"
  description="Tente ajustar os filtros ou buscar por outros termos."
  action={{ label: 'Limpar filtros', onClick: clearFilters }}
/>

// Erro ao carregar
<EmptyState
  icon={AlertCircle}
  title="Erro ao carregar dados"
  description="Não foi possível carregar os orçamentos. Tente novamente."
  action={{ label: 'Tentar novamente', onClick: refresh }}
/>
```

---

## 8.3 Error Handling

### Error Boundary

**`components/error-boundary.tsx`:**

```typescript
'use client'

import { Component, ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-lg font-semibold">Algo deu errado</h2>
            <p className="text-muted-foreground">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" /> Recarregar
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

### Toast de Erro Global

**`lib/utils/error-handler.ts`:**

```typescript
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Mensagens amigáveis para erros comuns
    if (error.message.includes('fetch failed')) {
      return 'Erro de conexão. Verifique sua internet.'
    }
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return 'Sessão expirada. Faça login novamente.'
    }
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return 'Você não tem permissão para esta ação.'
    }
    if (error.message.includes('404')) {
      return 'Recurso não encontrado.'
    }
    if (error.message.includes('500')) {
      return 'Erro no servidor. Tente novamente mais tarde.'
    }
    return error.message
  }
  return 'Erro desconhecido. Tente novamente.'
}
```

---

## 8.4 Responsividade Mobile

### Tabela Responsiva (Cards em Mobile)

**Atualizar `orcamentos-table.tsx`:**

```typescript
// Versão mobile como cards
<div className="md:hidden space-y-4">
  {orcamentos.map((orcamento) => (
    <Card 
      key={orcamento.id} 
      className="cursor-pointer"
      onClick={() => router.push(`/orcamentos/${orcamento.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="font-semibold">{orcamento.numero}</p>
            <p className="text-sm text-muted-foreground">{orcamento.cliente}</p>
          </div>
          <StatusBadge status={orcamento.status as OrcamentoStatus} />
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <span className="text-sm text-muted-foreground">
            {format(new Date(orcamento.created_at), 'dd/MM/yyyy')}
          </span>
          <span className="font-semibold">{formatCurrency(orcamento.valor_total)}</span>
        </div>
      </CardContent>
    </Card>
  ))}
</div>

// Versão desktop (tabela) - esconder em mobile
<div className="hidden md:block">
  <Table>
    {/* ... conteúdo da tabela ... */}
  </Table>
</div>
```

### Formulário Responsivo

Usar `grid-cols-1 md:grid-cols-2` para campos em coluna única no mobile.

### Menu Mobile no Header

Adicionar menu hamburger para navegação mobile:

```typescript
const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

// No header
<div className="md:hidden">
  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
    <Menu className="h-6 w-6" />
  </Button>
</div>

{/* Menu mobile dropdown */}
{mobileMenuOpen && (
  <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b shadow-lg p-4">
    <nav className="space-y-2">
      <a href="/orcamentos" className="block p-2 rounded hover:bg-secondary">
        📋 Orçamentos
      </a>
      <a href="/config" className="block p-2 rounded hover:bg-secondary">
        ⚙️ Configurações
      </a>
    </nav>
  </div>
)}
```

---

## 8.5 Acessibilidade (ARIA)

### Checklist de Acessibilidade

```typescript
// Labels em inputs
<Input
  id="cliente"
  aria-label="Nome do cliente"
  aria-required="true"
  aria-invalid={!!errors.cliente}
  aria-describedby={errors.cliente ? 'cliente-error' : undefined}
/>
{errors.cliente && (
  <p id="cliente-error" className="text-red-500 text-sm">
    {errors.cliente.message}
  </p>
)}

// Botões com aria-label quando só tem ícone
<Button variant="ghost" size="icon" aria-label="Mais opções">
  <MoreHorizontal className="h-4 w-4" />
</Button>

// Tabela com roles corretos
<Table role="table" aria-label="Lista de orçamentos">
  <TableHeader role="rowgroup">
    <TableRow role="row">
      <TableHead role="columnheader" scope="col">Número</TableHead>
    </TableRow>
  </TableHeader>
</Table>

// Status badges com aria-label
<Badge aria-label={`Status: ${config.label}`}>
  {config.icon} {config.label}
</Badge>

// Modais com focus trap (shadcn já faz isso)
<Dialog>
  <DialogContent aria-describedby="dialog-description">
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
      <DialogDescription id="dialog-description">
        Descrição do modal
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

---

## 8.6 Otimizações de Performance

### React Query (opcional, mas recomendado)

```bash
npm install @tanstack/react-query
```

**`lib/providers/query-provider.tsx`:**

```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minuto
        refetchOnWindowFocus: true,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

### Memoização de Componentes

```typescript
import { memo, useMemo, useCallback } from 'react'

// Memoizar componentes pesados
export const OrcamentoCard = memo(function OrcamentoCard({ orcamento }: Props) {
  // ...
})

// Memoizar cálculos
const valorTotal = useMemo(() => {
  return itens.reduce((acc, item) => acc + item.preco_total, 0)
}, [itens])

// Memoizar callbacks
const handleClick = useCallback(() => {
  // ...
}, [dependencies])
```

### Lazy Loading

```typescript
import dynamic from 'next/dynamic'

// Carregar componentes pesados sob demanda
const OrcamentoPDF = dynamic(
  () => import('@/components/features/orcamento-pdf').then(mod => mod.OrcamentoPDF),
  { loading: () => <Loading text="Carregando PDF..." /> }
)
```

---

## 8.7 Testes Manuais

### Checklist de Testes

**Autenticação:**
- [ ] Login com credenciais corretas
- [ ] Login com credenciais incorretas (mensagem de erro)
- [ ] Registro de novo usuário
- [ ] Logout
- [ ] Acesso a rotas protegidas sem login (redirect)
- [ ] Persistência de sessão após refresh

**Lista de Orçamentos:**
- [ ] Carregamento inicial
- [ ] Scroll infinito (carregar mais)
- [ ] Filtro por status
- [ ] Busca por texto
- [ ] Ordenação de colunas
- [ ] Limpar filtros
- [ ] Seleção múltipla
- [ ] Ações em lote

**Criação/Edição:**
- [ ] Criar orçamento mínimo (só cliente)
- [ ] Criar orçamento completo
- [ ] Adicionar item
- [ ] Editar item
- [ ] Duplicar item
- [ ] Excluir item
- [ ] Upload de anexo
- [ ] Preview de anexo
- [ ] Download de anexo
- [ ] Excluir anexo
- [ ] Salvar alterações
- [ ] Validação de campos obrigatórios

**Visualização:**
- [ ] Preview correto
- [ ] Baixar PDF
- [ ] Exportar CSV
- [ ] Exportar Excel
- [ ] Duplicar orçamento
- [ ] Alterar status

**Responsividade:**
- [ ] Desktop (> 1024px)
- [ ] Tablet (640px - 1024px)
- [ ] Mobile (< 640px)

---

## 8.8 Ajustes Finais de UI

- [ ] Verificar consistência de espaçamentos
- [ ] Verificar cores de status
- [ ] Verificar transições e animações
- [ ] Verificar feedback de ações (toasts)
- [ ] Verificar mensagens de erro
- [ ] Verificar placeholders
- [ ] Verificar títulos de páginas
- [ ] Verificar favicon
- [ ] Testar tema em diferentes navegadores

---

## ✅ Critérios de Conclusão da Fase 8

- [ ] Loading states em todas as páginas
- [ ] Empty states para listas vazias
- [ ] Error handling consistente
- [ ] 100% responsivo em mobile
- [ ] Acessibilidade básica (ARIA labels)
- [ ] Performance aceitável (< 3s carregamento)
- [ ] Todos os fluxos testados manualmente
- [ ] UI polida e consistente

---

## 🔗 Próxima Fase

➡️ [FASE 9: Deploy](./FASE9.MD)




