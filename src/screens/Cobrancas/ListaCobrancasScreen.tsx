import React, { useEffect, useState, useCallback } from 'react';
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

export default function ListaCobrancasScreen() {
  const navigation = useNavigation<NavProp>();
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await cobrancasApi.listar();
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
    load();
  };

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
  };

  const renderItem = ({ item }: { item: Cobranca }) => {
    const statusColor = item.isPago ? colors.success : new Date(item.dataVencimento) < new Date() ? colors.error : colors.warning;

    return (
      <TouchableOpacity style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.descricao}>{item.descricao}</Text>
          <Text style={[styles.valor, { color: statusColor }]}>{formatCurrency(item.valor)}</Text>
        </View>
        <Text style={styles.vencimento}>Vencimento: {formatDate(item.dataVencimento)}</Text>
        {item.referencia && <Text style={styles.referencia}>Ref: {item.referencia}</Text>}
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
  list: { padding: spacing.md, gap: spacing.sm },
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  descricao: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  valor: { fontSize: 16, fontWeight: '700' },
  vencimento: { fontSize: 14, color: colors.textSecondary },
  referencia: { fontSize: 13, color: colors.textDisabled },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.xl, fontSize: 16 },
  addButton: {
    backgroundColor: colors.primary, borderRadius: borderRadius.md,
    paddingVertical: 12, alignItems: 'center', margin: spacing.md,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
