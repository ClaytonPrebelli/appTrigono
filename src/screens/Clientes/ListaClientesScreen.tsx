import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos');

  const load = useCallback(async () => {
    try {
      const data = await clientesApi.listar();
      setClientes(data);
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao carregar clientes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const filteredClientes = useMemo(() => {
    let result = clientes;
    if (statusFilter === 'ativo') result = result.filter(c => c.isAtivo === true);
    else if (statusFilter === 'inativo') result = result.filter(c => c.isAtivo === false);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(c =>
        (c.razaoSocial || '').toLowerCase().includes(q) ||
        (c.cnpj || '').replace(/\D/g, '').includes(q.replace(/\D/g, ''))
      );
    }
    return result;
  }, [clientes, search, statusFilter]);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const ativos = clientes.filter(c => c.isAtivo);
  const vencidos = ativos.filter(c => c.validadeCertificado && new Date(c.validadeCertificado) < hoje);
  const aVencer = ativos.filter(c => {
    if (!c.validadeCertificado) return false;
    const diff = Math.ceil((new Date(c.validadeCertificado).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 30;
  });
  const validos = ativos.filter(c => {
    if (!c.validadeCertificado) return false;
    return new Date(c.validadeCertificado) >= hoje;
  }).filter(c => {
    const diff = Math.ceil((new Date(c.validadeCertificado!).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 30;
  });
  const semCert = ativos.filter(c => !c.validadeCertificado || !c.linkCertificado);

  const certStats = [
    { label: 'Vencidos', value: vencidos.length, data: vencidos, color: colors.error },
    { label: 'A Vencer', value: aVencer.length, data: aVencer, color: colors.warning },
    { label: 'Válidos', value: validos.length, data: validos, color: colors.success },
    { label: 'Sem Cert.', value: semCert.length, data: semCert, color: colors.textSecondary },
  ];

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

  if (loading && clientes.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por CNPJ ou Razão Social"
          placeholderTextColor="#94a3b8"
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
        {certStats.map((stat) => (
          <TouchableOpacity
            key={stat.label}
            style={[styles.certCard, { borderTopColor: stat.color }]}
            onPress={() => {
              const names = stat.data.map(c => `${c.razaoSocial} - ${c.cnpj}`).join('\n');
              Alert.alert(`${stat.label} (${stat.value})`, names || 'Nenhum');
            }}
          >
            <Text style={[styles.certValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.certLabel}>{stat.label}</Text>
          </TouchableOpacity>
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
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
  },
  searchInput: {
    backgroundColor: '#fff', borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    fontSize: 15, color: colors.textPrimary,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  statusRow: { flexDirection: 'row', gap: spacing.sm },
  statusBtn: {
    flex: 1, paddingVertical: 8, borderRadius: borderRadius.md,
    alignItems: 'center', backgroundColor: colors.background,
  },
  statusBtnActive: { backgroundColor: colors.primary },
  statusText: { fontSize: 13, fontWeight: '500', color: '#fff' },
  statusTextActive: { color: '#fff', fontWeight: '600' },
  certDashboard: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.md,
    marginTop: spacing.sm, marginBottom: spacing.xs,
  },
  certCard: {
    width: '48%', backgroundColor: colors.surface, borderRadius: borderRadius.md,
    paddingVertical: spacing.md, alignItems: 'center', borderTopWidth: 3,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3,
  },
  certValue: { fontSize: 24, fontWeight: 'bold' },
  certLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  list: { paddingHorizontal: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  razaoSocial: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  inativo: { fontSize: 12, color: colors.error, fontWeight: '600', backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: colors.error },
  cnpj: { fontSize: 14, color: colors.textSecondary, marginBottom: 2 },
  contato: { fontSize: 13, color: colors.textDisabled },
  empty: { textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginTop: spacing.xl, fontSize: 16 },
});
