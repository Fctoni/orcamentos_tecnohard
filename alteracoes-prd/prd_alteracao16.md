# 📋 Alterações Necessárias no PRD - Alteração 16

**Data:** 14/01/2026  
**Referência:** `alteracao16.md`

---

## 📊 RESUMO DAS ALTERAÇÕES

| # | Alteração | Seções Afetadas |
|---|-----------|-----------------|
| 1 | Modal Pedido de Produção - Fluxo e Cálculo de Barras Aprimorado | 7.9 |
| 2 | Espelho da Nota no Envio para Produção | 7.9 |
| 3 | Detalhar "Em Produção" na Necessidade de Produção | 7.10 |
| 4 | Espelho da Nota no Faturamento (Peças e Amarrados) | 7.6, 7.7 |
| 5 | Atualizar changelog e versão | Header |

---

## 🔧 ALTERAÇÃO 1: Modal Pedido de Produção - Fluxo e Cálculo Aprimorado

### **7.9.4 Modal de Criação de Pedido (ATUALIZAR)**

**Substituir fluxo de adição de itens:**

**Fluxo ANTERIOR:**
```
1. Seleciona Produto
2. Informa Quantidade de peças
3. Vê cálculo de barras (fixo 6000mm)
4. Seleciona Amarrado
5. Informa Barras manualmente
```

**Fluxo NOVO:**
```
1. Seleciona Produto
2. Seleciona Amarrado (filtrado por liga/diâmetro compatível)
3. Sistema exibe info do cálculo com dados reais
4. Informa Quantidade OU Barras (campos interdependentes)
```

**Mudança principal:** Seleção do amarrado ANTES da quantidade permite cálculo preciso usando o comprimento real do amarrado.

---

### **7.9.4.1 Campos Interdependentes Quantidade ↔ Barras (NOVA SUBSEÇÃO)**

Os campos de quantidade e barras calculam automaticamente um ao outro:

| Campo Alterado | Fórmula |
|----------------|---------|
| Quantidade → Barras | `barras = quantidade / pecas_por_barra` |
| Barras → Quantidade | `quantidade = FLOOR(barras × pecas_por_barra)` |

**Onde:**
```
pecas_por_barra = FLOOR((comprimento_amarrado - destopo_mm) / (comprimento_mp + perda_serra_mm))
```

**Exemplo:**
- Amarrado: 6400mm
- Produto: comprimento_mp = 130mm
- Destopo: 50mm, Perda serra: 3mm

```
pecas_por_barra = FLOOR((6400 - 50) / (130 + 3))
                = FLOOR(6350 / 133)
                = 47 peças/barra

Usuário digita 100 peças → 100 / 47 = 2.13 barras
Usuário digita 3 barras → 3 × 47 = 141 peças
```

**Comportamento:**
- Quantidade pode ter casas decimais (cálculo exato)
- Barras quando calcula quantidade: arredonda para BAIXO (Math.floor)
- Usuário pode editar ambos os campos livremente

---

### **7.9.4.2 Info Box de Cálculo (NOVA SUBSEÇÃO)**

Ao selecionar um amarrado, exibe caixa informativa com detalhes do cálculo:

```
┌──────────────────────────────────────────────────────────────┐
│ ℹ️ Amarrado selecionado: 6400mm                              │
│    Destopo: 50mm | Perda serra: 3mm                         │
│    Tamanho útil: 6350mm                                     │
│    Peças por barra: 47 (130mm + 3mm = 133mm cada)           │
└──────────────────────────────────────────────────────────────┘
```

**Fonte dos dados:**
- `comprimento` do amarrado selecionado
- `destopo_mm` e `perda_serra_mm` da tabela `config_producao`
- `comprimento_mp` do produto selecionado

---

## 🔧 ALTERAÇÃO 2: Espelho da Nota no Envio para Produção

### **7.9.5 Modal de Envio para Produção (ATUALIZAR)**

**Adicionar tabela de detalhes ("Espelho da Nota"):**

No modal de envio para produção, antes do campo de NF, exibir tabela resumo para auxiliar o fiscal na emissão da NF de remessa:

```
Fornecedor: [Nome do Fornecedor]

| Descrição                              | Qt. kg  | Custo/kg | Valor Total |
|----------------------------------------|---------|----------|-------------|
| SAE1020 Ø25 #AM001 (3 barras)          | 150,00  | R$ 5,50  | R$ 825,00   |
| SAE1045 Ø32 #AM015 (2 barras)          | 200,00  | R$ 6,20  | R$ 1.240,00 |
|----------------------------------------|---------|----------|-------------|
| TOTAL                                  | 350,00  |          | R$ 2.065,00 |
```

**Campos:**
| Coluna | Origem |
|--------|--------|
| Descrição | `liga + Ø + id_amarrado + (barras enviadas)` |
| Qt. kg | Peso total das barras enviadas |
| Custo/kg | `amarrados.custo_kg_brl` |
| Valor Total | Custo/kg × Peso |

**Finalidade:** Auxiliar o fiscal a emitir a NF de remessa dos aços.

---

## 🔧 ALTERAÇÃO 3: Detalhar "Em Produção" na Necessidade

### **7.10.4 Coluna "Em Produção" (ATUALIZAR)**

**Adicionar detalhamento na expansão:**

Ao expandir uma linha do relatório de necessidade de produção, além dos pedidos de venda pendentes, mostrar também os **pedidos de produção** relacionados ao produto:

```
📦 Pedidos de Venda (5 pendentes)
| Pedido | Cliente       | Qtd | Entrega   | Reserva      |
|--------|---------------|-----|-----------|--------------|
| #123   | Cliente A     | 50  | 20/01     | ✓ Reservado  |
| #125   | Cliente B     | 30  | 22/01     | ⏳ Pendente  |

🏭 Em Produção (2 pedidos)
| Pedido | Fornecedor      | Previsão | Solic. | Produzido | Status     |        |
|--------|-----------------|----------|--------|-----------|------------|--------|
| #45    | Metalúrgica X   | 20/01    | 50     | 0         | Em Produção| [ver →]|
| #48    | Forja Y         | 25/01    | 30     | 10        | Aguardando | [ver →]|
```

**Comportamento:**
- Seção "🏭 Em Produção" aparece na mesma expansão dos pedidos de venda
- Ordenado por data de previsão
- Link "ver →" navega para `/pedidos/producao`
- Estilo visual diferenciado (cor azul) para distinguir dos pedidos de venda

**Colunas da seção "Em Produção":**
| Coluna | Origem |
|--------|--------|
| Pedido | `pedidos_producao.id` (número sequencial) |
| Fornecedor | `pedidos_producao.fornecedor → fornecedores.nome` |
| Previsão | `pedidos_producao.data_previsao` |
| Solic. | `itens_solicitados_producao.qtd_solicitada` |
| Produzido | `itens_solicitados_producao.qtd_produzida` |
| Status | `pedidos_producao.status` |

---

## 🔧 ALTERAÇÃO 4: Espelho da Nota no Faturamento

### **7.7.6 Modal de Faturamento de Peças (NOVA SUBSEÇÃO)**

**Adicionar após 7.7.5:**

Ao abrir o modal de faturamento de pedido de venda de peças, exibir tabela resumo para auxiliar na emissão da NF de venda:

```
Cliente: [Nome do Cliente]
OC: [Ordem de Compra]

| Produto       | Descrição    | Qtd   | Preço Unit. | Valor Total |
|---------------|--------------|-------|-------------|-------------|
| ABC-001       | Bucha 25mm   | 100   | R$ 5,00     | R$ 500,00   |
| DEF-002       | Anel 32mm    | 50    | R$ 8,00     | R$ 400,00   |
|---------------|--------------|-------|-------------|-------------|
| TOTAL         |              | 150   |             | R$ 900,00   |
```

**Campos:**
| Coluna | Origem |
|--------|--------|
| Cliente | `pedidos_venda_pecas.cliente → clientes.nome` |
| OC | `pedidos_venda_pecas.ordem_compra` |
| Produto | `itens_pedido_venda_pecas.produto → produtos.codigo` |
| Descrição | `produtos.descricao` |
| Qtd | `itens_pedido_venda_pecas.quantidade` |
| Preço Unit. | `itens_pedido_venda_pecas.preco_unitario` |
| Valor Total | `itens_pedido_venda_pecas.valor_total` |

---

### **7.6.6 Modal de Faturamento de Amarrados (NOVA SUBSEÇÃO)**

**Adicionar após 7.6.5:**

Ao abrir o modal de faturamento de pedido de venda de amarrados, exibir tabela resumo:

```
Cliente: [Nome do Cliente]
OC: [Ordem de Compra] (se houver)

| Descrição                    | Barras | Peso (kg) | Preço/kg  | Valor Total |
|------------------------------|--------|-----------|-----------|-------------|
| SAE1020 Ø25 #AM001           | 5      | 250,00    | R$ 5,50   | R$ 1.375,00 |
| SAE1045 Ø32 #AM015           | 3      | 180,00    | R$ 6,20   | R$ 1.116,00 |
|------------------------------|--------|-----------|-----------|-------------|
| TOTAL                        | 8      | 430,00    |           | R$ 2.491,00 |
```

**Campos:**
| Coluna | Origem |
|--------|--------|
| Cliente | `pedidos_venda_amarrados.cliente → clientes.nome` |
| OC | `pedidos_venda_amarrados.ordem_compra` |
| Descrição | `liga + Ø + id_amarrado` |
| Barras | `itens_pedido_venda_amarrados.barras` |
| Peso | `itens_pedido_venda_amarrados.peso` |
| **Preço/kg** | `itens_pedido_venda_amarrados.preco_unitario` (preço de venda, **NÃO** custo) |
| Valor Total | `preco_unitario × peso` |

**Nota importante:** O campo exibido é `preco_unitario` (preço de venda por kg), **não** o `custo_kg_brl` do amarrado.

---

## 🔧 ALTERAÇÃO 5: Header - Changelog e Versão

**Atualizar tabela de informações do documento:**

| Campo | Valor |
|-------|-------|
| **Versão do PRD** | 2.13 |
| **Última Atualização** | 14/01/2026 |

**Adicionar ao início do Changelog:**

```
v2.13: Modal de Pedido de Produção aprimorado - fluxo alterado para selecionar amarrado ANTES da quantidade, cálculo de barras usando comprimento real do amarrado com destopo e perda da serra de `config_producao`, campos quantidade e barras interdependentes (calcular um atualiza o outro automaticamente), info box com detalhes do cálculo. Espelho da Nota no Envio para Produção - tabela no modal de envio com Liga/Ø/ID/barras, peso, custo/kg e valor total para auxiliar emissão de NF de remessa. Espelho da Nota no Faturamento - tabela nos modais de faturamento de peças (código, descrição, qtd, preço unit., valor) e amarrados (descrição, barras, peso, preço/kg, valor) para auxiliar emissão de NF de venda. Relatório de Necessidade de Produção - expansão mostra pedidos de produção além de vendas, com fornecedor, previsão, qtd solicitada/produzida, status e link para o pedido.
```

---

## ✅ CHECKLIST DE ATUALIZAÇÃO

### Módulos (Seção 7)
- [ ] 7.6.6: Criar subseção "Modal de Faturamento de Amarrados" com espelho da nota
- [ ] 7.7.6: Criar subseção "Modal de Faturamento de Peças" com espelho da nota
- [ ] 7.9.4: Atualizar fluxo do modal de criação (amarrado antes da quantidade)
- [ ] 7.9.4.1: Criar subseção "Campos Interdependentes Quantidade ↔ Barras"
- [ ] 7.9.4.2: Criar subseção "Info Box de Cálculo"
- [ ] 7.9.5: Atualizar modal de envio para produção com espelho da nota
- [ ] 7.10.4: Atualizar expansão com detalhamento de pedidos de produção

### Header
- [ ] Atualizar versão para 2.13
- [ ] Atualizar data para 14/01/2026
- [ ] Adicionar changelog v2.13

---

## 📝 NOTAS DA VERIFICAÇÃO

**Itens implementados (conforme alteracao16.md):**

| Item Original | Descrição | Status |
|---------------|-----------|--------|
| 6 | Calculadora de barras (destopo/perda + comprimento amarrado + campos interdependentes) | ✅ Implementado |
| 7 | Coluna "Itens" em venda-pecas | ⏸️ Pulado |
| 8 | Espelho nota - Enviar produção | ✅ Implementado |
| 9 | Detalhar "Em Prod." na necessidade | ✅ Implementado |
| 10 | Múltiplos endereços no recebimento | ⏸️ Adiado |
| 12 | Espelho nota - Faturamento (peças e amarrados) | ✅ Implementado |

---

## 📝 ITENS PENDENTES (Não implementados - para futuro)

Os seguintes itens foram listados em alteracao15.md/alteracao16.md mas estão pendentes:

| # | Item | Status |
|---|------|--------|
| 7 | Coluna "Itens" em venda-pecas | ⏸️ Pulado (usuário desistiu) |
| 10 | Registrar recebimento com múltiplos endereços | ⏸️ Adiado |
| 11 | Detalhes pedido recebido - mostrar endereço | pendente |
| 13 | Anexar nota com bucket | pendente |
| 14 | Modal faturar - entrega parcial | pendente |
| 15 | Entrada de aços comprados no mercado | pendente |
| 16 | Módulo de solicitação de compras | pendente |
| 17 | Amarrados em trânsito | pendente |
| 18 | Sistema de custo para peças/produtos | pendente |

**Nota:** Estes itens serão documentados em alterações futuras quando implementados.
