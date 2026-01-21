# 📋 Alteracoes Necessarias no PRD - Alteracao 03

**Data:** 21/01/2026  
**Referencia:** `spec-alteracao03.md`

---

## 📊 RESUMO DAS ALTERACOES

| # | Alteracao | Secoes Afetadas |
|---|-----------|-----------------|
| 1 | Expansao de itens na tabela de orcamentos | 5.2 Listagem de Orcamentos |
| 2 | Comportamento mobile da expansao | 6.6 Responsividade |

---

## 🔧 ALTERACAO 1: Expansao de Itens na Tabela de Orcamentos

### **[Secao 5.2] (ATUALIZAR)**

Na secao **5.2 Listagem de Orcamentos**, adicionar apos a tabela atual:

**Adicionar nova coluna na tabela:**

| Coluna | Sortavel | Conteudo |
|--------|----------|----------|
| Expandir | Nao | Botao para expandir/recolher itens do orcamento |

**Observacao:** A coluna "Expandir" deve ficar posicionada entre "Valor Total" e "Acoes".

**Adicionar nova subsecao:**

#### **Expansao de Itens**

A tabela de orcamentos permite expandir cada linha para visualizar os itens sem navegar para outra pagina.

**Comportamento:**
- Botao com icone ChevronDown (recolhido) ou ChevronUp (expandido)
- Multiplos orcamentos podem estar expandidos simultaneamente
- Itens sao carregados sob demanda (lazy loading) ao expandir pela primeira vez
- Cache local evita recarregar itens ja buscados
- Click na linha (fora do botao) continua navegando para a pagina do orcamento

**Dados exibidos na expansao:**

| Campo | Descricao |
|-------|-----------|
| Codigo | codigo_item do item |
| Descricao | item (nome/descricao) |
| Valor | preco_unitario formatado com unidade (ex: R$ 45,00/kg) |

**Estados visuais:**
- Linha expandida com fundo `bg-muted/50`
- Loading: "Carregando..." enquanto busca itens
- Vazio: "Nenhum item cadastrado" se orcamento nao tem itens

---

## 🔧 ALTERACAO 2: Comportamento Mobile da Expansao

### **[Secao 6.6] (ATUALIZAR)**

Na secao **6.6 Responsividade**, em **Adaptacoes**, adicionar:

**Expansao de Itens (Mobile):**
- Botao de expansao posicionado no canto superior direito do card, antes do menu de acoes
- Itens aparecem em secao colapsavel entre o cabecalho e rodape do card
- Layout compacto com mini-tabela de itens
- Click no card (fora do botao) continua navegando para o orcamento

---

## ✅ CHECKLIST DE ATUALIZACAO

### Secao 5.2 - Listagem de Orcamentos
- [ ] Adicionar coluna "Expandir" na tabela (entre Valor Total e Acoes)
- [ ] Adicionar subsecao "Expansao de Itens" com comportamentos e dados exibidos

### Secao 6.6 - Responsividade
- [ ] Adicionar "Expansao de Itens (Mobile)" nas adaptacoes

### Header
- [ ] Atualizar versao para 1.02
- [ ] Atualizar data para 21/01/2026
- [ ] Adicionar changelog v1.02

---

## 📝 TEXTO DO CHANGELOG

```
v1.02: Expansao de itens na lista de orcamentos - botao de expansao em cada linha da tabela permite visualizar itens (codigo, descricao, valor/unidade) sem navegar para outra pagina. Multiplos orcamentos podem ficar expandidos simultaneamente. Itens carregados sob demanda com cache local. Versao mobile com expansao em cards.
```
