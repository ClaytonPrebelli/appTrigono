import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert,
  TouchableOpacity, Linking,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { AberturaEmpresa, QuadroSocietario } from '../../types/abertura-empresa';
import { aberturaEmpresaApi } from '../../api/abertura-empresa';
import { colors, spacing, borderRadius } from '../../theme';

type DetalheRoute = RouteProp<RootStackParamList, 'DetalheAbertura'>;

const API_URL = 'https://apitrigono.prebellisolucoes.com';

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

  const handleDownload = async (docId: number, tipo?: string) => {
    const url = `${API_URL}/AberturaEmpresa/DownloadDocumento?documentoId=${docId}`;
    try {
      const primeiroNome = (form?.opcao1NomeEmpresa || '').split(' ')[0] || 'documento';
      const nomeArquivo = `${primeiroNome}_${tipo || 'documento'}`;
      const fileUri = `${FileSystem.cacheDirectory}${nomeArquivo}`;
      const result = await FileSystem.downloadAsync(url, fileUri);
      const contentUri = await FileSystem.getContentUriAsync(result.uri);
      await Linking.openURL(contentUri);
    } catch {
      Alert.alert('Erro', 'Não foi possível baixar o documento');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        <View style={styles.statusRow}>
          <Text style={[styles.statusValue, {
            color: form.status === 'Concluído' ? colors.success :
                   form.status === 'Pendente' ? colors.warning : colors.textSecondary
          }]}>{form.status || 'Rascunho'}</Text>
        </View>
        <Field label="Data de Cadastro" value={form.dataCadastro ? new Date(form.dataCadastro).toLocaleDateString('pt-BR') : undefined} />
        <Field label="Token" value={form.token} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Opções de Nome</Text>
        <Field label="Opção 1" value={form.opcao1NomeEmpresa} />
        <Field label="Opção 2" value={form.opcao2NomeEmpresa} />
        <Field label="Opção 3" value={form.opcao3NomeEmpresa} />
        <Field label="Nome Fantasia" value={form.nomeFantasia} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Atividade</Text>
        <Field label="CNAE Principal" value={`${form.cnaePrincipalCodigo || ''} - ${form.cnaePrincipalDescricao || ''}`} />
        <Field label="Natureza Jurídica" value={form.naturezaJuridica} />
        <Field label="Capital Social" value={form.capitalSocial ? `R$ ${Number(form.capitalSocial).toFixed(2)}` : undefined} />
        <Field label="Tipo" value={[
          form.isServico ? 'Serviço' : '',
          form.isIndustria ? 'Indústria' : '',
          form.isComercio ? 'Comércio' : '',
        ].filter(Boolean).join(', ') || '-'} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Endereço</Text>
        <Field label="Logradouro" value={form.enderecoLogradouro} />
        <Field label="Número" value={form.enderecoNumero} />
        <Field label="Complemento" value={form.enderecoComplemento} />
        <Field label="Bairro" value={form.enderecoBairro} />
        <Field label="Cidade/UF" value={`${form.enderecoCidade || ''}/${form.enderecoEstado || ''}`} />
        <Field label="CEP" value={form.enderecoCep} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contato</Text>
        <Field label="Telefone" value={form.telefone} />
        <Field label="Email" value={form.email} />
        <Field label="Observações" value={form.observacoes} />
      </View>

      {form.quadroSocietario && form.quadroSocietario.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quadro Societário</Text>
          {form.quadroSocietario.map((socio: QuadroSocietario, index: number) => (
            <View key={socio.id || index} style={styles.socioCard}>
              <Text style={styles.socioNome}>{socio.nome}</Text>
              {socio.isAdministrador && <Text style={styles.adminBadge}>Administrador</Text>}
              <Field label="CPF" value={socio.cpf} />
              <Field label="Nacionalidade" value={socio.nacionalidade} />
              <Field label="Estado Civil" value={socio.estadoCivil} />
              <Field label="Regime de Casamento" value={socio.regimeCasamento} />
              <Field label="Profissão" value={socio.profissao} />
              <Field label="Escolaridade" value={socio.escolaridade} />
              <Field label="Cargo" value={socio.cargo} />
              <Field label="Participação" value={socio.percentualParticipacao ? `${socio.percentualParticipacao}%` : undefined} />
              <Field label="Pró-Labore" value={socio.temProLabore ? 'Sim' : 'Não'} />
              <View style={styles.socioEndereco}>
                <Text style={styles.subSectionTitle}>Endereço do Sócio</Text>
                <Field label="Logradouro" value={socio.enderecoLogradouro} />
                <Field label="Número" value={socio.enderecoNumero} />
                <Field label="Complemento" value={socio.enderecoComplemento} />
                <Field label="Bairro" value={socio.enderecoBairro} />
                <Field label="Cidade/UF" value={`${socio.enderecoCidade || ''}/${socio.enderecoEstado || ''}`} />
                <Field label="CEP" value={socio.enderecoCep} />
              </View>
              <Field label="Telefone" value={socio.telefone} />
              <Field label="Email" value={socio.email} />
            </View>
          ))}
        </View>
      )}

      {form.documentos && form.documentos.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documentos ({form.documentos.length})</Text>
          {form.documentos.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              style={styles.docCard}
              onPress={() => handleDownload(doc.id, doc.tipoDocumento)}
            >
              <View style={styles.docInfo}>
                <Text style={styles.docName}>{doc.tipoDocumento || 'Documento'}</Text>
                <Text style={styles.docMeta}>{(doc.tamanhoBytes / 1024).toFixed(1)} KB</Text>
                {doc.observacao && <Text style={styles.docObs}>{doc.observacao}</Text>}
              </View>
              <Text style={styles.downloadIcon}>📥</Text>
            </TouchableOpacity>
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
  subSectionTitle: {
    fontSize: 14, fontWeight: '600', color: colors.textSecondary,
    marginBottom: spacing.sm, marginTop: spacing.sm,
  },
  field: { marginBottom: spacing.sm },
  label: { fontSize: 12, color: colors.textSecondary, marginBottom: 2, textTransform: 'uppercase' },
  value: { fontSize: 16, color: colors.textPrimary },
  errorText: { fontSize: 16, color: colors.textSecondary },
  statusRow: { marginBottom: spacing.sm },
  statusValue: { fontSize: 18, fontWeight: '700' },
  socioCard: {
    backgroundColor: '#fff', borderRadius: borderRadius.sm,
    padding: spacing.sm, marginBottom: spacing.sm, borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  socioNome: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  adminBadge: {
    fontSize: 11, color: '#fff', fontWeight: '600',
    backgroundColor: colors.primary, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4, alignSelf: 'flex-start', marginBottom: spacing.xs,
  },
  socioEndereco: {
    marginTop: spacing.sm, paddingTop: spacing.sm,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  docCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: borderRadius.sm,
    padding: spacing.sm, marginBottom: spacing.sm,
  },
  docInfo: { flex: 1 },
  docName: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  docMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  docObs: { fontSize: 12, color: colors.textDisabled, marginTop: 2, fontStyle: 'italic' },
  downloadIcon: { fontSize: 24, marginLeft: spacing.sm },
});
