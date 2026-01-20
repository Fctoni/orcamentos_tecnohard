# 📄 FASE 6: Visualização e PDF

**Duração Estimada:** Semana 4  
**Objetivo:** Layout profissional de visualização e geração de PDF

---

## 📋 Checklist de Tarefas

- [ ] 6.1 Criar página de visualização
- [ ] 6.2 Criar componente OrcamentoPreview
- [ ] 6.3 Criar layout idêntico ao PDF
- [ ] 6.4 Configurar react-pdf
- [ ] 6.5 Criar componente OrcamentoPDF
- [ ] 6.6 Implementar API route para PDF
- [ ] 6.7 Integrar logo da empresa
- [ ] 6.8 Renderizar anexos em miniatura
- [ ] 6.9 Implementar botão de download

---

## 6.1 Página de Visualização

**`app/(dashboard)/orcamentos/[id]/page.tsx`:**

```typescript
import { Suspense } from 'react'
import { OrcamentoView } from '@/components/features/orcamento-view'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  params: { id: string }
}

export default function VisualizarOrcamentoPage({ params }: Props) {
  return (
    <Suspense fallback={<ViewSkeleton />}>
      <OrcamentoView orcamentoId={params.id} />
    </Suspense>
  )
}

function ViewSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[800px] w-full" />
    </div>
  )
}
```

---

## 6.2 Componente OrcamentoView

**`components/features/orcamento-view.tsx`:**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit, FileDown, Copy, RefreshCw, FileSpreadsheet } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { OrcamentoPreview } from './orcamento-preview'
import { StatusBadge } from './status-badge'
import { useOrcamento } from '@/lib/hooks/use-orcamento'
import { useToast } from '@/hooks/use-toast'
import { OrcamentoStatus, STATUS_CONFIG } from '@/lib/types/app'

interface OrcamentoViewProps {
  orcamentoId: string
}

export function OrcamentoView({ orcamentoId }: OrcamentoViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { orcamento, loading, updateOrcamento, duplicateOrcamento } = useOrcamento(orcamentoId)
  const [downloading, setDownloading] = useState(false)

  const handleStatusChange = async (status: OrcamentoStatus) => {
    const { error } = await updateOrcamento({ status })
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar status' })
    } else {
      toast({ title: 'Status atualizado!' })
    }
  }

  const handleDuplicate = async () => {
    const { data, error } = await duplicateOrcamento(orcamentoId)
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao duplicar' })
    } else if (data) {
      toast({ title: 'Orçamento duplicado!' })
      router.push(`/orcamentos/${data.id}/editar`)
    }
  }

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      const response = await fetch(`/api/pdf/${orcamentoId}`)
      if (!response.ok) throw new Error('Erro ao gerar PDF')
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Orcamento-${orcamento?.numero}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast({ title: 'PDF baixado com sucesso!' })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao gerar PDF' })
    } finally {
      setDownloading(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      const response = await fetch(`/api/export?id=${orcamentoId}&format=csv`)
      if (!response.ok) throw new Error('Erro ao exportar')
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Orcamento-${orcamento?.numero}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast({ title: 'CSV exportado!' })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao exportar CSV' })
    }
  }

  const handleExportExcel = async () => {
    try {
      const response = await fetch(`/api/export?id=${orcamentoId}&format=xlsx`)
      if (!response.ok) throw new Error('Erro ao exportar')
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Orcamento-${orcamento?.numero}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast({ title: 'Excel exportado!' })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao exportar Excel' })
    }
  }

  if (loading) {
    return <Skeleton className="h-[800px] w-full" />
  }

  if (!orcamento) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Orçamento não encontrado</p>
        <Button variant="link" onClick={() => router.push('/orcamentos')}>
          Voltar para lista
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/orcamentos')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Orçamento {orcamento.numero}</h1>
            <StatusBadge status={orcamento.status as OrcamentoStatus} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push(`/orcamentos/${orcamentoId}/editar`)}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>

          <Button onClick={handleDownloadPDF} disabled={downloading}>
            <FileDown className="mr-2 h-4 w-4" />
            {downloading ? 'Gerando...' : 'Baixar PDF'}
          </Button>

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

          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" /> Duplicar
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" /> Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => handleStatusChange(key as OrcamentoStatus)}
                >
                  {config.icon} {config.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Preview do orçamento */}
      <OrcamentoPreview orcamento={orcamento} />
    </div>
  )
}
```

---

## 6.3 Componente OrcamentoPreview

**`components/features/orcamento-preview.tsx`:**

```typescript
'use client'

import Image from 'next/image'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { OrcamentoWithItems } from '@/lib/types/app'
import { formatCurrency } from '@/lib/utils/format'

interface OrcamentoPreviewProps {
  orcamento: OrcamentoWithItems
}

export function OrcamentoPreview({ orcamento }: OrcamentoPreviewProps) {
  return (
    <Card className="bg-white shadow-lg">
      <CardContent className="p-8 space-y-8">
        {/* Cabeçalho com Logo */}
        <div className="flex justify-center">
          <Image
            src="/logo-tecnohard.png"
            alt="Tecno Hard"
            width={300}
            height={120}
            className="object-contain"
            priority
          />
        </div>

        {/* Título e Dados do Cliente */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">ORÇAMENTO</h1>
          
          <div className="space-y-1">
            <p className="text-xl font-semibold text-gray-700">
              Cliente: {orcamento.cliente}
            </p>
            {orcamento.contato && (
              <p className="text-gray-600">Contato: {orcamento.contato}</p>
            )}
          </div>

          <div className="text-gray-600">
            <p>Orçamento Nº: <span className="font-semibold">{orcamento.numero}</span></p>
            {orcamento.validade && (
              <p>Validade: {format(new Date(orcamento.validade), 'dd/MM/yyyy', { locale: ptBR })}</p>
            )}
          </div>
        </div>

        {/* Tabela de Itens */}
        {orcamento.itens && orcamento.itens.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
              ITENS DO ORÇAMENTO
            </h2>
            
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Código</TableHead>
                  <TableHead className="font-semibold">Item</TableHead>
                  <TableHead className="font-semibold text-center">Qtd</TableHead>
                  <TableHead className="font-semibold text-center">Un</TableHead>
                  <TableHead className="font-semibold text-right">Preço Un.</TableHead>
                  <TableHead className="font-semibold text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orcamento.itens.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono">{item.codigo_item}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{item.item}</p>
                        {/* Detalhes adicionais */}
                        <div className="text-sm text-gray-500 space-y-0.5">
                          {item.material && <p>Material: {item.material}</p>}
                          {item.processos && item.processos.length > 0 && (
                            <p>Processos: {item.processos.join(', ')}</p>
                          )}
                          {item.prazo_entrega && <p>Prazo: {item.prazo_entrega}</p>}
                          {item.faturamento_minimo && <p>Fat. Mínimo: {item.faturamento_minimo}</p>}
                        </div>
                        {/* Miniaturas dos anexos */}
                        {item.anexos && item.anexos.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.anexos
                              .filter(a => a.tipo_arquivo.startsWith('image/'))
                              .slice(0, 4)
                              .map((anexo) => (
                                <div
                                  key={anexo.id}
                                  className="w-16 h-12 bg-gray-100 rounded border overflow-hidden"
                                >
                                  <img
                                    src={`/api/anexo/${anexo.id}`}
                                    alt={anexo.nome_arquivo}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{item.quantidade}</TableCell>
                    <TableCell className="text-center">{item.unidade}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.preco_unitario)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(item.preco_total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Informações Gerais */}
        {(orcamento.frete || orcamento.observacoes) && (
          <div className="space-y-2 border-t pt-4">
            <h2 className="text-lg font-semibold text-gray-800">INFORMAÇÕES GERAIS</h2>
            {orcamento.frete && <p><span className="font-medium">Frete:</span> {orcamento.frete}</p>}
            {orcamento.observacoes && (
              <p><span className="font-medium">Observações:</span> {orcamento.observacoes}</p>
            )}
          </div>
        )}

        {/* Valor Total */}
        {!orcamento.ocultar_valor_total && (
          <div className="text-right border-t pt-4">
            <p className="text-2xl font-bold text-gray-800">
              VALOR TOTAL: {formatCurrency(orcamento.valor_total)}
            </p>
          </div>
        )}

        {/* Rodapé */}
        <div className="text-center text-sm text-gray-500 border-t pt-6">
          <p>R. Emílio Fonini, 521 - Cinquentenário, Caxias do Sul - RS</p>
          <p>(54) 3225-6464 - https://www.tecnohard.ind.br/</p>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 6.4 API Route para PDF

**`app/api/pdf/[id]/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { OrcamentoPDF } from '@/components/features/orcamento-pdf'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Buscar orçamento com itens e anexos
    const { data: orcamento, error } = await supabase
      .from('orcamentos')
      .select(`
        *,
        itens:orcamento_itens(
          *,
          anexos:orcamento_anexos(*)
        )
      `)
      .eq('id', params.id)
      .single()

    if (error || !orcamento) {
      return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
    }

    // Ordenar itens
    if (orcamento.itens) {
      orcamento.itens.sort((a: any, b: any) => a.ordem - b.ordem)
    }

    // Gerar PDF
    const pdfBuffer = await renderToBuffer(
      <OrcamentoPDF orcamento={orcamento} />
    )

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Orcamento-${orcamento.numero}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    return NextResponse.json({ error: 'Erro ao gerar PDF' }, { status: 500 })
  }
}
```

---

## 6.5 Componente OrcamentoPDF (react-pdf)

**`components/features/orcamento-pdf.tsx`:**

```typescript
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { OrcamentoWithItems } from '@/lib/types/app'

// Registrar fonte (opcional)
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2' },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#1E293B',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 80,
    objectFit: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 10,
  },
  clienteInfo: {
    textAlign: 'center',
    marginBottom: 20,
  },
  clienteNome: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 10,
    marginBottom: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 4,
    marginBottom: 10,
  },
  table: {
    display: 'flex',
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    padding: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    padding: 8,
  },
  col1: { width: '12%' },
  col2: { width: '38%' },
  col3: { width: '8%', textAlign: 'center' },
  col4: { width: '8%', textAlign: 'center' },
  col5: { width: '17%', textAlign: 'right' },
  col6: { width: '17%', textAlign: 'right' },
  colHeader: {
    fontWeight: 600,
    fontSize: 9,
  },
  detalhes: {
    fontSize: 8,
    color: '#64748B',
    marginTop: 4,
  },
  totalSection: {
    marginTop: 20,
    textAlign: 'right',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 700,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#64748B',
  },
})

interface OrcamentoPDFProps {
  orcamento: OrcamentoWithItems
}

export function OrcamentoPDF({ orcamento }: OrcamentoPDFProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header com Logo */}
        <View style={styles.header}>
          <Image src="/logo-tecnohard.png" style={styles.logo} />
        </View>

        {/* Título */}
        <Text style={styles.title}>ORÇAMENTO</Text>

        {/* Dados do Cliente */}
        <View style={styles.clienteInfo}>
          <Text style={styles.clienteNome}>Cliente: {orcamento.cliente}</Text>
          {orcamento.contato && (
            <Text style={styles.infoText}>Contato: {orcamento.contato}</Text>
          )}
          <Text style={styles.infoText}>Orçamento Nº: {orcamento.numero}</Text>
          {orcamento.validade && (
            <Text style={styles.infoText}>
              Validade: {format(new Date(orcamento.validade), 'dd/MM/yyyy', { locale: ptBR })}
            </Text>
          )}
        </View>

        {/* Tabela de Itens */}
        {orcamento.itens && orcamento.itens.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ITENS DO ORÇAMENTO</Text>
            
            <View style={styles.table}>
              {/* Header da tabela */}
              <View style={styles.tableHeader}>
                <Text style={[styles.col1, styles.colHeader]}>Código</Text>
                <Text style={[styles.col2, styles.colHeader]}>Item</Text>
                <Text style={[styles.col3, styles.colHeader]}>Qtd</Text>
                <Text style={[styles.col4, styles.colHeader]}>Un</Text>
                <Text style={[styles.col5, styles.colHeader]}>Preço Un.</Text>
                <Text style={[styles.col6, styles.colHeader]}>Total</Text>
              </View>

              {/* Linhas */}
              {orcamento.itens.map((item) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={styles.col1}>{item.codigo_item}</Text>
                  <View style={styles.col2}>
                    <Text>{item.item}</Text>
                    {(item.material || item.processos?.length || item.prazo_entrega) && (
                      <Text style={styles.detalhes}>
                        {item.material && `Material: ${item.material} `}
                        {item.processos?.length && `| Processos: ${item.processos.join(', ')} `}
                        {item.prazo_entrega && `| Prazo: ${item.prazo_entrega}`}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.col3}>{item.quantidade}</Text>
                  <Text style={styles.col4}>{item.unidade}</Text>
                  <Text style={styles.col5}>{formatCurrency(item.preco_unitario)}</Text>
                  <Text style={styles.col6}>{formatCurrency(item.preco_total)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Informações Gerais */}
        {(orcamento.frete || orcamento.observacoes) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INFORMAÇÕES GERAIS</Text>
            {orcamento.frete && <Text style={styles.infoText}>Frete: {orcamento.frete}</Text>}
            {orcamento.observacoes && <Text style={styles.infoText}>Observações: {orcamento.observacoes}</Text>}
          </View>
        )}

        {/* Valor Total */}
        {!orcamento.ocultar_valor_total && (
          <View style={styles.totalSection}>
            <Text style={styles.totalText}>
              VALOR TOTAL: {formatCurrency(orcamento.valor_total)}
            </Text>
          </View>
        )}

        {/* Rodapé */}
        <View style={styles.footer} fixed>
          <Text>R. Emílio Fonini, 521 - Cinquentenário, Caxias do Sul - RS</Text>
          <Text>(54) 3225-6464 - https://www.tecnohard.ind.br/</Text>
        </View>
      </Page>
    </Document>
  )
}
```

---

## ✅ Critérios de Conclusão da Fase 6

- [ ] Página de visualização renderizando corretamente
- [ ] Layout idêntico ao especificado no PRD
- [ ] Logo centralizado e proporcional
- [ ] Tabela de itens com todos os campos
- [ ] Detalhes dos itens (material, processos, prazo)
- [ ] Miniaturas de anexos (imagens)
- [ ] Informações gerais (frete, observações)
- [ ] Valor total (quando não oculto)
- [ ] Rodapé com endereço da empresa
- [ ] Geração de PDF funcionando
- [ ] Download do PDF com nome correto
- [ ] Botões de ação funcionando (editar, duplicar, status)

---

## 🔗 Próxima Fase

➡️ [FASE 7: Exportações e Ações](./FASE7.MD)




