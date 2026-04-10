import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Shield, 
  Settings as SettingsIcon, 
  CreditCard, 
  Bell, 
  ShieldCheck, 
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Zap,
  LogOut,
  ChevronRight,
  Sparkles,
  Lock,
  Trash2,
  History,
  BarChart3,
  ToggleLeft as Toggle,
  Activity,
  Globe,
  Database
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store.js';
import { supabase } from '../lib/supabase.js';

export default function SettingsPage() {
  const { user, session, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [statsData, setStatsData] = useState({
    words_humanized: '0',
    total_rewrites: 0,
    success_rate: '99.9%',
    time_saved: '0m',
    trends: [],
    toneDistribution: []
  });
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Form states
  const [passwords, setPasswords] = useState({ current: '', next: '' });
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStats();
  }, [session]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/stats`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setStatsData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.next
      });
      
      if (error) throw error;
      setMessage('Password updated successfully!');
      setPasswords({ current: '', next: '' });
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleNotificationToggle = async (key, value) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/profile/notifications`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ [key]: value }),
      });
    } catch (error) {
      console.error('Failed to update notifications:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you absolutely sure? This action is permanent and cannot be undone.')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        logout();
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  const stats = [
    { label: 'Words Humanized', value: statsData.words_humanized, icon: <Sparkles className="w-5 h-5 text-indigo-500" /> },
    { label: 'Success Rate', value: statsData.success_rate, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" /> },
    { label: 'Time Saved', value: statsData.time_saved, icon: <Zap className="w-5 h-5 text-amber-500" /> },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="mb-12">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your account preferences and view usage statistics.</p>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-10">
        
        {/* Navigation Tabs */}
        <div className="space-y-2">
          {[
            { id: 'profile', label: 'Profile Settings', icon: User },
            { id: 'security', label: 'Security & Privacy', icon: Shield },
            { id: 'usage', label: 'Usage & Analytics', icon: SettingsIcon },
            { id: 'notifications', label: 'Notifications', icon: Bell },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
          
          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-white/5">
            <button 
              onClick={() => logout()}
              className="w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-500/5 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-8">
          
          {/* Active Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Profile Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/20 rounded-[32px] p-8 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] grayscale transition-all group-hover:opacity-10 pointer-events-none">
                    <User className="w-32 h-32" />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 relative z-10">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-black text-2xl">
                      {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">{user?.user_metadata?.full_name || 'Premium User'}</h3>
                      <p className="text-slate-500 font-medium">{user?.email}</p>
                      <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-[10px] font-black tracking-widest text-emerald-500 uppercase">
                        <CheckCircle2 className="w-3 h-3" /> Verified Member
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6 relative z-10">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account ID</label>
                       <p className="text-sm font-bold font-mono text-slate-600 dark:text-slate-300 break-all bg-slate-50 dark:bg-white/5 p-3 rounded-xl">{user?.id}</p>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Join Date</label>
                       <p className="text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-3 rounded-xl">
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'April 9, 2026'}
                       </p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {stats.map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-white/20 shadow-sm transition-all hover:border-indigo-500/30 group">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/[0.05] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          {stat.icon}
                       </div>
                       <p className="text-2xl font-black leading-none mb-1">{stat.value}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Subscriptions Mini-Card */}
                <div className="bg-indigo-600 rounded-[32px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-indigo-600/20">
                   <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none transition-transform group-hover:scale-150 duration-700" />
                   
                   <div className="flex items-center justify-between mb-6 relative z-10">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-indigo-200">Current Plan</p>
                        <h4 className="text-3xl font-black">Pro Creator</h4>
                      </div>
                      <div className="text-4xl font-black opacity-20"><CreditCard className="w-12 h-12" /></div>
                   </div>

                   <p className="text-indigo-100 text-sm font-medium mb-8 relative z-10 max-w-sm">
                      You are utilizing 150 high-quality monthly credits. Resetting in 12 days.
                   </p>

                   <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
                         <span className="text-xs font-black uppercase tracking-widest">Plan Active</span>
                      </div>
                      <Link to="/app/billing" className="px-6 py-2.5 rounded-xl bg-white text-indigo-600 text-xs font-black hover:scale-105 transition-all flex items-center gap-2">
                         Manage Plan <ChevronRight className="w-3 h-3" />
                      </Link>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Password Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/20 rounded-[32px] p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black">Change Password</h3>
                      <p className="text-xs text-slate-500 font-medium tracking-tight">Ensure your account is using a long, random password.</p>
                    </div>
                  </div>

                  <form onSubmit={handlePasswordUpdate} className="grid gap-6 max-w-md">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Password</label>
                       <input 
                         type="password" 
                         required
                         value={passwords.current}
                         onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                         placeholder="••••••••" 
                         className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Password</label>
                       <input 
                         type="password" 
                         required
                         value={passwords.next}
                         onChange={(e) => setPasswords({...passwords, next: e.target.value})}
                         placeholder="••••••••" 
                         className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                       />
                    </div>
                    {message && (
                      <p className={`text-xs font-bold ${message.startsWith('Error') ? 'text-red-500' : 'text-emerald-500'}`}>
                        {message}
                      </p>
                    )}
                    <button 
                      type="submit"
                      disabled={updating}
                      className="px-8 py-4 rounded-2xl bg-indigo-600 text-white text-sm font-black shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {updating ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>

                {/* Security Log */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-white/20">
                      <div className="flex items-center gap-3 mb-6">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        <h4 className="text-sm font-black uppercase tracking-widest">Two-Factor Auth</h4>
                      </div>
                      <p className="text-sm text-slate-500 mb-6 font-medium">Add an extra layer of security to your account by enabling 2FA.</p>
                      <Link to="/app/settings/security/2fa" className="text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-1">
                        Enable Now <ChevronRight className="w-3 h-3" />
                      </Link>
                   </div>
                   <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-white/20">
                      <div className="flex items-center gap-3 mb-6">
                        <Smartphone className="w-5 h-5 text-indigo-500" />
                        <h4 className="text-sm font-black uppercase tracking-widest">Session Control</h4>
                      </div>
                      <p className="text-sm text-slate-500 mb-6 font-medium">Manage your active sessions across different devices and platforms.</p>
                      <Link to="/app/settings/security/sessions" className="text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-1">
                        View Sessions <ChevronRight className="w-3 h-3" />
                      </Link>
                   </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-8 border-t border-slate-100 dark:border-white/5">
                   <div className="bg-red-500/5 rounded-[32px] p-8 border border-red-500/10">
                      <h4 className="text-red-500 font-black mb-2">Danger Zone</h4>
                      <p className="text-slate-500 text-sm mb-6 font-medium">Once you delete your account, there is no going back. Please be certain.</p>
                      <button 
                        onClick={handleDeleteAccount}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white text-xs font-black shadow-lg shadow-red-600/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        <Trash2 className="w-4 h-4" /> Delete Account
                      </button>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'usage' && (
              <motion.div
                key="usage" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Usage Chart area */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/20 rounded-[32px] p-8 shadow-sm">
                   <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xl font-black">Usage Trends</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Past 7 Days Output</p>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100 dark:border-white/5">
                        <Activity className="w-3 h-3" /> Real-time
                      </div>
                   </div>

                    <div className="h-48 w-full flex items-end gap-3 px-4">
                      {statsData.trends.length > 0 ? statsData.trends.map((item, i) => {
                        const maxCount = Math.max(...statsData.trends.map(t => t.count), 1);
                        const height = Math.max((item.count / maxCount) * 100, 5);
                        return (
                          <div key={item.date} className="flex-1 flex flex-col items-center gap-2 h-full group">
                             <div className="w-full flex-1 relative flex items-end justify-center">
                                {/* Tooltip on hover */}
                                <div className="absolute bottom-full mb-2 px-2 py-1 bg-slate-800 text-white text-[8px] font-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                   {item.count} words
                                </div>
                                <motion.div 
                                  initial={{ height: 0 }} 
                                  animate={{ height: `${height}%` }}
                                  className={`w-full max-w-[24px] rounded-t-lg transition-all duration-300 group-hover:bg-indigo-500 ${i === 6 ? 'bg-indigo-600 shadow-[0_-4px_10px_rgba(79,70,229,0.3)]' : 'bg-indigo-600/30'}`} 
                                />
                             </div>
                             <span className="text-[10px] font-black text-slate-400 whitespace-nowrap">
                               {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                             </span>
                          </div>
                        );
                      }) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest opacity-50">
                           No activity recorded yet
                        </div>
                      )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/20 rounded-[32px] p-8 shadow-sm">
                      <div className="flex items-center gap-3 mb-6 text-emerald-500">
                        <BarChart3 className="w-5 h-5" />
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Tone Distribution</h4>
                      </div>
                      <div className="space-y-4">
                         {(statsData.toneDistribution.length > 0 ? statsData.toneDistribution : [
                           { label: 'Natural', percent: 0, color: 'bg-emerald-500' },
                           { label: 'Professional', percent: 0, color: 'bg-indigo-500' },
                           { label: 'Creative', percent: 0, color: 'bg-amber-500' },
                         ]).map(tone => (
                           <div key={tone.label} className="space-y-1.5">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                 <span className="text-slate-500">{tone.label}</span>
                                 <span>{tone.percent}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                 <motion.div initial={{ width: 0 }} animate={{ width: `${tone.percent}%` }} className={`h-full ${tone.label === 'Natural' ? 'bg-emerald-500' : tone.label === 'Professional' ? 'bg-indigo-500' : 'bg-amber-500'}`} />
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/20 rounded-[32px] p-8 shadow-sm">
                      <div className="flex items-center gap-3 mb-6 text-indigo-500">
                        <Database className="w-5 h-5" />
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Storage Metrics</h4>
                      </div>
                      <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 mb-4">
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">History Limit</span>
                            <span className="text-xs font-bold">1.2 GB / 5 GB</span>
                         </div>
                         <div className="h-2 bg-indigo-500/10 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: '24%' }} className="h-full bg-indigo-600" />
                         </div>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Storing {statsData.total_rewrites || 0} rewrites across all sessions. Automatic archiving disabled.
                      </p>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Notification Group */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/20 rounded-[32px] p-8 shadow-sm">
                   <h3 className="text-xl font-black mb-6">Notification Center</h3>
                   
                   <div className="space-y-6">
                      {[
                        { id: 'notify_usage', title: 'Usage Updates', desc: 'Notify me when I reach 80% and 100% of my credits.', icon: Zap, status: user?.notify_usage ?? true },
                        { id: 'notify_marketing', title: 'Marketing Emails', desc: 'Tips, features, and offers to help you write better.', icon: Mail, status: user?.notify_marketing ?? false },
                        { id: 'notify_security', title: 'Security Alerts', desc: 'Critical alerts about your account and new logins.', icon: ShieldCheck, status: user?.notify_security ?? true },
                        { id: 'notify_status', title: 'Service Status', desc: 'Updates on server downtime or maintenance.', icon: Globe, status: user?.notify_status ?? true },
                      ].map((item) => (
                        <div key={item.title} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 group transition-all hover:border-indigo-500/30">
                           <div className="flex gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                                 <item.icon className="w-5 h-5" />
                              </div>
                              <div>
                                 <h4 className="text-sm font-black text-slate-900 dark:text-white">{item.title}</h4>
                                 <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                              </div>
                           </div>
                           <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                defaultChecked={item.status} 
                                onChange={(e) => handleNotificationToggle(item.id, e.target.checked)}
                                className="sr-only peer" 
                              />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                           </label>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-indigo-600/5 border border-indigo-600/10 rounded-[32px] p-8">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                         <Bell className="w-6 h-6 animate-bounce" />
                      </div>
                      <div>
                         <h4 className="font-black">Browser Notifications</h4>
                         <p className="text-xs text-slate-500 font-medium">Stay updated even when the app is closed.</p>
                      </div>
                   </div>
                   <button className="px-6 py-3 rounded-xl bg-indigo-600 text-white text-xs font-black shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all">
                      Configure Web Push
                   </button>
                </div>
              </motion.div>
            )}

            {false && activeTab !== 'profile' && activeTab !== 'security' && activeTab !== 'usage' && activeTab !== 'notifications' && (
              <motion.div 
                key="other" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="py-20 text-center bg-slate-50/50 dark:bg-white/[0.02] rounded-[40px] border border-slate-100 dark:border-white/5"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mx-auto mb-6">
                   <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black mb-1">Coming Soon</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">We're building advanced {activeTab} features right now. Stay tuned!</p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
