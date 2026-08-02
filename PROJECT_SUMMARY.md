# Sims Academy - Project Summary

## Overview

Sims Academy is a complete **Learning Management System (LMS)** built with modern web technologies. This document provides a comprehensive overview of the project structure, features, and implementation details.

## Project Information

- **Name**: Sims Academy
- **Type**: Online Learning Management System (LMS)
- **Copyleft**: Seedwel Investment Limited
- **Version**: 1.0.0
- **License**: Copyleft

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide React icons

### Backend
- **API**: Next.js API Routes
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL

### Authentication
- **Library**: NextAuth.js v5 (beta)
- **Strategy**: JWT sessions
- **Providers**: Credentials (email/password), Google OAuth

### Storage
- **Primary**: Cloudinary (for images, videos, PDFs)
- **Alternative**: Local storage during development

### Live Classes
- **Technology**: LiveKit
- **Features**: Video, audio, chat, screen sharing, whiteboard

### Payments
- **Processor**: Stripe
- **Alternative**: PayPal, Mobile Money (future)

### Email
- **Service**: Resend
- **Purpose**: Notifications, password reset, certificates

## Project Structure

```
sims-academy/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Authentication pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/               # Student dashboard
│   │   │   ├── courses/
│   │   │   │   └── page.tsx
│   │   │   ├── assignments/
│   │   │   │   └── page.tsx
│   │   │   ├── quizzes/
│   │   │   │   └── page.tsx
│   │   │   ├── certificates/
│   │   │   │   └── page.tsx
│   │   │   ├── messages/
│   │   │   │   └── page.tsx
│   │   │   ├── live-classes/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (tutor)/                   # Tutor dashboard
│   │   │   ├── courses/
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── upload/
│   │   │   │   └── page.tsx
│   │   │   ├── assignments/
│   │   │   │   └── page.tsx
│   │   │   ├── quizzes/
│   │   │   │   └── page.tsx
│   │   │   ├── students/
│   │   │   │   └── page.tsx
│   │   │   ├── live-classes/
│   │   │   │   └── page.tsx
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   ├── messages/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (admin)/                    # Admin dashboard
│   │   │   ├── overview/
│   │   │   │   └── page.tsx
│   │   │   ├── users/
│   │   │   │   └── page.tsx
│   │   │   ├── courses/
│   │   │   │   └── page.tsx
│   │   │   ├── tutors/
│   │   │   │   └── page.tsx
│   │   │   ├── payments/
│   │   │   │   └── page.tsx
│   │   │   ├── certificates/
│   │   │   │   └── page.tsx
│   │   │   ├── announcements/
│   │   │   │   └── page.tsx
│   │   │   ├── reports/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/                        # API Routes
│   │   │   ├── auth/
│   │   │   │   ├── register/
│   │   │   │   │   └── route.ts
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── courses/
│   │   │   │   └── route.ts
│   │   │   ├── users/
│   │   │   │   └── route.ts
│   │   │   ├── enrollments/
│   │   │   │   └── route.ts
│   │   │   ├── assignments/
│   │   │   │   └── route.ts
│   │   │   ├── submissions/
│   │   │   │   └── route.ts
│   │   │   ├── quizzes/
│   │   │   │   └── route.ts
│   │   │   ├── quiz-questions/
│   │   │   │   └── route.ts
│   │   │   ├── quiz-options/
│   │   │   │   └── route.ts
│   │   │   ├── quiz-attempts/
│   │   │   │   └── route.ts
│   │   │   ├── quiz-answers/
│   │   │   │   └── route.ts
│   │   │   ├── certificates/
│   │   │   │   └── route.ts
│   │   │   ├── live-sessions/
│   │   │   │   └── route.ts
│   │   │   ├── live-session-attendees/
│   │   │   │   └── route.ts
│   │   │   ├── messages/
│   │   │   │   └── route.ts
│   │   │   ├── announcements/
│   │   │   │   └── route.ts
│   │   │   ├── payments/
│   │   │   │   └── route.ts
│   │   │   ├── reviews/
│   │   │   │   └── route.ts
│   │   │   └── notifications/
│   │   │       └── route.ts
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── blog/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── courses/
│   │   │   └── page.tsx
│   │   ├── tutors/
│   │   │   └── page.tsx
│   │   ├── privacy/
│   │   │   └── page.tsx
│   │   ├── terms/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── common/
│   │   │   ├── EmptyState.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── layout/
│   │   │   ├── Footer.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── Navbar.tsx
│   │   ├── providers/
│   │   │   ├── AuthProvider.tsx
│   │   │   └── ThemeProvider.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Textarea.tsx
│   │       └── Toaster.tsx
│   ├── hooks/
│   │   └── index.ts
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── index.ts
│   │   │   └── options.ts
│   │   ├── cloudinary/
│   │   │   └── index.ts
│   │   ├── db/
│   │   │   ├── index.ts
│   │   │   └── schema.ts
│   │   ├── livekit/
│   │   │   └── index.ts
│   │   └── utils/
│   │       └── index.ts
│   └── types/
│       └── index.ts
├── drizzle.config.ts
├── next.config.js
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── setup.sh
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Database Schema

### Core Tables

1. **users** - User accounts with roles
   - id, name, email, password, role, image, phone, bio, qualifications, isActive, createdAt

2. **courses** - Course information
   - id, title, description, thumbnail, price, isFree, category, tutorId, isPublished, isApproved, difficulty, duration, createdAt

3. **modules** - Course modules
   - id, courseId, title, description, order, createdAt

4. **lessons** - Individual lessons
   - id, moduleId, courseId, title, description, videoUrl, pdfUrl, duration, order, isPublished, createdAt

5. **enrollments** - Student course enrollments
   - id, studentId, courseId, progress, completed, completionDate, createdAt

### Assignment System

6. **assignments** - Course assignments
   - id, courseId, moduleId, title, description, instructions, maxPoints, deadline, createdAt

7. **submissions** - Student assignment submissions
   - id, assignmentId, studentId, fileUrl, fileName, content, grade, feedback, isGraded, submittedAt, gradedAt

### Quiz System

8. **quizzes** - Course quizzes
   - id, courseId, moduleId, title, description, timeLimit, maxAttempts, passingScore, createdAt

9. **quiz_questions** - Quiz questions
   - id, quizId, question, questionType, points, order, createdAt

10. **quiz_options** - Multiple choice options
    - id, questionId, option, isCorrect, order

11. **quiz_attempts** - Student quiz attempts
    - id, quizId, studentId, score, totalPoints, isPassed, attemptNumber, startedAt, completedAt

12. **quiz_answers** - Student quiz answers
    - id, attemptId, questionId, selectedOptionId, essayAnswer, isCorrect, pointsEarned

### Additional Features

13. **certificates** - Course completion certificates
    - id, studentId, courseId, certificateUrl, certificateNumber, issuedAt

14. **live_sessions** - Live class sessions
    - id, courseId, tutorId, title, description, scheduledAt, duration, livekitRoom, isActive, isRecorded, recordingUrl, createdAt

15. **live_session_attendees** - Live class participants
    - id, sessionId, studentId, joinedAt, leftAt, isPresent

16. **messages** - Chat messages
    - id, senderId, receiverId, courseId, content, isRead, createdAt

17. **announcements** - System announcements
    - id, title, content, authorId, isGlobal, targetRole, createdAt

18. **payments** - Payment records
    - id, studentId, courseId, amount, currency, paymentMethod, transactionId, status, metadata, createdAt, updatedAt

19. **reviews** - Course reviews
    - id, courseId, studentId, rating, comment, createdAt

20. **notifications** - User notifications
    - id, userId, title, message, type, isRead, link, createdAt

21. **settings** - System settings
    - id, key, value, description, updatedAt

## User Roles and Permissions

### Admin
- Manage all users (students and tutors)
- Manage all courses and content
- Process payments and refunds
- Manage certificates
- Upload announcements
- View analytics dashboard
- Moderate chats
- Manage website settings
- Access all features

### Tutor
- Create and manage their own courses
- Upload video lessons and PDFs
- Create assignments and quizzes
- Grade student work
- Host live classes
- Chat with their students
- Track their students' progress
- View their course analytics

### Student
- Browse and enroll in courses
- Watch video lessons
- Download course materials
- Submit assignments
- Take quizzes and exams
- Receive certificates
- Chat with tutors
- Join live classes
- Track their learning progress

## Public Pages

1. **Home Page** (`/`)
   - Hero banner with call-to-action
   - Featured courses
   - Success stories (tutors)
   - Statistics
   - Call-to-action section

2. **About Us** (`/about`)
   - School history
   - Vision and mission
   - Team members
   - Core values

3. **Courses** (`/courses`)
   - All available courses
   - Search and filtering
   - Categories
   - Pagination

4. **Tutors** (`/tutors`)
   - Tutor profiles
   - Qualifications
   - Specializations

5. **Blog** (`/blog`)
   - Educational articles
   - News and updates

6. **Contact** (`/contact`)
   - Contact form
   - Email, phone, map
   - FAQ section

7. **Privacy Policy** (`/privacy`)
8. **Terms & Conditions** (`/terms`)

## Dashboard Pages

### Student Dashboard (`/dashboard`)
- Dashboard Home: Enrolled courses, progress, upcoming lessons
- My Courses: Continue learning, progress tracking
- Assignments: Submit PDFs and documents
- Quizzes: Attempt quizzes, view results
- Certificates: Download certificates
- Downloads: Course resources and PDFs
- Messages: Chat with tutors
- Live Classes: Join Zoom/WebRTC sessions
- Profile: Edit information

### Tutor Dashboard (`/tutor`)
- Dashboard: Overview and statistics
- My Courses: Manage existing courses
- Create Course: Course creation form
- Upload Lessons: Upload videos and PDFs
- Upload PDFs: PDF upload interface
- Create Assignments: Assignment creation
- Create Quizzes: Quiz creation
- Grade Student Work: Review and grade submissions
- Student Management: View and manage students
- Live Teaching: Host live classes
- Messages: Chat with students
- Analytics: Course performance analytics

### Admin Dashboard (`/admin`)
- Overview: Total students, tutors, courses, revenue
- User Management: Students, tutors, admins
- Course Management: All courses, content moderation
- Payments: Process payments, view transactions
- Reports: Analytics and reports
- Announcements: Upload school announcements
- Certificates: Manage certificates
- Storage Management: File storage
- Settings: Website settings

## Course Structure

Each course follows this structure:

```
Course
├── Module 1
│   ├── Lesson 1 (Video)
│   ├── Lesson 2 (Video)
│   └── PDF Notes
├── Module 2
│   ├── Lesson 3 (Video)
│   ├── Lesson 4 (Video)
│   └── Assignment
├── Module 3
│   ├── Lesson 5 (Video)
│   └── Quiz
├── Final Exam
└── Certificate
```

## Live Class System

### Features
- Video call (webcam)
- Audio call (microphone)
- Screen sharing
- Text chat
- Attendance tracking
- Raise hand
- Session recording
- Interactive whiteboard

### Technology
- **Primary**: LiveKit (recommended)
- **Alternatives**: Agora, WebRTC

## File Storage

### Supported File Types
- PDF
- DOCX
- PPTX
- Images (JPG, PNG, GIF, etc.)
- Videos (MP4, WebM, etc.)
- ZIP files

### Storage Options
- **Free**: Firebase Storage
- **Better**: Cloudinary (recommended)
- **Professional**: AWS S3

## Authentication

### Methods
- Email/Password registration
- Google OAuth
- Password reset
- OTP verification (future)

### Features
- JWT sessions
- Role-based access control
- Session management
- Secure password storage (bcrypt)

## AI Features (Future)

1. **AI Tutor**
   - Answer student questions
   - Explain lessons
   - Generate quizzes
   - Generate assignments

2. **AI Study Assistant**
   - Summarize PDFs
   - Summarize notes
   - Create flashcards

3. **AI Exam Generator**
   - Multiple-choice questions
   - Essay questions
   - Automatic grading

## Mobile App Features (Future)

- Offline downloads
- Push notifications
- Live classes
- Chat
- Assignments

## SEO Features

- Sitemap generation
- robots.txt
- Metadata optimization
- Open Graph tags
- Twitter cards
- Semantic HTML

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database Options for Production
- **Supabase**: PostgreSQL with built-in auth (recommended)
- **AWS RDS**: Managed PostgreSQL
- **Railway**: Easy database hosting
- **Neon**: Serverless PostgreSQL
- **Planetscale**: MySQL alternative

### Environment Variables Required

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth
AUTH_SECRET="your-secret-key"
AUTH_URL="https://your-domain.com"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# LiveKit
LIVEKIT_URL="wss://your-livekit-server"
LIVEKIT_TOKEN="your-token-endpoint"

# Stripe
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-webhook-secret"

# Resend
RESEND_API_KEY="your-resend-api-key"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Setup Instructions

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/your-username/sims-academy.git
cd sims-academy
```

2. Install dependencies:
```bash
npm install
```

3. Set up PostgreSQL:
```bash
createdb simsacademy
```

4. Create .env file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Run database migrations:
```bash
npm run db:push
```

6. Start development server:
```bash
npm run dev
```

7. Open http://localhost:3000

### Production Deployment

1. Set up PostgreSQL database (Supabase, AWS RDS, etc.)
2. Create Cloudinary account
3. Set up LiveKit server
4. Create Stripe account
5. Set up Resend for emails
6. Push code to GitHub
7. Deploy to Vercel
8. Add all environment variables in Vercel

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
npm run db:generate  # Generate database migrations
npm run db:push      # Push migrations to database
npm run db:studio    # Open Drizzle Studio
```

## Dependencies

### Production Dependencies
- next (15.0.0)
- react (18.3.1)
- react-dom (18.3.1)
- typescript (5.3.0)
- drizzle-orm (0.30.0)
- postgres (3.4.0)
- next-auth (5.0.0-beta.25)
- bcryptjs (2.4.3)
- cloudinary (1.41.0)
- livekit-client (2.0.0)
- lucide-react (0.323.0)
- react-hook-form (7.49.2)
- zod (3.22.4)

### Development Dependencies
- @types/node (20.11.0)
- @types/react (18.3.12)
- @types/react-dom (18.3.1)
- @types/bcryptjs (2.4.6)
- autoprefixer (10.4.17)
- drizzle-kit (0.20.0)
- postcss (8.4.35)
- tailwindcss (3.4.14)

## Project Status

This is a **Minimum Viable Product (MVP)** with the following features implemented:

✅ **Core LMS Features**
- User authentication (email/password, Google)
- User roles (student, tutor, admin)
- Course creation and management
- Module and lesson organization
- Course enrollment
- PDF and video uploads
- Assignment system
- Quiz system
- Certificate generation
- Live class integration (LiveKit)
- Chat system
- Notifications
- Analytics dashboard
- SEO optimization
- Mobile responsive design

🚧 **Features in Development**
- Payment processing (Stripe)
- Email notifications (Resend)
- Advanced analytics
- AI features
- Mobile app

📋 **Future Features**
- Offline downloads
- Push notifications
- Mobile Money payments
- Advanced AI features
- Gamification
- Social learning features
- Multi-language support

## Support

For support and inquiries:
- **Email**: support@simsacademy.com
- **Website**: https://sims-academy.vercel.app
- **Documentation**: See README.md and PROJECT_SUMMARY.md

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

This project is **Copyleft** by Seedwel Investment Limited. All rights reserved.

---

**Sims Academy** - Empowering learners worldwide with quality online education.

*Built with Next.js, TypeScript, and Tailwind CSS*
