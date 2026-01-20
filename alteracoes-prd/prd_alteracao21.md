# 📋 Alterações Necessárias no PRD - Alteração 21

**Data:** 14/01/2026  
**Referência:** `alteracao21_v2.md`

---

## 📊 RESUMO DAS ALTERAÇÕES

| # | Alteração | Seções Afetadas |
|---|-----------|-----------------|
| 1 | 5 novas tabelas do módulo de compras | Seção 4 (Modelo de Dados) |
| 2 | Novo módulo de Solicitação de Compras | Seção 7 (Módulos e Funcionalidades) |
| 3 | Novos itens de menu | Seção 8 (Navegação e Estrutura) |
| 4 | Novo fluxo de usuário | Seção 9 (Fluxos de Usuário) |

---

## 🔧 ALTERAÇÃO 1: Novas Tabelas

### **4.39 Tabela: `solicitacoes_compra`** (NOVA)

Tabela principal de solicitações de compra de matéria-prima.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | ID único |
| `numero` | serial | - | Número sequencial da solicitação |
| `justificativa` | text | NOT NULL | Motivo/justificativa da compra |
| `urgencia` | text | DEFAULT 'Normal', CHECK IN ('Normal', 'Urgente', 'Critico') | Nível de urgência |
| `status` | text | DEFAULT 'Rascunho', CHECK IN ('Rascunho', 'Solicitado', 'Aprovado', 'Rejeitado', 'Em Cotacao', 'Pedido Feito', 'Concluida', 'Cancelada') | Status do fluxo |
| `motivo_rejeicao` | text | NULL | Motivo caso rejeitado |
| `fornecedor_selecionado_id` | uuid | FK(fornecedores.id), NULL | Fornecedor vencedor da cotação |
| `aprovado_por` | uuid | FK(auth.users.id), NULL | Usuário que aprovou |
| `aprovado_em` | timestamptz | NULL | Data/hora da aprovação |
| `created_by` | uuid | FK(auth.users.id) | Usuário que criou |
| `created_at` | timestamptz | DEFAULT now() | Data de criação |
| `updated_at` | timestamptz | DEFAULT now() | Última atualização |

**Índices:**
- `idx_solicitacoes_compra_status` (status)
- `idx_solicitacoes_compra_created_by` (created_by)

---

### **4.40 Tabela: `itens_solicitacao_compra`** (NOVA)

Itens (liga/diâmetro/peso) de cada solicitação de compra.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | ID único |
| `solicitacao_id` | uuid | FK(solicitacoes_compra.id) ON DELETE CASCADE, NOT NULL | Solicitação pai |
| `liga_id` | uuid | FK(materiais.id), NOT NULL | Liga solicitada |
| `diametro` | integer | NOT NULL | Diâmetro em mm |
| `peso_kg` | numeric | NOT NULL | Peso em kg |
| `observacao` | text | NULL | Observação do item |
| `created_at` | timestamptz | DEFAULT now() | Data de criação |

**Índices:**
- `idx_itens_solicitacao_compra_solicitacao` (solicitacao_id)

---

### **4.41 Tabela: `cotacoes_fornecedor_compra`** (NOVA)

Dados gerais de cada fornecedor participante da cotação.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | ID único |
| `solicitacao_id` | uuid | FK(solicitacoes_compra.id) ON DELETE CASCADE, NOT NULL | Solicitação |
| `fornecedor_id` | uuid | FK(fornecedores.id), NOT NULL | Fornecedor |
| `condicao_pagamento` | text | NULL | Condição de pagamento oferecida |
| `validade_cotacao` | date | NULL | Data limite da cotação |
| `observacao` | text | NULL | Observações gerais |
| `created_at` | timestamptz | DEFAULT now() | Data de criação |

**Constraint única:** (solicitacao_id, fornecedor_id)

**Índices:**
- `idx_cotacoes_fornecedor_compra_solicitacao` (solicitacao_id)

---

### **4.42 Tabela: `cotacoes_item_compra`** (NOVA)

Preço por kg de cada item por fornecedor (matriz de cotações).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | ID único |
| `solicitacao_id` | uuid | FK(solicitacoes_compra.id) ON DELETE CASCADE, NOT NULL | Solicitação |
| `item_solicitacao_id` | uuid | FK(itens_solicitacao_compra.id) ON DELETE CASCADE, NOT NULL | Item cotado |
| `fornecedor_id` | uuid | FK(fornecedores.id), NOT NULL | Fornecedor |
| `preco_kg` | numeric | NOT NULL | Preço por kg em R$ |
| `prazo_entrega_dias` | integer | NULL | Prazo de entrega em dias |
| `observacao` | text | NULL | Observação específica |
| `created_at` | timestamptz | DEFAULT now() | Data de criação |
| `updated_at` | timestamptz | DEFAULT now() | Última atualização |

**Constraint única:** (item_solicitacao_id, fornecedor_id)

**Índices:**
- `idx_cotacoes_item_compra_solicitacao` (solicitacao_id)

---

### **4.43 Tabela: `config_aprovadores_compra`** (NOVA)

Usuários autorizados a aprovar solicitações de compra.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | ID único |
| `user_id` | uuid | FK(auth.users.id), NOT NULL | Usuário aprovador |
| `ativo` | boolean | DEFAULT true | Se está ativo |
| `created_at` | timestamptz | DEFAULT now() | Data de criação |

**Constraint única:** (user_id)

**Nota:** Apenas usuários nesta tabela com `ativo = true` podem aprovar/rejeitar solicitações.

---

## 🔧 ALTERAÇÃO 2: Novo Módulo

### **7.XX Módulo de Solicitação de Compras** (NOVO)

Módulo para solicitar, aprovar e acompanhar compras de matéria-prima com gestão de cotações de múltiplos fornecedores.

#### **7.XX.1 Página Principal (`/compras`)**

Lista de todas as solicitações com:
- Filtros: Status, Urgência, Ano
- Busca por número, solicitante ou justificativa
- Colunas: #, Data, Solicitante, Itens (resumo), Urgência, Status, Ações

**Badges de Status:**
| Status | Badge |
|--------|-------|
| Rascunho | ⚫ Cinza |
| Solicitado | 🟡 Amarelo |
| Aprovado | 🟢 Verde |
| Rejeitado | 🔴 Vermelho |
| Em Cotação | 🔵 Azul |
| Pedido Feito | 🟣 Roxo |
| Concluída | ✅ Verde escuro |
| Cancelada | ❌ Cinza |

**Badges de Urgência:**
| Urgência | Badge |
|----------|-------|
| Normal | ⚪ Cinza claro |
| Urgente | 🟡 Amarelo |
| Crítico | 🔴 Vermelho |

#### **7.XX.2 Modal Criar/Editar Solicitação**

Campos:
- **Justificativa** (textarea, obrigatório)
- **Urgência** (radio: Normal/Urgente/Crítico)
- **Itens** (tabela editável):
  - Liga (dropdown)
  - Diâmetro (mm)
  - Peso (kg)
  - Observação

Ações:
- Salvar Rascunho: salva sem enviar
- Solicitar: muda status para "Solicitado"

#### **7.XX.3 Modal Detalhes com Abas**

Cabeçalho com informações gerais (status, urgência, solicitante, aprovador).

**Aba Itens:**
- Tabela com Liga, Diâmetro, Peso, Observação
- Total de peso

**Aba Cotações (matriz):**
- Linhas: itens (liga/diâmetro)
- Colunas: fornecedores participantes
- Células: preço por kg (editável via popover)
- Subtotal por fornecedor
- Destaque do menor valor total
- Seleção do fornecedor vencedor

**Aba Histórico:**
- Timeline de mudanças de status

#### **7.XX.4 Modal Adicionar Fornecedor à Cotação**

Campos:
- Fornecedor (dropdown)
- Condição de pagamento
- Validade da cotação
- Observações gerais

#### **7.XX.5 Modais Aprovar/Rejeitar**

**Aprovar:**
- Resumo da solicitação
- Observação (opcional)
- Disponível apenas para usuários em `config_aprovadores_compra`

**Rejeitar:**
- Resumo da solicitação
- Motivo da rejeição (obrigatório)

#### **7.XX.6 Fluxo de Status**

```
Rascunho → Solicitado → Aprovado → Em Cotação → Pedido Feito → Concluída
                ↓
            Rejeitado
```

**Ações por Status:**

| Status | Ações Disponíveis |
|--------|-------------------|
| Rascunho | Editar, Solicitar, Excluir |
| Solicitado | Aprovar, Rejeitar (apenas aprovadores) |
| Aprovado | Iniciar Cotação, Cancelar |
| Em Cotação | Gerenciar Cotações, Fazer Pedido |
| Pedido Feito | Concluir |
| Concluída | Apenas visualizar |
| Rejeitado | Duplicar (criar nova baseada nesta) |

#### **7.XX.7 Página de Configuração de Aprovadores (`/config/compras`)**

- Lista usuários cadastrados como aprovadores
- Toggle de status (ativo/inativo)
- Dropdown para adicionar novos aprovadores
- Apenas usuários com role no sistema aparecem na lista

---

## 🔧 ALTERAÇÃO 3: Navegação

### **Seção 8.2 - Menu Pedidos** (ATUALIZAR)

```
🔧 Pedidos
  ├── Venda (Amarrados)
  ├── Venda (Peças)
  ├── Produção
  ├── Importação
  └── Solicitações Compra    ← NOVO
```

**Rota:** `/compras`

### **Seção 8.4 - Menu Configurações** (ATUALIZAR)

```
⚙️ Configurações
  ├── Materiais/Ligas
  ├── Clientes
  ├── Fornecedores
  ├── Produtos (Peças)
  ├── Endereços de Estoque
  ├── Usuários Sistema
  ├── Notificações
  ├── Produção
  ├── Aprovadores Compra      ← NOVO
  └── Log de Auditoria
```

**Rota:** `/config/compras`

---

## 🔧 ALTERAÇÃO 4: Fluxo de Usuário

### **9.X Fluxo de Solicitação de Compra** (NOVO)

```
Criar Solicitação de Compra
  → Informar: Justificativa + Urgência
  → Adicionar Itens (Liga + Diâmetro + Peso)
  → Salvar Rascunho OU Solicitar
  
  → (SOLICITADO) Aguarda aprovação
  → Aprovador acessa solicitação
  → Aprovar (APROVADO) ou Rejeitar (REJEITADO)
  
  → (APROVADO) Iniciar cotação
  → Adicionar fornecedores à cotação
  → Preencher preço por kg de cada item por fornecedor
  → Sistema calcula total por fornecedor
  → Selecionar fornecedor vencedor
  
  → (EM COTAÇÃO) → Fazer Pedido (PEDIDO FEITO)
  → (PEDIDO FEITO) → Material chega → Concluir (CONCLUÍDA)
```

---

## ✅ CHECKLIST DE ATUALIZAÇÃO

### Seção 4 - Modelo de Dados
- [ ] Adicionar 4.39 Tabela: `solicitacoes_compra`
- [ ] Adicionar 4.40 Tabela: `itens_solicitacao_compra`
- [ ] Adicionar 4.41 Tabela: `cotacoes_fornecedor_compra`
- [ ] Adicionar 4.42 Tabela: `cotacoes_item_compra`
- [ ] Adicionar 4.43 Tabela: `config_aprovadores_compra`

### Seção 7 - Módulos
- [ ] Adicionar novo módulo 7.XX Solicitação de Compras

### Seção 8 - Navegação
- [ ] Adicionar "Solicitações Compra" no menu Pedidos
- [ ] Adicionar "Aprovadores Compra" no menu Configurações

### Seção 9 - Fluxos
- [ ] Adicionar fluxo 9.X Solicitação de Compra

### Header
- [ ] Atualizar versão para 2.15
- [ ] Atualizar data para 14/01/2026
- [ ] Adicionar changelog v2.15

### Changelog
```
v2.15: Módulo de Solicitação de Compras - novo módulo para solicitar, aprovar e acompanhar compras de matéria-prima. Fluxo completo (Rascunho → Solicitado → Aprovado → Em Cotação → Pedido Feito → Concluída). Sistema de cotações com matriz liga/diâmetro × fornecedor e preço por kg. Configuração de aprovadores em `/config/compras`. Novas tabelas: `solicitacoes_compra`, `itens_solicitacao_compra`, `cotacoes_fornecedor_compra`, `cotacoes_item_compra`, `config_aprovadores_compra`. Página `/compras` com lista, filtros e modais de criação/detalhes/aprovação. Item "Solicitações Compra" adicionado no menu Pedidos.
```
