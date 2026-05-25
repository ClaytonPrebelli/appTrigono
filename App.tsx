import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { UpdateProvider, useUpdate } from './src/context/UpdateContext';
import UpdateModal from './src/components/UpdateModal';
import AppNavigator from './src/navigation/AppNavigator';

function UpdateGate() {
  const { updateInfo, dismiss } = useUpdate();

  if (!updateInfo) return null;

  return (
    <UpdateModal
      visible
      versaoAtual={updateInfo.versaoAtual}
      versaoNova={updateInfo.versaoNova}
      downloadUrl={updateInfo.downloadUrl}
      nomeArquivo={updateInfo.nomeArquivo}
      onClose={dismiss}
    />
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <UpdateProvider>
          <StatusBar style="light" />
          <AppNavigator />
          <UpdateGate />
        </UpdateProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
