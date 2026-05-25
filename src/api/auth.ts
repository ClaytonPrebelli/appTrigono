import apiClient from './client';
import { LoginParams, Usuario, ResetSenhaParams } from '../types/usuario';

export const authApi = {
  login: async (params: LoginParams): Promise<Usuario> => {
    const response = await apiClient.post<Usuario>('/Usuarios/Login', params);
    return response.data;
  },

  resetSenha: async (params: ResetSenhaParams): Promise<Usuario> => {
    const response = await apiClient.post<Usuario>('/Usuarios/ResetForcado', params);
    return response.data;
  },

  verificaAtivo: async (usuario: string): Promise<boolean> => {
    const response = await apiClient.get<boolean>(`/Usuarios/VerificaAtivo?usuario=${usuario}`);
    return response.data;
  },
};
