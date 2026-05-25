import apiClient from './client';
import { Cliente } from '../types/cliente';

export const clientesApi = {
  listar: async (): Promise<Cliente[]> => {
    const response = await apiClient.get<Cliente[]>('/Clientes/ListarClientes');
    return response.data;
  },

  verPorId: async (id: number): Promise<Cliente> => {
    const response = await apiClient.get<Cliente>(`/Clientes/VerClienteId?id=${id}`);
    return response.data;
  },

  cadastrar: async (cliente: Cliente): Promise<Cliente> => {
    const response = await apiClient.post<Cliente>('/Clientes/Cadastrar', cliente);
    return response.data;
  },

  atualizar: async (cliente: Cliente): Promise<Cliente> => {
    const response = await apiClient.put<Cliente>('/Clientes/AtualizarCliente', cliente);
    return response.data;
  },

  uploadCertificado: async (file: FormData, cnpj: string, senha: string): Promise<void> => {
    await apiClient.post(`/Clientes/UploadCertificado?cnpj=${cnpj}&senha=${senha}`, file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
