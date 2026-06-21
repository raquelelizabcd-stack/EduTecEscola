import { UserRole } from './types';

export const ROLE_CONFIG: Record<UserRole, { label: string; color: string; icon: string }> = {
  ADMIN_GERAL: { label: 'Admin Geral', color: 'bg-purple-600', icon: 'ShieldCheck' },
  DIRETOR: { label: 'Escola', color: 'bg-blue-600', icon: 'ShieldCheck' },
  PROFESSOR: { label: 'Professor', color: 'bg-emerald-600', icon: 'GraduationCap' },
  RESPONSAVEL: { label: 'Responsável', color: 'bg-amber-600', icon: 'Users' },
  ALUNO: { label: 'Aluno', color: 'bg-indigo-600', icon: 'User' },
};

export const NAVIGATION_CATEGORIES = [
  {
    id: 'principal',
    label: 'Principal',
    roles: ['ADMIN_GERAL', 'DIRETOR', 'PROFESSOR'],
    items: [
      { id: 'dashboard-geral', label: 'Dashboard Geral', roles: ['ADMIN_GERAL', 'DIRETOR', 'PROFESSOR'], icon: 'LayoutDashboard' },
    ]
  },
  {
    id: 'pedagogico',
    label: 'Pedagógico',
    roles: ['DIRETOR', 'PROFESSOR'],
    items: [
      { id: 'dashboard-evolucao', label: 'Dashboard de Evolução', roles: ['DIRETOR'], icon: 'FileBarChart' },
      { id: 'plano-aula', label: 'Plano de Aula', roles: ['DIRETOR', 'PROFESSOR'], icon: 'BookOpen' },
      { id: 'diario-semanal', label: 'Diário Semanal', roles: ['DIRETOR', 'PROFESSOR'], icon: 'ClipboardList' },
      { id: 'registro-mensal', label: 'Registro Mensal', roles: ['DIRETOR', 'PROFESSOR'], icon: 'FileText' },
      { id: 'relatorios', label: 'Relatórios', roles: ['DIRETOR', 'PROFESSOR'], icon: 'FileBarChart' },
      { id: 'parecer-pcd', label: 'Parecer PCD', roles: ['DIRETOR', 'PROFESSOR'], icon: 'ShieldCheck' },
    ]
  },
  {
    id: 'gestao-escolar',
    label: 'Gestão Escolar',
    roles: ['DIRETOR', 'PROFESSOR'],
    items: [
      { id: 'alunos', label: 'Alunos', roles: ['DIRETOR'], icon: 'Users' },
      { id: 'professores', label: 'Professores', roles: ['DIRETOR'], icon: 'GraduationCap' },
      { id: 'turmas', label: 'Turmas', roles: ['DIRETOR', 'PROFESSOR'], icon: 'Home' },
      { id: 'presenca', label: 'Presença', roles: ['DIRETOR', 'PROFESSOR'], icon: 'CheckSquare' },
    ]
  },
  {
    id: 'comunicacao',
    label: 'Comunicação',
    roles: ['DIRETOR', 'PROFESSOR', 'RESPONSAVEL', 'ALUNO'],
    items: [
      { id: 'agenda', label: 'Agenda Digital', roles: ['DIRETOR', 'PROFESSOR', 'RESPONSAVEL', 'ALUNO'], icon: 'Calendar' },
      { id: 'comunicados', label: 'Comunicados', roles: ['DIRETOR', 'PROFESSOR', 'RESPONSAVEL', 'ALUNO'], icon: 'Megaphone' },
      { id: 'manual-sistema', label: 'Manual do Sistema', roles: ['DIRETOR', 'PROFESSOR', 'RESPONSAVEL', 'ALUNO'], icon: 'BookOpen' },
      { id: 'portal-pais', label: 'Portal dos Pais', roles: ['RESPONSAVEL'], icon: 'Users' },
    ]
  },
  {
    id: 'administrativo',
    label: 'Administrativo',
    roles: ['DIRETOR'],
    items: [
      { id: 'financeiro', label: 'Financeiro', roles: ['ADMIN_GERAL', 'DIRETOR'], icon: 'DollarSign' },
      { id: 'secretaria', label: 'Secretaria', roles: ['ADMIN_GERAL', 'DIRETOR'], icon: 'FileText' },
      { id: 'direcao', label: 'Gestão Interna', roles: ['ADMIN_GERAL', 'DIRETOR'], icon: 'ShieldCheck' },
      { id: 'usuarios-escola', label: 'Gestão de Usuários', roles: ['DIRETOR'], icon: 'Users' },
      { id: 'administrativo-mod', label: 'Configurações', roles: ['ADMIN_GERAL', 'DIRETOR'], icon: 'Settings' },
    ]
  },
  {
    id: 'super-admin',
    label: 'Super Admin',
    roles: ['ADMIN_GERAL'],
    items: [
      { id: 'gestao-usuarios', label: 'Gestão de Usuários', roles: ['ADMIN_GERAL'], icon: 'Users2' },
      { id: 'config-sistema', label: 'Configurações', roles: ['ADMIN_GERAL'], icon: 'Settings' },
      { id: 'logs-atividades', label: 'Logs do Sistema', roles: ['ADMIN_GERAL'], icon: 'ClipboardList' },
      { id: 'estatisticas-gerais', label: 'Estatísticas Gerais', roles: ['ADMIN_GERAL'], icon: 'TrendingUp' },
    ]
  }
];

export const MOCK_HOLIDAYS = [
  { id: '1', title: 'Confraternização Universal', date: '2026-01-01', type: 'HOLIDAY_NATIONAL' },
  { id: '2', title: 'Carnaval', date: '2026-02-17', type: 'HOLIDAY_NATIONAL' },
  { id: '3', title: 'Sexta-feira Santa', date: '2026-04-03', type: 'HOLIDAY_NATIONAL' },
  { id: '4', title: 'Tiradentes', date: '2026-04-21', type: 'HOLIDAY_NATIONAL' },
  { id: '5', title: 'Dia do Trabalho', date: '2026-05-01', type: 'HOLIDAY_NATIONAL' },
  { id: '6', title: 'Corpus Christi', date: '2026-06-04', type: 'HOLIDAY_NATIONAL' },
  { id: '7', title: 'Independência do Brasil', date: '2026-09-07', type: 'HOLIDAY_NATIONAL' },
  { id: '8', title: 'Nossa Senhora Aparecida', date: '2026-10-12', type: 'HOLIDAY_NATIONAL' },
  { id: '9', title: 'Finados', date: '2026-11-02', type: 'HOLIDAY_NATIONAL' },
  { id: '10', title: 'Proclamação da República', date: '2026-11-15', type: 'HOLIDAY_NATIONAL' },
  { id: '11', title: 'Natal', date: '2026-12-25', type: 'HOLIDAY_NATIONAL' },
  { id: '12', title: 'Revolução Constitucionalista', date: '2026-07-09', type: 'HOLIDAY_REGIONAL' },
  { id: '13', title: 'Dia da Consciência Negra', date: '2026-11-20', type: 'HOLIDAY_REGIONAL' },
];
