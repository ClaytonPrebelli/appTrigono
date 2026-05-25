import React, { useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius } from '../theme';
import { baixarEInstalar } from '../services/updateService';

interface Props {
  visible: boolean;
  versaoAtual: string;
  versaoNova: string;
  downloadUrl: string;
  nomeArquivo: string;
  onClose: () => void;
}

export default function UpdateModal({
  visible, versaoAtual, versaoNova, downloadUrl, nomeArquivo, onClose,
}: Props) {
  const [baixando, setBaixando] = useState(false);
  const [progresso, setProgresso] = useState(0);

  const handleAtualizar = async () => {
    setBaixando(true);
    try {
      await baixarEInstalar(downloadUrl, nomeArquivo, setProgresso);
    } catch {
      setBaixando(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.emoji}>📲</Text>
          <Text style={styles.title}>Nova versão disponível</Text>
          <Text style={styles.subtitle}>
            v{versaoAtual} → v{versaoNova}
          </Text>
          <Text style={styles.desc}>
            Uma nova versão do app foi encontrada. Deseja atualizar?
          </Text>

          {baixando ? (
            <View style={styles.progressArea}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.progressText}>{progresso}%</Text>
            </View>
          ) : (
            <View style={styles.actions}>
              <TouchableOpacity style={styles.btnUpdate} onPress={handleAtualizar}>
                <Text style={styles.btnUpdateText}>⬇ Atualizar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnLater} onPress={onClose}>
                <Text style={styles.btnLaterText}>Agora não</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', padding: spacing.lg,
  },
  content: {
    width: '100%', backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, alignItems: 'center',
  },
  emoji: { fontSize: 48, marginBottom: spacing.md },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { fontSize: 14, color: colors.primary, fontWeight: '600', marginBottom: spacing.sm },
  desc: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
  progressArea: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  progressText: { fontSize: 16, fontWeight: '600', color: colors.primary },
  actions: { width: '100%', gap: spacing.sm },
  btnUpdate: {
    backgroundColor: colors.primary, borderRadius: borderRadius.md,
    paddingVertical: 14, alignItems: 'center',
  },
  btnUpdateText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  btnLater: {
    borderRadius: borderRadius.md, paddingVertical: 12, alignItems: 'center',
  },
  btnLaterText: { color: colors.textSecondary, fontSize: 14 },
});
