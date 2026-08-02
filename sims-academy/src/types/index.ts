export type UserRole = 'admin' | 'tutor' | 'student';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
  phone?: string;
  bio?: string;
  qualifications?: string;
  isActive: boolean;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type CourseCategory = 'programming' | 'business' | 'design' | 'language' | 'science' | 'general';

export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  isFree: boolean;
  category: CourseCategory;
  tutorId: number;
  isPublished: boolean;
  isApproved: boolean;
  difficulty: CourseDifficulty;
  duration?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  order: number;
  createdAt: Date;
}

export interface Lesson {
  id: number;
  moduleId?: number;
  courseId: number;
  title: string;
  description?: string;
  videoUrl?: string;
  pdfUrl?: string;
  duration?: string;
  order: number;
  isPublished: boolean;
  createdAt: Date;
}

export interface Enrollment {
  id: number;
  studentId: number;
  courseId: number;
  progress: number;
  completed: boolean;
  completionDate?: Date;
  createdAt: Date;
}

export interface Assignment {
  id: number;
  courseId: number;
  moduleId?: number;
  title: string;
  description?: string;
  instructions?: string;
  maxPoints: number;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Submission {
  id: number;
  assignmentId: number;
  studentId: number;
  fileUrl?: string;
  fileName?: string;
  content?: string;
  grade?: number;
  feedback?: string;
  isGraded: boolean;
  submittedAt: Date;
  gradedAt?: Date;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'essay';

export interface Quiz {
  id: number;
  courseId: number;
  moduleId?: number;
  title: string;
  description?: string;
  timeLimit?: number;
  maxAttempts: number;
  passingScore: number;
  createdAt: Date;
}

export interface QuizQuestion {
  id: number;
  quizId: number;
  question: string;
  questionType: QuestionType;
  points: number;
  order: number;
  createdAt: Date;
}

export interface QuizOption {
  id: number;
  questionId: number;
  option: string;
  isCorrect: boolean;
  order: number;
}

export interface Certificate {
  id: number;
  studentId: number;
  courseId: number;
  certificateUrl: string;
  certificateNumber: string;
  issuedAt: Date;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  courseId?: number;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
