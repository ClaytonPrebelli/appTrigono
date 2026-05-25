import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { AberturaEmpresa, QuadroSocietario } from '../../types/abertura-empresa';
import { aberturaEmpresaApi } from '../../api/abertura-empresa';
import { colors, spacing, borderRadius } from '../../theme';

type DetalheRoute = RouteProp<RootStackParamList, 'DetalheAbertura'>;

export default function DetalheAberturaScreen() {
  const route = useRoute<DetalheRoute>();
  const [form, setForm] = useState<AberturaEmpresa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aberturaEmpresaApi.verPorId(route.params.id)
      .then(setForm)
      .catch((err) => Alert.alert('Erro', err.message || 'Falha ao carregar formulário'))
      .finally(() => setLoading(false));
  }, [route.params.id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!form) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Formulário não encontrado</Text>
      </View>
    );
  }

  const Field = ({ label, value }: { label: string; value?: string | null | number }) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value ?? '-'}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados da Empresa</Text>
        <Field label="Opção 1" value={form.opcao1NomeEmpresa} />
        <Field label="Opção 2" value={form.opcao2NomeEmpresa} />
        <Field label="Opção 3" value={form.opcao3NomeEmpresa} />
        <Field label="Nome Fantasia" value={form.nomeFantasia} />
        <Field label="CNAE" value={`${form.cnaePrincipalCodigo} - ${form.cnaePrincipalDescricao}`} />
        <Field label="Natureza Jurídica" value={form.naturezaJuridica} />
        <Field label="Capital Social" value={form.capitalSocial ? `R$ ${form.capitalSocial.toFixed(2)}` : undefined} />
        <Field label="Status" value={form.status} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Endereço</Text>
        <Field label="Logradouro" value={form.enderecoLogradouro} />
        <Field label="Número" value={form.enderecoNumero} />
        <Field label="Bairro" value={form.enderecoBairro} />
        <Field label="Cidade/UF" value={`${form.enderecoCidade}/${form.enderecoEstado}`} />
        <Field label="CEP" value={form.enderecoCep} />
      </View>

      {form.quadroSocietario && form.quadroSocietario.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quadro Societário</Text>
          {form.quadroSocietario.map((socio: QuadroSocietario, index: number) => (
            <View key={socio.id || index} style={styles.socioCard}>
              <Text style={styles.socioNome}>{socio.nome}</Text>
              <Field label="CPF" value={socio.cpf} />
              <Field label="Participação" value={socio.percentualParticipacao ? `${socio.percentualParticipacao}%` : undefined} />
              <Field label="Cargo" value={socio.cargo} />
              {socio.isAdministrador && <Text style={styles.admin}>Administrador</Text>}
            </View>
          ))}
        </View>
      )}

      {form.documentos && form.documentos.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documentos</Text>
          {form.documentos.map((doc) => (
            <View key={doc.id} style={styles.docRow}>
              <Text style={styles.docName}>{doc.nomeArquivo}</Text>
              <Text style={styles.docInfo}>{doc.tipoDocumento || 'Sem tipo'} - {(doc.tamanhoBytes / 1024).toFixed(1)} KB</Text>
            </View>
          ))}
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
  socioCard: {
    backgroundColor: colors.background, borderRadius: borderRadius.sm,
    padding: spacing.sm, marginBottom: spacing.sm,
  },
  socioNome: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  admin: { fontSize: 12, color: colors.primary, fontWeight: '600', marginTop: 2 },
  docRow: { marginBottom: spacing.sm },
  docName: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  docInfo: { fontSize: 12, color: colors.textSecondary },
});
