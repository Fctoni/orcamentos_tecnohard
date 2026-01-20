# 📋 Alterações Necessárias no PRD - Alteração 14

**Data:** 13/01/2026  
**Referência:** `alteracao14.md`

---

## 📊 RESUMO DAS ALTERAÇÕES

| # | Alteração | Seções Afetadas |
|---|-----------|-----------------|
| 1 | Sistema de Roles e Permissões de Usuários | 4.29, 4.30 (NOVAS), 5.3 (NOVA), 8.4 |
| 2 | Sistema de Notificações In-App | 4.31, 4.32, 4.33 (NOVAS), 7.17, 8.4 |
| 3 | Comprovante de Entrega em Venda de Peças | 4.34 (NOVA), 4.13, 7.6 |
| 4 | Preço Unitário em Venda de Amarrados | 4.11, 7.7 |
| 5 | Importação Excel - Validações Bloqueantes | 10.2 |
| 6 | Canvas - Limites e Permissões | 7.2, 5.3 |
| 7 | Transferências - Status Caminhão e Capacidade | 7.14, 10.3 |
| 8 | Cancelamento de Produção - Estorno Total | 7.8, 10.2 |
| 9 | Status Unificado em Venda de Peças | 7.6, 10.3 |
| 10 | Modal de Edição de Pedidos | 7.6, 7.8 |
| 11 | IDs de Amarrados - Formato Estendido | 10.5 |
| 12 | Estrutura de Pastas | 3.1 |
| 13 | Atualizar changelog e versão | Header |

---

## 🔧 ALTERAÇÃO 1: Sistema de Roles e Permissões

### **4.29 Tabela: `user_roles`**

**Adicionar após 4.28:**

Controle de roles de usuários para permissões no sistema.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | ID único |
| `user_id` | uuid | FK(auth.users.id) ON DELETE CASCADE, UNIQUE | ID do usuário |
| `role` | text | CHECK | Role do usuário |
| `created_at` | timestamptz | DEFAULT now() | Data de criação |
| `updated_at` | timestamptz | DEFAULT now() | Última atualização |
| `updated_by` | uuid | FK(auth.users.id), NULL | Quem alterou o role |

**CHECK Constraint:**
```sql
CHECK (role IN ('admin', 'Fiscal_TecnoHard', 'Fiscal_Forjas', 'PCP_TecnoHard', 'PCP_Forjas'))
```

**Índices:**
- `idx_user_roles_user_id` (user_id)

**Nota:** Usuários sem registro nesta tabela são redirecionados para página de "Aguardando Autorização".

---

### **5.3 Políticas Especiais - Sistema de Roles (NOVA SEÇÃO)**

**Adicionar após 5.2:**

```sql
-- Função para verificar se usuário é admin (SECURITY DEFINER para evitar recursão)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Políticas RLS da tabela `user_roles`:**

| Política | Comando | Condição |
|----------|---------|----------|
| Users can view own role | SELECT | `user_id = auth.uid()` |
| Admins can view all roles | SELECT | `is_admin()` |
| Admins can update roles | UPDATE | `is_admin()` |
| Admins can insert roles | INSERT | `is_admin()` |
| Admins can delete roles | DELETE | `is_admin()` |

**Políticas RLS da tabela `areas`:**

| Política | Comando | Condição |
|----------|---------|----------|
| Authenticated users can read areas | SELECT | `true` |
| Only admins can modify areas | INSERT/UPDATE/DELETE | `is_admin()` |

**Página de Gerenciamento (`/config/usuarios`):**
- Acesso restrito a admins
- Lista todos os usuários do sistema
- Permite definir/alterar/remover roles
- Usuários sem role são bloqueados via `proxy.ts`

---

### **8.4 Menu Configurações (ATUALIZAR)**

**Substituir por:**

```
⚙️ Configurações
  ├── Materiais/Ligas
  ├── Clientes
  ├── Fornecedores
  ├── Produtos (Peças)
  ├── Endereços de Estoque
  ├── Usuários Sistema     ← NOVO (só admin)
  ├── Notificações         ← NOVO (só admin)
  └── Log de Auditoria
```

---

## 🔧 ALTERAÇÃO 2: Sistema de Notificações In-App

### **4.30 Tabela: `config_notificacoes`**

Configuração de quais transições de status geram notificações.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | ID único |
| `modulo` | text | NOT NULL | Módulo: 'venda_pecas', 'venda_amarrados', 'producao' |
| `status_de` | text | NULL | Status origem (NULL = qualquer) |
| `status_para` | text | NOT NULL | Status destino |
| `roles_notificados` | text[] | NOT NULL | Array de roles a notificar |
| `mensagem_template` | text | NULL | Template da mensagem (ex: "Pedido #{numero} criado") |
| `ativo` | boolean | DEFAULT true | Se a regra está ativa |
| `created_at` | timestamptz | DEFAULT now() | Data de criação |

**Índices:**
- `idx_config_notificacoes_modulo` (modulo)

---

### **4.31 Tabela: `notificacoes`**

Notificações geradas (compartilhadas por role).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | ID único |
| `titulo` | text | NOT NULL | Título da notificação |
| `mensagem` | text | NOT NULL | Mensagem completa |
| `link` | text | NULL | URL para navegar ao clicar |
| `roles_destino` | text[] | NOT NULL | Roles que devem ver |
| `resolvida` | boolean | DEFAULT false | Se foi resolvida |
| `resolvida_por` | uuid | FK(auth.users.id), NULL | Quem resolveu |
| `resolvida_em` | timestamptz | NULL | Quando foi resolvida |
| `created_at` | timestamptz | DEFAULT now() | Data de criação |

**Comportamento:** Notificação resolvida por um usuário desaparece para todos do mesmo role.

---

### **4.32 Tabela: `notificacoes_lidas`**

Controle de quem já viu (mas não resolveu) a notificação.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `notificacao_id` | uuid | FK(notificacoes.id) ON DELETE CASCADE | Notificação |
| `user_id` | uuid | FK(auth.users.id) ON DELETE CASCADE | Usuário |
| `lida_em` | timestamptz | DEFAULT now() | Quando foi lida |

**Primary Key:** (notificacao_id, user_id)

---

### **7.17 Sistema de Notificações In-App (NOVA SEÇÃO)**

**Adicionar após 7.16:**

Sistema de notificações internas para alertar usuários sobre mudanças de status.

#### **7.17.1 Componentes**

| Componente | Localização | Descrição |
|------------|-------------|-----------|
| 🔔 Badge no Header | Todas as páginas | Ícone de sino com contador de não lidas |
| Dropdown de Notificações | Header | Lista de notificações pendentes |
| Página de Configuração | `/config/notificacoes` | Criação/edição de regras (só admin) |

#### **7.17.2 Fluxo de Notificação**

```
Usuário altera status de pedido
  → Hook verifica config_notificacoes
  → Se há regra ativa para essa transição:
    → Cria registro em `notificacoes` para os roles configurados
  → Usuários dos roles veem notificação no sino
  → Usuário clica "Resolver" → notificação some para todos do role
```

#### **7.17.3 Ações Disponíveis**

| Ação | Descrição |
|------|-----------|
| Marcar como lida | Individual - apenas marca que o usuário viu |
| Resolver | Remove notificação para todos do role |
| Clicar na notificação | Navega para página relacionada |

#### **7.17.4 Módulos Integrados**

| Módulo | Eventos que geram notificação |
|--------|------------------------------|
| `venda_pecas` | Criação de pedido, transições de status |
| `venda_amarrados` | Criação de pedido, transições de status |
| `producao` | Criação de pedido, envio, recebimento, cancelamento |

---

## 🔧 ALTERAÇÃO 3: Comprovante de Entrega

### **4.33 Tabela: `comprovantes_entrega`**

Fotos e documentos de comprovante de entrega.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | ID único |
| `pedido_id` | uuid | FK(pedidos_venda_pecas.id) ON DELETE CASCADE, NOT NULL | Pedido |
| `arquivo_url` | text | NOT NULL | URL do arquivo no storage |
| `arquivo_nome` | text | NOT NULL | Nome original do arquivo |
| `created_at` | timestamptz | DEFAULT now() | Data de upload |
| `created_by` | uuid | FK(auth.users.id), NULL | Quem fez upload |

**Storage:** Bucket `comprovantes-entrega` com políticas de upload e leitura para autenticados.

---

### **4.13 Tabela: `pedidos_venda_pecas` (ATUALIZAR)**

**Adicionar colunas:**

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `nome_recebedor` | text | NULL | Nome de quem recebeu a entrega |
| `observacoes_entrega` | text | NULL | Observações sobre a entrega |

---

### **7.6 Pedido de Venda de Peças (ADICIONAR)**

#### **7.6.6 Modal de Comprovante de Entrega**

Ao clicar em "Marcar como Entregue", abre modal obrigatório:

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Fotos do canhoto/carga | Upload múltiplo | ✅ (mínimo 1) |
| Data de entrega | Date | ❌ (default: hoje) |
| Nome do recebedor | Text | ❌ |
| Observações | Textarea | ❌ |

**Funcionalidades:**
- Drag & drop ou clique para selecionar
- Preview das imagens com opção de remover
- Upload para bucket `comprovantes-entrega`
- Após confirmar, status muda para "Entregue"

---

## 🔧 ALTERAÇÃO 4: Preço em Venda de Amarrados

### **4.11 Tabela: `itens_pedido_venda_amarrados` (ATUALIZAR)**

**Adicionar coluna:**

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `preco_unitario` | numeric | NULL | Preço por kg em R$ |

---

### **7.7 Pedido de Venda de Amarrados (ADICIONAR)**

#### **7.7.X Informações Financeiras**

**No modal de criação:**
- Campo "Preço/kg (R$)" ao adicionar item (opcional)
- Coluna "Valor" = Peso × Preço/kg
- Total de valor no rodapé

**No modal de detalhes:**
- Card "Valor Total" no resumo
- Colunas "Preço/kg" e "Valor" na tabela de itens

---

## 🔧 ALTERAÇÃO 5: Importação Excel - Validações

### **10.2 Validações (ADICIONAR)**

| Regra | Ação |
|-------|------|
| Liga não cadastrada na importação Excel | **BLOQUEIA** importação (não cria liga automaticamente) |
| ID de amarrado já existente na importação Excel | **BLOQUEIA** importação (não atualiza amarrado existente) |

**Mensagens:**
- Liga: "Liga 'X' não cadastrada. Cadastre antes de importar."
- ID: "ID 'X' já existe no sistema. Remova do Excel ou altere o ID."

---

## 🔧 ALTERAÇÃO 6: Canvas - Limites e Permissões

### **7.2.2 Configurações do React Flow (ATUALIZAR)**

**Adicionar:**

```jsx
<ReactFlow
  translateExtent={[[-2000, -2000], [6000, 6000]]}  // Limita navegação
  nodeExtent={[[-1500, -1500], [5500, 5500]]}       // Limita posição dos nós
  // ... outras props
>
```

**Bloqueio de Áreas:**
- Apenas usuários com role `admin` podem editar/mover/redimensionar áreas
- Botão de toggle de bloqueio visível apenas para admins
- Não-admins: áreas sempre bloqueadas
- Segurança garantida por RLS na tabela `areas`

---

## 🔧 ALTERAÇÃO 7: Transferências

### **10.3 Status Automáticos (ATUALIZAR)**

**Adicionar:**

| Evento | Mudança de Status |
|--------|-------------------|
| Transferência Filial → Matriz | Status amarrado → "Caminhão" |
| Transferência Matriz → Filial | Status amarrado → "Estoque Ativo" |

---

### **7.14 Outras Funcionalidades (ADICIONAR)**

**Transferências - Capacidade do Caminhão:**

No modal de nova transferência:
- Capacidade máxima: **32.000 kg** (hardcoded)
- Barra de progresso visual mostrando peso atual vs capacidade
- Cores: verde (ok), amarelo (>90%), vermelho (excedido)
- **Bloqueia transferência** se peso total exceder capacidade
- Alerta visual quando capacidade excedida

---

## 🔧 ALTERAÇÃO 8: Cancelamento de Produção

### **7.8.X Cancelamento de Pedido de Produção (ADICIONAR)**

A função de cancelamento **sempre estorna**, independente do status:

| Status | Ação de Estorno |
|--------|-----------------|
| Criado | Apenas cancela (sem estorno) |
| Em Producao, Aguardando Confirmacao | Devolve barras/peso aos amarrados |
| Recebido | Devolve barras/peso + remove peças do estoque + registra histórico (tipo: Saida, origem: Estorno) |

**Se amarrado estava "Zerado":** Status volta para "Estoque Ativo"

---

### **10.2 Validações (ADICIONAR)**

| Regra | Ação |
|-------|------|
| Cancelamento de produção após recebimento | Estorna estoque de peças e registra histórico |

---

## 🔧 ALTERAÇÃO 9: Status Unificado em Venda de Peças

### **7.6.1 Ciclo de Vida do Pedido de Venda de Peças (ATUALIZAR)**

**Status "Aguardando Producao" REMOVIDO.** Fluxo simplificado:

```
Aguardando → Em Separação → Separado → Aguardando Entrega → Entregue
    ↓            ↓             ↓
Cancelado    Cancelado     Cancelado
```

**Justificativa:** Status "Aguardando Producao" não tinha transição automática e gerava confusão. Todos os pedidos agora iniciam em "Aguardando".

---

## 🔧 ALTERAÇÃO 10: Modal de Edição de Pedidos

### **7.8.X Edição de Pedido de Produção (ADICIONAR)**

Pedidos com status **"Criado"** podem ser editados:

| Campo | Editável |
|-------|----------|
| Data de previsão | ✅ |
| Observações | ✅ |
| Itens/Quantidades | ❌ (cancelar e recriar) |

Botão de edição (ícone lápis) aparece apenas para status "Criado".

---

### **7.6.X Edição de Pedido de Venda de Peças (ADICIONAR)**

Pedidos com status **"Aguardando"** podem ser editados:

| Campo | Editável |
|-------|----------|
| Data de entrega prevista | ✅ |
| Ordem de compra (OC) | ✅ |
| Cliente | ❌ (somente leitura) |
| Itens | ❌ (cancelar e recriar) |

Botão de edição (ícone lápis) aparece apenas para status "Aguardando".

---

## 🔧 ALTERAÇÃO 11: IDs de Amarrados - Formato Estendido

### **10.5.2 ID do Amarrado na Importação (ATUALIZAR)**

**Substituir por:**

- Formato: **1-2 letras + 2 dígitos** (ex: J01, J02, AA01, AB15)
- Aceita IDs com prefixo de 2 letras para maior flexibilidade
- Validação: regex `/^[A-Z]{1,2}\d{2}$/`
- Máximo: 99 amarrados por prefixo (01-99)

---

## 🔧 ALTERAÇÃO 12: Estrutura de Pastas

### **3.1 Estrutura de Pastas (ADICIONAR)**

```
├── (dashboard)/
│   ├── config/
│   │   ├── usuarios/           ← NOVO: Gerenciamento de roles
│   │   │   └── page.tsx
│   │   └── notificacoes/       ← NOVO: Config de notificações
│   │       └── page.tsx
│   └── aguardando-autorizacao/ ← NOVO: Tela para usuários sem role
│       └── page.tsx
├── lib/
│   ├── hooks/
│   │   ├── useUserRole.ts      ← NOVO: Hook de verificação de role
│   │   └── useNotificacoes.ts  ← NOVO: Hook de notificações
│   └── utils/
│       └── notificacoes.ts     ← NOVO: Função utilitária de criação
├── components/
│   └── layout/
│       └── notifications-dropdown.tsx  ← NOVO: Dropdown do sino
```

---

## 🔧 ALTERAÇÃO 13: Header - Changelog e Versão

**Atualizar tabela de informações do documento:**

| Campo | Valor |
|-------|-------|
| **Versão do PRD** | 2.11 |
| **Última Atualização** | 13/01/2026 |

**Adicionar ao início do Changelog:**

```
v2.11: Sistema de Permissões e Notificações - nova tabela `user_roles` com roles (admin, Fiscal_TecnoHard, Fiscal_Forjas, PCP_TecnoHard, PCP_Forjas). Função `is_admin()` com SECURITY DEFINER. Páginas `/config/usuarios` e `/config/notificacoes` restritas a admins. Sistema de notificações in-app configurável por transição de status, com notificações compartilhadas por role. Novo bucket `comprovantes-entrega` com modal de upload múltiplo ao marcar entrega. Campo `preco_unitario` em venda de amarrados. Importação Excel agora BLOQUEIA se liga não cadastrada ou ID existente (não cria/atualiza automaticamente). Canvas com limites de área navegável e edição de áreas restrita a admins. Transferência filial→matriz define status "Caminhão". Modal de transferência com limite de 32.000 kg. Cancelamento de produção estorna estoque mesmo após "Recebido". Status "Aguardando Producao" removido de venda de peças. Modais de edição para pedidos de produção (status Criado) e venda de peças (status Aguardando). IDs de amarrados aceitam 2 letras (AA01, AB02).
```

---

## ✅ CHECKLIST DE ATUALIZAÇÃO

### Tabelas (Seção 4)
- [ ] 4.11: Adicionar coluna `preco_unitario` em `itens_pedido_venda_amarrados`
- [ ] 4.13: Adicionar colunas `nome_recebedor` e `observacoes_entrega` em `pedidos_venda_pecas`
- [ ] 4.29: Criar tabela `user_roles`
- [ ] 4.30: Criar tabela `config_notificacoes`
- [ ] 4.31: Criar tabela `notificacoes`
- [ ] 4.32: Criar tabela `notificacoes_lidas`
- [ ] 4.33: Criar tabela `comprovantes_entrega`

### Segurança (Seção 5)
- [ ] 5.3: Adicionar seção de políticas especiais para roles
- [ ] Documentar função `is_admin()`
- [ ] Documentar RLS de `user_roles`
- [ ] Documentar RLS de `areas`

### Módulos (Seção 7)
- [ ] 7.2: Atualizar configurações do React Flow (limites e permissões)
- [ ] 7.6: Adicionar modal de comprovante de entrega e modal de edição
- [ ] 7.6: Atualizar ciclo de vida (remover "Aguardando Producao")
- [ ] 7.7: Adicionar informações financeiras
- [ ] 7.8: Adicionar modal de edição e regras de cancelamento
- [ ] 7.14: Adicionar capacidade do caminhão em transferências
- [ ] 7.17: Criar seção de sistema de notificações

### Navegação (Seção 8)
- [ ] 8.4: Atualizar menu de configurações

### Regras de Negócio (Seção 10)
- [ ] 10.2: Adicionar validações de importação (liga e ID)
- [ ] 10.2: Adicionar validação de cancelamento de produção
- [ ] 10.3: Adicionar status automáticos de transferência
- [ ] 10.5.2: Atualizar formato de ID de amarrado

### Estrutura (Seção 3)
- [ ] 3.1: Adicionar novas páginas e arquivos

### Header
- [ ] Atualizar versão para 2.11
- [ ] Atualizar data para 13/01/2026
- [ ] Adicionar changelog v2.11

---

## 📝 NOTAS DA VERIFICAÇÃO

**Verificações realizadas no PRD atual (v2.9):**

| Item | Status | Observação |
|------|--------|------------|
| Tabela `user_roles` | ❌ | Não existe, precisa criar |
| Tabela `config_notificacoes` | ❌ | Não existe, precisa criar |
| Tabela `notificacoes` | ❌ | Não existe, precisa criar |
| Tabela `comprovantes_entrega` | ❌ | Não existe, precisa criar |
| Seção 5.3 (Políticas Especiais Roles) | ❌ | Não existe, precisa criar |
| Seção 7.17 (Notificações) | ❌ | Não existe, precisa criar |
| Campo `preco_unitario` em venda amarrados | ❌ | Não existe, precisa adicionar |
| Status "Aguardando Producao" | ✅ | Existe, precisa REMOVER |
| Limites do canvas | ❌ | Não documentado, precisa adicionar |
| Capacidade caminhão | ❌ | Não existe, precisa adicionar |
| Formato ID 2 letras | ❌ | Não existe, precisa atualizar |

---

## 🐛 BUGS CORRIGIDOS (Documentação Complementar)

As seguintes correções de bugs foram implementadas e devem ser consideradas como comportamento esperado:

| Bug | Correção |
|-----|----------|
| Modal reservar estoque - '0' não sumindo | Input mostra vazio quando valor é 0 |
| Refresh em páginas ao fechar modais | Dados recarregados automaticamente |
| Decimal no campo comprimento de produtos | Mostra decimal só quando existe (27 vs 135,5) |
| Color picker não atualizando | Inputs color e text sincronizam corretamente |
| Múltiplas linhas mesmo produto no recebimento | Agrupa antes do UPSERT (soma quantidades) |
| Filtro de produtos no modal novo pedido | Campo de busca por código, descrição, código cliente |
| Modal finalizar produção não atualizava | Busca status diretamente do banco |
