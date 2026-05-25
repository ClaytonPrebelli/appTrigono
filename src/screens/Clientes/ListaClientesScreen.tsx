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

  useEffect(() => {
    applyFilters(allClientes, search, statusFilter);
  }, [search, statusFilter, allClientes, applyFilters]);

  const load = useCallback(async () => {
    try {
      const data = await clientesApi.listar();
      setAllClientes(data);
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao carregar clientes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    setLoading(true);
    load();
  };

  const certStats = () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    let vencidos = 0, aVencer = 0, validos = 0, semCert = 0;
    allClientes.forEach(c => {
      if (!c.isAtivo) return;
      if (!c.validadeCertificado || !c.linkCertificado) { semCert++; return; }
      const venc = new Date(c.validadeCertificado);
      venc.setHours(0, 0, 0, 0);
      const diff = Math.ceil((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      if (diff < 0) vencidos++;
      else if (diff <= 30) aVencer++;
      else validos++;
    });
    return [
      { label: 'Vencidos', value: vencidos, color: colors.error },
      { label: 'A Vencer', value: aVencer, color: colors.warning },
      { label: 'Válidos', value: validos, color: colors.success },
      { label: 'Sem Cert.', value: semCert, color: colors.textSecondary },
    ];
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
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por CNPJ ou Razão Social"
          placeholderTextColor={colors.textDisabled}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
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
      <View style={styles.certDashboard}>
        {certStats().map((stat) => (
          <View key={stat.label} style={[styles.certCard, { borderLeftColor: stat.color }]}>
            <Text style={[styles.certValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.certLabel}>{stat.label}</Text>
          </View>
        ))}
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
  },
  searchInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: spacing.sm,
  },
  statusRow: { flexDirection: 'row', gap: spacing.sm },
  statusBtn: {
    flex: 1, paddingVertical: 8, borderRadius: borderRadius.md,
    alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statusBtnActive: { backgroundColor: '#fff' },
  statusText: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.8)' },
  statusTextActive: { color: colors.primary, fontWeight: '600' },
  certDashboard: {
    flexDirection: 'row', gap: spacing.xs, marginHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  certCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.sm,
    padding: spacing.sm, alignItems: 'center', borderLeftWidth: 3,
  },
  certValue: { fontSize: 20, fontWeight: 'bold' },
  certLabel: { fontSize: 9, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
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
  empty: { textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginTop: spacing.xl, fontSize: 16 },
});
