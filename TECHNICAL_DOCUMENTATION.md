# HumanizeAI - Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Backend Documentation](#backend-documentation)
4. [Frontend Documentation](#frontend-documentation)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [Authentication Flow](#authentication-flow)
8. [Credit System](#credit-system)
9. [Deployment Guide](#deployment-guide)

---

## Project Overview

**HumanizeAI** is a SaaS application that converts AI-generated text into natural, human-like writing using LLM adapters (Groq, OpenAI, Anthropic).

### Tech Stack
- **Backend**: Node.js (ES6 modules), Express.js
- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Database**: PostgreSQL (Supabase)
- **Cache**: Redis (optional, with memory fallback)
- **Authentication**: Supabase Auth (JWT-based)
- **Payments**: Stripe (planned for Part 6)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│  │ LandingPage  │  │  EditorPage  │  │  History/Settings/etc  │ │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘ │
│                                                                  │
│  State: Zustand (auth.store.js, theme.store.js)                  │
│  API: Axios client with interceptors                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP/JSON
┌─────────────────────────┴───────────────────────────────────────┐
│                      API GATEWAY (Express)                       │
│  Port: 3002 (backend)                                           │
│                                                                  │
│  Middleware:                                                     │
│  ├── CORS                                                        │
│  ├── Helmet (security)                                           │
│  ├── Cookie Parser                                               │
│  ├── Error Handler                                               │
│  └── Auth Guard (JWT validation)                                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐ ┌────────▼────────┐ ┌────▼──────┐
│    Auth      │ │     Credits     │ │  Rewrite  │
│   Routes     │ │     Routes      │ │   Routes  │
└───────┬──────┘ └────────┬────────┘ └─────┬─────┘
        │                 │                 │
┌───────▼─────────────────▼─────────────────▼──────┐
│              SERVICES LAYER                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │CreditService│  │HumanizerSvc │  │StripeSvc│ │
│  └─────────────┘  └─────────────┘  └─────────┘ │
│         │                │                      │
│  ┌──────▼──────┐  ┌─────▼──────┐               │
│  │   Redis     │  │  Adapters  │               │
│  │   Cache     │  │ (Groq/etc) │               │
│  └─────────────┘  └────────────┘               │
└────────────────────┬─────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────┐
│              DATA LAYER (Supabase)                 │
│  PostgreSQL + Row Level Security (RLS)           │
└──────────────────────────────────────────────────┘
```

---

## Backend Documentation

### File Structure

```
backend/
├── src/
│   ├── adapters/
│   │   ├── GroqAdapter.js          # Groq/Mistral LLM integration
│   │   └── index.js                 # Adapter factory
│   ├── db/
│   │   └── migrations/              # SQL schema files (001-006)
│   ├── jobs/
│   │   └── creditReset.js          # Monthly credit reset cron
│   ├── lib/
│   │   ├── redis.js                # Redis client + cache helpers
│   │   └── supabase.js             # Supabase client
│   ├── middleware/
│   │   ├── authGuard.js            # JWT auth middleware
│   │   └── errorHandler.js         # Global error handler
│   ├── routes/
│   │   ├── auth.js                 # Login/signup/logout
│   │   ├── credits.js              # Balance, history, top-up
│   │   ├── profile.js              # User profile CRUD
│   │   └── rewrite.js              # Text humanization
│   ├── services/
│   │   ├── CreditService.js        # Credit operations + caching
│   │   └── HumanizerService.js     # LLM orchestration
│   └── index.js                    # Express app entry
├── .env                            # Environment variables
└── package.json                    # Dependencies + scripts
```

### Key Backend Files

#### 1. `src/index.js` - Application Entry

```javascript
// Dependencies
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import creditsRoutes from './routes/credits.js';
import rewriteRoutes from './routes/rewrite.js';

// Jobs
import { startCreditResetJob } from './jobs/creditReset.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/credits', creditsRoutes);
app.use('/api/rewrite', rewriteRoutes);

// Start cron job
startCreditResetJob();

app.listen(PORT, () => console.log(`Server on port ${PORT}`));
```

#### 2. `src/services/CreditService.js`

**Purpose**: Manages user credit balances with Redis caching

**Key Methods**:
- `getBalance(userId)`: Returns cached or DB balance
- `checkSufficientCredits(userId, required)`: Boolean check
- `deductCredit(userId, rewriteId)`: Atomic deduction + transaction log
- `addCredits(userId, amount, reason)`: Add credits (top-up/reset)
- `resetMonthlyCredits(userId)`: Monthly allowance reset

**Flow**:
1. Check Redis cache (`credits:{userId}`)
2. Cache miss → Query Supabase `profiles.credits_remaining`
3. Write to Redis with 5-min TTL
4. Operations use PostgreSQL RPC for atomicity

#### 3. `src/adapters/GroqAdapter.js`

**Purpose**: Groq API integration for text humanization

**Model**: `mistral-saba-24b`

**Tone Mapping**:
```javascript
const toneMap = {
  casual: 'Rewrite casually, use contractions, friendly tone.',
  professional: 'Rewrite formally, clear and structured.',
  conversational: 'Rewrite in a natural, engaging conversational style.',
  academic: 'Rewrite in a precise and formal academic tone.'
};
```

**System Prompt**:
```
You are a human editor. Rewrite text naturally.
Keep the meaning EXACTLY the same. Do NOT add new information.
Avoid robotic phrases like "delve", "furthermore", "it is important to note".
Return ONLY the rewritten text, nothing else.
```

#### 4. `src/jobs/creditReset.js`

**Schedule**: `0 0 * * *` (Daily at midnight UTC)

**Logic**:
1. Query users where `billing_anniversary` = today
2. For each user:
   - Get plan's `monthly_credits`
   - Call `CreditService.resetMonthlyCredits(userId)`
3. Log summary (users reset, total credits distributed)

---

## Frontend Documentation

### File Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.js               # Axios instance + interceptors
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── AppLayout.jsx      # Dashboard shell
│   │   │   └── Sidebar.jsx        # Navigation + credits badge
│   │   ├── ProtectedRoute.jsx     # Auth guard
│   │   └── UI/
│   │       ├── CreditsBadge.jsx   # Sidebar credit display
│   │       ├── CreditsDisplay.jsx # Compact credit indicator
│   │       ├── ThemeToggle.jsx    # Dark/light mode toggle
│   │       └── Toast.jsx          # Notification system
│   ├── lib/
│   │   └── supabase.js            # Supabase client
│   ├── pages/
│   │   ├── EditorPage.jsx         # Main text editor
│   │   ├── HistoryPage.jsx        # Rewrite history
│   │   ├── SettingsPage.jsx       # User preferences
│   │   ├── BillingPage.jsx        # Stripe billing
│   │   ├── LandingPage.jsx        # Marketing site
│   │   ├── LoginPage.jsx          # Auth forms
│   │   └── SignupPage.jsx
│   ├── store/
│   │   ├── auth.store.js          # Auth + credits state
│   │   └── theme.store.js         # Dark/light mode
│   ├── App.jsx                    # Router + theme
│   └── main.jsx                   # React entry
├── .env                           # Vite env variables
└── package.json
```

### State Management (Zustand)

#### `auth.store.js`

```javascript
{
  // Auth State
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  
  // Credits State
  credits: 0,
  plan: 'Free',
  monthlyAllowance: 10,
  
  // Actions
  initializeAuth(): Promise<void>
  login(email, password): Promise<void>
  signup(email, password, name): Promise<void>
  logout(): Promise<void>
  refreshCredits(): Promise<void>  // Fetch from API
}
```

#### `theme.store.js`

```javascript
{
  isDarkMode: boolean,
  toggleDarkMode(): void,
  setDarkMode(value): void
}
```

### Key Frontend Components

#### `EditorPage.jsx`

**Features**:
- Text input area (max 5000 chars)
- Tone selector (casual/professional/conversational/academic)
- Humanize button with loading state
- Output display with copy button
- **Real-time credit refresh** after humanize

**Flow**:
1. User enters text → selects tone
2. Click "Humanize" → `POST /api/rewrite`
3. API deducts credit → returns humanized text
4. On success → `authStore.refreshCredits()`
5. Sidebar `CreditsBadge` updates instantly

#### `CreditsBadge.jsx`

**Props**: None (uses auth store)

**Display**:
```
┌─────────────────────────┐
│  6  credits remaining   │  ← Yellow box (removed per user request)
│  Current Plan    Free   │
│  Monthly         10     │
│  Allowance     credits │
│                         │
│  Resets on the 1st...   │
│                         │
│  ┌─────────────────┐    │
│  │  Upgrade Plan   │    │
│  └─────────────────┘    │
│  ┌─────────────────┐    │
│  │  Refresh Balance│    │
│  └─────────────────┘    │
└─────────────────────────┘
```

---

## Database Schema

### Tables

#### 1. `profiles`

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  credits_remaining INTEGER DEFAULT 10,
  plan_id UUID REFERENCES plans(id),
  billing_anniversary DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**RLS Policies**:
- Users can read/update their own profile only

#### 2. `rewrites`

```sql
CREATE TABLE rewrites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  original_text TEXT NOT NULL,
  rewritten_text TEXT NOT NULL,
  tone TEXT DEFAULT 'casual',
  word_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. `plans`

```sql
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  monthly_credits INTEGER NOT NULL,
  price_cents INTEGER,
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Default plans:
-- Free: 10 credits/month
-- Pro: 100 credits/month
-- Enterprise: 500 credits/month
```

#### 4. `credit_transactions`

```sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  amount INTEGER NOT NULL,  -- positive = add, negative = deduct
  reason TEXT NOT NULL,     -- 'rewrite', 'topup', 'reset', 'bonus'
  rewrite_id UUID REFERENCES rewrites(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### PostgreSQL Functions (Atomic Operations)

```sql
-- Deduct credit with race condition protection
CREATE OR REPLACE FUNCTION deduct_credit(p_user_id UUID, p_rewrite_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  UPDATE profiles 
  SET credits_remaining = credits_remaining - 1
  WHERE id = p_user_id AND credits_remaining > 0
  RETURNING credits_remaining INTO new_balance;
  
  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;
  
  INSERT INTO credit_transactions (user_id, amount, reason, rewrite_id)
  VALUES (p_user_id, -1, 'rewrite', p_rewrite_id);
  
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql;
```

---

## API Reference

### Authentication

#### POST `/api/auth/login`
```json
// Request
{ "email": "user@example.com", "password": "password123" }

// Response
{
  "user": { "id": "...", "email": "...", "full_name": "..." },
  "session": { "access_token": "...", "refresh_token": "..." }
}
```

#### POST `/api/auth/signup`
```json
// Request
{ "email": "...", "password": "...", "fullName": "..." }

// Response
{ "message": "Signup successful. Please check your email." }
```

#### POST `/api/auth/logout`
```json
// Response
{ "message": "Logged out successfully" }
```

### Credits

#### GET `/api/credits`
**Auth Required**: Yes

```json
// Response
{
  "balance": 6,
  "plan": "free",
  "planName": "Free",
  "monthlyAllowance": 10
}
```

#### GET `/api/credits/history`
**Auth Required**: Yes

```json
// Response
{
  "transactions": [
    { "id": "...", "amount": -1, "reason": "rewrite", "created_at": "..." },
    { "id": "...", "amount": 10, "reason": "reset", "created_at": "..." }
  ],
  "cursor": "next_page_token"
}
```

#### POST `/api/credits/topup`
**Auth Required**: Yes

```json
// Request
{ "packageId": "pro_100" }

// Response
{
  "clientSecret": "pi_..._secret_..."
}
```

### Text Humanization

#### POST `/api/rewrite`
**Auth Required**: Yes

```json
// Request
{
  "text": "The quick brown fox jumps over the lazy dog.",
  "tone": "casual"
}

// Response
{
  "id": "rewrite_uuid",
  "originalText": "The quick brown fox jumps over the lazy dog.",
  "rewrittenText": "A speedy brown fox leaped right over this lazy dog.",
  "tone": "casual",
  "wordCount": 9,
  "creditsRemaining": 5
}
```

**Error Responses**:
- `400`: Missing text or invalid tone
- `402`: Insufficient credits
- `429`: Rate limit exceeded
- `500`: LLM service error

---

## Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Login   │────▶│ Supabase │────▶│   JWT    │────▶│ Frontend │
│  Form    │     │  Auth    │     │  Token   │     │  Store   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                        │
                           ┌────────────────────────────┘
                           │ Bearer Token
                           ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│  API     │◀────│  Auth    │◀────│  Redis   │
│  Route   │     │  Guard   │     │  Check   │
└──────────┘     └──────────┘     └──────────┘
```

### Token Flow
1. User logs in → Supabase returns JWT (access_token + refresh_token)
2. Frontend stores in memory (Zustand store)
3. Axios interceptor adds `Authorization: Bearer {token}` to API calls
4. Backend `authGuard` validates JWT via Supabase
5. On expiry → Use refresh_token to get new access_token

---

## Credit System

### Credit Deduction Flow

```
┌─────────────┐
│ User clicks │
│  Humanize   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ 1. Check Cache  │◀── Redis: GET credits:{userId}
│    (Redis)      │
└────────┬────────┘
         │
    Cache Miss
         │
         ▼
┌─────────────────┐
│ 2. Check DB     │◀── Supabase: SELECT credits_remaining
│    (Supabase)   │
└────────┬────────┘
         │
    Sufficient?
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│  YES   │ │   NO   │
└───┬────┘ └────┬───┘
    │           │
    ▼           ▼
┌─────────┐ ┌──────────┐
│ Atomic  │ │ Return   │
│ Deduct  │ │ 402 Error│
│ (RPC)   │ │          │
└───┬─────┘ └──────────┘
    │
    ▼
┌─────────────┐
│ 3. Invalidate│──▶ Redis: DEL credits:{userId}
│    Cache     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 4. Log Txn  │──▶ INSERT credit_transactions
│              │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 5. Call LLM │──▶ GroqAdapter.complete()
│              │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 6. Return   │──▶ Response with new balance
│    Response │
└─────────────┘
```

### Monthly Reset Flow

```
Cron (0 0 * * *)
       │
       ▼
┌─────────────┐
│ Find Users  │──▶ WHERE billing_anniversary = TODAY
│ to Reset    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ For Each    │
│   User:     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Get Plan    │──▶ plans.monthly_credits
│ Credits     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Add Credits │──▶ UPDATE profiles
│             │    SET credits_remaining += monthly_credits
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Log Reset   │──▶ INSERT credit_transactions
│ Transaction │    (reason='reset')
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Invalidate  │──▶ Redis: DEL credits:{userId}
│ Cache       │
└─────────────┘
```

---

## Environment Variables

### Backend `.env`

```bash
# Server
PORT=3002
FRONTEND_URL=http://localhost:5173

# Supabase
SUPABASE_URL=https://qmkzsvbhfxzihxcmqdsi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_publishable_...

# Database
DATABASE_URL=postgresql://postgres:...@db.qmkzsvbhfxzihxcmqdsi.supabase.co:5432/postgres

# Groq
GROQ_API_KEY=gsk_...

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Stripe (Part 6)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Frontend `.env`

```bash
# API
VITE_API_URL=http://localhost:3002

# Supabase
VITE_SUPABASE_URL=https://qmkzsvbhfxzihxcmqdsi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# LLM
VITE_LLM_PROVIDER=groq
```

---

## Deployment Guide

### Prerequisites
- Node.js 18+
- Supabase account
- Redis (optional, for production)

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure .env files (copy from .env.example)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Run database migrations (via Supabase CLI or dashboard)

# 4. Start backend
cd backend && npm run dev

# 5. Start frontend (new terminal)
cd frontend && npm run dev

# 6. Open http://localhost:5173
```

### Production Deployment

#### Backend (Railway/Render/DO)
1. Push to GitHub
2. Connect to Railway/Render
3. Add environment variables
4. Deploy

#### Frontend (Vercel/Netlify)
1. Connect repo to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables
5. Deploy

#### Database (Supabase)
- Use Supabase hosted PostgreSQL
- Enable RLS policies
- Run migrations in order (001-006)

---

## Security Considerations

1. **Authentication**: JWT tokens, Supabase Auth
2. **Authorization**: RLS policies on all tables
3. **Input Validation**: Express-validator on all routes
4. **Rate Limiting**: Redis-based rate limiting
5. **CORS**: Restricted to FRONTEND_URL only
6. **Helmet**: Security headers
7. **Credit Protection**: Atomic PostgreSQL operations
8. **Credit Card Data**: Never stored (Stripe handles this)

---

## Monitoring & Logging

### Backend Logs
- Redis connection status
- Credit transaction logs
- API request logs
- Error stack traces

### Key Metrics
- Daily active users
- Credits consumed per day
- Humanization success rate
- Average response time

---

## Future Roadmap (Parts 6+)

### Part 6: Stripe Integration
- PaymentIntent for credit top-ups
- Webhook handlers for payment confirmation
- Subscription management

### Part 7: Enhanced Features
- Team/organization accounts
- API key for programmatic access
- Bulk text processing

### Part 8: Analytics
- Usage dashboards
- Credit consumption reports
- Export functionality

---

## Support & Troubleshooting

### Common Issues

**"Insufficient credits" error**
- Check `profiles.credits_remaining` in Supabase
- Verify credit reset job is running

**"Redis connection failed"**
- Redis is optional - app works without it
- Check REDIS_URL in .env

**"Groq API error"**
- Verify GROQ_API_KEY is set
- Check Groq dashboard for rate limits

---

*Document Version: 1.0*
*Last Updated: April 9, 2026*
*Author: Cascade AI*
