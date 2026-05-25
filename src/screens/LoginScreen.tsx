import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Switch,
  Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { colors, borderRadius, spacing } from '../theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [salvarSenha, setSalvarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('@trigono_saved_login').then((saved) => {
      if (saved) {
        const { usuario: u, senha: s } = JSON.parse(saved);
        setUsuario(u || '');
        setSenha(s || '');
        setSalvarSenha(true);
      }
    }).catch(() => {});
  }, []);

  const handleLogin = async () => {
    if (!usuario.trim() || !senha.trim()) {
      Alert.alert('Erro', 'Preencha usuário e senha');
      return;
    }
    setLoading(true);
    try {
      if (salvarSenha) {
        await AsyncStorage.setItem('@trigono_saved_login', JSON.stringify({ usuario: usuario.trim(), senha: senha.trim() }));
      } else {
        await AsyncStorage.removeItem('@trigono_saved_login');
      }
      await signIn({ usuario: usuario.trim(), senha: senha.trim() });
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Portal Trigono</Text>
        <Text style={styles.subtitle}>Consultoria Contábil</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Usuário"
            placeholderTextColor={colors.textDisabled}
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
            editable={!loading}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Senha"
              placeholderTextColor={colors.textDisabled}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!showSenha}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowSenha(!showSenha)}
            >
              <Text style={styles.eyeText}>{showSenha ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.rememberRow}>
            <Switch
              value={salvarSenha}
              onValueChange={setSalvarSenha}
              trackColor={{ false: '#94a3b8', true: '#3b82f6' }}
              thumbColor={salvarSenha ? '#fff' : '#f1f5f9'}
            />
            <Text style={styles.rememberText}>Salvar senha</Text>
          </View>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  content: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logo: {
    width: 120, height: 120, marginBottom: spacing.lg, borderRadius: 60,
  },
  title: {
    fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: spacing.xl * 2,
  },
  form: { width: '100%', maxWidth: 360 },
  input: {
    backgroundColor: '#fff', borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, paddingVertical: 14,
    fontSize: 16, marginBottom: spacing.md, color: colors.textPrimary,
  },
  passwordContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  passwordInput: {
    flex: 1, paddingHorizontal: spacing.md, paddingVertical: 14,
    fontSize: 16, color: colors.textPrimary,
  },
  eyeButton: { paddingHorizontal: spacing.md, paddingVertical: 14 },
  eyeText: { fontSize: 20 },
  rememberRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginBottom: spacing.md,
  },
  rememberText: { color: '#fff', fontSize: 14 },
  button: {
    backgroundColor: colors.accent, borderRadius: borderRadius.md,
    paddingVertical: 14, alignItems: 'center', marginTop: spacing.sm,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
