import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ListaClientesScreen from '../screens/Clientes/ListaClientesScreen';
import DetalheClienteScreen from '../screens/Clientes/DetalheClienteScreen';
import ListaCobrancasScreen from '../screens/Cobrancas/ListaCobrancasScreen';
import DetalheCobrancaScreen from '../screens/Cobrancas/DetalheCobrancaScreen';
import RegistroCobrancaScreen from '../screens/Cobrancas/RegistroCobrancaScreen';
import ListaAberturaScreen from '../screens/AberturaEmpresa/ListaAberturaScreen';
import DetalheAberturaScreen from '../screens/AberturaEmpresa/DetalheAberturaScreen';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Clientes: undefined;
  Cobrancas: undefined;
  AberturaEmpresa: undefined;
  DetalheCliente: { id: number };
  DetalheCobranca: { id: number };
  RegistroCobranca: { id?: number };
  DetalheAbertura: { id: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '600' as const },
};

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Clientes" component={ListaClientesScreen} options={{ headerShown: true, title: 'Clientes', ...screenOptions }} />
          <Stack.Screen name="Cobrancas" component={ListaCobrancasScreen} options={{ headerShown: true, title: 'Cobranças', ...screenOptions }} />
          <Stack.Screen name="AberturaEmpresa" component={ListaAberturaScreen} options={{ headerShown: true, title: 'Abertura de Empresa', ...screenOptions }} />
          <Stack.Screen name="DetalheCliente" component={DetalheClienteScreen} options={{ headerShown: true, title: 'Detalhe do Cliente', ...screenOptions }} />
          <Stack.Screen name="DetalheCobranca" component={DetalheCobrancaScreen} options={{ headerShown: true, title: 'Detalhe da Cobrança', ...screenOptions }} />
          <Stack.Screen name="RegistroCobranca" component={RegistroCobrancaScreen} options={{ headerShown: true, title: 'Nova Cobrança', ...screenOptions }} />
          <Stack.Screen name="DetalheAbertura" component={DetalheAberturaScreen} options={{ headerShown: true, title: 'Detalhe da Abertura', ...screenOptions }} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
