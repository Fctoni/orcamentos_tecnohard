# 📋 Alterações Necessárias no PRD - Alteração 12

**Data:** 13/01/2026  
**Referência:** `alteracao12.md`

---

## 📊 RESUMO DAS ALTERAÇÕES

| # | Alteração | Seções Afetadas |
|---|-----------|-----------------|
| 1 | Página `/filial` removida, substituída por `/estoque` | 7.3, 8.1 |
| 2 | Nova página de Estoque Geral com filtro de localização | 7.3 |
| 3 | Atualizar menu sidebar | 8.1 |
| 4 | Atualizar referências de busca global | 6.1 |
| 5 | Atualizar changelog e versão | Header |

---

## 🔧 ALTERAÇÃO 1: Seção 7.3 - Estoque Geral (Tabela)

**Substituir a seção 7.3 completa por:**

### **7.3 Estoque Geral (Tabela)**

Visualização em tabela de todos os amarrados com filtro de localização.

#### **7.3.1 Filtro de Localização**

| Opção | Descrição |
|-------|-----------|
| Todas | Exibe amarrados de todas as localizações |
| Matriz | Apenas amarrados na Matriz |
| Filial | Apenas amarrados na Filial |

**Comportamento:**
- Filtro persiste via URL (`?localizacao=matriz|filial`)
- Busca mestra direciona para `/estoque?busca=ID`
- Contadores separados no resumo (Matriz vs Filial)

#### **7.3.2 Tabela de Amarrados**

| Coluna | Ordenável | Descrição |
|--------|-----------|-----------|
| ID | ✅ | Identificador do amarrado |
| Contrato | ✅ | Número do contrato |
| Liga | ✅ | Tipo do aço |
| Diâmetro | ✅ | Diâmetro em mm |
| Peso Atual | ✅ | Saldo de peso |
| Barras Atual | ✅ | Saldo de barras |
| Local | ✅ | Badge indicando Matriz ou Filial |
| Data Entrada | ✅ | Data de entrada |
| Ações | - | Botões de ação |

**Badge de Localização:**
- **Matriz**: Badge azul
- **Filial**: Badge verde

---

## 🔧 ALTERAÇÃO 2: Seção 8.1 - Menu Estoque (Sidebar)

**Substituir o menu por:**

### **8.1 Menu Estoque (Sidebar)**

```
📦 Estoque
  ├── Matriz (Canvas)
  ├── Tabela Geral          ← Renomeado de "Filial"
  ├── Peças
  ├── Em Poder Fornec.
  ├── Importar
  └── Histórico
```

**Rotas:**
- `/matriz` → Canvas visual (apenas Matriz)
- `/estoque` → Tabela geral com filtro de localização
- `/estoque/pecas` → Estoque de peças acabadas

---

## 🔧 ALTERAÇÃO 3: Seção 6.1 - Tabelas com Sincronização

**Atualizar a referência na tabela de realtime:**

| Tabela | Canal | Eventos | Uso |
|--------|-------|---------|-----|
| `amarrados` | `global-amarrados` | INSERT, UPDATE, DELETE | Canvas, Tabela Geral |

---

## 🔧 ALTERAÇÃO 4: Seção 12 - Fase 6

**Atualizar título e descrição:**

### **Fase 6: Tabela Geral + Busca Global**

**Objetivo:** Tabela unificada de estoque e busca

**Tarefas:**
1. [x] Página `/estoque` com filtro de localização
2. [x] Filtros e ordenação
3. [x] Ações por item
4. [x] Campo de busca global no header
5. [x] Highlight no canvas ao encontrar (amarrados da matriz)

**Entregáveis:**
- Tabela Geral completa com filtro Matriz/Filial
- Busca global funcionando

---

## 🔧 ALTERAÇÃO 5: Header - Changelog e Versão

**Atualizar tabela de informações do documento:**

| Campo | Valor |
|-------|-------|
| **Versão do PRD** | 2.8 |
| **Última Atualização** | 13/01/2026 |

**Adicionar ao início do Changelog:**

```
v2.8: Estoque Geral unificado - página `/filial` substituída por `/estoque` com filtro de localização (Matriz/Filial/Todas), nova coluna "Local" na tabela com badge, busca global atualizada para direcionar a `/estoque`, sidebar atualizada com "Tabela Geral".
```

---

## ✅ CHECKLIST DE ATUALIZAÇÃO

- [x] Seção 7.3: Renomear "Lista Filial" para "Estoque Geral (Tabela)"
- [x] Seção 7.3: Adicionar subseção de filtro de localização
- [x] Seção 7.3.2: Adicionar coluna "Local" na tabela
- [x] Seção 8.1: Atualizar menu sidebar (Filial → Tabela Geral)
- [x] Seção 6.1: Atualizar referência "Lista Filial" → "Tabela Geral"
- [x] Seção 12 (Fase 6): Atualizar título e tarefas
- [x] Header: Atualizar versão para 2.8 e data para 13/01/2026
- [x] Header: Adicionar changelog v2.8

**Status:** ✅ Todas as alterações aplicadas em 13/01/2026

---

## 📝 NOTAS DA VERIFICAÇÃO

**Verificações realizadas no PRD atual (v2.7):**

| Item | Status | Observação |
|------|--------|------------|
| Seção 7.3 "Lista Filial" existe | ✅ | Precisa renomear e expandir |
| Seção 8.1 menu sidebar | ✅ | Tem "Filial", precisa trocar |
| Referência em 6.1 (Realtime) | ✅ | Menciona "Lista Filial" |
| Fase 6 menciona Filial | ✅ | Precisa atualizar |
