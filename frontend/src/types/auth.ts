export type TipoUtilizador = 'ADMIN' | 'PROFISSIONAL' | 'CLIENTE' | 'DONO';

export interface User {
  id: number;
  nome: string;
  email: string;
  tipo: TipoUtilizador;
  negocioId?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
