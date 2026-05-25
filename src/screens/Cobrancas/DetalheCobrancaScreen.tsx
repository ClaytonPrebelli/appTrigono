import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert, TouchableOpacity,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Cobranca } from '../../types/cobranca';
import { cobrancasApi } from '../../api/cobrancas';
import { colors, spacing, borderRadius } from '../../theme';

type DetalheRoute = RouteProp<RootStackParamList, 'DetalheCobranca'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function DetalheCobrancaScreen() {
  const route = useRoute<DetalheRoute>();
  const navigation = useNavigation<NavProp>();
  const [cobranca, setCobranca] = useState<Cobranca | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const load = () => {
    setLoading(true);
    cobrancasApi.verPorId(route.params.id)
      .then(setCobranca)
      .catch((err) => Alert.alert('Erro', err.message || 'Falha ao carregar cobrança'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [route.params.id]);

  const handleMarkAsPaid = () => {
    Alert.alert('Confirmar', 'Marcar esta cobrança como paga?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sim, está paga',
        onPress: async () => {
          if (!cobranca) return;
          setPaying(true);
          try {
            await cobrancasApi.atualizar({
              ...cobranca,
              isPago: true,
              dataPagamento: new Date().toISOString(),
              metodoPagamento: 'Pago',
            });
            Alert.alert('Sucesso', 'Cobrança marcada como paga');
            load();
          } catch (err: any) {
            Alert.alert('Erro', err.message || 'Falha ao atualizar cobrança');
          } finally {
            setPaying(false);
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Confirmar', 'Deseja excluir esta cobrança?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          try {
            await cobrancasApi.deletar(cobranca!.id);
            Alert.alert('Sucesso', 'Cobrança excluída');
            navigation.goBack();
          } catch (err: any) {
            Alert.alert('Erro', err.message || 'Falha ao excluir');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!cobranca) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Cobrança não encontrada</Text>
      </View>
    );
  }

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const venc = new Date(cobranca.dataVencimento);
  const isVencida = !cobranca.isPago && venc < new Date();
  const statusText = cobranca.isPago ? 'Pago' : isVencida ? 'Vencida' : 'Pendente';
  const statusColor = cobranca.isPago ? colors.success : isVencida ? colors.error : colors.warning;

  const Field = ({ label, value }: { label: string; value?: string | null }) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '-'}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.statusBar}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.valorLabel}>Valor</Text>
        <Text style={styles.valorValue}>{formatCurrency(cobranca.valor)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalhes</Text>
        <Field label="Descrição" value={cobranca.descricao} />
        <Field label="Cliente" value={cobranca.cliente?.razaoSocial} />
        <Field label="Cliente ID" value={String(cobranca.clienteId)} />
        <Field label="Data de Vencimento" value={formatDate(cobranca.dataVencimento)} />
        <Field label="Referência" value={cobranca.referencia} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pagamento</Text>
        <Field label="Status" value={statusText} />
        {cobranca.dataPagamento && <Field label="Data de Pagamento" value={formatDate(cobranca.dataPagamento)} />}
        {cobranca.metodoPagamento && <Field label="Método" value={cobranca.metodoPagamento} />}
      </View>

      {!cobranca.isPago && (
        <TouchableOpacity
          style={[styles.payBtn, paying && styles.payBtnDisabled]}
          onPress={handleMarkAsPaid}
          disabled={paying}
        >
          {paying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payBtnText}>✓ Marcar como Paga</Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteBtnText}>Excluir Cobrança</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  statusBar: { alignItems: 'center', marginBottom: spacing.sm },
  statusBadge: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.lg },
  statusText: { fontSize: 16, fontWeight: '700' },
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
  valorLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  valorValue: { fontSize: 32, fontWeight: 'bold', color: colors.textPrimary },
  payBtn: {
    backgroundColor: colors.success, borderRadius: borderRadius.md,
    paddingVertical: 14, alignItems: 'center',
  },
  payBtnDisabled: { opacity: 0.7 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  deleteBtn: {
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: borderRadius.md,
    paddingVertical: 14, alignItems: 'center',
  },
  deleteBtnText: { color: colors.error, fontSize: 16, fontWeight: '600' },
});
