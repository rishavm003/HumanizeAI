# Humanize AI - Premium Text Humanizer

Humanize AI is a powerful full-stack platform designed to transform AI-generated content into natural, human-like text that bypasses AI detectors while maintaining perfect original meaning.

## 🚀 Features

- **Advanced Humanization**: Powered by Groq LLM for lightning-fast, high-quality rewrites.
- **Vibrant UI/UX**: Premium glassmorphic design with light/dark mode support and smooth animations using Framer Motion.
- **Credit System**: Automated monthly credit resets and Stripe integration for seamless balance management.
- **Admin Dashboard**: Comprehensive user management and manual credit adjustment tools.
- **Production Ready**: Fully configured for single-project deployment on Vercel.

## 🛠️ Project Structure

- `api/`: Vercel-ready serverless function entry point.
- `backend/`: Express.js backend for core business logic and database management.
- `frontend/`: React + Vite frontend for the premium user experience.
- `vercel.json`: Deployment and routing configuration.

## 💻 Local Development

### 1. Prerequisites
- Node.js (v18+)
- Supabase Account
- Groq API Key
- Redis Instance (for rate limiting)

### 2. Setup
Clone the repository and install all dependencies:
```bash
npm run install:all
```

### 3. Environment Variables
Create `.env` files in both the `backend/` and `frontend/` directories using the provided templates (ensure no sensitive keys are committed).

### 4. Run the App
Start both the backend and frontend simultaneously:
```bash
npm run dev
```
The app will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

## 🚢 Deployment

This project is optimized for **Vercel**. 

1. Connect your GitHub repository to Vercel.
2. Ensure the **Root Directory** is set to `./`.
3. Set the **Build Command** to `npm run build` and **Output Directory** to `frontend/dist`.
4. Configure all environment variables in the Vercel dashboard.

## 🛡️ Security & Scalability

- **OAuth 2.0**: Integrated with Supabase Auth for secure Google and email logins.
- **Atomic Transactions**: Credit adjustments use database-level atomic functions to prevent race conditions.
- **Serverless Edge**: High-performance routing and static file serving via Vercel Edge.

---

Built with ❤️ by Humanize AI Team.