export interface LoginParams {
  usuario: string;
  senha: string;
}

export interface Usuario {
  id: number;
  nome: string;
  usuario: string;
  email: string;
  fone: string;
  isAdmin: boolean;
  isUser: boolean;
  isManager: boolean;
  cliente: import('./cliente').Cliente | null;
  clienteId: number;
  isActive: boolean;
  trocaSenha: boolean;
}

export interface ResetSenhaParams {
  id: number;
  senha: string;
}
