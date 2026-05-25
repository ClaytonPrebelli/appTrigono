import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Alert, Modal, TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { AberturaEmpresa } from '../../types/abertura-empresa';
import { aberturaEmpresaApi } from '../../api/abertura-empresa';
import { colors, spacing, borderRadius } from '../../theme';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function ListaAberturaScreen() {
  const navigation = useNavigation<NavProp>();
  const [formularios, setFormularios] = useState<AberturaEmpresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [linkGerado, setLinkGerado] = useState('');

  const load = useCallback(async () => {
    try {
      const response = await aberturaEmpresaApi.listar(1, 50);
      setFormularios(response.formularios);
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao carregar formulários');
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

  const handleGerarLink = async () => {
    try {
      const { link } = await aberturaEmpresaApi.gerarLink();
      setLinkGerado(link);
      setLinkModalVisible(true);
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao gerar link');
    }
  };

  const renderItem = ({ item }: { item: AberturaEmpresa }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('DetalheAbertura', { id: item.id! })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.nomeEmpresa} numberOfLines={1}>
          {item.opcao1NomeEmpresa || item.nomeFantasia || 'Sem nome'}
        </Text>
        <Text style={[styles.status, {
          color: item.status === 'Concluído' ? colors.success :
                 item.status === 'Pendente' ? colors.warning : colors.textSecondary
        }]}>{item.status || 'Rascunho'}</Text>
      </View>
      <Text style={styles.info}>CNAE: {item.cnaePrincipalCodigo || '-'}</Text>
      <Text style={styles.info}>Capital: R$ {Number(item.capitalSocial || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
      {item.dataCadastro && (
        <Text style={styles.date}>Criado em: {new Date(item.dataCadastro).toLocaleDateString('pt-BR')}</Text>
      )}
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
      <TouchableOpacity style={styles.gerarLinkBtn} onPress={handleGerarLink}>
        <Text style={styles.gerarLinkText}>🔗 Gerar Link do Formulário</Text>
      </TouchableOpacity>
      <FlatList
        data={formularios}
        keyExtractor={(item) => String(item.id!)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum formulário encontrado</Text>}
      />

      <Modal
        visible={linkModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLinkModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Link Gerado</Text>
            <Text style={styles.modalSubtitle}>Compartilhe este link com o cliente:</Text>
            <TextInput
              style={styles.modalLink}
              value={linkGerado}
              editable={false}
              multiline
              selectTextOnFocus
            />
            <TouchableOpacity style={styles.modalBtnClose} onPress={() => setLinkModalVisible(false)}>
              <Text style={styles.modalBtnCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  list: { padding: spacing.md, gap: spacing.sm },
  gerarLinkBtn: {
    backgroundColor: colors.accent, borderRadius: borderRadius.md,
    paddingVertical: 12, alignItems: 'center', margin: spacing.md,
  },
  gerarLinkText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  nomeEmpresa: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  status: { fontSize: 12, fontWeight: '600' },
  info: { fontSize: 14, color: colors.textSecondary, marginBottom: 2 },
  date: { fontSize: 12, color: colors.textDisabled, marginTop: spacing.xs },
  empty: { textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginTop: spacing.xl, fontSize: 16 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', padding: spacing.lg,
  },
  modalContent: {
    width: '100%', backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, elevation: 8,
  },
  modalTitle: {
    fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm,
  },
  modalSubtitle: {
    fontSize: 14, color: colors.textSecondary, marginBottom: spacing.md,
  },
  modalLink: {
    fontSize: 15, color: colors.textPrimary, backgroundColor: colors.surfaceHover,
    padding: spacing.md, borderRadius: borderRadius.sm, marginBottom: spacing.lg,
    textAlign: 'center', borderWidth: 1, borderColor: colors.border,
  },
  modalBtnClose: {
    borderRadius: borderRadius.md, paddingVertical: 14, alignItems: 'center',
    backgroundColor: colors.primary,
  },
  modalBtnCloseText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
