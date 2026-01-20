# 📋 Alterações Necessárias no PRD - Alteração 23

**Data:** 15/01/2026  
**Referência:** `alteracao23_v2.md`

---

## 📊 RESUMO DAS ALTERAÇÕES

| # | Alteração | Seções Afetadas |
|---|-----------|-----------------|
| 1 | Nova tabela `historico_custos_produto` | Seção 4 (Modelo de Dados) |
| 2 | Campos de custo em `itens_solicitados_producao` | Seção 4.16 |
| 3 | Campo `custo_medio` em `produtos` | Seção 4.6 |
| 4 | Modal de Confirmação de Custos no recebimento | Seção 7.4 |

---

## 🔧 ALTERAÇÃO 1: Nova Tabela de Histórico de Custos

### **4.48 Tabela: `historico_custos_produto`** (NOVA)

Histórico de alterações no custo médio dos produtos/peças.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | ID único |
| `produto_id` | uuid | FK(produtos.id), NOT NULL | Produto afetado |
| `custo_medio_anterior` | numeric | NULL | Custo antes da alteração |
| `custo_medio_novo` | numeric | NOT NULL | Novo custo após alteração |
| `origem` | varchar(50) | NOT NULL | Origem da alteração ('Producao', 'Manual', 'Importacao') |
| `referencia_id` | uuid | NULL | ID do pedido/registro que originou a mudança |
| `motivo` | text | NULL | Descrição opcional |
| `created_at` | timestamptz | DEFAULT now() | Data/hora da alteração |
| `created_by` | uuid | FK(auth.users.id), NULL | Quem fez a alteração |

**Índices:**
- `idx_historico_custos_produto_produto_id` (produto_id)
- `idx_historico_custos_produto_created_at` (created_at DESC)

---

## 🔧 ALTERAÇÃO 2: Campos de Custo em itens_solicitados_producao

### **4.16 Tabela: `itens_solicitados_producao`** (ATUALIZAR)

Adicionar campos de custo:

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `custo_mp` | numeric | NULL | Custo da matéria-prima por peça (calculado) |
| `custo_mo` | numeric | NULL | Custo da mão de obra por peça (informado) |
| `custo_total` | numeric | NULL | custo_mp + custo_mo |

**Fórmulas de Cálculo:**
```
peso_por_peca = peso_consumido / qtd_produzida
custo_mp = peso_por_peca × custo_kg_envio (de itens_enviados_producao)
custo_mo = informado pelo usuário (unitário)
custo_total = custo_mp + custo_mo
```

---

## 🔧 ALTERAÇÃO 3: Campo custo_medio em Produtos

### **4.6 Tabela: `produtos`** (ATUALIZAR)

Adicionar campo de custo médio:

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `custo_medio` | numeric | DEFAULT 0 | Custo médio ponderado da peça |

**Fórmula de Atualização (média ponderada):**
```
novo_custo_medio = (custo_medio_atual × qtd_estoque_atual + custo_total × qtd_lote) 
                   / (qtd_estoque_atual + qtd_lote)
```

---

## 🔧 ALTERAÇÃO 4: Modal de Confirmação de Custos

### **7.4 Pedido de Produção** (ATUALIZAR)

#### **7.4.X Recebimento com Confirmação de Custos**

**Fluxo atualizado:**

```
Recebimento de Produção
  1. Modal de Recebimento (existente)
     → Nova coluna "Custo MO (R$)" por item
     → Input numérico para custo MO unitário
  
  2. Ao clicar "Confirmar Recebimento"
     → Abre Modal de Confirmação de Custos
  
  3. Modal de Confirmação de Custos
     → Exibe cálculos detalhados por produto
     → Mostra estoque atual, quantidade entrando, resultado
     → Calcula média ponderada automaticamente
  
  4. Ao confirmar
     → Salva custos em itens_solicitados_producao
     → Atualiza custo_medio em produtos
     → Registra em historico_custos_produto
     → Adiciona peças em estoque_pecas
```

#### **7.4.X.1 Modal de Recebimento (modificação)**

Nova coluna na tabela de itens:

| Coluna | Descrição |
|--------|-----------|
| Custo MO (R$) | Input numérico para custo de mão de obra unitário por peça |

**Comportamento:**
- Custo MO pode ficar zerado (não obrigatório)
- Valor informado é unitário (R$/peça)
- Ao clicar "Confirmar" → abre modal de confirmação de custos

#### **7.4.X.2 Modal de Confirmação de Custos (novo)**

Exibe um card por produto recebido com:

**Seção 1 - Visão Geral:**
| Campo | Descrição |
|-------|-----------|
| Estoque Atual | Quantidade e custo médio atual |
| Entrando Agora | Quantidade e custo do lote |
| Após Entrada | Quantidade total e novo custo médio |

**Seção 2 - Cálculo do Custo MP:**
```
Peso consumido: X kg ÷ Qtd produzida: Y = Z kg/peça
Peso/peça × Custo MP/kg: Z × R$ W = R$ A
Custo MO informado: R$ B/peça
Custo Total: R$ A + R$ B = R$ C/peça
```

**Seção 3 - Média Ponderada:**
```
(qtd_atual × custo_atual + qtd_lote × custo_lote) ÷ qtd_total = novo_custo_medio
```

**Ao confirmar:**
- Atualiza `custo_mp`, `custo_mo`, `custo_total` em `itens_solicitados_producao`
- Atualiza `custo_medio` em `produtos` (média ponderada)
- Registra alteração em `historico_custos_produto`
- Adiciona peças em `estoque_pecas`

---

## ✅ CHECKLIST DE ATUALIZAÇÃO

### Seção 4 - Modelo de Dados
- [ ] Adicionar 4.48 Tabela: `historico_custos_produto`
- [ ] Atualizar 4.16 `itens_solicitados_producao` com campos de custo
- [ ] Atualizar 4.6 `produtos` com campo custo_medio

### Seção 7 - Módulos
- [ ] Atualizar 7.4 Pedido de Produção com fluxo de confirmação de custos

### Header
- [ ] Atualizar versão para 2.17
- [ ] Atualizar data
- [ ] Adicionar changelog v2.17

### Changelog
```
v2.17: Sistema de Custo para Peças - cálculo automático de custo por peça no recebimento de produção. Custo da peça = Custo MP (calculado: peso_consumido/qtd × custo_kg_envio) + Custo MO (informado pelo usuário). Nova coluna "Custo MO (R$)" no modal de recebimento. Novo Modal de Confirmação de Custos com cálculos detalhados e média ponderada. Nova tabela `historico_custos_produto` para rastreamento de alterações no custo médio. Novos campos em `itens_solicitados_producao`: `custo_mp`, `custo_mo`, `custo_total`. Novo campo em `produtos`: `custo_medio` (média ponderada atualizada a cada recebimento).
```
