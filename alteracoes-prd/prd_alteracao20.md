# 📋 Alterações Necessárias no PRD - Alteração 20

**Data:** 15/01/2026  
**Referência:** `alteracao20.md`  
**Última revisão:** Numerações corrigidas (4.49, 4.50, 7.21)

---

## 📊 RESUMO DAS ALTERAÇÕES

| # | Alteração | Seções Afetadas |
|---|-----------|-----------------|
| 1 | Campo `tipo` na tabela `fornecedores` | 4.4 ✅ já documentado |
| 2 | Nova tabela `compras_nacionais` | 4.49 (nova) |
| 3 | Nova tabela `itens_compra_nacional` | 4.50 (nova) |
| 4 | Constraint `tipo_entrada` atualizado | 4.20.1 |
| 5 | Módulo Compra Nacional | 7.21 (nova) |
| 6 | Menu Estoque - novo item | 8.1 |

---

## 🔧 ALTERAÇÃO 1: Campo `tipo` em Fornecedores

### **[Seção 4.4] ✅ JÁ DOCUMENTADO**

A coluna `tipo` já está documentada na seção 4.4 do PRD-FINAL.md.

---

## 🔧 ALTERAÇÃO 2: Tabela `compras_nacionais`

### **[Seção 4.49] (NOVA)**

```markdown
### **4.49 Tabela: `compras_nacionais`**

Registro de compras de aço no mercado nacional.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | ID único |
| `fornecedor_id` | uuid | FK → fornecedores.id | Fornecedor (tipo aco_brasil) |
| `nf_entrada` | text | NOT NULL | Número da nota fiscal |
| `data_nf` | date | NOT NULL | Data da nota fiscal |
| `destino` | text | NOT NULL | Matriz ou Filial |
| `total_amarrados` | integer | NOT NULL DEFAULT 0 | Quantidade de amarrados |
| `peso_total` | numeric | NOT NULL DEFAULT 0 | Peso total em kg |
| `valor_total` | numeric | NOT NULL DEFAULT 0 | Valor total em R$ |
| `status` | text | NOT NULL DEFAULT 'Rascunho' | Rascunho, Confirmada, Cancelada |
| `created_at` | timestamptz | DEFAULT now() | Data de criação |
| `created_by` | uuid | FK → auth.users.id | Usuário que criou |

**Índices:**
- `idx_compras_nacionais_fornecedor` (fornecedor_id)
- `idx_compras_nacionais_status` (status)
- `idx_compras_nacionais_data` (data_nf)

**Nota:** Amarrados só são criados no estoque quando status = 'Confirmada'.
```

---

## 🔧 ALTERAÇÃO 3: Tabela `itens_compra_nacional`

### **[Seção 4.50] (NOVA)**

```markdown
### **4.50 Tabela: `itens_compra_nacional`**

Itens (amarrados) de uma compra nacional. Armazena dados completos antes da confirmação.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | ID único |
| `compra_id` | uuid | FK → compras_nacionais.id ON DELETE CASCADE | Compra relacionada |
| `amarrado_id` | text | NOT NULL | ID do amarrado (informado pelo usuário) |
| `liga_id` | uuid | FK → materiais.id | Liga do aço |
| `liga_nome` | text | | Nome da liga (desnormalizado) |
| `diametro` | numeric | NOT NULL | Diâmetro em mm |
| `comprimento` | numeric | NOT NULL | Comprimento em mm |
| `barras` | integer | NOT NULL | Quantidade de barras |
| `peso` | numeric | NOT NULL | Peso total em kg |
| `custo_kg_brl` | numeric | NOT NULL | Custo por kg em R$ |
| `heat_corrida` | text | | Heat/Corrida (opcional) |
| `bundle_number` | text | | Bundle number (opcional) |
| `created_at` | timestamptz | DEFAULT now() | Data de criação |

**Índices:**
- `idx_itens_compra_nacional_compra` (compra_id)

**Nota:** Ao confirmar a compra, sistema cria registros em `amarrados`, `historico_entradas` e `historico_custos_amarrado`.
```

---

## 🔧 ALTERAÇÃO 4: Constraint `tipo_entrada`

### **[Seção 4.20.1] (ATUALIZAR)**

Adicionar 'Compra BR' ao CHECK constraint de `tipo_entrada`:

**De:**
```sql
CHECK (tipo_entrada = ANY (ARRAY['Importacao','ImportacaoExcel','RetornoProducao','Transferencia','Inventario']))
```

**Para:**
```sql
CHECK (tipo_entrada = ANY (ARRAY['Importacao','ImportacaoExcel','RetornoProducao','Transferencia','Inventario','Compra BR']))
```

---

## 🔧 ALTERAÇÃO 5: Módulo Compra Nacional

### **[Seção 7.21] (NOVA)**

```markdown
### **7.21 Compra Nacional**

Entrada de aços comprados no mercado nacional (fora do fluxo de importação).

#### **7.21.1 Diferenças vs. Importação Excel**

| Aspecto | Importação Excel | Compra Nacional |
|---------|------------------|-----------------|
| Volume | Grande quantidade | Poucos amarrados |
| Origem | Importação (China) | Nacional |
| Contrato | Obrigatório | Não aplicável |
| NF | Cadastrada depois | Obrigatória no momento |
| Custo | Conciliação opcional | Obrigatório |
| Fluxo | Direto | Com revisão (Rascunho → Confirmada) |

#### **7.21.2 Fluxo de Status**

```
[+ Nova Compra] → Preenche dados → [Salvar]
                                       ↓
                            Status: "Rascunho"
                      (amarrados NÃO existem ainda)
                                       ↓
               Revisar → [✅ Confirmar] ou [❌ Cancelar]
                                       ↓
                          Status: "Confirmada"
                    (cria amarrados no estoque)
```

#### **7.21.3 Página de Listagem**

| Filtro | Tipo |
|--------|------|
| Fornecedor | Select (apenas tipo aco_brasil) |
| Status | Select (Todos, Rascunho, Confirmada, Cancelada) |
| Busca | Texto (NF) |

**Colunas da tabela:**
- NF Entrada
- Fornecedor
- Data NF
- Qtd Amarrados
- Peso Total
- Valor Total
- Status (badge colorido)

#### **7.21.4 Modal Nova Compra**

**Campos do cabeçalho:**
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Fornecedor | Select (tipo aco_brasil) | ✅ |
| NF de Entrada | Text | ✅ |
| Data da NF | Date | ✅ |
| Destino | Select (Matriz/Filial) | ✅ |

**Tabela de amarrados:**
| Coluna | Descrição |
|--------|-----------|
| ID | Informado pelo usuário |
| Liga | Select de materiais |
| Ø | Diâmetro em mm |
| Comprimento | Em mm |
| Barras | Quantidade |
| Peso | Em kg |
| R$/kg | Custo por kg |
| Valor | Calculado (peso × custo) |
| Ações | Editar / Remover |

**Botão [+ Adicionar Amarrado]:** Abre sub-modal com campos:
- ID do amarrado (text, obrigatório)
- Liga (select, obrigatório)
- Diâmetro mm (number, obrigatório)
- Comprimento mm (number, obrigatório)
- Quantidade barras (number, obrigatório)
- Peso total kg (number, obrigatório)
- Custo por kg R$ (number, obrigatório)
- Heat/Corrida (text, opcional)
- Bundle Number (text, opcional)

**Rodapé:**
- Peso Total: soma dos pesos
- Valor Total: soma dos valores

**Ações:**
- [Cancelar] - fecha modal
- [Salvar] - cria compra com status "Rascunho"

#### **7.21.5 Modal de Detalhes**

Exibe dados da compra em modo somente leitura.

**Ações (apenas se status = Rascunho):**
- [❌ Cancelar Compra] → status = "Cancelada"
- [✅ Confirmar e Lançar no Estoque] → executa:
  1. Para cada item, cria registro em `amarrados` com:
     - Localização = "Caminhão" se Matriz, "Estoque" se Filial
     - Status = "Matriz" ou "Filial" conforme destino
  2. Registra em `historico_entradas` com tipo_entrada = 'Compra BR'
  3. Registra em `historico_custos_amarrado`
  4. Atualiza totais em `compras_nacionais`
  5. Altera status para "Confirmada"

#### **7.21.6 Fornecedores**

Apenas fornecedores com `tipo = 'aco_brasil'` aparecem no select de Compra Nacional.

**Tipos de fornecedor:**
| Tipo | Descrição |
|------|-----------|
| prestador_servico | Fornecedor de serviços (ex: Forjas Caxiense) |
| aco_china | Fornecedor de aço importado (ex: Shisteel) |
| aco_brasil | Fornecedor de aço nacional |

**Nota:** O formulário de cadastro de fornecedores possui select para escolher o tipo.
```

---

## 🔧 ALTERAÇÃO 6: Menu Estoque

### **[Seção 8.1] (ATUALIZAR)**

Adicionar "Compra Nacional" após "Importar":

```
📦 Estoque
  ├── Canvas (Matriz)
  ├── Tabela Geral
  ├── Peças
  ├── Em Poder Fornec.
  ├── Importar
  ├── Compra Nacional   ← NOVO
  ├── Histórico
  └── Inventário Peças
```

**Rota:** `/compra-nacional`

---

## ✅ CHECKLIST DE ATUALIZAÇÃO

### Modelo de Dados (Seção 4)
- [x] Atualizar tabela 4.4 (fornecedores) - adicionar coluna `tipo` ✅ JÁ DOCUMENTADO
- [x] Criar seção 4.49 (compras_nacionais) ✅ APLICADO
- [x] Criar seção 4.50 (itens_compra_nacional) ✅ APLICADO
- [x] Atualizar seção 4.20.1 - adicionar 'Compra BR' ao CHECK constraint ✅ APLICADO

### Módulos Funcionais (Seção 7)
- [x] Criar seção 7.21 (Compra Nacional) ✅ APLICADO

### Navegação (Seção 8)
- [x] Atualizar seção 8.1 - adicionar item "Compra Nacional" ✅ APLICADO

### Header
- [x] Atualizar versão para 2.14 ✅ JÁ NO CHANGELOG
- [x] Atualizar data ✅ JÁ ATUALIZADO
- [x] Adicionar changelog v2.14 ✅ JÁ DOCUMENTADO

### Changelog sugerido (já aplicado)
```
v2.14: Compra Nacional - novo módulo para entrada de aços comprados no mercado nacional. Novas tabelas `compras_nacionais` e `itens_compra_nacional`. Fluxo com revisão (Rascunho → Confirmada/Cancelada), amarrados só entram no estoque após confirmação. Campo `tipo` em fornecedores (prestador_servico, aco_china, aco_brasil). Novo valor 'Compra BR' em tipo_entrada do histórico. Página `/compra-nacional` com lista, filtros e modais de criação/detalhes. Item "Compra Nacional" adicionado no menu Estoque.
```

### ✅ APLICADO NO PRD-FINAL.md em 15/01/2026
- Seção 4.20.1: tipo_entrada atualizado com 'Compra BR' e 'RetornoProducao'
- Seção 4.49: Tabela `compras_nacionais`
- Seção 4.50: Tabela `itens_compra_nacional`
- Seção 7.21: Módulo Compra Nacional (completo)
- Seção 8.1: Item "Compra Nacional" no menu Estoque
- Índice 00-indice.md atualizado para ✅ concluído (v2.14)
