# 📋 Alterações Necessárias no PRD - Alteração 28

**Data:** 20/01/2026  
**Referência:** `spec-alteracao28.md`

---

## 📊 RESUMO DAS ALTERAÇÕES

| # | Alteração | Seções Afetadas |
|---|-----------|-----------------|
| 1 | Exportar PDF no Modal Detalhes Venda Peças | 7.7.11 |
| 2 | Exportar PDF no Modal Detalhes Venda Amarrados | 7.6.6 |
| 3 | Exportar PDF no Modal Detalhes Transferência | 7.14.3 |
| 4 | Exportar PDF na Página Necessidade de Produção | 7.10.4 |

---

## 🔧 ALTERAÇÃO 1 e 2: Exportar PDF nos Modais de Venda

### Funcionalidade

Botão "Imprimir" no header dos modais de detalhes de pedidos de venda (Peças e Amarrados).

**Mini-Modal de Opções:**
- Checkbox "Mostrar valores (R$)" - desmarcado por padrão
- Se marcado: inclui coluna de valor e valor total no PDF
- Se desmarcado: omite informações de preço

**Layout do PDF (A4):**
1. Header: Título + Data
2. Informações do Pedido (Cliente, OC, Status, Datas, Valor se marcado)
3. Tabela de Itens (Código, Descrição, Pedido, Faturado, Pendente, %, Valor se marcado)
4. Reservas por endereço (📍) - se houver
5. Tabela de Entregas/Faturamentos (NF, Dt Fatur., Qtd, Dt Receb., Status)
6. Resumo de Recebimento (X/Y NFs recebidas)
7. Rodapé com data/hora de geração

---

## 🔧 ALTERAÇÃO 3: Exportar PDF no Modal de Transferência

### Funcionalidade

Botão "Imprimir" no header do modal de detalhes de requisição de transferência.

**Comportamento:**
- Impressão direta (sem mini-modal)
- Não possui valores financeiros

**Layout do PDF (A4):**
1. Header: "REQUISIÇÃO DE TRANSFERÊNCIA" + Data
2. Visualização Origem → Destino
3. Tabela de Amarrados (ID, Liga, Ø, Barras, Peso)
4. Totalizador
5. Rodapé

---

## 🔧 ALTERAÇÃO 4: Exportar PDF na Necessidade de Produção

### Funcionalidade

Botão "Imprimir" no header da página de Relatório de Necessidade de Produção.

**Comportamento:**
- Impressão direta (sem mini-modal)
- Inclui filtro aplicado no cabeçalho (se houver busca)
- Inclui detalhes expandidos de cada produto

**Layout do PDF (A4):**
1. Header: "RELATÓRIO DE NECESSIDADE DE PRODUÇÃO" + Data + Filtro
2. Tabela de Produtos (Código, Descrição, Demanda, Estoque, Em Prod., Necess., Status)
3. Para cada produto com necessidade:
   - Pedidos de Venda: número, cliente, qtd, status reserva, data entrega
   - Pedidos de Produção: número, fornecedor, qtd solic/prod, data previsão, status
4. Rodapé

---

## 4. Seções do PRD a Atualizar

### **7.6.6 Modal Detalhes do Pedido - Amarrados (ATUALIZAR)**

Adicionar ao final da seção:

**Impressão:**
- Botão "Imprimir" no header do modal
- Mini-modal de opções com checkbox "Mostrar valores (R$)" (desmarcado por padrão)
- PDF A4 com: informações do pedido, tabela de itens, entregas, status de recebimento
- Se checkbox marcado: inclui coluna de valor e valor total

### **7.7.11 Modal Detalhes do Pedido - Peças (ATUALIZAR)**

Adicionar ao final da seção:

**Impressão:**
- Botão "Imprimir" no header do modal
- Mini-modal de opções com checkbox "Mostrar valores (R$)" (desmarcado por padrão)
- PDF A4 com: informações do pedido, tabela de itens, reservas por endereço, entregas, status de recebimento
- Se checkbox marcado: inclui coluna de valor e valor total

### **7.14.3 Sistema de Requisições de Transferência (ATUALIZAR)**

Adicionar ao final da seção:

**Impressão:**
- Botão "Imprimir" no modal de detalhes da requisição
- Impressão direta (sem mini-modal)
- PDF A4 com: origem → destino, tabela de amarrados, totalizador

### **7.10.4 Relatório de Necessidade de Produção (ATUALIZAR ou CRIAR)**

Adicionar funcionalidade de impressão:

**Impressão:**
- Botão "Imprimir" no header da página
- Impressão direta (sem mini-modal)
- PDF A4 com: filtro aplicado, tabela de produtos, detalhes expandidos (pedidos de venda e produção por produto)

---

## ✅ CHECKLIST DE ATUALIZAÇÃO

### Interface (Seção 7)
- [ ] 7.6.6 Modal Detalhes Amarrados - documentar impressão com mini-modal
- [ ] 7.7.11 Modal Detalhes Peças - documentar impressão com mini-modal
- [ ] 7.14.3 Transferências - documentar impressão direta
- [ ] 7.10.4 Necessidade Produção - documentar impressão direta

### Header
- [ ] Atualizar versão para 2.24
- [ ] Atualizar data
- [ ] Adicionar changelog v2.24
