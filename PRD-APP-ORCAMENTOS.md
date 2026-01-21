# 📋 PRD - Sistema de Orçamentos Tecno Hard v1.03

**Product Requirements Document**

---

## 📊 **INFORMAÇÕES DO DOCUMENTO**

| Campo | Valor |
|-------|-------|
| **Versão do PRD** | 1.03 |
| **Última Atualização** | 21/01/2026 |
| **Autor** | Claude (Anthropic) |
| **IA de Desenvolvimento** | Claude 4.5 Sonnet |
| **Status** | ✅ Aprovado para desenvolvimento |

**Changelog:**
- v1.03: Reformulacao do layout do PDF - numero do orcamento no canto superior direito, nova estrutura de tabela de itens com colunas Item (codigo+descricao+processos), Material, Prazo, Fat. Min., Peso Un. e Preco. Paginacao melhorada com elementos fixos (logo, numero, cabecalho da tabela) repetindo em todas as paginas, itens nao cortados entre paginas, numeracao de paginas (X/Y) condicional. Processos automaticamente ordenados conforme hierarquia cadastrada ao salvar itens.
- v1.02: Expansao de itens na lista de orcamentos - botao de expansao em cada linha da tabela permite visualizar itens (codigo, descricao, valor/unidade) sem navegar para outra pagina. Multiplos orcamentos podem ficar expandidos simultaneamente. Itens carregados sob demanda com cache local. Versao mobile com expansao em cards.
- v1.01: Alteracao 02 - Novos campos `observacoes_internas` e `elaborado_por` em orcamentos. Nova tabela `configuracoes` para parametros do sistema (logo, elaborado_por_default, observacoes_default). Prazo de entrega agora e campo numerico com sufixo "dias uteis". Layout do PDF ajustado: titulo com fonte menor, cliente com fonte maior, informacoes gerais proximas ao rodape, secao "Elaborado por" alinhada a direita. Auto-save com blur nos campos de condicoes comerciais. Pagina de Configuracoes documentada.


---

## 🎯 **1. VISÃO GERAL DO PRODUTO**

### **1.1 Objetivo**

Criar um sistema web moderno para **criação, organização e exportação de orçamentos** para a empresa Tecno Hard, com autenticação, gestão de itens, anexos e clientes, além de geração profissional de PDFs.

### **1.2 Problema que Resolve**

- ❌ Solução atual em Notion é limitada e pouco profissional
- ❌ Fluxo de criação de orçamentos complexo e lento
- ❌ Layout de exportação não padronizado
- ❌ Dificuldade em gerenciar itens, anexos e clientes
- ❌ Busca e filtragem de orçamentos ineficiente
- ❌ Falta de rastreabilidade de alterações

### **1.3 Solução Proposta**

✅ Sistema web moderno (Next.js) com:
- Interface limpa e amigável
- Fluxo simplificado de criação de orçamentos
- Layout profissional para visualização e PDF
- Gerenciamento organizado de itens, anexos e clientes
- Tabela avançada com filtros, busca full-text e scroll infinito
- Exportação em PDF, CSV e Excel
- Rastreabilidade de criação e alterações

### **1.4 Usuários-Alvo**

- **Vendedores:** Criam e enviam orçamentos para clientes
- **Gestores comerciais:** Acompanham status e métricas de orçamentos
- **Administradores:** Configuram o sistema

### **1.5 Fora do Escopo (MVP)**

- ❌ Controle de acesso granular por usuário
- ❌ Registro detalhado de logs
- ❌ Histórico de revisões / comparação de versões
- ❌ Workflow de aprovação
- ❌ Assinatura eletrônica
- ❌ Envio automático por e-mail

---

## 🏗️ **2. STACK TÉCNICO**

### **2.1 Frontend**

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Next.js** | 14+ (App Router) | Framework React full-stack |
| **TypeScript** | 5+ | Type safety |
| **Tailwind CSS** | 3+ | Estilização |
| **shadcn/ui** | Latest | Componentes UI base |
| **react-pdf** | Latest | Geração de PDF |
| **date-fns** | Latest | Manipulação de datas |
| **Zod** | Latest | Validação de schemas |

### **2.2 Backend**

| Tecnologia | Propósito |
|------------|-----------|
| **Supabase** | Backend-as-a-Service |
| ├─ **PostgreSQL** | Banco de dados relacional |
| ├─ **Auth** | Autenticação (email/senha) |
| ├─ **Storage** | Armazenamento de anexos |
| └─ **Edge Functions** | Opcional (lógica serverless) |

### **2.3 Ferramentas**

- **Cursor + MCP**: Acesso direto ao Supabase
- **Git**: Controle de versão
- **Vercel**: Deploy (recomendado para Next.js)

---

## 📐 **3. ARQUITETURA DO SISTEMA**

### **3.1 Estrutura de Pastas (Next.js App Router)**

```
projeto/
├── app/
│   ├── (auth)/                    # Layout de autenticação
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/               # Layout principal (após login)
│   │   ├── layout.tsx            # Header, sidebar
│   │   ├── orcamentos/
│   │   │   ├── page.tsx          # Lista de orçamentos
│   │   │   ├── novo/
│   │   │   │   └── page.tsx      # Criar novo orçamento
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Visualização do orçamento
│   │   │       └── editar/
│   │   │           └── page.tsx  # Edição do orçamento
│   │   └── config/
│   │       └── page.tsx          # Configurações
│   └── api/                       # API routes
│       ├── pdf/
│       │   └── [id]/
│       │       └── route.ts      # Geração de PDF
│       └── export/
│           └── route.ts          # Exportação CSV/Excel
├── components/
│   ├── ui/                        # Componentes base (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── features/                  # Componentes específicos
│   │   ├── orcamento-form.tsx
│   │   ├── item-form.tsx
│   │   ├── item-list.tsx
│   │   ├── anexo-upload.tsx
│   │   ├── orcamento-preview.tsx
│   │   ├── orcamento-pdf.tsx
│   │   ├── orcamento-table.tsx
│   │   ├── status-badge.tsx
│   │   └── ...
│   └── layout/
│       ├── header.tsx
│       ├── sidebar.tsx
│       └── footer.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Cliente browser
│   │   ├── server.ts             # Cliente server
│   │   └── middleware.ts         # Auth middleware
│   ├── types/
│   │   ├── database.ts           # Tipos gerados do Supabase
│   │   └── app.ts                # Tipos da aplicação
│   ├── utils/
│   │   ├── format.ts             # Formatação de valores
│   │   ├── pdf-generator.ts      # Lógica de geração PDF
│   │   ├── export.ts             # Exportação CSV/Excel
│   │   └── validators.ts         # Validações Zod
│   └── hooks/                     # Custom React hooks
│       ├── use-orcamentos.ts
│       ├── use-orcamento.ts
│       ├── use-itens.ts
│       └── use-anexos.ts
├── public/
│   └── logo-tecnohard.png        # Logo da empresa
└── styles/
    └── globals.css
```

### **3.2 Princípios Arquiteturais**

**Manutenibilidade em Primeiro Lugar:**

1. **Separação de Concerns**
   - Componentes UI puros (sem lógica de negócio)
   - Hooks customizados para lógica reutilizável
   - Tipos TypeScript centralizados

2. **Código Autodocumentado**
   - Nomes descritivos de variáveis/funções
   - Interfaces explícitas
   - Comentários JSDoc onde necessário

3. **Componentização**
   - Componentes pequenos e focados
   - Props tipadas com TypeScript
   - Reutilização máxima

4. **Gerenciamento de Estado**
   - Server state: React Query / Supabase hooks
   - UI state: useState local
   - Evitar estado global desnecessário

---

## 🗄️ **4. MODELO DE DADOS (SUPABASE)**

### **4.1 Tabela: `orcamentos`**

Armazena os orçamentos.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK | ID único |
| `numero` | text | NOT NULL, UNIQUE | Número do orçamento (ex: "2025-0012"). Gerado automaticamente |
| `cliente` | text | NOT NULL | Nome do cliente |
| `contato` | text | NULL | Nome da pessoa que receberá o orçamento |
| `frete` | text | NULL | Tipo de frete (CIF, FOB, ou texto livre) |
| `validade` | date | NULL | Data de validade do orçamento |
| `observacoes` | text | NULL | Observações gerais |
| `status` | text | NOT NULL, DEFAULT 'cadastrado' | Status do orçamento |
| `ocultar_valor_total` | boolean | DEFAULT false | Se true, oculta valor total no PDF |
| `valor_total` | decimal | DEFAULT 0 | Valor total calculado (soma dos itens) |
| `observacoes_internas` | text | NULL | Observacoes internas (NAO aparece no PDF) |
| `elaborado_por` | text | NULL | Nome/contato de quem elaborou o orcamento |
| `created_at` | timestamptz | DEFAULT now() | Data de criação |
| `created_by` | uuid | FK(auth.users.id) | Usuário que criou |
| `updated_at` | timestamptz | DEFAULT now() | Última atualização |
| `updated_by` | uuid | FK(auth.users.id) | Usuário que alterou |

**Constraints:**
- CHECK (status IN ('cadastrado', 'aguardando-informacoes', 'enviado', 'em-negociacao', 'aprovado', 'rejeitado'))

**Índices:**
- `idx_orcamentos_numero` ON `numero`
- `idx_orcamentos_cliente` ON `cliente`
- `idx_orcamentos_status` ON `status`
- `idx_orcamentos_created_at` ON `created_at`

**Geração do Número do Orçamento:**
- Formato: `YYYY-NNNN` (ex: "2025-0012")
- A sequência numérica (NNNN) reinicia a cada novo ano, começando em 0001
- Implementado via função SQL ou trigger

---

### **4.2 Tabela: `orcamento_itens`**

Armazena os itens de cada orçamento.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK | ID único |
| `orcamento_id` | uuid | NOT NULL, FK(orcamentos.id) ON DELETE CASCADE | Orçamento relacionado |
| `codigo_item` | text | NOT NULL | Código do item |
| `item` | text | NOT NULL | Nome/descrição do item |
| `unidade` | text | NOT NULL | Unidade (Un, Kg, Pç, etc.) |
| `quantidade` | decimal | NOT NULL, DEFAULT 1 | Quantidade |
| `peso_unitario` | decimal | NULL | Peso unitário |
| `preco_unitario` | decimal | NOT NULL | Preço unitário (R$) |
| `preco_total` | decimal | NOT NULL | Preço total (quantidade × preço unitário) |
| `material` | text | NULL | Material |
| `processos` | text[] | NULL | Array de processos selecionados |
| `prazo_entrega` | text | NULL | Prazo em dias uteis (armazena apenas o numero, ex: "15"). Exibido como "X dias uteis" |
| `faturamento_minimo` | text | NULL | Faturamento mínimo |
| `ordem` | integer | NOT NULL, DEFAULT 0 | Ordem de exibição |
| `created_at` | timestamptz | DEFAULT now() | Data de criação |

**Índices:**
- `idx_itens_orcamento` ON `orcamento_id`
- `idx_itens_codigo` ON `codigo_item`
- `idx_itens_ordem` ON `ordem`

**Processos Disponíveis (valores válidos para o array `processos`):**
- `desempeno`
- `normalizacao`
- `tempera-inducao`
- `tempera`
- `cementacao`
- `beneficiamento`
- `revenimento`
- `recozimento-atmosfera`
- `recozimento-sem-atmosfera`

---

### **4.3 Tabela: `orcamento_anexos`**

Armazena os anexos dos itens do orçamento.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK | ID único |
| `item_id` | uuid | NOT NULL, FK(orcamento_itens.id) ON DELETE CASCADE | Item relacionado |
| `nome_arquivo` | text | NOT NULL | Nome original do arquivo |
| `storage_path` | text | NOT NULL | Caminho no Supabase Storage |
| `tipo_arquivo` | text | NOT NULL | MIME type do arquivo |
| `tamanho` | integer | NOT NULL | Tamanho em bytes |
| `created_at` | timestamptz | DEFAULT now() | Data de upload |
| `created_by` | uuid | FK(auth.users.id) | Usuário que fez upload |

**Índices:**
- `idx_anexos_item` ON `item_id`

---

### **4.4 Tabela: `processos`**

Tabela de configuração dos processos disponíveis.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK | ID único |
| `codigo` | text | NOT NULL, UNIQUE | Código do processo (slug) |
| `nome` | text | NOT NULL | Nome de exibição |
| `ativo` | boolean | DEFAULT true | Se o processo está disponível |
| `ordem` | integer | NOT NULL, DEFAULT 0 | Ordem de exibição |
| `created_at` | timestamptz | DEFAULT now() | Data de criação |

**Seed inicial:**

| codigo | nome | ordem |
|--------|------|-------|
| desempeno | Desempeno | 1 |
| normalizacao | Normalização | 2 |
| tempera-inducao | Têmpera por Indução | 3 |
| tempera | Têmpera | 4 |
| cementacao | Cementação | 5 |
| beneficiamento | Beneficiamento | 6 |
| revenimento | Revenimento | 7 |
| recozimento-atmosfera | Recozimento com atmosfera controlada | 8 |
| recozimento-sem-atmosfera | Recozimento sem atmosfera | 9 |

---

### **4.5 Tabela: `sequencia_orcamentos`**

Tabela auxiliar para controle da sequência de numeração dos orçamentos.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `ano` | integer | PK | Ano da sequência |
| `ultimo_numero` | integer | NOT NULL, DEFAULT 0 | Último número utilizado |

**Função para gerar próximo número:**

```sql
CREATE OR REPLACE FUNCTION gerar_numero_orcamento()
RETURNS text AS $$
DECLARE
    ano_atual integer;
    proximo_numero integer;
    numero_formatado text;
BEGIN
    ano_atual := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Tenta inserir ou atualizar a sequência
    INSERT INTO sequencia_orcamentos (ano, ultimo_numero)
    VALUES (ano_atual, 1)
    ON CONFLICT (ano) DO UPDATE
    SET ultimo_numero = sequencia_orcamentos.ultimo_numero + 1
    RETURNING ultimo_numero INTO proximo_numero;
    
    -- Formata o número (ex: "2025-0012")
    numero_formatado := ano_atual::text || '-' || LPAD(proximo_numero::text, 4, '0');
    
    RETURN numero_formatado;
END;
$$ LANGUAGE plpgsql;
```

---

### **4.6 Relacionamentos**

```mermaid
erDiagram
    orcamentos ||--o{ orcamento_itens : "tem"
    orcamento_itens ||--o{ orcamento_anexos : "tem"
    processos ||--o{ orcamento_itens : "usado em"
    
    orcamentos {
        uuid id PK
        text numero UNIQUE
        text cliente
        text status
        decimal valor_total
    }
    
    orcamento_itens {
        uuid id PK
        uuid orcamento_id FK
        text codigo_item
        text item
        decimal preco_unitario
        text[] processos
    }
    
    orcamento_anexos {
        uuid id PK
        uuid item_id FK
        text nome_arquivo
        text storage_path
    }
    
    processos {
        uuid id PK
        text codigo UNIQUE
        text nome
    }
    
    sequencia_orcamentos {
        integer ano PK
        integer ultimo_numero
    }
```

**Comportamentos de Deleção (Foreign Keys):**
- **orcamento deletado** → itens deletados automaticamente (CASCADE)
- **item deletado** → anexos deletados automaticamente (CASCADE)
- **anexo deletado** → arquivo removido do Storage (via trigger ou aplicação)

---

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

### **4.9 Row Level Security (RLS)**

**Princípios:**
- Usuários autenticados podem ler todos os dados
- Usuários autenticados podem criar/editar orçamentos
- Configurações podem ser editadas por todos (simplificação inicial)

**Policies para cada tabela:**

```sql
-- orcamentos
CREATE POLICY "Users can view all orcamentos"
  ON orcamentos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create orcamentos"
  ON orcamentos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update orcamentos"
  ON orcamentos FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete orcamentos"
  ON orcamentos FOR DELETE
  USING (auth.role() = 'authenticated');

-- orcamento_itens
CREATE POLICY "Users can view all itens"
  ON orcamento_itens FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage itens"
  ON orcamento_itens FOR ALL
  USING (auth.role() = 'authenticated');

-- orcamento_anexos
CREATE POLICY "Users can view all anexos"
  ON orcamento_anexos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage anexos"
  ON orcamento_anexos FOR ALL
  USING (auth.role() = 'authenticated');

-- processos
CREATE POLICY "Users can view processos"
  ON processos FOR SELECT
  USING (auth.role() = 'authenticated');
```

---

## 📱 **5. FUNCIONALIDADES DETALHADAS**

### **5.1 Autenticação**

**Requisitos:**
- Login com email e senha
- Registro de novos usuários
- Recuperação de senha
- Persistência de sessão
- Logout

**Fluxo de Login:**
1. Usuário acessa `/login`
2. Preenche email e senha
3. Sistema valida credenciais via Supabase Auth
4. Se válido → redireciona para `/orcamentos`
5. Se inválido → mostra mensagem de erro

**Fluxo de Registro:**
1. Usuário acessa `/register`
2. Preenche nome, email e senha
3. Sistema cria conta via Supabase Auth
4. Email de confirmação enviado (opcional)
5. Login automático após registro

**Validações:**
- Email: formato válido
- Senha: mínimo 6 caracteres

**Telas:**
- Página de login (`/login`)
- Página de registro (`/register`)
- (Opcional) Página de recuperação de senha

---

### **5.2 Listagem de Orçamentos**

**Tela: Lista de Orçamentos (`/orcamentos`)**

**Elementos:**

1. **Header da Página:**
   - Título: "📋 Orçamentos"
   - Botão: ➕ Novo Orçamento

2. **Barra de Busca e Filtros:**
   - Input de busca full-text (pesquisa em todos os campos textuais)
   - Select: Filtro por Status
   - Select: Filtro por Cliente
   - Date Range: Filtro por Data de criação
   - Botão: Limpar Filtros

3. **Tabela de Orçamentos:**

| Coluna | Sortável | Conteúdo |
|--------|----------|----------|
| Número | Sim | `numero` (ex: "2025-0012") - clicável, abre visualização |
| Cliente | Sim | `cliente` |
| Status | Sim | Badge colorido com `status` |
| Data | Sim | `created_at` formatado |
| Itens | Não | Dropdown com códigos dos itens (se houver vários) |
| Valor Total | Sim | `valor_total` formatado em R$ |
| Expandir | Não | Botão para expandir/recolher itens do orçamento |
| Ações | Não | Menu dropdown com ações |

#### **Expansão de Itens**

A tabela de orçamentos permite expandir cada linha para visualizar os itens sem navegar para outra página.

**Comportamento:**
- Botão com ícone ChevronDown (recolhido) ou ChevronUp (expandido)
- Múltiplos orçamentos podem estar expandidos simultaneamente
- Itens são carregados sob demanda (lazy loading) ao expandir pela primeira vez
- Cache local evita recarregar itens já buscados
- Click na linha (fora do botão) continua navegando para a página do orçamento

**Dados exibidos na expansão:**

| Campo | Descrição |
|-------|-----------|
| Código | codigo_item do item |
| Descrição | item (nome/descrição) |
| Valor | preco_unitario formatado com unidade (ex: R$ 45,00/kg) |

**Estados visuais:**
- Linha expandida com fundo `bg-muted/50`
- Loading: "Carregando..." enquanto busca itens
- Vazio: "Nenhum item cadastrado" se orçamento não tem itens

4. **Ações por Orçamento:**
   - 👁️ Visualizar
   - ✏️ Editar
   - 📄 Baixar PDF
   - 📋 Duplicar
   - 🔄 Alterar Status (submenu)
   - 🗑️ Excluir (com confirmação)

5. **Scroll Infinito:**
   - Carrega 20 orçamentos inicialmente
   - Carrega mais 20 ao chegar ao final da lista
   - Indicador de carregamento

**Busca Full-Text:**
Pesquisa simultânea em:
- `orcamentos.numero`
- `orcamentos.cliente`
- `orcamentos.contato`
- `orcamentos.observacoes`
- `orcamento_itens.codigo_item`
- `orcamento_itens.item`
- `orcamento_itens.unidade`
- `orcamento_itens.material`
- `orcamento_itens.processos`
- `orcamento_itens.prazo_entrega`

**Implementação da Busca:**
```sql
-- Criar índice de busca full-text
CREATE INDEX idx_orcamentos_search ON orcamentos 
USING GIN (to_tsvector('portuguese', 
  coalesce(numero, '') || ' ' || 
  coalesce(cliente, '') || ' ' || 
  coalesce(contato, '') || ' ' || 
  coalesce(observacoes, '')
));

CREATE INDEX idx_itens_search ON orcamento_itens 
USING GIN (to_tsvector('portuguese', 
  coalesce(codigo_item, '') || ' ' || 
  coalesce(item, '') || ' ' || 
  coalesce(material, '') || ' ' || 
  coalesce(prazo_entrega, '')
));
```

---

### **5.3 Criação/Edição de Orçamento**

**Tela: Criar Orçamento (`/orcamentos/novo`)**
**Tela: Editar Orçamento (`/orcamentos/[id]/editar`)**

**Layout:** Formulário em seções

**Seções:**

#### **Seção 1: Dados do Cliente**

| Campo | Tipo | Obrigatório | Placeholder/Descrição |
|-------|------|-------------|----------------------|
| Cliente | Input texto | ✅ | "Nome do cliente" |
| Contato | Input texto | ❌ | "Nome da pessoa de contato" |

#### **Seção 2: Condições Comerciais**

| Campo | Tipo | Obrigatório | Placeholder/Descrição |
|-------|------|-------------|----------------------|
| Frete | Select + Input | ❌ | Opções: CIF, FOB, ou texto livre |
| Validade | Date Picker | ❌ | Data de validade do orçamento |
| Prazo de Faturamento | Textarea | ❌ | Condicoes de pagamento |
| Observações | Textarea | ❌ | Default carregado das configuracoes |
| Elaborado por | Textarea | ❌ | Default carregado das configuracoes, exibido no PDF |

**Comportamento de Auto-Save:**
- Os campos de Condicoes Comerciais salvam automaticamente ao perder foco (blur)
- Indicador "Salvando..." aparece no cabecalho durante o salvamento automatico

#### **Seção 2.1: Observações Internas**

| Campo | Tipo | Obrigatório | Placeholder/Descrição |
|-------|------|-------------|----------------------|
| Observações Internas | Textarea | ❌ | Anotacoes internas (NAO aparece no PDF) |

#### **Seção 3: Itens do Orçamento**

**Lista de Itens (cards empilhados):**

Cada item é um card expandível com os campos:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Código do Item | Input texto | ✅ | Código identificador |
| Item | Input texto | ✅ | Nome/descrição |
| Unidade | Input texto | ✅ | Un, Kg, Pç, etc. |
| Quantidade | Input número | ✅ | Quantidade (default: 1) |
| Peso Unitário | Input número | ❌ | Peso em kg |
| Preço Unitário | Input moeda | ✅ | Valor em R$ |
| Material | Input texto | ❌ | Material do item |
| Processos | Multi-select | ❌ | Seleção múltipla de processos |
| Prazo de Entrega | Input numero + sufixo | ❌ | Aceita apenas numeros inteiros. Sufixo "dias uteis" exibido automaticamente |

**Ordenação de Processos:**
- Ao salvar um item, os processos selecionados são automaticamente ordenados conforme a hierarquia cadastrada (ordem do drag & drop na tabela de processos)
- A ordenação garante consistência na exibição em todos os lugares (formulário, preview, PDF)
| Faturamento Mínimo | Input texto | ❌ | Valor mínimo |
| Anexos | Upload múltiplo | ❌ | Arquivos relacionados |

**Ações nos Itens:**
- ➕ Adicionar Item
- 📋 Duplicar Item
- 🗑️ Remover Item
- ↕️ Reordenar (drag & drop)

**Cálculos Automáticos:**
- `preco_total` do item = `quantidade` × `preco_unitario`
- `valor_total` do orçamento = soma de todos os `preco_total`

#### **Seção 4: Configurações**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| Ocultar Valor Total | Checkbox | Se marcado, valor não aparece no PDF |
| Status | Select | Status atual do orçamento |

**Ações da Página:**
- 💾 Salvar (valida campos obrigatórios)
- 👁️ Visualizar (abre preview)
- ❌ Cancelar (volta para lista)

**Validações em Tempo Real:**
- Campos obrigatórios destacados em vermelho se vazios
- Bloqueio do botão Salvar se houver erros
- Toast de erro específico para cada validação

---

### **5.4 Visualização do Orçamento**

**Tela: Visualizar Orçamento (`/orcamentos/[id]`)**

**Objetivo:** Mostrar o orçamento exatamente como será exportado em PDF.

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    [LOGO TECNO HARD]                            │
│                    (50% largura, centralizado)                  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                         ORÇAMENTO                               │
│                    (título principal)                           │
│                                                                 │
│                    Cliente: NOME DO CLIENTE                     │
│                    (20% menor que título)                       │
│                                                                 │
│                    Contato: Nome do Contato                     │
│                    (se preenchido)                              │
│                                                                 │
│                    Orçamento Nº: 2025-0012                      │
│                    Validade: 15/12/2025                         │
│                    (se preenchido)                              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ITENS DO ORÇAMENTO                                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Código | Item | Qtd | Un | Preço Un. | Total              │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │ ABC-001 | Peça de aço | 10 | Un | R$ 50,00 | R$ 500,00    │  │
│  │ Material: Aço 1045                                        │  │
│  │ Processos: Têmpera, Revenimento                           │  │
│  │ Prazo: 15 dias                                            │  │
│  │ [Anexos em miniatura 4×3cm]                               │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │ DEF-002 | Eixo temperado | 5 | Pç | R$ 200,00 | R$ 1000   │  │
│  │ ...                                                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INFORMAÇÕES GERAIS                                             │
│  Frete: CIF                                                     │
│  Observações: Texto das observações...                          │
│  (apenas se preenchidos)                                        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                              VALOR TOTAL: R$ 1.500,00           │
│                              (se não ocultado)                  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  R. Emílio Fonini, 521 - Cinquentenário, Caxias do Sul - RS    │
│  (54) 3225-6464 - https://www.tecnohard.ind.br/                │
│  (rodapé fixo)                                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Ações da Página:**
- ✏️ Editar (vai para `/orcamentos/[id]/editar`)
- 📄 Baixar PDF
- 📊 Exportar CSV
- 📊 Exportar Excel
- 🔄 Alterar Status
- 📋 Duplicar
- ⬅️ Voltar para Lista

**Campos que NUNCA aparecem na visualização/PDF:**
- Criado por
- Criado em
- Status
- Última Alteração
- Última Alteração em

**Campos que só aparecem se preenchidos:**
- Contato
- Frete
- Validade
- Observações
- Campos opcionais dos itens (Material, Processos, Prazo, etc.)
- Anexos

---

### **5.5 Geração de PDF**

**Objetivo:** Gerar PDF profissional com layout otimizado para múltiplas páginas.

**Especificações:**

**Cabeçalho (repete em todas as páginas):**
- Número do orçamento no canto superior direito (formato: "Nº: AAAA-NNNN")
- Logo Tecno Hard centralizado (largura 50% da página)
- Dados do cliente centralizados: Nome, Contato, Validade

**Tabela de Itens:**

| Coluna | Largura | Conteúdo |
|--------|---------|----------|
| Item | 42% | codigo_item + " - " + descrição + processos (linha abaixo, fonte menor) |
| Material | 12% | material ou "-" |
| Prazo (dias úteis) | 10% | prazo_entrega numérico |
| Fat. Mín. | 12% | faturamento_minimo formatado ou "-" |
| Peso Un. | 10% | peso_unitario + " kg" ou "-" |
| Preço | 14% | preco_unitario + "/pc" ou "/kg" conforme unidade |

**Estilo da tabela:**
- Cabeçalhos centralizados com fonte 9px
- Células de valores centralizadas com fonte 9px
- Processos exibidos abaixo do item em fonte menor
- Processos ordenados conforme hierarquia cadastrada (ordem do drag & drop)

**Paginação:**
- Logo, número do orçamento e cabeçalho da tabela são elementos `fixed` (repetem em todas as páginas)
- Itens não são cortados entre páginas (`wrap={false}`)
- Numeração de páginas (X/Y) no rodapé, só aparece se documento tiver mais de 1 página

**Informações Gerais:**
- Posicionadas próximo ao rodapé (usa marginTop: auto para empurrar para baixo)
- Frete, Validade, Observações (somente se preenchidos)

**Seção "Elaborado por":**
- Posicionada entre as informações gerais e o rodapé
- Alinhada à direita
- Suporta múltiplas linhas (nome, telefone, email)

**Rodapé (todas as páginas):**
```
R. Emílio Fonini, 521 - Cinquentenário, Caxias do Sul - RS
(54) 3225-6464 - https://www.tecnohard.ind.br/
                                                      1/3  <- só se > 1 página
```

**Configurações do PDF:**
- Formato: A4
- Margens: 2cm
- Fonte: Arial ou similar
- Cores: Neutras (preto, cinza)

---

### **5.6 Exportações**

**Formatos Disponíveis:**

1. **PDF** (layout igual à visualização)
   - Nome do arquivo: `Orcamento-{numero}.pdf`
   - Exemplo: `Orcamento-2025-0012.pdf`

2. **CSV**
   - Nome do arquivo: `Orcamento-{numero}.csv`
   - Campos: Todos os campos do orçamento e itens
   - Codificação: UTF-8 com BOM

3. **Excel (.xlsx)**
   - Nome do arquivo: `Orcamento-{numero}.xlsx`
   - Aba 1: Dados do orçamento
   - Aba 2: Itens do orçamento

---

### **5.7 Gestão de Status**

**Status Disponíveis:**

| Status | Código | Cor | Descrição |
|--------|--------|-----|-----------|
| 📝 Cadastrado | `cadastrado` | Cinza | Recém criado |
| ⏳ Aguardando Informações | `aguardando-informacoes` | Amarelo | Faltam dados |
| 📤 Enviado | `enviado` | Azul | Enviado ao cliente |
| 💬 Em Negociação | `em-negociacao` | Laranja | Em discussão |
| ✅ Aprovado | `aprovado` | Verde | Cliente aprovou |
| ❌ Rejeitado | `rejeitado` | Vermelho | Cliente rejeitou |

**Fluxo de Status:**
- Qualquer status pode mudar para qualquer outro
- Não há workflow obrigatório
- Alteração de status registra `updated_at` e `updated_by`

**Interface de Alteração:**
- Dropdown na tabela
- Botão na página de visualização
- Confirmação antes de alterar

---

### **5.8 Upload de Anexos**

**Requisitos:**

1. **Upload por Item:**
   - Cada item pode ter múltiplos anexos
   - Drag & drop ou seleção de arquivo
   - Preview de imagens
   - Indicador de progresso

2. **Tipos Aceitos:**
   - Imagens: PNG, JPG, JPEG, GIF, WEBP
   - Documentos: PDF
   - Tamanho máximo: 10MB por arquivo

3. **Armazenamento:**
   - Supabase Storage bucket: `orcamento-anexos`
   - Path: `{orcamento_id}/{item_id}/{nome_arquivo}`

4. **Exibição:**
   - Miniaturas na edição
   - Grade de imagens no PDF (4×3 cm)
   - Download disponível

---

### **5.9 Duplicação de Orçamento**

**Fluxo:**
1. Usuário clica "Duplicar" em um orçamento
2. Sistema cria cópia com:
   - Novo número de orçamento (gerado automaticamente)
   - Status: "cadastrado"
   - Todos os campos copiados (exceto número, datas, usuários)
   - Todos os itens copiados
   - Anexos NÃO são copiados (para evitar duplicação de storage)
3. Abre a página de edição do novo orçamento
4. Toast: "Orçamento duplicado com sucesso"

---

### **5.10 Configurações do Sistema**

**Tela: Configurações (`/config`)**

**Objetivo:** Permitir configuracao de parametros globais do sistema.

**Secoes Disponiveis:**

#### **1. Logo da Empresa**
- Upload de imagem (PNG, JPG, WEBP)
- Preview da imagem atual
- Armazenamento no Supabase Storage (bucket: `configuracoes`)
- Tamanho maximo: 10MB

#### **2. Responsavel pelo Orcamento (padrao)**
- Campo textarea multilinha
- Texto usado como valor default em novos orcamentos (campo "Elaborado por")
- Chave na tabela configuracoes: `elaborado_por_default`
- Exemplo: "Jose Adair Giubel\nFone / email: (54) 3218-2168 / email@tecnohard.ind.br"

#### **3. Observacoes Padrao**
- Campo textarea multilinha
- Texto usado como valor default em novos orcamentos (campo "Observacoes")
- Chave na tabela configuracoes: `observacoes_default`
- Exemplo: "O faturamento minimo considera lote de mesmo material e mesma especificacao."

**Comportamento:**
- Campos salvam automaticamente ao perder foco (blur)
- Indicador visual de salvamento
- Valores sao carregados automaticamente ao criar novo orcamento

---

## 🎨 **6. DESIGN E INTERFACE**

### **6.1 Identidade Visual**

**Logotipo:**
- Utilizar o logotipo Tecno Hard fornecido
- Largura: ~50% da página/área
- Alinhamento: centralizado
- Fundo sempre branco
- Proporções originais mantidas
- Aplicado no: cabeçalho do PDF, página de visualização

**Estilo Visual:**
- Layout limpo e comercial
- Paleta neutra (brancos, cinzas claros, toques em azul marinho ou aço)
- Ícones simples e minimalistas
- Tipografia moderna e legível
- Botões discretos, com destaque apenas em ações primárias

### **6.2 Paleta de Cores**

**Cores Principais:**
- Background: `#FFFFFF` (branco)
- Background secundário: `#F8FAFC` (cinza muito claro)
- Cards: `#FFFFFF` com borda `#E2E8F0`
- Texto primário: `#1E293B` (azul escuro/cinza)
- Texto secundário: `#64748B` (cinza)
- Accent: `#1E40AF` (azul marinho)
- Hover: `#1E3A8A` (azul mais escuro)

**Cores de Status:**
- Cadastrado: `#6B7280` (cinza)
- Aguardando: `#F59E0B` (amarelo)
- Enviado: `#3B82F6` (azul)
- Em Negociação: `#F97316` (laranja)
- Aprovado: `#22C55E` (verde)
- Rejeitado: `#EF4444` (vermelho)

### **6.3 Tipografia**

**Fonte:** Inter (system fonts fallback)

**Tamanhos:**
- H1: 24px (bold)
- H2: 20px (semibold)
- H3: 18px (semibold)
- Body: 14px (regular)
- Small: 12px (regular)
- Caption: 11px (regular)

### **6.4 Espaçamentos**

- Usar escala de 4px (4, 8, 12, 16, 24, 32, 48, 64)
- Padding padrão de cards: 16px
- Gap entre elementos: 8px
- Margem entre seções: 24px

### **6.5 Componentes Base (shadcn/ui)**

- Button
- Input
- Select
- Table
- Dialog (Modal)
- Badge
- Card
- Dropdown Menu
- Date Picker
- Checkbox
- Textarea
- Tabs
- Toast

### **6.6 Responsividade**

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Adaptações:**
- Mobile: Tabelas viram cards empilhados
- Mobile: Formulários em coluna única
- Tablet: 2 colunas para formulários
- Desktop: Layout completo

**Expansão de Itens (Mobile):**
- Botão de expansão posicionado no canto superior direito do card, antes do menu de ações
- Itens aparecem em seção colapsável entre o cabeçalho e rodapé do card
- Layout compacto com mini-tabela de itens
- Click no card (fora do botão) continua navegando para o orçamento

**Prioridade:**
- Desktop first (usuários principais usam computador)
- Tablet/mobile como fallback

### **6.7 Animações e Transições**

**Princípios:**
- Suaves e rápidas (200-300ms)
- Easing: ease-in-out
- Feedback visual em interações

**Animações:**
- Hover em botões: scale(1.02)
- Cards: shadow transition
- Modal: fade + slide from top
- Toast: slide from top-right

### **6.8 Estados Visuais**

**Loading:**
- Skeleton screens para tabelas
- Spinner para ações (salvar, exportar)
- Texto: "Carregando..."

**Empty States:**
- Ícone ilustrativo
- Texto descritivo
- Call-to-action (ex: "Criar primeiro orçamento")

**Error States:**
- Border vermelha em campos inválidos
- Mensagem de erro abaixo do campo
- Toast vermelho para erros de API

**Success:**
- Toast verde
- Ícone de check
- Fade out após 3 segundos

---

## 🔐 **7. SEGURANÇA**

### **7.1 Autenticação**

- Supabase Auth (email/senha)
- JWT tokens gerenciados automaticamente
- Refresh token automático
- Logout limpa tokens

### **7.2 Autorização**

- Row Level Security (RLS) no Supabase
- Usuários autenticados podem ler tudo
- Usuários autenticados podem criar/editar
- Sem roles/permissões granulares inicialmente

### **7.3 Validação**

**Client-side:**
- Zod schemas para validar forms
- Validação em tempo real (onChange)
- Mensagens de erro claras

**Server-side:**
- Validação no Supabase via constraints
- CHECK constraints para status
- NOT NULL para campos obrigatórios
- Foreign Keys para integridade referencial

### **7.4 Storage**

- Bucket privado (requer autenticação)
- Limite de tamanho por arquivo: 10MB
- Tipos de arquivo permitidos validados
- Path estruturado por orçamento/item

---

## 🔄 **8. SINCRONIZAÇÃO E PERFORMANCE**

### **8.1 Estratégia de Cache**

- React Query para cache de dados
- Revalidação em foco de janela
- Invalidação após mutations

### **8.2 Otimizações de Banco**

**Índices criados:**
- Ver seção 4 (Modelo de Dados)
- Índices full-text para busca

**Queries otimizadas:**
- SELECT específico (não SELECT *)
- LIMIT para paginação
- JOINs eficientes

### **8.3 Otimizações de Frontend**

**Next.js:**
- Server Components para dados estáticos
- Client Components apenas onde necessário
- Lazy loading de componentes pesados

**React:**
- Memoização de componentes (React.memo)
- useMemo para cálculos pesados
- useCallback para funções

**Imagens:**
- Next/Image para otimização automática
- Lazy loading
- Thumbnails para anexos

---

## 🚀 **9. ROADMAP DE IMPLEMENTAÇÃO**

### **Fase 1: Infraestrutura (Semana 1)**

**Objetivo:** Setup inicial completo

**Tarefas:**
1. [ ] Criar projeto Next.js + TypeScript
2. [ ] Configurar Tailwind + shadcn/ui
3. [ ] Conectar Supabase (client + server + storage)
4. [ ] Criar schema do banco (todas tabelas)
5. [ ] Configurar RLS policies
6. [ ] Seed inicial (processos)
7. [ ] Setup de tipos TypeScript
8. [ ] Estrutura de pastas completa

**Entregáveis:**
- Projeto rodando localmente
- Banco de dados estruturado
- Tipos TypeScript funcionando

---

### **Fase 2: Autenticação (Semana 1)**

**Objetivo:** Sistema de login funcionando

**Tarefas:**
1. [ ] Página de login
2. [ ] Página de registro
3. [ ] Integração com Supabase Auth
4. [ ] Middleware de autenticação
5. [ ] Logout
6. [ ] Persistência de sessão

**Entregáveis:**
- Usuários podem se registrar e fazer login
- Rotas protegidas funcionando

---

### **Fase 3: Listagem de Orçamentos (Semana 2)**

**Objetivo:** Visualizar e filtrar orçamentos

**Tarefas:**
1. [ ] Página de lista de orçamentos
2. [ ] Tabela responsiva
3. [ ] Filtros (status, cliente, data)
4. [ ] Busca full-text
5. [ ] Ordenação de colunas
6. [ ] Scroll infinito
7. [ ] Ações (visualizar, editar, excluir)
8. [ ] Hook: useOrcamentos

**Entregáveis:**
- Lista de orçamentos funcionando
- Filtros e busca operacionais

---

### **Fase 4: Criação/Edição de Orçamentos (Semana 2-3)**

**Objetivo:** CRUD completo de orçamentos

**Tarefas:**
1. [ ] Formulário de orçamento
2. [ ] Gerenciamento de itens (CRUD)
3. [ ] Cálculos automáticos (totais)
4. [ ] Validações em tempo real
5. [ ] Geração automática de número
6. [ ] Controle de status
7. [ ] Rastreamento de alterações
8. [ ] Hook: useOrcamento, useItens

**Entregáveis:**
- Criar e editar orçamentos
- Itens com cálculos automáticos

---

### **Fase 5: Upload de Anexos (Semana 3)**

**Objetivo:** Gerenciar anexos dos itens

**Tarefas:**
1. [ ] Configurar Supabase Storage
2. [ ] Componente de upload
3. [ ] Preview de imagens
4. [ ] Lista de anexos por item
5. [ ] Download de anexos
6. [ ] Exclusão de anexos
7. [ ] Hook: useAnexos

**Entregáveis:**
- Upload e download funcionando
- Anexos vinculados aos itens

---

### **Fase 6: Visualização e PDF (Semana 4)**

**Objetivo:** Layout profissional de exportação

**Tarefas:**
1. [ ] Página de visualização
2. [ ] Layout idêntico ao PDF
3. [ ] Geração de PDF (react-pdf)
4. [ ] Integração de logo
5. [ ] Anexos em miniatura
6. [ ] Regras de ocultação
7. [ ] Download de PDF

**Entregáveis:**
- Visualização profissional
- PDF gerado corretamente

---

### **Fase 7: Exportações e Ações (Semana 4)**

**Objetivo:** Funcionalidades adicionais

**Tarefas:**
1. [ ] Exportação CSV
2. [ ] Exportação Excel
3. [ ] Duplicação de orçamento
4. [ ] Alteração de status em lote
5. [ ] Confirmações de exclusão

**Entregáveis:**
- Todas exportações funcionando
- Ações de gestão completas

---

### **Fase 8: Polimento (Semana 5)**

**Objetivo:** UX e performance

**Tarefas:**
1. [ ] Loading states
2. [ ] Empty states
3. [ ] Error handling
4. [ ] Responsividade mobile
5. [ ] Acessibilidade (ARIA)
6. [ ] Otimizações de performance
7. [ ] Testes manuais

**Entregáveis:**
- Sistema polido
- UX excelente

---

### **Fase 9: Deploy (Semana 5)**

**Objetivo:** Sistema em produção

**Tarefas:**
1. [ ] Configurar Vercel
2. [ ] Variáveis de ambiente
3. [ ] Deploy
4. [ ] Testes em produção
5. [ ] Upload de logo definitivo

**Entregáveis:**
- Sistema acessível via URL
- Pronto para uso real

---

## 📚 **10. DOCUMENTAÇÃO**

### **10.1 README do Projeto**

Criar `README.md` com:
- Descrição do projeto
- Stack técnico
- Como rodar localmente
- Como fazer deploy
- Estrutura de pastas
- Variáveis de ambiente

### **10.2 Comentários no Código**

**Padrões:**
- Funções complexas: JSDoc com @param, @returns
- Componentes: Comentário descrevendo propósito
- Hooks: Explicar quando usar

### **10.3 Tipos TypeScript**

**Exportar tipos principais:**
```typescript
// lib/types/database.ts (gerado do Supabase)
export type Orcamento = Database['public']['Tables']['orcamentos']['Row']
export type OrcamentoItem = Database['public']['Tables']['orcamento_itens']['Row']
export type OrcamentoAnexo = Database['public']['Tables']['orcamento_anexos']['Row']
export type Processo = Database['public']['Tables']['processos']['Row']

// lib/types/app.ts (tipos da aplicação)
export interface OrcamentoWithItems extends Orcamento {
  itens: OrcamentoItemWithAnexos[]
}

export interface OrcamentoItemWithAnexos extends OrcamentoItem {
  anexos: OrcamentoAnexo[]
}

export type OrcamentoStatus = 
  | 'cadastrado' 
  | 'aguardando-informacoes' 
  | 'enviado' 
  | 'em-negociacao' 
  | 'aprovado' 
  | 'rejeitado'
```

---

## 🧪 **11. TESTES (OPCIONAL)**

**Nota:** Testes não são obrigatórios no MVP.

**Estratégia sugerida:**
- Testes unitários: Funções de formatação, cálculos
- Testes de integração: Fluxos críticos (criar orçamento, exportar PDF)
- Testes E2E: Playwright para fluxos completos

---

## 📞 **12. SUPORTE E MANUTENÇÃO**

### **12.1 Monitoramento**

**Logs:**
- Console.log para desenvolvimento
- Sentry (opcional) para produção

**Métricas:**
- Vercel Analytics (gratuito)
- Supabase Dashboard

### **12.2 Backup**

**Supabase:**
- Backups automáticos diários
- Point-in-time recovery disponível

---

## 🎯 **13. CRITÉRIOS DE SUCESSO**

### **13.1 Funcional**

✅ Todas as funcionalidades implementadas:
1. Autenticação
2. Listagem com filtros e busca
3. Criação/Edição de orçamentos
4. Gestão de itens e anexos
5. Visualização profissional
6. Exportação PDF/CSV/Excel
7. Gestão de status

### **13.2 Performance**

✅ Carregamento inicial < 3s
✅ Geração de PDF < 5s
✅ Busca < 1s

### **13.3 Manutenibilidade**

✅ Código bem organizado
✅ Tipos TypeScript completos
✅ Componentes reutilizáveis
✅ Comentários claros

### **13.4 Usabilidade**

✅ Interface intuitiva
✅ Responsiva (desktop, tablet, mobile)
✅ Feedback visual claro
✅ PDF profissional

---

## 📝 **14. CONSIDERAÇÕES FINAIS**

### **14.1 Prioridades**

**1. Manutenibilidade** (mais importante)
- Código limpo e autodocumentado
- Arquitetura clara
- Fácil de modificar

**2. Usabilidade**
- Interface limpa e comercial
- Fluxo simples
- PDF profissional

**3. Segurança**
- RLS configurado
- Validações completas
- Storage seguro

**4. Performance**
- Importante mas não prioritária
- Otimizações básicas suficientes

### **14.2 Fora do Escopo (MVP)**

**Funcionalidades NÃO incluídas:**
- ❌ Controle de acesso granular
- ❌ Logs detalhados
- ❌ Histórico de versões
- ❌ Workflow de aprovação
- ❌ Assinatura eletrônica
- ❌ Envio automático por email
- ❌ Dashboard/relatórios

**Podem ser adicionadas futuramente.**

---

## 📋 **15. CHECKLIST DE IMPLEMENTAÇÃO**

**Para a IA de Desenvolvimento:**

### **Setup Inicial**
- [ ] Criar projeto Next.js 14+ com TypeScript
- [ ] Instalar dependências (Tailwind, shadcn/ui, react-pdf, etc)
- [ ] Conectar Supabase via MCP
- [ ] Criar todas as tabelas no Supabase
- [ ] Configurar Storage bucket
- [ ] Configurar RLS policies
- [ ] Seed de processos iniciais
- [ ] Gerar tipos TypeScript
- [ ] Adicionar logo Tecno Hard

### **Autenticação**
- [ ] Páginas de login e registro
- [ ] Integração Supabase Auth
- [ ] Middleware de rotas protegidas
- [ ] Logout funcionando

### **Orçamentos**
- [ ] Lista de orçamentos
- [ ] Filtros e busca full-text
- [ ] Scroll infinito
- [ ] Formulário de criação/edição
- [ ] Gerenciamento de itens
- [ ] Cálculos automáticos
- [ ] Geração de número
- [ ] Controle de status

### **Anexos**
- [ ] Upload para Storage
- [ ] Preview de imagens
- [ ] Download
- [ ] Exclusão

### **Visualização e Exportação**
- [ ] Página de visualização
- [ ] Geração de PDF
- [ ] Exportação CSV
- [ ] Exportação Excel
- [ ] Duplicação

### **Polimento**
- [ ] Responsividade
- [ ] Loading states
- [ ] Empty states
- [ ] Error handling

### **Deploy**
- [ ] Configurar Vercel
- [ ] Variáveis de ambiente
- [ ] Deploy
- [ ] Testes em produção

---

## 🎓 **16. REFERÊNCIAS**

### **Documentação Oficial**
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- TypeScript: https://www.typescriptlang.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com
- react-pdf: https://react-pdf.org

### **Supabase Storage**
- Storage Guide: https://supabase.com/docs/guides/storage

### **Next.js + Supabase**
- Quickstart: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Auth Helpers: https://supabase.com/docs/guides/auth/auth-helpers/nextjs

---

## ✅ **17. APROVAÇÃO**

**Status do PRD:** ✅ APROVADO PARA DESENVOLVIMENTO

**Aprovado por:** [Pendente]  
**Data:** 28 de Novembro de 2025



**FIM DO PRD** 🚀

