# 📋 Alterações Necessárias no PRD - Alteração 10

**Data:** 13/01/2026  
**Referência:** `alteracao10.md`

---

## 📊 RESUMO DAS ALTERAÇÕES

| # | Alteração | Seções Afetadas |
|---|-----------|-----------------|
| 1 | Nova coluna K (R$/kg) na importação Excel | 7.4.2 |
| 2 | Botão "Baixar Template" na página de importação | 7.4.1 |
| 3 | Atualizar fluxo e remover nota sobre preenchimento manual | 7.4.1 |
| 4 | Atualizar changelog e versão | Header |

---

## 🔧 ALTERAÇÃO 1: Seção 7.4.1 - Fluxo de Importação

**Substituir a seção 7.4.1 completa por:**

#### **7.4.1 Fluxo de Importação**

1. Usuário clica "Importar Excel"
2. **Opcionalmente, clica em "Baixar Template" para obter modelo Excel**
3. Seleciona arquivo .xlsx, .xls ou .csv
4. **Seleciona destino (obrigatório):**
   - Matriz - Caminhão
   - Matriz - Estoque Ativo
   - Filial
5. Sistema valida o arquivo
6. Mostra preview com erros/avisos
7. **Usuário pode editar dados no preview** (incluindo Heat/Corrida e R$/kg)
8. Usuário confirma importação
9. Itens são criados com todos os campos preenchidos

**Botão "Baixar Template":**
- Gera arquivo Excel dinamicamente (`template_importacao_amarrados.xlsx`)
- Inclui cabeçalho com nomes das colunas (A até K)
- Inclui 3 linhas de exemplo com dados fictícios
- Larguras de coluna pré-configuradas para melhor visualização

---

## 🔧 ALTERAÇÃO 2: Seção 7.4.2 - Mapeamento de Colunas

**Substituir a tabela de mapeamento por:**

#### **7.4.2 Mapeamento de Colunas**

| Coluna Excel | Campo | Obrigatório |
|--------------|-------|-------------|
| A | ID | ✅ |
| B | Contrato/NF | ❌ |
| C | Liga | ✅ |
| D | Diâmetro | ✅ |
| E | Comprimento (mm) | ❌ |
| F | Peso | ✅ |
| G | Barras | ✅ |
| H | (ignorada) | - |
| I | Bundle Number | ❌ |
| J | Heat/Corrida | ❌ |
| K | R$/kg | ❌ |

**Comportamento das colunas opcionais:**
- **Coluna J (Heat/Corrida):** Número do heat/corrida de fabricação. Se preenchido, popula o campo `heat_corrida` do amarrado.
- **Coluna K (R$/kg):** Custo por kg em R$. Se preenchido (valor > 0), popula automaticamente. Se vazio ou zero, campo fica editável na tabela de preview.

---

## 🔧 ALTERAÇÃO 3: Header - Changelog e Versão

**Atualizar tabela de informações do documento:**

| Campo | Valor |
|-------|-------|
| **Versão do PRD** | 2.7 |
| **Última Atualização** | 13/01/2026 |

**Adicionar ao início do Changelog:**

```
v2.7: Importação Excel aprimorada - nova coluna K (R$/kg) no mapeamento de colunas, botão "Baixar Template" para gerar modelo Excel com cabeçalhos e exemplos, campos editáveis na tabela de preview para Heat/Corrida e R$/kg.
```

---

## ✅ CHECKLIST DE ATUALIZAÇÃO

- [x] Seção 7.4.1: Atualizar fluxo com "Baixar Template" e remover nota sobre preenchimento manual
- [x] Seção 7.4.2: Adicionar coluna K (R$/kg) e coluna "Obrigatório"
- [x] Seção 7.4.2: Adicionar comportamento das colunas opcionais
- [x] Header: Atualizar versão para 2.7 e data para 13/01/2026
- [x] Header: Adicionar changelog v2.7

**Status:** ✅ Todas as alterações aplicadas em 13/01/2026

---

## 📝 NOTAS DA VERIFICAÇÃO

**Verificações realizadas no PRD atual (v2.6):**

| Item | Status | Observação |
|------|--------|------------|
| Seção 7.4.1 existe | ✅ | Precisa adicionar "Baixar Template" |
| Seção 7.4.2 existe | ✅ | Já tem colunas A-J, falta K |
| Coluna J (Heat) | ✅ | Já existe como "Corrida (Heat)" |
| `excel.ts` na estrutura | ✅ | Já documentado em 3.1 |
| Nota sobre preenchimento manual | ⚠️ | Precisa remover (agora vem do Excel) |
