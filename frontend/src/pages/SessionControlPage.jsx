import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  Monitor, 
  Globe, 
  ShieldAlert, 
  Clock, 
  Trash2, 
  ChevronLeft,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store.js';
import UAParser from 'ua-parser-js';

export default function SessionControlPage() {
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);
  const [browserInfo, setBrowserInfo] = useState(null);

  useEffect(() => {
    // Detect current browser info
    const parser = new UAParser();
    const result = parser.getResult();
    setBrowserInfo(result);
    
    // Initial tracking of current session
    trackCurrentSession(result);
    
    // Fetch all sessions
    fetchSessions();
  }, [session]);

  const trackCurrentSession = async (info) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/profile/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          session_id: session?.user?.id + '-' + (session?.expires_at || Date.now()), // Simple surrogate or real session ID
          user_agent: navigator.userAgent,
          browser_name: info.browser.name,
          os_name: info.os.name,
          ip_address: 'Current' // Backend can infer IP
        }),
      });
    } catch (error) {
       console.error('Failed to track session:', error);
    }
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/sessions`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setSessions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutOthers = async () => {
    if (!window.confirm('This will log you out from all other devices. Continue?')) return;
    
    setRevoking(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/sessions/others`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
          'X-Session-ID': session?.user?.id + '-' + (session?.expires_at || Date.now())
        },
      });
      const data = await response.json();
      if (data.success) {
        fetchSessions();
      }
    } catch (error) {
      console.error('Failed to revoke sessions:', error);
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-10">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
           <div>
              <button 
                onClick={() => navigate('/app/settings')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-4 group"
              >
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span className="text-sm font-bold">Back to Settings</span>
              </button>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">Session Control</h2>
              <p className="text-slate-500 font-medium">Manage your active sessions and protect your account from unauthorized access.</p>
           </div>
           <button 
             onClick={handleSignOutOthers}
             disabled={revoking || sessions.length <= 1}
             className="px-6 py-3 rounded-2xl bg-red-600 text-white text-xs font-black shadow-lg shadow-red-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
           >
             {revoking ? 'Revoking...' : 'Sign out other devices'}
           </button>
        </div>

        {/* Info Alert */}
        <div className="mb-10 p-6 rounded-[32px] bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-150 transition-transform duration-1000">
              <ShieldAlert className="w-24 h-24" />
           </div>
           <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Globe className="w-8 h-8" />
           </div>
           <div className="flex-1">
              <h4 className="text-xl font-black mb-1">Account Security Tip</h4>
              <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                If you see a device or location you don't recognize, we recommend revoking that session immediately and changing your password.
              </p>
           </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
           {loading ? (
             <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest">Loading active devices...</p>
             </div>
           ) : sessions.length > 0 ? (
             sessions.map((s) => {
               const isCurrent = s.user_agent === navigator.userAgent;
               return (
                 <motion.div 
                   key={s.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className={`p-6 rounded-[32px] bg-white dark:bg-slate-900 border transition-all ${
                     isCurrent ? 'border-indigo-600 shadow-xl shadow-indigo-600/5' : 'border-slate-100 dark:border-white/10'
                   }`}
                 >
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                          isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-white/5 text-slate-400'
                        }`}>
                          {s.os_name?.toLowerCase().includes('windows') || s.os_name?.toLowerCase().includes('mac') ? <Monitor className="w-7 h-7" /> : <Smartphone className="w-7 h-7" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                             <h4 className="text-lg font-black text-slate-900 dark:text-white">
                                {s.os_name || 'Unknown OS'} • {s.browser_name || 'Unknown Browser'}
                             </h4>
                             {isCurrent && (
                               <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-[8px] font-black text-white uppercase tracking-widest">This Device</span>
                             )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                             <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> {s.ip_address || 'Hidden IP'}</span>
                             <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Last Active: {new Date(s.last_active).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      {!isCurrent && (
                        <button className="p-4 rounded-2xl hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20 group">
                           <Trash2 className="w-5 h-5 group-active:scale-90 transition-transform" />
                        </button>
                      )}
                   </div>
                 </motion.div>
               );
             })
           ) : (
             <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[40px] border border-dashed border-slate-200 dark:border-white/10">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 mx-auto mb-6">
                   <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black mb-1">No active sessions found</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">This is unusual. Try refreshing the page or logging in again.</p>
             </div>
           )}
        </div>

        {/* Footer actions */}
        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-3 text-slate-400">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-widest">Your account is secure</span>
           </div>
           <button 
             onClick={() => window.location.href = '/'}
             className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-xs font-black hover:bg-indigo-600 hover:text-white transition-all"
           >
              Global Logout <LogOut className="w-4 h-4" />
           </button>
        </div>

      </div>
    </div>
  );
}
