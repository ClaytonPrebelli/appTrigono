import apiClient from './client';
import { Cobranca, CobrancaCreate, CobrancaListParams } from '../types/cobranca';

export const cobrancasApi = {
  listar: async (params?: CobrancaListParams): Promise<Cobranca[]> => {
    const query = params?.referencia ? `?referencia=${params.referencia}` : '';
    const response = await apiClient.get<Cobranca[]>(`/Cobrancas/ListarCobrancas${query}`);
    return response.data;
  },

  verPorId: async (id: number): Promise<Cobranca> => {
    const response = await apiClient.get<Cobranca>(`/Cobrancas/VerCobrancaId?id=${id}`);
    return response.data;
  },

  cadastrar: async (data: CobrancaCreate, recorrente?: boolean, meses?: number): Promise<Cobranca> => {
    const query = new URLSearchParams();
    if (recorrente) query.append('recorrente', 'true');
    if (meses) query.append('meses', String(meses));
    const qs = query.toString();
    const response = await apiClient.post<Cobranca>(
      `/Cobrancas/Cadastrar${qs ? '?' + qs : ''}`, data
    );
    return response.data;
  },

  atualizar: async (cobranca: Cobranca): Promise<Cobranca> => {
    const response = await apiClient.put<Cobranca>('/Cobrancas/Atualizar', cobranca);
    return response.data;
  },

  deletar: async (id: number): Promise<void> => {
    await apiClient.delete(`/Cobrancas/Deletar?id=${id}`);
  },

  listarPorCliente: async (clienteId: number, pagina: number, itensPorPagina: number): Promise<Cobranca[]> => {
    const response = await apiClient.get<any>(
      `/Cobrancas/ListarCobrancasPorCliente?clienteId=${clienteId}&pagina=${pagina}&itensPorPagina=${itensPorPagina}`
    );
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && data.data) return Array.isArray(data.data) ? data.data : [];
    if (data && data.items) return Array.isArray(data.items) ? data.items : [];
    if (data && data.result) return Array.isArray(data.result) ? data.result : [];
    if (data && data.cobrancas) return Array.isArray(data.cobrancas) ? data.cobrancas : [];
    return [];
  },
};
