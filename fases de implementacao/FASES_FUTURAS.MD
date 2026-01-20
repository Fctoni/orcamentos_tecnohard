# 🔮 Fases Futuras

**Funcionalidades planejadas para implementação futura**

---

## 📊 Exportação CSV/Excel

### Objetivo
Permitir exportar orçamentos individuais ou em lote para CSV e Excel.

### Dependência
```bash
npm install xlsx
```

### API de Exportação

**`app/api/export/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const formatType = searchParams.get('format') || 'csv'

    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 })
    }

    const supabase = await createClient()

    // Buscar orçamento com itens
    const { data: orcamento, error } = await supabase
      .from('orcamentos')
      .select(`
        *,
        itens:orcamento_itens(*)
      `)
      .eq('id', id)
      .single()

    if (error || !orcamento) {
      return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
    }

    // Ordenar itens
    if (orcamento.itens) {
      orcamento.itens.sort((a: any, b: any) => a.ordem - b.ordem)
    }

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value)
    }

    if (formatType === 'csv') {
      // Gerar CSV
      const csvData = generateCSV(orcamento, formatCurrency)
      
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="Orcamento-${orcamento.numero}.csv"`,
        },
      })
    } else if (formatType === 'xlsx') {
      // Gerar Excel
      const excelBuffer = generateExcel(orcamento, formatCurrency)
      
      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="Orcamento-${orcamento.numero}.xlsx"`,
        },
      })
    }

    return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
  } catch (error) {
    console.error('Erro na exportação:', error)
    return NextResponse.json({ error: 'Erro na exportação' }, { status: 500 })
  }
}

function generateCSV(orcamento: any, formatCurrency: (v: number) => string): string {
  // BOM para UTF-8
  const BOM = '\uFEFF'
  
  const lines: string[] = []
  
  // Cabeçalho do orçamento
  lines.push('ORÇAMENTO')
  lines.push(`Número;${orcamento.numero}`)
  lines.push(`Cliente;${orcamento.cliente}`)
  if (orcamento.contato) lines.push(`Contato;${orcamento.contato}`)
  if (orcamento.validade) {
    lines.push(`Validade;${format(new Date(orcamento.validade), 'dd/MM/yyyy', { locale: ptBR })}`)
  }
  if (orcamento.frete) lines.push(`Frete;${orcamento.frete}`)
  lines.push('')
  
  // Itens
  lines.push('ITENS')
  lines.push('Código;Item;Unidade;Quantidade;Peso Unit.;Preço Unit.;Total;Material;Processos;Prazo;Fat. Mínimo')
  
  if (orcamento.itens) {
    for (const item of orcamento.itens) {
      const row = [
        item.codigo_item,
        item.item,
        item.unidade,
        item.quantidade,
        item.peso_unitario || '',
        formatCurrency(item.preco_unitario),
        formatCurrency(item.preco_total),
        item.material || '',
        item.processos?.join(', ') || '',
        item.prazo_entrega || '',
        item.faturamento_minimo || '',
      ]
      lines.push(row.map(v => `"${v}"`).join(';'))
    }
  }
  
  lines.push('')
  if (!orcamento.ocultar_valor_total) {
    lines.push(`VALOR TOTAL;${formatCurrency(orcamento.valor_total)}`)
  }
  
  if (orcamento.observacoes) {
    lines.push('')
    lines.push('OBSERVAÇÕES')
    lines.push(orcamento.observacoes)
  }
  
  return BOM + lines.join('\n')
}

function generateExcel(orcamento: any, formatCurrency: (v: number) => string): Buffer {
  const workbook = XLSX.utils.book_new()
  
  // Aba 1: Dados do Orçamento
  const dadosOrcamento = [
    ['ORÇAMENTO', ''],
    ['Número', orcamento.numero],
    ['Cliente', orcamento.cliente],
    ['Contato', orcamento.contato || ''],
    ['Validade', orcamento.validade ? format(new Date(orcamento.validade), 'dd/MM/yyyy', { locale: ptBR }) : ''],
    ['Frete', orcamento.frete || ''],
    ['Status', orcamento.status],
    ['Valor Total', !orcamento.ocultar_valor_total ? formatCurrency(orcamento.valor_total) : '(oculto)'],
    ['', ''],
    ['Observações', orcamento.observacoes || ''],
  ]
  
  const wsDados = XLSX.utils.aoa_to_sheet(dadosOrcamento)
  wsDados['!cols'] = [{ wch: 15 }, { wch: 50 }]
  XLSX.utils.book_append_sheet(workbook, wsDados, 'Dados')
  
  // Aba 2: Itens
  const itensHeader = [
    'Código', 'Item', 'Un', 'Qtd', 'Peso Unit.', 
    'Preço Unit.', 'Total', 'Material', 'Processos', 'Prazo', 'Fat. Mínimo'
  ]
  
  const itensData = [itensHeader]
  
  if (orcamento.itens) {
    for (const item of orcamento.itens) {
      itensData.push([
        item.codigo_item,
        item.item,
        item.unidade,
        item.quantidade,
        item.peso_unitario || '',
        item.preco_unitario,
        item.preco_total,
        item.material || '',
        item.processos?.join(', ') || '',
        item.prazo_entrega || '',
        item.faturamento_minimo || '',
      ])
    }
  }
  
  const wsItens = XLSX.utils.aoa_to_sheet(itensData)
  wsItens['!cols'] = [
    { wch: 12 }, { wch: 40 }, { wch: 6 }, { wch: 8 }, { wch: 10 },
    { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 }
  ]
  XLSX.utils.book_append_sheet(workbook, wsItens, 'Itens')
  
  return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }))
}
```

### Botões na Interface

Adicionar ao `orcamento-view.tsx`:

```typescript
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">
      <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={handleExportCSV}>
      📊 Exportar CSV
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleExportExcel}>
      📊 Exportar Excel
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Exportação em Lote

Adicionar funcionalidade de exportar múltiplos orçamentos selecionados na lista.

---

## 🔍 Busca Avançada de Itens

### Objetivo
Permitir buscar orçamentos pelo conteúdo dos itens (código, descrição, material).

### Implementação
Criar uma busca full-text no Supabase ou implementar busca client-side nos itens carregados.

---

## 📈 Dashboard e Relatórios

### Objetivo
Criar um dashboard com métricas e relatórios visuais.

### Métricas sugeridas
- Total de orçamentos por status
- Valor total por período
- Clientes mais frequentes
- Itens mais orçados

---

## 🔔 Notificações

### Objetivo
Notificar sobre orçamentos próximos do vencimento.

### Implementação
- Email automático X dias antes da validade
- Notificação no sistema

---

## 📱 PWA / App Mobile

### Objetivo
Transformar o sistema em um PWA para acesso mobile.

### Funcionalidades
- Offline support
- Push notifications
- Instalação na home screen

---

## 🔗 Integrações

### Objetivo
Integrar com outros sistemas.

### Possíveis integrações
- ERP da empresa
- WhatsApp para envio de orçamentos
- Assinatura digital

---

## 🎨 Temas e Personalização

### Objetivo
Permitir personalização visual.

### Funcionalidades
- Tema claro/escuro
- Cores customizáveis
- Logo personalizado por usuário

