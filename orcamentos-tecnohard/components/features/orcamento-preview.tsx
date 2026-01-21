'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Paperclip, Download, Eye, FileText, ArrowLeft, Loader2 } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { OrcamentoWithItems, OrcamentoAnexo } from '@/lib/types/app'
import { formatCurrency, formatFaturamentoMinimo } from '@/lib/utils/format'
import { createClient } from '@/lib/supabase/client'

interface OrcamentoPreviewProps {
  orcamento: OrcamentoWithItems
}

export function OrcamentoPreview({ orcamento }: OrcamentoPreviewProps) {
  const [logoError, setLogoError] = useState(false)
  const [configuredLogoUrl, setConfiguredLogoUrl] = useState<string | null>(null)
  const [anexosOpen, setAnexosOpen] = useState(false)
  const [selectedAnexos, setSelectedAnexos] = useState<OrcamentoAnexo[]>([])
  const [selectedItemName, setSelectedItemName] = useState('')
  const [viewingAnexo, setViewingAnexo] = useState<OrcamentoAnexo | null>(null)
  const [anexoUrls, setAnexoUrls] = useState<Record<string, string>>({})
  const [loadingUrls, setLoadingUrls] = useState(false)
  const supabase = createClient()

  // Carregar logo da configuração
  useEffect(() => {
    async function loadConfiguredLogo() {
      try {
        const { data: configLogo } = await supabase
          .from('configuracoes')
          .select('valor')
          .eq('chave', 'logo_path')
          .single()

        if (configLogo?.valor) {
          const { data } = supabase.storage
            .from('configuracoes')
            .getPublicUrl(configLogo.valor)
          
          if (data?.publicUrl) {
            setConfiguredLogoUrl(data.publicUrl)
          }
        }
      } catch (e) {
        console.warn('Erro ao carregar logo configurado:', e)
      }
    }
    loadConfiguredLogo()
  }, [supabase])

  const loadAnexoUrls = async (anexos: OrcamentoAnexo[]) => {
    setLoadingUrls(true)
    const urls: Record<string, string> = {}
    
    for (const anexo of anexos) {
      try {
        const { data, error } = await supabase.storage
          .from('orcamento-anexos')
          .createSignedUrl(anexo.storage_path, 3600) // URL válida por 1 hora
        
        if (!error && data) {
          urls[anexo.id] = data.signedUrl
        }
      } catch (e) {
        console.error('Erro ao gerar URL:', e)
      }
    }
    
    setAnexoUrls(urls)
    setLoadingUrls(false)
  }

  const handleOpenAnexos = async (anexos: OrcamentoAnexo[], itemName: string) => {
    setSelectedAnexos(anexos)
    setSelectedItemName(itemName)
    setViewingAnexo(null)
    setAnexosOpen(true)
    await loadAnexoUrls(anexos)
  }

  const handleCloseAnexos = (open: boolean) => {
    if (!open) {
      setViewingAnexo(null)
      setAnexoUrls({})
    }
    setAnexosOpen(open)
  }

  const handleDownloadAnexo = async (anexo: OrcamentoAnexo) => {
    try {
      const { data, error } = await supabase.storage
        .from('orcamento-anexos')
        .download(anexo.storage_path)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = anexo.nome_arquivo
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao baixar anexo:', error)
    }
  }

  const getAnexoUrl = (anexo: OrcamentoAnexo) => {
    return anexoUrls[anexo.id] || ''
  }

  const isImage = (tipo: string) => tipo.startsWith('image/')
  
  return (
    <>
    {/* Dialog de Anexos */}
    <Dialog open={anexosOpen} onOpenChange={handleCloseAnexos}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {viewingAnexo ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingAnexo(null)}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
                </Button>
                <span className="truncate">{viewingAnexo.nome_arquivo}</span>
              </>
            ) : (
              <>📎 Anexos - {selectedItemName}</>
            )}
          </DialogTitle>
        </DialogHeader>

        {viewingAnexo ? (
          /* Visualização do anexo em tela cheia */
          <div className="mt-4 space-y-4">
            {isImage(viewingAnexo.tipo_arquivo) ? (
              <div className="flex justify-center bg-gray-100 rounded-lg p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getAnexoUrl(viewingAnexo)}
                  alt={viewingAnexo.nome_arquivo}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-[60vh] bg-gray-100 rounded-lg">
                <iframe
                  src={getAnexoUrl(viewingAnexo)}
                  className="w-full h-full rounded-lg"
                  title={viewingAnexo.nome_arquivo}
                />
              </div>
            )}
            <div className="flex justify-center">
              <Button onClick={() => handleDownloadAnexo(viewingAnexo)}>
                <Download className="mr-2 h-4 w-4" /> Baixar arquivo
              </Button>
            </div>
          </div>
        ) : (
          /* Lista de anexos */
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {selectedAnexos.map((anexo) => (
              <div key={anexo.id} className="border rounded-lg p-3 space-y-2">
                {isImage(anexo.tipo_arquivo) ? (
                  <div 
                    className="aspect-video bg-gray-100 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setViewingAnexo(anexo)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getAnexoUrl(anexo)}
                      alt={anexo.nome_arquivo}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div 
                    className="aspect-video bg-gray-100 rounded flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => setViewingAnexo(anexo)}
                  >
                    <FileText className="h-12 w-12 text-red-500" />
                  </div>
                )}
                <p className="text-sm font-medium truncate" title={anexo.nome_arquivo}>
                  {anexo.nome_arquivo}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setViewingAnexo(anexo)}
                  >
                    <Eye className="mr-1 h-4 w-4" /> Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownloadAnexo(anexo)}
                  >
                    <Download className="mr-1 h-4 w-4" /> Baixar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
    
    <Card className="bg-white shadow-lg">
      <CardContent className="p-8 space-y-8">
        {/* Número do orçamento no canto superior direito */}
        <div className="relative">
          <span className="absolute top-0 right-0 text-sm font-medium text-gray-600">
            Nº: {orcamento.numero}
          </span>
          
          {/* Cabeçalho com Logo centralizado */}
          <div className="flex justify-center pt-4">
            {!logoError ? (
              <Image
                src={configuredLogoUrl || "/logo-tecnohard.png"}
                alt="Logo da Empresa"
                width={300}
                height={120}
                className="object-contain"
                priority
                onError={() => setLogoError(true)}
              />
            ) : (
              <h1 className="text-3xl font-bold text-blue-800">TECNO HARD</h1>
            )}
          </div>
        </div>

        {/* Dados do Cliente */}
        <div className="text-center space-y-2">
          <p className="text-xl font-semibold text-gray-700">
            Cliente: {orcamento.cliente}
          </p>
          {orcamento.contato && (
            <p className="text-gray-600">Contato: {orcamento.contato}</p>
          )}
          {orcamento.validade && (
            <p className="text-gray-600">
              Validade: {format(new Date(orcamento.validade), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          )}
        </div>

        {/* Tabela de Itens */}
        {orcamento.itens && orcamento.itens.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
              ITENS DO ORÇAMENTO
            </h2>
            
            {/* Scroll horizontal em mobile */}
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Item</TableHead>
                    <TableHead className="font-semibold w-[100px]">Material</TableHead>
                    <TableHead className="font-semibold text-center w-[80px]">
                      <div>Prazo</div>
                      <div className="text-xs font-normal text-gray-500">(dias úteis)</div>
                    </TableHead>
                    <TableHead className="font-semibold text-right w-[100px]">Fat. Min.</TableHead>
                    <TableHead className="font-semibold text-center w-[80px]">Peso Un.</TableHead>
                    <TableHead className="font-semibold text-right w-[100px]">Preço</TableHead>
                    <TableHead className="font-semibold text-center w-[60px]">Anexos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orcamento.itens.map((item) => (
                    <TableRow key={item.id}>
                      {/* Coluna Item: código + descrição + processos */}
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {item.codigo_item && <span className="font-mono">{item.codigo_item} - </span>}
                            {item.item}
                          </p>
                          {item.processos && item.processos.length > 0 && (
                            <p className="text-sm text-gray-500">{item.processos.join(', ')}</p>
                          )}
                        </div>
                      </TableCell>
                      {/* Coluna Material */}
                      <TableCell className="text-sm">
                        {item.material || '-'}
                      </TableCell>
                      {/* Coluna Prazo */}
                      <TableCell className="text-center">
                        {item.prazo_entrega || '-'}
                      </TableCell>
                      {/* Coluna Faturamento Mínimo */}
                      <TableCell className="text-right text-sm">
                        {item.faturamento_minimo ? formatFaturamentoMinimo(item.faturamento_minimo) : '-'}
                      </TableCell>
                      {/* Coluna Peso Unitário */}
                      <TableCell className="text-center text-sm">
                        {item.unidade === 'kg' ? '-' : (item.peso_unitario ? `${item.peso_unitario} kg` : '-')}
                      </TableCell>
                      {/* Coluna Preço */}
                      <TableCell className="text-right">
                        {formatCurrency(item.preco_unitario)}
                        {item.unidade === 'kg' ? '/kg' : '/pc'}
                      </TableCell>
                      {/* Coluna Anexos */}
                      <TableCell className="text-center">
                        {item.anexos && item.anexos.length > 0 ? (
                          <button
                            onClick={() => handleOpenAnexos(item.anexos || [], item.item)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            title={`Ver ${item.anexos.length} anexo(s)`}
                          >
                            <Paperclip className="h-4 w-4" />
                            <span>{item.anexos.length}</span>
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Informações Gerais */}
        {(orcamento.frete || orcamento.prazo_faturamento || orcamento.observacoes) && (
          <div className="space-y-2 border-t pt-4">
            <h2 className="text-lg font-semibold text-gray-800">INFORMAÇÕES GERAIS</h2>
            {orcamento.frete && <p><span className="font-medium">Frete:</span> {orcamento.frete}</p>}
            {orcamento.prazo_faturamento && <p><span className="font-medium">Prazo de Faturamento:</span> {orcamento.prazo_faturamento}</p>}
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

        {/* Elaborado por */}
        {orcamento.elaborado_por && (
          <div className="text-right mt-4">
            <p className="text-sm font-medium text-gray-600 mb-1">Elaborado por:</p>
            {orcamento.elaborado_por.split('\n').map((linha, idx) => (
              <p key={idx} className="text-sm text-gray-600">{linha}</p>
            ))}
          </div>
        )}

        {/* Rodapé */}
        <div className="text-center text-sm text-gray-500 border-t pt-6">
          <p>R. Emílio Fonini, 521 - Cinquentenário, Caxias do Sul - RS</p>
          <p>(54) 3225-6464 - https://www.tecnohard.ind.br/</p>
        </div>
      </CardContent>
    </Card>
    </>
  )
}

