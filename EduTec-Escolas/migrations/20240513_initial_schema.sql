-- ESQUEMA DE BANCO DE DADOS - EDUTECPRO

-- 1. TABELA DE PERFIS (Extensão de auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN_GERAL', 'DIRETOR', 'PROFESSOR', 'RESPONSAVEL', 'ALUNO')),
    whatsapp TEXT,
    school_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE UNIDADES (Schools)
CREATE TABLE public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    phone TEXT,
    status TEXT DEFAULT 'Ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar foreign key após criação da tabela
ALTER TABLE public.profiles ADD CONSTRAINT fk_profiles_school FOREIGN KEY (school_id) REFERENCES public.schools(id);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Profiles
CREATE POLICY "Perfis visíveis por todos os usuários autenticados" 
ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem atualizar seus próprios perfis" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. TABELA DE TURMAS (Classes)
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    period TEXT CHECK (period IN ('MANHÃ', 'TARDE', 'NOITE', 'INTEGRAL')),
    teacher_id UUID REFERENCES public.profiles(id),
    school_id UUID REFERENCES public.schools(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Turmas visíveis por usuários autenticados" 
ON public.classes FOR SELECT USING (auth.role() = 'authenticated');

-- 3. TABELA DE ALUNOS
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    responsible_id UUID REFERENCES public.profiles(id),
    pcd_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alunos visíveis por usuários autenticados" 
ON public.students FOR SELECT USING (auth.role() = 'authenticated');

-- 4. TABELA DE EVENTOS (Agenda Digital)
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT CHECK (type IN ('HOLIDAY_NATIONAL', 'HOLIDAY_REGIONAL', 'SCHOOL_EVENT', 'ANNOUNCEMENT')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Eventos visíveis por todos" 
ON public.events FOR SELECT USING (TRUE);

-- 5. TABELA DE COMUNICADOS
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    author_id UUID REFERENCES public.profiles(id),
    target_type TEXT CHECK (target_type IN ('ALL', 'INDIVIDUAL')),
    student_id UUID REFERENCES public.students(id),
    sent_via_whatsapp BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comunicados visíveis por usuários autenticados" 
ON public.announcements FOR SELECT USING (auth.role() = 'authenticated');

-- 6. TABELA DE PLANOS DE AULA
CREATE TABLE public.lesson_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.profiles(id),
    class_id UUID REFERENCES public.classes(id),
    subject TEXT NOT NULL,
    date DATE NOT NULL,
    content TEXT NOT NULL,
    objectives TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professores veem seus próprios planos" 
ON public.lesson_plans FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY "Diretores veem todos os planos" 
ON public.lesson_plans FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'DIRETOR')
);

-- 7. TABELA DE RELATÓRIOS/PARECERES
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id),
    author_id UUID REFERENCES public.profiles(id),
    type TEXT CHECK (type IN ('INDIVIDUAL', 'PCD', 'FINAL')),
    content TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Relatórios visíveis por perfis autorizados" 
ON public.reports FOR SELECT USING (
    auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DIRETOR')) OR
    EXISTS (SELECT 1 FROM public.students WHERE id = student_id AND responsible_id = auth.uid())
);

-- 8. TABELA DE FREQUÊNCIA (Attendance)
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id),
    class_id UUID REFERENCES public.classes(id),
    date DATE NOT NULL,
    status TEXT CHECK (status IN ('P', 'F')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, date)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Frequência visível por perfis autorizados" 
ON public.attendance FOR SELECT USING (auth.role() = 'authenticated');

-- 9. TABELA FINANCEIRA
CREATE TABLE public.financial_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id),
    amount NUMERIC(10, 2) NOT NULL,
    type TEXT CHECK (type IN ('INCOME', 'EXPENSE')),
    status TEXT CHECK (status IN ('PAID', 'PENDING', 'LATE')),
    due_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Diretores gerenciam financeiro" 
ON public.financial_records FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'DIRETOR')
);

CREATE POLICY "Responsáveis veem seus próprios registros" 
ON public.financial_records FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students WHERE id = student_id AND responsible_id = auth.uid())
);

-- 10. FUNÇÃO E TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'role', 'ALUNO')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
