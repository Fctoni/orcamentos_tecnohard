# 📋 Alterações Necessárias no PRD - Alteração 13

**Data:** 13/01/2026  
**Referência:** `alteracao13.md`

---

## 📊 RESUMO DAS ALTERAÇÕES

| # | Alteração | Seções Afetadas |
|---|-----------|-----------------|
| 1 | Nova tabela `reservas_estoque_pecas` para reserva de peças por endereço | 4.14 (NOVA) |
| 2 | Fluxo de Venda de Peças alterado com sistema de reservas | 7.6 |
| 3 | Relatório de Necessidade de Produção atualizado | 7.9 |
| 4 | Tela de Estoque de Peças com colunas Reservado/Disponível | 7.5 |
| 5 | Registro de saída no `historico_pecas` ao faturar | 7.6, 12.9 |
| 6 | Atualizar changelog e versão | Header |

---

## 🔧 ALTERAÇÃO 1: Seção 4.14 - Tabela `reservas_estoque_pecas`

**Adicionar após a seção 4.13 (`itens_pedido_venda_pecas`):**

### **4.14 Tabela: `reservas_estoque_pecas`**

Controle de peças reservadas por pedidos de venda, vinculadas a endereços específicos.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK | ID único |
| `produto_id` | uuid | FK(produtos.id), NOT NULL | Produto reservado |
| `endereco_id` | uuid | FK(enderecos_estoque.id), NOT NULL | Endereço de origem |
| `item_pedido_id` | uuid | FK(itens_pedido_venda_pecas.id) ON DELETE CASCADE, NOT NULL | Item do pedido |
| `quantidade` | integer | NOT NULL | Quantidade reservada |
| `created_at` | timestamptz | DEFAULT now() | Data da reserva |

**Índices:**
- `idx_reservas_pecas_produto_endereco` (produto_id, endereco_id)
- `idx_reservas_pecas_item_pedido` (item_pedido_id)

**Nota:** Um item de pedido pode ter múltiplas reservas em endereços diferentes. Permite reservar 70 peças do endereço A1 e 10 do C3 para o mesmo item.

**Cálculo de Estoque Disponível:**
```sql
disponivel = estoque_pecas.quantidade - SUM(reservas_estoque_pecas.quantidade)
```

---

## 🔧 ALTERAÇÃO 2: Seção 7.6 - Fluxo de Venda de Peças

**Substituir o fluxo de status por:**

### **7.6 Pedido de Venda de Peças**

#### **7.6.1 Ciclo de Vida do Pedido**

```
┌─────────────────────┐
│    Aguardando       │ ← Todos os pedidos começam aqui
└──────────┬──────────┘
           │ (ação: Reservar Estoque)
           ▼
┌─────────────────────┐
│  Em Separação       │ ← Estoque reservado
└──────────┬──────────┘
           │ (ação: Marcar Separado)
           ▼
┌─────────────────────┐
│     Separado        │
└──────────┬──────────┘
           │ (ação: Faturar + NF)
           ▼
┌─────────────────────┐
│ Aguardando Entrega  │ ← Estoque DESCONTADO, reservas removidas
└──────────┬──────────┘
           │ (ação: Marcar Entregue)
           ▼
┌─────────────────────┐
│     Entregue        │ ← FIM
└─────────────────────┘

      OU

┌─────────────────────┐
│     Cancelado       │ ← Reservas liberadas automaticamente
└─────────────────────┘
```

**Mudança principal:** Pedidos sempre começam em "Aguardando", independente de ter estoque. O operador decide QUANDO e DE ONDE reservar, permitindo priorização por data de entrega.

#### **7.6.2 Modal de Reserva de Estoque**

Quando o operador clica em "Reservar" em um item:

| Campo | Descrição |
|-------|-----------|
| Produto | Nome e código do produto |
| Quantidade solicitada | Quantidade do item no pedido |
| Tabela de endereços | Lista com: Endereço, Total, Reservado, Disponível, Campo para reservar |

**Comportamento:**
- Operador distribui a quantidade entre endereços disponíveis
- Pode reservar de múltiplos endereços (ex: 70 de A1 + 10 de C3)
- Validação: não permite reservar mais que o disponível por endereço
- Validação: soma deve atingir quantidade solicitada

#### **7.6.3 Status de Reserva por Item**

| Status | Badge | Condição |
|--------|-------|----------|
| Pendente | 🟡 Amarelo | Sem reservas |
| Parcial | 🟠 Laranja | Reservado < Solicitado |
| Reservado | 🟢 Verde | Reservado = Solicitado |

#### **7.6.4 Cancelamento de Reserva**

- Botão "Cancelar Reserva" remove todos os registros de `reservas_estoque_pecas` do item
- Estoque volta a ficar disponível automaticamente (cálculo dinâmico)
- Status do pedido volta para "Aguardando" se nenhum item tiver reserva

#### **7.6.5 Faturamento**

Ao faturar:
1. Desconta estoque de `estoque_pecas` baseado nos endereços reservados
2. Remove registros de `reservas_estoque_pecas`
3. **Registra saída em `historico_pecas`** (tipo: Saida, origem: Venda)
4. Atualiza NF e data de faturamento

---

## 🔧 ALTERAÇÃO 3: Seção 7.9 - Relatório de Necessidade de Produção

**Adicionar/atualizar na seção 7.9:**

#### **7.9.3 Indicadores do Relatório**

| Indicador | Descrição | Cálculo |
|-----------|-----------|---------|
| **Demanda Total** | Quantidade total em pedidos de venda | SUM(itens_pedido_venda_pecas.quantidade) |
| **Demanda Reservada** | Pedidos com estoque alocado | SUM(reservas_estoque_pecas.quantidade) |
| **Demanda Pendente** | Pedidos aguardando reserva | Demanda Total - Reservada |
| **Estoque Total** | Quantidade física | SUM(estoque_pecas.quantidade) |
| **Estoque Reservado** | Alocado para pedidos | SUM(reservas_estoque_pecas.quantidade) |
| **Estoque Disponível** | Livre para novos pedidos | Total - Reservado |
| **Em Produção** | Em pedidos de produção não finalizados | SUM(qtd_solicitada - qtd_produzida) |
| **Necessidade** | Quantidade a produzir | Demanda Pendente - Disponível - Em Produção |

#### **7.9.4 Fórmula de Necessidade**

```
Necessidade Real = Demanda Pendente - Estoque Disponível - Em Produção

Onde:
- Demanda Pendente = pedidos SEM reserva completa
- Estoque Disponível = Estoque Total - Estoque Reservado
- Em Produção = itens em pedidos com status IN ('Criado', 'Em Producao', 'Aguardando Confirmacao')
```

#### **7.9.5 Coluna "Em Produção"**

Nova coluna mostrando quantidade em processo de fabricação:
- Busca em `itens_solicitados_producao` vinculados a `pedidos_producao` ativos
- Calcula: `qtd_solicitada - COALESCE(qtd_produzida, 0)`
- Exibe link para pedido(s) de produção relacionados

---

## 🔧 ALTERAÇÃO 4: Seção 7.5 - Tela de Estoque de Peças

**Adicionar à seção 7.5:**

#### **7.5.X Indicadores de Reserva**

**Cards de resumo:**
| Card | Descrição |
|------|-----------|
| Total | Quantidade física total |
| Reservado | Total alocado para pedidos |
| Disponível | Total - Reservado (livre) |
| Produtos | Quantidade de produtos distintos |
| Endereços | Quantidade de endereços com estoque |

**Tabela de estoque:**
| Coluna | Descrição |
|--------|-----------|
| Código | Código interno do produto |
| Produto | Descrição |
| Total | Quantidade total em todos endereços |
| **Reservado** | Quantidade com reserva (NOVA) |
| **Disponível** | Total - Reservado (NOVA) |
| Endereços | Quantidade de endereços com este produto |

**Detalhe por endereço (expandido):**
| Coluna | Descrição |
|--------|-----------|
| Endereço | Código do endereço |
| Total | Quantidade no endereço |
| Reservado | Reservas neste endereço |
| Disponível | Livre neste endereço |
| Reservas | Lista de pedidos (ex: "Ped #45 (30), #47 (70)") |

---

## 🔧 ALTERAÇÃO 5: Seção 12.9 - Critérios de Aceite (Históricos)

**Adicionar aos critérios de Peças:**

- [ ] Faturamento de venda de peças registra em `historico_pecas` (tipo: Saida, origem: Venda)
- [ ] Referência do histórico aponta para `pedidos_venda_pecas.id`
- [ ] Registra por item/endereço quando houver reservas múltiplas

---

## 🔧 ALTERAÇÃO 6: Seção 12.6 - Critérios de Aceite (Pedidos de Venda)

**Atualizar critérios de Venda de Peças:**

### **12.6.X Venda de Peças - Reservas**

- [ ] Pedidos de venda de peças sempre iniciam em "Aguardando"
- [ ] Modal de reserva permite selecionar endereços
- [ ] Reserva de múltiplos endereços para mesmo item funciona
- [ ] Status de reserva por item: Pendente/Parcial/Reservado
- [ ] Cancelamento de reserva libera estoque automaticamente
- [ ] Faturamento remove reservas e desconta estoque
- [ ] Cancelamento de pedido remove todas as reservas
- [ ] Estoque disponível = Total - Reservado (cálculo dinâmico)

---

## 🔧 ALTERAÇÃO 7: Header - Changelog e Versão

**Atualizar tabela de informações do documento:**

| Campo | Valor |
|-------|-------|
| **Versão do PRD** | 2.10 |
| **Última Atualização** | 13/01/2026 |

**Adicionar ao início do Changelog:**

```
v2.10: Sistema de Reserva de Peças - nova tabela `reservas_estoque_pecas` para reserva por endereço. Fluxo de venda de peças alterado (todos começam em "Aguardando"). Modal de reserva com seleção de múltiplos endereços. Cancelamento de reserva. Relatório de Necessidade de Produção atualizado com coluna "Em Produção" e fórmula que considera reservas. Tela de Estoque de Peças com colunas Reservado/Disponível. Registro de saída em `historico_pecas` ao faturar pedido.
```

---

## ✅ CHECKLIST DE ATUALIZAÇÃO

- [ ] Seção 4.14: Adicionar tabela `reservas_estoque_pecas`
- [ ] Seção 7.6: Atualizar fluxo de venda de peças com sistema de reservas
- [ ] Seção 7.6: Adicionar subseções de modal de reserva e cancelamento
- [ ] Seção 7.9: Atualizar indicadores e fórmula de necessidade
- [ ] Seção 7.9: Adicionar coluna "Em Produção"
- [ ] Seção 7.5: Adicionar colunas Reservado/Disponível
- [ ] Seção 12.6: Adicionar critérios de aceite para reservas
- [ ] Seção 12.9: Adicionar critério de registro histórico ao faturar
- [ ] Header: Atualizar versão para 2.10 e data para 13/01/2026
- [ ] Header: Adicionar changelog v2.10

---

## 📝 NOTAS DA VERIFICAÇÃO

**Verificações a realizar no PRD atual (v2.9):**

| Item | Status | Observação |
|------|--------|------------|
| Tabela `reservas_estoque` (amarrados) | ✅ | Existe em 4.12 |
| Tabela `reservas_estoque_pecas` | ❌ | Não existe, precisa criar |
| Seção 7.6 (Venda de Peças) | ✅ | Existe, precisa atualizar fluxo |
| Seção 7.9 (Necessidade Produção) | ✅ | Existe, precisa adicionar "Em Produção" |
| Seção 7.5 (Estoque de Peças) | ✅ | Existe, precisa adicionar colunas |
| Registro em historico_pecas | ✅ | Tabela existe em 4.20.2 |
