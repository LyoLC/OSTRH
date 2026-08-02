export type Empresa = 'NUKE' | 'PCS' | 'ZMAX' | 'MICC';

export type Departamento = 'Oficina' | 'Operação' | 'Administração' | 'Warehouse' | 'Safety';

export type EstadoColaborador = 'Activo' | 'Inactivo' | 'Despedido' | 'Suspenso';

export type Sexo = 'Masculino' | 'Feminino';

export interface Colaborador {
  id: string;
  nome: string;
  apelido: string;
  sexo: Sexo;
  dataNascimento: string; // ISO date YYYY-MM-DD
  empresa: Empresa;
  departamento: Departamento;
  cargo: string;
  supervisor: string;
  dataAdmissao: string; // ISO date
  dataFimContrato?: string; // ISO date
  dataDemissao?: string; // ISO date
  estado: EstadoColaborador;
  contacto: string;
  email: string;
  salario: number;
  nuit: string;
  observacoes: string;
  foto?: string; // URL for photo
  bi?: string;
  niss?: string;
  passaporte?: string;
  estadoCivil?: string;
  dependentes?: number;
  endereco?: string;
  localizacao?: string;
  banco?: string;
  iban?: string;
  conta?: string;
  filial?: string;
  centroCusto?: string;
  tipoContrato?: string;
}

export type ActionType = 'Criar' | 'Editar' | 'Eliminar' | 'Importar';

export interface AuditLog {
  id: string;
  timestamp: string;
  action: ActionType;
  colaboradorId?: string;
  colaboradorNome: string;
  details: string;
  user: string;
}

export interface Historico {
  id: string;
  colaboradorId: string;
  data: string;
  tipo: 'Promoção' | 'Transferência' | 'Mudança de Departamento' | 'Demissão' | 'Recontratação' | 'Outro';
  descricao: string;
}
