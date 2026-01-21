# Alteração 05 - Sincronizar Preview com Layout do PDF

| Aspecto | Detalhe |
|---------|---------|
| Status | 🟢 Especificação criada |
| Origem | Solicitação do usuário (21/01/2026) |
| Complexidade | 🟡 Média |
| Especificação | [spec-alteracao05.md](./spec-alteracao05.md) |

**Status possíveis:**
- 🟡 Em planejamento
- 🟢 Especificação criada → ver [spec-alteracao05.md](./spec-alteracao05.md)

---

## 1. Ideia Inicial

Sincronizar o layout da visualização do orçamento na página (`/orcamentos/[id]` → `orcamento-preview.tsx`) com o novo layout do PDF implementado na alteração 04.

**Diferenças identificadas entre Preview atual e PDF:**

| Aspecto | Preview Atual | PDF (novo) |
|---------|---------------|------------|
| Número do orçamento | Texto inline no centro | Canto superior direito |
| Título "ORÇAMENTO" | Existe, centralizado | Removido |
| Colunas da tabela | Código, Item, Peso Un., Preço Un. | Item (código+desc), Material, Prazo, Fat.Mín., Peso Un., Preço |
| Detalhes do item | Texto secundário dentro da célula Item | Processos abaixo do nome, outras infos em colunas próprias |
| Subtítulo Prazo | Não tem | "(dias úteis)" |
| Elaborado por | Não existe | Exibe acima do rodapé |

---

## 2. Conversa de Planejamento

#### usuário: sincronizar preview com layout do PDF

#### IA: Analisei os componentes e identifiquei as diferenças

Olá! Analisei os dois componentes:

- `orcamento-preview.tsx` (visualização na página)
- `orcamento-pdf.tsx` (PDF gerado)

As principais mudanças necessárias são:

### Estrutura geral:
1. **Remover** título "ORÇAMENTO" centralizado
2. **Mover** número do orçamento para canto superior direito
3. **Adicionar** campo "Elaborado por" (já existe no PDF)

### Tabela de itens:
4. **Reestruturar** colunas conforme PDF:
   - Item (42%) → código + " - " + descrição + processos
   - Material (12%)
   - Prazo (10%) com subtítulo "(dias úteis)"
   - Fat. Mín. (12%)
   - Peso Un. (10%)
   - Preço (14%)

### Comportamentos a manter:
- Botão "Ver anexos" deve continuar funcionando (modal de anexos)
- Funcionalidade de carregar logo da configuração deve permanecer

### Pergunta:

Você quer que o preview fique **idêntico** ao PDF (mesma estrutura visual), ou quer manter algumas diferenças funcionais (como a interatividade dos anexos em posição diferente)?

---

#### usuário: anexos como coluna, ajustes para tela

O 'ver anexos' deve ser uma coluna extra na tabela. 
Não teremos mais a 'limitação' da largura da folha A4, logo, podemos ter ajustes que façam sentido nessa visualização 'em tela'. A páginação também não faz sentido aqui, pois a tela tem scroll.

Verifique que outras funcionalidades você sugere manter / remover ou adicionar, com este contexto

---

#### IA: Proposta de adaptações específicas para tela

Ótimo ponto! Como a tela não tem as limitações do PDF, podemos aproveitar melhor o espaço e adicionar interatividade. Segue minha proposta:

### ✅ MANTER (vindo do PDF)

| Elemento | Motivo |
|----------|--------|
| Número do orçamento no canto superior direito | Identificação rápida |
| Logo centralizado | Identidade visual |
| Estrutura base da tabela (Item, Material, Prazo, Fat.Mín., Peso Un., Preço) | Consistência com PDF |
| Processos abaixo do nome do item | Organização visual |
| Subtítulo "(dias úteis)" no Prazo | Clareza |
| Seção "Elaborado por" | Informação importante |
| Seção "Informações Gerais" | Contexto do orçamento |

### ➕ ADICIONAR (específico para tela)

| Funcionalidade | Descrição |
|----------------|-----------|
| **Coluna "Anexos"** | Ícone 📎 + contador. Clique abre modal (funcionalidade atual) | R: 'ÓTIMO'
| **Link clicável no rodapé** | Site da empresa como link `<a href>` | R: 'NÃO FAZ SENTIDO NENHUM'
| **Hover nas linhas** | Destaque visual ao passar o mouse | R: 'NÃO FAZ SENTIDO NENHUM'
| **Colunas mais espaçadas** | Sem restrição de A4, podemos ter mais padding | R: 'ÓTIMO'

### ❌ REMOVER (não faz sentido em tela)

| Elemento | Motivo |
|----------|--------|
| Título "ORÇAMENTO" centralizado | Redundante (já está no header da página) | R: 'ÓTIMO'
| Qualquer referência a paginação | Tela usa scroll | R: 'ÓTIMO'

### 🤔 DECISÕES PENDENTES

1. **Valor Total**: Manter no final da tabela ou criar uma seção separada mais destacada? R: 'MANTER NO FINAL'
2. **Responsividade**: A tabela deve ser responsiva (scroll horizontal em mobile) ou simplificar colunas em telas pequenas? R: 'SCROLL HORIZONTAL EM MOBILE'
3. **Coluna Anexos**: Posição - última coluna ou após "Item"? R: 'ÚLTIMA COLUNA'

### Proposta de colunas finais:

```
| Item (35%) | Material (12%) | Prazo (10%) | Fat.Mín. (12%) | Peso Un. (10%) | Preço (13%) | Anexos (8%) |
```

**Pergunta:** As adaptações propostas estão de acordo? Posso desenhar a UI em ASCII para aprovação?

---

#### usuário: respostas inline

Respondi cada item logo após cada pergunta

#### IA: Consolidação das decisões + UI proposta

Perfeito! Consolidando as decisões:

### Decisões Finais

| Item | Decisão |
|------|---------|
| Coluna "Anexos" | ✅ Sim - ícone 📎 + contador, última coluna |
| Link clicável rodapé | ❌ Não |
| Hover nas linhas | ❌ Não |
| Colunas mais espaçadas | ✅ Sim |
| Remover título "ORÇAMENTO" | ✅ Sim |
| Valor Total | Final da tabela |
| Responsividade | Scroll horizontal em mobile |

---

## 3. UI Proposta (Rascunho)

### 3.1 Estrutura Geral

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                                                              Nº: 2026-0003     │
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
│  ITENS DO ORÇAMENTO                                                            │
│  ──────────────────────────────────────────────────────────────────────────    │
│                                                                                │
│  ┌────────────────────┬──────────┬─────────┬──────────┬─────────┬────────┬───┐ │
│  │       Item         │ Material │  Prazo  │ Fat.Mín. │ Peso Un.│  Preço │📎 │ │
│  │                    │          │(d.úteis)│          │         │        │   │ │
│  ├────────────────────┼──────────┼─────────┼──────────┼─────────┼────────┼───┤ │
│  │ ABC-123 - PINO     │ SAE 8620 │    7    │ R$100,00 │ 3.25 kg │R$44/pç │📎2│ │
│  │ Tempera, Revenimento│          │         │          │         │        │   │ │
│  ├────────────────────┼──────────┼─────────┼──────────┼─────────┼────────┼───┤ │
│  │ DEF-456 - EIXO     │ Aço 1020 │   15    │    -     │    -    │R$10/kg │ - │ │
│  │ Corte, Usinagem    │          │         │          │         │        │   │ │
│  └────────────────────┴──────────┴─────────┴──────────┴─────────┴────────┴───┘ │
│                                                                                │
│                                          VALOR TOTAL: R$ 1.234,56              │
│                                                                                │
├────────────────────────────────────────────────────────────────────────────────┤
│  INFORMAÇÕES GERAIS                                                            │
│  ──────────────────────────────────────────────────────────────────────────    │
│  Frete: CIF                                                                    │
│  Prazo de Faturamento: 30 dias                                                 │
│  Observações: ...                                                              │
│                                                                                │
│                                                       Elaborado por:           │
│                                                       João Silva               │
│                                                       vendas@tecnohard.com.br  │
├────────────────────────────────────────────────────────────────────────────────┤
│           R. Emílio Fonini, 521 - Cinquentenário, Caxias do Sul - RS           │
│                 (54) 3225-6464 - https://www.tecnohard.ind.br/                  │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Coluna Anexos - Comportamento

```
┌───────┐
│  📎 2 │  ← Clicável. Número = quantidade de anexos
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

Se item não tem anexos:
┌───────┐
│   -   │  ← Não clicável
└───────┘
```

### 3.3 Responsividade Mobile

```
┌─────────────────────────────────┐
│  Nº: 2026-0003                  │
│  [LOGO]                         │
│  Cliente: DELTA USINAGEM        │
│  ...                            │
├─────────────────────────────────┤
│  ← scroll horizontal →          │
│  ┌──────────────────────────────│───────────────────┐
│  │ Item    │ Material │ Prazo  ││ Fat.Mín │ ... │📎│
│  ├─────────┼──────────┼────────│├─────────┼─────┼───┤
│  │ ABC-123 │ SAE 8620 │   7    ││ R$100   │ ... │📎2│
│  └─────────┴──────────┴────────│┴─────────┴─────┴───┘
└─────────────────────────────────┘
```

**Status:** 🟡 Aguardando aprovação

**Pergunta:** As UIs propostas estão de acordo? Posso criar a especificação técnica?

---

#### usuário: aprovado

aprovado

---

#### IA: Especificação criada

Especificação técnica criada em `spec-alteracao05.md`. O Executor pode iniciar a implementação.

**Resumo do que será implementado:**
- Reestruturar layout do preview conforme PDF
- Nova tabela com 7 colunas (Item, Material, Prazo, Fat.Mín., Peso Un., Preço, Anexos)
- Número do orçamento no canto superior direito
- Seção "Elaborado por"
- Scroll horizontal em mobile

