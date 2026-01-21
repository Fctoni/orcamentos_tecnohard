import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { OrcamentoWithItems } from '@/lib/types/app'

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1E293B',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 270,
    objectFit: 'contain',
  },
  orcamentoNumero: {
    position: 'absolute',
    top: 25,
    right: 25,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  // Item 07: Titulo com fonte menor
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  clienteInfo: {
    textAlign: 'center',
    marginBottom: 20,
  },
  // Item 08: Nome cliente com fonte ~10% maior (14 -> 15.4, arredondando para 16)
  clienteNome: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 10,
    marginBottom: 2,
  },
  // Wrapper para conteudo do rodape (infos gerais + elaborado por)
  footerContent: {
    marginTop: 'auto',
    marginBottom: 60,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 4,
    marginBottom: 10,
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  col1: {
     width: '42%',
     paddingHorizontal: 6,
  },
  col2: { width: '12%', textAlign: 'center' },
  col3: { width: '10%', textAlign: 'center' },
  col4: { width: '12%', textAlign: 'center' },
  col5: { width: '10%', textAlign: 'center' },
  col6: { width: '14%', textAlign: 'center' },
  colHeader: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    textAlign: 'center',
  },
  colCell: {
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
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#64748B',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
  pageNumber: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    fontSize: 8,
    color: '#64748B',
  },
  // Item 06: Elaborado por - alinhado a direita
  elaboradoPor: {
    textAlign: 'right',
    marginTop: 20,
    marginBottom: 20,
    paddingTop: 10,
   /* borderTopWidth: 1,
    borderTopColor: '#E2E8F0',*/
  },
  elaboradoPorLabel: {
    fontSize: 9,
    color: '#64748B',
    marginBottom: 4,
  },
  elaboradoPorText: {
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
})

interface OrcamentoPDFProps {
  orcamento: OrcamentoWithItems & { elaborado_por?: string | null }
  logoBase64?: string
}

export function OrcamentoPDF({ orcamento, logoBase64 }: OrcamentoPDFProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Formata faturamento mínimo para sempre ter R$ e 2 casas decimais
  const formatFaturamentoMinimo = (value: string) => {
    if (!value) return value
    const cleanValue = value.replace(/R\$\s*/gi, '').replace(/\s/g, '').replace(',', '.')
    const numericValue = parseFloat(cleanValue)
    if (isNaN(numericValue)) return value
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numericValue)
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Numero do Orcamento - canto superior direito (repete em todas paginas) */}
        <Text style={styles.orcamentoNumero} fixed>Nº: {orcamento.numero}</Text>

        {/* Header com Logo - centralizado (repete em todas paginas) */}
        {logoBase64 && (
          <View style={styles.header} fixed>
            <Image src={logoBase64} style={styles.logo} />
          </View>
        )}

        {/* Dados do Cliente - Item 08: fonte maior */}
        <View style={styles.clienteInfo}>
          <Text style={styles.clienteNome}>Cliente: {orcamento.cliente}</Text>
          {orcamento.contato && (
            <Text style={styles.infoText}>Contato: {orcamento.contato}</Text>
          )}
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
              {/* Header da tabela (repete em todas paginas) */}
              <View style={styles.tableHeader} fixed>
                <Text style={[styles.col1, styles.colHeader]}>Item</Text>
                <Text style={[styles.col2, styles.colHeader]}>Material</Text>
                <View style={styles.col3}>
                  <Text style={styles.colHeader}>Prazo</Text>
                  <Text style={{ fontSize: 6, textAlign: 'center' }}>(dias uteis)</Text>
                </View>
                <Text style={[styles.col4, styles.colHeader]}>Fat. Mín.</Text>
                <Text style={[styles.col5, styles.colHeader]}>Peso Un.</Text>
                <Text style={[styles.col6, styles.colHeader]}>Preço</Text>
              </View>

              {/* Linhas */}
              {orcamento.itens.map((item) => {
                const isPorKg = item.unidade === 'kg'
                const precoLabel = isPorKg ? '/kg' : '/pç'
                
                return (
                  <View key={item.id} style={styles.tableRow} wrap={false}>
                    <View style={styles.col1}>
                      <Text style={styles.colCell}>{item.codigo_item} - {item.item}</Text>
                      {item.processos && item.processos.length > 0 && (
                        <Text style={styles.detalhes}>{item.processos.join(', ')}</Text>
                      )}
                    </View>
                    <Text style={[styles.col2, styles.colCell]}>{item.material || '-'}</Text>
                    <Text style={[styles.col3, styles.colCell]}>
                      {item.prazo_entrega ? `${item.prazo_entrega}${!isNaN(Number(item.prazo_entrega)) ? '' : ''}` : '-'}
                    </Text>
                    <Text style={[styles.col4, styles.colCell]}>
                      {item.faturamento_minimo ? formatFaturamentoMinimo(item.faturamento_minimo) : '-'}
                    </Text>
                    <Text style={[styles.col5, styles.colCell]}>
                      {isPorKg ? '-' : (item.peso_unitario ? `${item.peso_unitario} kg` : '-')}
                    </Text>
                    <Text style={[styles.col6, styles.colCell]}>{formatCurrency(item.preco_unitario)}{precoLabel}</Text>
                  </View>
                )
              })}
            </View>
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

        {/* Wrapper para empurrar infos gerais e elaborado por para acima do rodape */}
        <View style={styles.footerContent}>
          {/* Informacoes Gerais */}
          {(orcamento.frete || orcamento.prazo_faturamento || orcamento.observacoes) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>INFORMAÇÕES GERAIS</Text>
              {orcamento.frete && <Text style={styles.infoText}>Frete: {orcamento.frete}</Text>}
              {orcamento.prazo_faturamento && <Text style={styles.infoText}>Prazo de Faturamento: {orcamento.prazo_faturamento}</Text>}
              {orcamento.observacoes && <Text style={styles.infoText}>{orcamento.observacoes}</Text>}
            </View>
          )}

          {/* Elaborado por */}
          {orcamento.elaborado_por && (
           <View style={styles.elaboradoPor}>
              {orcamento.elaborado_por.split('\n').map((linha, idx) => (
                <Text key={idx} style={styles.elaboradoPorText}>{linha}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Rodapé */}
        <View style={styles.footer} fixed>
          <Text>R. Emílio Fonini, 521 - Cinquentenário, Caxias do Sul - RS</Text>
          <Text>(54) 3225-6464 - https://www.tecnohard.ind.br/</Text>
          <Text 
            style={styles.pageNumber} 
            render={({ pageNumber, totalPages }) => 
              totalPages > 1 ? `${pageNumber}/${totalPages}` : ''
            } 
          />
        </View>
      </Page>
    </Document>
  )
}

