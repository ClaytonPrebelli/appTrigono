import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Alert,
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

  const onRefresh = () => {
    setRefreshing(true);
    load();
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
        <Text style={styles.razaoSocial}>{item.razaoSocial}</Text>
        {!item.isAtivo && <Text style={styles.inativo}>Inativo</Text>}
      </View>
      <Text style={styles.cnpj}>{formatCNPJ(item.cnpj)}</Text>
      <Text style={styles.contato}>{item.fone} | {item.email}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={clientes}
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
