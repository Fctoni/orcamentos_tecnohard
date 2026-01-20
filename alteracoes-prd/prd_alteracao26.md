# 📋 Alterações Necessárias no PRD - Alteração 26

**Data:** 20/01/2026  
**Referência:** `alteracao26.md`

---

## 📊 RESUMO DAS ALTERAÇÕES

| # | Alteração | Seções Afetadas |
|---|-----------|-----------------|
| 1 | Funcionalidade de impressão no Modal de Detalhes do Pedido de Produção | 7.9 Pedido de Produção |
| 2 | Correção na exibição de frações em produção no Canvas (amarrados zerados) | 6. Interface - Canvas |

---

## 🔧 ALTERAÇÃO 1: Impressão do Modal de Detalhes do Pedido de Produção

### **[Seção 7.9.11] (NOVA)**

Adicionar nova subseção após 7.9.10.2:

```markdown
#### **7.9.11 Modal de Detalhes do Pedido - Impressão**

O modal de detalhes do pedido de produção (`DetalhesPedidoProducaoModal`) possui botão para gerar relatório impresso.

**Botão de Impressão:**
- Localização: Header do modal, lado direito
- Ícone: 🖨️ + texto "Imprimir"
- Ação: Abre janela do navegador com layout formatado para impressão

**Layout de Impressão (A4 Retrato):**

| Seção | Conteúdo | Condicional |
|-------|----------|-------------|
| Cabeçalho | "ORDEM DE PRODUÇÃO #XXX" + Data de geração | Sempre |
| Informações Gerais | Fornecedor, Cliente Final, Status, Datas (criação, envio, previsão) | Sempre |
| Matéria-Prima Enviada | Tabela: Amarrado, Liga, Diâmetro, Barras, Peso + Totais | Sempre |
| Peças Solicitadas | Tabela: Produto, Liga, Diâmetro, Barras, Qtd, Peso Estimado + Totais | Sempre |
| Métricas de Produção | Perda Peso %, Perda Barras %, Peso Enviado → Peso Consumido | Só se status = "Recebido" |
| Observações | Texto de observações do pedido | Só se houver observações |
| Rodapé | "Sistema de Controle de Estoque" + Data/hora de geração | Sempre |

**Tabela de Peças - Colunas:**

| Coluna | Origem do Dado |
|--------|----------------|
| Produto | `produtos.codigo_cliente` + descrição |
| Liga | `amarrados.materiais.nome` ou "PONTAS" se `usa_pontas_barra` |
| Diâmetro | `amarrados.diametro` ou `produtos.diametro_origem` se pontas |
| Barras | `itens_solicitados_producao.barras_solicitadas` |
| Qtd | `itens_solicitados_producao.quantidade_solicitada` |
| Peso Est. | Calculado: barras × peso por barra |

**Comportamento:**
- Abre em nova janela do navegador via `window.open()`
- CSS otimizado para impressão (@page A4)
- Dispara `window.print()` automaticamente ao carregar
- Fecha janela após impressão (`window.onafterprint`)
```

---

## 🔧 ALTERAÇÃO 2: Correção na Exibição de Frações em Produção no Canvas

### **[Seção 6.2.4] (ATUALIZAR)**

Atualizar a documentação sobre exibição de frações em produção no canvas:

```markdown
#### **6.2.4 Frações em Produção (Bolinhas Laranjas)**

Amarrados que tiveram barras enviadas para produção são exibidos como frações separadas no canvas.

**Condições de Exibição:**
- Item existe em `itens_enviados_producao`
- Pedido de produção associado tem status "Em Producao" ou "Aguardando Confirmacao"
- Amarrado está na localização (unidade) atual

**Comportamento com Amarrados Zerados:**
- Quando todas as barras de um amarrado são enviadas para produção, o amarrado fica com status "Zerado"
- A fração em produção continua sendo exibida no canvas independentemente do status do amarrado
- Os dados do amarrado (liga, diâmetro, posição) são obtidos via JOIN na query de `itens_enviados_producao`

**Query de Carregamento:**
- Faz JOIN com tabela `amarrados` para obter dados mesmo quando status = "Zerado"
- Filtra por localização do amarrado (matriz ou filial)
- Filtra por status do pedido de produção

**Quando a Fração Some do Canvas:**
- Pedido de produção muda para status "Criado", "Recebido" ou "Cancelado"

**Visual:**
- Borda laranja (#f97316) com 3px de espessura
- Badge "PP#X" na parte inferior (onde X é o número do pedido)
- Exibe barras enviadas e peso enviado (não os valores atuais do amarrado)
```

---

## ✅ CHECKLIST DE ATUALIZAÇÃO

### Header
- [x] Atualizar versão para 2.20
- [x] Atualizar data para 20/01/2026
- [x] Adicionar changelog v2.20

### Seção 7.2.3.1
- [x] Atualizar "Frações de Amarrados" com comportamento de amarrados zerados

### Seção 7.9
- [x] Adicionar subseção 7.9.11 "Modal de Detalhes do Pedido - Impressão"

---

## 📝 CHANGELOG PROPOSTO

```
v2.20: Impressão no Modal de Detalhes do Pedido de Produção - botão "Imprimir" no header do modal abre janela com layout A4 formatado. Inclui: Informações Gerais (fornecedor, cliente, status, datas), Matéria-Prima Enviada (tabela com totais), Peças Solicitadas (com liga, diâmetro, barras, peso estimado), Métricas de Produção (só se status Recebido), Observações (só se houver). Impressão via window.print() com fechamento automático. Correção na exibição de frações em produção no canvas - amarrados com status "Zerado" agora exibem corretamente suas frações em produção via JOIN direto na query.
```

---

*Gerado pelo agente PRD-editor em 20/01/2026*
