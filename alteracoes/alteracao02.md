# Alteração 02 - Ajustes Diversos de UX e PDF

| Aspecto | Detalhe |
|---------|---------|
| Status | 🟢 Especificação criada |
| Origem | Feedback de uso |
| Complexidade | 🟡 Média (10 itens pequenos) |
| Especificação | [spec-alteracao02.md](./spec-alteracao02.md) |

**Status possíveis:**
- 🟡 Em planejamento
- 🟢 Especificação criada → ver [spec-alteracao02.md](./spec-alteracao02.md)

---

## 1. Ideia Inicial

Consolidação de vários ajustes pequenos identificados durante o uso do sistema:

### Lista de Ajustes Solicitados

| # | Categoria | Descrição |
|---|-----------|-----------|
| 01 | Visualização | Preço por kg não aparece na visualização como no preenchimento (PDF está OK) |
| 02 | Anexos | Excluir anexo não atualiza em tempo real - precisa sair e entrar na página |
| 03 | Formulário | Campo "preço por kg" vem preenchido com zero, deveria vir vazio |
| 04 | Config | Logo não faz upload, apresenta mensagem de erro |
| 05 | Novo campo | Criar campo "Observações Internas" (quem aprovou, data, forma de registro) |
| 06 | PDF | Incluir "Orçamento elaborado por: [NOME]" no documento |
| 07 | PDF | Título como "Orçamento Nº: 2025-0006" e diminuir tamanho da fonte |
| 08 | PDF | Nome do cliente mais em destaque (fonte ~10% maior) |
| 09 | Formulário/PDF | Prazo de entrega em "dias úteis", faturamento mínimo em "R$", prazo aceitar só números inteiros |
| 10 | PDF | Manter informações gerais alinhadas ao fundo da folha |
| 11 | Formulário | Observações pré-preenchidas com 2 frases padrão |

---

## 2. Conversa de Planejamento

#### usuário:
Lista de ajustes conforme seção 1.

---

#### IA: Análise inicial e perguntas

Vou analisar cada item e fazer algumas perguntas para esclarecer os detalhes:

### Itens que preciso entender melhor:

**Item 05 - Observações Internas:**
- Esse campo deve aparecer no PDF ou é apenas para controle interno?
R: apenas interno
- Quem pode ver/editar esse campo? Qualquer usuário logado?
R: Sim

**Item 06 - "Orçamento elaborado por":**
- Deve ser o nome do usuário logado que criou o orçamento?
R: não
- Ou um campo editável onde se digita o nome?
R: o 'default' de preenchimento deve vir de uma variável preenchida em 'configurações', mas deve ser um campo editável, cada orçamento vai ter o seu salvo
- Onde no PDF deve aparecer? (Cabeçalho? Rodapé? Próximo à assinatura?)
abaixo de todas informações, entre o fim das infos e o rodapé, deslocado para a direita

Obs adicionais: deve seguir o formato:

"Orçamento elaborado por: José Adair Giubel
Fone / email: (54) 3218-2168 / jaogiube@tecnohard.ind.br"

**Item 07 - Formato do número:**
- O formato "2025-0006" significa ANO-SEQUENCIAL?
R: Sim
- A sequência reinicia a cada ano?
R: Sim

**Item 09 - Unidades:**
- "Prazo de entrega" é um campo existente? Não localizei no formulário atual. Você quer criar esse campo?
R: é o item 'prazo' dentro do item
- "Faturamento mínimo" - onde aparece? No formulário ou no PDF?
R: ambos
**Item 10 - Informações gerais no fundo:**
- "Fundo da folha" significa rodapé fixo na parte inferior da página?
R: hoje, tem os itens, e logo depois vem as informações gerais. Precisamos espaçar isso, essas informações gerais precisam ficar alinhadas próximas ao rodapé
- Quais informações devem ficar lá? (CNPJ, telefone, endereço da empresa?)
R: informações preenchidas no pedido, que já são exportadas hoje no PDF
---

### Itens que já estão claros (posso especificar):

| # | Entendimento |
|---|--------------|
| 01 | Mostrar "(por kg)" na visualização quando item usa preço por kg |
| 02 | Atualizar lista de anexos imediatamente após exclusão |
| 03 | Campo preço por kg iniciar vazio (null) em vez de 0 |
| 04 | Corrigir bug no upload de logo |
| 08 | Aumentar fonte do nome do cliente no PDF em ~10% |
| 11 | Valor padrão do campo observações = frase especificada |

---

#### usuário:

respondi cada item com um 'R:'. Se tiver mais perguntas, me traga elas, não faça nenhuma suposição

---

#### IA: Perguntas adicionais

Analisei o código e tenho mais algumas perguntas:

**Item 06 - "Elaborado por" nas Configurações:**
Você mencionou que o default vem de "configurações". Preciso criar esses campos lá.
- São 2 campos nas configurações? (Nome + Fone/Email juntos)
- Ou 3 campos separados? (Nome, Telefone, Email)
R: somente um campo texto, que aceite mais de uma linha. o usuário digita exatamente como quiser e o que quiser

**Item 09 - Prazo de entrega:**
Hoje o campo `prazo_entrega` é texto livre (ex: "15 dias úteis").
- Para aceitar só números inteiros: o campo recebe só o número (ex: "15") e o sistema adiciona "dias úteis" automaticamente na exibição/PDF?
R: exatamente!

**Item 09 - Faturamento mínimo:**
Já existe formatação automática para R$. Está com algum bug ou só quer garantir que apareça com "R$" no PDF/formulário?
R: já está OK, isso já foi corrigido antes

---

#### usuário:

respondi cada item com um 'R:'. Se tiver mais perguntas, me traga elas, não faça nenhuma suposição

---

#### IA: Resumo final e proposta de UI

Todas as dúvidas esclarecidas! Segue o resumo consolidado:

### Itens Finais (10 itens - removido faturamento mínimo que já está OK)

| # | Categoria | O que fazer |
|---|-----------|-------------|
| 01 | Visualização | Mostrar "(por kg)" quando item usa preço por kg |
| 02 | Anexos | Atualizar lista imediatamente após exclusão |
| 03 | Formulário Item | Campo preço por kg iniciar vazio (null) em vez de 0 |
| 04 | Config | Corrigir bug no upload de logo |
| 05 | Formulário Orçamento | Novo campo "Observações Internas" (apenas interno, não vai pro PDF) |
| 06 | Config + Form + PDF | Campo "Elaborado por" com default nas configurações |
| 07 | PDF | Título "Orçamento Nº: 2025-0006" (ANO-SEQ, reinicia por ano) + fonte menor |
| 08 | PDF | Nome do cliente com fonte ~10% maior |
| 09 | Formulário Item | Prazo: campo numérico + sufixo automático "dias úteis" |
| 10 | PDF | Informações gerais alinhadas próximo ao rodapé |
| 11 | Formulário Orçamento | Observações pré-preenchidas com frase padrão |

---

## 3. UI Proposta (Rascunho)

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
│  ✍️ Responsável pelo Orçamento (padrão)                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ José Adair Giubel                                               │   │
│  │ Fone / email: (54) 3218-2168 / jaogiube@tecnohard.ind.br        │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  Texto livre, múltiplas linhas. Será usado como padrão em novos        │
│  orçamentos.                                                            │
│                                                                         │
│  ───────────────────────────────────────────────────────────────────   │
│                                                                         │
│  📋 Processos Disponíveis                                               │
│  [lista existente...]                                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Comportamentos:**
- Campo textarea multilinha
- Salva automaticamente (ou botão salvar)
- Valor usado como default ao criar novo orçamento

**Status:** 🟡 Aguardando aprovação

---

### 3.2 Formulário do Orçamento - Novos Campos

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📋 Condições Comerciais                                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Frete                              Validade                            │
│  ┌───────────────────────────┐      ┌───────────────────────────┐      │
│  │ CIF, FOB ou texto livre   │      │ 📅 dd/mm/aaaa             │      │
│  └───────────────────────────┘      └───────────────────────────┘      │
│                                                                         │
│  Prazo de Faturamento                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Ex: 30 dias, à vista, etc.                                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Observações (campo existente)                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ O faturamento mínimo considera lote de mesmo material e mesma   │   │
│  │ especificação.                                                  │   │ ← valor default
│  │ As peças enviadas para tratamento térmico terão prazo de 30     │   │   com 2 frases
│  │ dias após encerrado o processo para serem retiradas.            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ✍️ Elaborado por                                                       │ ← NOVO
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ José Adair Giubel                                               │   │
│  │ Fone / email: (54) 3218-2168 / jaogiube@tecnohard.ind.br        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  Aparece no PDF. Default vem das configurações, editável por orçamento. │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  📝 Observações Internas                                                │ ← NOVO CARD
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Aprovado por João em 15/01/2025 via email.                      │   │
│  │ Cliente solicitou revisão de preço em 20/01.                    │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  ⚠️ Uso interno - NÃO aparece no PDF                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Comportamentos:**
- "Elaborado por": NOVO campo textarea, default das configurações, editável
- "Observações Internas": NOVO campo textarea, apenas interno, não exporta pro PDF
- "Observações": campo EXISTENTE, apenas muda o valor default inicial

**Status:** 🟡 Aguardando aprovação

---

### 3.3 Formulário do Item - Campo Prazo

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Material                 Prazo de Entrega          Faturamento Mínimo  │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐  │
│  │ Aço SAE 1045    │      │ 15          │ dias úteis  │ R$ 500,00     │  │
│  └─────────────────┘      └─────────────────┘      └─────────────────┘  │
│                           ↑ só números inteiros                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Comportamentos:**
- Campo aceita apenas números inteiros
- Sufixo "dias úteis" aparece fixo ao lado (ou dentro do campo)
- Na visualização e PDF: "15 dias úteis"

**Status:** 🟡 Aguardando aprovação

---

### 3.4 Layout do PDF - Mudanças

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [LOGO]                                                                 │
│                                                                         │
│            Orçamento Nº: 2025-0006                                      │ ← fonte menor
│                                                                         │
│  Cliente: EMPRESA XYZ LTDA                                              │ ← fonte 10% maior
│  Contato: João Silva                                                    │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  Itens do Orçamento                                               │ │
│  │  ...                                                              │ │
│  │  Prazo: 15 dias úteis          Faturamento Mínimo: R$ 500,00      │ │ ← unidades
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│                                                                         │
│  [ESPAÇO para empurrar infos pro fundo]                                 │
│                                                                         │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│  Frete: CIF                                                             │
│  Validade: 30/01/2025                                                   │
│  Observações: O faturamento mínimo considera lote de mesmo material...  │ ← infos próximas
│                                                                         │   ao rodapé
│                                        Orçamento elaborado por:         │ ← NOVO
│                                        José Adair Giubel                │   alinhado à direita
│                                        Fone / email: (54) 3218-2168...  │
│  ─────────────────────────────────────────────────────────────────────  │
│  [RODAPÉ - CNPJ, endereço, etc.]                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

**Comportamentos:**
- Título: formato "Orçamento Nº: AAAA-NNNN" com fonte reduzida
- Cliente: fonte ~10% maior que atual
- Informações gerais: empurradas para baixo, próximas ao rodapé
- "Elaborado por": entre as infos e o rodapé, alinhado à direita

**Status:** 🟡 Aguardando aprovação

---

## 4. Decisões Importantes

- **Item 06**: Um único campo texto multilinha nas configurações (não 2 ou 3 campos separados)
- **Item 07**: Número sequencial reinicia a cada ano (2025-0001, 2026-0001, etc.)
- **Item 09**: Prazo é numérico + sufixo automático "dias úteis"
- **Item 09b**: Faturamento mínimo já está OK, removido da lista
- **Item 05 vs 06**: Observações Internas ≠ Elaborado por (são campos diferentes)

---

## 5. Checkpoints

#### Checkpoint 20/01/2026 - 10:00
**Status atual:** UIs propostas, aguardando aprovação
**Decisões tomadas:**
- 10 itens finais (removido faturamento mínimo)
- Campo "elaborado por" = texto livre multilinha
- Prazo = número + sufixo automático

**Próximo passo:** Aguardar aprovação das UIs para criar especificação técnica
