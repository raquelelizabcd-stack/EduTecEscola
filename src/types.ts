export type UserRole = 'ADMIN_GERAL' | 'DIRETOR' | 'PROFESSOR' | 'RESPONSAVEL' | 'ALUNO';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  whatsapp?: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  type: 'HOLIDAY_NATIONAL' | 'HOLIDAY_REGIONAL' | 'SCHOOL_EVENT' | 'ANNOUNCEMENT';
  description?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  studentName?: string;
  status: string;
  date: string;
  url: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  targetType: 'ALL' | 'INDIVIDUAL';
  studentId?: string;
  sentViaWhatsapp: boolean;
}

export interface LessonPlan {
  id: string;
  teacherId: string;
  classId: string;
  subject: string;
  date: string;
  content: string;
  objectives: string;
}

export interface StudentReport {
  id: string;
  studentId: string;
  teacherId: string;
  type: 'INDIVIDUAL' | 'FINAL';
  content: string;
  date: string;
}
