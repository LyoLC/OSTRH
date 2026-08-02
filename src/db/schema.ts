import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, integer, boolean, uuid, date, numeric } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const colaboradores = pgTable('colaboradores', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull(),
  apelido: text('apelido').notNull(),
  empresa: text('empresa').notNull(),
  cargo: text('cargo').notNull(),
  departamento: text('departamento').notNull(),
  supervisor: text('supervisor').notNull(),
  dataAdmissao: text('data_admissao').notNull(),
  dataFimContrato: text('data_fim_contrato'),
  dataDemissao: text('data_demissao'),
  estado: text('estado').notNull(),
  contacto: text('contacto').notNull(),
  email: text('email').notNull(),
  dataNascimento: text('data_nascimento'),
  sexo: text('sexo').notNull(),
  salario: numeric('salario').notNull(),
  nuit: text('nuit'),
  observacoes: text('observacoes'),
  foto: text('foto'),
  bi: text('bi'),
  niss: text('niss'),
  passaporte: text('passaporte'),
  estadoCivil: text('estado_civil'),
  dependentes: integer('dependentes').default(0),
  endereco: text('endereco'),
  localizacao: text('localizacao'),
  banco: text('banco'),
  iban: text('iban'),
  conta: text('conta'),
  filial: text('filial'),
  centroCusto: text('centro_custo'),
  tipoContrato: text('tipo_contrato')
});

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  timestamp: text('timestamp').notNull(),
  action: text('action').notNull(),
  colaboradorId: text('colaborador_id'),
  colaboradorNome: text('colaborador_nome').notNull(),
  details: text('details').notNull(),
  user: text('user_name').notNull(),
});
