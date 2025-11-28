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
    padding: 40,
    fontFamily: 'Helvetica',
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
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  clienteInfo: {
    textAlign: 'center',
    marginBottom: 20,
  },
  clienteNome: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
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
    fontFamily: 'Helvetica-Bold',
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
  },
})

interface OrcamentoPDFProps {
  orcamento: OrcamentoWithItems
  logoBase64?: string
}

export function OrcamentoPDF({ orcamento, logoBase64 }: OrcamentoPDFProps) {
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
        {logoBase64 && (
          <View style={styles.header}>
            <Image src={logoBase64} style={styles.logo} />
          </View>
        )}

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
                        {item.processos?.length ? `| Processos: ${item.processos.join(', ')} ` : ''}
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

