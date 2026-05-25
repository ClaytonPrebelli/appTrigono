import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Cobranca } from '../../types/cobranca';
import { cobrancasApi } from '../../api/cobrancas';
import { colors, spacing, borderRadius } from '../../theme';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

function formatMesRef(data: Date) {
  const m = String(data.getMonth() + 1).padStart(2, '0');
  const a = data.getFullYear();
  return `${m}/${a}`;
}

export default function ListaCobrancasScreen() {
  const navigation = useNavigation<NavProp>();
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [referencia, setReferencia] = useState(formatMesRef(new Date()));

  const load = useCallback(async (ref?: string) => {
    try {
      const data = await cobrancasApi.listar(ref ? { referencia: ref } : undefined);
      setCobrancas(data);
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao carregar cobranças');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(referencia); }, [referencia, load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(referencia || undefined);
  }, [referencia, load]);

  const navigateMes = (dir: number) => {
    const parts = referencia.split('/');
    if (parts.length !== 2) return;
    let mes = parseInt(parts[0], 10);
    let ano = parseInt(parts[1], 10);
    mes += dir;
    if (mes < 1) { mes = 12; ano--; }
    if (mes > 12) { mes = 1; ano++; }
    setReferencia(`${String(mes).padStart(2, '0')}/${ano}`);
  };

  const hoje = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const pendentes = useMemo(() => cobrancas.filter(c => !c.isPago), [cobrancas]);
  const pagas = useMemo(() => cobrancas.filter(c => c.isPago), [cobrancas]);
  const vencidas = useMemo(() => pendentes.filter(c => new Date(c.dataVencimento) < hoje), [pendentes, hoje]);
  const valorDevido = useMemo(() => pendentes.reduce((a, c) => a + c.valor, 0), [pendentes]);
  const valorPago = useMemo(() => pagas.reduce((a, c) => a + c.valor, 0), [pagas]);

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const dashboardLinha1 = [
    { label: 'Abertas', value: pendentes.length, data: pendentes, color: colors.warning },
    { label: 'Vencidas', value: vencidas.length, data: vencidas, color: colors.error },
    { label: 'Pagas', value: pagas.length, data: pagas, color: colors.success },
  ];

  const dashboardLinha2 = [
    { label: 'Devido', value: formatCurrency(valorDevido), data: pendentes, color: colors.warning },
    { label: 'Pago', value: formatCurrency(valorPago), data: pagas, color: colors.success },
  ];

  const renderItem = ({ item }: { item: Cobranca }) => {
    const venc = new Date(item.dataVencimento);
    const isVencida = !item.isPago && venc < new Date();
    const statusColor = item.isPago ? colors.success : isVencida ? colors.error : colors.warning;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DetalheCobranca', { id: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.descricao} numberOfLines={1}>{item.descricao}</Text>
          <Text style={[styles.valor, { color: statusColor }]}>{formatCurrency(item.valor)}</Text>
        </View>
        {item.cliente && <Text style={styles.cliente}>{item.cliente.razaoSocial}</Text>}
        <View style={styles.cardFooter}>
          <Text style={styles.vencimento}>Venc: {formatDate(item.dataVencimento)}</Text>
          {item.referencia && <Text style={styles.ref}>{item.referencia}</Text>}
          <Text style={[styles.pago, { color: statusColor }]}>
            {item.isPago ? 'Pago' : isVencida ? 'Vencida' : 'Pendente'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <View style={styles.mesNav}>
          <TouchableOpacity style={styles.mesArrow} onPress={() => navigateMes(-1)}>
            <Text style={styles.mesArrowText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.mesLabelContainer}>
            <Text style={styles.mesLabel}>{referencia}</Text>
          </View>
          <TouchableOpacity style={styles.mesArrow} onPress={() => navigateMes(1)}>
            <Text style={styles.mesArrowText}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.dashboard}>
        <View style={styles.dashRow}>
          {dashboardLinha1.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.dashCard, { borderTopColor: item.color }]}
              onPress={() => {
                const names = (item.data as Cobranca[]).map(c =>
                  `${c.descricao} - ${formatCurrency(c.valor)}`
                ).join('\n');
                Alert.alert(`${item.label} (${item.value})`, names || 'Nenhum');
              }}
            >
              <Text style={[styles.dashValue, { color: item.color }]}>{item.value}</Text>
              <Text style={styles.dashLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.dashRow}>
          {dashboardLinha2.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.dashCard, styles.dashCardHalf, { borderTopColor: item.color }]}
              onPress={() => {
                const names = (item.data as Cobranca[]).map(c =>
                  `${c.descricao} - ${formatCurrency(c.valor)}`
                ).join('\n');
                Alert.alert(`${item.label} (${item.value})`, names || 'Nenhum');
              }}
            >
              <Text style={[styles.dashValue, { color: item.color }]}>{item.value}</Text>
              <Text style={styles.dashLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('RegistroCobranca', {})}
      >
        <Text style={styles.addButtonText}>+ Nova Cobrança</Text>
      </TouchableOpacity>
      <FlatList
        data={cobrancas}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma cobrança encontrada</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  filters: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    padding: spacing.md, marginHorizontal: spacing.md, marginTop: spacing.sm,
  },
  mesNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  mesArrow: { padding: spacing.sm },
  mesArrowText: { fontSize: 28, color: colors.primary, fontWeight: '300' },
  mesLabelContainer: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderWidth: 1, borderColor: colors.border, minWidth: 120, alignItems: 'center',
  },
  mesLabel: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  dashboard: {
    paddingHorizontal: spacing.md, marginTop: spacing.md, marginBottom: spacing.sm, gap: spacing.lg,
  },
  dashRow: { flexDirection: 'row', gap: spacing.md },
  dashCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.md,
    paddingVertical: spacing.lg, alignItems: 'center', borderTopWidth: 3,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3,
  },
  dashCardHalf: { flex: 0.5 },
  dashValue: { fontSize: 18, fontWeight: 'bold' },
  dashLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2, textTransform: 'uppercase' },
  list: { paddingHorizontal: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  descricao: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  valor: { fontSize: 16, fontWeight: '700' },
  cliente: { fontSize: 13, color: colors.textSecondary, marginBottom: 2 },
  cardFooter: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', marginTop: spacing.xs },
  vencimento: { fontSize: 13, color: colors.textSecondary },
  ref: { fontSize: 13, color: colors.textDisabled },
  pago: { fontSize: 12, fontWeight: '600', marginLeft: 'auto' },
  empty: { textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginTop: spacing.xl, fontSize: 16 },
  addButton: {
    backgroundColor: colors.primaryLighter, borderRadius: borderRadius.md,
    paddingVertical: 12, alignItems: 'center', marginHorizontal: spacing.md, marginTop: spacing.sm,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
