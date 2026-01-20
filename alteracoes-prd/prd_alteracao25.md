# 📋 Alterações Necessárias no PRD - Alteração 25_v2

**Data:** 15/01/2026  
**Referência:** `alteracao25_v2.md`

---

## 📊 RESUMO DAS ALTERAÇÕES

| # | Alteração | Seções Afetadas |
|---|-----------|-----------------|
| 1 | Campos de posição em `itens_enviados_producao` | 4.17 |
| 2 | Campos de posição em `reservas_estoque` | 4.12 |
| 3 | Frações de amarrados no canvas (múltiplas representações visuais) | 7.2.3 (nova subseção) |
| 4 | Bolinha exibe barras disponíveis (não saldo total) | 7.2.3 |
| 5 | Modal de detalhes com tabela de reservas | 7.2.3 |

---

## 🔧 ALTERAÇÃO 1: Campos de posição em `itens_enviados_producao`

### **[Seção 4.17] (ATUALIZAR)**

Adicionar campos `posicao_x` e `posicao_y` na tabela:

**Texto existente:**
```markdown
### **4.17 Tabela: `itens_enviados_producao`**

Totalização de amarrados enviados no pedido de produção (consolidado a partir dos itens solicitados).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK | ID único |
| `pedido_id` | uuid | FK(pedidos_producao.id) ON DELETE CASCADE, NOT NULL | Pedido |
| `amarrado_id` | text | FK(amarrados.id), NOT NULL | Amarrado enviado |
| `barras_enviadas` | decimal(10,2) | NOT NULL | Total de barras (soma de todos os produtos, 2 casas decimais) |
| `peso_enviado` | decimal | NOT NULL | Peso enviado |
| `custo_kg_envio` | numeric | NULL | Custo por kg em R$ no momento do envio para terceiros |
| `created_at` | timestamptz | DEFAULT now() | Data de criação |
```

**Texto atualizado (adicionar 2 linhas na tabela antes de `created_at`):**
```markdown
### **4.17 Tabela: `itens_enviados_producao`**

Totalização de amarrados enviados no pedido de produção (consolidado a partir dos itens solicitados).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK | ID único |
| `pedido_id` | uuid | FK(pedidos_producao.id) ON DELETE CASCADE, NOT NULL | Pedido |
| `amarrado_id` | text | FK(amarrados.id), NOT NULL | Amarrado enviado |
| `barras_enviadas` | decimal(10,2) | NOT NULL | Total de barras (soma de todos os produtos, 2 casas decimais) |
| `peso_enviado` | decimal | NOT NULL | Peso enviado |
| `custo_kg_envio` | numeric | NULL | Custo por kg em R$ no momento do envio para terceiros |
| `posicao_x` | numeric | NULL | Posição X da fração no canvas |
| `posicao_y` | numeric | NULL | Posição Y da fração no canvas |
| `created_at` | timestamptz | DEFAULT now() | Data de criação |
```

---

## 🔧 ALTERAÇÃO 2: Campos de posição em `reservas_estoque`

### **[Seção 4.12] (ATUALIZAR)**

Adicionar campos `posicao_x` e `posicao_y` na tabela:

**Texto existente:**
```markdown
### **4.12 Tabela: `reservas_estoque`**

Controle de barras reservadas por pedidos de venda.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK | ID único |
| `amarrado_id` | text | FK(amarrados.id) ON DELETE CASCADE, NOT NULL | Amarrado |
| `pedido_venda_id` | uuid | FK(pedidos_venda_amarrados.id) ON DELETE CASCADE, NOT NULL | Pedido de venda |
| `barras_reservadas` | integer | NOT NULL | Quantidade de barras reservadas |
| `created_at` | timestamptz | DEFAULT now() | Data da reserva |
```

**Texto atualizado (adicionar 2 linhas na tabela antes de `created_at`):**
```markdown
### **4.12 Tabela: `reservas_estoque`**

Controle de barras reservadas por pedidos de venda.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK | ID único |
| `amarrado_id` | text | FK(amarrados.id) ON DELETE CASCADE, NOT NULL | Amarrado |
| `pedido_venda_id` | uuid | FK(pedidos_venda_amarrados.id) ON DELETE CASCADE, NOT NULL | Pedido de venda |
| `barras_reservadas` | integer | NOT NULL | Quantidade de barras reservadas |
| `posicao_x` | numeric | NULL | Posição X da fração no canvas |
| `posicao_y` | numeric | NULL | Posição Y da fração no canvas |
| `created_at` | timestamptz | DEFAULT now() | Data da reserva |
```

---

## 🔧 ALTERAÇÃO 3: Frações de amarrados no canvas

### **[Seção 7.2.3.1] (NOVA SUBSEÇÃO após 7.2.3)**

Adicionar nova subseção após "7.2.3 Representação do Amarrado (Bolinha)":

```markdown
#### **7.2.3.1 Frações de Amarrados (Múltiplas Representações)**

Quando um amarrado tem barras enviadas para produção ou reservadas para venda, o canvas exibe representações visuais separadas para cada contexto:

**Representações Possíveis:**
- **Estoque Ativo:** Bolinha normal mostrando barras disponíveis (`barras_atual - barras_reservadas`)
- **Em Produção:** Bolinha com borda laranja (2px) mostrando barras em poder do fornecedor
- **Reservado:** Bolinha com borda azul (2px) mostrando barras reservadas para venda

**Aparência das Frações:**
```
Exemplo: A01 com 15 barras originais
- 10 barras reservadas para venda → bolinha principal mostra 5 (disponíveis)
- 3 enviadas para produção

┌──────┐ ┌──────┐ ┌──────┐
│ A01  │ │ A01  │ │ A01  │
│  5   │ │  3   │ │ 10   │
└──────┘ └──────┘ └──────┘
 Normal   PP#12    PV#45
(5 disp.) (laranja) (azul)
```

**Elementos Visuais:**
- **Borda colorida:** 2px laranja para produção, 2px azul para reserva
- **Badge:** Canto inferior com referência do pedido (PP#12, PV#45)
- **Cor de fundo:** Mantém a cor da liga (igual ao amarrado original)
- **Exibição de barras:** Bolinha principal mostra barras disponíveis (não saldo total); frações mostram quantidade específica

**Comportamento:**
- **Offset automático:** Ao criar fração sem posição, aplica offset de +20px em X em relação ao amarrado original
- **Posição arrastável:** Usuário pode reposicionar; posição é persistida na tabela de origem
- **Clique:** Abre modal de detalhes com link para o pedido relacionado
- **Tooltip:** Exibe contexto completo (ex: "A01 - 3 barras - Pedido Produção #12")

**Filtros de Visibilidade:**
| Contexto | Aparece quando | Desaparece quando |
|----------|----------------|-------------------|
| Em Produção | Pedido status "Em Produção" ou "Aguardando Confirmação" | Recebimento finalizado ou pedido cancelado |
| Reservado | Status "Em Separação", "Separado", "Faturado Parcial" ou "Faturado" | Status "Entregue" ou "Cancelado" |

**Índices:**
- `idx_itens_enviados_producao_posicao` (amarrado_id) WHERE posicao_x IS NOT NULL
- `idx_reservas_estoque_posicao` (amarrado_id) WHERE posicao_x IS NOT NULL

#### **7.2.3.2 Modal de Detalhes - Tabela de Reservas**

Quando um amarrado possui barras reservadas, o modal de detalhes exibe uma tabela com as reservas ativas:

**Estrutura da Tabela:**
| Destino | Qt barras | Peso | Ação |
|---------|-----------|------|------|
| PV#9 | 6 | 600kg | ↗ |
| PV#7 | 5 | 500kg | ↗ |
| **Total:** | **11** | **1100kg** | |

**Comportamento:**
- Peso calculado automaticamente: `(barras_reservadas / barras_atual) × peso_atual`
- Botão "↗" abre o pedido de venda em nova aba
- Exibe apenas reservas de pedidos com status diferente de "Cancelado" ou "Entregue"
```

---

## 🔧 ALTERAÇÃO 4: Bolinha exibe barras disponíveis

### **[Seção 7.2.3] (ATUALIZAR)**

No texto existente da seção "7.2.3 Representação do Amarrado (Bolinha)", adicionar na parte de "Conteúdo interno":

**Adicionar nota após a descrição das 3 linhas:**
```markdown
**Nota sobre barras exibidas:**
- A bolinha exibe **barras disponíveis** (barras_atual - barras_reservadas), não o saldo total
- Frações (produção/reserva) exibem a quantidade específica da fração
```

---

## ✅ CHECKLIST DE ATUALIZAÇÃO

### Tabelas (Seção 4)
- [ ] 4.12 - Adicionar `posicao_x`, `posicao_y` em `reservas_estoque`
- [ ] 4.17 - Adicionar `posicao_x`, `posicao_y` em `itens_enviados_producao`

### Interface Canvas (Seção 7)
- [ ] 7.2.3 - Adicionar nota sobre exibição de barras disponíveis
- [ ] 7.2.3.1 - Nova subseção "Frações de Amarrados (Múltiplas Representações)"
- [ ] 7.2.3.2 - Nova subseção "Modal de Detalhes - Tabela de Reservas"

### Header
- [ ] Atualizar versão para 2.19
- [ ] Atualizar data para 15/01/2026
- [ ] Adicionar changelog v2.19
