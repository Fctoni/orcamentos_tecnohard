import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Buscar informações do anexo
    const { data: anexo, error } = await supabase
      .from('orcamento_anexos')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !anexo) {
      return NextResponse.json({ error: 'Anexo não encontrado' }, { status: 404 })
    }

    // Buscar arquivo do Storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('orcamento-anexos')
      .download(anexo.storage_path)

    if (downloadError || !fileData) {
      return NextResponse.json({ error: 'Erro ao baixar arquivo' }, { status: 500 })
    }

    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': anexo.tipo_arquivo,
        'Content-Disposition': `inline; filename="${anexo.nome_arquivo}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Erro ao servir anexo:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

