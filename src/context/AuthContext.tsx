import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Usuario, LoginParams } from '../types/usuario';
import { authApi } from '../api/auth';

interface AuthContextData {
  user: Usuario | null;
  loading: boolean;
  signIn: (params: LoginParams) => Promise<void>;
  signOut: () => Promise<void>;
  resetSenha: (id: number, senha: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('@trigono_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (params: LoginParams) => {
    const usuario = await authApi.login(params);
    await AsyncStorage.setItem('@trigono_user', JSON.stringify(usuario));
    setUser(usuario);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('@trigono_user');
    setUser(null);
  };

  const resetSenha = async (id: number, senha: string) => {
    const updated = await authApi.resetSenha({ id, senha });
    await AsyncStorage.setItem('@trigono_user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, resetSenha }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
