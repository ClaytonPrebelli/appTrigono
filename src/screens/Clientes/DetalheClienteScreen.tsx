import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert,
  TouchableOpacity, Linking,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Cliente } from '../../types/cliente';
import { Cobranca } from '../../types/cobranca';
import { clientesApi } from '../../api/clientes';
import { cobrancasApi } from '../../api/cobrancas';
import { colors, spacing, borderRadius } from '../../theme';

type DetalheRoute = RouteProp<RootStackParamList, 'DetalheCliente'>;

export default function DetalheClienteScreen() {
  const route = useRoute<DetalheRoute>();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);

  useEffect(() => {
    clientesApi.verPorId(route.params.id)
      .then((c) => {
        setCliente(c);
        cobrancasApi.listarPorCliente(c.id, 1, 50)
          .then(setCobrancas)
          .catch(() => {});
      })
      .catch((err) => Alert.alert('Erro', err.message || 'Falha ao carregar cliente'))
      .finally(() => setLoading(false));
  }, [route.params.id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!cliente) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Cliente não encontrado</Text>
      </View>
    );
  }

  const Field = ({ label, value }: { label: string; value?: string | null }) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '-'}</Text>
    </View>
  );

  const handleDownloadCert = () => {
    if (cliente.linkCertificado) {
      Linking.openURL(cliente.linkCertificado).catch(() =>
        Alert.alert('Erro', 'Não foi possível abrir o link do certificado')
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados da Empresa</Text>
        <Field label="Razão Social" value={cliente.razaoSocial} />
        <Field label="Nome Fantasia" value={cliente.nomeFantasia} />
        <Field label="CNPJ" value={cliente.cnpj} />
        <Field label="Porte" value={cliente.porte} />
        <Field label="Natureza Jurídica" value={cliente.naturezaJuridica} />
        <Field label="Regime" value={cliente.regime} />
        <Field label="CNAE" value={cliente.descricaoCNAE} />
        {cliente.isMei && <Text style={styles.badge}>MEI</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Endereço</Text>
        <Field label="Logradouro" value={cliente.logradouro} />
        <Field label="Número" value={cliente.numero} />
        <Field label="Complemento" value={cliente.complemento} />
        <Field label="Bairro" value={cliente.bairro} />
        <Field label="Cidade/UF" value={`${cliente.cidade}/${cliente.estado}`} />
        <Field label="CEP" value={cliente.cep} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contato</Text>
        <Field label="Telefone" value={cliente.fone} />
        <Field label="Email" value={cliente.email} />
        <Field label="Representante" value={cliente.representante} />
        <Field label="CPF Representante" value={cliente.cpfRepresentante} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certificado Digital</Text>
        <Field label="Senha do Certificado" value={cliente.senhaCertificado} />
        <Field label="Validade" value={cliente.validadeCertificado} />
        {cliente.linkCertificado ? (
          <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadCert}>
            <Text style={styles.downloadBtnText}>📥 Baixar Certificado</Text>
          </TouchableOpacity>
        ) : (
          <Field label="Certificado" value="Nenhum certificado anexado" />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acessos</Text>
        <Field label="Login NF" value={cliente.loginNF} />
        <Field label="Senha NF" value={cliente.senhaNF} />
        <Field label="Código Acesso SN" value={cliente.codigoAcessoSN} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cobranças ({cobrancas.length})</Text>
        {cobrancas.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma cobrança encontrada</Text>
        ) : (
          cobrancas.map((c) => {
            const venc = new Date(c.dataVencimento);
            const isVencida = !c.isPago && venc < new Date();
            const statusColor = c.isPago ? colors.success : isVencida ? colors.error : colors.warning;
            return (
              <View key={c.id} style={styles.cobrancaCard}>
                <View style={styles.cobrancaHeader}>
                  <Text style={styles.cobrancaDesc} numberOfLines={1}>{c.descricao}</Text>
                  <Text style={[styles.cobrancaValor, { color: statusColor }]}>
                    R$ {c.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
                <View style={styles.cobrancaFooter}>
                  <Text style={styles.cobrancaInfo}>Venc: {new Date(c.dataVencimento).toLocaleDateString('pt-BR')}</Text>
                  {c.referencia && <Text style={styles.cobrancaInfo}>{c.referencia}</Text>}
                  <Text style={[styles.cobrancaStatus, { color: statusColor }]}>
                    {c.isPago ? 'Pago' : isVencida ? 'Vencida' : 'Pendente'}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      {cliente.observacoes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <Text style={styles.observacoes}>{cliente.observacoes}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  section: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    padding: spacing.md, elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 18, fontWeight: '600', color: colors.primary,
    marginBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  field: { marginBottom: spacing.sm },
  label: { fontSize: 12, color: colors.textSecondary, marginBottom: 2, textTransform: 'uppercase' },
  value: { fontSize: 16, color: colors.textPrimary },
  errorText: { fontSize: 16, color: colors.textSecondary },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', paddingVertical: spacing.md },
  cobrancaCard: {
    backgroundColor: '#fff', borderRadius: borderRadius.md,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  cobrancaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cobrancaDesc: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  cobrancaValor: { fontSize: 15, fontWeight: '700' },
  cobrancaFooter: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  cobrancaInfo: { fontSize: 12, color: colors.textSecondary },
  cobrancaStatus: { fontSize: 12, fontWeight: '600', marginLeft: 'auto' },
  badge: {
    fontSize: 12, color: colors.primary, fontWeight: '600',
    backgroundColor: '#e0e7ff', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 4, alignSelf: 'flex-start', marginTop: spacing.xs,
  },
  downloadBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.md,
    paddingVertical: 12, alignItems: 'center', marginTop: spacing.sm,
  },
  downloadBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  observacoes: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
});
