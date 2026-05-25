import apiClient from './client';
import { AberturaEmpresa, AberturaEmpresaListagemResponse } from '../types/abertura-empresa';

export const aberturaEmpresaApi = {
  gerarLink: async (): Promise<{ token: string; link: string }> => {
    const response = await apiClient.post('/AberturaEmpresa/GerarLink');
    return response.data;
  },

  salvarFormulario: async (form: AberturaEmpresa): Promise<AberturaEmpresa> => {
    const response = await apiClient.post<AberturaEmpresa>(
      '/AberturaEmpresa/SalvarFormularioCompleto', form
    );
    return response.data;
  },

  atualizarFormulario: async (form: AberturaEmpresa): Promise<AberturaEmpresa> => {
    const response = await apiClient.put<AberturaEmpresa>(
      '/AberturaEmpresa/AtualizarFormularioCompleto', form
    );
    return response.data;
  },

  listar: async (pagina: number, itensPorPagina: number): Promise<AberturaEmpresaListagemResponse> => {
    const response = await apiClient.get<AberturaEmpresaListagemResponse>(
      `/AberturaEmpresa/ListarFormularios?pagina=${pagina}&itensPorPagina=${itensPorPagina}`
    );
    return response.data;
  },

  verPorToken: async (token: string): Promise<AberturaEmpresa> => {
    const response = await apiClient.get<AberturaEmpresa>(
      `/AberturaEmpresa/VerFormularioPorToken?token=${token}`
    );
    return response.data;
  },

  verPorId: async (id: number): Promise<AberturaEmpresa> => {
    const response = await apiClient.get<AberturaEmpresa>(
      `/AberturaEmpresa/VerFormularioPorId?id=${id}`
    );
    return response.data;
  },

  uploadDocumento: async (
    aberturaId: number,
    file: FormData,
    tipoDocumento?: string,
    observacao?: string
  ): Promise<void> => {
    const query = new URLSearchParams();
    query.append('aberturaId', String(aberturaId));
    if (tipoDocumento) query.append('tipoDocumento', tipoDocumento);
    if (observacao) query.append('observacao', observacao);
    await apiClient.post(`/AberturaEmpresa/UploadDocumento?${query.toString()}`, file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deletarDocumento: async (documentoId: number): Promise<void> => {
    await apiClient.delete(`/AberturaEmpresa/DeletarDocumento?documentoId=${documentoId}`);
  },

  listarDocumentos: async (aberturaId: number) => {
    const response = await apiClient.get(
      `/AberturaEmpresa/ListarDocumentos?aberturaId=${aberturaId}`
    );
    return response.data;
  },
};
