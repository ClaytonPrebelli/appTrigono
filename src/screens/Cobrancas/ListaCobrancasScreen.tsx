import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Cobranca } from '../../types/cobranca';
import { cobrancasApi } from '../../api/cobrancas';
import { colors, spacing, borderRadius } from '../../theme';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function ListaCobrancasScreen() {
  const navigation = useNavigation<NavProp>();
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [referencia, setReferencia] = useState('');

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

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load(referencia || undefined);
  };

  const handleFilter = () => {
    setLoading(true);
    load(referencia || undefined);
  };

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
  };

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
          <Text style={[styles.pago, { color: item.isPago ? colors.success : colors.warning }]}>
            {item.isPago ? 'Pago' : isVencida ? 'Vencida' : 'Pendente'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <View style={styles.filterRow}>
          <TextInput
            style={styles.refInput}
            placeholder="Filtrar por referência (MM/AAAA)"
            placeholderTextColor={colors.textDisabled}
            value={referencia}
            onChangeText={setReferencia}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.filterBtn} onPress={handleFilter}>
            <Text style={styles.filterBtnText}>Filtrar</Text>
          </TouchableOpacity>
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
    backgroundColor: colors.surface, padding: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  filterRow: { flexDirection: 'row', gap: spacing.sm },
  refInput: {
    flex: 1, backgroundColor: colors.background, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15,
    color: colors.textPrimary, borderWidth: 1, borderColor: colors.border,
  },
  filterBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg, justifyContent: 'center',
  },
  filterBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  list: { padding: spacing.md, gap: spacing.sm },
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
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.xl, fontSize: 16 },
  addButton: {
    backgroundColor: colors.primary, borderRadius: borderRadius.md,
    paddingVertical: 12, alignItems: 'center', margin: spacing.md,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
