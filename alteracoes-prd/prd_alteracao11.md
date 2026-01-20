# 📋 Alterações Necessárias no PRD - Alteração 11

**Data:** 13/01/2026  
**Referência:** `alteracao11.md`

---

## 📊 RESUMO DAS ALTERAÇÕES

| # | Alteração | Seções Afetadas |
|---|-----------|-----------------|
| 1 | Nova tabela `historico_pecas` para movimentações de peças | 4.20.2 (NOVA) |
| 2 | Páginas de histórico unificadas (amarrados e peças) | 7.14, 8.3 |
| 3 | Visualização "Pontas" no modal de produção | 7.8 |
| 4 | UPSERT no registro de estoque de peças | 10 (Validações) |
| 5 | Referências resolvidas nos históricos (UUID → texto legível) | 7.14 |
| 6 | Atualizar seção 12.9 (Critérios de Aceite) | 12.9 |
| 7 | Atualizar changelog e versão | Header |

---

## 🔧 ALTERAÇÃO 1: Seção 4.20.2 - Tabela `historico_pecas`

**Adicionar após a seção 4.20.1 (`historico_entradas`):**

### **4.20.2 Tabela: `historico_pecas`**

Registro centralizado de todas as movimentações de peças (entradas e saídas).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK | ID único |
| `produto_id` | uuid | FK(produtos.id) ON DELETE CASCADE, NOT NULL | Produto movimentado |
| `tipo_movimento` | text | NOT NULL, CHECK | 'Entrada' ou 'Saida' |
| `quantidade` | integer | NOT NULL | Quantidade movimentada |
| `origem_tipo` | text | NOT NULL, CHECK | 'Producao', 'Ajuste', 'Devolucao', 'Manual' |
| `origem_id` | uuid | NULL | UUID da origem (ex: pedido_producao.id) |
| `referencia_externa` | text | NULL | NF, documento, observação |
| `endereco_id` | uuid | FK(enderecos_estoque.id) ON DELETE SET NULL | Endereço do estoque |
| `usuario_id` | uuid | NULL | Usuário que realizou |
| `created_at` | timestamptz | DEFAULT now() | Data do registro |

**Constraints:**
- CHECK (tipo_movimento IN ('Entrada', 'Saida'))
- CHECK (origem_tipo IN ('Producao', 'Ajuste', 'Devolucao', 'Manual'))

**Índices:**
- `idx_historico_pecas_produto` (produto_id)
- `idx_historico_pecas_origem` (origem_tipo, origem_id)
- `idx_historico_pecas_created` (created_at DESC)

**Referência Polimórfica:**
| origem_tipo | origem_id aponta para |
|-------------|----------------------|
| Producao | `pedidos_producao.id` |
| Ajuste | `ajustes_inventario.id` |
| Devolucao | `pedidos_venda.id` |
| Manual | NULL |

**Nota:** Referência polimórfica permite rastrear a origem de cada movimentação sem múltiplas FKs.

---

## 🔧 ALTERAÇÃO 2: Seção 7.14 - Páginas de Histórico Unificadas

**Substituir os itens de Histórico na seção 7.14 por:**

- **Histórico de Amarrados:** Página unificada `/historico-amarrados` que combina entradas e saídas de barras de aço. Inclui:
  - Cards de resumo: total entradas, total saídas, saldo do período
  - Filtros: direção (Entrada/Saída/Todas), tipo, busca, período
  - Tabela com ícones visuais (🟢 entrada, 🔴 saída)
  - Colunas: Data, Tipo, Amarrado, Liga, Ø, Barras, Peso, R$/kg, Ref
  - **Referências resolvidas:** UUIDs são convertidos para texto legível (ex: "Pedido #3 - Forjas Caxiense")

- **Histórico de Peças:** Página `/historico-pecas` para movimentações de produtos acabados. Inclui:
  - Cards de resumo: entradas, saídas, saldo
  - Filtros: direção (Entrada/Saída/Todas), origem, produto, busca, período
  - Colunas: Data, Origem, Código, Produto, Quantidade, Referência
  - **Referências resolvidas:** origem_id convertido para texto legível

**Nota:** As páginas `/historico-entradas` e `/historico-saidas` foram removidas e substituídas por `/historico-amarrados`.

---

## 🔧 ALTERAÇÃO 3: Seção 8.3 - Menu Relatórios

**Substituir o menu por:**

### **8.3 Menu Relatórios**

```
📊 Relatórios
  ├── Visão Financeira
  ├── Necessidade Produção
  ├── Histórico Amarrados   ← Unifica entradas e saídas de barras
  └── Histórico Peças       ← Movimentações de produtos acabados
```

---

## 🔧 ALTERAÇÃO 4: Seção 7.8 - Visualização "Pontas" no Modal de Produção

**Adicionar à seção 7.8 (Pedido de Produção), após 7.8.4:**

#### **7.8.6 Exibição de Itens com "Pontas de Barra"**

Quando um item do pedido usa `usa_pontas_barra = true`:

| Campo | Valor Exibido |
|-------|---------------|
| Amarrado | ✂️ Pontas (ícone + texto) |
| Barras Solic. | - |
| Barras Cons. | - |
| Campo "Barras Consumidas" no lançamento | Desabilitado, mostra "✂️ Pontas" |

**Visual no Modal de Produção:**
- Itens normais: mostram ID do amarrado e campos editáveis
- Itens com pontas: mostram "✂️ Pontas" em cinza, campos não editáveis

---

## 🔧 ALTERAÇÃO 5: Seção 10 - Registro de Estoque de Peças (UPSERT)

**Adicionar às validações de Estoque de Peças:**

| Situação | Comportamento |
|----------|---------------|
| Estoque já existe para produto+localização | UPSERT: soma quantidade nova à existente |
| Constraint UNIQUE violada | Tratado automaticamente pelo onConflict |

**Nota:** O registro de recebimento de produção utiliza UPSERT com `onConflict: 'produto_id,localizacao'` para evitar erros de constraint UNIQUE quando o estoque já existe.

---

## 🔧 ALTERAÇÃO 6: Seção 12.9 - Critérios de Aceite (Históricos)

**Substituir a seção 12.9 por:**

### **12.9 Historicos**

- [ ] Histórico de Amarrados (`/historico-amarrados`) exibe dados unificados de `historico_entradas` e `historico_saidas`
- [ ] Histórico de Peças (`/historico-pecas`) exibe dados da tabela `historico_pecas`
- [ ] Filtros por período, tipo/direção e busca funcionam
- [ ] Referências UUID são resolvidas para texto legível (ex: "Pedido #3 - Forjas Caxiense")
- [ ] Sem funcionalidade de estorno
- [ ] **Registro automático - Saídas de Amarrados:**
  - [ ] Transferência (origem) registra em `historico_saidas`
  - [ ] Envio para produção registra em `historico_saidas`
  - [ ] Faturamento de venda registra em `historico_saidas`
  - [ ] Ajuste inventário (redução) registra em `historico_saidas`
- [ ] **Registro automático - Entradas de Amarrados:**
  - [ ] Recebimento importação China registra em `historico_entradas`
  - [ ] Importação Excel genérica registra em `historico_entradas`
  - [ ] Transferência (destino) registra em `historico_entradas`
  - [ ] Ajuste inventário (aumento) registra em `historico_entradas`
- [ ] **Registro automático - Peças:**
  - [ ] Recebimento de produção registra em `historico_pecas` (tipo: Entrada, origem: Producao)
  - [ ] Venda de peças registra em `historico_pecas` (tipo: Saida, origem: Venda)
  - [ ] Ajuste inventário registra em `historico_pecas`
- [ ] Modal histórico no canvas exibe dados de ambas tabelas de amarrados

---

## 🔧 ALTERAÇÃO 7: Header - Changelog e Versão

**Atualizar tabela de informações do documento:**

| Campo | Valor |
|-------|-------|
| **Versão do PRD** | 2.9 |
| **Última Atualização** | 13/01/2026 |

**Adicionar ao início do Changelog:**

```
v2.9: Históricos unificados - páginas `/historico-entradas` e `/historico-saidas` substituídas por `/historico-amarrados` (visão unificada). Nova tabela `historico_pecas` para movimentações de peças com referência polimórfica. Nova página `/historico-pecas`. Menu Relatórios atualizado. Referências UUID resolvidas para texto legível. Itens com "pontas de barra" exibem ✂️ Pontas no modal de produção. UPSERT no registro de estoque de peças.
```

---

## ✅ CHECKLIST DE ATUALIZAÇÃO

- [x] Seção 4.20.2: Adicionar tabela `historico_pecas`
- [x] Seção 7.14: Atualizar descrição dos históricos (unificados)
- [x] Seção 7.8: Adicionar subseção 7.8.6 (exibição de pontas)
- [x] Seção 8.3: Atualizar menu Relatórios
- [x] Seção 10: Nota sobre UPSERT implícita na documentação da tabela
- [x] Seção 12.9: Atualizar critérios de aceite dos históricos
- [x] Header: Atualizar versão para 2.9 e data para 13/01/2026
- [x] Header: Adicionar changelog v2.9

**Status:** ✅ Todas as alterações aplicadas em 13/01/2026

---

## 📝 NOTAS DA VERIFICAÇÃO

**Verificações realizadas no PRD atual (v2.8):**

| Item | Status | Observação |
|------|--------|------------|
| Tabela `historico_entradas` | ✅ | Existe em 4.20.1 |
| Tabela `historico_saidas` | ✅ | Existe em 4.20 |
| Tabela `historico_pecas` | ❌ | Não existe, precisa criar |
| Seção 7.14 (Outras Funcionalidades) | ✅ | Menciona históricos separados |
| Seção 8.3 (Menu Relatórios) | ✅ | Não tem históricos no menu |
| Campo `usa_pontas_barra` | ✅ | Já documentado em 4.17 |
| Seção 12.9 | ✅ | Referencia páginas antigas |
