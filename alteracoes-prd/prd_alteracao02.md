# 📋 Alteracoes Necessarias no PRD - Alteracao 02

**Data:** 20/01/2026  
**Referencia:** `spec-alteracao02.md`

---

## 📊 RESUMO DAS ALTERACOES

| # | Alteracao | Secoes Afetadas |
|---|-----------|-----------------|
| 1 | Novos campos em `orcamentos`: `observacoes_internas`, `elaborado_por` | 4.1 Tabela orcamentos |
| 2 | Nova tabela `configuracoes` para parametros do sistema | 4.X (nova) |
| 3 | Novos campos no formulario de orcamento | 5.3 Criacao/Edicao |
| 4 | Mudancas no layout do PDF | 5.5 Geracao de PDF |
| 5 | Campo prazo de entrega: formato numerico + sufixo "dias uteis" | 4.2, 5.3, 5.5 |
| 6 | Auto-save com blur nos campos de condicoes comerciais | 5.3 Criacao/Edicao |

---

## 🔧 ALTERACAO 1: Novos Campos em `orcamentos`

### **[Secao 4.1] (ATUALIZAR)**

Adicionar as seguintes colunas na tabela `orcamentos`:

| Coluna | Tipo | Constraints | Descricao |
|--------|------|-------------|-----------|
| `observacoes_internas` | text | NULL | Observacoes internas (NAO aparece no PDF) |
| `elaborado_por` | text | NULL | Nome/contato de quem elaborou o orcamento |

---

## 🔧 ALTERACAO 2: Nova Tabela `configuracoes`

### **[Secao 4.X] (NOVA)**

### **4.8 Tabela: `configuracoes`**

Armazena parametros de configuracao do sistema em formato chave-valor.

| Coluna | Tipo | Constraints | Descricao |
|--------|------|-------------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | ID unico |
| `chave` | text | NOT NULL, UNIQUE | Identificador da configuracao |
| `valor` | text | NULL | Valor da configuracao |
| `created_at` | timestamptz | DEFAULT now() | Data de criacao |
| `updated_at` | timestamptz | DEFAULT now() | Ultima atualizacao |

**Configuracoes Disponiveis:**

| Chave | Descricao | Valor Exemplo |
|-------|-----------|---------------|
| `logo_url` | URL do logo da empresa | `https://...` |
| `elaborado_por_default` | Texto padrao para "Elaborado por" | `Jose Adair Giubel\nFone: (54) 3218-2168` |
| `observacoes_default` | Texto padrao para observacoes do orcamento | `O faturamento minimo considera lote de mesmo material...` |

**Indices:**
- `idx_configuracoes_chave` (chave)

**Nota:** Esta tabela usa formato chave-valor para flexibilidade. Novas configuracoes podem ser adicionadas sem alterar o schema.

---

## 🔧 ALTERACAO 3: Novos Campos no Formulario

### **[Secao 5.3] (ATUALIZAR)**

#### **Secao 2: Condicoes Comerciais**

Atualizar a tabela para incluir novos campos:

| Campo | Tipo | Obrigatorio | Placeholder/Descricao |
|-------|------|-------------|----------------------|
| Frete | Select + Input | ❌ | Opcoes: CIF, FOB, ou texto livre |
| Validade | Date Picker | ❌ | Data de validade do orcamento |
| Prazo de Faturamento | Textarea | ❌ | Condicoes de pagamento |
| Observacoes | Textarea | ❌ | Default carregado das configuracoes |
| Elaborado por | Textarea | ❌ | Default carregado das configuracoes, exibido no PDF |

#### **Nova Secao: Observacoes Internas**

Adicionar nova secao no formulario:

| Campo | Tipo | Obrigatorio | Placeholder/Descricao |
|-------|------|-------------|----------------------|
| Observacoes Internas | Textarea | ❌ | Anotacoes internas (NAO aparece no PDF) |

**Comportamento de Auto-Save:**
- Os campos de Condicoes Comerciais salvam automaticamente ao perder foco (blur)
- Indicador "Salvando..." aparece no cabecalho durante o salvamento automatico

---

## 🔧 ALTERACAO 4: Mudancas no Layout do PDF

### **[Secao 5.5] (ATUALIZAR)**

Atualizar especificacoes do PDF:

**Cabecalho:**
- Logo Tecno Hard centralizado
- Titulo: "Orcamento No: AAAA-NNNN" (formato ANO-SEQ, fonte 16px)
- Nome do cliente com fonte ~10% maior que o restante

**Corpo:**
- Tabela de itens com todos os campos visiveis
- Prazo de entrega exibido como "X dias uteis"
- Preco por kg exibido como "Preco (por kg):" quando unidade = kg

**Informacoes Gerais:**
- Posicionadas proximo ao rodape (nao no meio da pagina)
- Frete, Validade, Observacoes

**Secao "Elaborado por":**
- Posicionada entre as informacoes gerais e o rodape
- Alinhada a direita
- Suporta multiplas linhas (nome, telefone, email)

**Ordem dos Elementos:**
1. Logo
2. Titulo do Orcamento
3. Dados do Cliente
4. Tabela de Itens
5. Total
6. (Espaco flexivel)
7. Informacoes Gerais
8. Elaborado por
9. Rodape

---

## 🔧 ALTERACAO 5: Prazo de Entrega Numerico

### **[Secao 4.2] (ATUALIZAR)**

Atualizar descricao do campo `prazo_entrega` na tabela `orcamento_itens`:

| Coluna | Tipo | Constraints | Descricao |
|--------|------|-------------|-----------|
| `prazo_entrega` | text | NULL | Prazo em dias uteis (armazena apenas o numero, ex: "15"). Exibido como "X dias uteis" |

### **[Secao 5.3] (ATUALIZAR)**

Atualizar campo na tabela de itens:

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| Prazo de Entrega | Input numero + sufixo | ❌ | Aceita apenas numeros inteiros. Sufixo "dias uteis" exibido automaticamente |

---

## 🔧 ALTERACAO 6: Pagina de Configuracoes

### **[Secao 5.X] (NOVA)**

### **5.10 Configuracoes do Sistema**

**Tela: Configuracoes (`/config`)**

**Secoes Disponiveis:**

1. **Logo da Empresa**
   - Upload de imagem (PNG, JPG, WEBP)
   - Preview da imagem atual
   - Armazenamento no Supabase Storage (bucket: `configuracoes`)

2. **Responsavel pelo Orcamento (padrao)**
   - Campo textarea multilinha
   - Texto usado como valor default em novos orcamentos
   - Chave: `elaborado_por_default`

3. **Observacoes Padrao**
   - Campo textarea multilinha
   - Texto usado como valor default em novos orcamentos
   - Chave: `observacoes_default`

---

## ✅ CHECKLIST DE ATUALIZACAO

### Modelo de Dados
- [ ] Adicionar colunas `observacoes_internas` e `elaborado_por` em 4.1
- [ ] Criar nova secao 4.8 para tabela `configuracoes`
- [ ] Atualizar descricao de `prazo_entrega` em 4.2

### Funcionalidades
- [ ] Atualizar secao 5.3 com novos campos do formulario
- [ ] Atualizar secao 5.5 com novo layout do PDF
- [ ] Criar secao 5.10 para pagina de configuracoes

### Header
- [ ] Atualizar versao para 1.01
- [ ] Atualizar data
- [ ] Adicionar changelog v1.01

### Changelog Proposto

```
v1.01: Alteracao 02 - Novos campos `observacoes_internas` e `elaborado_por` em orcamentos. Nova tabela `configuracoes` para parametros do sistema (logo, elaborado_por_default, observacoes_default). Prazo de entrega agora e campo numerico com sufixo "dias uteis". Layout do PDF ajustado: titulo com fonte menor, cliente com fonte maior, informacoes gerais proximas ao rodape, secao "Elaborado por" alinhada a direita. Auto-save com blur nos campos de condicoes comerciais.
```

---

## 📝 NOTAS

1. **Observacoes Internas:** Campo de uso exclusivo interno, nunca exportado para PDF ou visualizacao externa
2. **Configuracoes:** Sistema de chave-valor permite adicionar novas configuracoes sem migrations
3. **Preco por kg:** Na visualizacao e PDF, items com unidade "kg" mostram "Preco (por kg):" para clareza
4. **Auto-save:** Melhoria de UX que evita perda de dados ao editar campos de texto longos
