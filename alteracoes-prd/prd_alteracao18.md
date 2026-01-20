# 📋 Alterações Necessárias no PRD - Alteração 18

**Data:** 20/01/2026  
**Referência:** `spec-alteracao18.md`

---

## 📊 RESUMO DAS ALTERAÇÕES

| # | Alteração | Seções Afetadas |
|---|-----------|-----------------|
| 1 | Novos campos de URL para arquivos de NF em 4 tabelas | 4.15, 4.34, 4.44, 4.46 |
| 2 | Novo bucket `notas-fiscais` no Storage | 2.2 (Storage) |
| 3 | Upload obrigatório de NF em 5 modais | 7.5, 7.6, 7.7, 7.11 |
| 4 | NF clicável em 6 locais de exibição | 7.5, 7.6, 7.7, 7.11 |

---

## 🔧 ALTERAÇÃO 1: Campos de URL nas Tabelas

### **4.15 Tabela: `pedidos_producao` (ATUALIZAR)**

Adicionar 4 novos campos:

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `nf_remessa` | text | NULL | Número da NF de remessa para o fornecedor |
| `nf_remessa_arquivo_url` | text | NULL | Path do arquivo da NF de remessa no bucket |
| `nf_retorno` | text | NULL | Número da NF de retorno do fornecedor |
| `nf_retorno_arquivo_url` | text | NULL | Path do arquivo da NF de retorno no bucket |

---

### **4.34 Tabela: `requisicoes_transferencia` (ATUALIZAR)**

Adicionar 1 novo campo:

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `nf_arquivo_url` | text | NULL | Path do arquivo da NF no bucket |

---

### **4.44 Tabela: `entregas_pedido_pecas` (ATUALIZAR)**

Adicionar 1 novo campo:

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `nf_arquivo_url` | text | NULL | Path do arquivo da NF no bucket |

---

### **4.46 Tabela: `entregas_pedido_amarrados` (ATUALIZAR)**

Adicionar 1 novo campo:

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `nf_arquivo_url` | text | NULL | Path do arquivo da NF no bucket |

---

## 🔧 ALTERAÇÃO 2: Bucket de Storage

### **2.2 Backend - Storage (ATUALIZAR)**

Adicionar ao final da seção de Storage:

| Bucket | Tipos Aceitos | Tamanho Máximo | Uso |
|--------|---------------|----------------|-----|
| `notas-fiscais` | PDF, JPG, PNG | 10MB | Armazenamento de PDFs/imagens de NFs anexadas |

**Políticas:**
- Upload: Usuários autenticados
- Leitura: Usuários autenticados (via URL assinada)

---

## 🔧 ALTERAÇÃO 3: Upload Obrigatório de NF

### **7.5.4 Modal Enviar para Produção (ATUALIZAR)**

Adicionar campos obrigatórios:

- **Número da NF de Remessa** - campo texto obrigatório
- **Anexar NF de Remessa** - upload obrigatório (PDF/JPG/PNG, máx 10MB)

**Comportamento:**
- Botão "Confirmar Envio" só habilitado com arquivo anexado
- Upload feito para bucket `notas-fiscais` antes de confirmar

---

### **7.5.5 Modal Recebimento de Produção (ATUALIZAR)**

Adicionar campos obrigatórios:

- **Número da NF de Retorno** - campo texto obrigatório
- **Anexar NF de Retorno** - upload obrigatório (PDF/JPG/PNG, máx 10MB)

**Comportamento:**
- Botão "Confirmar Recebimento" só habilitado com arquivo anexado
- Upload feito para bucket `notas-fiscais` antes de confirmar

---

### **7.6.3 Modal Faturar Pedido - Amarrados (ATUALIZAR)**

Adicionar campo obrigatório:

- **Anexar NF** - upload obrigatório (PDF/JPG/PNG, máx 10MB)

**Comportamento:**
- Botão "Faturar" só habilitado com arquivo anexado
- Upload feito para bucket `notas-fiscais` antes de confirmar

---

### **7.7.6 Modal Faturar Pedido - Peças (ATUALIZAR)**

Adicionar campo obrigatório:

- **Anexar NF** - upload obrigatório (PDF/JPG/PNG, máx 10MB)

**Comportamento:**
- Botão "Faturar" só habilitado com arquivo anexado
- Upload feito para bucket `notas-fiscais` antes de confirmar

---

### **7.11.3 Modal Efetivar Transferência (ATUALIZAR)**

Adicionar campo obrigatório:

- **Anexar NF** - upload obrigatório (PDF/JPG/PNG, máx 10MB)

**Comportamento:**
- Botão "Confirmar Efetivação" só habilitado com arquivo anexado
- Upload feito para bucket `notas-fiscais` antes de confirmar

---

## 🔧 ALTERAÇÃO 4: NF Clicável

### **Nova Seção 3.X Componente NFLink (NOVA)**

Componente reutilizável para exibição de números de NF:

**Comportamento:**
- Se `nf_arquivo_url` existe: número exibido como link azul sublinhado com ícone 📄
- Hover: cursor pointer + tooltip "Clique para ver PDF"
- Click: gera URL assinada do Supabase Storage e abre em nova aba
- Se não existe arquivo: texto normal (sem link)

**Locais de Uso:**
1. Modal Selecionar NF - Peças (coluna NF)
2. Modal Selecionar NF - Amarrados (coluna NF)
3. Modal Detalhes Pedido - Peças (histórico de entregas)
4. Modal Detalhes Pedido - Amarrados (histórico de entregas)
5. Modal Detalhes Pedido - Produção (NF remessa e NF retorno)
6. Página Transferências - Aba Efetivadas (coluna NF)

---

## ✅ CHECKLIST DE ATUALIZAÇÃO

### Modelo de Dados (Seção 4)
- [ ] 4.15 `pedidos_producao` - adicionar 4 campos (nf_remessa, nf_remessa_arquivo_url, nf_retorno, nf_retorno_arquivo_url)
- [ ] 4.34 `requisicoes_transferencia` - adicionar 1 campo (nf_arquivo_url)
- [ ] 4.44 `entregas_pedido_pecas` - adicionar 1 campo (nf_arquivo_url)
- [ ] 4.46 `entregas_pedido_amarrados` - adicionar 1 campo (nf_arquivo_url)

### Backend (Seção 2)
- [ ] 2.2 Storage - documentar bucket `notas-fiscais`

### Interface (Seção 7)
- [ ] 7.5.4 Enviar Produção - upload NF remessa obrigatório
- [ ] 7.5.5 Recebimento Produção - upload NF retorno obrigatório + campo nf_retorno
- [ ] 7.6.3 Faturar Amarrados - upload NF obrigatório
- [ ] 7.7.6 Faturar Peças - upload NF obrigatório
- [ ] 7.11.3 Efetivar Transferência - upload NF obrigatório
- [ ] Documentar NF clicável nos 6 locais

### Header
- [ ] Atualizar versão para 2.22
- [ ] Atualizar data
- [ ] Adicionar changelog v2.22
