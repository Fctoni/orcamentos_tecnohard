# 🎯 FASE 7: Ações em Lote e Melhorias

**Duração Estimada:** 1-2 dias  
**Objetivo:** Seleção múltipla, ações em lote e melhorias de UX

---

## 📋 Checklist de Tarefas

- [ ] 7.1 Implementar seleção múltipla na tabela
- [ ] 7.2 Criar barra de ações em lote
- [ ] 7.3 Implementar alteração de status em lote
- [ ] 7.4 Implementar exclusão em lote
- [ ] 7.5 Melhorar confirmações de exclusão

---

## 7.1 Seleção Múltipla na Tabela

**Atualizar `components/features/orcamentos-list.tsx`:**

```typescript
// Adicionar state para seleção
const [selectedIds, setSelectedIds] = useState<string[]>([])

// Função para selecionar/deselecionar
const toggleSelect = (id: string) => {
  setSelectedIds(prev => 
    prev.includes(id) 
      ? prev.filter(i => i !== id)
      : [...prev, id]
  )
}

const selectAll = () => {
  if (selectedIds.length === orcamentos.length) {
    setSelectedIds([])
  } else {
    setSelectedIds(orcamentos.map(o => o.id))
  }
}
```

---

## 7.2 Checkbox na Tabela

**Atualizar tabela para incluir checkbox:**

```typescript
// No TableHeader
<TableHead className="w-[40px]">
  <Checkbox
    checked={selectedIds.length === orcamentos.length && orcamentos.length > 0}
    onCheckedChange={selectAll}
  />
</TableHead>

// No TableRow
<TableCell onClick={(e) => e.stopPropagation()}>
  <Checkbox
    checked={selectedIds.includes(orcamento.id)}
    onCheckedChange={() => toggleSelect(orcamento.id)}
  />
</TableCell>
```

---

## 7.3 Barra de Ações em Lote

**Adicionar ao `orcamentos-list.tsx`:**

```typescript
{/* Barra de ações em lote */}
{selectedIds.length > 0 && (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border p-4 flex items-center gap-4 z-50">
    <span className="text-sm font-medium">
      {selectedIds.length} selecionado(s)
    </span>
    
    <Separator orientation="vertical" className="h-8" />
    
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" /> Alterar Status
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => changeStatusBatch(key as OrcamentoStatus)}
          >
            {config.icon} {config.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
    
    <Button
      variant="destructive"
      size="sm"
      onClick={() => setDeleteMultiple(true)}
    >
      <Trash2 className="mr-2 h-4 w-4" /> Excluir
    </Button>
    
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setSelectedIds([])}
    >
      <X className="h-4 w-4" />
    </Button>
  </div>
)}
```

---

## 7.4 Alteração de Status em Lote

```typescript
const changeStatusBatch = async (status: OrcamentoStatus) => {
  for (const id of selectedIds) {
    await updateStatus(id, status)
  }
  setSelectedIds([])
  toast({ title: `Status de ${selectedIds.length} orçamentos atualizado!` })
}
```

---

## 7.5 Exclusão em Lote

```typescript
const [deleteMultiple, setDeleteMultiple] = useState(false)

const handleDeleteMultiple = async () => {
  for (const id of selectedIds) {
    await deleteOrcamento(id)
  }
  setSelectedIds([])
  setDeleteMultiple(false)
  toast({ title: `${selectedIds.length} orçamentos excluídos!` })
}

// Dialog para exclusão em lote
<AlertDialog open={deleteMultiple} onOpenChange={setDeleteMultiple}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Excluir {selectedIds.length} orçamentos?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta ação não pode ser desfeita. Todos os orçamentos selecionados,
        seus itens e anexos serão removidos permanentemente.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction 
        onClick={handleDeleteMultiple}
        className="bg-red-600 hover:bg-red-700"
      >
        Sim, excluir todos
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 7.6 Confirmação de Exclusão Aprimorada

**Atualizar dialog de exclusão para mostrar detalhes:**

```typescript
<AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Excluir orçamento?</AlertDialogTitle>
      <AlertDialogDescription className="space-y-2">
        <p>Esta ação não pode ser desfeita.</p>
        {deleteId && orcamentos.find(o => o.id === deleteId) && (
          <div className="bg-secondary rounded p-3 text-sm">
            <p><strong>Número:</strong> {orcamentos.find(o => o.id === deleteId)?.numero}</p>
            <p><strong>Cliente:</strong> {orcamentos.find(o => o.id === deleteId)?.cliente}</p>
          </div>
        )}
        <p className="text-red-600 font-medium">
          Todos os itens e anexos também serão removidos.
        </p>
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction 
        onClick={handleDelete} 
        className="bg-red-600 hover:bg-red-700"
      >
        Sim, excluir
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## ✅ Critérios de Conclusão da Fase 7

- [ ] Checkbox de seleção em cada linha da tabela
- [ ] Checkbox "selecionar todos" no cabeçalho
- [ ] Barra de ações aparece quando há seleção
- [ ] Alteração de status em lote funcionando
- [ ] Exclusão em lote com confirmação
- [ ] Confirmações de exclusão mostram detalhes do orçamento
- [ ] Botão para limpar seleção

---

## 🔗 Próxima Fase

➡️ [FASE 8: Polimento](./FASE8.MD)
