import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { cobrancasApi } from '../../api/cobrancas';
import { colors, spacing, borderRadius } from '../../theme';

type Route = RouteProp<RootStackParamList, 'RegistroCobranca'>;

export default function RegistroCobrancaScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const [clienteId, setClienteId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [referencia, setReferencia] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!clienteId.trim() || !descricao.trim() || !valor.trim() || !dataVencimento.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }
    setLoading(true);
    try {
      await cobrancasApi.cadastrar({
        clienteId: Number(clienteId),
        descricao: descricao.trim(),
        valor: Number(valor.replace(',', '.')),
        dataVencimento: dataVencimento.trim(),
        referencia: referencia.trim() || undefined,
      });
      Alert.alert('Sucesso', 'Cobrança cadastrada com sucesso');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao cadastrar cobrança');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>ID do Cliente *</Text>
      <TextInput
        style={styles.input}
        value={clienteId}
        onChangeText={setClienteId}
        keyboardType="numeric"
        placeholder="Ex: 1"
        placeholderTextColor={colors.textDisabled}
      />

      <Text style={styles.label}>Descrição *</Text>
      <TextInput
        style={styles.input}
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Ex: Mensalidade contábil"
        placeholderTextColor={colors.textDisabled}
      />

      <Text style={styles.label}>Valor *</Text>
      <TextInput
        style={styles.input}
        value={valor}
        onChangeText={setValor}
        keyboardType="decimal-pad"
        placeholder="Ex: 500,00"
        placeholderTextColor={colors.textDisabled}
      />

      <Text style={styles.label}>Data de Vencimento *</Text>
      <TextInput
        style={styles.input}
        value={dataVencimento}
        onChangeText={setDataVencimento}
        placeholder="AAAA-MM-DD"
        placeholderTextColor={colors.textDisabled}
      />

      <Text style={styles.label}>Referência</Text>
      <TextInput
        style={styles.input}
        value={referencia}
        onChangeText={setReferencia}
        placeholder="Ex: 06/2026"
        placeholderTextColor={colors.textDisabled}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Salvar</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  label: {
    fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, paddingVertical: 12, fontSize: 16,
    borderWidth: 1, borderColor: colors.border, color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.primary, borderRadius: borderRadius.md,
    paddingVertical: 14, alignItems: 'center', marginTop: spacing.lg,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
