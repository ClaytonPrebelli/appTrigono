import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ListaClientesScreen from '../screens/Clientes/ListaClientesScreen';
import DetalheClienteScreen from '../screens/Clientes/DetalheClienteScreen';
import ListaCobrancasScreen from '../screens/Cobrancas/ListaCobrancasScreen';
import RegistroCobrancaScreen from '../screens/Cobrancas/RegistroCobrancaScreen';
import ListaAberturaScreen from '../screens/AberturaEmpresa/ListaAberturaScreen';
import DetalheAberturaScreen from '../screens/AberturaEmpresa/DetalheAberturaScreen';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  DetalheCliente: { id: number };
  RegistroCobranca: { id?: number };
  DetalheAbertura: { id: number };
};

export type DrawerParamList = {
  Dashboard: undefined;
  Clientes: undefined;
  Cobrancas: undefined;
  AberturaEmpresa: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Início' }} />
      <Drawer.Screen name="Clientes" component={ListaClientesScreen} options={{ title: 'Clientes' }} />
      <Drawer.Screen name="Cobrancas" component={ListaCobrancasScreen} options={{ title: 'Cobranças' }} />
      <Drawer.Screen name="AberturaEmpresa" component={ListaAberturaScreen} options={{ title: 'Abertura de Empresa' }} />
    </Drawer.Navigator>
  );
}

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
          <Stack.Screen name="Main" component={DrawerNavigator} />
          <Stack.Screen
            name="DetalheCliente"
            component={DetalheClienteScreen}
            options={{ headerShown: true, title: 'Detalhe do Cliente', headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff' }}
          />
          <Stack.Screen
            name="RegistroCobranca"
            component={RegistroCobrancaScreen}
            options={{ headerShown: true, title: 'Registrar Cobrança', headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff' }}
          />
          <Stack.Screen
            name="DetalheAbertura"
            component={DetalheAberturaScreen}
            options={{ headerShown: true, title: 'Detalhe da Abertura', headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff' }}
          />
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
