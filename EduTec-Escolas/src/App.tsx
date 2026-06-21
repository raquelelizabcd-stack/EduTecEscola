/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  GraduationCap, 
  Users, 
  User as UserIcon, 
  LogOut, 
  ChevronRight, 
  FileText, 
  Calendar, 
  Megaphone, 
  DollarSign, 
  Settings, 
  BookOpen, 
  ClipboardList, 
  FileBarChart, 
  CheckSquare, 
  Home,
  Plus,
  Download,
  Upload,
  MessageCircle,
  X,
  Search,
  ChevronLeft,
  Bell,
  TrendingUp,
  Users2,
  BookOpenCheck,
  GraduationCap as GradIcon,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  LayoutDashboard,
  ClipboardCheck,
  FileSpreadsheet,
  BrainCircuit,
  UserPlus,
  UserCog,
  Building2,
  CalendarCheck,
  MoreHorizontal,
  AlertCircle,
  Filter,
  Pencil,
  Trash2,
  Lock
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from './lib/utils';
import { UserRole, User, SchoolEvent, Document, Announcement } from './types';
import { ROLE_CONFIG, NAVIGATION_CATEGORIES, MOCK_HOLIDAYS } from './constants';

import { getAssistantResponse } from './services/assistantService';
import { getSupabase } from './lib/supabase';

// --- Components ---

const ManualSistema = ({ onNavigate, role }: { onNavigate: (tab: string) => void; role: UserRole }) => {
  const [search, setSearch] = useState('');

  const professorSections = [
    {
      id: 'plano-aula',
      title: 'Plano de Aula',
      icon: 'BookOpen',
      target: 'plano-aula',
      content: 'O Plano de Aula permite que você organize suas atividades pedagógicas de forma estruturada, definindo objetivos, metodologias e recursos necessários.',
      steps: [
        'Acesse Pedagógico > Plano de Aula',
        'Clique no botão "+ Novo Plano" para criar um novo registro',
        'Preencha os campos de data, turma, objetivos e metodologia',
        'Utilize o botão "Salvar Rascunho" para continuar depois ou "Finalizar Plano" para concluir'
      ]
    },
    {
      id: 'diario-semanal',
      title: 'Diário Semanal',
      icon: 'Calendar',
      target: 'diario-semanal',
      content: 'No Diário Semanal, você registra o que foi trabalhado em cada aula, mantendo um histórico detalhado do progresso da turma.',
      steps: [
        'Vá em Pedagógico > Diário Semanal',
        'Navegue pelas semanas utilizando os botões de anterior/próximo',
        'Clique em "+ Adicionar Registro" no dia correspondente',
        'Para consultar registros antigos, basta retroceder as semanas no topo da tela'
      ]
    },
    {
      id: 'registro-mensal',
      title: 'Registro Mensal',
      icon: 'ClipboardList',
      target: 'registro-mensal',
      content: 'O Registro Mensal consolida as informações de presença e desempenho dos alunos ao longo do mês.',
      steps: [
        'Acesse Pedagógico > Registro Mensal',
        'Selecione o mês desejado nos cards exibidos',
        'Preencha as informações solicitadas para a turma',
        'Utilize as opções de exportação para gerar arquivos em PDF ou Excel'
      ]
    },
    {
      id: 'relatorios',
      title: 'Relatórios',
      icon: 'FileBarChart',
      target: 'relatorios',
      content: 'Gere documentos de acompanhamento pedagógico para turmas inteiras ou alunos específicos.',
      steps: [
        'Vá em Pedagógico > Relatórios',
        'Escolha entre "Relatórios Coletivos" ou "Relatórios Individuais"',
        'Utilize os filtros para selecionar a turma ou o aluno específico',
        'Clique em "Gerar" e faça o download do documento'
      ]
    },
    {
      id: 'parecer-pcd',
      title: 'Parecer PCD',
      icon: 'ShieldCheck',
      target: 'parecer-pcd',
      content: 'Módulo dedicado ao registro do acompanhamento de alunos com necessidades especiais, focando em adaptações e evolução.',
      steps: [
        'Acesse Pedagógico > Parecer PCD',
        'Selecione o aluno na lista suspensa',
        'Descreva as adaptações curriculares e a evolução observada',
        'Clique em "Emitir Parecer" para oficializar o registro'
      ]
    },

    {
      id: 'turmas',
      title: 'Turmas',
      icon: 'Users',
      target: 'turmas',
      content: 'Consulte as informações das turmas sob sua responsabilidade, incluindo lista de alunos e horários.',
      steps: [
        'Acesse Gestão Escolar > Turmas',
        'Visualize os cards das suas turmas atribuídas',
        'Clique em "Ver Detalhes" para acessar a lista completa de alunos',
        'Confira o período e o professor regente de cada grupo'
      ]
    },
    {
      id: 'presenca',
      title: 'Presença',
      icon: 'CheckSquare',
      target: 'presenca',
      content: 'Realize a chamada diária de forma rápida e prática.',
      steps: [
        'Vá em Gestão Escolar > Presença',
        'Selecione a turma e a data correta',
        'Marque "P" para presente ou "F" para falta para cada aluno',
        'Clique em "Salvar Chamada". Para corrigir, basta alterar a marcação e salvar novamente'
      ]
    },
    {
      id: 'agenda-digital',
      title: 'Agenda Digital',
      icon: 'Calendar',
      target: 'agenda',
      content: 'Acompanhe o calendário escolar, eventos e compromissos importantes.',
      steps: [
        'Acesse Comunicação > Agenda Digital',
        'Navegue pelo calendário para visualizar eventos marcados',
        'Clique em um evento para ver detalhes como local e horário',
        'Confirme sua participação ou ciência nos eventos que solicitarem'
      ]
    },
    {
      id: 'comunicados',
      title: 'Comunicados',
      icon: 'Megaphone',
      target: 'comunicados',
      content: 'Receba avisos e orientações da direção e coordenação diretamente no sistema.',
      steps: [
        'Vá em Comunicação > Comunicados',
        'Verifique a lista de mensagens recebidas',
        'Abra o comunicado para ler o conteúdo completo',
        'Utilize os botões de confirmação de leitura ou resposta quando disponível'
      ]
    }
  ];

  const defaultSections = [
    {
      id: 'cadastro-alunos',
      title: 'Cadastro de Alunos',
      icon: 'Users',
      target: 'alunos',
      content: 'Para cadastrar um novo aluno, acesse o módulo de Gestão Escolar e clique em Alunos. No canto superior direito, você encontrará o botão "Novo Aluno". Preencha os dados básicos, documentos e informações de contato dos responsáveis.',
      steps: [
        'Acesse Gestão Escolar > Alunos',
        'Clique em "Novo Aluno"',
        'Preencha o formulário completo',
        'Clique em Salvar'
      ]
    },
    {
      id: 'relatorios-pedagogicos',
      title: 'Relatórios Pedagógicos',
      icon: 'FileBarChart',
      target: 'relatorios',
      content: 'Os relatórios pedagógicos consolidam o desempenho das turmas e alunos. Você pode gerar relatórios de evolução, pareceres descritivos e boletins periódicos.',
      steps: [
        'Vá em Pedagógico > Relatórios',
        'Selecione o tipo de relatório desejado',
        'Filtre por turma ou aluno',
        'Exporte em PDF ou Excel'
      ]
    }
  ];

  const sections = role === 'PROFESSOR' ? professorSections : defaultSections;

  const filteredSections = sections.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manual do Sistema</h2>
          <p className="text-slate-500">Guia passo a passo para dominar o EduTecPro.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar no manual..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {filteredSections.length > 0 ? filteredSections.map((section) => (
          <motion.div
            key={section.id}
            id={`manual-${section.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-8 border-none shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                      <Icon name={section.icon} className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{section.title}</h3>
                  </div>
                  
                  <p className="text-slate-600 leading-relaxed mb-6">
                    {section.content}
                  </p>

                  <div className="bg-slate-50 rounded-2xl p-6 mb-6">
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-emerald-500" />
                      Passo a Passo
                    </h4>
                    <ul className="space-y-3">
                      {section.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                          <span className="w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-emerald-600 shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    variant="success" 
                    className="gap-2"
                    onClick={() => onNavigate(section.target)}
                  >
                    Abrir {section.title}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="lg:w-80 shrink-0">
                  <div className="aspect-video bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                    <Icon name="Upload" className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-xs font-medium">Print de tela ilustrativo</p>
                    <p className="text-[10px] opacity-60 mt-1">Demonstração visual da interface de {section.title.toLowerCase()}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )) : (
          <EmptyState message="Nenhum tópico encontrado para sua pesquisa." />
        )}
      </div>
    </div>
  );
};

const ManualModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-600 text-white">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6" />
              <h3 className="text-lg font-bold">Manual do Sistema EduTecPro</h3>
            </div>
            <button onClick={onClose}><X className="w-6 h-6" /></button>
          </div>
          <div className="p-8 overflow-y-auto space-y-8">
            <section>
              <h4 className="text-xl font-bold text-slate-900 mb-4">1. Introdução</h4>
              <p className="text-slate-600 leading-relaxed">
                Bem-vindo ao EduTecPro! Este manual foi desenvolvido para ajudar você a aproveitar ao máximo todas as funcionalidades da nossa plataforma de gestão escolar.
              </p>
            </section>
            <section>
              <h4 className="text-xl font-bold text-slate-900 mb-4">2. Perfil Diretor</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h5 className="font-bold text-emerald-600 mb-2">Secretaria Digital</h5>
                  <p className="text-sm text-slate-600">Gerencie documentos, exporte boletins e importe registros de alunos com facilidade.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h5 className="font-bold text-emerald-600 mb-2">Gestão Financeira</h5>
                  <p className="text-sm text-slate-600">Controle mensalidades, fluxo de caixa e inadimplência em um painel consolidado.</p>
                </div>
              </div>
            </section>
            <section>
              <h4 className="text-xl font-bold text-slate-900 mb-4">3. Perfil Professor</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h5 className="font-bold text-emerald-600 mb-2">Plano de Aula</h5>
                  <p className="text-sm text-slate-600">Crie e organize seus planos de aula semanais e mensais integrados à BNCC.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h5 className="font-bold text-emerald-600 mb-2">Diário de Classe</h5>
                  <p className="text-sm text-slate-600">Registre presenças, ocorrências e avaliações de forma rápida e intuitiva.</p>
                </div>
              </div>
            </section>
          </div>
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
            <Button variant="success" onClick={onClose}>Entendi, obrigado!</Button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const ChatWidget = ({ user, onNavigate }: { user: User; onNavigate: (tab: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: `Olá, ${user.name}! Sou o assistente virtual do EduTecPro. Como posso ajudar você hoje?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    // Simulate saving to Supabase
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('chat_history').insert({
          user_id: user.id,
          message: userMessage,
          role: 'user',
          created_at: new Date().toISOString()
        });
      } catch (e) {
        console.error("Supabase Log Error:", e);
      }
    }

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await getAssistantResponse(userMessage, history);
    
    // Check for navigation commands in response
    if (response.includes('[NAVIGATE:')) {
      const match = response.match(/\[NAVIGATE:(.+?)\]/);
      if (match) {
        const target = match[1];
        onNavigate(target);
      }
    }

    setMessages(prev => [...prev, { role: 'model', text: response.replace(/\[NAVIGATE:.+?\]/g, '') }]);
    setIsLoading(false);

    // Log response to Supabase
    if (sb) {
      try {
        await sb.from('chat_history').insert({
          user_id: user.id,
          message: response,
          role: 'model',
          created_at: new Date().toISOString()
        });
      } catch (e) {
        console.error("Supabase Log Error:", e);
      }
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[400px] h-[600px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          >
            <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold">Assistente Virtual</h4>
                  <p className="text-[10px] text-emerald-100 uppercase tracking-wider">Online agora</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {messages.map((m, i) => (
                <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    'max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm',
                    m.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  )}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex gap-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Como posso ajudar?"
                className="flex-1 px-4 py-2 bg-slate-100 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
              <Button type="submit" variant="success" className="p-2 h-10 w-10 shrink-0" disabled={isLoading}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95',
          isOpen ? 'bg-slate-800 text-white rotate-90' : 'bg-emerald-600 text-white'
        )}
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
        {!isOpen && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full border-2 border-white animate-pulse">
            1
          </span>
        )}
      </button>
    </div>
  );
};

const EmptyState = ({ message = 'Nenhum registro encontrado' }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
    <Search className="w-12 h-12 mb-4 opacity-20" />
    <p className="text-lg font-medium">{message}</p>
  </div>
);

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const icons: Record<string, any> = {
    ShieldCheck, GraduationCap, Users, User: UserIcon, FileText, Calendar, 
    Megaphone, DollarSign, Settings, BookOpen, ClipboardList, FileBarChart, 
    CheckSquare, Home, Plus, Download, Upload, MessageCircle, X, Search, Bell,
    BrainCircuit, TrendingUp, Users2, BookOpenCheck, Wallet, ArrowUpRight, 
    ArrowDownRight, Building2, CalendarCheck, MoreHorizontal, Filter
  };
  const LucideIcon = icons[name] || ShieldCheck;
  return <LucideIcon className={className} />;
};

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className,
  disabled,
  type = 'button'
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger' | 'whatsapp';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:bg-slate-100',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    whatsapp: 'bg-[#25D366] text-white hover:bg-[#128C7E]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className, title, subtitle, actions, ...props }: { children: React.ReactNode; className?: string; title?: string; subtitle?: string; actions?: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden', className)} {...props}>
    {(title || actions) && (
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          {title && <h3 className="text-base sm:text-lg font-semibold text-slate-900">{title}</h3>}
          {subtitle && <p className="text-xs sm:text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex gap-2 w-full sm:w-auto">{actions}</div>}
      </div>
    )}
    <div className="p-4 sm:p-6">{children}</div>
  </div>
);

// --- Modules ---

const LandingPage = ({ onStartLogin }: { onStartLogin: () => void }) => {
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const features = [
    {
      title: 'Pedagógico',
      icon: 'BookOpen',
      items: ['Dashboard de Evolução', 'Relatórios', 'Parecer PCD', 'Diário Semanal', 'Registro Mensal', 'Plano de Aula']
    },
    {
      title: 'Gestão Escolar',
      icon: 'GraduationCap',
      items: ['Alunos', 'Professores', 'Turmas', 'Presença']
    },
    {
      title: 'Comunicação',
      icon: 'Megaphone',
      items: ['Agenda Digital', 'Comunicados']
    },
    {
      title: 'Administrativo',
      icon: 'Settings',
      items: ['Financeiro', 'Secretaria', 'Direção', 'Administrativo']
    }
  ];

  const navLinks = [
    { href: '#inicio', label: 'Início' },
    { href: '#funcionalidades', label: 'Funcionalidades' },
    { href: '#planos', label: 'Planos Escola' },
    { href: '#contato', label: 'Contato' },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="font-bold text-lg sm:text-2xl text-slate-900 tracking-tight">EduTecPro</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a key={link.href} href={link.href} className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">{link.label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" onClick={onStartLogin} className="hidden sm:flex">Acessar Sistema</Button>
            <Button variant="success" className="text-xs sm:text-sm px-3 sm:px-4">Falar com Consultor</Button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg"
            >
              <Icon name={isMobileMenuOpen ? 'X' : 'MoreHorizontal'} className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
            >
              <div className="px-6 py-8 space-y-6">
                <nav className="flex flex-col gap-4">
                  {navLinks.map(link => (
                    <a 
                      key={link.href} 
                      href={link.href} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-lg font-semibold text-slate-900 hover:text-emerald-600 transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
                <div className="pt-6 border-t border-slate-50 flex flex-col gap-3">
                  <Button variant="outline" onClick={onStartLogin} className="w-full justify-center">Acessar Sistema</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="pt-32 sm:pt-40 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6">
              Exclusivo para Instituições de Ensino
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-4 sm:mb-6">
              EduTecPro para Escolas  <span className="text-emerald-600">Gestão completa e</span> inteligente.
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-8 sm:mb-10 leading-relaxed">
              Transforme a rotina da sua escola com uma plataforma robusta e segura. 
              Gestão pedagógica, administrativa e comunicação em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Button variant="success" className="px-8 py-4 text-lg w-full sm:w-auto">Falar com Consultor</Button>
              <Button variant="outline" className="px-8 py-4 text-lg bg-white w-full sm:w-auto" onClick={() => setShowReferralModal(true)}>Indicar minha escola</Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mt-8 lg:mt-0"
          >
            <div className="aspect-square sm:aspect-video lg:aspect-square bg-emerald-50 rounded-[2rem] sm:rounded-[3rem] overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80" 
                alt="EduTecPro Dashboard Preview" 
                className="object-cover w-full h-full"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/10 to-transparent" />
            </div>
            {/* Floating Stats */}
            <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 max-w-[160px] sm:max-w-[200px]">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-6 h-6 sm:w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <Users className="w-3 h-3 sm:w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-900">+500 Escolas</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500">Conectadas e transformando a educação.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-24 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Funcionalidades em Destaque</h2>
            <p className="text-slate-600">Uma solução 360º para cobrir todas as necessidades da sua instituição.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full border-none shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                    <Icon name={feature.icon} className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                  <ul className="space-y-3">
                    {feature.items.map(item => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-emerald-600 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Suporte Prioritário (Enterprise)</h4>
                <p className="text-emerald-100 text-sm">Atendimento exclusivo e implementação assistida.</p>
              </div>
            </div>
            <Button variant="outline" className="bg-white text-emerald-700 border-none hover:bg-emerald-50">Conhecer Enterprise</Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Planos Escola</h2>
            <p className="text-slate-600">Escolha o plano ideal para o tamanho da sua instituição.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Growth Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-2 border-slate-100 hover:border-emerald-500 transition-colors p-8">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900">Escola de Crescimento</h3>
                  <p className="text-slate-500 mt-2">Ideal para escolas médias (100300 alunos).</p>
                </div>
                <div className="mb-8">
                  <span className="text-4xl font-extrabold text-slate-900">R$ 1.470</span>
                  <span className="text-slate-500">/ano</span>
                </div>
                <ul className="space-y-4 mb-10">
                  {['Pedagógico completo', 'Gestão escolar', 'Portal dos pais', 'Secretaria digital', 'Dashboard estratégico'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-slate-600">
                      <CheckSquare className="w-5 h-5 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant="success" className="w-full py-4">Assinar Agora</Button>
              </Card>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full border-2 border-emerald-500 bg-emerald-50/30 p-8 relative">
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-emerald-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Mais Completo
                </div>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900">Escola Enterprise</h3>
                  <p className="text-slate-500 mt-2">Duas opções de contratação flexível.</p>
                </div>
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">R$ 5</span>
                    <span className="text-slate-500">/aluno/mês</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">(Equivalente a R$ 60/aluno/ano)</p>
                </div>
                <ul className="space-y-4 mb-10">
                  {['Tudo do Growth', 'Financeiro completo', 'Administrativo avançado', 'Suporte prioritário', 'Customizações exclusivas'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-slate-600">
                      <CheckSquare className="w-5 h-5 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant="success" className="w-full py-4">Falar com Consultor</Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Profiles Section */}
      <section className="py-24 bg-slate-900 text-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Perfis de Usuário</h2>
            <p className="text-slate-400">Acessos personalizados para cada necessidade da instituição.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex gap-6">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">Diretor da Escola</h3>
                <ul className="space-y-3 text-slate-400">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Acesso completo a todos os módulos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Painel estratégico consolidado
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Gestão financeira e administrativa
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">Professor da Escola</h3>
                <ul className="space-y-3 text-slate-400">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Acesso restrito ao pedagógico
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Presença da turma e diário
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Comunicação via agenda digital
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-emerald-600 rounded-[3rem] p-12 lg:p-20 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-5xl font-bold mb-8">Gostou do EduTecPro?</h2>
            <p className="text-xl text-emerald-100 mb-12 max-w-2xl mx-auto">
              Apresente para sua escola e implemente uma gestão inteligente e completa.
            </p>
            <Button 
              variant="outline" 
              className="bg-white text-emerald-700 border-none hover:bg-emerald-50 px-10 py-5 text-lg"
              onClick={() => setShowReferralModal(true)}
            >
              Indicar minha escola
            </Button>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="py-12 border-t border-slate-100 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">EduTecPro</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 EduTecPro. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-emerald-600 transition-colors"><Icon name="MessageCircle" className="w-5 h-5" /></a>
            <a href="#" className="text-slate-400 hover:text-emerald-600 transition-colors"><Icon name="Settings" className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>

      {/* Referral Modal */}
      <AnimatePresence>
        {showReferralModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-600 text-white">
                <h3 className="text-lg font-bold">Indicar Minha Escola</h3>
                <button onClick={() => setShowReferralModal(false)}><X className="w-6 h-6" /></button>
              </div>
              <form className="p-8 space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Indicação enviada com sucesso!'); setShowReferralModal(false); }}>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Nome da Escola</label>
                  <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Seu Nome</label>
                  <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Contato da Direção (E-mail ou Telefone)</label>
                  <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Mensagem Adicional</label>
                  <textarea rows={3} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
                </div>
                <Button type="submit" variant="success" className="w-full py-3 mt-4">Enviar Indicação</Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Login = ({ onLogin, onBackToLanding }: { onLogin: (user: User) => void; onBackToLanding: () => void }) => {
  const [credentials, setCredentials] = useState<Record<string, { login: string; pass: string }>>({
    ADMIN_GERAL: { login: '', pass: '' },
    DIRETOR: { login: '', pass: '' },
    PROFESSOR: { login: '', pass: '' },
    RESPONSAVEL: { login: '', pass: '' },
  });

  const handleInputChange = (role: UserRole, field: 'login' | 'pass', value: string) => {
    setCredentials(prev => ({
      ...prev,
      [role]: { ...prev[role], [field]: value }
    }));
  };

  const rolesToDisplay: { role: UserRole; icon: string }[] = [
    { role: 'ADMIN_GERAL', icon: 'ShieldCheck' },
    { role: 'DIRETOR', icon: 'Building2' },
    { role: 'PROFESSOR', icon: 'GraduationCap' },
    { role: 'RESPONSAVEL', icon: 'Users' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-12 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl w-full"
      >
        <button 
          onClick={onBackToLanding}
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors mb-8 sm:mb-12 font-medium group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Voltar para o site
        </button>

        <div className="text-center mb-10 sm:mb-16">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl shadow-emerald-200 ring-4 ring-emerald-50">
            <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Selecione seu Perfil</h1>
          <p className="text-slate-500 mt-2 sm:mt-3 text-base sm:text-lg px-4">Escolha abaixo como deseja acessar o EduTecPro e insira suas credenciais.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {rolesToDisplay.map(({ role, icon }) => (
            <motion.div
              key={role}
              whileHover={{ y: -8 }}
              className="bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full"
            >
              <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
                <div className={cn('w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center text-white mb-4 sm:mb-6 shadow-lg', ROLE_CONFIG[role].color)}>
                  <Icon name={icon} className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">{ROLE_CONFIG[role].label}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">Acesso completo ao painel de {ROLE_CONFIG[role].label.toLowerCase()}</p>
              </div>

              <div className="space-y-3 sm:space-y-4 mt-auto">
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Login</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Usuário ou e-mail"
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                      value={credentials[role].login}
                      onChange={(e) => handleInputChange(role, 'login', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Senha</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="password" 
                      placeholder="Sua senha"
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                      value={credentials[role].pass}
                      onChange={(e) => handleInputChange(role, 'pass', e.target.value)}
                    />
                  </div>
                </div>
                
                <Button 
                  variant="success" 
                  className="w-full py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-emerald-100 mt-2 sm:mt-4"
                  onClick={async () => {
                    const { login, pass } = credentials[role];
                    const cleanLogin = login.trim();
                    const cleanPass = pass.trim();

                    if (!cleanLogin || !cleanPass) {
                      alert('Por favor, insira o login/e-mail e a senha.');
                      return;
                    }

                    const supabase = getSupabase();
                    if (!supabase) {
                      alert('Erro: Conexão com o Supabase não inicializada.');
                      return;
                    }

                    try {
                      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                        email: cleanLogin,
                        password: cleanPass,
                      });

                      if (authError) {
                        alert(`Erro na autenticação: ${authError.message}`);
                        return;
                      }

                      if (!authData.user) {
                        alert('Nenhum usuário retornado do Supabase.');
                        return;
                      }

                      const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('name, role, whatsapp')
                        .eq('id', authData.user.id)
                        .single();

                      if (profileError) {
                        console.warn('Perfil não encontrado no banco, usando dados padrão:', profileError);
                        onLogin({
                          id: authData.user.id,
                          name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'Usuário',
                          role: role,
                          email: authData.user.email || cleanLogin,
                        });
                      } else {
                        onLogin({
                          id: authData.user.id,
                          name: profileData.name || 'Usuário',
                          role: profileData.role as UserRole,
                          email: authData.user.email || cleanLogin,
                          whatsapp: profileData.whatsapp || undefined,
                        });
                      }
                    } catch (err: any) {
                      alert(`Erro ao fazer login: ${err.message || err}`);
                    }
                  }}
                >
                  Entrar como {ROLE_CONFIG[role].label}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// --- Pedagógico Components ---

const DashboardEvolucao = () => {
  const evolucaoData = [
    { name: 'Jan', nota: 7.2, meta: 7.5 },
    { name: 'Fev', nota: 7.5, meta: 7.5 },
    { name: 'Mar', nota: 8.1, meta: 7.5 },
    { name: 'Abr', nota: 7.8, meta: 7.5 },
    { name: 'Mai', nota: 8.4, meta: 7.5 },
    { name: 'Jun', nota: 8.2, meta: 7.5 },
  ];

  const frequenciaData = [
    { name: '1º Ano A', pct: 98 },
    { name: '1º Ano B', pct: 95 },
    { name: '2º Ano A', pct: 92 },
    { name: '2º Ano B', pct: 88 },
    { name: '3º Ano A', pct: 96 },
  ];

  const distribuicaoData = [
    { name: 'A (9-10)', value: 15, color: '#10b981' },
    { name: 'B (7-8.9)', value: 45, color: '#3b82f6' },
    { name: 'C (5-6.9)', value: 30, color: '#f59e0b' },
    { name: 'D (<5)', value: 10, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Barra Superior com Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Filtros do Dashboard</h2>
            <p className="text-xs text-slate-500">Personalize sua visualização</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <select className="flex-1 sm:flex-none px-3 py-2 bg-slate-50 border-none rounded-xl text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all">
            <option>Todas as Turmas</option>
            <option>1º Ano A</option>
            <option>2º Ano B</option>
          </select>
          <select className="flex-1 sm:flex-none px-3 py-2 bg-slate-50 border-none rounded-xl text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all">
            <option>1º Trimestre 2026</option>
            <option>2º Trimestre 2026</option>
          </select>
          <select className="flex-1 sm:flex-none px-3 py-2 bg-slate-50 border-none rounded-xl text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all">
            <option>Todas as Disciplinas</option>
            <option>Matemática</option>
            <option>Português</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Indicadores */}
        <div className="lg:col-span-4 space-y-6">
          {/* Indicadores Principais */}
          <div className="grid grid-cols-1 gap-4">
            <Card className="p-5 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Média Geral</p>
                    <h3 className="text-2xl font-black text-slate-900">7.8</h3>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+4.2%</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Frequência</p>
                    <h3 className="text-2xl font-black text-slate-900">94.5%</h3>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">-0.8%</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Planos Concluídos</p>
                    <h3 className="text-2xl font-black text-slate-900">24/28</h3>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">85%</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Indicadores Adicionais */}
          <Card className="p-6">
            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Top 3 Turmas (Desempenho)
            </h4>
            <div className="space-y-4">
              {[
                { name: '3º Ano A', media: 8.9, color: 'bg-emerald-500' },
                { name: '1º Ano B', media: 8.4, color: 'bg-blue-500' },
                { name: '2º Ano A', media: 8.1, color: 'bg-amber-500' },
              ].map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400">0{i+1}</span>
                    <span className="text-sm font-medium text-slate-700">{t.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${t.color}`} style={{ width: `${t.media * 10}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-900">{t.media}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-red-50 border-none">
            <h4 className="text-sm font-bold text-red-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Alunos em Risco (Nota &lt; 6)
            </h4>
            <div className="space-y-3">
              {[
                { name: 'Lucas Ferreira', nota: 5.2, turma: '2º Ano B' },
                { name: 'Mariana Costa', nota: 5.8, turma: '1º Ano A' },
              ].map((a, i) => (
                <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{a.name}</p>
                    <p className="text-[10px] text-slate-500">{a.turma}</p>
                  </div>
                  <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-1 rounded-lg">{a.nota}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-slate-900">Taxa de Conclusão de Relatórios</h4>
              <span className="text-xs font-bold text-blue-600">92%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: '92%' }}></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 italic">Meta: 100% até o final do trimestre</p>
          </Card>
        </div>

        {/* Coluna Direita: Gráficos */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Evolução de Notas</h3>
                <p className="text-xs text-slate-500">Comparativo mensal vs Meta estabelecida</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Nota Média</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Meta (7.5)</span>
                </div>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolucaoData}>
                  <defs>
                    <linearGradient id="colorNota" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} domain={[0, 10]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="nota" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorNota)" />
                  <Line type="monotone" dataKey="meta" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Frequência por Turma</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={frequenciaData} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} width={80} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="pct" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20}>
                      {frequenciaData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.pct < 90 ? '#ef4444' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Distribuição de Notas</h3>
              <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribuicaoData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {distribuicaoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900">100%</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Total Alunos</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {distribuicaoData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                    <span className="text-[10px] font-medium text-slate-600">{d.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <div className="flex items-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-medium">Dados protegidos e atualizados em tempo real</span>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Última Atualização</p>
          <p className="text-xs font-bold text-slate-600">07 de Março de 2026 às 08:21</p>
        </div>
      </div>
    </div>
  );
};

const PlanoAula = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Plano de Aula</h2>
        <Button variant="success" className="gap-2 w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4" /> Novo Plano
        </Button>
      </div>

      <Card>
        <form className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Data da Aula</label>
              <input type="date" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Turma</label>
              <select className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none">
                <option>Selecione a turma...</option>
                <option>1º Ano A</option>
                <option>2º Ano B</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Objetivos de Aprendizagem</label>
            <textarea rows={3} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none" placeholder="O que os alunos devem aprender?" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Atividades e Metodologia</label>
            <textarea rows={5} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none" placeholder="Descreva o passo a passo da aula..." />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Recursos Necessários</label>
            <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ex: Projetor, Cartolina, Livro Didático" />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline">Salvar Rascunho</Button>
            <Button variant="success">Finalizar Plano</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const DiarioSemanal = () => {
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Diário Semanal</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none bg-white justify-center">Semana Anterior</Button>
          <Button variant="outline" className="flex-1 sm:flex-none bg-white justify-center">Próxima Semana</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {days.map(day => (
          <Card key={day} title={day}>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-slate-400 border border-slate-200">01</div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900">Matemática - 1º Ano A</h4>
                  <p className="text-sm text-slate-500">Conteúdo: Adição e Subtração com reserva.</p>
                </div>
                <Button variant="ghost" className="text-emerald-600">Editar</Button>
              </div>
              <Button variant="outline" className="w-full border-dashed border-2 py-4 text-slate-400 hover:text-emerald-600 hover:border-emerald-200">
                <Plus className="w-4 h-4 mr-2" /> Adicionar Registro
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const RegistroMensal = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Registro Mensal</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {['Março', 'Abril', 'Maio', 'Junho'].map(month => (
          <Card key={month} className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-400">2026</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{month}</h3>
            <p className="text-sm text-slate-500 mt-1">Status: Concluído</p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-400">24 registros</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const Relatorios = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Relatórios</h2>
        <Button variant="success" className="gap-2 w-full sm:w-auto justify-center">
          <FileBarChart className="w-4 h-4" /> Gerar Novo Relatório
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Relatórios Coletivos" subtitle="Desempenho por turma e disciplina">
          <div className="space-y-4 mt-4">
            {[1, 2].map(i => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Relatório Trimestral - 1º Ano A</h4>
                    <p className="text-xs text-slate-500">Gerado em 01/03/2026</p>
                  </div>
                </div>
                <Button variant="ghost" className="p-2"><Download className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Relatórios Individuais" subtitle="Acompanhamento detalhado por aluno">
          <div className="space-y-4 mt-4">
            {[1, 2].map(i => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">João Silva - Evolução Pedagógica</h4>
                    <p className="text-xs text-slate-500">Gerado em 05/03/2026</p>
                  </div>
                </div>
                <Button variant="ghost" className="p-2"><Download className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const ParecerPCD = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Parecer PCD</h2>
      <Card>
        <div className="p-4 sm:p-8 space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Aluno</label>
            <select className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none">
              <option>Selecione o aluno...</option>
              <option>Lucas Mendes (Autismo)</option>
              <option>Ana Clara (TDAH)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Adaptações Curriculares Realizadas</label>
            <textarea rows={4} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Evolução no Período</label>
            <textarea rows={4} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Observações para os Responsáveis</label>
            <textarea rows={3} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline">Salvar Rascunho</Button>
            <Button variant="success">Emitir Parecer</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// --- Gestão Escolar Components ---

const NovoAlunoModal = ({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd: (student: any) => void }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    class: '', 
    birthDate: '', 
    responsibles: [{ name: '', kinship: '', whatsapp: '' }] 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ 
      name: '', 
      class: '', 
      birthDate: '', 
      responsibles: [{ name: '', kinship: '', whatsapp: '' }] 
    });
  };

  const addResponsible = () => {
    setFormData(prev => ({
      ...prev,
      responsibles: [...prev.responsibles, { name: '', kinship: '', whatsapp: '' }]
    }));
  };

  const removeResponsible = (index: number) => {
    if (formData.responsibles.length > 1) {
      setFormData(prev => ({
        ...prev,
        responsibles: prev.responsibles.filter((_, i) => i !== index)
      }));
    }
  };

  const updateResponsible = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      responsibles: prev.responsibles.map((r, i) => i === index ? { ...r, [field]: value } : r)
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Novo Aluno</h3>
                  <p className="text-xs text-slate-500">Cadastre um novo estudante no sistema</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nome Completo do Aluno</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Silva"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Turma</label>
                  <select
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none bg-white"
                    value={formData.class}
                    onChange={e => setFormData({ ...formData, class: e.target.value })}
                  >
                    <option value="">Selecionar Turma</option>
                    <option value="1º Ano A">1º Ano A</option>
                    <option value="1º Ano B">1º Ano B</option>
                    <option value="2º Ano A">2º Ano A</option>
                    <option value="2º Ano B">2º Ano B</option>
                    <option value="3º Ano A">3º Ano A</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Data de Nascimento</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white"
                    value={formData.birthDate}
                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Informações do Responsável</p>
                  <button 
                    type="button"
                    onClick={addResponsible}
                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 uppercase tracking-wider"
                  >
                    <Plus className="w-3 h-3" /> Adicionar Responsável
                  </button>
                </div>

                {formData.responsibles.map((resp, index) => (
                  <div key={index} className="space-y-4 p-4 bg-slate-50 rounded-2xl relative border border-slate-100">
                    {formData.responsibles.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeResponsible(index)}
                        className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Nome do Responsável {formData.responsibles.length > 1 ? `#${index + 1}` : ''}</label>
                      <input
                        type="text"
                        required
                        placeholder="Nome completo"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white"
                        value={resp.name}
                        onChange={e => updateResponsible(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Parentesco</label>
                        <select
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white"
                          value={resp.kinship}
                          onChange={e => updateResponsible(index, 'kinship', e.target.value)}
                        >
                          <option value="">Selecionar</option>
                          <option value="Pai">Pai</option>
                          <option value="Mãe">Mãe</option>
                          <option value="Avô/Avó">Avô/Avó</option>
                          <option value="Tio/Tia">Tio/Tia</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">WhatsApp</label>
                        <input
                          type="tel"
                          required
                          placeholder="(00) 00000-0000"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white"
                          value={resp.whatsapp}
                          onChange={e => updateResponsible(index, 'whatsapp', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex gap-3">
                <Button variant="outline" className="flex-1 py-3" onClick={onClose}>Cancelar</Button>
                <Button type="submit" variant="success" className="flex-1 py-3">Cadastrar Aluno</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Alunos = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState([
    { name: 'João Silva', id: '2026001', class: '1º Ano A', status: 'Ativo', birthDate: '2015-05-12', responsibles: [{ name: 'Maria Silva', kinship: 'Mãe', whatsapp: '(11) 98888-7777' }] },
    { name: 'Maria Oliveira', id: '2026002', class: '2º Ano B', status: 'Ativo', birthDate: '2014-08-22', responsibles: [{ name: 'José Oliveira', kinship: 'Pai', whatsapp: '(11) 97777-6666' }] },
    { name: 'Pedro Santos', id: '2026003', class: '1º Ano A', status: 'Inativo', birthDate: '2015-02-10', responsibles: [{ name: 'Ana Santos', kinship: 'Mãe', whatsapp: '(11) 96666-5555' }] },
  ]);

  const handleAddStudent = (newStudent: any) => {
    const nextId = 2026000 + students.length + 1;
    setStudents([...students, { ...newStudent, id: String(nextId), status: 'Ativo' }]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Gestão de Alunos</h2>
        <Button variant="success" className="gap-2 w-full sm:w-auto justify-center" onClick={() => setIsModalOpen(true)}>
          <UserPlus className="w-4 h-4" /> Novo Aluno
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar por nome ou matrícula..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
          </div>
          <Button variant="outline" className="gap-2 w-full sm:w-auto justify-center"><Filter className="w-4 h-4" /> Filtros</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="p-4 font-medium text-slate-500">Nome</th>
                <th className="p-4 font-medium text-slate-500">Matrícula</th>
                <th className="p-4 font-medium text-slate-500">Turma</th>
                <th className="p-4 font-medium text-slate-500">Status</th>
                <th className="p-4 font-medium text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.map((aluno, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="p-4 font-medium text-slate-900">{aluno.name}</td>
                  <td className="p-4 text-slate-500">{aluno.id}</td>
                  <td className="p-4 text-slate-600">{aluno.class}</td>
                  <td className="p-4">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-[10px] font-bold uppercase',
                      aluno.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    )}>
                      {aluno.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" className="p-2"><MoreHorizontal className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <NovoAlunoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddStudent} 
      />
    </div>
  );
};

const NovoProfessorModal = ({ isOpen, onClose, onAdd, initialData }: { isOpen: boolean; onClose: () => void; onAdd: (prof: any) => void; initialData?: any }) => {
  const [formData, setFormData] = useState({ name: '', subject: '', classes: '', status: 'Ativo' });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ name: '', subject: '', classes: '', status: 'Ativo' });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{initialData ? 'Editar Professor' : 'Novo Professor'}</h3>
                  <p className="text-xs text-slate-500">{initialData ? 'Atualize os dados do docente' : 'Cadastre um novo docente no sistema'}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ana Souza"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Disciplina</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Matemática"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Turmas</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 1º A, 2º B"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.classes}
                  onChange={e => setFormData({ ...formData, classes: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Status</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Férias">Férias</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <Button variant="outline" className="flex-1 py-3" onClick={onClose}>Cancelar</Button>
                <Button type="submit" variant="success" className="flex-1 py-3">{initialData ? 'Salvar Alterações' : 'Cadastrar Professor'}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Professores = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProf, setEditingProf] = useState<any>(null);
  const [professores, setProfessores] = useState([
    { id: 1, name: 'Ana Souza', subject: 'Matemática', classes: '1º A, 2º B', status: 'Ativo' },
    { id: 2, name: 'Carlos Lima', subject: 'Português', classes: '3º A, 4º B', status: 'Ativo' },
    { id: 3, name: 'Juliana Costa', subject: 'Artes', classes: 'Todas', status: 'Férias' },
  ]);

  const handleAddOrEdit = (prof: any) => {
    if (editingProf) {
      setProfessores(professores.map(p => p.id === editingProf.id ? { ...prof, id: p.id } : p));
    } else {
      setProfessores([...professores, { ...prof, id: Date.now() }]);
    }
  };

  const openNewModal = () => {
    setEditingProf(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prof: any) => {
    setEditingProf(prof);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Gestão de Professores</h2>
        <Button variant="success" className="gap-2 w-full sm:w-auto justify-center" onClick={openNewModal}>
          <UserPlus className="w-4 h-4" /> Novo Professor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {professores.map((prof, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                <GradIcon className="w-6 h-6" />
              </div>
              <span className={cn(
                'px-2 py-1 rounded-full text-[10px] font-bold uppercase',
                prof.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 
                prof.status === 'Férias' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
              )}>
                {prof.status}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{prof.name}</h3>
            <p className="text-sm text-emerald-600 font-medium">{prof.subject}</p>
            <p className="text-xs text-slate-500 mt-2">Turmas: {prof.classes}</p>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" className="flex-1 text-xs px-2">Perfil</Button>
              <Button variant="outline" className="flex-1 text-xs px-2">Horários</Button>
              <Button 
                variant="outline" 
                className="flex-1 text-xs px-2 gap-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                onClick={() => openEditModal(prof)}
              >
                <Pencil className="w-3 h-3" />
                Editar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <NovoProfessorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddOrEdit}
        initialData={editingProf}
      />
    </div>
  );
};

const Turmas = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Turmas</h2>
        <Button variant="success" className="gap-2 w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4" /> Criar Turma
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: '1º Ano A', period: 'Manhã', students: 24, teacher: 'Ana Souza' },
          { name: '2º Ano B', period: 'Tarde', students: 22, teacher: 'Carlos Lima' },
          { name: '3º Ano A', period: 'Manhã', students: 20, teacher: 'Juliana Costa' },
        ].map((turma, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400">{turma.period}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">{turma.name}</h3>
            <p className="text-sm text-slate-500 mt-1">Professor: {turma.teacher}</p>
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users2 className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-600">{turma.students} alunos</span>
              </div>
              <Button variant="ghost" className="text-blue-600 font-bold text-xs">Ver Detalhes</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const Presenca = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Registro de Presença</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <select className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-slate-200 text-sm outline-none">
            <option>1º Ano A</option>
            <option>2º Ano B</option>
          </select>
          <input type="date" className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-slate-200 text-sm outline-none" defaultValue={new Date().toISOString().split('T')[0]} />
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-600">Lista de Alunos</span>
          <div className="flex gap-4">
            <button className="text-xs font-bold text-emerald-600 hover:underline">Marcar todos presente</button>
            <button className="text-xs font-bold text-red-600 hover:underline">Limpar seleção</button>
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {[
            { name: 'João Silva', status: 'P' },
            { name: 'Maria Oliveira', status: 'P' },
            { name: 'Pedro Santos', status: 'F' },
            { name: 'Ana Clara', status: 'P' },
          ].map((aluno, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-400">{i+1}</div>
                <span className="font-medium text-slate-900">{aluno.name}</span>
              </div>
              <div className="flex gap-2">
                <button className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all',
                  aluno.status === 'P' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                )}>P</button>
                <button className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all',
                  aluno.status === 'F' ? 'bg-red-500 text-white shadow-lg shadow-red-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                )}>F</button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-slate-100 flex justify-end">
          <Button variant="success">Salvar Chamada</Button>
        </div>
      </Card>
    </div>
  );
};

// --- Administrativo Components ---

const Financeiro = () => {
  const data = [
    { name: 'Jan', receita: 45000, despesa: 32000 },
    { name: 'Fev', receita: 52000, despesa: 34000 },
    { name: 'Mar', receita: 48000, despesa: 31000 },
    { name: 'Abr', receita: 61000, despesa: 38000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Financeiro</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none bg-white gap-2 justify-center"><Download className="w-4 h-4" /> Exportar</Button>
          <Button variant="success" className="flex-1 sm:flex-none gap-2 justify-center"><Plus className="w-4 h-4" /> Novo Lançamento</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-6 border-l-4 border-emerald-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Receita Total</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">R$ 206.000</h3>
          <div className="flex items-center gap-1 text-emerald-600 text-xs mt-2 font-bold">
            <ArrowUpRight className="w-3 h-3" /> +12% vs mês ant.
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-red-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Despesa Total</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">R$ 135.000</h3>
          <div className="flex items-center gap-1 text-red-600 text-xs mt-2 font-bold">
            <ArrowDownRight className="w-3 h-3" /> +5% vs mês ant.
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-blue-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saldo em Caixa</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">R$ 71.000</h3>
          <div className="flex items-center gap-1 text-blue-600 text-xs mt-2 font-bold">
            <Wallet className="w-3 h-3" /> Saudável
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-amber-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inadimplência</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">4.2%</h3>
          <div className="flex items-center gap-1 text-emerald-600 text-xs mt-2 font-bold">
            <ArrowDownRight className="w-3 h-3" /> -1.5% vs mês ant.
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Fluxo de Caixa">
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="receita" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                <Area type="monotone" dataKey="despesa" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Últimas Transações">
          <div className="space-y-4 mt-4">
            {[
              { label: 'Mensalidade João', val: '+ R$ 850', type: 'in' },
              { label: 'Energia Elétrica', val: '- R$ 1.200', type: 'out' },
              { label: 'Mensalidade Maria', val: '+ R$ 850', type: 'in' },
              { label: 'Material Limpeza', val: '- R$ 450', type: 'out' },
              { label: 'Internet Fibra', val: '- R$ 290', type: 'out' },
            ].map((t, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    t.type === 'in' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                  )}>
                    {t.type === 'in' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{t.label}</span>
                </div>
                <span className={cn('text-sm font-bold', t.type === 'in' ? 'text-emerald-600' : 'text-red-600')}>{t.val}</span>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-4 text-xs">Ver Extrato Completo</Button>
        </Card>
      </div>
    </div>
  );
};

const Direcao = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Direção Administrativa</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Metas Institucionais" className="p-6">
          <div className="space-y-4 mt-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Matrículas 2026</span>
                <span className="font-bold text-emerald-600">92%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[92%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Retenção de Alunos</span>
                <span className="font-bold text-blue-600">85%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[85%]" />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Pendências da Direção" className="p-6">
          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span className="text-sm text-amber-900 font-medium">Assinar Contratos Novos</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <CalendarCheck className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-900 font-medium">Reunião Conselho Escolar</span>
            </div>
          </div>
        </Card>

        <Card title="Visão Estratégica" className="p-6">
          <div className="flex flex-col items-center justify-center h-full py-4">
            <PieIcon className="w-12 h-12 text-slate-200 mb-2" />
            <p className="text-sm text-slate-500 text-center">Relatórios consolidados de crescimento anual disponíveis.</p>
            <Button variant="outline" className="mt-4 text-xs">Abrir BI</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

const AdministrativoMod = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Configurações Administrativas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Configurações da Unidade">
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Nome da Instituição</label>
              <input type="text" defaultValue="Colégio EduTecPro Unidade 1" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">CNPJ</label>
              <input type="text" defaultValue="00.000.000/0001-00" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <Button variant="success">Salvar Alterações</Button>
          </div>
        </Card>

        <Card title="Gestão de Acessos">
          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-500">Gerencie quem pode acessar cada módulo do sistema.</p>
            <div className="space-y-2">
              {['Administradores', 'Coordenadores', 'Secretaria'].map(role => (
                <div key={role} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-medium text-slate-700">{role}</span>
                  <Button variant="ghost" className="text-xs">Configurar</Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Portal dos Pais ---

const PortalPais = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Portal dos Pais</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none bg-white gap-2 justify-center"><Bell className="w-4 h-4" /> Notificações</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-4 sm:p-6">
          <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase mb-4">Próximo Evento</h3>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex flex-col items-center justify-center text-blue-600 shrink-0">
              <span className="text-[10px] font-bold leading-none">MAR</span>
              <span className="text-lg font-extrabold leading-none">15</span>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">Reunião de Pais</h4>
              <p className="text-[10px] sm:text-xs text-slate-500">Auditório Principal - 19:00</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase mb-4">Última Nota</h3>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">Matemática</h4>
              <p className="text-[10px] sm:text-xs text-slate-500">Avaliação Mensal</p>
            </div>
            <span className="text-xl sm:text-2xl font-black text-emerald-600">9.5</span>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase mb-4">Financeiro</h3>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">Mensalidade Março</h4>
              <p className="text-[10px] sm:text-xs text-slate-500">Vencimento: 10/03</p>
            </div>
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase">Pago</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Comunicados Recentes">
          <div className="space-y-4 mt-4">
            {[
              { title: 'Cardápio da Semana', date: 'Hoje', icon: <FileText className="w-4 h-4" /> },
              { title: 'Fotos do Evento de Carnaval', date: 'Ontem', icon: <Users2 className="w-4 h-4" /> },
              { title: 'Informativo: Vacinação', date: '02/03', icon: <AlertCircle className="w-4 h-4" /> },
            ].map((c, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 border border-slate-200">{c.icon}</div>
                  <span className="text-sm font-medium text-slate-700">{c.title}</span>
                </div>
                <span className="text-xs text-slate-400">{c.date}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Frequência do Aluno">
          <div className="h-64 w-full mt-4 flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path className="stroke-slate-100" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="stroke-emerald-500" strokeWidth="3" strokeDasharray="96, 100" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900 leading-none">96%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Presença</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const Secretaria = () => {
  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', name: 'Boletim 1º Trimestre', type: 'PDF', studentName: 'João Silva', status: 'Concluído', date: '2026-03-01', url: '#' },
    { id: '2', name: 'Declaração de Matrícula', type: 'DOCX', studentName: 'Maria Oliveira', status: 'Pendente', date: '2026-03-05', url: '#' },
  ]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [exportData, setExportData] = useState({ type: '', format: 'PDF' });
  const [importData, setImportData] = useState({ type: '', student: '', file: null as File | null });

  const handleExport = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate export
    const newDoc: Document = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Exportação: ${exportData.type}`,
      type: exportData.format as any,
      studentName: 'Sistema',
      status: 'Concluído',
      date: new Date().toISOString(),
      url: '#'
    };
    setDocuments([newDoc, ...documents]);
    setIsExportModalOpen(false);
    alert(`Documento ${exportData.type} exportado com sucesso em ${exportData.format}!`);
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importData.file) return;

    const newDoc: Document = {
      id: Math.random().toString(36).substr(2, 9),
      name: importData.file.name,
      type: importData.file.name.split('.').pop()?.toUpperCase() as any || 'PDF',
      studentName: importData.student,
      status: 'Em Processamento',
      date: new Date().toISOString(),
      url: '#'
    };
    setDocuments([newDoc, ...documents]);
    setIsImportModalOpen(false);
    setImportData({ type: '', student: '', file: null });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Secretaria</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" className="bg-white gap-2 justify-center" onClick={() => setIsExportModalOpen(true)}>
            <Download className="w-4 h-4" /> Exportar Documento
          </Button>
          <Button variant="success" className="gap-2 justify-center" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="w-4 h-4" /> Importar Documento
          </Button>
        </div>
      </div>

      <Card title="Histórico de Documentos" subtitle="Gerencie as exportações e importações da secretaria">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 font-medium text-slate-500">Documento</th>
                <th className="pb-4 font-medium text-slate-500">Aluno</th>
                <th className="pb-4 font-medium text-slate-500">Tipo</th>
                <th className="pb-4 font-medium text-slate-500">Data</th>
                <th className="pb-4 font-medium text-slate-500">Status</th>
                <th className="pb-4 font-medium text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {documents.map((doc) => (
                <tr key={doc.id} className="group hover:bg-slate-50/50">
                  <td className="py-4 font-medium text-slate-900">{doc.name}</td>
                  <td className="py-4 text-slate-600">{doc.studentName || '-'}</td>
                  <td className="py-4">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">{doc.type}</span>
                  </td>
                  <td className="py-4 text-slate-500">{format(new Date(doc.date), 'dd/MM/yyyy')}</td>
                  <td className="py-4">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      doc.status === 'Concluído' ? 'bg-emerald-100 text-emerald-700' : 
                      doc.status === 'Em Processamento' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    )}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <Button variant="ghost" className="p-2 h-auto">
                      <Download className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Export Modal */}
      <AnimatePresence>
        {isExportModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-600 text-white">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Download className="w-5 h-5" /> Exportar Documento
                </h3>
                <button onClick={() => setIsExportModalOpen(false)}><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleExport} className="p-8 space-y-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Tipo de Documento</label>
                  <select 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={exportData.type}
                    onChange={e => setExportData({...exportData, type: e.target.value})}
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="Histórico Escolar">Histórico Escolar</option>
                    <option value="Relatório Individual">Relatório Individual</option>
                    <option value="Parecer PCD">Parecer PCD</option>
                    <option value="Declaração de Matrícula">Declaração de Matrícula</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Formato</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['PDF', 'DOCX', 'XLSX'].map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setExportData({...exportData, format: f})}
                        className={cn(
                          'py-2 rounded-lg border text-sm font-bold transition-all',
                          exportData.format === f ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" variant="success">Gerar e Baixar</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-600 text-white">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Upload className="w-5 h-5" /> Importar Documento
                </h3>
                <button onClick={() => setIsImportModalOpen(false)}><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleImport} className="p-8 space-y-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Tipo de Documento</label>
                  <select 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={importData.type}
                    onChange={e => setImportData({...importData, type: e.target.value})}
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="Histórico Escolar">Histórico Escolar</option>
                    <option value="RG/CPF Aluno">RG/CPF Aluno</option>
                    <option value="Comprovante de Residência">Comprovante de Residência</option>
                    <option value="Laudo Médico">Laudo Médico</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Aluno</label>
                  <input 
                    type="text" 
                    placeholder="Nome do aluno"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={importData.student}
                    onChange={e => setImportData({...importData, student: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Arquivo</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-emerald-500 transition-colors cursor-pointer relative">
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={e => setImportData({...importData, file: e.target.files?.[0] || null})}
                      required
                    />
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">
                      {importData.file ? importData.file.name : 'Clique ou arraste para enviar'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">PDF, JPG ou PNG até 10MB</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" variant="success">Fazer Upload</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AnnualCalendarModal = ({ isOpen, onClose, events }: { isOpen: boolean; onClose: () => void; events: SchoolEvent[] }) => {
  const year = 2026;
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

  const getDayEvents = (day: Date) => {
    return events.filter(e => isSameDay(new Date(e.date), day));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-600 text-white">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <h3 className="text-lg font-bold">Calendário de Feriados e Eventos {year}</h3>
              </div>
              <button onClick={onClose}><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-8 overflow-y-auto">
              <div className="flex gap-6 mb-8 text-sm font-medium justify-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full" /> 
                  <span className="text-slate-700">Feriado Nacional</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-full" /> 
                  <span className="text-slate-700">Feriado Regional</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full" /> 
                  <span className="text-slate-700">Evento Escolar</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {months.map((month, monthIdx) => {
                  const monthStart = startOfMonth(month);
                  const monthEnd = endOfMonth(month);
                  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
                  
                  return (
                    <div key={monthIdx} className="space-y-3">
                      <h4 className="font-bold text-slate-900 capitalize border-b border-slate-100 pb-2">
                        {format(month, 'MMMM', { locale: ptBR })}
                      </h4>
                      <div className="grid grid-cols-7 gap-1">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                          <div key={d} className="text-[10px] font-bold text-slate-400 text-center">{d}</div>
                        ))}
                        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                          <div key={`empty-${i}`} className="h-6" />
                        ))}
                        {days.map(day => {
                          const dayEvents = getDayEvents(day);
                          const hasNational = dayEvents.some(e => e.type === 'HOLIDAY_NATIONAL');
                          const hasRegional = dayEvents.some(e => e.type === 'HOLIDAY_REGIONAL');
                          const hasSchool = dayEvents.some(e => e.type === 'SCHOOL_EVENT');

                          return (
                            <div 
                              key={day.toString()} 
                              className={cn(
                                "h-7 w-7 flex items-center justify-center text-[10px] font-medium rounded-full relative group cursor-help",
                                hasNational ? "bg-red-500 text-white" :
                                hasRegional ? "bg-orange-500 text-white" :
                                hasSchool ? "bg-blue-500 text-white" :
                                "text-slate-600 hover:bg-slate-100"
                              )}
                            >
                              {format(day, 'd')}
                              {dayEvents.length > 0 && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                                  {dayEvents.map(e => (
                                    <div key={e.id} className="flex items-center gap-1">
                                      <div className={cn(
                                        "w-1.5 h-1.5 rounded-full",
                                        e.type === 'HOLIDAY_NATIONAL' ? "bg-red-400" :
                                        e.type === 'HOLIDAY_REGIONAL' ? "bg-orange-400" : "bg-blue-400"
                                      )} />
                                      {e.title}
                                    </div>
                                  ))}
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <Button variant="success" onClick={onClose}>Fechar Calendário</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const AgendaDigital = ({ role }: { role: UserRole }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAnnualCalendarOpen, setIsAnnualCalendarOpen] = useState(false);
  const [events, setEvents] = useState<SchoolEvent[]>([
    ...MOCK_HOLIDAYS as SchoolEvent[],
    { id: '101', title: 'Feira de Ciências', date: '2026-03-15', type: 'SCHOOL_EVENT' },
    { id: '102', title: 'Reunião de Pais', date: '2026-03-20', type: 'SCHOOL_EVENT' },
  ]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDayEvents = (day: Date) => {
    return events.filter(e => isSameDay(new Date(e.date), day));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Agenda Digital</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="success" className="bg-emerald-600 text-white gap-2 justify-center" onClick={() => setIsAnnualCalendarOpen(true)}>
            <Calendar className="w-4 h-4" /> Calendário de Feriados
          </Button>
          {(role === 'DIRETOR' || role === 'PROFESSOR') && (
            <Button variant="success" className="gap-2 justify-center">
              <Plus className="w-4 h-4" /> Novo Evento
            </Button>
          )}
        </div>
      </div>

      <AnnualCalendarModal 
        isOpen={isAnnualCalendarOpen} 
        onClose={() => setIsAnnualCalendarOpen(false)} 
        events={events}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title={format(currentDate, 'MMMM yyyy', { locale: ptBR })}>
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex gap-2">
              <Button variant="ghost" className="p-2" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="ghost" className="p-2" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 text-[10px] sm:text-xs font-medium justify-center">
              <div className="flex items-center gap-1"><div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full" /> Nacional</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full" /> Regional</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full" /> Escolar</div>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-[600px] sm:min-w-0 grid grid-cols-7 gap-px bg-slate-100 rounded-lg overflow-hidden border border-slate-100">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div key={d} className="bg-slate-50 p-2 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase">{d}</div>
              ))}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-white p-2 sm:p-4 h-16 sm:h-24" />
              ))}
              {days.map(day => {
                const dayEvents = getDayEvents(day);
                return (
                  <div key={day.toString()} className={cn(
                    'bg-white p-1 sm:p-2 h-16 sm:h-24 border-t border-slate-50 transition-colors hover:bg-slate-50/50 cursor-pointer',
                    isToday(day) && 'bg-emerald-50/30'
                  )}>
                    <span className={cn(
                      'text-xs sm:text-sm font-medium',
                      isToday(day) ? 'text-emerald-600 bg-emerald-100 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full' : 'text-slate-700'
                    )}>
                      {format(day, 'd')}
                    </span>
                    <div className="mt-1 space-y-0.5 sm:space-y-1">
                      {dayEvents.map(e => (
                        <div 
                          key={e.id} 
                          className={cn(
                            'text-[8px] sm:text-[10px] p-0.5 sm:p-1 rounded truncate text-white font-medium',
                            e.type === 'HOLIDAY_NATIONAL' ? 'bg-red-500' : 
                            e.type === 'HOLIDAY_REGIONAL' ? 'bg-orange-500' : 'bg-blue-500'
                          )}
                        >
                          {e.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Próximos Eventos">
            <div className="space-y-4">
              {events.filter(e => new Date(e.date) >= new Date()).slice(0, 5).map(e => (
                <div key={e.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white shrink-0',
                    e.type === 'HOLIDAY_NATIONAL' ? 'bg-red-500' : 
                    e.type === 'HOLIDAY_REGIONAL' ? 'bg-orange-500' : 'bg-blue-500'
                  )}>
                    <span className="text-xs font-bold leading-none">{format(new Date(e.date), 'dd')}</span>
                    <span className="text-[8px] uppercase">{format(new Date(e.date), 'MMM', { locale: ptBR })}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 leading-tight">{e.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{e.type === 'SCHOOL_EVENT' ? 'Evento Escolar' : 'Feriado'}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {role === 'DIRETOR' && (
            <Card title="Ações Rápidas">
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" className="justify-start text-sm">
                  <Megaphone className="w-4 h-4 text-emerald-600" /> Enviar Comunicado Geral
                </Button>
                <Button variant="outline" className="justify-start text-sm">
                  <UserIcon className="w-4 h-4 text-blue-600" /> Enviar Comunicado Aluno
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const Comunicados = ({ role }: { role: UserRole }) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'individual'>('geral');
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    student: '',
    whatsapp: '',
  });

  const handleSend = (viaWhatsapp: boolean) => {
    if (viaWhatsapp) {
      const agendaLink = activeTab === 'individual' && formData.student 
        ? `https://edutecpro.com/agenda/aluno/${formData.student}`
        : 'https://edutecpro.com/agenda/escola';
        
      const text = encodeURIComponent(`${formData.title}\n\n${formData.message}\n\nConfira na Agenda Digital: ${agendaLink}`);
      const numbers = activeTab === 'geral' ? formData.whatsapp.split(',') : [formData.whatsapp];
      
      numbers.forEach(num => {
        const cleanNum = num.trim().replace(/\D/g, '');
        if (cleanNum) {
          window.open(`https://wa.me/${cleanNum}?text=${text}`, '_blank');
        }
      });
    } else {
      alert('Comunicado registrado no sistema com sucesso!');
    }
    setShowPreview(false);
  };

  if (role !== 'DIRETOR') {
    return (
      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Comunicados</h2>
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl sm:rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                  <Megaphone className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">Início das Aulas - 2º Trimestre</h3>
                    <span className="text-[10px] sm:text-xs text-slate-400">Há 2 horas</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                    Informamos que as aulas do segundo trimestre iniciarão no dia 15 de março. Preparem seus materiais e confiram o cronograma atualizado na agenda.
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Enviar Comunicado</h2>
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('geral')}
            className={cn('flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all', activeTab === 'geral' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500')}
          >
            Geral
          </button>
          <button 
            onClick={() => setActiveTab('individual')}
            className={cn('flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all', activeTab === 'individual' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500')}
          >
            Individual
          </button>
        </div>
      </div>

      <Card>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowPreview(true); }}>
          {activeTab === 'individual' && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Selecionar Aluno</label>
              <select 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.student}
                onChange={e => setFormData({...formData, student: e.target.value})}
                required
              >
                <option value="">Selecione um aluno...</option>
                <option value="1">João Silva</option>
                <option value="2">Maria Oliveira</option>
              </select>
            </div>
          )}

          {activeTab === 'geral' && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Números WhatsApp (Opcional, separados por vírgula)</label>
              <input 
                type="text" 
                placeholder="Ex: 5511999999999, 5511888888888"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.whatsapp}
                onChange={e => setFormData({...formData, whatsapp: e.target.value})}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Título</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Data</label>
              <input 
                type="date" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Mensagem</label>
            <textarea 
              rows={5}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
              required
            />
          </div>

          {activeTab === 'individual' && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Número do WhatsApp (Opcional, manual)</label>
              <input 
                type="text" 
                placeholder="Ex: +55 21 99999-9999"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.whatsapp}
                onChange={e => setFormData({...formData, whatsapp: e.target.value})}
              />
              <p className="text-[10px] text-slate-400">Se não informado, o sistema tentará usar o número cadastrado do responsável.</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button">Cancelar</Button>
            <Button type="submit" variant="success">Visualizar e Enviar</Button>
          </div>
        </form>
      </Card>

      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-600 text-white">
                <h3 className="text-lg font-bold">Pré-visualização do Comunicado</h3>
                <button onClick={() => setShowPreview(false)}><X className="w-6 h-6" /></button>
              </div>
              <div className="p-8 space-y-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-900 text-xl mb-2">{formData.title}</h4>
                  <p className="text-sm text-slate-500 mb-4">{format(new Date(formData.date), 'dd/MM/yyyy')}</p>
                  <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">{formData.message}</div>
                  <div className="mt-6 pt-4 border-t border-slate-200 text-emerald-600 font-medium text-sm">
                    Confira na Agenda Digital: {activeTab === 'individual' && formData.student ? `https://edutecpro.com/agenda/aluno/${formData.student}` : 'https://edutecpro.com/agenda/escola'}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <Button variant="success" onClick={() => handleSend(false)} className="w-full py-3">
                    <Megaphone className="w-5 h-5" /> Enviar Comunicado
                  </Button>
                  <Button variant="whatsapp" onClick={() => handleSend(true)} className="w-full py-3">
                    <MessageCircle className="w-5 h-5" /> Enviar via WhatsApp
                  </Button>
                </div>
              </div>
            </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
};

// --- Super Admin Components ---

const GestaoUsuarios = () => {
  const [activeSubTab, setActiveSubTab] = useState<'usuarios' | 'unidades'>('usuarios');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = getSupabase();
      if (!supabase) return;

      // Buscar usuários e unidades simultaneamente de forma segura
      const [profilesResponse, schoolsResponse] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('schools').select('*').order('created_at', { ascending: false })
      ]);

      const profilesData = profilesResponse.data || [];
      const schoolsData = schoolsResponse.data || [];

      if (profilesResponse.error) console.error('Erro ao buscar perfis:', profilesResponse.error);
      if (schoolsResponse.error) console.error('Erro ao buscar escolas:', schoolsResponse.error);

      setUsers(profilesData.map(u => {
        const school = schoolsData.find(s => s.id === u.school_id);
        return {
          id: u.id,
          name: u.name || 'Usuário Sem Nome',
          email: u.email || '',
          role: u.role || 'ALUNO',
          unit: school ? school.name : 'Sem Unidade',
          status: 'Ativo'
        };
      }));

      setUnits(schoolsData.map(s => ({
        id: s.id,
        name: s.name,
        city: s.city || 'Não informada',
        users: profilesData.filter(p => p.school_id === s.id).length || 0,
        status: s.status || 'Ativo'
      })));
    };

    fetchData();
  }, [showUserModal, showUnitModal]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestão Master</h2>
          <p className="text-slate-500 text-sm">Gerencie usuários, unidades e acessos globais.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveSubTab('usuarios')}
            className={cn('px-4 py-2 rounded-lg text-sm font-bold transition-all', activeSubTab === 'usuarios' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-500')}
          >
            Usuários
          </button>
          <button 
            onClick={() => setActiveSubTab('unidades')}
            className={cn('px-4 py-2 rounded-lg text-sm font-bold transition-all', activeSubTab === 'unidades' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-500')}
          >
            Unidades
          </button>
        </div>
      </div>

      {activeSubTab === 'usuarios' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-l-4 border-purple-500">
              <p className="text-xs font-bold text-slate-400 uppercase">Total Usuários</p>
              <h3 className="text-3xl font-black text-slate-900">{users.length}</h3>
            </Card>
            <Card className="p-6 border-l-4 border-emerald-500">
              <p className="text-xs font-bold text-slate-400 uppercase">Ativos Agora</p>
              <h3 className="text-3xl font-black text-emerald-600">12</h3>
            </Card>
            <Button 
              variant="success" 
              className="h-full py-6 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white flex-col gap-2 shadow-lg shadow-purple-100"
              onClick={() => setShowUserModal(true)}
            >
              <UserPlus className="w-6 h-6" />
              <span className="font-bold">Cadastrar Novo Usuário</span>
            </Button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="p-4 font-bold text-slate-500 uppercase text-[10px]">Usuário</th>
                    <th className="p-4 font-bold text-slate-500 uppercase text-[10px]">Unidade</th>
                    <th className="p-4 font-bold text-slate-500 uppercase text-[10px]">Papel</th>
                    <th className="p-4 font-bold text-slate-500 uppercase text-[10px]">Status</th>
                    <th className="p-4 font-bold text-slate-500 uppercase text-[10px] text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">{u.name.charAt(0)}</div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{u.name}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Building2 className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{u.unit}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={cn('px-2 py-1 rounded-full text-[10px] font-bold uppercase', ROLE_CONFIG[u.role as UserRole].color.replace('bg-', 'text-').replace('600', '700') + ' bg-slate-100')}>
                          {ROLE_CONFIG[u.role as UserRole].label}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" onClick={() => setEditingUser(u)} className="p-2 h-auto text-slate-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" className="p-2 h-auto text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-l-4 border-blue-500">
              <p className="text-xs font-bold text-slate-400 uppercase">Unidades Ativas</p>
              <h3 className="text-3xl font-black text-slate-900">{units.length}</h3>
            </Card>
            <Card className="p-6 border-l-4 border-amber-500">
              <p className="text-xs font-bold text-slate-400 uppercase">Cidades Atendidas</p>
              <h3 className="text-3xl font-black text-amber-600">2</h3>
            </Card>
            <Button 
              variant="success" 
              className="h-full py-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex-col gap-2 shadow-lg shadow-blue-100"
              onClick={() => setShowUnitModal(true)}
            >
              <Plus className="w-6 h-6" />
              <span className="font-bold">Cadastrar Nova Unidade</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {units.map(unit => (
              <Card key={unit.id} className="p-6 hover:shadow-lg transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase">{unit.status}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{unit.name}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                  <Icon name="Home" className="w-3.5 h-3.5" /> {unit.city}
                </p>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">{unit.users} usuários</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-blue-600 text-white">
                <h3 className="text-lg font-bold flex items-center gap-2"><UserCog className="w-5 h-5" /> Editar Usuário</h3>
                <button onClick={() => setEditingUser(null)}><X className="w-6 h-6" /></button>
              </div>
              <form className="p-8 space-y-4" onSubmit={async (e) => { 
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const supabase = getSupabase();
                if (!supabase) return;

                const name = formData.get('name') as string;
                const email = formData.get('email') as string;

                const { error } = await supabase.from('profiles').update({ name, email }).eq('id', editingUser.id);
                
                if (error) {
                  alert('Erro ao atualizar usuário: ' + error.message);
                } else {
                  alert('Usuário atualizado com sucesso!');
                  setUsers(users.map(u => u.id === editingUser.id ? { ...u, name, email } : u));
                  setEditingUser(null);
                }
              }}>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Nome Completo</label>
                  <input type="text" name="name" defaultValue={editingUser.name} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">E-mail</label>
                  <input type="email" name="email" defaultValue={editingUser.email} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Papel / Nível de Acesso</label>
                  <input type="text" value={ROLE_CONFIG[editingUser.role as UserRole]?.label || editingUser.role} disabled className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-bold outline-none" />
                </div>
                <Button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold mt-4 rounded-xl">Salvar Alterações</Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Creation Modal */}
      <AnimatePresence>
        {showUserModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-purple-600 text-white">
                <h3 className="text-lg font-bold flex items-center gap-2"><UserPlus className="w-5 h-5" /> Cadastrar Usuário</h3>
                <button onClick={() => setShowUserModal(false)}><X className="w-6 h-6" /></button>
              </div>
              <form className="p-8 space-y-4" onSubmit={async (e) => { 
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const formData = new FormData(form);
                const supabase = getSupabase();

                if (!supabase) {
                  alert('⚠️ Conexão com o banco de dados não disponível.\nVerifique as configurações do Supabase.');
                  return;
                }

                const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
                if (submitBtn) {
                  submitBtn.disabled = true;
                  submitBtn.textContent = '⏳ Processando...';
                }

                try {
                  const { data, error } = await supabase.rpc('create_new_school', {
                    p_gestor_email: formData.get('email') as string,
                    p_gestor_name: formData.get('name') as string,
                    p_gestor_whatsapp: (formData.get('whatsapp') as string) || '',
                    p_password: (formData.get('password') as string) || 'EduTec@2026',
                    p_school_name: formData.get('schoolName') as string,
                  });

                  if (error) {
                    // Erro retornado pela API do Supabase
                    alert(`❌ Erro ao cadastrar a escola:\n${error.message}`);
                  } else if (data && data.success === false) {
                    // Erro retornado explicitamente pela função RPC
                    alert(`❌ Não foi possível concluir o cadastro:\n${data.error || 'Ocorreu um erro desconhecido. Tente novamente.'}`);
                  } else {
                    // Sucesso: exibe mensagem, limpa o formulário e fecha o modal
                    alert('✅ Escola e gestor cadastrados com sucesso!\nAs credenciais de acesso foram criadas.');
                    form.reset();
                    setShowUserModal(false);
                  }
                } catch (err: any) {
                  // Erro inesperado (ex.: falha de rede)
                  alert(`❌ Erro inesperado ao processar a requisição:\n${err.message || String(err)}`);
                } finally {
                  if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Criar Conta e Enviar Convite';
                  }
                }
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Nome Completo</label>
                    <input name="name" type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">E-mail</label>
                    <input name="email" type="email" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none" required />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Nome da Escola</label>
                  <input name="schoolName" type="text" placeholder="Ex: Escola Municipal Julia Cortines" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">WhatsApp</label>
                    <input name="whatsapp" type="text" placeholder="(00) 00000-0000" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Senha Temporária</label>
                    <input name="password" type="password" defaultValue="EduTec@2026" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                </div>
                <Button type="submit" className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold mt-4">Criar Conta e Enviar Convite</Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Unit Creation Modal */}
      <AnimatePresence>
        {showUnitModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-blue-600 text-white">
                <h3 className="text-lg font-bold flex items-center gap-2"><Building2 className="w-5 h-5" /> Cadastrar Unidade</h3>
                <button onClick={() => setShowUnitModal(false)}><X className="w-6 h-6" /></button>
              </div>
              <form className="p-8 space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Unidade cadastrada com sucesso!'); setShowUnitModal(false); }}>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Nome da Unidade/Escola</label>
                  <input type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Escola Municipal Julia Cortines" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Cidade</label>
                    <input type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Telefone/Contato</label>
                    <input type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Endereço Completo</label>
                  <input type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <Button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold mt-4">Salvar Unidade</Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ConfigSistema = () => {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [activeColor, setActiveColor] = useState('blue');
  const [zoomLevel, setZoomLevel] = useState('100%');

  const toggleDarkMode = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wantsDark = e.target.value === 'dark';
    if (wantsDark) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  };

  useEffect(() => {
    let styleEl = document.getElementById('theme-color-override');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'theme-color-override';
      document.head.appendChild(styleEl);
    }
    
    if (activeColor === 'blue') {
      styleEl.innerHTML = '';
      return;
    }

    styleEl.innerHTML = `
      :root {
        --color-blue-50: var(--color-${activeColor}-50);
        --color-blue-100: var(--color-${activeColor}-100);
        --color-blue-200: var(--color-${activeColor}-200);
        --color-blue-300: var(--color-${activeColor}-300);
        --color-blue-400: var(--color-${activeColor}-400);
        --color-blue-500: var(--color-${activeColor}-500);
        --color-blue-600: var(--color-${activeColor}-600);
        --color-blue-700: var(--color-${activeColor}-700);
        --color-blue-800: var(--color-${activeColor}-800);
        --color-blue-900: var(--color-${activeColor}-900);
        --color-blue-950: var(--color-${activeColor}-950);
      }
    `;
  }, [activeColor]);

  useEffect(() => {
    document.documentElement.style.fontSize = zoomLevel;
  }, [zoomLevel]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Configurações Gerais</h2>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <Card title="Meu Perfil" subtitle="Informações pessoais e de acesso">
          <div className="p-4 flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
              <UserIcon className="w-10 h-10" />
            </div>
            <div className="flex-1 space-y-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Nome Completo</label>
                  <input type="text" defaultValue="Raquel Duarte" className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">E-mail de Acesso</label>
                  <input type="email" defaultValue="raquelduarteadmi@gmail.com" className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">WhatsApp Pessoal</label>
                  <input type="text" placeholder="(21) 99999-9999" className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Nova Senha</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6">Atualizar Meus Dados</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Geral" subtitle="Ajustes globais da plataforma">
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-700">Manutenção do Sistema</p>
                <p className="text-xs text-slate-500">Ativa o modo de manutenção global</p>
              </div>
              <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-700">Novos Registros</p>
                <p className="text-xs text-slate-500">Permitir novos cadastros de escolas</p>
              </div>
              <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>
          </div>
        </Card>

        <Card title="IA & Assistente" subtitle="Configurações do Google Gemini">
          <div className="space-y-4 p-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">Modelo Ativo</label>
              <select className="w-full px-3 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none">
                <option>Gemini 2.0 Flash</option>
                <option>Gemini 1.5 Pro</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">Tokens por Resposta</label>
              <input type="number" defaultValue={2048} className="w-full px-3 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Segurança & Acessos" subtitle="Políticas de autenticação">
          <div className="p-4 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-700">Autenticação em Duas Etapas (2FA)</p>
                <p className="text-xs text-slate-500">Exigir código por e-mail para logins</p>
              </div>
              <div 
                className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer transition-colors" 
                onClick={(e) => { 
                  e.currentTarget.classList.toggle('bg-blue-600'); 
                  e.currentTarget.classList.toggle('bg-slate-200'); 
                  e.currentTarget.children[0].classList.toggle('translate-x-6'); 
                }}
              >
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform" />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">Expiração de Sessão Inativa</label>
              <select className="w-full px-3 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none">
                <option>30 minutos</option>
                <option>1 hora</option>
                <option>4 horas</option>
                <option>Desativado (Não expirar)</option>
              </select>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <Button onClick={() => alert('Em breve: Este módulo permitirá gerenciar as chaves do Mercado Pago e da API do WhatsApp Oficial.')} variant="outline" className="w-full justify-between group">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-slate-700">Chaves de Integração (API)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button onClick={() => alert('Em breve: Você poderá definir se as senhas devem conter números, símbolos e letras maiúsculas.')} variant="outline" className="w-full justify-between group">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-slate-600" />
                  <span className="font-bold text-slate-700">Força e Políticas de Senha</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Aparência & Tema" subtitle="Cores corporativas e acessibilidade">
          <div className="space-y-4 p-4">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase">Cor Primária (Interface)</label>
              <div className="flex gap-3">
                <button onClick={() => setActiveColor('blue')} className={cn("w-8 h-8 rounded-full bg-blue-600 shadow-md transition-all", activeColor === 'blue' ? "ring-2 ring-blue-600 ring-offset-2 scale-110" : "hover:scale-110")}></button>
                <button onClick={() => setActiveColor('slate')} className={cn("w-8 h-8 rounded-full bg-slate-900 shadow-md transition-all", activeColor === 'slate' ? "ring-2 ring-slate-900 ring-offset-2 scale-110" : "hover:scale-110")}></button>
                <button onClick={() => setActiveColor('emerald')} className={cn("w-8 h-8 rounded-full bg-emerald-600 shadow-md transition-all", activeColor === 'emerald' ? "ring-2 ring-emerald-600 ring-offset-2 scale-110" : "hover:scale-110")}></button>
                <button onClick={() => setActiveColor('indigo')} className={cn("w-8 h-8 rounded-full bg-indigo-600 shadow-md transition-all", activeColor === 'indigo' ? "ring-2 ring-indigo-600 ring-offset-2 scale-110" : "hover:scale-110")}></button>
                <button onClick={() => setActiveColor('rose')} className={cn("w-8 h-8 rounded-full bg-rose-600 shadow-md transition-all", activeColor === 'rose' ? "ring-2 ring-rose-600 ring-offset-2 scale-110" : "hover:scale-110")}></button>
              </div>
            </div>
            <div className="space-y-1 mt-4">
              <label className="text-xs font-bold text-slate-400 uppercase">Modo de Exibição</label>
              <select value={isDark ? 'dark' : 'light'} onChange={toggleDarkMode} className="w-full px-3 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none">
                <option value="light">Claro Corporativo (Padrão)</option>
                <option value="dark">Modo Escuro (Conforto Visual)</option>
              </select>
            </div>
            <div className="space-y-1 mt-4 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-400 uppercase">Tamanho da Fonte (Zoom)</label>
              <select value={zoomLevel} onChange={(e) => setZoomLevel(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none">
                <option value="90%">Compacto (90%)</option>
                <option value="100%">Padrão (100%)</option>
                <option value="110%">Ampliado (110%)</option>
                <option value="120%">Extra Grande (120%)</option>
              </select>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const EstatisticasGerais = () => {
  const data = [
    { name: 'Seg', acessos: 400 },
    { name: 'Ter', acessos: 600 },
    { name: 'Qua', acessos: 800 },
    { name: 'Qui', acessos: 750 },
    { name: 'Sex', acessos: 900 },
    { name: 'Sáb', acessos: 300 },
    { name: 'Dom', acessos: 150 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Métricas do Sistema</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Tráfego da Semana</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorAcessos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="acessos" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorAcessos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 bg-slate-900 text-white border-none shadow-xl shadow-slate-200">
            <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">Uso de Armazenamento</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-2xl font-black">2.4 GB</span>
                <span className="text-xs text-slate-500">de 10 GB</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: '24%' }} />
              </div>
              <p className="text-[10px] text-slate-500 italic">24% utilizado • Plano Pro ativo</p>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="text-sm font-bold text-slate-900 mb-4">Status dos Serviços</h4>
            <div className="space-y-3">
              {[
                { name: 'Banco de Dados', status: 'Online', color: 'text-emerald-500' },
                { name: 'Auth Service', status: 'Online', color: 'text-emerald-500' },
                { name: 'IA Engine', status: 'Online', color: 'text-emerald-500' },
                { name: 'Storage API', status: 'Online', color: 'text-emerald-500' },
              ].map(s => (
                <div key={s.name} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">{s.name}</span>
                  <span className={cn('text-[10px] font-bold uppercase', s.color)}>{s.status}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const UsuariosEscola = () => {
  const [activeSubTab, setActiveSubTab] = useState<'professores' | 'responsaveis'>('professores');
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestão de Usuários da Unidade</h2>
          <p className="text-slate-500 text-sm">Gerencie os professores e responsáveis vinculados a esta escola.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveSubTab('professores')}
            className={cn('px-4 py-2 rounded-lg text-sm font-bold transition-all', activeSubTab === 'professores' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500')}
          >
            Professores
          </button>
          <button 
            onClick={() => setActiveSubTab('responsaveis')}
            className={cn('px-4 py-2 rounded-lg text-sm font-bold transition-all', activeSubTab === 'responsaveis' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500')}
          >
            Responsáveis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Button 
          variant="success" 
          className="py-8 rounded-3xl bg-blue-600 hover:bg-blue-700 text-white flex-col gap-3 shadow-xl shadow-blue-100"
          onClick={() => setShowModal(true)}
        >
          <UserPlus className="w-8 h-8" />
          <div className="text-left">
            <p className="font-black text-lg">Novo {activeSubTab === 'professores' ? 'Professor' : 'Responsável'}</p>
            <p className="text-xs text-blue-100 font-medium uppercase tracking-widest">Criar credenciais de acesso</p>
          </div>
        </Button>
        <Card className="p-6 bg-slate-900 text-white border-none flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total de {activeSubTab === 'professores' ? 'Professores' : 'Responsáveis'}</p>
            <h3 className="text-4xl font-black">{activeSubTab === 'professores' ? '14' : '158'}</h3>
          </div>
          <Users className="w-12 h-12 text-slate-800" />
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="p-4 font-bold text-slate-500 uppercase text-[10px]">Nome</th>
                <th className="p-4 font-bold text-slate-500 uppercase text-[10px]">E-mail / Login</th>
                <th className="p-4 font-bold text-slate-500 uppercase text-[10px]">Status</th>
                <th className="p-4 font-bold text-slate-500 uppercase text-[10px] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[1, 2, 3].map(i => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">{i === 1 ? 'A' : 'M'}</div>
                      <p className="text-sm font-bold text-slate-900">{i === 1 ? 'Ana Silva' : 'Marcos Oliveira'}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-500">{i === 1 ? 'ana@escola.com' : 'marcos@escola.com'}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">ATIVO</span>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" className="p-2 h-auto text-slate-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" className="p-2 h-auto text-slate-400 hover:text-blue-600"><Lock className="w-4 h-4" /></Button>
                    <Button variant="ghost" className="p-2 h-auto text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-blue-600 text-white">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <UserPlus className="w-5 h-5" /> 
                  Cadastrar {activeSubTab === 'professores' ? 'Professor' : 'Responsável'}
                </h3>
                <button onClick={() => setShowModal(false)}><X className="w-6 h-6" /></button>
              </div>
              <form className="p-8 space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Credenciais criadas com sucesso!'); setShowModal(false); }}>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Nome Completo</label>
                  <input type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">E-mail de Acesso</label>
                  <input type="email" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">WhatsApp</label>
                    <input type="text" placeholder="(00) 00000-0000" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Senha Inicial</label>
                    <input type="password" defaultValue="123456" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" required />
                  </div>
                </div>
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700 font-medium">O usuário receberá uma notificação para completar o cadastro no primeiro acesso.</p>
                </div>
                <Button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold mt-4 shadow-lg shadow-blue-100">
                  Gerar Credenciais e Salvar
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DashboardGeral = ({ role }: { role: UserRole }) => {
  if (role === 'DIRETOR') {
    const schoolStats = [
      { label: 'Total Alunos', value: '450', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Professores Ativos', value: '32', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Turmas', value: '15', icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    const freqData = [
      { month: 'Jan', freq: 95 },
      { month: 'Fev', freq: 96 },
      { month: 'Mar', freq: 94 },
      { month: 'Abr', freq: 97 },
      { month: 'Mai', freq: 95 },
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2 items-center text-center">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Painel da Escola</h2>
          <p className="text-slate-500 font-medium">Visão geral do desempenho e gestão da sua escola.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {schoolStats.map((stat, i) => (
            <Card key={i} className="p-6 hover:shadow-xl transition-all cursor-pointer group border-none shadow-lg shadow-slate-100 flex flex-col items-center text-center">
              <div className={cn('p-4 rounded-full transition-colors mb-4', stat.bg)}>
                <stat.icon className={cn('w-8 h-8', stat.color)} />
              </div>
              <div>
                <h3 className="text-4xl font-black text-slate-900">{stat.value}</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-2">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-900">Média de Frequência (%)</h3>
              <select className="text-xs font-bold text-slate-500 bg-slate-50 border-none rounded-lg px-2 py-1 outline-none">
                <option>2026</option>
                <option>2025</option>
              </select>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={freqData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={[0, 100]} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="freq" fill="#10b981" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-between overflow-hidden relative bg-emerald-900 text-white border-none shadow-2xl">
            <div className="relative z-10">
              <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2"><BrainCircuit className="w-6 h-6 text-emerald-400" /> Assistente Escolar</h3>
              <p className="text-sm text-emerald-100/70 mb-8">Produtividade com inteligência artificial na sua escola.</p>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-100">Comunicados Gerados</span>
                  <span className="text-lg font-black text-white">124</span>
                </div>
                <div className="w-full h-2 bg-emerald-800 rounded-full overflow-hidden">
                  <div className="h-full bg-white" style={{ width: '75%' }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-100">Planos de Aula (IA)</span>
                  <span className="text-lg font-black text-white">312</span>
                </div>
                <div className="w-full h-2 bg-emerald-800 rounded-full overflow-hidden">
                  <div className="h-full bg-white" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
            <div className="mt-8 bg-emerald-800/50 backdrop-blur-md rounded-2xl p-4 border border-emerald-700">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Lembrete</p>
              <p className="text-sm font-black mt-1 text-white">Reunião de Pais e Mestres</p>
              <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-emerald-300">
                <Calendar className="w-3 h-3" /> Sexta-feira, 18:00
              </div>
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Últimas Atividades" subtitle="Acompanhamento em tempo real da escola">
            <div className="p-4 space-y-4">
              {[
                { text: 'Prof. Ana publicou as notas de Matemática.', time: '12 min atrás', icon: BookOpen, color: 'text-blue-600' },
                { text: 'Reunião pedagógica agendada.', time: '45 min atrás', icon: Calendar, color: 'text-purple-600' },
                { text: '15 novos alunos matriculados.', time: '2 horas atrás', icon: Users, color: 'text-emerald-600' },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                  <div className={cn('w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0', activity.color)}>
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">{activity.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Acesso Rápido" subtitle="Atalhos para gestão escolar">
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { label: 'Matrículas', icon: Users, color: 'bg-blue-50 text-blue-600' },
                { label: 'Relatórios', icon: FileBarChart, color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Agenda Escolar', icon: Calendar, color: 'bg-amber-50 text-amber-600' },
                { label: 'Configurações', icon: Settings, color: 'bg-slate-800 text-white' },
              ].map((shortcut, i) => (
                <button key={i} className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all gap-2 group">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110', shortcut.color)}>
                    <shortcut.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{shortcut.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Mock data for dashboard
  const stats = [
    { label: 'Unidades Ativas', value: '08', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Alunos', value: '1.240', icon: Users, color: 'text-slate-600', bg: 'bg-slate-50' },
    { label: 'Professores', value: '86', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const financialData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Fev', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Abr', revenue: 61000 },
    { month: 'Mai', revenue: 55000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 items-center text-center">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Painel Executivo – Raquel Duarte</h2>
        <p className="text-slate-500 font-medium">Aqui está o resumo geral corporativo do ecossistema EduTecPro.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 hover:shadow-xl transition-all cursor-pointer group border-none shadow-lg shadow-slate-100 flex flex-col items-center text-center">
            <div className={cn('p-4 rounded-full transition-colors mb-4', stat.bg)}>
              <stat.icon className={cn('w-8 h-8', stat.color)} />
            </div>
            <div>
              <h3 className="text-4xl font-black text-slate-900">{stat.value}</h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-2">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Crescimento Financeiro (Anual)</h3>
            <select className="text-xs font-bold text-slate-500 bg-slate-50 border-none rounded-lg px-2 py-1 outline-none">
              <option>2026</option>
              <option>2025</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#0f172a" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 flex flex-col justify-between overflow-hidden relative bg-slate-900 text-white border-none shadow-2xl">
          <div className="relative z-10">
            <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2"><BrainCircuit className="w-6 h-6 text-emerald-400" /> Engajamento de IA</h3>
            <p className="text-sm text-slate-400 mb-8">Uso do assistente de inteligência artificial.</p>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-300">Pareceres Gerados</span>
                <span className="text-lg font-black text-blue-400">842</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '85%' }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-300">Planejamentos (Aulas)</span>
                <span className="text-lg font-black text-emerald-400">1.2k</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: '92%' }} />
              </div>
            </div>
          </div>
          <div className="mt-8 bg-slate-800/50 backdrop-blur-md rounded-2xl p-4 border border-slate-700">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Próximo Evento Master</p>
            <p className="text-sm font-black mt-1 text-white">Conselho de Gestores Unificado</p>
            <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-emerald-400">
              <Calendar className="w-3 h-3" /> 15 de Maio, 14:00
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Últimas Atividades" subtitle="Acompanhamento em tempo real">
          <div className="p-4 space-y-4">
            {[
              { text: 'Nova Unidade "Escola Municipal Julia Cortines" cadastrada.', time: '12 min atrás', icon: Building2, color: 'text-blue-600' },
              { text: 'Pagamento da Unidade Norte confirmado.', time: '2 horas atrás', icon: DollarSign, color: 'text-emerald-600' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                <div className={cn('w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0', activity.color)}>
                  <activity.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">{activity.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Acesso Rápido" subtitle="Atalhos para os módulos principais">
          <div className="p-4 grid grid-cols-2 gap-3">
            {[
              { label: 'Financeiro', icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
              { label: 'Matrículas', icon: Users, color: 'bg-blue-50 text-blue-600' },
              { label: 'Relatórios', icon: FileBarChart, color: 'bg-slate-100 text-slate-700' },
              { label: 'Cores / Tema', icon: Settings, color: 'bg-slate-800 text-white' },
            ].map((shortcut, i) => (
              <button key={i} className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all gap-2 group">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110', shortcut.color)}>
                  <shortcut.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-600">{shortcut.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const Dashboard = ({ user, onLogout }: { user: User; onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState('dashboard-geral');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      // Principal
      case 'dashboard-geral': return <DashboardGeral role={user.role} />;

      // Pedagógico
      case 'dashboard-evolucao': return <DashboardEvolucao />;
      case 'plano-aula': return <PlanoAula />;
      case 'diario-semanal': return <DiarioSemanal />;
      case 'registro-mensal': return <RegistroMensal />;
      case 'relatorios': return <Relatorios />;
      case 'parecer-pcd': return <ParecerPCD />;

      // Gestão Escolar
      case 'alunos': return <Alunos />;
      case 'professores': return <Professores />;
      case 'turmas': return <Turmas />;
      case 'presenca': return <Presenca />;

      // Comunicação
      case 'agenda': return <AgendaDigital role={user.role} />;
      case 'comunicados': return <Comunicados role={user.role} />;
      case 'manual-sistema': return <ManualSistema onNavigate={setActiveTab} role={user.role} />;
      case 'portal-pais': return <PortalPais />;

      // Administrativo
      case 'financeiro': return <Financeiro />;
      case 'secretaria': return <Secretaria />;
      case 'direcao': return <Direcao />;
      case 'usuarios-escola': return <UsuariosEscola />;
      case 'administrativo-mod': return <AdministrativoMod />;

      // Super Admin
      case 'gestao-usuarios': return <GestaoUsuarios />;
      case 'config-sistema': return <ConfigSistema />;
      case 'estatisticas-gerais': return <EstatisticasGerais />;
      case 'logs-atividades': return <EmptyState message="Logs do sistema sendo processados..." />;

      default: return <EmptyState message="Módulo em desenvolvimento. Esta funcionalidade estará disponível em breve." />;
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 flex flex-col gap-4 sticky top-0 bg-white z-10 border-b border-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-100">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              {(isSidebarOpen || isMobileSidebarOpen) && <span className="font-bold text-xl text-slate-900 tracking-tight">EduTecPro</span>}
            </div>
            {isMobileSidebarOpen && (
              <button onClick={() => setIsMobileSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
          
          {(isSidebarOpen || isMobileSidebarOpen) && (
            <div className="px-1 py-2 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0', ROLE_CONFIG[user.role].color)}>
                <Icon name={ROLE_CONFIG[user.role].icon} className="w-4 h-4" />
              </div>
              <div className="overflow-hidden text-left">
                <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{ROLE_CONFIG[user.role].label}</p>
              </div>
            </div>
          )}
        </div>

        <nav className="mt-2 px-3 space-y-6">
          {NAVIGATION_CATEGORIES.filter(cat => cat.roles.includes(user.role)).map((category) => (
            <div key={category.id} className="space-y-1">
              {(isSidebarOpen || isMobileSidebarOpen) && (
                <h4 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {category.label}
                </h4>
              )}
              {category.items.filter(item => item.roles.includes(user.role)).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group',
                    activeTab === item.id 
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-50' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon name={item.icon} className={cn('w-5 h-5 shrink-0', activeTab === item.id ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600')} />
                  {(isSidebarOpen || isMobileSidebarOpen) && <span className="font-medium text-sm">{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </div>

      <div className="p-3 border-t border-slate-100">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all group"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {(isSidebarOpen || isMobileSidebarOpen) && <span className="font-medium">Sair do Sistema</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden lg:flex bg-white border-r border-slate-200 transition-all duration-300 fixed h-full z-40 flex flex-col',
        isSidebarOpen ? 'w-64' : 'w-20'
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[60] lg:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={cn(
        'flex-1 transition-all duration-300 min-w-0',
        isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
      )}>
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsMobileSidebarOpen(true);
                } else {
                  setIsSidebarOpen(!isSidebarOpen);
                }
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
            >
              <Icon name={window.innerWidth < 1024 ? 'MoreHorizontal' : (isSidebarOpen ? 'ChevronLeft' : 'ChevronRight')} className="w-5 h-5" />
            </button>
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Pesquisar no sistema..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none w-72 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <button className="relative p-2 text-slate-400 hover:text-emerald-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{ROLE_CONFIG[user.role].label}</p>
              </div>
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg', ROLE_CONFIG[user.role].color)}>
                <UserIcon className="w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>

        <ChatWidget user={user} onNavigate={(tab) => {
          if (tab.startsWith('manual-')) {
            setActiveTab('manual-sistema');
            setTimeout(() => {
              const el = document.getElementById(tab);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 500);
          } else {
            setActiveTab(tab);
          }
        }} />
      </main>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'landing' | 'login' | 'dashboard'>('landing');
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setView('dashboard');
    console.log('Login bem-sucedido, mudando para dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
  };

  return (
    <div className="font-sans antialiased text-slate-900">
      {view === 'landing' && <LandingPage onStartLogin={() => setView('login')} />}
      {view === 'login' && <Login onLogin={handleLogin} onBackToLanding={() => setView('landing')} />}
      {view === 'dashboard' && user && <Dashboard user={user} onLogout={handleLogout} />}
    </div>
  );
}
