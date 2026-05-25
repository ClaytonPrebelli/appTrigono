import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Cliente } from '../../types/cliente';
import { clientesApi } from '../../api/clientes';
import { colors, spacing, borderRadius } from '../../theme';

type DetalheRoute = RouteProp<RootStackParamList, 'DetalheCliente'>;

export default function DetalheClienteScreen() {
  const route = useRoute<DetalheRoute>();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientesApi.verPorId(route.params.id)
      .then(setCliente)
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
      </View>

      {cliente.linkCertificado && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certificado Digital</Text>
          <Field label="Link" value={cliente.linkCertificado} />
          <Field label="Validade" value={cliente.validadeCertificado} />
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
});
