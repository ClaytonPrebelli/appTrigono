import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Alert, Modal, FlatList, ActivityIndicator
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Cobranca, CobrancaCreate } from '../../types/cobranca';
import { Cliente } from '../../types/cliente';
import { clientesApi } from '../../api/clientes';
import { cobrancasApi } from '../../api/cobrancas';
import { colors } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'RegistroCobranca'>;

export default function RegistroCobrancaScreen({ route, navigation }: Props) {
  const editId = route.params?.id;
  const isEditing = !!editId;

  const [clienteId, setClienteId] = useState<number>(0);
  const [clienteNome, setClienteNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('');
  const [referencia, setReferencia] = useState('');
  const [dataPagamento, setDataPagamento] = useState('');
  const [isPago, setIsPago] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSearch, setClienteSearch] = useState('');

  useEffect(() => {
    if (isEditing) {
      loadCobranca();
    }
  }, []);

  useLayoutEffect(() => {
    if (editId) {
      (navigation as any).setOptions({ title: 'Editar Cobrança' });
    }
  }, [editId, navigation]);

  const loadCobranca = async () => {
    if (!editId) return;
    setLoading(true);
    try {
      const c = await cobrancasApi.verPorId(editId);
      setClienteId(c.clienteId);
      setClienteNome(c.cliente?.razaoSocial || 'Cliente #' + c.clienteId);
      setDescricao(c.descricao);
      setValor(String(c.valor));
      setDataVencimento(formatDateInput(c.dataVencimento));
      setMetodoPagamento(c.metodoPagamento || '');
      setReferencia(c.referencia || '');
      setDataPagamento(c.dataPagamento ? formatDateInput(c.dataPagamento) : '');
      setIsPago(c.isPago);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar a cobrança.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateInput = (dateStr: string): string => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.substring(0, 10);
    return d.toISOString().substring(0, 10);
  };

  const openClientSelector = async () => {
    setShowClientModal(true);
    setClienteSearch('');
    try {
      const data = await clientesApi.listar();
      setClientes(data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar a lista de clientes.');
    }
  };

  const selectCliente = (c: Cliente) => {
    setClienteId(c.id);
    setClienteNome(c.razaoSocial);
    setShowClientModal(false);
  };

  const filteredClientes = clienteSearch
    ? clientes.filter(c =>
        c.razaoSocial.toLowerCase().includes(clienteSearch.toLowerCase()) ||
        c.cnpj.includes(clienteSearch)
      )
    : clientes;

  const handleSave = async () => {
    if (!clienteId) {
      Alert.alert('Validação', 'Selecione um cliente.');
      return;
    }
    if (!descricao.trim()) {
      Alert.alert('Validação', 'Informe a descrição.');
      return;
    }
    if (!valor || parseFloat(valor.replace(',', '.')) <= 0) {
      Alert.alert('Validação', 'Informe um valor válido.');
      return;
    }
    if (!dataVencimento) {
      Alert.alert('Validação', 'Informe a data de vencimento.');
      return;
    }

    setSaving(true);
    try {
      const payload: CobrancaCreate = {
        clienteId,
        descricao: descricao.trim(),
        valor: parseFloat(valor.replace(',', '.')),
        dataVencimento,
        isPago,
        metodoPagamento: metodoPagamento.trim() || undefined,
        referencia: referencia.trim() || undefined,
      };

      if (isEditing) {
        await cobrancasApi.atualizar({
          id: editId!,
          clienteId,
          descricao: descricao.trim(),
          valor: parseFloat(valor.replace(',', '.')),
          dataVencimento,
          isPago,
          metodoPagamento: metodoPagamento.trim() || null,
          referencia: referencia.trim() || null,
          dataPagamento: dataPagamento || null,
        } as Cobranca);
        Alert.alert('Sucesso', 'Cobrança atualizada.');
      } else {
        await cobrancasApi.cadastrar(payload);
        Alert.alert('Sucesso', 'Cobrança cadastrada.');
      }
      navigation.goBack();
    } catch (err: any) {
      const msg = err?.response?.data || err?.message || 'Erro ao salvar cobrança.';
      Alert.alert('Erro', typeof msg === 'string' ? msg : 'Erro ao salvar cobrança.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Cliente *</Text>
      <TouchableOpacity style={styles.clientSelector} onPress={openClientSelector}>
        <Text style={clienteId ? styles.clientText : styles.placeholder}>
          {clienteId ? clienteNome : 'Selecione um cliente...'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Descrição *</Text>
      <TextInput
        style={styles.input}
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Ex: Consultoria Mensal"
      />

      <Text style={styles.label}>Valor *</Text>
      <TextInput
        style={styles.input}
        value={valor}
        onChangeText={setValor}
        placeholder="0,00"
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Data Vencimento *</Text>
      <TextInput
        style={styles.input}
        value={dataVencimento}
        onChangeText={setDataVencimento}
        placeholder="AAAA-MM-DD"
      />

      <Text style={styles.label}>Referência (mês/ano)</Text>
      <TextInput
        style={styles.input}
        value={referencia}
        onChangeText={setReferencia}
        placeholder="Ex: 2026-07"
      />

      <Text style={styles.label}>Método de Pagamento</Text>
      <TextInput
        style={styles.input}
        value={metodoPagamento}
        onChangeText={setMetodoPagamento}
        placeholder="Ex: Pix, Boleto, Transferência"
      />

      {isEditing && (
        <>
          <Text style={styles.label}>Data Pagamento</Text>
          <TextInput
            style={styles.input}
            value={dataPagamento}
            onChangeText={setDataPagamento}
            placeholder="AAAA-MM-DD"
          />
        </>
      )}

      <TouchableOpacity style={styles.checkRow} onPress={() => setIsPago(!isPago)}>
        <View style={[styles.checkbox, isPago && styles.checkboxActive]} />
        <Text style={styles.checkLabel}>Pago</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.disabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>{isEditing ? 'Atualizar' : 'Cadastrar'}</Text>
        )}
      </TouchableOpacity>

      <Modal visible={showClientModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar Cliente</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nome ou CNPJ..."
              value={clienteSearch}
              onChangeText={setClienteSearch}
            />
            <FlatList
              data={filteredClientes}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.clienteItem} onPress={() => selectCliente(item)}>
                  <Text style={styles.clienteNome}>{item.razaoSocial}</Text>
                  <Text style={styles.clienteCnpj}>{item.cnpj}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Nenhum cliente encontrado</Text>
              }
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowClientModal(false)}
            >
              <Text style={styles.closeText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4, marginTop: 12 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc',
    borderRadius: 8, padding: 12, fontSize: 16, color: '#333',
  },
  clientSelector: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc',
    borderRadius: 8, padding: 12, minHeight: 44, justifyContent: 'center',
  },
  clientText: { fontSize: 16, color: '#333' },
  placeholder: { fontSize: 16, color: '#999' },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  checkbox: {
    width: 22, height: 22, borderWidth: 2, borderColor: colors.primary,
    borderRadius: 4, marginRight: 10,
  },
  checkboxActive: { backgroundColor: colors.primary },
  checkLabel: { fontSize: 16, color: '#333' },
  saveButton: {
    backgroundColor: colors.primary, padding: 14, borderRadius: 8,
    alignItems: 'center', marginTop: 24, marginBottom: 40,
  },
  disabled: { opacity: 0.6 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16,
    padding: 16, maxHeight: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#333' },
  searchInput: {
    backgroundColor: '#f5f5f5', borderRadius: 8, padding: 10, fontSize: 14,
    marginBottom: 12, color: '#333',
  },
  clienteItem: {
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  clienteNome: { fontSize: 15, fontWeight: '500', color: '#333' },
  clienteCnpj: { fontSize: 13, color: '#666', marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20 },
  closeButton: {
    marginTop: 12, padding: 12, alignItems: 'center',
    backgroundColor: '#f5f5f5', borderRadius: 8,
  },
  closeText: { fontSize: 15, fontWeight: '600', color: '#333' },
});
