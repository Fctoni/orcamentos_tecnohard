# 📋 Alterações Necessárias no PRD - Alterações 31 e 32

**Data:** 20/01/2026  
**Referência:** `spec-alteracao31.md` e `spec-alteracao32.md`

---

## 📊 RESUMO DAS ALTERAÇÕES

| # | Alteração | Seções Afetadas |
|---|-----------|-----------------|
| 31 | Renomear "Progresso de Entrega" para "Progresso de Faturamento" + seção Status de Recebimento | 7.6.5, 7.7.8 (Modais Detalhes) |
| 32 | Unificar layout modal detalhes - remover abas, tabela única, lógica reserva corrigida | 7.6.5, 7.7.8 (Modais Detalhes) |

**Nota:** Ambas as alterações afetam os mesmos componentes (modais de detalhes de pedidos de venda). Serão documentadas juntas na versão 2.23.

---

## 🔧 ALTERAÇÃO 31: Terminologia Faturamento vs Recebimento

### Mudanças de Terminologia

| Antes | Depois |
|-------|--------|
| "Progresso de Entrega" | "Progresso de Faturamento" |
| Coluna "Entregue" | Coluna "Faturado" |

### Nova Seção: Status de Recebimento

Exibe o status de recebimento físico das NFs faturadas:

| Campo | Descrição |
|-------|-----------|
| NF | Número da NF |
| Dt Faturamento | Data da emissão |
| Dt Recebimento | Data do recebimento físico (ou "-") |
| Recebedor | Nome de quem recebeu (ou "-") |
| Status | ✅ Recebido (verde) ou ⏳ Aguardando (amarelo) |

**Resumo:** `X/Y NFs recebidas (Z%)` com barra de progresso

---

## 🔧 ALTERAÇÃO 32: Layout Unificado dos Modais

### Remoção de Abas

- **Removido:** Sistema de abas (Itens / Entregas)
- **Novo:** Layout em seções verticais contínuas

### Novo Card de Resumo

Card compacto no topo do modal:
- Cliente, OC, Data, Previsão
- Total de itens (peças ou barras)
- Valor total do pedido

### Tabela Unificada de Itens

| Coluna | Descrição |
|--------|-----------|
| Produto | Código do produto |
| Descrição | Nome/descrição truncada |
| Pedido | Quantidade total pedida |
| Reserv. | `X/Y` onde X=reservado, Y=a reservar (Y = Pedido - Faturado) |
| Faturado | Quantidade já faturada |
| Pend. | Quantidade pendente (Pedido - Faturado) |
| % | Barra de progresso + percentual |
| Ações | Botões contextuais (só quando aplicável) |

### Lógica de Reserva Corrigida

**Fórmula anterior (incorreta):**
```
statusReserva = totalReservado >= quantidade ? 'Reservado' : ...
```

**Fórmula corrigida:**
```
quantidadeAReservar = quantidade - quantidadeFaturada
statusReserva = quantidadeAReservar == 0 ? 'Faturado' : 
                totalReservado >= quantidadeAReservar ? 'Reservado' : ...
```

**Comportamento da coluna Reserv.:**
- Se item 100% faturado: exibe `-` (não precisa mais reservar)
- Se parcialmente faturado: exibe `X/Y` com Y = quantidade pendente
- Cor: verde se totalmente reservado, laranja se parcial

### Ações Contextuais

| Condição | Ações Visíveis |
|----------|----------------|
| 100% faturado | Nenhuma |
| Pode reservar mais | Botão 📦 Reservar |
| Tem reserva | Botão ❌ Cancelar reserva |
| Status não permite | Coluna de ações oculta |

### Entregas Colapsáveis

- Clique na linha da NF expande/colapsa os itens
- Ícone ChevronRight (colapsado) / ChevronDown (expandido)
- Linhas filhas mostram produto, descrição e quantidade

---

## 4. Seções do PRD a Atualizar

### **7.6.5 Modal Detalhes do Pedido - Amarrados (ATUALIZAR/CRIAR)**

Se não existir, criar. Se existir, atualizar com:

**Estrutura do Modal:**
1. Header com número do pedido e status
2. Card de resumo (Cliente, OC, Total, Valor)
3. Tabela unificada de itens (Produto, Descrição, Pedido, Reserv., Faturado, Pend., %)
4. Seção "Progresso de Faturamento" (barra de progresso geral)
5. Seção "Status de Recebimento" (tabela de NFs com status)
6. Seção "Entregas/Faturamentos" (linhas colapsáveis)

**Lógica de Reserva:**
- `quantidadeAReservar = Pedido - Faturado`
- Se `quantidadeAReservar = 0`: não exibe ações de reserva
- Coluna Reserv.: formato `X/Y` onde Y = quantidadeAReservar

### **7.7.8 Modal Detalhes do Pedido - Peças (ATUALIZAR/CRIAR)**

Mesma estrutura do modal de amarrados, adaptada para peças.

---

## ✅ CHECKLIST DE ATUALIZAÇÃO

### Interface (Seção 7)
- [ ] 7.6.5 Modal Detalhes Amarrados - documentar layout unificado
- [ ] 7.7.8 Modal Detalhes Peças - documentar layout unificado
- [ ] Documentar lógica de reserva corrigida
- [ ] Documentar seção Status de Recebimento
- [ ] Documentar entregas colapsáveis

### Header
- [ ] Atualizar versão para 2.23
- [ ] Atualizar data
- [ ] Adicionar changelog v2.23
