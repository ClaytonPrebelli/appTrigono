import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';
import { DrawerParamList } from '../navigation/AppNavigator';
import { colors, spacing, borderRadius } from '../theme';

type NavProp = DrawerNavigationProp<DrawerParamList>;

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<NavProp>();

  const cards = [
    { title: 'Clientes', subtitle: 'Gerenciar clientes', route: 'Clientes' as const },
    { title: 'Cobranças', subtitle: 'Gerenciar cobranças', route: 'Cobrancas' as const },
    { title: 'Abertura de Empresa', subtitle: 'Formulários de abertura', route: 'AberturaEmpresa' as const },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Bem-vindo, {user?.nome || 'Usuário'}</Text>
      <View style={styles.cardGrid}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.route}
            style={styles.card}
            onPress={() => navigation.navigate(card.route)}
          >
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  welcome: {
    fontSize: 22, fontWeight: 'bold', color: colors.textPrimary,
    marginBottom: spacing.lg, marginTop: spacing.md,
  },
  cardGrid: { gap: spacing.md },
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: colors.primary, marginBottom: spacing.xs },
  cardSubtitle: { fontSize: 14, color: colors.textSecondary },
  logoutButton: {
    marginTop: 'auto', backgroundColor: colors.error, borderRadius: borderRadius.md,
    paddingVertical: 12, alignItems: 'center', marginBottom: spacing.md,
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
