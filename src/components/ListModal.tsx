import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

interface Item {
  titulo: string;
  linhas: { label: string; valor: string; cor?: string }[];
}

interface Props {
  visible: boolean;
  titulo: string;
  itens: Item[];
  onClose: () => void;
}

export default function ListModal({ visible, titulo, itens, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>{titulo}</Text>
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {itens.length === 0 ? (
              <Text style={styles.empty}>Nenhum</Text>
            ) : (
              itens.map((item, i) => (
                <View key={i} style={styles.card}>
                  <Text style={styles.cardTitle}>{item.titulo}</Text>
                  {item.linhas.map((linha, j) => (
                    <View key={j} style={styles.row}>
                      <Text style={styles.label}>{linha.label}:</Text>
                      <Text style={[styles.valor, linha.cor ? { color: linha.cor } : undefined]}>
                        {linha.valor}
                      </Text>
                    </View>
                  ))}
                </View>
              ))
            )}
          </ScrollView>
          <TouchableOpacity style={styles.btnClose} onPress={onClose}>
            <Text style={styles.btnCloseText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', padding: spacing.lg,
  },
  content: {
    maxHeight: '80%', backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md, textAlign: 'center' },
  list: { marginBottom: spacing.md },
  listContent: { gap: spacing.sm },
  card: {
    backgroundColor: colors.background, borderRadius: borderRadius.md,
    padding: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.primary,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  label: { fontSize: 12, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' },
  valor: { fontSize: 13, color: '#fff', fontWeight: '500' },
  empty: { textAlign: 'center', color: colors.textSecondary, fontSize: 16, paddingVertical: spacing.lg },
  btnClose: {
    backgroundColor: colors.primary, borderRadius: borderRadius.md,
    paddingVertical: 14, alignItems: 'center',
  },
  btnCloseText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
