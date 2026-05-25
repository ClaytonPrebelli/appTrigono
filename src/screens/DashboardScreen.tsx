import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, spacing, borderRadius } from '../theme';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const icons: Record<string, string> = {
  Clientes: '👥',
  Cobrancas: '📋',
  AberturaEmpresa: '📄',
};

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<NavProp>();

  const cards = [
    { title: 'Clientes', subtitle: 'Gerenciar clientes', route: 'Clientes' as const },
    { title: 'Cobranças', subtitle: 'Gerenciar cobranças', route: 'Cobrancas' as const },
    { title: 'Abertura de Empresa', subtitle: 'Formulários de abertura', route: 'AberturaEmpresa' as const },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.welcome}>Bem-vindo,</Text>
            <Text style={styles.userName}>{user?.nome || 'Usuário'}</Text>
            <Text style={styles.userRole}>
              {user?.isAdmin ? 'Administrador' : user?.isManager ? 'Gerente' : 'Usuário'}
            </Text>
          </View>
        </View>

        <View style={styles.cardGrid}>
          {cards.map((card) => (
            <TouchableOpacity
              key={card.route}
              style={styles.card}
              onPress={() => navigation.navigate(card.route)}
              activeOpacity={0.7}
            >
              <Text style={styles.cardIcon}>{icons[card.route]}</Text>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
              </View>
              <Text style={styles.cardArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={signOut} activeOpacity={0.7}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xl },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl * 1.5,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
  },
  headerContent: {},
  welcome: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  userName: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  userRole: {
    fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '500',
  },
  cardGrid: {
    paddingHorizontal: spacing.md,
    marginTop: -spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    paddingVertical: 28,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  cardIcon: { fontSize: 32, marginRight: spacing.md },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 3 },
  cardSubtitle: { fontSize: 14, color: colors.textSecondary },
  cardArrow: { fontSize: 28, color: colors.textDisabled, fontWeight: '300' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
    backgroundColor: '#fff',
    borderRadius: borderRadius.md,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutIcon: { fontSize: 18 },
  logoutText: { color: colors.error, fontSize: 16, fontWeight: '700' },
});
