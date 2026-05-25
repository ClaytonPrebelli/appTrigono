import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Cliente } from '../../types/cliente';
import { clientesApi } from '../../api/clientes';
import { colors, spacing, borderRadius } from '../../theme';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function ListaClientesScreen() {
  const navigation = useNavigation<NavProp>();
  const [allClientes, setAllClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos');

  const applyFilters = useCallback((data: Cliente[], s: string, st: string) => {
    let result = data;
    if (st === 'ativo') result = result.filter(c => c.isAtivo);
    else if (st === 'inativo') result = result.filter(c => !c.isAtivo);
    if (s.trim()) {
      const q = s.trim().toLowerCase();
      result = result.filter(c =>
        c.razaoSocial.toLowerCase().includes(q) ||
        c.cnpj.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
      );
    }
    setFilteredClientes(result);
  }, []);

  const load = useCallback(async () => {
    try {
      const data = await clientesApi.listar();
      setAllClientes(data);
      applyFilters(data, search, statusFilter);
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao carregar clientes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, statusFilter, applyFilters]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    applyFilters(allClientes, search, statusFilter);
  }, [search, statusFilter, allClientes, applyFilters]);

  const onRefresh = () => {
    setRefreshing(true);
    setLoading(true);
    clientesApi.listar()
      .then(data => { setAllClientes(data); applyFilters(data, search, statusFilter); })
      .catch(err => Alert.alert('Erro', err.message || 'Falha ao carregar clientes'))
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  const formatCNPJ = (cnpj: string) => {
    const digits = cnpj.replace(/\D/g, '');
    if (digits.length !== 14) return cnpj;
    return `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8,12)}-${digits.slice(12)}`;
  };

  const renderItem = ({ item }: { item: Cliente }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('DetalheCliente', { id: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.razaoSocial} numberOfLines={1}>{item.razaoSocial}</Text>
        {!item.isAtivo && <Text style={styles.inativo}>Inativo</Text>}
      </View>
      <Text style={styles.cnpj}>{formatCNPJ(item.cnpj)}</Text>
      <Text style={styles.contato}>{item.fone} | {item.email}</Text>
    </TouchableOpacity>
  );

  if (loading && allClientes.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por CNPJ ou Razão Social"
            placeholderTextColor={colors.textDisabled}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.statusRow}>
          {(['todos', 'ativo', 'inativo'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.statusBtn, statusFilter === s && styles.statusBtnActive]}
              onPress={() => setStatusFilter(s)}
            >
              <Text style={[styles.statusText, statusFilter === s && styles.statusTextActive]}>
                {s === 'todos' ? 'Todos' : s === 'ativo' ? 'Ativos' : 'Inativos'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <FlatList
        data={filteredClientes}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum cliente encontrado</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  filters: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchRow: { marginBottom: spacing.sm },
  searchInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusRow: { flexDirection: 'row', gap: spacing.sm },
  statusBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  statusBtnActive: { backgroundColor: colors.primary },
  statusText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  statusTextActive: { color: '#fff', fontWeight: '600' },
  list: { padding: spacing.md, gap: spacing.sm },
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  razaoSocial: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  inativo: { fontSize: 12, color: colors.error, fontWeight: '600', backgroundColor: '#fef2f2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  cnpj: { fontSize: 14, color: colors.textSecondary, marginBottom: 2 },
  contato: { fontSize: 13, color: colors.textDisabled },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.xl, fontSize: 16 },
});
