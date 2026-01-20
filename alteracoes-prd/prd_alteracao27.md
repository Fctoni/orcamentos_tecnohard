# 📋 Alterações Necessárias no PRD - Alteração 27

**Data:** 20/01/2026  
**Referência:** `spec-alteracao27.md`

---

## 📊 RESUMO DAS ALTERAÇÕES

| # | Alteração | Seções Afetadas |
|---|-----------|-----------------|
| 1 | Novo filtro padrão "Ativos" em 6 páginas de listagem | 7.6, 7.7, 7.9, 7.11, 7.19, 7.21 |
| 2 | Lógica de filtro alterada para `_todos` (exclui cancelados) | 7.6, 7.7, 7.9, 7.11, 7.19, 7.21 |

---

## 🔧 ALTERAÇÃO 1: Filtro Padrão "Ativos" nas Páginas de Listagem

### Descrição Geral

Todas as páginas de listagem de pedidos agora abrem com o filtro de status configurado como **"Ativos"** (ao invés de "Todos os Status"). Isso melhora a UX ao mostrar apenas pedidos em andamento por padrão.

**Comportamento dos filtros:**
- **Ativos** (`_ativos`) - PADRÃO: Mostra apenas pedidos em andamento (exclui finalizados e cancelados)
- **Todos os Status** (`_todos`): Mostra pedidos ativos + finalizados (exclui cancelados)
- **[Status específico]**: Mostra apenas esse status
- **Cancelado**: Só aparece se selecionado explicitamente

**Badge "Limpar filtros":** Considera "Ativos" como estado limpo (não exibe o badge quando filtro está em "Ativos")

---

### **[Seção 7.6] Pedido de Venda (Amarrados) - ATUALIZAR**

**Adicionar na subseção de Filtros:**

| Filtro | Comportamento |
|--------|---------------|
| Ativos (padrão) | Em Separacao, Separado, Faturado Parcial, Faturado |
| Todos os Status | Ativos + Entregue (exclui Cancelado) |
| [Status individual] | Apenas o status selecionado |

---

### **[Seção 7.7] Pedido de Venda (Peças) - ATUALIZAR**

**Adicionar na subseção de Filtros:**

| Filtro | Comportamento |
|--------|---------------|
| Ativos (padrão) | Aguardando, Aguardando Producao, Em Separacao, Separado, Faturado Parcial, Faturado |
| Todos os Status | Ativos + Entregue (exclui Cancelado) |
| [Status individual] | Apenas o status selecionado |

---

### **[Seção 7.9] Pedido de Produção - ATUALIZAR**

**Adicionar na subseção de Filtros:**

| Filtro | Comportamento |
|--------|---------------|
| Ativos (padrão) | Criado, Em Producao, Aguardando Confirmacao |
| Todos os Status | Ativos + Recebido (exclui Cancelado) |
| [Status individual] | Apenas o status selecionado |

---

### **[Seção 7.11] Pedido de Importação - ATUALIZAR**

**Adicionar na subseção de Filtros:**

| Filtro | Comportamento |
|--------|---------------|
| Ativos (padrão) | Pedido Feito, Em Producao, Producao Confirmada, Em Transito Maritimo, No Porto, Liberado |
| Todos os Status | Ativos + Recebido (exclui Cancelado) |
| [Status individual] | Apenas o status selecionado |

---

### **[Seção 7.19] Módulo de Solicitação de Compras - ATUALIZAR**

**Adicionar na subseção de Filtros:**

| Filtro | Comportamento |
|--------|---------------|
| Ativos (padrão) | Rascunho, Solicitado, Aprovado, Em Cotacao, Pedido Feito |
| Todos os Status | Ativos + Concluida, Rejeitado (exclui Cancelada) |
| [Status individual] | Apenas o status selecionado |

---

### **[Seção 7.21] Compra Nacional - ATUALIZAR**

**Adicionar na subseção de Filtros:**

| Filtro | Comportamento |
|--------|---------------|
| Ativos (padrão) | Rascunho |
| Todos os Status | Ativos + Confirmada (exclui Cancelada) |
| [Status individual] | Apenas o status selecionado |

---

## ✅ CHECKLIST DE ATUALIZAÇÃO

### Header
- [x] Atualizar versão para 2.21
- [x] Atualizar data para 20/01/2026
- [x] Adicionar changelog v2.21

### Changelog (texto)
```
v2.21: Filtro padrão "Ativos" nas listagens - todas as páginas de listagem de pedidos (Produção, Importação, Venda Amarrados, Venda Peças, Compras, Compra Nacional) agora abrem com filtro "Ativos" por padrão, mostrando apenas pedidos em andamento. Opção "Todos os Status" exibe ativos + finalizados, excluindo cancelados. Para ver cancelados, selecionar explicitamente o status.
```

### Seções a atualizar
- [x] 7.6 - Adicionar tabela de filtros
- [x] 7.7 - Adicionar tabela de filtros
- [x] 7.9 - Adicionar tabela de filtros
- [x] 7.11 - Adicionar tabela de filtros
- [x] 7.19 - Adicionar tabela de filtros
- [x] 7.21 - Adicionar tabela de filtros

---

## 📝 NOTA

Esta alteração é uma **melhoria de UX** que não adiciona novas funcionalidades, apenas melhora o comportamento padrão dos filtros nas páginas existentes. A documentação pode ser feita de forma sucinta, adicionando uma nota geral sobre o comportamento padrão dos filtros e uma tabela de referência em cada seção afetada.

**Alternativa simplificada:** Ao invés de atualizar 6 seções individualmente, pode-se adicionar uma seção única "Comportamento Padrão de Filtros" na seção 7 (Módulos Funcionais) que descreva o padrão aplicável a todas as páginas de listagem.
