export interface Cobranca {
  id: number;
  clienteId: number;
  cliente?: import('./cliente').Cliente;
  descricao: string;
  valor: number;
  dataVencimento: string;
  isPago: boolean;
  dataPagamento: string | null;
  metodoPagamento: string | null;
  referencia: string | null;
}

export interface CobrancaListParams {
  referencia?: string;
}

export interface CobrancaCreate {
  clienteId: number;
  descricao: string;
  valor: number;
  dataVencimento: string;
  isPago?: boolean;
  metodoPagamento?: string;
  referencia?: string;
}

export interface CobrancaPaginada {
  clienteId: number;
  pagina: number;
  itensPorPagina: number;
}
