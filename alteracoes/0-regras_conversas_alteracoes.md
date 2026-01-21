# Regras da conversa

Todas interações da conversa devem ser feitas dentro do **arquivo de alteração** que referencia estas regras.
No Chat, limite-se a dizer 'OK' todas vez que você preencher sua resposta, *não gaste tokens escrevendo texto no chat.*

## Formatação das respostas

- Faça um resumo da minha pergunta ao lado de '# usuário', em no máximo 1 linha
- Responda abaixo, dentro do arquivo de alteração, no campo # IA:, adicionando um resumo da sua resposta de 1 linha também
- Após dar sua resposta, preencha '# usuário: ' nas linhas seguintes, para já ficar pronto para o usuário preencher sua próxima resposta
- Não exclua o texto das minhas respostas. Faça o resumo ao lado de # usuário:, mas mantenha o que eu escrevi
- Mantenha a estrutura de markdown para ficar fácil indexar a conversa posteriormente. Se tiver que separar em subtópicos, siga o fluxo # IA: -> ## Subtópico 1 -> ### Subtópico 2, e assim sucessivamente
- NUNCA estime o tempo estimado para realização de tarefas. Isso é totalmente irrelevante e gasta tokens.

---

# Regras de código

## Padrões do projeto

Antes de implementar qualquer funcionalidade, SEMPRE:

1. **Pesquise exemplos existentes** no projeto que façam algo similar ao que será implementado
2. **Siga os padrões encontrados**: estrutura de arquivos, nomenclatura, organizacao de componentes, hooks, tipos, etc.
3. **Mantenha consistencia** com o estilo de codigo existente (indentacao, aspas, imports, etc.)
4. **Reutilize** componentes, hooks e funcoes utilitarias ja existentes ao inves de criar novos

## Validação

- NUNCA utilizar 'any' nas declaracoes typescript
- Apos qualquer execucao, SEMPRE teste o typescript atraves do comando: `npx tsc --noEmit 2>&1 | Select-Object`
- Se houver erros de TypeScript, corrija-os antes de prosseguir

## Terminal (PowerShell no Windows)

**Regras obrigatorias:**

1. **Usar `;` em vez de `&&`** - PowerShell nao suporta `&&` como separador de comandos
2. **Sempre usar caminho absoluto** para navegar ate o projeto:
   ```powershell
   cd "C:\Users\tonietto.felipe\My Drive\cursor\Orcamentos\orcamentos-tecnohard"
   ```
3. **Comando de validacao TypeScript completo:**
   ```powershell
   cd "C:\Users\tonietto.felipe\My Drive\cursor\Orcamentos\orcamentos-tecnohard"; npx tsc --noEmit 2>&1 | Select-Object -First 50
   ```

**Erros comuns a evitar:**
- ❌ `cd pasta && comando` (sintaxe bash)
- ✅ `cd pasta; comando` (sintaxe PowerShell)
- ❌ `cd orcamentos-tecnohard` (relativo, pode falhar)
- ✅ `cd "C:\...\orcamentos-tecnohard"` (absoluto, sempre funciona)

## Exemplos de onde buscar padrões

| O que implementar | Onde buscar referência |
|-------------------|------------------------|
| Novo hook de dados | `lib/hooks/` - ver use-orcamento.ts, use-itens.ts, etc. |
| Nova página | `app/(dashboard)/` - ver orcamentos/, config/ |
| Novo componente feature | `components/features/` - ver orcamento-form.tsx, item-list.tsx |
| Componente UI | `components/ui/` - componentes shadcn/ui existentes |
| Novo tipo | `lib/types/` - ver app.ts, database.ts |
| Utilitários | `lib/utils/` - ver format.ts, validators.ts, error-handler.ts |
| Supabase | `lib/supabase/` - ver client.ts, server.ts |

## Modais que alteram dados

Ao implementar modais (Dialog) que criam, editam ou excluem dados:

1. **SEMPRE** chamar a funcao de recarregar dados quando o modal fecha / e salvo / alterado
2. Usar o padrao `onOpenChange` para garantir refresh em TODOS os cenarios de fechamento (sucesso, cancelamento, clique fora, ESC)

### Padrão obrigatório:

```tsx
<MeuModal
  open={modalAberto}
  onOpenChange={(open) => {
    setModalAberto(open)
    if (!open) carregarDados()  // Recarrega ao fechar
  }}
/>
```

### Referência de implementação:
- `app/(dashboard)/orcamentos/[id]/editar/page.tsx` - para padrao de edicao
- `components/features/orcamento-form.tsx` - para padrao de formularios
