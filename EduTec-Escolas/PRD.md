# PRD - EduTecPro: Plano Escolas

## 1. Visão Geral
O **EduTecPro** é uma plataforma SaaS (Software as a Service) de gestão escolar integrada, projetada para automatizar processos pedagógicos, administrativos e de comunicação em instituições de ensino. O foco do "Plano Escolas" é oferecer uma solução 360º que une direção, secretaria, professores e responsáveis em um único ecossistema digital.

## 2. Objetivos Principais
- **Centralização:** Consolidar todos os dados escolares (alunos, notas, presenças, financeiro) em uma única base.
- **Eficiência Pedagógica:** Automatizar o registro de planos de aula, diários e pareceres (incluindo suporte de IA).
- **Comunicação em Tempo Real:** Facilitar o contato com os responsáveis via Agenda Digital e integração com WhatsApp.
- **Gestão de PCD:** Oferecer módulos especializados para o acompanhamento de alunos com necessidades especiais.

## 3. Personas (Perfis de Usuário)
- **Administrador/Diretor:** Visão macro da escola, gestão financeira e controle de acessos.
- **Secretaria:** Gestão documental, matrículas, exportação de boletins e relatórios legais.
- **Professor:** Planejamento de aulas, chamada, registro de avaliações e pareceres.
- **Responsável/Aluno:** Consulta de agenda, comunicados e acompanhamento de desempenho.

## 4. Funcionalidades Principais

### 4.1. Módulo Pedagógico
- **Dashboard de Evolução:** Visualização gráfica do progresso das turmas.
- **Plano de Aula (BNCC):** Criação de planos estruturados integrados à base nacional comum curricular.
- **Diário de Classe Semanal/Mensal:** Registro detalhado de atividades e conteúdos ministrados.
- **Parecer PCD:** Registro especializado para alunos com necessidades especiais.
- **Parecer Final com IA:** Uso de Inteligência Artificial (Gemini) para sugerir textos de pareceres finais baseados no histórico do aluno.

### 4.2. Gestão Escolar
- **Cadastro de Alunos e Professores:** Gestão completa de dados cadastrais e documentação.
- **Gestão de Turmas:** Alocação de alunos e definição de horários.
- **Controle de Presença:** Chamada digital com histórico automatizado.

### 4.3. Comunicação
- **Agenda Digital:** Calendário de eventos, provas e reuniões.
- **Comunicados WhatsApp:** Envio de avisos individuais ou coletivos diretamente para o celular dos responsáveis.
- **Portal do Aluno:** Espaço para consulta de notas e materiais.

### 4.4. Administrativo e Financeiro
- **Financeiro:** Controle de mensalidades, fluxo de caixa e relatórios de inadimplência.
- **Secretaria Digital:** Emissão de declarações, boletins e históricos escolares.

## 5. Stack Tecnológica
- **Frontend:** React 19 + TypeScript.
- **Estilização:** Tailwind CSS 4 (via @tailwindcss/vite).
- **Estado e Animações:** Framer Motion (motion/react) + Lucide Icons.
- **Backend/Banco de Dados:** Supabase (PostgreSQL + Auth + Storage).
- **IA:** Google Gemini AI (via GoogleGenAI SDK).
- **Gráficos:** Recharts / D3.js.

## 6. Requisitos Não Funcionais
- **Segurança:** Implementação de RLS (Row Level Security) no Supabase para isolamento de dados por escola/usuário.
- **Responsividade:** Interface adaptável para Desktop, Tablets e Smartphones.
- **Performance:** Carregamento rápido via Vite 6 e otimização de bundles.

## 7. Roadmap de Implementação
- **Fase 1 (Atual):** Estrutura core, Dashboards básicos, Autenticação e conexão Supabase.
- **Fase 2:** Finalização dos módulos de Secretaria e Financeiro.
- **Fase 3:** Refinamento da IA para pareceres e integração profunda com WhatsApp.
- **Fase 4:** Testes de carga, otimização de SEO e lançamento oficial.
