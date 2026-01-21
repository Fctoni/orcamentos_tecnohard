# Especificacao: Alteracao 05 - Sincronizar Preview com Layout do PDF

| Aspecto | Detalhe |
|---------|---------|
| Status | 🟢 Concluido |
| Conversa | [alteracao05.md](./alteracao05.md) |
| Data criacao | 21/01/2026 |
| Complexidade | 🟡 Media |

**Status possiveis:**
- 🔵 Pronto para executar
- 🟠 Em execucao
- 🟢 Concluido
- ❌ Cancelado

---

## 1. Resumo

Sincronizar o layout do componente `orcamento-preview.tsx` com o novo layout do PDF (alteracao 04), adaptando para visualizacao em tela com coluna extra de anexos e scroll horizontal em mobile.

---

## 2. O que sera feito

- [ ] Remover titulo "ORCAMENTO" centralizado
- [ ] Mover numero do orcamento para canto superior direito
- [ ] Reestruturar tabela com novas colunas (Item, Material, Prazo, Fat.Min., Peso Un., Preco, Anexos)
- [ ] Coluna Item: codigo + " - " + descricao + processos (linha abaixo)
- [ ] Adicionar subtitulo "(dias uteis)" na coluna Prazo
- [ ] Adicionar coluna "Anexos" como ultima coluna (icone + contador)
- [ ] Adicionar secao "Elaborado por" acima do rodape
- [ ] Implementar scroll horizontal em mobile
- [ ] Ajustar espacamento das colunas (sem restricao A4)

---

## 3. UI Proposta

### 3.1 Estrutura Geral

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                                                              No: 2026-0003     │
│                                                                                │
│                          ┌─────────────────────┐                               │
│                          │    TECNO HARD       │                               │
│                          │   (logo central)    │                               │
│                          └─────────────────────┘                               │
│                                                                                │
│                          Cliente: DELTA USINAGEM                               │
│                              Contato: JANSLE                                   │
│                           Validade: 21/02/2026                                 │
│                                                                                │
├────────────────────────────────────────────────────────────────────────────────┤
│  ITENS DO ORCAMENTO                                                            │
│  ──────────────────────────────────────────────────────────────────────────    │
│                                                                                │
│  ┌────────────────────┬──────────┬─────────┬──────────┬─────────┬────────┬───┐ │
│  │       Item         │ Material │  Prazo  │ Fat.Min. │ Peso Un.│  Preco │📎 │ │
│  │                    │          │(d.uteis)│          │         │        │   │ │
│  ├────────────────────┼──────────┼─────────┼──────────┼─────────┼────────┼───┤ │
│  │ ABC-123 - PINO     │ SAE 8620 │    7    │ R$100,00 │ 3.25 kg │R$44/pc │📎2│ │
│  │ Tempera, Revenimento│          │         │          │         │        │   │ │
│  ├────────────────────┼──────────┼─────────┼──────────┼─────────┼────────┼───┤ │
│  │ DEF-456 - EIXO     │ Aco 1020 │   15    │    -     │    -    │R$10/kg │ - │ │
│  │ Corte, Usinagem    │          │         │          │         │        │   │ │
│  └────────────────────┴──────────┴─────────┴──────────┴─────────┴────────┴───┘ │
│                                                                                │
│                                          VALOR TOTAL: R$ 1.234,56              │
│                                                                                │
├────────────────────────────────────────────────────────────────────────────────┤
│  INFORMACOES GERAIS                                                            │
│  ──────────────────────────────────────────────────────────────────────────    │
│  Frete: CIF                                                                    │
│  Prazo de Faturamento: 30 dias                                                 │
│  Observacoes: ...                                                              │
│                                                                                │
│                                                       Elaborado por:           │
│                                                       Joao Silva               │
│                                                       vendas@tecnohard.com.br  │
├────────────────────────────────────────────────────────────────────────────────┤
│           R. Emilio Fonini, 521 - Cinquentenario, Caxias do Sul - RS           │
│                 (54) 3225-6464 - https://www.tecnohard.ind.br/                  │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Coluna Anexos - Comportamento

```
┌───────┐
│  📎 2 │  <- Clicavel. Numero = quantidade de anexos
└───────┘
    │
    ▼ (ao clicar)
┌──────────────────────────────────────────┐
│  📎 Anexos - PINO GUIA                   │
├──────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐      │
│  │ img1   │  │ pdf1   │  │ ...    │      │
│  │ [Ver]  │  │ [Ver]  │  │        │      │
│  │[Baixar]│  │[Baixar]│  │        │      │
│  └────────┘  └────────┘  └────────┘      │
└──────────────────────────────────────────┘

Se item nao tem anexos:
┌───────┐
│   -   │  <- Nao clicavel
└───────┘
```

### 3.3 Responsividade Mobile

```
┌─────────────────────────────────┐
│  No: 2026-0003                  │
│  [LOGO]                         │
│  Cliente: DELTA USINAGEM        │
│  ...                            │
├─────────────────────────────────┤
│  <- scroll horizontal ->        │
│  ┌──────────────────────────────│───────────────────┐
│  │ Item    │ Material │ Prazo  ││ Fat.Min │ ... │📎│
│  ├─────────┼──────────┼────────│├─────────┼─────┼───┤
│  │ ABC-123 │ SAE 8620 │   7    ││ R$100   │ ... │📎2│
│  └─────────┴──────────┴────────│┴─────────┴─────┴───┘
└─────────────────────────────────┘
```

**Comportamentos:**
- Coluna Anexos: icone 📎 + contador, clique abre modal existente
- Se item nao tem anexos: exibe "-" (nao clicavel)
- Mobile: tabela com scroll horizontal (overflow-x-auto)
- Manter funcionalidade do modal de anexos existente

---

## 4. Implementacao Tecnica

### 4.1 Banco de Dados

Nenhuma alteracao necessaria.

### 4.2 Arquivos a Modificar/Criar

| Acao | Arquivo | Descricao |
|------|---------|-----------|
| MODIFICAR | `components/features/orcamento-preview.tsx` | Reestruturar layout conforme PDF |

### 4.3 Alteracoes no orcamento-preview.tsx

#### Estrutura do Header:

**Remover:**
```tsx
<h1 className="text-3xl font-bold text-gray-800">ORCAMENTO</h1>
```

**Adicionar (numero no canto superior direito):**
```tsx
<div className="relative">
  <span className="absolute top-0 right-0 text-sm font-medium">
    No: {orcamento.numero}
  </span>
  {/* logo centralizado */}
</div>
```

#### Estrutura da Tabela:

| Coluna | Largura aprox. | Conteudo |
|--------|----------------|----------|
| Item | flex-1 (maior) | codigo_item + " - " + item + processos (abaixo) |
| Material | ~100px | material ou "-" |
| Prazo | ~80px | prazo_entrega + header com "(dias uteis)" |
| Fat. Min. | ~100px | faturamento_minimo formatado ou "-" |
| Peso Un. | ~80px | peso_unitario + " kg" ou "-" |
| Preco | ~100px | preco_unitario + "/pc" ou "/kg" |
| Anexos | ~60px | icone 📎 + contador ou "-" |

#### Secao Elaborado Por:

```tsx
{orcamento.elaborado_por && (
  <div className="text-right mt-4">
    {orcamento.elaborado_por.split('\n').map((linha, idx) => (
      <p key={idx} className="text-sm">{linha}</p>
    ))}
  </div>
)}
```

#### Responsividade:

```tsx
<div className="overflow-x-auto">
  <Table className="min-w-[800px]">
    {/* ... */}
  </Table>
</div>
```

### 4.4 Dependencias Externas

- Nenhuma

---

## 5. Execucao

*(preenchido pelo Executor)*

### 5.1 Progresso

- [x] Numero do orcamento no canto superior direito
- [x] Remover titulo "ORCAMENTO"
- [x] Reestruturar tabela com novas colunas
- [x] Coluna Item: codigo + descricao + processos
- [x] Subtitulo "(dias uteis)" na coluna Prazo
- [x] Coluna Anexos (ultima coluna)
- [x] Secao "Elaborado por"
- [x] Scroll horizontal em mobile
- [x] TypeScript sem erros
- [x] Testado manualmente pelo usuário

### 5.2 Notas de Implementacao

**Checkpoint 21/01/2026**

Arquivo modificado: `components/features/orcamento-preview.tsx`

Alteracoes realizadas:
1. Header reestruturado com numero do orcamento no canto superior direito (posicao absoluta)
2. Titulo "ORCAMENTO" removido - dados do cliente ficam diretamente apos o logo
3. Tabela com 7 colunas: Item, Material, Prazo (dias uteis), Fat.Min., Peso Un., Preco, Anexos
4. Coluna Item unificada: codigo_item + " - " + descricao + processos na linha abaixo
5. Coluna Anexos como icone clicavel (📎 + contador) que abre o modal existente
6. Secao "Elaborado por" adicionada antes do rodape
7. Wrapper `overflow-x-auto` com `min-w-[800px]` na tabela para scroll horizontal em mobile

**TypeScript:** ✅ Sem erros

### 5.3 Conversa de Execucao

*(problemas encontrados durante execucao, solucoes propostas)*

---

## 6. Validacao Final

- [x] `npx tsc --noEmit` sem erros
- [x] Funcionalidade testada manualmente pelo usuário

