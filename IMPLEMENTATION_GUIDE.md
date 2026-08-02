# Sims Academy - Implementation Guide

## Quick Start

This guide will help you get Sims Academy up and running quickly.

### 1. Project Setup

```bash
# Clone the repository (if not already done)
cd /home/user/Npcas/sims-academy

# Install dependencies
npm install

# Set up PostgreSQL (in Termux)
pkg update
pkg install postgresql
initdb $PREFIX/var/lib/postgresql
pg_ctl -D $PREFIX/var/lib/postgresql start
createdb simsacademy

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

### 2. Environment Configuration

Edit `.env` file with your settings:

```env
# Database (Termux PostgreSQL)
DATABASE_URL="postgresql://user@localhost:5432/simsacademy"

# Authentication
AUTH_SECRET="your-secret-key"
# Generate with: openssl rand -base64 32
AUTH_URL="http://localhost:3000"

# Cloudinary (Sign up at https://cloudinary.com)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# LiveKit (Optional for live classes)
LIVEKIT_URL="ws://localhost:7880"

# Stripe (For payments - optional for MVP)
STRIPE_SECRET_KEY="your-stripe-key"
STRIPE_WEBHOOK_SECRET="your-webhook-secret"

# Resend (For emails - optional for MVP)
RESEND_API_KEY="your-resend-key"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### 3. Database Setup

The database schema is defined in `src/lib/db/schema.ts`. The main tables are:

- **users** - User accounts
- **courses** - Course information
- **modules** - Course modules
- **lessons** - Individual lessons
- **enrollments** - Student enrollments
- **assignments** - Course assignments
- **submissions** - Assignment submissions
- **quizzes** - Course quizzes
- **quiz_questions** - Quiz questions
- **quiz_options** - Multiple choice options
- **quiz_attempts** - Student quiz attempts
- **certificates** - Course certificates
- **live_sessions** - Live class sessions
- **messages** - Chat messages
- **announcements** - System announcements
- **payments** - Payment records
- **reviews** - Course reviews
- **notifications** - User notifications

### 4. Running the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# Database operations
npm run db:generate  # Generate migrations
npm run db:push      # Apply migrations
npm run db:studio    # Open Drizzle Studio (GUI)
```

## Project Structure Overview

### Public Pages (No Authentication Required)

| Route | File | Description |
|-------|------|-------------|
| `/` | `src/app/page.tsx` | Home page with hero, featured courses, stats, tutors |
| `/about` | `src/app/about/page.tsx` | About us page with story, vision, mission, team |
| `/courses` | `src/app/courses/page.tsx` | Course catalog with search and filters |
| `/contact` | `src/app/contact/page.tsx` | Contact form and information |
| `/privacy` | `src/app/privacy/page.tsx` | Privacy policy |
| `/terms` | `src/app/terms/page.tsx` | Terms & conditions |

### Authentication Pages

| Route | File | Description |
|-------|------|-------------|
| `/auth/login` | `src/app/auth/login/page.tsx` | Login page with email/password and Google |
| `/auth/register` | `src/app/auth/register/page.tsx` | Registration page for students and tutors |

### Student Dashboard (`/dashboard`)

| Route | File | Description |
|-------|------|-------------|
| `/dashboard` | `src/app/dashboard/page.tsx` | Dashboard home with stats and recent activity |
| `/dashboard/courses` | `src/app/dashboard/courses/page.tsx` | My enrolled courses |
| `/dashboard/assignments` | `src/app/dashboard/assignments/page.tsx` | My assignments |
| `/dashboard/quizzes` | `src/app/dashboard/quizzes/page.tsx` | My quizzes |
| `/dashboard/certificates` | `src/app/dashboard/certificates/page.tsx` | My certificates |
| `/dashboard/messages` | `src/app/dashboard/messages/page.tsx` | Messages with tutors |
| `/dashboard/live-classes` | `src/app/dashboard/live-classes/page.tsx` | Upcoming live classes |

### Tutor Dashboard (`/tutor`)

| Route | File | Description |
|-------|------|-------------|
| `/tutor` | `src/app/tutor/page.tsx` | Tutor dashboard home |
| `/tutor/courses` | `src/app/tutor/courses/page.tsx` | My courses |
| `/tutor/courses/create` | `src/app/tutor/courses/create/page.tsx` | Create new course |
| `/tutor/upload` | `src/app/tutor/upload/page.tsx` | Upload course content |
| `/tutor/assignments` | `src/app/tutor/assignments/page.tsx` | My assignments |
| `/tutor/quizzes` | `src/app/tutor/quizzes/page.tsx` | My quizzes |
| `/tutor/students` | `src/app/tutor/students/page.tsx` | My students |
| `/tutor/live-classes` | `src/app/tutor/live-classes/page.tsx` | My live classes |
| `/tutor/analytics` | `src/app/tutor/analytics/page.tsx` | Course analytics |
| `/tutor/messages` | `src/app/tutor/messages/page.tsx` | Messages with students |

### Admin Dashboard (`/admin`)

| Route | File | Description |
|-------|------|-------------|
| `/admin` | `src/app/admin/page.tsx` | Admin dashboard home |
| `/admin/overview` | `src/app/admin/overview/page.tsx` | System overview and stats |
| `/admin/users` | `src/app/admin/users/page.tsx` | User management |
| `/admin/courses` | `src/app/admin/courses/page.tsx` | Course management |
| `/admin/tutors` | `src/app/admin/tutors/page.tsx` | Tutor management |
| `/admin/payments` | `src/app/admin/payments/page.tsx` | Payment management |
| `/admin/certificates` | `src/app/admin/certificates/page.tsx` | Certificate management |
| `/admin/announcements` | `src/app/admin/announcements/page.tsx` | System announcements |
| `/admin/reports` | `src/app/admin/reports/page.tsx` | Analytics and reports |
| `/admin/settings` | `src/app/admin/settings/page.tsx` | Website settings |

### API Routes

| Route | File | Description |
|-------|------|-------------|
| `/api/auth/register` | `src/app/api/auth/register/route.ts` | User registration |
| `/api/auth/[...nextauth]` | `src/app/api/auth/[...nextauth]/route.ts` | NextAuth handlers |
| `/api/courses` | `src/app/api/courses/route.ts` | Course CRUD operations |

## Key Features Implemented

### 1. Authentication System

- Email/password registration and login
- Google OAuth integration
- JWT session management
- Role-based access control
- Secure password hashing with bcrypt

### 2. User Management

- Three user roles: admin, tutor, student
- Profile management
- Role-based permissions
- User activation/deactivation

### 3. Course System

- Course creation with rich metadata
- Module and lesson organization
- Course categories and difficulty levels
- Course publishing and approval workflow
- Thumbnail uploads

### 4. Enrollment System

- Student course enrollment
- Progress tracking
- Completion status
- Certificate generation upon completion

### 5. Content Management

- Video lesson uploads
- PDF uploads
- Content organization by modules
- Progress tracking per lesson

### 6. Assignment System

- Assignment creation by tutors
- File upload submissions by students
- Grading system
- Feedback mechanism

### 7. Quiz System

- Quiz creation with multiple question types
- Time limits and attempt limits
- Automatic grading
- Score tracking

### 8. Live Class System

- LiveKit integration for video conferencing
- Session scheduling
- Attendance tracking
- Recording capabilities

### 9. Messaging System

- Direct messaging between students and tutors
- Course-specific discussions
- Read receipts
- Message history

### 10. Dashboard Features

- Role-specific dashboards
- Analytics and statistics
- Recent activity tracking
- Quick actions
- Notifications

## UI Components

### Form Components

- **Button** (`src/components/ui/Button.tsx`) - Customizable buttons with variants
- **Input** (`src/components/ui/Input.tsx`) - Form inputs with labels and validation
- **Select** (`src/components/ui/Select.tsx`) - Dropdown select components
- **Textarea** (`src/components/ui/Textarea.tsx`) - Multi-line text inputs
- **Toaster** (`src/components/ui/Toaster.tsx`) - Notification toast system

### Layout Components

- **Navbar** (`src/components/layout/Navbar.tsx`) - Navigation bar for public pages
- **Footer** (`src/components/layout/Footer.tsx`) - Footer with links and contact info
- **MainLayout** (`src/components/layout/MainLayout.tsx`) - Layout wrapper for public pages
- **Sidebar** (`src/components/dashboard/Sidebar.tsx`) - Dashboard navigation
- **Header** (`src/components/dashboard/Header.tsx`) - Dashboard header

### Common Components

- **LoadingSpinner** (`src/components/common/LoadingSpinner.tsx`) - Loading indicators
- **EmptyState** (`src/components/common/EmptyState.tsx`) - Empty state placeholders

### Providers

- **AuthProvider** (`src/components/providers/AuthProvider.tsx`) - NextAuth session provider
- **ThemeProvider** (`src/components/providers/ThemeProvider.tsx`) - Dark/light mode provider

## Utility Functions

### Database Utilities (`src/lib/db/`)

- `schema.ts` - Database schema definitions
- `index.ts` - Database connection and exports

### Authentication Utilities (`src/lib/auth/`)

- `options.ts` - NextAuth configuration
- `index.ts` - Auth exports

### Cloudinary Utilities (`src/lib/cloudinary/`)

- `index.ts` - File upload, delete, and URL generation

### LiveKit Utilities (`src/lib/livekit/`)

- `index.ts` - Room connection, video/audio control, chat, screen sharing

### General Utilities (`src/lib/utils/`)

- `cn()` - Tailwind class name merging
- `formatDate()` - Date formatting
- `formatCurrency()` - Currency formatting
- `truncate()` - Text truncation
- `generateCertificateNumber()` - Certificate number generation
- `calculateProgress()` - Progress percentage calculation
- `getInitials()` - Name initials extraction
- `formatDuration()` - Duration formatting
- `hasRole()` - Role checking
- `debounce()` - Function debouncing
- `sleep()` - Async delay
- `isValidEmail()` - Email validation
- `isStrongPassword()` - Password strength validation

## TypeScript Types

All types are defined in `src/types/index.ts`:

- User types (User, UserRole)
- Course types (Course, Module, Lesson)
- Enrollment types (Enrollment)
- Assignment types (Assignment, Submission)
- Quiz types (Quiz, QuizQuestion, QuizOption, QuizAttempt, QuizAnswer)
- Certificate types (Certificate)
- Live session types (LiveSession, LiveSessionAttendee)
- Message types (Message)
- Announcement types (Announcement)
- Payment types (Payment, PaymentStatus, PaymentMethod)
- Review types (Review)
- Notification types (Notification, NotificationType)
- Settings types (Setting)
- API response types (ApiResponse)
- Dashboard stats types (DashboardStats)
- Course progress types (CourseProgress)
- Pagination types (PaginatedResponse)
- Filter types (CourseFilter, UserFilter)

## Authentication Flow

1. **Registration** (`/auth/register`)
   - User fills registration form
   - Data sent to `/api/auth/register`
   - User created in database
   - Auto login after registration

2. **Login** (`/auth/login`)
   - User enters email/password
   - Credentials sent to NextAuth
   - JWT token generated
   - Session created

3. **Session Management**
   - Session stored in JWT
   - Role information in token
   - Middleware validates sessions
   - Role-based route protection

4. **Middleware** (`src/middleware.ts`)
   - Protected routes: `/dashboard/*`, `/tutor/*`, `/admin/*`, `/live/*`
   - Public routes: `/`, `/about`, `/courses`, `/tutors`, `/blog`, `/contact`, `/auth/*`
   - Role-based redirects:
     - Admin routes: Only for admin role
     - Tutor routes: For tutor and admin roles
     - Student routes: For student role

## Database Operations

### Drizzle ORM Usage

```typescript
// Query users
const users = await db.select().from(users).where(eq(users.role, 'student'));

// Insert course
const newCourse = await db.insert(courses).values({
  title: 'Course Title',
  description: 'Course Description',
  // ... other fields
}).returning();

// Update enrollment
const updated = await db.update(enrollments)
  .set({ progress: 50 })
  .where(eq(enrollments.id, 1))
  .returning();

// Delete assignment
await db.delete(assignments).where(eq(assignments.id, 1));

// Complex query with joins
const coursesWithTutors = await db
  .select({
    course: courses,
    tutor: users,
  })
  .from(courses)
  .leftJoin(users, eq(courses.tutorId, users.id));
```

## File Uploads with Cloudinary

```typescript
import { uploadToCloudinary, uploadPDF, uploadVideo, uploadImage } from '@/lib/cloudinary';

// Upload any file
const result = await uploadToCloudinary(file, 'sims-academy', 'auto');

// Upload PDF specifically
const pdf = await uploadPDF(file, 'sims-academy/pdfs');

// Upload video specifically
const video = await uploadVideo(file, 'sims-academy/videos');

// Upload image specifically
const image = await uploadImage(file, 'sims-academy/images');
```

## LiveKit Integration

```typescript
import { 
  connectToRoom, 
  disconnectFromRoom, 
  toggleMicrophone, 
  toggleCamera, 
  toggleScreenSharing,
  sendChatMessage,
  raiseHand,
  getParticipants
} from '@/lib/livekit';

// Connect to a room
const room = await connectToRoom(
  'course-123',
  'Student Name',
  'student-123',
  () => console.log('Connected'),
  () => console.log('Disconnected')
);

// Toggle microphone
await toggleMicrophone(room, true);

// Send chat message
await sendChatMessage(room, 'Hello everyone!');

// Disconnect
await disconnectFromRoom(room);
```

## Styling with Tailwind CSS

The project uses Tailwind CSS with custom configuration:

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          // ... up to 950
        },
        secondary: {
          50: '#f8fafc',
          // ... up to 950
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

### Custom Styles

Additional styles are defined in `src/app/globals.css`:

- Custom scrollbar styling
- Animation utilities (`fadeIn`, `spinSlow`)
- Card hover effects
- Gradient backgrounds
- Custom form styling
- Dashboard sidebar styles
- Table styling
- Badge styling
- Modal overlay
- Loading spinner
- Empty state styling
- Notification toast styling

## Next.js Configuration

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['cloudinary', 'livekit-client'],
  },
};
```

## Deployment to Vercel

1. **Prepare your repository:**
```bash
git init
git add .
git commit -m "Sims Academy"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main
```

2. **Import to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure project settings

3. **Add Environment Variables:**
   - Go to project settings → Environment Variables
   - Add all variables from `.env`
   - Include DATABASE_URL, AUTH_SECRET, CLOUDINARY_*, etc.

4. **Deploy:**
   - Click "Deploy" button
   - Wait for deployment to complete
   - Your app will be live at the provided URL

### Vercel Configuration

Create a `vercel.json` file for custom configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": { "installCommand": "npm install" }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ]
}
```

## Troubleshooting

### Common Issues

1. **Database connection failed:**
   - Check DATABASE_URL in .env
   - Ensure PostgreSQL is running
   - Verify database name and credentials

2. **Authentication not working:**
   - Check AUTH_SECRET in .env
   - Ensure NextAuth is properly configured
   - Verify session middleware

3. **File uploads failing:**
   - Check Cloudinary credentials
   - Verify CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET
   - Check file size limits

4. **LiveKit connection issues:**
   - Verify LIVEKIT_URL
   - Check if LiveKit server is running
   - Ensure proper token generation

5. **Build errors:**
   - Run `npm install` to ensure all dependencies are installed
   - Check Node.js version (18+ required)
   - Clear node_modules and reinstall if needed

### Debugging Tips

```bash
# Check database connection
psql simsacademy -c "SELECT 1"

# View logs
npm run dev  # Check console output

# Test API endpoints
curl http://localhost:3000/api/courses

# Check environment variables
echo $DATABASE_URL
```

## Performance Optimization

### Recommended Optimizations

1. **Image Optimization:**
   - Use Next.js Image component
   - Enable Cloudinary optimizations
   - Implement lazy loading

2. **Database Optimization:**
   - Add indexes to frequently queried columns
   - Implement pagination for large datasets
   - Use caching for common queries

3. **Bundle Optimization:**
   - Use dynamic imports for heavy components
   - Implement code splitting
   - Optimize dependencies

4. **Caching:**
   - Implement Redis for session caching
   - Cache course data
   - Cache frequently accessed pages

## Security Best Practices

1. **Environment Variables:**
   - Never commit `.env` to version control
   - Use different secrets for development and production
   - Rotate secrets regularly

2. **Authentication:**
   - Use strong passwords
   - Enable 2FA for admin accounts
   - Implement rate limiting for login attempts

3. **Database:**
   - Use SSL for database connections
   - Implement proper backups
   - Restrict database access

4. **File Uploads:**
   - Validate file types
   - Scan for malware
   - Set size limits
   - Use signed URLs for private content

5. **API Security:**
   - Implement rate limiting
   - Use CORS properly
   - Validate all inputs
   - Sanitize outputs

## Monitoring and Analytics

### Recommended Tools

1. **Error Tracking:**
   - Sentry
   - LogRocket

2. **Analytics:**
   - Google Analytics
   - Plausible
   - Mixpanel

3. **Performance Monitoring:**
   - Vercel Analytics
   - Lighthouse
   - Web Vitals

4. **Logging:**
   - Winston
   - Pino
   - ELK Stack (for large scale)

## Scaling Considerations

### Database Scaling

1. **Read Replicas:**
   - Set up read replicas for read-heavy workloads
   - Distribute read queries across replicas

2. **Connection Pooling:**
   - Use PgBouncer for connection pooling
   - Optimize pool size based on load

3. **Caching:**
   - Implement Redis for caching
   - Cache frequently accessed data

### Application Scaling

1. **Vercel:**
   - Automatic scaling with Vercel
   - Edge functions for performance

2. **Load Balancing:**
   - Use load balancers for high traffic
   - Distribute across multiple instances

3. **CDN:**
   - Use CDN for static assets
   - Cache at the edge

### Storage Scaling

1. **Cloudinary:**
   - Automatic scaling with Cloudinary
   - CDN for fast delivery

2. **AWS S3:**
   - Highly scalable storage
   - CDN integration

## Future Enhancements

### Short-term (1-3 months)
- [ ] Complete payment integration
- [ ] Email notification system
- [ ] Advanced search and filtering
- [ ] Course recommendations
- [ ] User profiles with avatars

### Medium-term (3-6 months)
- [ ] AI-powered features
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Social learning features
- [ ] Gamification (badges, points)

### Long-term (6-12 months)
- [ ] Multi-language support
- [ ] Corporate training features
- [ ] Marketplace for tutors
- [ ] Subscription model
- [ ] Accreditation partnerships

## Support and Community

### Getting Help

1. **Documentation:**
   - README.md
   - PROJECT_SUMMARY.md
   - IMPLEMENTATION_GUIDE.md

2. **Community:**
   - GitHub Discussions
   - Discord server (future)

3. **Professional Support:**
   - Email: support@simsacademy.com
   - Priority support for sponsors

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

### Reporting Issues

When reporting issues, please include:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Browser and OS information
- Error messages (if any)

## Legal

### License
This project is **Copyleft** by Seedwel Investment Limited. All rights reserved.

### Trademarks
"Sims Academy" and the Sims Academy logo are trademarks of Seedwel Investment Limited.

### Privacy
See our Privacy Policy at `/privacy` for information on how we handle user data.

### Terms of Service
See our Terms & Conditions at `/terms` for usage terms and conditions.

---

**Sims Academy** - Complete Learning Management System

*Built with Next.js, TypeScript, Tailwind CSS, and Drizzle ORM*

*Copyleft © 2026 Seedwel Investment Limited. All rights reserved.*
