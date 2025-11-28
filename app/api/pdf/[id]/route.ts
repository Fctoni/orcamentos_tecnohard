import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // TODO: Implementar geração de PDF
  return NextResponse.json({ message: 'PDF generation - Em desenvolvimento', id: params.id })
}


