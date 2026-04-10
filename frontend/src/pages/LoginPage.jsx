import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store.js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles,
  Zap,
  AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/app');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const result = await loginWithGoogle();
    
    if (!result.success) {
      setError(result.error);
    }
    // OAuth redirects automatically
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#020617] overflow-hidden relative py-12 px-4 transition-colors duration-500">
      
      {/* Premium Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[5%] w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: [0, -60, 0],
            y: [0, -40, 0],
            rotate: [0, -15, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[5%] w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-[100px]"
        />
        
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full relative z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12, delay: 0.2 }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 mb-3"
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">HumanizeAI</h1>
        </div>

        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl p-6 sm:p-8 rounded-[32px] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.3)] border border-white dark:border-white/10 relative overflow-hidden">
          {/* Inner Glow Effect */}
          <div className="absolute -top-16 -left-16 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-6">
              Continue your journey to undetectable content.
            </p>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 mb-4"
                >
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Email */}
                <div className="group">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 ml-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email" autoComplete="email" required
                      className="w-full pl-10 pr-4 py-3 bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-medium"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="group">
                  <div className="flex items-center justify-between mb-1.5 ml-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Password</label>
                    <Link to="/forgot-password" size="sm" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="password" required
                      className="w-full pl-10 pr-4 py-3 bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-medium"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[16px] text-sm font-black shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group mt-2"
              >
                {loading ? (
                  <Zap className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">Or use social</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="mt-4 w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[16px] text-xs font-bold text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                New here?{' '}
                <Link to="/signup" className="font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors inline-flex items-center gap-1 group">
                  Create account
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
