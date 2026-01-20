# 📘 Manual do Usuário - Sistema de Orçamentos Tecno Hard

Bem-vindo ao Sistema de Orçamentos da Tecno Hard! Este manual irá guiá-lo através de todas as funcionalidades do sistema.

---

## 📋 Índice

1. [Acesso ao Sistema](#1-acesso-ao-sistema)
2. [Tela Principal - Lista de Orçamentos](#2-tela-principal---lista-de-orçamentos)
3. [Criar Novo Orçamento](#3-criar-novo-orçamento)
4. [Adicionar Itens ao Orçamento](#4-adicionar-itens-ao-orçamento)
5. [Fazer Upload de Anexos](#5-fazer-upload-de-anexos)
6. [Visualizar Orçamento](#6-visualizar-orçamento)
7. [Baixar PDF do Orçamento](#7-baixar-pdf-do-orçamento)
8. [Gerenciar Status](#8-gerenciar-status)
9. [Editar Orçamento](#9-editar-orçamento)
10. [Duplicar e Excluir Orçamentos](#10-duplicar-e-excluir-orçamentos)
11. [Operações em Lote](#11-operações-em-lote)

---

## 1. Acesso ao Sistema

### Como fazer login

1. Acesse o sistema pelo navegador
2. Na tela de login, informe:
   - **Email:** seu email cadastrado
   - **Senha:** sua senha
3. Clique no botão **"Entrar"**

> 💡 **Dica:** Você pode clicar no ícone do olho (👁️) para visualizar a senha enquanto digita.

Após o login, você será redirecionado automaticamente para a lista de orçamentos.

---

## 2. Tela Principal - Lista de Orçamentos

A tela principal exibe todos os orçamentos cadastrados no sistema em formato de tabela.

### Colunas da tabela

| Coluna | Descrição |
|--------|-----------|
| ☑️ | Checkbox para seleção (operações em lote) |
| **Número** | Código do orçamento (ex: 2025-0012) |
| **Cliente** | Nome do cliente |
| **Status** | Situação atual do orçamento |
| **Data** | Data de criação |
| **Valor Total** | Soma dos valores de todos os itens |
| **Ações** | Menu com opções (⋮) |

### Barra de busca e filtros

Na parte superior da lista você encontra:

- **🔍 Campo de busca:** Pesquise por número, cliente, código do item ou descrição
- **Filtro de Status:** Selecione para ver apenas orçamentos de um status específico
- **Botão Limpar:** Remove todos os filtros aplicados

### Ordenação

Clique nos cabeçalhos das colunas para ordenar:
- Clique uma vez: ordem crescente (↑)
- Clique novamente: ordem decrescente (↓)

### Navegação

- A lista possui **scroll infinito** - ao rolar até o final, mais orçamentos são carregados automaticamente
- Em **dispositivos móveis**, os orçamentos são exibidos como cards para melhor visualização

---

## 3. Criar Novo Orçamento

### Passo a passo

1. Na tela de lista, clique no botão **"+ Novo Orçamento"**
2. Preencha os dados do cliente:
   - **Cliente** (obrigatório): Nome da empresa/pessoa
   - **Contato**: Nome da pessoa de contato

> ✨ **Auto-salvamento:** Ao sair do campo "Cliente", o orçamento é criado automaticamente! Isso permite adicionar itens imediatamente.

### Condições Comerciais (opcional)

Após o orçamento ser criado, você pode preencher:

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| **Frete** | Condição de frete | CIF, FOB |
| **Validade** | Data de validade do orçamento | Selecione no calendário |
| **Prazo de Faturamento** | Condições de pagamento | 30 dias, à vista |
| **Observações** | Informações adicionais | Notas gerais |

### Ocultar valor total

Marque a opção **"Ocultar total"** se não quiser que o valor total apareça no PDF do orçamento.

---

## 4. Adicionar Itens ao Orçamento

Após criar um orçamento, você pode adicionar itens na seção **"📦 Itens do Orçamento"**.

### Passo a passo

1. Clique no botão **"+ Adicionar Item"**
2. Preencha as informações do item:

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| **Código** | ✅ Sim | Código interno do item (ex: ITEM-001) |
| **Descrição** | ✅ Sim | Descrição completa do item |
| **Orçar por** | ✅ Sim | Selecione: **kg** ou **Peça** |
| **Peso Unit. (kg)** | Não | Aparece apenas para orçamentos por peça |
| **Preço** | ✅ Sim | Preço por kg ou por peça |
| **Material** | Não | Ex: Aço SAE 1045 |
| **Prazo de Entrega** | Não | Ex: 15 dias úteis |
| **Faturamento Mínimo** | Não | Ex: R$ 500,00 |

3. Selecione os **Processos** aplicáveis (pode selecionar múltiplos):
   - Desempeno
   - Normalização
   - Têmpera por Indução
   - Têmpera
   - Cementação
   - Beneficiamento
   - Revenimento
   - Recozimento com atmosfera controlada
   - Recozimento sem atmosfera

4. Clique em **"Adicionar"**

### Gerenciar itens existentes

Para cada item na lista, clique na seta (⌄) para expandir e ver os detalhes. Você terá as opções:

- **✏️ Editar:** Modifica os dados do item
- **📋 Duplicar:** Cria uma cópia do item
- **🗑️ Excluir:** Remove o item do orçamento

---

## 5. Fazer Upload de Anexos

Cada item pode ter múltiplos anexos (imagens ou PDFs).

### Passo a passo

1. Expanda um item clicando na seta (⌄)
2. Role até a seção **"📎 Anexos"**
3. Para adicionar um anexo, você pode:
   - **Arrastar** arquivos para a área indicada
   - **Clicar** na área e selecionar arquivos do computador

### Formatos aceitos

- **Imagens:** PNG, JPG, GIF, WEBP
- **Documentos:** PDF
- **Tamanho máximo:** 12 MB por arquivo

### Visualizar e remover anexos

- Clique no anexo para visualizar em tamanho maior
- Clique no **X** vermelho para remover o anexo

> 📝 **No PDF:** Os anexos aparecerão como miniaturas (4×3 cm) organizadas em grade.

---

## 6. Visualizar Orçamento

Para ver o orçamento no formato final (como ficará no PDF):

### Opção 1: Pela lista
1. Clique diretamente na linha do orçamento na tabela

### Opção 2: Pelo menu de ações
1. Na lista, clique no menu **⋮** do orçamento
2. Selecione **"👁️ Visualizar"**

### Opção 3: Durante a edição
1. No formulário de edição, clique no botão **"👁️ Visualizar"** no topo

### Na tela de visualização

Você verá uma prévia do orçamento com:
- Cabeçalho com logotipo
- Número do orçamento e cliente
- Lista de itens com detalhes
- Condições comerciais
- Miniaturas dos anexos

---

## 7. Baixar PDF do Orçamento

### Opção 1: Pela visualização
1. Acesse a visualização do orçamento
2. Clique no botão **"⬇️ Baixar PDF"**

### Opção 2: Pela lista (mais rápido)
1. Na lista de orçamentos, clique no menu **⋮**
2. Selecione **"⬇️ Baixar PDF"**

O arquivo será salvo como `Orcamento-XXXX-XXXX.pdf`.

### O que aparece no PDF

✅ **Incluso:**
- Logotipo centralizado
- Número do orçamento
- Cliente e contato
- Itens com todos os detalhes
- Processos selecionados
- Condições comerciais (frete, validade, prazo)
- Miniaturas dos anexos
- Rodapé com endereço da empresa

❌ **Não aparece:**
- Status do orçamento
- Data de criação/alteração
- Quem criou/alterou
- Campos vazios

---

## 8. Gerenciar Status

O status indica a situação comercial do orçamento.

### Status disponíveis

| Status | Ícone | Descrição |
|--------|-------|-----------|
| Cadastrado | 📝 | Orçamento recém-criado |
| Aguardando Informações | ⏳ | Pendente de dados do cliente |
| Enviado | 📤 | Orçamento enviado ao cliente |
| Em Negociação | 💬 | Em processo de negociação |
| Aprovado | ✅ | Cliente aprovou o orçamento |
| Rejeitado | ❌ | Cliente recusou o orçamento |

### Como alterar o status

#### Opção 1: Durante a edição
1. No topo do formulário de edição, localize o campo **"Status"**
2. Selecione o novo status no dropdown
3. Clique em **"Salvar"**

#### Opção 2: Na visualização
1. Clique no botão **"🔄 Status"**
2. Selecione o novo status

#### Opção 3: Pela lista
1. Clique no menu **⋮** do orçamento
2. Passe o mouse em **"🔄 Alterar Status"**
3. Selecione o novo status

> 📊 A alteração de status é registrada automaticamente (data e usuário).

---

## 9. Editar Orçamento

### Como acessar a edição

#### Opção 1: Pela lista
1. Clique no menu **⋮** do orçamento
2. Selecione **"✏️ Editar"**

#### Opção 2: Pela visualização
1. Na tela de visualização, clique em **"✏️ Editar"**

### O que pode ser editado

- ✅ Nome do cliente e contato
- ✅ Condições comerciais (frete, validade, prazo, observações)
- ✅ Status
- ✅ Itens (adicionar, editar, remover)
- ✅ Anexos dos itens
- ❌ Número do orçamento (gerado automaticamente)
- ❌ Data de criação
- ❌ Quem criou

### Salvar alterações

Após fazer as modificações, clique no botão **"💾 Salvar"** no topo da página.

---

## 10. Duplicar e Excluir Orçamentos

### Duplicar orçamento

Útil quando você precisa criar um orçamento semelhante a outro existente.

1. Na visualização ou no menu **⋮**, clique em **"📋 Duplicar"**
2. Um novo orçamento será criado com:
   - Novo número sequencial
   - Todos os dados copiados
   - Status "Cadastrado"
3. Você será redirecionado para editar o novo orçamento

### Excluir orçamento

⚠️ **Atenção:** Esta ação não pode ser desfeita!

1. Na lista, clique no menu **⋮**
2. Selecione **"🗑️ Excluir"**
3. Confirme a exclusão na janela de confirmação

> O sistema mostrará os dados do orçamento antes de confirmar a exclusão.

---

## 11. Operações em Lote

Você pode selecionar múltiplos orçamentos para executar ações em massa.

### Como selecionar

- **Selecionar individual:** Clique no checkbox (☑️) ao lado de cada orçamento
- **Selecionar todos:** Clique no checkbox no cabeçalho da tabela

### Barra de ações em lote

Quando houver orçamentos selecionados, aparecerá uma barra flutuante na parte inferior da tela com:

- **Contador:** Mostra quantos orçamentos estão selecionados
- **🔄 Alterar Status:** Muda o status de todos os selecionados
- **🗑️ Excluir:** Remove todos os selecionados
- **✕:** Cancela a seleção

### Alterar status em lote

1. Selecione os orçamentos desejados
2. Clique em **"🔄 Alterar Status"**
3. Escolha o novo status
4. Todos os orçamentos selecionados serão atualizados

### Excluir em lote

1. Selecione os orçamentos desejados
2. Clique em **"🗑️ Excluir"**
3. Confirme na janela de aviso
4. Todos os orçamentos selecionados serão removidos permanentemente

---

## 🆘 Dicas e Atalhos

### Navegação rápida

- Clique em qualquer linha da tabela para abrir a visualização
- Use a busca para encontrar orçamentos rapidamente
- Ordene por data para ver os mais recentes primeiro

### Boas práticas

1. **Preencha o cliente primeiro** - o sistema auto-salva e libera a adição de itens
2. **Use códigos consistentes** - facilita a busca depois
3. **Mantenha o status atualizado** - ajuda no acompanhamento comercial
4. **Revise antes de baixar o PDF** - use a visualização para conferir

### Versão mobile

O sistema é totalmente responsivo. Em celulares e tablets:
- Os orçamentos aparecem como cards
- Menus são otimizados para toque
- Todas as funcionalidades estão disponíveis

---

## ❓ Problemas Comuns

### "Erro ao salvar"
- Verifique se todos os campos obrigatórios estão preenchidos
- Verifique sua conexão com a internet

### "Email ou senha incorretos"
- Confirme se o email está correto
- Verifique se a senha está correta (use o ícone do olho para visualizar)

### "Erro no upload de anexo"
- Verifique se o arquivo não excede 12 MB
- Confirme se o formato é aceito (PNG, JPG, GIF, WEBP ou PDF)

---

**Tecno Hard - Indústria Metalúrgica**  
*Sistema de Orçamentos v1.0*

