import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { OrcamentoPDF } from '@/components/features/orcamento-pdf'
import path from 'path'
import fs from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      .eq('id', id)
      .single()

    if (error || !orcamento) {
      return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
    }

    // Ordenar itens
    if (orcamento.itens) {
      orcamento.itens.sort((a: any, b: any) => a.ordem - b.ordem)
    }

    // Carregar logo como base64
    let logoBase64: string | undefined
    try {
      const logoPath = path.join(process.cwd(), 'public', 'logo-tecnohard.png')
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath)
        logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`
      }
    } catch (e) {
      console.warn('Logo não encontrada:', e)
    }

    // Gerar PDF
    const pdfBuffer = await renderToBuffer(
      <OrcamentoPDF orcamento={orcamento as any} logoBase64={logoBase64} />
    )

    // Converter Buffer para Uint8Array para compatibilidade com NextResponse
    const uint8Array = new Uint8Array(pdfBuffer)

    return new NextResponse(uint8Array, {
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

