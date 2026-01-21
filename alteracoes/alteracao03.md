# Alteracao 03 - Expandir itens na lista de orcamentos

| Aspecto | Detalhe |
|---------|---------|
| Status | 🟢 Especificacao criada |
| Origem | Solicitacao do usuario |
| Complexidade | 🟢 Baixa |
| Especificacao | [spec-alteracao03.md](./spec-alteracao03.md) |

**Status possiveis:**
- 🟡 Em planejamento
- 🟢 Especificacao criada → ver [spec-alteracao03.md](./spec-alteracao03.md)

---

## 1. Ideia Inicial

Na pagina inicial de orcamentos, onde e exibida a lista (tabela) de orcamentos, inserir um botao de visualizar em cada linha para expandir os itens do orcamento sem precisar abrir a pagina de detalhes.

---

## 2. Conversa de Planejamento

#### usuario: Botao para expandir itens na lista de orcamentos

Preciso de um botao em cada orcamento da lista para poder ver os itens dele sem precisar abrir a pagina do orcamento.

#### IA: Perguntas de esclarecimento sobre o comportamento desejado

Entendi! Voce quer visualizar os itens de um orcamento diretamente na lista, sem navegar para outra pagina. Tenho algumas perguntas para definir melhor a funcionalidade:

**1. Sobre o comportamento de expansao:**
- O botao deve expandir apenas um orcamento por vez (estilo acordeao, onde abrir um fecha o outro)?
- Ou pode ter multiplos orcamentos expandidos simultaneamente?
R: pode abrir múltiplos expandidos simultaneamente

**2. Sobre as informacoes dos itens:**
- Quais dados dos itens devem aparecer na expansao?
  R: 
  ```
  Somente estes abaixo:
  
  - Codigo do item
  - Descricao
  - Valor (com unidade, se é '/pc' ou '/kg')
  ```


**3. Sobre o botao:**
- Prefere um botao com icone de seta/chevron (▼/▲) no inicio da linha?
- Ou prefere usar o proprio click na linha para expandir/recolher?
R: hoje o click na linha abre o orçamento, queremos manter essa funcionalidade. Colocar botão com seta na direita, entre 'valor total' e 'ações'

**4. Posicionamento:**
- A area expandida deve aparecer logo abaixo da linha do orcamento na tabela?
R: Sim

---

#### usuario: Respondeu as perguntas inline

Respondido cada item abaixo da pergunta

#### IA: Proposta de UI com base nas respostas

Perfeito! Com base nas suas respostas, vou desenhar a UI proposta na secao 3.

**Resumo das decisoes:**
- Multiplos orcamentos podem ficar expandidos ao mesmo tempo
- Dados exibidos: Codigo, Descricao, Valor com unidade (/pc ou /kg)
- Botao com seta entre "Valor Total" e "Acoes"
- Area expandida aparece logo abaixo da linha
- Click na linha continua abrindo o orcamento

A UI foi desenhada na **Secao 3** abaixo. Por favor, revise e me diga se esta de acordo para eu criar a especificacao tecnica.

---

#### usuario:



---

## 3. UI Proposta (Rascunho)

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
- Botao [v] (ChevronDown) quando recolhido
- Botao [^] (ChevronUp) quando expandido
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

**Status:** 🟢 Aprovado

---

## 4. Decisoes Importantes

- Decisao 1: Multiplos orcamentos podem estar expandidos simultaneamente (nao e acordeao)
- Decisao 2: Dados dos itens: Codigo, Descricao, Valor com unidade
- Decisao 3: Botao de expansao fica entre "Valor Total" e "Acoes" na tabela
- Decisao 4: Click na linha mantem navegacao para pagina do orcamento

---

## 5. Checkpoints

*(Adicionados automaticamente em sessoes longas)*
