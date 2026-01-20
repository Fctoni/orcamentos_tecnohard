# 📋 Alterações Necessárias no PRD - Alteração 22

**Data:** 15/01/2026  
**Referência:** `alteracao22_v2.md`

---

## 📊 RESUMO DAS ALTERAÇÕES

| # | Alteração | Seções Afetadas |
|---|-----------|-----------------|
| 1 | Nova página de Relatório de Amarrados em Trânsito | Seção 7 (Módulos), Seção 8 (Navegação) |

---

## 🔧 ALTERAÇÃO 1: Relatório de Amarrados em Trânsito

### **7.11 Relatório de Amarrados em Trânsito** (NOVA)

Relatório consolidado para acompanhamento de amarrados em processo de importação (status != Recebido).

#### **7.11.1 Visão Geral**

**Localização:** Menu Relatórios > "Amarrados em Trânsito"

**Página:** `/relatorios/amarrados-transito`

**Dados exibidos por amarrado:**
- ID do amarrado (ex: J01)
- Liga / Diâmetro / Comprimento
- Peso / Barras
- Heat/Corrida
- Número do pedido de importação
- Status do pedido (Em Trânsito Marítimo, No Porto, Liberado)
- ETA (previsão de chegada)

#### **7.11.2 Cards de Resumo**

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Total Amarrados │ │ Peso Total      │ │ Em Trânsito     │ │ No Porto        │
│ 156             │ │ 245.8 ton       │ │ 89 amarrados    │ │ 67 amarrados    │
│ em trânsito     │ │ em trânsito     │ │ 142.3 ton       │ │ 103.5 ton       │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

**Comportamento:**
- Atualizam automaticamente com os filtros aplicados
- Clicáveis para filtrar rapidamente (ex: clicar em "No Porto" filtra por esse status)

#### **7.11.3 Filtros**

| Filtro | Tipo | Descrição |
|--------|------|-----------|
| Busca ID | Texto | Busca por ID do amarrado |
| Status | Multi-select | Em Trânsito Marítimo, No Porto, Liberado |
| Liga | Multi-select | Ligas cadastradas |
| Fornecedor | Single-select | Fornecedores da China |
| Embarque | Date range | Período de data de embarque |
| ETA | Date range | Período de previsão de chegada |

**Comportamento:** Filtros combinados (AND). Botão "Atualizar" recarrega dados do servidor.

#### **7.11.4 Visualizações**

Três tabs de visualização:

**Tab 1 - Por Pedido:**
- Accordion expansível agrupando amarrados por pedido de importação
- Cabeçalho mostra: Número do pedido, Lote, Fornecedor, Status, ETA
- Conteúdo expandido: Tabela com ID, Liga, Ø, Comprimento, Barras, Peso, Heat
- Subtotal por pedido (amarrados, barras, peso)

**Tab 2 - Por Amarrado:**
- Tabela flat com todos os amarrados em trânsito
- Colunas: ID, Liga, Ø, Comp., Barras, Peso, Pedido, Status, ETA
- Ordenável por qualquer coluna
- Paginação (50 por página)

**Tab 3 - Por Liga/Diâmetro:**
- Accordion por liga (mostra peso total da liga)
- Conteúdo expandido: Tabela por diâmetro
- Colunas: Diâmetro, Amarrados, Barras, Peso, Em Trânsito, No Porto, Próx. ETA

#### **7.11.5 Exportação**

Botão "CSV" exporta a visualização atual com filtros aplicados.

**Colunas do CSV:**
- ID Amarrado, Liga, Diâmetro (mm), Comprimento (m), Barras, Peso (kg), Heat/Corrida, Pedido, Lote, Status, ETA, Fornecedor

---

### **8. Navegação** (ATUALIZAR)

#### Menu Lateral - Seção Relatórios

Adicionar item:

| Item | Rota | Ícone |
|------|------|-------|
| Amarrados em Trânsito | `/relatorios/amarrados-transito` | 📦 (ou Ship) |

**Posição:** Abaixo de "Necessidade de Produção" na seção Relatórios

---

## ✅ CHECKLIST DE ATUALIZAÇÃO

### Seção 7 - Módulos
- [ ] Adicionar 7.11 Relatório de Amarrados em Trânsito

### Seção 8 - Navegação
- [ ] Atualizar menu lateral com novo item em Relatórios

### Header
- [ ] Atualizar versão para 2.18
- [ ] Atualizar data
- [ ] Adicionar changelog v2.18

### Changelog
```
v2.18: Relatório de Amarrados em Trânsito - nova página `/relatorios/amarrados-transito` para acompanhamento de amarrados em processo de importação. Cards de resumo (Total, Peso, Em Trânsito, No Porto) clicáveis para filtro rápido. Filtros: busca ID, status, liga, fornecedor, data embarque, ETA. Três visualizações: Por Pedido (accordion), Por Amarrado (tabela paginada), Por Liga/Diâmetro (accordion). Exportação CSV. Item "Amarrados em Trânsito" adicionado no menu Relatórios.
```
