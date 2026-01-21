# 📋 Alterações Necessárias no PRD - Alteração 05

**Data:** 21/01/2026  
**Referência:** `spec-alteracao05.md`

---

## 📊 RESUMO DAS ALTERAÇÕES

| # | Alteração | Seções Afetadas |
|---|-----------|-----------------|
| 1 | Sincronização do Preview com layout do PDF | 5.4 Visualização do Orçamento |
| 2 | Scroll horizontal em mobile | 6.6 Responsividade |

---

## 🔧 ALTERAÇÃO 1: Layout do Preview sincronizado com PDF

### **[Seção 5.4] (ATUALIZAR)**

O layout do preview (`orcamento-preview.tsx`) foi sincronizado com o layout do PDF, com coluna adicional de anexos e responsividade mobile.

**Substituir o diagrama de layout ASCII atual por:**

```
┌────────────────────────────────────────────────────────────────────┐
│                                                   Nº: 2026-0012    │
│                                                                    │
│                     [LOGO TECNO HARD]                              │
│                     (50% largura, centralizado)                    │
│                                                                    │
│                     Cliente: NOME DO CLIENTE                       │
│                     Contato: Nome do Contato                       │
│                     Validade: 15/12/2025                           │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ITENS DO ORÇAMENTO                                                │
│  ┌──────────┬──────────┬────────┬────────┬────────┬───────┬─────┐  │
│  │   Item   │ Material │ Prazo  │Fat.Min.│Peso Un.│ Preço │ 📎  │  │
│  │          │          │(d.úteis)│       │        │       │     │  │
│  ├──────────┼──────────┼────────┼────────┼────────┼───────┼─────┤  │
│  │ ABC-001  │ SAE 8620 │   7    │R$100   │ 3.25kg │R$44/pc│ 📎2 │  │
│  │ - PINO   │          │        │        │        │       │     │  │
│  │ Têmpera, │          │        │        │        │       │     │  │
│  │ Revenimento         │        │        │        │       │     │  │
│  ├──────────┼──────────┼────────┼────────┼────────┼───────┼─────┤  │
│  │ DEF-002  │ Aço 1020 │   15   │   -    │   -    │R$10/kg│  -  │  │
│  │ - EIXO   │          │        │        │        │       │     │  │
│  │ Corte    │          │        │        │        │       │     │  │
│  └──────────┴──────────┴────────┴────────┴────────┴───────┴─────┘  │
│                                                                    │
│                               VALOR TOTAL: R$ 1.500,00             │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  INFORMAÇÕES GERAIS                                                │
│  Frete: CIF                                                        │
│  Prazo de Faturamento: 30 dias                                     │
│  Observações: ...                                                  │
│                                                                    │
│                                        Elaborado por:              │
│                                        João Silva                  │
│                                        vendas@tecnohard.com.br     │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  R. Emílio Fonini, 521 - Cinquentenário, Caxias do Sul - RS       │
│  (54) 3225-6464 - https://www.tecnohard.ind.br/                    │
└────────────────────────────────────────────────────────────────────┘
```

**Adicionar após o diagrama:**

**Tabela de Itens (Preview):**

| Coluna | Conteúdo |
|--------|----------|
| Item | codigo_item + " - " + descrição + processos (linha abaixo) |
| Material | material ou "-" |
| Prazo (dias úteis) | prazo_entrega numérico |
| Fat. Mín. | faturamento_minimo formatado ou "-" |
| Peso Un. | peso_unitario + " kg" ou "-" |
| Preço | preco_unitario + "/pc" ou "/kg" conforme unidade |
| Anexos | Ícone 📎 + contador (clicável) ou "-" |

**Coluna Anexos (exclusiva do Preview):**
- Ícone 📎 com contador de anexos do item
- Clique abre modal com lista de anexos (ver, baixar)
- Se item não tem anexos, exibe "-" (não clicável)

**Nota:** A coluna Anexos não existe no PDF, pois os anexos já são exibidos como miniaturas.

---

## 🔧 ALTERAÇÃO 2: Scroll horizontal em mobile

### **[Seção 6.6 Responsividade] (ADICIONAR)**

**Visualização de Orçamento (Mobile):**
- Tabela de itens com scroll horizontal (`overflow-x-auto`)
- Largura mínima da tabela: 800px
- Permite visualizar todas as colunas em telas pequenas

---

## ✅ CHECKLIST DE ATUALIZAÇÃO

### Seção 5.4 - Visualização do Orçamento
- [ ] Substituir diagrama ASCII do layout
- [ ] Adicionar tabela de colunas do Preview
- [ ] Documentar comportamento da coluna Anexos

### Seção 6.6 - Responsividade
- [ ] Adicionar item sobre scroll horizontal no Preview

### Header
- [ ] Atualizar versão para 1.04
- [ ] Atualizar data
- [ ] Adicionar changelog v1.04

### Changelog sugerido:
```
v1.04: Layout do Preview sincronizado com PDF - numero do orcamento no canto superior direito, tabela de itens com colunas Item (codigo+descricao+processos), Material, Prazo, Fat.Min., Peso Un., Preco e Anexos (coluna exclusiva do preview com icone clicavel). Scroll horizontal em mobile para tabela de itens.
```

---

*Documento intermediário criado em 21/01/2026*
