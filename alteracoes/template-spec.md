# Especificação: Alteração XX - [Título curto]

| Aspecto | Detalhe |
|---------|---------|
| Status | 🔵 Pronto para executar |
| Conversa | [alteracaoXX.md](./alteracaoXX.md) |
| Data criação | [data] |
| Complexidade | 🟢 Baixa / 🟡 Média / 🔴 Alta |

**Status possíveis:**
- 🔵 Pronto para executar
- 🟠 Em execução
- 🟢 Concluído
- ❌ Cancelado

---

## 1. Resumo

[1-2 linhas resumindo o que será implementado - extraído da conversa de planejamento]

---

## 2. O que será feito

- [ ] Item 1
- [ ] Item 2
- [ ] Item 3

---

## 3. UI Proposta

### 3.1 [Nome do Modal/Tela]

```
┌─────────────────────────────────────────────────────────────┐
│  📄 Título                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Desenho ASCII da interface]                               │
│                                                             │
│                              [Cancelar]  [✅ Confirmar]     │
└─────────────────────────────────────────────────────────────┘
```

**Comportamentos:**
- Comportamento 1
- Comportamento 2

---

## 4. Implementação Técnica

### 4.1 Banco de Dados

| Tabela | Alteração |
|--------|-----------|
| `tabela_exemplo` | Adicionar campo `novo_campo` |

```sql
-- Script SQL (se aplicável)
ALTER TABLE tabela_exemplo ADD COLUMN novo_campo TEXT;
```

### 4.2 Arquivos a Modificar/Criar

| Ação | Arquivo | Descrição |
|------|---------|-----------|
| CRIAR | `src/components/exemplo.tsx` | Novo componente |
| MODIFICAR | `src/lib/hooks/useExemplo.ts` | Adicionar função X |

### 4.3 Dependências Externas

- [ ] Criar bucket no Supabase (se aplicável)
- [ ] Outras dependências externas

---

## 5. Execução

*(preenchido pelo Executor)*

### 5.1 Progresso

- [ ] Banco de dados atualizado
- [ ] Componente criado
- [ ] Hook modificado
- [ ] TypeScript sem erros
- [ ] Testado manualmente

### 5.2 Notas de Implementação

[Decisões tomadas durante a execução, problemas encontrados, soluções aplicadas]

### 5.3 Conversa de Execução

*(problemas encontrados durante execução, soluções propostas)*

#### IA:
[mensagem]

---

## 6. Validação Final

- [ ] `npx tsc --noEmit` sem erros
- [ ] Funcionalidade testada manualmente
- [ ] PRD atualizado (via PRD-editor)
