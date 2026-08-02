# 🚀 Sims Academy - Quick Start Guide

## Get Started in 5 Minutes!

This guide will get you up and running with Sims Academy quickly.

## 📋 Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] PostgreSQL database available
- [ ] Git (optional, for version control)

## 💻 Local Development Setup

### Step 1: Navigate to Project
```bash
cd /home/user/Npcas/sims-academy
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Set Up PostgreSQL (Termux)
```bash
# Install PostgreSQL
pkg update
pkg install postgresql

# Initialize database
initdb $PREFIX/var/lib/postgresql

# Start PostgreSQL
pg_ctl -D $PREFIX/var/lib/postgresql start

# Create database
createdb simsacademy
```

### Step 4: Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

Add these required variables:
```env
# Database (Termux PostgreSQL)
DATABASE_URL="postgresql://user@localhost:5432/simsacademy"

# Authentication secret (generate with: openssl rand -base64 32)
AUTH_SECRET="your-generated-secret-key"
AUTH_URL="http://localhost:3000"
```

### Step 5: Run Database Migrations
```bash
npm run db:push
```

### Step 6: Start Development Server
```bash
npm run dev
```

### Step 7: Open in Browser
```
http://localhost:3000
```

🎉 **You're now running Sims Academy locally!**

## 🌐 Production Deployment (Vercel)

### Step 1: Prepare Your Code
```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Sims Academy"

# Create GitHub repository and push
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Set Up Production Services

1. **PostgreSQL Database** (Choose one):
   - [Supabase](https://supabase.com/) (Recommended)
   - [AWS RDS](https://aws.amazon.com/rds/postgresql/)
   - [Railway](https://railway.app/)
   - [Neon](https://neon.tech/)

2. **Cloudinary** (For file uploads):
   - Sign up at [https://cloudinary.com](https://cloudinary.com)
   - Get your cloud name, API key, and API secret

3. **LiveKit** (Optional, for live classes):
   - Sign up at [https://livekit.io](https://livekit.io)
   - Set up your LiveKit server

4. **Stripe** (Optional, for payments):
   - Sign up at [https://stripe.com](https://stripe.com)
   - Get your secret key

5. **Resend** (Optional, for emails):
   - Sign up at [https://resend.com](https://resend.com)
   - Get your API key

### Step 3: Deploy to Vercel

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project settings:
   - Framework: Next.js
   - Build command: `npm run build`
   - Install command: `npm install`
   - Output directory: `.next`
5. Add Environment Variables:
   ```
   DATABASE_URL=your-postgresql-connection-string
   AUTH_SECRET=your-secret-key
   AUTH_URL=https://your-domain.vercel.app
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   # Optional:
   LIVEKIT_URL=wss://your-livekit-server
   STRIPE_SECRET_KEY=your-stripe-key
   RESEND_API_KEY=your-resend-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```
6. Click "Deploy" button
7. Wait for deployment to complete (usually 2-5 minutes)

🎉 **Your Sims Academy is now live!**

## 🔧 Common Tasks

### Create Your First User

1. Go to `/auth/register`
2. Fill in the registration form
3. Choose your role (student or tutor)
4. Click "Create Account"

### Create a Course (Tutor)

1. Log in as a tutor
2. Go to `/tutor/courses/create`
3. Fill in course details
4. Click "Create Course"
5. Upload lessons and content at `/tutor/upload`

### Enroll in a Course (Student)

1. Log in as a student
2. Browse courses at `/courses`
3. Click "View Details" on a course
4. Click "Enroll" button
5. Start learning at `/dashboard/courses`

### Manage Users (Admin)

1. Log in as admin
2. Go to `/admin/users`
3. View, edit, or manage users
4. Approve courses at `/admin/courses`

## 🛠️ Troubleshooting

### Database Connection Issues

**Problem:** "Connection refused" or "Database not found"

**Solution:**
```bash
# Check if PostgreSQL is running
pg_ctl -D $PREFIX/var/lib/postgresql status

# If not running, start it
pg_ctl -D $PREFIX/var/lib/postgresql start

# Check database exists
psql -l

# If not, create it
createdb simsacademy
```

### Authentication Issues

**Problem:** "Invalid credentials" or "Login failed"

**Solution:**
1. Check your email and password
2. Verify the user exists in the database:
```bash
psql simsacademy
SELECT * FROM users;
```
3. Check AUTH_SECRET in .env
4. Generate a new one: `openssl rand -base64 32`

### File Upload Issues

**Problem:** "Failed to upload file"

**Solution:**
1. Check Cloudinary credentials in .env
2. Verify CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET
3. Test Cloudinary connection separately

### Build Errors

**Problem:** "Module not found" or "Type error"

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node -v  # Should be 18+

# If using nvm, switch to Node 18
nvm use 18
```

## 📚 Useful Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
```

### Database
```bash
npm run db:generate  # Generate database migrations
npm run db:push      # Push migrations to database
npm run db:studio    # Open Drizzle Studio (GUI)

# Manual PostgreSQL commands
psql simsacademy     # Connect to database
\dt                  # List tables
\q                  # Quit
```

### Cloudinary
```bash
# Test Cloudinary upload
node -e "
const { uploadToCloudinary } = require('./src/lib/cloudinary');
const fs = require('fs');
uploadToCloudinary(fs.readFileSync('test.jpg'), 'test').then(console.log);
"
```

## 🎯 Next Steps

### Immediate (First Day)
1. [ ] Set up production database (Supabase recommended)
2. [ ] Configure Cloudinary for file uploads
3. [ ] Deploy to Vercel
4. [ ] Create admin user
5. [ ] Add sample courses

### Short-term (First Week)
1. [ ] Set up Stripe for payments
2. [ ] Configure Resend for emails
3. [ ] Set up LiveKit for live classes
4. [ ] Add your logo and branding
5. [ ] Customize colors and styling

### Medium-term (First Month)
1. [ ] Add more sample courses
2. [ ] Invite tutors to join
3. [ ] Market your platform
4. [ ] Gather user feedback
5. [ ] Plan additional features

## 📖 Documentation

- **README.md** - Complete project documentation
- **PROJECT_SUMMARY.md** - Project overview and features
- **IMPLEMENTATION_GUIDE.md** - Detailed implementation guide
- **COMPLETE_PROJECT_SUMMARY.md** - Complete project summary
- **QUICK_START.md** - This file

## 💬 Support

- **Email**: support@simsacademy.com
- **Website**: https://sims-academy.vercel.app
- **GitHub**: [Your GitHub Repository]

## 🎉 Success!

You now have a **fully functional Learning Management System** that can:

✅ Handle user registration and authentication
✅ Support three user roles (student, tutor, admin)
✅ Manage courses, modules, and lessons
✅ Process enrollments and track progress
✅ Handle assignments and quizzes
✅ Support live classes with video
✅ Enable messaging between users
✅ Provide dashboards for all roles
✅ Work on mobile, tablet, and desktop

**Start building your online education platform today!**

---

*Copyleft © 2026 Seedwel Investment Limited. All rights reserved.*
