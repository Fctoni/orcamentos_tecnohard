# 📋 Alterações Necessárias no PRD - Alteração 19 e 19_v2

**Data:** 14/01/2026  
**Referência:** `alteracao19.md` e `alteracao19_v2.md`

---

## 📊 RESUMO DAS ALTERAÇÕES

| # | Alteração | Seções Afetadas |
|---|-----------|-----------------|
| 1 | 4 novas tabelas de entregas (peças e amarrados) | Seção 4 (Modelo de Dados) |
| 2 | Novos status para pedidos de venda | Seção 4.10, 4.13 |
| 3 | Fluxo de Faturamento e Recebimento separados | Seção 7.6, 7.7 |
| 4 | Modal de seleção de NF para múltiplas entregas | Seção 7.6, 7.7 |
| 5 | Fluxo de usuário atualizado | Seção 9.2 |

---

## 🔧 ALTERAÇÃO 1: Novas Tabelas de Entregas

### **4.44 Tabela: `entregas_pedido_pecas`** (NOVA)

Entregas (faturamentos) de pedidos de venda de peças. Uma entrega representa uma NF emitida.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | ID único |
| `pedido_id` | uuid | FK(pedidos_venda_pecas.id), NOT NULL | Pedido de origem |
| `nf_venda` | text | NOT NULL | Número da NF de venda |
| `data_faturamento` | date | NOT NULL | Data da emissão da NF |
| `data_recebimento` | date | NULL | Data de confirmação do recebimento |
| `nome_recebedor` | text | NULL | Nome de quem recebeu |
| `observacoes` | text | NULL | Observações |
| `cancelada` | boolean | DEFAULT false | Se a entrega foi cancelada |
| `cancelada_em` | timestamptz | NULL | Data do cancelamento |
| `cancelada_por` | uuid | FK(auth.users.id), NULL | Quem cancelou |
| `created_at` | timestamptz | DEFAULT now() | Data de criação |
| `created_by` | uuid | FK(auth.users.id) | Quem criou |

**Nota:** Uma entrega está "pendente de recebimento" quando `data_recebimento` é NULL.

---

### **4.45 Tabela: `itens_entrega_pecas`** (NOVA)

Itens de cada entrega de peças.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | ID único |
| `entrega_id` | uuid | FK(entregas_pedido_pecas.id), NOT NULL | Entrega pai |
| `item_pedido_id` | uuid | FK(itens_pedido_venda_pecas.id), NOT NULL | Item do pedido |
| `quantidade_entregue` | integer | NOT NULL | Quantidade faturada nesta entrega |

---

### **4.46 Tabela: `entregas_pedido_amarrados`** (NOVA)

Entregas (faturamentos) de pedidos de venda de amarrados.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | ID único |
| `pedido_id` | uuid | FK(pedidos_venda_amarrados.id), NOT NULL | Pedido de origem |
| `nf_venda` | text | NOT NULL | Número da NF de venda |
| `data_faturamento` | date | NOT NULL | Data da emissão da NF |
| `data_recebimento` | date | NULL | Data de confirmação do recebimento |
| `nome_recebedor` | text | NULL | Nome de quem recebeu |
| `observacoes` | text | NULL | Observações |
| `cancelada` | boolean | DEFAULT false | Se a entrega foi cancelada |
| `cancelada_em` | timestamptz | NULL | Data do cancelamento |
| `cancelada_por` | uuid | FK(auth.users.id), NULL | Quem cancelou |
| `created_at` | timestamptz | DEFAULT now() | Data de criação |
| `created_by` | uuid | FK(auth.users.id) | Quem criou |

---

### **4.47 Tabela: `itens_entrega_amarrados`** (NOVA)

Itens de cada entrega de amarrados.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | ID único |
| `entrega_id` | uuid | FK(entregas_pedido_amarrados.id), NOT NULL | Entrega pai |
| `item_pedido_id` | uuid | FK(itens_pedido_venda_amarrados.id), NOT NULL | Item do pedido |
| `barras_entregues` | integer | NOT NULL | Barras faturadas nesta entrega |
| `peso_entregue` | numeric | NOT NULL | Peso faturado nesta entrega |

---

## 🔧 ALTERAÇÃO 2: Novos Status dos Pedidos

### **4.10 Tabela: `pedidos_venda_amarrados`** (ATUALIZAR)

**Campo `status` - Novos valores:**

| Status | Descrição |
|--------|-----------|
| Em Separacao | Pedido em separação |
| Separado | Pronto para faturar |
| **Faturado Parcial** | Parte do pedido faturado, ainda tem saldo |
| **Faturado** | 100% faturado, aguardando recebimentos |
| Entregue | Todos os recebimentos confirmados |
| Cancelado | Pedido cancelado |

### **4.13 Tabela: `pedidos_venda_pecas`** (ATUALIZAR)

**Campo `status` - Novos valores:**

| Status | Descrição |
|--------|-----------|
| Aguardando | Aguardando separação |
| Aguardando Producao | Aguardando produção de peças |
| Em Separacao | Pedido em separação |
| Separado | Pronto para faturar |
| **Faturado Parcial** | Parte do pedido faturado, ainda tem saldo |
| **Faturado** | 100% faturado, aguardando recebimentos |
| Entregue | Todos os recebimentos confirmados |
| Cancelado | Pedido cancelado |

---

## 🔧 ALTERAÇÃO 3: Fluxo de Faturamento e Recebimento

### **7.6 Pedido de Venda (Amarrados)** (ATUALIZAR)

#### **7.6.X Fluxo de Entregas Parciais**

**Conceito:** Um pedido pode ter múltiplas entregas (NFs). Cada entrega passa por dois momentos:
1. **Faturamento** - Emissão da NF, desconto do estoque
2. **Recebimento** - Confirmação de entrega com comprovante

**Fluxo de Status:**

```
Separado → [Faturar] → Faturado Parcial → [Faturar saldo] → Faturado
                              │                                  │
                              └──── [Registrar Recebimento] ─────┘──→ Entregue
```

**Ações por Status:**

| Status | Ações Disponíveis |
|--------|-------------------|
| Separado | Faturar, Cancelar |
| Faturado Parcial | Faturar saldo, Registrar Recebimento, Cancelar |
| Faturado | Registrar Recebimento |
| Entregue | Apenas visualizar |

#### **7.6.X.1 Modal Faturar Pedido**

Permite faturamento parcial (quantidade editável por item).

**Campos:**
- **Espelho da Nota** (tabela):
  - Descrição (Liga Ø + ID do amarrado)
  - Barras Pedido / Já Faturado / Pendente / **A Faturar** (editável)
  - R$/kg (informativo)
  - Peso (calculado)
- **Número da NF** (obrigatório)

**Comportamento:**
- Campo "A Faturar" pré-preenchido com saldo pendente
- Valor máximo = Pendente
- Peso calculado proporcionalmente às barras
- Ao faturar: cria registro em `entregas_pedido_amarrados`, desconta estoque

#### **7.6.X.2 Modal Registrar Recebimento**

Confirma a entrega de uma NF já faturada.

**Campos:**
- **Resumo da entrega** (NF, data faturamento, quantidade)
- **Data do Recebimento** (obrigatório)
- **Nome do Recebedor**
- **Comprovante** (upload obrigatório - foto do canhoto)
- **Observações**

**Regras:**
- 1 NF = 1 Recebimento (não pode dividir recebimento de uma NF)
- Comprovante sempre obrigatório
- Ao confirmar: atualiza `data_recebimento` e faz upload do comprovante

---

### **7.7 Pedido de Venda (Peças)** (ATUALIZAR)

Mesma estrutura de entregas parciais da seção 7.6.

#### **7.7.X Fluxo de Entregas Parciais**

**Ações por Status:**

| Status | Ações Disponíveis |
|--------|-------------------|
| Separado | Faturar, Cancelar |
| Faturado Parcial | Faturar saldo, Registrar Recebimento, Cancelar |
| Faturado | Registrar Recebimento |
| Entregue | Apenas visualizar |

#### **7.7.X.1 Modal Faturar Pedido**

**Campos:**
- **Espelho da Nota** (tabela):
  - Código / Descrição (código do cliente entre parênteses)
  - Qtd Pedido / Já Faturado / Pendente / **A Faturar** (editável)
  - R$/peça (informativo)
  - Valor (calculado)
- **Número da NF** (obrigatório)

#### **7.7.X.2 Modal Registrar Recebimento**

Igual ao de amarrados.

---

## 🔧 ALTERAÇÃO 4: Modal de Seleção de NF (alteracao19_v2)

### **7.6.X.3 / 7.7.X.3 Modal Selecionar NF**

Quando há múltiplas NFs pendentes de recebimento, o sistema exibe um modal intermediário para o usuário selecionar qual NF deseja registrar o recebimento.

**Comportamento:**
- Se 1 NF pendente → abre direto o modal de recebimento
- Se múltiplas NFs pendentes → abre modal de seleção primeiro

**Campos exibidos:**
- Número da NF
- Data do faturamento
- Quantidade (peças ou barras)
- Peso total

**Linhas colapsáveis:**
- Ao clicar em ▶, expande para mostrar detalhes de cada item da NF:
  - Peças: Descrição (código cliente), quantidade, peso
  - Amarrados: Liga/Ø, barras, peso

**Ordenação:** Por número da NF (crescente)

---

## 🔧 ALTERAÇÃO 5: Fluxo de Usuário Atualizado

### **9.2 Fluxo de Venda de Amarrados** (ATUALIZAR)

```
Criar Pedido de Venda 
  → Selecionar Cliente 
  → Adicionar Amarrados + Quantidades 
  → Salvar (EM SEPARACAO) ← 🔒 Reserva estoque
  → Marcar Separado (SEPARADO) 
  
  → [Pode repetir para entregas parciais]
  → Faturar + Informar NF (FATURADO PARCIAL ou FATURADO) ← 📉 Desconta estoque
  
  → [Para cada NF faturada]
  → Registrar Recebimento + Upload Comprovante
  
  → Quando todos recebimentos confirmados → (ENTREGUE)
  → Amarrados com saldo zerado → Historico de Saidas
```

### **Fluxo de Venda de Peças** (similar)

Mesma estrutura com faturamento parcial e confirmação de recebimento por NF.

---

## ✅ CHECKLIST DE ATUALIZAÇÃO

### Seção 4 - Modelo de Dados
- [ ] Adicionar 4.44 Tabela: `entregas_pedido_pecas`
- [ ] Adicionar 4.45 Tabela: `itens_entrega_pecas`
- [ ] Adicionar 4.46 Tabela: `entregas_pedido_amarrados`
- [ ] Adicionar 4.47 Tabela: `itens_entrega_amarrados`
- [ ] Atualizar 4.10 status de `pedidos_venda_amarrados`
- [ ] Atualizar 4.13 status de `pedidos_venda_pecas`

### Seção 7 - Módulos
- [ ] Atualizar 7.6 Venda Amarrados com fluxo de entregas
- [ ] Atualizar 7.7 Venda Peças com fluxo de entregas

### Seção 9 - Fluxos
- [ ] Atualizar 9.2 Fluxo de Venda de Amarrados

### Header
- [ ] Atualizar versão para 2.16
- [ ] Atualizar data
- [ ] Adicionar changelog v2.16

### Changelog
```
v2.16: Sistema de Entregas Parciais - novo modelo de faturamento e recebimento separados para pedidos de venda. Permite múltiplas NFs por pedido com faturamento parcial (quantidades editáveis). Novas tabelas: `entregas_pedido_pecas`, `itens_entrega_pecas`, `entregas_pedido_amarrados`, `itens_entrega_amarrados`. Novos status: `Faturado Parcial` (parte faturada, saldo pendente), `Faturado` (100% faturado, aguardando recebimentos). Modal de faturamento com espelho da NF e quantidades editáveis. Modal de recebimento com comprovante obrigatório. Modal de seleção de NF quando há múltiplas pendentes (linhas colapsáveis com detalhes dos itens). 1 NF = 1 recebimento. Páginas `/pedidos/venda-pecas` e `/pedidos/venda-amarrados` atualizadas.
```
