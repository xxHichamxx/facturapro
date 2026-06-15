import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Times-Roman",
    fontSize: 10,
    color: "#1e293b",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  companyInfo: {
    width: "60%",
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E3A5F",
    marginBottom: 4,
  },
  docType: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E75B6",
    textAlign: "right",
    marginBottom: 4,
  },
  clientSection: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#F4F6F9",
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#1E3A5F",
  },
  table: {
    width: "100%",
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#2E75B6",
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 6,
  },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 1.5, textAlign: "right" },
  colTVA: { flex: 1, textAlign: "right" },
  colTotal: { flex: 1.5, textAlign: "right" },
  totalsSection: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "40%",
    marginBottom: 4,
  },
  totalLabel: {
    width: "50%",
    textAlign: "right",
    paddingRight: 10,
    color: "#64748B",
  },
  totalValue: {
    width: "50%",
    textAlign: "right",
  },
  totalBold: {
    fontSize: 14,
    fontWeight: "bold",
  },
  notes: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#F4F6F9",
    borderRadius: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#94A3B8",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 8,
  },
});

export function InvoicePDF({ document, lines }: { document: any; lines: any[] }) {
  const company = document.company;
  const client = document.client;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{company?.name || "Entreprise"}</Text>
            <Text>{company?.address}</Text>
            <Text>{company?.city}, {company?.country || "Maroc"}</Text>
            <Text>ICE: {company?.ice}</Text>
            <Text>IF: {company?.if_fiscal} | RC: {company?.rc}</Text>
          </View>
          <View>
            <Text style={styles.docType}>
              {document.type === "invoice" ? "FACTURE" : "DEVIS"}
            </Text>
            <Text style={{ textAlign: "right" }}>{document.number}</Text>
            <Text style={{ textAlign: "right", marginTop: 4 }}>
              Date: {document.issue_date}
            </Text>
            {document.due_date && (
              <Text style={{ textAlign: "right" }}>
                Échéance: {document.due_date}
              </Text>
            )}
          </View>
        </View>

        {/* Client */}
        <View style={styles.clientSection}>
          <Text style={styles.sectionTitle}>Client</Text>
          <Text style={{ fontWeight: "bold" }}>{client?.name}</Text>
          {client?.address && <Text>{client.address}</Text>}
          {client?.email && <Text>{client.email}</Text>}
          {client?.ice_client && <Text>ICE: {client.ice_client}</Text>}
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colQty}>Qté</Text>
            <Text style={styles.colPrice}>Prix unitaire</Text>
            <Text style={styles.colTVA}>TVA</Text>
            <Text style={styles.colTotal}>Total HT</Text>
          </View>
          {lines.map((line: any, i: number) => (
            <View style={styles.tableRow} key={i} wrap={false}>
              <Text style={styles.colDesc}>{line.description}</Text>
              <Text style={styles.colQty}>{line.quantity}</Text>
              <Text style={styles.colPrice}>
                {Number(line.unit_price).toFixed(2)} {document.currency}
              </Text>
              <Text style={styles.colTVA}>{line.tva_rate}%</Text>
              <Text style={styles.colTotal}>
                {Number(line.total_ht).toFixed(2)} {document.currency}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total HT</Text>
            <Text style={styles.totalValue}>
              {Number(document.subtotal_ht).toFixed(2)} {document.currency}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA</Text>
            <Text style={styles.totalValue}>
              {Number(document.tva_amount).toFixed(2)} {document.currency}
            </Text>
          </View>
          <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: "#1E3A5F", paddingTop: 4 }]}>
            <Text style={[styles.totalLabel, styles.totalBold]}>Total TTC</Text>
            <Text style={[styles.totalValue, styles.totalBold]}>
              {Number(document.total_ttc).toFixed(2)} {document.currency}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {(document.notes || document.payment_terms || document.at_number) && (
          <View style={styles.notes}>
            {document.notes && <Text>{document.notes}</Text>}
            {document.payment_terms && (
              <Text style={{ marginTop: 4 }}>
                Conditions: {document.payment_terms}
              </Text>
            )}
            {document.at_number && (
              <View style={{ marginTop: 6, borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingTop: 6 }}>
                <Text style={{ fontWeight: "bold", fontSize: 9 }}>Admission Temporaire</Text>
                <Text style={{ fontSize: 8 }}>AT N°: {document.at_number}</Text>
                {document.at_date && <Text style={{ fontSize: 8 }}>Date AT: {document.at_date}</Text>}
                {document.at_bureau && <Text style={{ fontSize: 8 }}>Bureau: {document.at_bureau}</Text>}
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          {company?.name} — {company?.ice} — Document généré avec FacturaPro
        </Text>
      </Page>
    </Document>
  );
}
