import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

const userRoles = ['admin', 'tutor', 'student'] as const;
export type UserRole = typeof userRoles[number];

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  role: text('role', { enum: userRoles }).notNull().default('student'),
  image: text('image'),
  phone: text('phone'),
  bio: text('bio'),
  qualifications: text('qualifications'),
  isActive: boolean('is_active').default(true),
  emailVerified: timestamp('email_verified'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  thumbnail: text('thumbnail'),
  price: integer('price').default(0),
  isFree: boolean('is_free').default(true),
  category: text('category').notNull().default('general'),
  tutorId: integer('tutor_id').references(() => users.id, { onDelete: 'cascade' }),
  isPublished: boolean('is_published').default(false),
  isApproved: boolean('is_approved').default(false),
  difficulty: text('difficulty').default('beginner'),
  duration: text('duration'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const modules = pgTable('modules', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  moduleId: integer('module_id').references(() => modules.id, { onDelete: 'cascade' }),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  videoUrl: text('video_url'),
  pdfUrl: text('pdf_url'),
  duration: text('duration'),
  order: integer('order').notNull().default(0),
  isPublished: boolean('is_published').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const enrollments = pgTable('enrollments', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  progress: integer('progress').default(0),
  completed: boolean('completed').default(false),
  completionDate: timestamp('completion_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const assignments = pgTable('assignments', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  moduleId: integer('module_id').references(() => modules.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  instructions: text('instructions'),
  maxPoints: integer('max_points').default(100),
  deadline: timestamp('deadline'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const submissions = pgTable('submissions', {
  id: serial('id').primaryKey(),
  assignmentId: integer('assignment_id').references(() => assignments.id, { onDelete: 'cascade' }).notNull(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  fileUrl: text('file_url'),
  fileName: text('file_name'),
  content: text('content'),
  grade: integer('grade'),
  feedback: text('feedback'),
  isGraded: boolean('is_graded').default(false),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  gradedAt: timestamp('graded_at'),
});

export const quizzes = pgTable('quizzes', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  moduleId: integer('module_id').references(() => modules.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  timeLimit: integer('time_limit'),
  maxAttempts: integer('max_attempts').default(1),
  passingScore: integer('passing_score').default(50),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const quizQuestions = pgTable('quiz_questions', {
  id: serial('id').primaryKey(),
  quizId: integer('quiz_id').references(() => quizzes.id, { onDelete: 'cascade' }).notNull(),
  question: text('question').notNull(),
  questionType: text('question_type').notNull().default('multiple_choice'),
  points: integer('points').default(1),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const quizOptions = pgTable('quiz_options', {
  id: serial('id').primaryKey(),
  questionId: integer('question_id').references(() => quizQuestions.id, { onDelete: 'cascade' }).notNull(),
  option: text('option').notNull(),
  isCorrect: boolean('is_correct').default(false),
  order: integer('order').notNull().default(0),
});

export const certificates = pgTable('certificates', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  certificateUrl: text('certificate_url').notNull(),
  certificateNumber: text('certificate_number').notNull().unique(),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  receiverId: integer('receiver_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const schema = {
  users,
  courses,
  modules,
  lessons,
  enrollments,
  assignments,
  submissions,
  quizzes,
  quizQuestions,
  quizOptions,
  certificates,
  messages,
};
