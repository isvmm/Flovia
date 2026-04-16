# Flovia Project Export Guide

This guide will help you export and set up the Flovia project for local development.

## Quick Export (Recommended)

### Option 1: Use Git (Fastest)
```bash
# Clone the repository
git clone <your-repo-url> flovia-project
cd flovia-project

# Install dependencies
npm install

# Start development server
npm run dev
```

### Option 2: Manual File Export
1. **Create project directory:**
   ```bash
   mkdir flovia-project
   cd flovia-project
   ```

2. **Copy the following files and folders:**
   ```
   flovia-project/
   ├── app/                    # Next.js App Router (all pages, API routes, components)
   ├── components/             # Reusable React components
   ├── hooks/                  # Custom React hooks (useAuth, etc.)
   ├── lib/                    # Utilities and configuration files
   ├── public/                 # Static assets (images, icons)
   ├── utils/                  # Helper utilities
   ├── package.json            # Dependencies
   ├── next.config.js          # Next.js configuration
   ├── jsconfig.json           # JS/JSX path aliases
   ├── tailwind.config.js      # Tailwind CSS configuration
   ├── postcss.config.mjs      # PostCSS configuration
   ├── capacitor.config.ts     # Capacitor mobile config
   ├── middleware.js           # Next.js middleware
   └── .env.example            # Environment variables template
   ```

3. **Exclude these (build artifacts):**
   - `node_modules/`
   - `.next/`
   - `out/`
   - `android/`
   - `.env` (use `.env.example` instead)

## Environment Setup

### 1. Copy Environment File
```bash
cp .env.example .env.local
```

### 2. Configure Environment Variables

Edit `.env.local` and add your credentials:

```env
# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# API Base URL (your deployment domain or localhost)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Google AI (for image generation)
GOOGLE_GENERATIVE_AI_API_KEY=your-api-key

# Supabase Auth & Storage
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Credits System (change for production)
CREDIT_GRANT_SECRET=your-secret-key
```

**Where to find these:**
- **DATABASE_URL**: Neon PostgreSQL connection string
- **GOOGLE_GENERATIVE_AI_API_KEY**: Google Cloud Console → Generative Language API
- **Supabase Keys**: Supabase Dashboard → Settings → API
- **NEXT_PUBLIC_API_URL**: Your deployed URL (localhost:3000 for local dev)

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Database Tables
```bash
# Create tables (one-time setup)
npm run setup-db

# Seed sample data (optional)
npm run seed-db
```

### 3. Start Development Server
```bash
npm run dev
```

Server runs at: `http://localhost:3000`

## Project Structure

```
flovia-project/
│
├── app/                          # Next.js App Router
│   ├── api/                      # Backend API routes
│   │   ├── posts/               # Post management endpoints
│   │   ├── credits/             # Credit system endpoints
│   │   ├── notifications/       # Notification endpoints
│   │   ├── upload/              # File upload handler
│   │   ├── generate-*/          # AI generation endpoints
│   │   └── utils/sql.js         # Database client
│   │
│   ├── (pages)/                 # Page routes
│   │   ├── page.jsx             # Home/Feed
│   │   ├── login/page.jsx       # Login
│   │   ├── signup/page.jsx      # Signup
│   │   ├── profile/page.jsx     # User profile
│   │   ├── upload/page.jsx      # Upload new post
│   │   ├── creative-studio/     # AI tools
│   │   └── settings/            # Settings pages
│   │
│   ├── layout.jsx               # Root layout with auth
│   ├── globals.css              # Global styles
│   └── not-found.jsx            # 404 page
│
├── components/
│   ├── appgen-provider.jsx      # Root provider wrapper
│   ├── PostCard.jsx             # Post component
│   ├── BottomNav.jsx            # Mobile bottom navigation
│   └── ProtectedLayout.jsx      # Auth wrapper
│
├── hooks/
│   └── useAuth.js               # Authentication hook
│
├── lib/
│   ├── supabase/                # Supabase client setup
│   ├── ai/generate-image.js     # AI image generation
│   ├── auth.js                  # Auth utilities
│   ├── email.js                 # Email templates
│   └── utils.js                 # Helper functions
│
├── public/
│   └── assets/                  # Images and icons
│
└── Configuration Files
    ├── package.json             # Dependencies & scripts
    ├── next.config.js           # Next.js config
    ├── jsconfig.json            # Path aliases
    ├── tailwind.config.js       # Tailwind setup
    └── capacitor.config.ts      # Mobile app config
```

## Key Technologies

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Database**: PostgreSQL (Neon)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **AI Generation**: Google Gemini API
- **Mobile**: Capacitor (iOS/Android)
- **State Management**: Zustand

## Database Schema

### Key Tables:
- **users** - User accounts and profiles
- **posts** - User posts/feed content
- **comments** - Post comments
- **likes** - Post/comment likes
- **follows** - User relationships
- **notifications** - User notifications
- **credits** - User credit balance
- **referrals** - Referral tracking
- **sessions** - Auth sessions
- **accounts** - OAuth provider accounts

For full schema, check your Supabase dashboard or run:
```bash
npm run setup-db
```

## Common API Endpoints

```
POST   /api/auth/signin              # Login
POST   /api/auth/signup              # Register
POST   /api/posts                    # Create post
GET    /api/posts                    # Get feed
PUT    /api/posts/[id]               # Update post
DELETE /api/posts/[id]               # Delete post
POST   /api/upload                   # Upload files
POST   /api/credits/deduct           # Use credits
GET    /api/credits/balance          # Check balance
GET    /api/notifications            # Get notifications
POST   /api/follows/toggle           # Follow/unfollow user
```

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Self-Hosted
```bash
# Build production bundle
npm run build

# Start production server
npm start
```

**Environment variables needed on production server:**
- All variables from `.env.local`
- Database must be accessible from server

## Testing Demo Account

Use these credentials to test authentication:
- **Email**: demo@appgen.com
- **Password**: demo1234

## Troubleshooting

### "Cannot find module" errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database connection fails
- Check `DATABASE_URL` is correct
- Ensure database is accessible from your network
- Check credentials and SSL settings

### Supabase auth not working
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check Supabase project settings
- Ensure auth provider is enabled (if using OAuth)

### Port 3000 already in use
```bash
# Use different port
PORT=3001 npm run dev
```

## Building for Mobile (Capacitor)

```bash
# Build web assets
npm run build

# Add platforms
npx cap add android
npx cap add ios

# Sync changes
npx cap sync

# Open in Android Studio / Xcode
npx cap open android
npx cap open ios
```

## Support & Documentation

- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **Tailwind**: https://tailwindcss.com/docs
- **Capacitor**: https://capacitorjs.com/docs

## Notes

- This is a mobile-first Capacitor app (touch-friendly, full-width design)
- All pages use `'use client'` for client-side rendering
- Database queries use PostgreSQL with the `postgres` npm package
- Authentication is handled via Supabase (no custom auth server needed)
- AI features require valid Google Gemini API key
- All sensitive keys must be in `.env` (never commit to git)

---

**Created**: 2024  
**Project**: Flovia - AI-Powered Creative Platform
