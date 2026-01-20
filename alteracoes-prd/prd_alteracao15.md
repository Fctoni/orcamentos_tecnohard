# 📋 Alterações Necessárias no PRD - Alteração 15

**Data:** 14/01/2026  
**Referência:** `alteracao15.md`

---

## 📊 RESUMO DAS ALTERAÇÕES

| # | Alteração | Seções Afetadas |
|---|-----------|-----------------|
| 1 | Sistema de Requisições de Transferência (Rascunho → Efetivada) | 4.34, 4.5 (ATUALIZAR), 7.14 |
| 2 | Solicitante por item em transferências | 4.5 (ATUALIZAR), 7.14 |
| 3 | Inventário de Peças | 4.35, 4.36 (NOVAS), 7.18 (NOVA), 8.1 |
| 4 | Múltiplas ligas por produto | 4.37 (NOVA), 7.5 |
| 5 | Configuração de Destopo e Perda da Serra | 4.38 (NOVA), 7.9, 8.4, 10.1 |
| 6 | Atualizar changelog e versão | Header |

---

## 🔧 ALTERAÇÃO 1: Sistema de Requisições de Transferência

### **4.34 Tabela: `requisicoes_transferencia`**

**Adicionar nova tabela:**

Agrupamento de itens para transferência entre localizações.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | ID único |
| `origem` | text | NOT NULL | Localização de origem (matriz/filial) |
| `destino` | text | NOT NULL | Localização de destino |
| `status` | text | DEFAULT 'Rascunho' | Status: 'Rascunho' ou 'Efetivada' |
| `nf` | text | NULL | Número da NF (obrigatório ao efetivar) |
| `data_nf` | date | NULL | Data da NF |
| `created_by` | uuid | FK(auth.users.id) | Quem criou |
| `created_at` | timestamptz | DEFAULT now() | Data de criação |

**Índices:**
- `idx_requisicoes_transferencia_status` (status)

---

### **4.5 Tabela: `transferencias` (ATUALIZAR)**

**Adicionar colunas:**

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `requisicao_id` | uuid | FK(requisicoes_transferencia.id) ON DELETE CASCADE, NULL | Requisição pai |
| `solicitante_id` | uuid | FK(auth.users.id), NULL | Quem solicitou o item |

**Alterar colunas para NULL:**
- `nf` → aceita NULL (preenchido apenas ao efetivar requisição)
- `data_nf` → aceita NULL

---

### **7.14.3 Sistema de Requisições de Transferência (NOVA SEÇÃO)**

**Adicionar após 7.14.2:**

#### **Fluxo de Requisição**

```
┌─────────────────────┐
│     Rascunho        │ ← Requisição criada, acumulando itens
└──────────┬──────────┘
           │ (ação: Efetivar com NF)
           ▼
┌─────────────────────┐
│     Efetivada       │ ← Transferência executada
└─────────────────────┘
```

#### **Comportamento por Status**

| Status | Características |
|--------|-----------------|
| Rascunho | Editável, permite adicionar/remover amarrados, sem movimentação de estoque |
| Efetivada | Bloqueada, NF obrigatória, executa movimentação de estoque |

#### **Interface**

**Listagem:**
- Tabs: Rascunhos / Efetivadas
- Colunas: Data, Rota (Origem→Destino), Qtd Amarrados, Peso Total
- Clique abre modal de detalhes

**Modal de Detalhes (Rascunho):**
- Barra de capacidade do caminhão (32.000 kg)
- Lista de amarrados com checkbox para remover
- Botão "Adicionar Amarrados"
- Botão "Efetivar" (abre modal para NF)

**Modal de Nova Requisição:**
- Selecionar Origem e Destino
- Cria requisição vazia em Rascunho

#### **Solicitante por Item**

- Campo automático: usuário logado ao adicionar amarrado
- Exibido na lista de itens dentro do modal
- Finalidade: rastreabilidade

#### **Compatibilidade**

Transferências antigas (sem `requisicao_id`) aparecem na aba "Efetivadas" normalmente.

---

## 🔧 ALTERAÇÃO 2: Inventário de Peças

### **4.35 Tabela: `inventarios_pecas`**

**Adicionar nova tabela:**

Controle de inventários de peças por endereço.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | ID único |
| `endereco_id` | uuid | FK(enderecos_estoque.id), NOT NULL | Endereço inventariado |
| `status` | text | DEFAULT 'rascunho' | Status: 'rascunho' ou 'registrado' |
| `justificativa` | text | NULL | Motivo do ajuste (obrigatório ao registrar) |
| `created_by` | uuid | FK(auth.users.id) | Quem criou |
| `created_at` | timestamptz | DEFAULT now() | Data de criação |
| `registrado_em` | timestamptz | NULL | Data do registro |

---

### **4.36 Tabela: `itens_inventario_pecas`**

**Adicionar nova tabela:**

Itens contados em um inventário de peças.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | ID único |
| `inventario_id` | uuid | FK(inventarios_pecas.id) ON DELETE CASCADE, NOT NULL | Inventário |
| `produto_id` | uuid | FK(produtos.id), NOT NULL | Produto |
| `quantidade_sistema` | integer | NOT NULL | Quantidade no sistema |
| `quantidade_contagem` | integer | NULL | Quantidade física contada |
| `conferido` | boolean | DEFAULT false | Se foi conferido |
| `created_at` | timestamptz | DEFAULT now() | Data de criação |

---

### **7.18 Inventário de Peças (NOVA SEÇÃO)**

**Adicionar após 7.17:**

Ajuste de inventário para peças acabadas, similar ao de amarrados.

#### **7.18.1 Fluxo**

```
Rascunho → Registrado
    ↓           ↓
  Editável   Bloqueado + Ajuste de estoque
```

#### **7.18.2 Escopo**

- Inventário realizado **por endereço** (A1, A2, B1, etc.)
- Lista todos os produtos do endereço selecionado
- Permite contagem física e comparação com sistema

#### **7.18.3 Comportamento**

| Ação | Descrição |
|------|-----------|
| Criar inventário | Seleciona endereço, sistema lista produtos |
| Contar | Usuário informa quantidade física |
| Marcar conferido | Checkbox para itens sem divergência |
| Registrar | Justificativa obrigatória (min 10 chars) |

#### **7.18.4 Ao Registrar**

Para cada item com divergência:
1. Atualiza `estoque_pecas.quantidade`
2. Registra em `historico_pecas`:
   - Tipo: `Entrada` (se contagem > sistema) ou `Saida` (se contagem < sistema)
   - Origem: `Inventario`
   - Referência: `inventarios_pecas.id`

#### **7.18.5 Permissões**

Todos os usuários podem fazer inventário de peças.

---

### **8.1 Menu Estoque (ATUALIZAR)**

**Adicionar item:**

```
📦 Estoque
  ├── Matriz (Canvas)
  ├── Tabela Geral
  ├── Peças
  ├── Em Poder Fornec.
  ├── Importar
  ├── Histórico
  └── Inventário Peças    ← NOVO
```

---

## 🔧 ALTERAÇÃO 3: Múltiplas Ligas por Produto

### **4.37 Tabela: `produtos_materiais`**

**Adicionar nova tabela:**

Relação N:N entre produtos e materiais (ligas).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | ID único |
| `produto_id` | uuid | FK(produtos.id) ON DELETE CASCADE, NOT NULL | Produto |
| `material_id` | uuid | FK(materiais.id) ON DELETE CASCADE, NOT NULL | Material/Liga |
| `is_padrao` | boolean | DEFAULT false | Se é a liga padrão do produto |
| `created_at` | timestamptz | DEFAULT now() | Data de criação |

**Índices:**
- `idx_produtos_materiais_produto` (produto_id)
- `idx_produtos_materiais_material` (material_id)
- UNIQUE (produto_id, material_id)

**Migração:**
- Produtos existentes: `material_id` atual vira registro com `is_padrao = true`

---

### **7.5.X Cadastro de Produtos - Múltiplas Ligas (ATUALIZAR)**

**Adicionar na seção 7.5:**

#### **Seleção de Ligas de Origem**

- Produto pode ter **múltiplas ligas** de origem
- Uma liga é marcada como **padrão** (`is_padrao = true`)
- Interface: Multi-select com chips, checkbox para padrão

#### **Impacto no Pedido de Produção**

- Filtro de amarrados considera **todas as ligas** do produto
- Liga padrão aparece pré-selecionada no filtro
- Usuário pode alternar para ligas não-padrão

---

## 🔧 ALTERAÇÃO 4: Configuração de Destopo e Perda da Serra

### **4.38 Tabela: `config_producao`**

**Adicionar nova tabela:**

Configurações globais para cálculos de produção.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | ID único |
| `destopo_mm` | integer | DEFAULT 50 | Sobra da ponta da barra (mm) |
| `perda_serra_mm` | integer | DEFAULT 3 | Largura do corte da serra (mm) |
| `updated_at` | timestamptz | DEFAULT now() | Última atualização |
| `updated_by` | uuid | FK(auth.users.id), NULL | Quem alterou |

**Nota:** Tabela com registro único (singleton). Valores padrão: destopo=50mm, perda=3mm.

---

### **7.9.3 Cálculo de Barras Sugeridas (ATUALIZAR)**

**Substituir fórmula:**

```
// Variáveis (da tabela config_producao)
Destopo = config_producao.destopo_mm (ex: 50mm)
Perda Serra = config_producao.perda_serra_mm (ex: 3mm)

// Cálculos
Comprimento Útil = Comprimento Barra - Destopo
Comprimento Efetivo por Peça = Comprimento MP + Perda Serra

Barras Sugeridas = (Qtd Peças × Comprimento Efetivo) / Comprimento Útil
Resultado arredondado para 2 casas decimais
```

**Exemplo:**
- Produto: 100 peças, Comprimento MP = 130mm
- Amarrado: Comprimento barra = 6400mm
- Destopo: 50mm, Perda serra: 3mm

```
Comprimento Útil = 6400 - 50 = 6350mm
Comprimento Efetivo = 130 + 3 = 133mm
Barras Sugeridas = (100 × 133) / 6350 = 2.09 barras
```

---

### **8.4 Menu Configurações (ATUALIZAR)**

**Adicionar item:**

```
⚙️ Configurações
  ├── Materiais/Ligas
  ├── Clientes
  ├── Fornecedores
  ├── Produtos (Peças)
  ├── Endereços de Estoque
  ├── Usuários Sistema
  ├── Notificações
  ├── Produção             ← NOVO (Destopo e Perda da Serra)
  └── Log de Auditoria
```

---

### **10.1.7 Cálculo de Barras com Destopo e Perda (NOVA SUBSEÇÃO)**

**Adicionar em 10.1:**

```
// Fórmula completa de barras necessárias

Peças por Barra = floor(Comprimento Útil / Comprimento Efetivo)
Onde:
  Comprimento Útil = Comprimento Barra - Destopo
  Comprimento Efetivo = Comprimento Peça + Perda Serra

Barras Necessárias = ceil(Qtd Peças / Peças por Barra)
```

**Configurações:**
- `destopo_mm`: Sobra da ponta que não vira peça (padrão: 50mm)
- `perda_serra_mm`: Largura do corte (padrão: 3mm)

---

## 🔧 ALTERAÇÃO 5: Estrutura de Pastas

### **3.1 Estrutura de Pastas (ADICIONAR)**

```
├── (dashboard)/
│   ├── ajustes-inventario-pecas/   ← NOVO: Inventário de peças
│   │   └── page.tsx
│   ├── config/
│   │   └── producao/               ← NOVO: Destopo e perda da serra
│   │       └── page.tsx
│   └── transferencias/
│       ├── page.tsx                ← ATUALIZADO: Tabs rascunho/efetivadas
│       ├── nova-requisicao-modal.tsx      ← NOVO
│       └── detalhes-requisicao-modal.tsx  ← NOVO
├── lib/
│   └── hooks/
│       └── useTransferencias.ts    ← ATUALIZADO: Requisições
```

---

## 🔧 ALTERAÇÃO 6: Header - Changelog e Versão

**Atualizar tabela de informações do documento:**

| Campo | Valor |
|-------|-------|
| **Versão do PRD** | 2.12 |
| **Última Atualização** | 14/01/2026 |

**Adicionar ao início do Changelog:**

```
v2.12: Sistema de Requisições de Transferência - nova tabela `requisicoes_transferencia` com fluxo Rascunho→Efetivada, permite acumular itens antes de efetivar, solicitante automático por item. Inventário de Peças - novas tabelas `inventarios_pecas` e `itens_inventario_pecas`, página `/ajustes-inventario-pecas` com fluxo igual amarrados, por endereço, gera histórico. Múltiplas ligas por produto - nova tabela `produtos_materiais` (N:N com is_padrao), permite produto ter várias ligas de origem. Configuração de Produção - nova tabela `config_producao` com destopo_mm e perda_serra_mm, página `/config/producao`, cálculo de barras atualizado para considerar destopo e perda da serra.
```

---

## ✅ CHECKLIST DE ATUALIZAÇÃO

### Tabelas (Seção 4)
- [ ] 4.5: Adicionar colunas `requisicao_id` e `solicitante_id` em `transferencias`
- [ ] 4.5: Alterar `nf` e `data_nf` para aceitar NULL
- [ ] 4.34: Criar tabela `requisicoes_transferencia`
- [ ] 4.35: Criar tabela `inventarios_pecas`
- [ ] 4.36: Criar tabela `itens_inventario_pecas`
- [ ] 4.37: Criar tabela `produtos_materiais`
- [ ] 4.38: Criar tabela `config_producao`

### Módulos (Seção 7)
- [ ] 7.9.3: Atualizar fórmula de barras sugeridas
- [ ] 7.14.3: Adicionar seção de requisições de transferência
- [ ] 7.18: Criar seção de inventário de peças

### Navegação (Seção 8)
- [ ] 8.1: Adicionar "Inventário Peças" no menu Estoque
- [ ] 8.4: Adicionar "Produção" no menu Configurações

### Regras de Negócio (Seção 10)
- [ ] 10.1.7: Adicionar cálculo de barras com destopo e perda

### Estrutura (Seção 3)
- [ ] 3.1: Adicionar novas páginas e arquivos

### Header
- [ ] Atualizar versão para 2.12
- [ ] Atualizar data para 14/01/2026
- [ ] Adicionar changelog v2.12

---

## 📝 NOTAS DA VERIFICAÇÃO

**Itens implementados (conforme alteracao15.md):**

| Item | Status | Observação |
|------|--------|------------|
| 1 - Status em Transferências | ✅ Completo | Requisições com Rascunho→Efetivada |
| 2 - Solicitante por item | ✅ Completo | Automático pelo usuário logado |
| 3 - Inventário de Peças | ✅ Completo | Página criada, por endereço |
| 4 - Múltiplas ligas por produto | ⏳ Parcial | Banco OK, UI pendente |
| 5 - Destopo e Perda da Serra | ✅ Completo | Página de config criada |

---

## 📝 ITENS PENDENTES (Não implementados - para futuro)

Os seguintes itens foram listados em alteracao15.md mas estão pendentes de discussão/implementação:

| # | Item | Status |
|---|------|--------|
| 6 | Calculadora de barras aproximadamente | pendente |
| 7 | `/venda-pecas`: ao lado de 'itens' | pendente |
| 8 | Enviar para produção → espelho da nota | pendente |
| 9 | Necessidade produção - detalhar itens 'em prod.' | pendente |
| 10 | Registrar recebimento com múltiplos endereços | pendente |
| 11 | Detalhes pedido recebido - mostrar endereço | pendente |
| 12 | Faturar - espelho da nota | pendente |
| 13 | Anexar nota com bucket | pendente |
| 14 | Modal faturar - entrega parcial | pendente |
| 15 | Entrada de aços comprados no mercado | pendente |
| 16 | Módulo de solicitação de compras | pendente |
| 17 | Amarrados em trânsito | pendente |
| 18 | Sistema de custo para peças/produtos | pendente |

**Nota:** Estes itens serão documentados em alterações futuras quando implementados.
