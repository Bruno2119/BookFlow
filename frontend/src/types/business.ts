export interface Business {
  id: number;
  nome: string;
  endereco: string;
  telefone: string;
  descricao: string;
}

export interface Service {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  duracaoMinutos: number;
  negocioId: number;
}

export type StatusMarcacao = 'Pendente' | 'Confirmada' | 'Concluida' | 'Cancelada' | 'Rejeitada';

export interface Booking {
  id?: number;
  dataHoraInicio: string;
  dataHoraFim: string;
  estado: StatusMarcacao;
  precoAplicado: number;
  clienteId: number;
  profissionalId: number;
  servicoId: number;
  negocioId: number;
}
