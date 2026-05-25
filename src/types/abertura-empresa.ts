export interface QuadroSocietario {
  id?: number;
  aberturaEmpresaId?: number;
  nome: string;
  cpf?: string;
  nacionalidade?: string;
  estadoCivil?: string;
  regimeCasamento?: string;
  profissao?: string;
  escolaridade?: string;
  cargo?: string;
  percentualParticipacao?: number;
  enderecoLogradouro?: string;
  enderecoNumero?: string;
  enderecoComplemento?: string;
  enderecoBairro?: string;
  enderecoCidade?: string;
  enderecoEstado?: string;
  enderecoCep?: string;
  telefone?: string;
  email?: string;
  isAdministrador?: boolean;
  temProLabore?: boolean;
}

export interface AberturaEmpresaDocumento {
  id: number;
  aberturaEmpresaId: number;
  nomeArquivo: string;
  tipoDocumento?: string;
  observacao?: string;
  dataUpload: string;
  tamanhoBytes: number;
}

export interface AberturaEmpresa {
  id?: number;
  token?: string;
  dataCadastro?: string;
  dataAtualizacao?: string;
  status?: string;
  opcao1NomeEmpresa?: string;
  opcao2NomeEmpresa?: string;
  opcao3NomeEmpresa?: string;
  nomeFantasia?: string;
  cnaePrincipalCodigo?: string;
  cnaePrincipalDescricao?: string;
  naturezaJuridica?: string;
  capitalSocial?: number;
  isServico?: boolean;
  isIndustria?: boolean;
  isComercio?: boolean;
  enderecoLogradouro?: string;
  enderecoNumero?: string;
  enderecoComplemento?: string;
  enderecoBairro?: string;
  enderecoCidade?: string;
  enderecoEstado?: string;
  enderecoCep?: string;
  telefone?: string;
  email?: string;
  observacoes?: string;
  clienteId?: number;
  quadroSocietario?: QuadroSocietario[];
  documentos?: AberturaEmpresaDocumento[];
}

export interface AberturaEmpresaListagemResponse {
  totalRegistros: number;
  pagina: number;
  itensPorPagina: number;
  totalPaginas: number;
  formularios: AberturaEmpresa[];
}
