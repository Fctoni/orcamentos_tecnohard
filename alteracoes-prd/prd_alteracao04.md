# 📋 Alteracoes Necessarias no PRD - Alteracao 04

**Data:** 21/01/2026  
**Referencia:** `spec-alteracao04.md`

---

## 📊 RESUMO DAS ALTERACOES

| # | Alteracao | Secoes Afetadas |
|---|-----------|-----------------|
| 1 | Reformulacao completa do layout do PDF | 5.5 Geracao de PDF |
| 2 | Paginacao e elementos fixos | 5.5 Geracao de PDF |
| 3 | Ordenacao de processos conforme hierarquia | 5.3 Criacao/Edicao de Orcamento |

---

## 🔧 ALTERACAO 1: Reformulacao do Layout do PDF

### **[Secao 5.5] (ATUALIZAR)**

Substituir a secao **5.5 Geracao de PDF** pela versao reformulada abaixo:

---

### **5.5 Geracao de PDF**

**Objetivo:** Gerar PDF profissional com layout otimizado para multiplas paginas.

**Especificacoes:**

**Cabecalho (repete em todas as paginas):**
- Numero do orcamento no canto superior direito (formato: "No: AAAA-NNNN")
- Logo Tecno Hard centralizado (largura 50% da pagina)
- Dados do cliente centralizados: Nome, Contato, Validade

**Tabela de Itens:**

| Coluna | Largura | Conteudo |
|--------|---------|----------|
| Item | 42% | codigo_item + " - " + descricao + processos (linha abaixo, fonte menor) |
| Material | 12% | material ou "-" |
| Prazo (dias uteis) | 10% | prazo_entrega numerico |
| Fat. Min. | 12% | faturamento_minimo formatado ou "-" |
| Peso Un. | 10% | peso_unitario + " kg" ou "-" |
| Preco | 14% | preco_unitario + "/pc" ou "/kg" conforme unidade |

**Estilo da tabela:**
- Cabecalhos centralizados com fonte 9px
- Celulas de valores centralizadas com fonte 9px
- Processos exibidos abaixo do item em fonte menor
- Processos ordenados conforme hierarquia cadastrada (ordem do drag & drop)

**Paginacao:**
- Logo, numero do orcamento e cabecalho da tabela sao elementos `fixed` (repetem em todas as paginas)
- Itens nao sao cortados entre paginas (`wrap={false}`)
- Numeracao de paginas (X/Y) no rodape, so aparece se documento tiver mais de 1 pagina

**Informacoes Gerais:**
- Posicionadas proximo ao rodape (usa marginTop: auto para empurrar para baixo)
- Frete, Validade, Observacoes (somente se preenchidos)

**Secao "Elaborado por":**
- Posicionada entre as informacoes gerais e o rodape
- Alinhada a direita
- Suporta multiplas linhas (nome, telefone, email)

**Rodape (todas as paginas):**
```
R. Emilio Fonini, 521 - Cinquentenario, Caxias do Sul - RS
(54) 3225-6464 - https://www.tecnohard.ind.br/
                                                      1/3  <- so se > 1 pagina
```

**Configuracoes do PDF:**
- Formato: A4
- Margens: 2cm
- Fonte: Arial ou similar
- Cores: Neutras (preto, cinza)

---

## 🔧 ALTERACAO 2: Ordenacao de Processos

### **[Secao 5.3] (ADICIONAR)**

Na secao **5.3 Criacao/Edicao de Orcamento**, na subsecao de **Itens do Orcamento**, adicionar apos o campo "Processos":

**Ordenacao de Processos:**
- Ao salvar um item, os processos selecionados sao automaticamente ordenados conforme a hierarquia cadastrada (ordem do drag & drop na tabela de processos)
- A ordenacao garante consistencia na exibicao em todos os lugares (formulario, preview, PDF)

---

## ✅ CHECKLIST DE ATUALIZACAO

### Secao 5.5 - Geracao de PDF
- [ ] Substituir layout do cabecalho (numero no canto direito, logo centralizado)
- [ ] Substituir tabela de itens (nova estrutura com 6 colunas)
- [ ] Adicionar especificacoes de paginacao (elementos fixed, wrap={false})
- [ ] Adicionar numeracao de paginas condicional
- [ ] Atualizar formato do rodape

### Secao 5.3 - Criacao/Edicao de Orcamento
- [ ] Adicionar nota sobre ordenacao automatica de processos

### Header
- [ ] Atualizar versao para 1.03
- [ ] Atualizar data para 21/01/2026
- [ ] Adicionar changelog v1.03

---

## 📝 TEXTO DO CHANGELOG

```
v1.03: Reformulacao do layout do PDF - numero do orcamento no canto superior direito, nova estrutura de tabela de itens com colunas Item (codigo+descricao+processos), Material, Prazo, Fat. Min., Peso Un. e Preco. Paginacao melhorada com elementos fixos (logo, numero, cabecalho da tabela) repetindo em todas as paginas, itens nao cortados entre paginas, numeracao de paginas (X/Y) condicional. Processos automaticamente ordenados conforme hierarquia cadastrada ao salvar itens.
```
