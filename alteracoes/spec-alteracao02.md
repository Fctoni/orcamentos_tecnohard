# Especificação: Alteração 02 - Ajustes Diversos de UX e PDF

| Aspecto | Detalhe |
|---------|---------|
| Status | 🟢 Concluido |
| Conversa | [alteracao02.md](./alteracao02.md) |
| Data criação | 20/01/2026 |
| Complexidade | 🟡 Média (10 itens pequenos) |

**Status possíveis:**
- 🔵 Pronto para executar
- 🟠 Em execução
- 🟢 Concluído
- ❌ Cancelado

---

## 1. Resumo

Consolidação de 10 ajustes de UX e PDF: correções de bugs (upload logo, atualização anexos), novos campos (observações internas, elaborado por), melhorias no PDF (título ANO-SEQ, fonte cliente maior, infos no fundo) e ajustes de formulário (prazo numérico, observações pré-preenchidas).

---

## 2. O que será feito

### Correções de Bugs
- [ ] **01** - Mostrar "(por kg)" na visualização quando item usa preço por kg
- [ ] **02** - Atualizar lista de anexos imediatamente após exclusão
- [ ] **03** - Campo preço por kg iniciar vazio (null) em vez de 0
- [ ] **04** - Corrigir bug no upload de logo

### Novos Campos
- [ ] **05** - Criar campo "Observações Internas" no orçamento (não aparece no PDF)
- [ ] **06** - Criar campo "Elaborado por" (config default + campo no orçamento + exibição no PDF)

### Ajustes no PDF
- [ ] **07** - Título como "Orçamento Nº: 2025-0006" (ANO-SEQ) + fonte menor
- [ ] **08** - Nome do cliente com fonte ~10% maior
- [ ] **10** - Informações gerais alinhadas próximo ao rodapé

### Ajustes no Formulário
- [ ] **09** - Prazo de entrega: campo numérico + sufixo automático "dias úteis"
- [ ] **11** - Observações pré-preenchidas com frase padrão

---

## 3. UI Proposta

### 3.1 Tela de Configurações - Novo Campo

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ⚙️ Configurações                                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  🖼️ Logo da Empresa                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  [Logo atual ou placeholder]                                    │   │
│  │                                              [📤 Upload Logo]   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ───────────────────────────────────────────────────────────────────   │
│                                                                         │
│  ✍️ Responsável pelo Orçamento (padrão)                                 │  ← NOVO
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ José Adair Giubel                                               │   │
│  │ Fone / email: (54) 3218-2168 / jaogiube@tecnohard.ind.br        │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  Texto livre, múltiplas linhas. Será usado como padrão em novos        │
│  orçamentos.                                                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Comportamentos:**
- Campo textarea multilinha
- Chave: `elaborado_por_default`
- Salva automaticamente ao perder foco (ou botão salvar)
- Valor usado como default ao criar novo orçamento

---

### 3.2 Formulário do Orçamento - Novos Campos

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📋 Condições Comerciais                                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Frete                              Validade                            │
│  ┌───────────────────────────┐      ┌───────────────────────────┐      │
│  │                           │      │ 📅 dd/mm/aaaa             │      │
│  └───────────────────────────┘      └───────────────────────────┘      │
│                                                                         │
│  Prazo de Faturamento                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Observações (campo existente)                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ O faturamento mínimo considera lote de mesmo material e mesma   │   │
│  │ especificação.                                                  │   │  ← valor default
│  │ As peças enviadas para tratamento térmico terão prazo de 30     │   │    com 2 frases
│  │ dias após encerrado o processo para serem retiradas.            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ✍️ Elaborado por                                                       │  ← NOVO CAMPO
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ José Adair Giubel                                               │   │
│  │ Fone / email: (54) 3218-2168 / jaogiube@tecnohard.ind.br        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  Aparece no PDF. Default vem das configurações, editável por orçamento. │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  📝 Observações Internas                                                │  ← NOVO CARD
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Aprovado por João em 15/01/2025 via email.                      │   │
│  │ Cliente solicitou revisão de preço em 20/01.                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  ⚠️ Uso interno - NÃO aparece no PDF                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Comportamentos:**
- "Elaborado por": NOVO campo textarea, default das configurações, editável
- "Observações Internas": NOVO campo textarea, apenas interno, não exporta pro PDF
- "Observações": campo EXISTENTE, apenas muda o valor default inicial

---

### 3.3 Formulário do Item - Campo Prazo

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Material                 Prazo de Entrega          Faturamento Mínimo  │
│  ┌─────────────────┐      ┌──────────┬────────────┐ ┌─────────────────┐ │
│  │ Aço SAE 1045    │      │ 15       │ dias úteis │ │ R$ 500,00       │ │
│  └─────────────────┘      └──────────┴────────────┘ └─────────────────┘ │
│                           ↑ só números inteiros                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Comportamentos:**
- Campo aceita apenas números inteiros (type="number", step="1", min="1")
- Sufixo "dias úteis" aparece fixo ao lado do input
- Na visualização e PDF: "15 dias úteis"
- Campo pode ficar vazio (não obrigatório)

---

### 3.4 Layout do PDF - Mudanças

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [LOGO]                                                                 │
│                                                                         │
│            Orçamento Nº: 2025-0006                                      │  ← fonte menor
│                                                                         │
│  Cliente: EMPRESA XYZ LTDA                                              │  ← fonte 10% maior
│  Contato: João Silva                                                    │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  Itens do Orçamento                                               │ │
│  │  ...                                                              │ │
│  │  Prazo: 15 dias úteis          Faturamento Mínimo: R$ 500,00      │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│                                                                         │
│  [ESPAÇO para empurrar infos pro fundo]                                 │
│                                                                         │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│  Frete: CIF                                                             │
│  Validade: 30/01/2025                                                   │
│  Observações: O faturamento mínimo considera lote de mesmo material...  │
│                                                                         │
│                                        Orçamento elaborado por:         │  ← NOVO
│                                        José Adair Giubel                │    alinhado à direita
│                                        Fone / email: (54) 3218-2168...  │
│  ─────────────────────────────────────────────────────────────────────  │
│  [RODAPÉ - CNPJ, endereço, etc.]                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

**Comportamentos:**
- Título: formato "Orçamento Nº: AAAA-NNNN" com fonte reduzida
- Cliente: fonte ~10% maior que atual
- Informações gerais: empurradas para baixo, próximas ao rodapé (usar flexGrow/spacer)
- "Elaborado por": entre as infos e o rodapé, alinhado à direita, multilinha

---

## 4. Implementação Técnica

### 4.1 Banco de Dados

| Tabela | Alteração |
|--------|-----------|
| `orcamentos` | Adicionar `observacoes_internas` TEXT |
| `orcamentos` | Adicionar `elaborado_por` TEXT |
| `orcamento_itens` | Alterar `prazo_entrega` de TEXT para INTEGER (ou manter TEXT e validar no front) |
| `configuracoes` | Inserir chave `elaborado_por_default` |

```sql
-- Adicionar novos campos na tabela orcamentos
ALTER TABLE orcamentos ADD COLUMN IF NOT EXISTS observacoes_internas TEXT;
ALTER TABLE orcamentos ADD COLUMN IF NOT EXISTS elaborado_por TEXT;

-- Nota: prazo_entrega em orcamento_itens já é TEXT
-- Manter como TEXT mas armazenar só o número (ex: "15")
-- A formatação "X dias úteis" será feita no front/PDF
```

### 4.2 Arquivos a Modificar/Criar

| Ação | Arquivo | Descrição |
|------|---------|-----------|
| MODIFICAR | `lib/types/database.ts` | Adicionar campos `observacoes_internas` e `elaborado_por` em orcamentos |
| MODIFICAR | `lib/utils/validators.ts` | Adicionar validação dos novos campos + prazo numérico |
| MODIFICAR | `lib/hooks/use-configuracoes.ts` | Expor função para pegar `elaborado_por_default` |
| MODIFICAR | `lib/hooks/use-orcamento.ts` | Preencher default de observações e elaborado_por |
| MODIFICAR | `lib/hooks/use-anexos.ts` | Garantir atualização em tempo real após exclusão |
| MODIFICAR | `app/(dashboard)/config/page.tsx` | Adicionar campo "Elaborado por" + corrigir bug logo |
| MODIFICAR | `components/features/orcamento-form.tsx` | Adicionar campos + defaults |
| MODIFICAR | `components/features/item-form.tsx` | Prazo numérico + preço por kg vazio |
| MODIFICAR | `components/features/item-list.tsx` | Mostrar "(por kg)" na visualização |
| MODIFICAR | `components/features/orcamento-view.tsx` | Mostrar "(por kg)" na visualização |
| MODIFICAR | `components/features/orcamento-pdf.tsx` | Todas as mudanças de layout do PDF |
| MODIFICAR | `app/api/pdf/[id]/route.tsx` | Passar elaborado_por para o PDF |

### 4.3 Detalhamento por Item

#### Item 01 - Mostrar "(por kg)" na visualização
- **Arquivo:** `item-list.tsx`, `orcamento-view.tsx`
- **Lógica:** Se `item.unidade === 'kg'`, mostrar "Preço por kg:" em vez de "Preço:"

#### Item 02 - Atualizar anexos em tempo real
- **Arquivo:** `use-anexos.ts` ou componente que lista anexos
- **Lógica:** Após delete bem-sucedido, remover item do estado local imediatamente

#### Item 03 - Preço por kg iniciar vazio
- **Arquivo:** `item-form.tsx`
- **Lógica:** Mudar `preco_unitario: initialData?.preco_unitario || 0` para `|| null` quando unidade é kg

#### Item 04 - Corrigir bug upload logo
- **Arquivo:** `config/page.tsx`, `use-configuracoes.ts`
- **Debug:** Verificar mensagem de erro, pode ser problema de bucket/permissão

#### Item 05 - Campo Observações Internas
- **DB:** `observacoes_internas TEXT`
- **Form:** Novo Card após "Condições Comerciais"
- **PDF:** NÃO incluir

#### Item 06 - Campo Elaborado Por
- **DB:** `elaborado_por TEXT` em orcamentos
- **Config:** Chave `elaborado_por_default`
- **Form:** Campo com default das configurações
- **PDF:** Exibir entre infos e rodapé, alinhado à direita

#### Item 07 - Título ANO-SEQ + fonte menor
- **Arquivo:** `orcamento-pdf.tsx`
- **Lógica:** O número já vem no formato correto (ANO-NNNN). Apenas ajustar fonte.

#### Item 08 - Nome cliente maior
- **Arquivo:** `orcamento-pdf.tsx`
- **Lógica:** Aumentar fontSize do campo cliente em ~10%

#### Item 09 - Prazo numérico + sufixo
- **Arquivo:** `item-form.tsx`
- **Lógica:** Input type="number", sufixo visual "dias úteis"
- **PDF/View:** Concatenar " dias úteis" ao exibir

#### Item 10 - Infos no fundo da página
- **Arquivo:** `orcamento-pdf.tsx`
- **Lógica:** Usar View com flex: 1 como spacer entre itens e infos

#### Item 11 - Observações pré-preenchidas
- **Arquivo:** `orcamento-form.tsx`
- **Lógica:** Default value com duas frases:
```
O faturamento mínimo considera lote de mesmo material e mesma especificação.
As peças enviadas para tratamento térmico terão prazo de 30 dias após encerrado o processo para serem retiradas.
```

### 4.4 Dependências Externas

- [ ] Verificar se bucket `configuracoes` existe e tem permissões corretas (para fix do logo)
- [ ] Executar migration no Supabase para adicionar colunas

---

## 5. Execução

*(preenchido pelo Executor)*

### 5.1 Progresso

**Banco de dados:**
- [x] Migration: adicionar `observacoes_internas` em orcamentos
- [x] Migration: adicionar `elaborado_por` em orcamentos
- [x] Migration: inserir chave `elaborado_por_default` em configuracoes

**Item 01 - Preco por kg na visualizacao:**
- [x] `item-list.tsx` atualizado
- [x] `orcamento-preview.tsx` atualizado

**Item 02 - Anexos em tempo real:**
- [x] Ja estava implementado via callback onDelete no item-list.tsx

**Item 03 - Preco por kg vazio:**
- [x] `item-form.tsx` atualizado
- [x] `validators.ts` atualizado para permitir null

**Item 04 - Bug upload logo:**
- [x] Codigo verificado e melhorado com mensagens de erro mais claras
- [x] Bucket "configuracoes" criado e configurado no Supabase (usuario confirmou funcionamento)

**Item 05 - Observacoes Internas:**
- [x] Campo no DB (migration)
- [x] Tipo TypeScript (`database.ts`)
- [x] Validador (`validators.ts`)
- [x] Formulario (`orcamento-form.tsx`)

**Item 06 - Elaborado Por:**
- [x] Campo no DB (migration)
- [x] Tipo TypeScript (`database.ts`)
- [x] Validador (`validators.ts`)
- [x] Config page default (`config/page.tsx`)
- [x] Hook configuracoes (`use-configuracoes.ts`)
- [x] Formulario orcamento (`orcamento-form.tsx`)
- [x] PDF (`orcamento-pdf.tsx`)

**Item 07 - Titulo PDF:**
- [x] Fonte ajustada (16px em vez de 24px)
- [x] Formato "Orcamento No: AAAA-NNNN"

**Item 08 - Cliente maior:**
- [x] Fonte ajustada (16px em vez de 14px)

**Item 09 - Prazo numerico:**
- [x] Input numerico (`item-form.tsx`)
- [x] Sufixo visual "dias uteis"
- [x] Exibicao formatada (`item-list.tsx`, `orcamento-preview.tsx`, `orcamento-pdf.tsx`)

**Item 10 - Infos no fundo:**
- [x] Layout PDF ajustado com spacer

**Item 11 - Observacoes default:**
- [x] Default value configurado (`orcamento-form.tsx`)

**Validacao:**
- [x] TypeScript sem erros
- [x] Testado manualmente (usuario confirmou em 20/01/2026)

### 5.2 Notas de Implementacao

**IMPORTANTE - Configuracao do Bucket para Upload de Logo:**

O erro 400 no upload de logo indica que o bucket "configuracoes" precisa ser configurado no Supabase:

1. Acesse o Supabase Dashboard > Storage
2. Clique em "New Bucket"
3. Nome: `configuracoes` (exatamente assim, minusculo)
4. Marque como "Public bucket" (para as URLs publicas funcionarem)
5. Clique em "Create bucket"
6. Apos criar, va em "Policies" e adicione:
   - Policy para INSERT: `authenticated` (permite usuarios logados fazer upload)
   - Policy para SELECT: `true` (permite leitura publica)
   - Policy para UPDATE: `authenticated`
   - Policy para DELETE: `authenticated`

---

**Decisoes tomadas:**
1. **Preco por kg vazio:** Modificado o validator para permitir `null` e validar via refine, permitindo que o campo comece vazio mas exigindo valor no submit.
2. **Prazo entrega:** Mantido como TEXT no banco (ja estava assim), apenas armazena o numero. A formatacao "X dias uteis" e feita no front-end e PDF.
3. **Bug upload logo:** Verificado o codigo - a funcionalidade ja estava implementada corretamente no `use-configuracoes.ts`. O bug pode ser relacionado a permissoes do bucket no Supabase (fora do escopo do front-end).
4. **Anexos em tempo real:** Ja estava implementado via callback `onDelete` no `item-list.tsx`.
5. **Observacoes default:** Texto sem acentos para evitar problemas de encoding.

**Arquivos modificados:**
- `lib/types/database.ts` - Novos campos
- `lib/utils/validators.ts` - Validacao novos campos + preco nullable
- `lib/hooks/use-configuracoes.ts` - Funcoes elaborado_por_default + observacoes_default + URLs assinadas
- `app/(dashboard)/config/page.tsx` - Campo Elaborado por + Observacoes padrao + correcao refresh
- `components/features/orcamento-form.tsx` - Novos campos + defaults + auto-save com blur
- `components/features/item-form.tsx` - Prazo numerico + preco vazio
- `components/features/item-list.tsx` - Exibicao "(por kg)" + prazo formatado
- `components/features/orcamento-preview.tsx` - Exibicao "(por kg)" + prazo formatado
- `components/features/orcamento-pdf.tsx` - Layout completo (titulo, cliente, spacer, elaborado por)
- `next.config.ts` - Configuracao para imagens de IPs privados (unoptimized: true)

### 5.3 Conversa de Execucao

#### IA: Execucao concluida - 20/01/2026

Implementados todos os 11 itens da especificacao:
- Correcoes de bugs (4 itens)
- Novos campos (2 itens)
- Ajustes no PDF (3 itens)
- Ajustes no formulario (2 itens)

TypeScript validado sem erros. Aguardando teste manual.

---

#### Ajustes adicionais solicitados durante execucao:

**1. Auto-save com blur nos campos de Condicoes Comerciais**
- **Solicitacao:** Campos devem salvar automaticamente ao perder foco (blur)
- **Campos afetados:** Contato, Frete, Validade, Prazo de Faturamento, Observacoes, Elaborado por, Observacoes Internas
- **Arquivo:** `orcamento-form.tsx`
- **Comportamento:** Indicador "Salvando..." aparece no cabecalho durante auto-save

**2. Configuracao do bucket para upload de logo**
- **Problema:** Erro 400 no upload de logo
- **Solucao:** Criar bucket "configuracoes" no Supabase com policies RLS
- **Codigo:** Melhorado `use-configuracoes.ts` com mensagens de erro mais claras e fallback para URLs assinadas

**3. Configuracao Next.js para imagens de IPs privados**
- **Problema:** Next.js bloqueava imagens de IPs privados (192.168.x.x)
- **Solucao:** Adicionado `unoptimized: true` em `next.config.ts`
- **Arquivo:** `next.config.ts`

**4. Layout PDF - Informacoes gerais proximas ao rodape**
- **Problema:** Informacoes gerais nao estavam proximas ao rodape
- **Solucao:** Mover spacer para ANTES das informacoes gerais
- **Arquivo:** `orcamento-pdf.tsx`
- **Ordem atual:** Logo > Titulo > Cliente > Itens > Total > SPACER > Infos Gerais > Elaborado por > Rodape

**5. Observacoes padrao configuraveis**
- **Solicitacao:** Observacoes padrao devem ser configuradas em /config (nao hardcoded)
- **Arquivos:**
  - `use-configuracoes.ts` - Funcoes `getObservacoesDefault()` e `setObservacoesDefault()`
  - `config/page.tsx` - Nova secao "Observacoes Padrao"
  - `orcamento-form.tsx` - Buscar valor das configuracoes
- **Chave:** `observacoes_default`

**6. Correcao do bug de refresh nos campos de configuracao**
- **Problema:** Campos "Elaborado por" e "Observacoes" ficavam dando refresh com dados do banco
- **Causa:** useEffects executados multiplas vezes por recriacao das funcoes
- **Solucao:** Adicionar flags `elaboradoPorLoaded` e `observacoesLoaded` para carregar apenas uma vez
- **Arquivo:** `config/page.tsx`

---

**Arquivos adicionais modificados:**
- `next.config.ts` - Configuracao de imagens
- `use-configuracoes.ts` - URLs assinadas + observacoes default
- `orcamento-form.tsx` - Auto-save com blur
- `orcamento-pdf.tsx` - Ordem do spacer

---

## 6. Validacao Final

- [x] `npx tsc --noEmit` sem erros
- [x] Funcionalidade testada manualmente (usuario confirmou em 20/01/2026)
- [ ] PRD atualizado (via PRD-editor)

---

## 7. Checklist de Teste Manual

### Itens originais (1-11)

1. **Configuracoes:** Criar/editar campo "Elaborado por" default
2. **Configuracoes:** Fazer upload de logo (verificar se funciona)
3. **Novo orcamento:** Verificar se observacoes vem pre-preenchida
4. **Novo orcamento:** Verificar se "Elaborado por" vem com default
5. **Item:** Criar item com preco por kg - verificar se mostra "(por kg)" na visualizacao
6. **Item:** Verificar se prazo aceita so numeros e mostra "dias uteis"
7. **Anexo:** Excluir anexo e verificar se atualiza na hora
8. **PDF:** Verificar titulo no formato "Orcamento No: 2025-0006"
9. **PDF:** Verificar nome do cliente maior
10. **PDF:** Verificar se infos estao proximas ao rodape
11. **PDF:** Verificar se "Elaborado por" aparece alinhado a direita

### Itens adicionais (12-18)

12. **Auto-save:** Preencher campo "Frete" e sair (blur) - verificar se salva automaticamente
13. **Auto-save:** Preencher campo "Observacoes" e sair (blur) - verificar se salva automaticamente
14. **Auto-save:** Verificar indicador "Salvando..." no cabecalho durante save
15. **Configuracoes:** Editar campo "Observacoes Padrao" e salvar
16. **Configuracoes:** Verificar se campo "Elaborado por" permite edicao sem refresh
17. **Novo orcamento:** Verificar se observacoes vem com valor configurado (nao hardcoded)
18. **PDF:** Verificar se "Informacoes gerais" aparecem acima do "Elaborado por" e proximas ao rodape
