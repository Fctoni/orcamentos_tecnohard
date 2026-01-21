# Especificacao: Alteracao 04 - Reformulacao do Layout do PDF

| Aspecto | Detalhe |
|---------|---------|
| Status | 🟢 Concluido |
| Conversa | Esta conversa (21/01/2026) |
| Data criacao | 21/01/2026 |
| Complexidade | 🟡 Media |

**Status possiveis:**
- 🔵 Pronto para executar
- 🟠 Em execucao
- 🟢 Concluido
- ❌ Cancelado

---

## 1. Resumo

Reformulacao completa do layout do PDF de orcamentos, incluindo reorganizacao do cabecalho, nova estrutura de tabela de itens com mais colunas, melhorias de paginacao e numeracao de paginas.

---

## 2. O que foi feito

- [x] Mover numero do orcamento para canto superior direito
- [x] Remover titulo centralizado "Orcamento No:"
- [x] Merge das colunas Codigo + Item em uma unica coluna
- [x] Adicionar novas colunas: Material, Prazo, Fat. Min., Peso Un., Preco
- [x] Centralizar texto de cabecalhos e celulas de valores
- [x] Reduzir fonte das celulas para 9px (igual ao cabecalho)
- [x] Adicionar subtitulo "(dias uteis)" na coluna Prazo
- [x] Posicionar Informacoes Gerais e Elaborado Por acima do rodape
- [x] Implementar paginacao: Logo, numero, header da tabela em todas as paginas
- [x] Evitar corte de itens entre paginas (wrap={false})
- [x] Adicionar numeracao de paginas (X/Y) no rodape
- [x] Ordenar processos conforme hierarquia do drag & drop

---

## 3. UI - Layout do PDF

### 3.1 Cabecalho (todas as paginas)

```
┌──────────────────────────────────────────────────────────────┐
│                                              No: 2026-0003   │  <- fixed
│                                                              │
│                     ┌─────────────────┐                      │
│                     │   TECNO HARD    │                      │  <- fixed
│                     │  (logo central) │                      │
│                     └─────────────────┘                      │
│                                                              │
│                   Cliente: DELTA USINAGEM                    │
│                       Contato: JANSLE                        │
│                    Validade: 21/02/2026                      │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Tabela de Itens

```
ITENS DO ORCAMENTO
────────────────────────────────────────────────────────────────────────────

┌─────────────────────┬───────────┬─────────┬────────────┬──────────┬────────────┐
│        Item         │  Material │  Prazo  │  Fat. Min. │ Peso Un. │   Preco    │
│       (42%)         │   (12%)   │(d.uteis)│   (12%)    │  (10%)   │   (14%)    │
│                     │           │  (10%)  │            │          │            │
├─────────────────────┼───────────┼─────────┼────────────┼──────────┼────────────┤
│ 1 - ENGRENAGEM      │  SAE 8620 │    7    │ R$ 100,00  │  3.25 kg │ R$ 44,04/pc│
│ Tempera, Revenimento│           │         │            │          │            │
├─────────────────────┼───────────┼─────────┼────────────┼──────────┼────────────┤
│ ABC-123 - PINO GUIA │  Aco 1020 │   15    │     -      │    -     │ R$ 10,00/kg│
│ Corte, Usinagem     │           │         │            │          │            │
└─────────────────────┴───────────┴─────────┴────────────┴──────────┴────────────┘
```

**Detalhes:**
- Coluna Item: Codigo + " - " + Descricao + Processos (linha abaixo, fonte menor)
- Processos ordenados conforme hierarquia cadastrada (drag & drop)
- Colunas de valores centralizadas
- Fonte 9px em todas as celulas

### 3.3 Rodape (todas as paginas)

```
├──────────────────────────────────────────────────────────────┤
│  R. Emilio Fonini, 521 - Cinquentenario, Caxias do Sul - RS  │
│       (54) 3225-6464 - https://www.tecnohard.ind.br/         │
│                                                        1/3   │  <- so aparece se > 1 pagina
└──────────────────────────────────────────────────────────────┘
```

### 3.4 Paginacao

```
┌─────────── PAGINA 1 ───────────┐      ┌─────────── PAGINA 2 ───────────┐
│ No: 2026-0003          FIXED   │      │ No: 2026-0003          REPETE  │
│ [LOGO TECNO HARD]      FIXED   │      │ [LOGO TECNO HARD]      REPETE  │
│ Cliente: ...                   │      │                                │
│                                │      │ Item | Material | ...  REPETE  │
│ Item | Material | ...  FIXED   │      │ ────────────────────────────── │
│ ────────────────────────────── │      │ Item 4 (completo)              │
│ Item 1 (completo)              │      │ Item 5 (completo)              │
│ Item 2 (completo)              │      │ ...                            │
│ Item 3 (completo)              │      │ INFORMACOES GERAIS             │
├────────────────────────────────┤      ├────────────────────────────────┤
│ Rodape               FIXED     │      │ Rodape               REPETE    │
│                                │      │                          1/2   │
└────────────────────────────────┘      └────────────────────────────────┘
```

---

## 4. Implementacao Tecnica

### 4.1 Banco de Dados

Nenhuma alteracao necessaria.

### 4.2 Arquivos Modificados

| Acao | Arquivo | Descricao |
|------|---------|-----------|
| MODIFICAR | `components/features/orcamento-pdf.tsx` | Reformulacao completa do layout |
| MODIFICAR | `components/features/item-form.tsx` | Ordenar processos antes de salvar |

### 4.3 Alteracoes no orcamento-pdf.tsx

#### Estilos Alterados/Adicionados:

| Estilo | Alteracao |
|--------|-----------|
| `orcamentoNumero` | position: absolute, top: 25, right: 25 |
| `header` | Adicionado `fixed` |
| `tableHeader` | Adicionado `fixed`, alignItems: center |
| `tableRow` | Adicionado `wrap={false}` |
| `col1` | width: 42%, paddingHorizontal: 6 |
| `col2` | width: 12%, textAlign: center |
| `col3` | width: 10%, textAlign: center |
| `col4` | width: 12%, textAlign: center |
| `col5` | width: 10%, textAlign: center |
| `col6` | width: 14%, textAlign: center |
| `colHeader` | textAlign: center |
| `colCell` | fontSize: 9 |
| `footerContent` | marginTop: 'auto', marginBottom: 60 (empurra para o fundo da pagina) |
| `pageNumber` | NOVO - position: absolute, right: 0, bottom: 0 |

#### Estrutura da Tabela:

| Coluna | Largura | Conteudo |
|--------|---------|----------|
| Item | 42% | codigo_item + " - " + item + processos |
| Material | 12% | material ou "-" |
| Prazo | 10% | prazo_entrega (subtitulo: "dias uteis") |
| Fat. Min. | 12% | faturamento_minimo formatado ou "-" |
| Peso Un. | 10% | peso_unitario + " kg" ou "-" |
| Preco | 14% | preco_unitario + "/pc" ou "/kg" |

### 4.4 Alteracoes no item-form.tsx

```typescript
const handleSubmit = (data: ItemFormData) => {
  // Ordenar processos conforme hierarquia (drag & drop) antes de salvar
  if (data.processos && data.processos.length > 0) {
    const ordemMap = new Map(processos.map(p => [p.nome, p.ordem]))
    data.processos = [...data.processos].sort(
      (a, b) => (ordemMap.get(a) || 999) - (ordemMap.get(b) || 999)
    )
  }
  onSubmit(data)
}
```

---

## 5. Execucao

### 5.1 Progresso

- [x] Numero do orcamento no canto superior direito
- [x] Merge colunas Codigo + Item
- [x] Novas colunas (Material, Prazo, Fat. Min., Peso Un., Preco)
- [x] Centralizacao de cabecalhos e celulas
- [x] Subtitulo "(dias uteis)" na coluna Prazo
- [x] Elementos fixed (logo, numero, header tabela)
- [x] wrap={false} nas linhas da tabela
- [x] Numeracao de paginas condicional
- [x] Ordenacao de processos conforme hierarquia
- [x] TypeScript sem erros

### 5.2 Notas de Implementacao

**Decisoes tomadas:**
1. Processos ordenados na fonte (item-form.tsx) em vez de no PDF - garante consistencia em todos os lugares
2. Numeracao de paginas so aparece se totalPages > 1
3. Logo e numero do orcamento repetidos via `fixed` para identificacao em todas as paginas
4. Itens nao sao cortados entre paginas (`wrap={false}`)

**Observacao:** Itens ja existentes no banco mantem a ordem antiga de processos. A ordenacao automatica so se aplica a novos itens ou itens editados.

---

## 6. Validacao Final

- [x] `npx tsc --noEmit` sem erros
- [x] Funcionalidade testada manualmente
- [x] PRD atualizado (via PRD-editor) - v1.03
