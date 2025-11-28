'use client'

import { useState } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { OrcamentoWithItems } from '@/lib/types/app'
import { formatCurrency } from '@/lib/utils/format'

interface OrcamentoPreviewProps {
  orcamento: OrcamentoWithItems
}

export function OrcamentoPreview({ orcamento }: OrcamentoPreviewProps) {
  const [logoError, setLogoError] = useState(false)
  
  return (
    <Card className="bg-white shadow-lg">
      <CardContent className="p-8 space-y-8">
        {/* Cabeçalho com Logo */}
        <div className="flex justify-center">
          {!logoError ? (
            <Image
              src="/logo-tecnohard.png"
              alt="Tecno Hard"
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
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
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

