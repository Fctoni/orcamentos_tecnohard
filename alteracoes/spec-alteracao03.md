# Especificacao: Alteracao 03 - Expandir itens na lista de orcamentos

| Aspecto | Detalhe |
|---------|---------|
| Status | 🟢 Concluido |
| Conversa | [alteracao03.md](./alteracao03.md) |
| Data criacao | 21/01/2026 |
| Complexidade | 🟢 Baixa |

**Status possiveis:**
- 🔵 Pronto para executar
- 🟠 Em execucao
- 🟢 Concluido
- ❌ Cancelado

---

## 1. Resumo

Adicionar botao de expansao em cada linha da tabela de orcamentos para visualizar os itens (Codigo, Descricao, Valor/unidade) sem navegar para outra pagina. Multiplos orcamentos podem ficar expandidos simultaneamente.

---

## 2. O que sera feito

- [ ] Adicionar nova coluna com botao de expansao (ChevronDown/Up) entre "Valor Total" e "Acoes"
- [ ] Implementar estado de expansao para multiplos orcamentos
- [ ] Criar funcao para buscar itens de um orcamento sob demanda
- [ ] Renderizar linha expandida com mini-tabela de itens
- [ ] Implementar versao mobile (cards) com mesma funcionalidade
- [ ] Tratar caso de orcamento sem itens

---

## 3. UI Proposta

### 3.1 Tabela de Orcamentos com Expansao (Desktop)

```
┌─────┬─────────┬────────────────┬────────────┬────────────┬─────────────┬─────┬───────┐
│ [ ] │ Numero  │ Cliente        │ Status     │ Data       │ Valor Total │  V  │ Acoes │
├─────┼─────────┼────────────────┼────────────┼────────────┼─────────────┼─────┼───────┤
│ [ ] │ ORC-001 │ Cliente ABC    │ Rascunho   │ 21/01/2026 │ R$ 1.500,00 │ [v] │ [...] │
├─────┼─────────┼────────────────┼────────────┼────────────┼─────────────┼─────┼───────┤
│ [ ] │ ORC-002 │ Cliente XYZ    │ Aprovado   │ 20/01/2026 │ R$ 3.200,00 │ [^] │ [...] │
├─────┴─────────┴────────────────┴────────────┴────────────┴─────────────┴─────┴───────┤
│     ┌───────────────┬────────────────────────────────────────┬──────────────┐        │
│     │  Codigo       │ Descricao                              │ Valor        │        │
│     ├───────────────┼────────────────────────────────────────┼──────────────┤        │
│     │  ITEM-001     │ Parafuso cabeca sextavada M8x30        │ R$ 0,50/pc   │        │
│     │  ITEM-002     │ Chapa aco galvanizado 2mm              │ R$ 45,00/kg  │        │
│     │  ITEM-003     │ Tubo aluminio 25mm                     │ R$ 12,00/pc  │        │
│     └───────────────┴────────────────────────────────────────┴──────────────┘        │
├─────┬─────────┬────────────────┬────────────┬────────────┬─────────────┬─────┬───────┤
│ [ ] │ ORC-003 │ Cliente DEF    │ Enviado    │ 19/01/2026 │ R$ 800,00   │ [v] │ [...] │
└─────┴─────────┴────────────────┴────────────┴────────────┴─────────────┴─────┴───────┘
```

**Legenda:**
- [v] = ChevronDown (recolhido) - ao clicar, expande
- [^] = ChevronUp (expandido) - ao clicar, recolhe

**Comportamentos Desktop:**
- Nova coluna entre "Valor Total" e "Acoes" com botao de expansao
- Botao ChevronDown quando recolhido, ChevronUp quando expandido
- Multiplos orcamentos podem estar expandidos simultaneamente
- Click na linha (fora do botao) continua navegando para pagina do orcamento
- Tabela de itens aparece em linha extra com fundo bg-muted/50
- Se nao houver itens: "Nenhum item cadastrado"

### 3.2 Versao Mobile (Cards)

```
┌─────────────────────────────────────────────────────────┐
│ [ ] ORC-002                            Rascunho    [^] │
│     Cliente XYZ                                   [...] │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ITEM-001 │ Parafuso cabeca sextavada  │ R$ 0,50/pc │ │
│ │ ITEM-002 │ Chapa aco galvanizado      │ R$ 45,00/kg│ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ 20/01/2026                               R$ 3.200,00   │
└─────────────────────────────────────────────────────────┘
```

**Comportamentos Mobile:**
- Botao [v/^] no canto superior direito, antes do menu de acoes
- Itens aparecem em secao colapsavel entre cabecalho e rodape do card
- Click no card (fora do botao) continua navegando para orcamento

---

## 4. Implementacao Tecnica

### 4.1 Banco de Dados

Nenhuma alteracao necessaria. Os dados ja existem na tabela `orcamento_itens`:
- `codigo_item` - Codigo do item
- `item` - Descricao
- `preco_unitario` - Valor
- `unidade` - Unidade (pc, kg, etc.)

### 4.2 Arquivos a Modificar/Criar

| Acao | Arquivo | Descricao |
|------|---------|-----------|
| MODIFICAR | `components/features/orcamentos-table.tsx` | Adicionar coluna de expansao, estado expandedIds, linha de itens |
| MODIFICAR | `lib/hooks/use-orcamentos.ts` | Adicionar funcao fetchItensOrcamento |
| MODIFICAR | `lib/utils/format.ts` | Adicionar funcao formatValorComUnidade (se nao existir) |

### 4.3 Detalhes de Implementacao

#### 4.3.1 Estado de Expansao (orcamentos-table.tsx)

```typescript
// Estado para controlar quais orcamentos estao expandidos
const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

// Estado para armazenar itens carregados (cache)
const [itensCache, setItensCache] = useState<Record<string, OrcamentoItem[]>>({})

// Estado de loading por orcamento
const [loadingItens, setLoadingItens] = useState<Set<string>>(new Set())

const toggleExpand = async (id: string, e: React.MouseEvent) => {
  e.stopPropagation() // Evitar navegacao
  
  const newExpanded = new Set(expandedIds)
  if (newExpanded.has(id)) {
    newExpanded.delete(id)
  } else {
    newExpanded.add(id)
    // Carregar itens se ainda nao estao em cache
    if (!itensCache[id]) {
      await loadItens(id)
    }
  }
  setExpandedIds(newExpanded)
}
```

#### 4.3.2 Funcao para Buscar Itens (use-orcamentos.ts)

```typescript
const fetchItensOrcamento = async (orcamentoId: string) => {
  const { data, error } = await supabase
    .from('orcamento_itens')
    .select('codigo_item, item, preco_unitario, unidade')
    .eq('orcamento_id', orcamentoId)
    .order('ordem')
  
  return { data, error }
}
```

#### 4.3.3 Nova Coluna no Header

```tsx
<TableHead className="w-[50px]">
  {/* Coluna vazia para botao de expansao */}
</TableHead>
```

#### 4.3.4 Botao de Expansao na Linha

```tsx
<TableCell onClick={(e) => e.stopPropagation()}>
  <Button
    variant="ghost"
    size="icon"
    onClick={(e) => toggleExpand(orcamento.id, e)}
    aria-label={expandedIds.has(orcamento.id) ? 'Recolher itens' : 'Expandir itens'}
  >
    {expandedIds.has(orcamento.id) 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />
    }
  </Button>
</TableCell>
```

#### 4.3.5 Linha Expandida com Itens

```tsx
{expandedIds.has(orcamento.id) && (
  <TableRow className="bg-muted/50 hover:bg-muted/50">
    <TableCell colSpan={8} className="p-4">
      {loadingItens.has(orcamento.id) ? (
        <div className="text-center text-muted-foreground">Carregando...</div>
      ) : itensCache[orcamento.id]?.length === 0 ? (
        <div className="text-center text-muted-foreground">Nenhum item cadastrado</div>
      ) : (
        <div className="ml-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Codigo</TableHead>
                <TableHead>Descricao</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itensCache[orcamento.id]?.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm text-center">{item.codigo_item}</TableCell>
                  <TableCell className="text-center">{item.item}</TableCell>
                  <TableCell className="text-center">
                    {formatCurrency(item.preco_unitario)}/{item.unidade}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </TableCell>
  </TableRow>
)}
```

### 4.4 Dependencias Externas

- [ ] Nenhuma - usar apenas componentes e icones ja existentes (ChevronDown, ChevronUp de lucide-react)

---

## 5. Execucao

*(preenchido pelo Executor)*

### 5.1 Progresso

- [x] Modificar orcamentos-table.tsx - adicionar estado e logica de expansao
- [x] Modificar orcamentos-table.tsx - adicionar coluna no header
- [x] Modificar orcamentos-table.tsx - adicionar botao na linha
- [x] Modificar orcamentos-table.tsx - adicionar linha expandida
- [x] Modificar use-orcamentos.ts - adicionar fetchItensOrcamento
- [x] Implementar versao mobile
- [x] TypeScript sem erros
- [x] Testado manualmente

### 5.2 Notas de Implementacao

#### Checkpoint 21/01/2026 - 08:50
**Arquivos modificados:**
- `components/features/orcamentos-table.tsx` - Adicionado estados (expandedIds, itensCache, loadingItens), funcao toggleExpand, coluna de expansao, linha expandida com mini-tabela, versao mobile com itens
- `lib/hooks/use-orcamentos.ts` - Adicionado funcao fetchItensOrcamento (nao utilizada diretamente no componente, pois foi criada funcao local para simplificar)

**Decisoes:**
- Optou-se por criar a funcao de busca de itens localmente no componente para evitar dependencia adicional via props
- Usado React.Fragment para envolver TableRow principal + TableRow de itens expandidos
- Mobile: itens aparecem entre cabecalho e rodape do card, com layout compacto

**TypeScript:** ✅ Sem erros

#### Ajustes de estilo (solicitados durante teste manual):
- Mini-tabela com `w-auto` para nao ocupar 100% da largura
- Cabeçalhos com `text-base font-bold text-center`
- Coluna Descricao com `min-w-[250px]`
- Celulas de dados centralizadas (`text-center`)
- Linha divisoria entre cabecalho e dados (`border-b-2 border-slate-500`)

### 5.3 Conversa de Execucao

*(problemas encontrados durante execucao, solucoes propostas)*

#### IA:
[mensagem]

---

## 6. Validacao Final

- [x] `npx tsc --noEmit` sem erros
- [x] Funcionalidade testada manualmente
- [x] PRD atualizado (via PRD-editor) - v1.02
