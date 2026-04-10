import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth.store.js';
import { 
  Users, 
  Zap, 
  Coins, 
  TrendingUp, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { session } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch admin stats');
      setStats(data.data);
    } catch (err) {
      console.error('Admin stats error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-indigo-500',
      trend: '+12%',
    },
    {
      label: 'Total Rewrites',
      value: stats?.totalRewrites || 0,
      icon: Zap,
      color: 'bg-purple-500',
      trend: '+24%',
    },
    {
      label: 'Active Credits',
      value: stats?.activeCredits?.toLocaleString() || 0,
      icon: Coins,
      color: 'bg-emerald-500',
      trend: '-2%',
    },
  ];

  if (loading && !stats) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3" />
              Admin Portal
            </div>
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">System Overview</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Real-time health and performance metrics of HumanizeAI platform.</p>
        </div>

        <button 
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-[40px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 shadow-sm relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${card.color} opacity-[0.03] rounded-bl-full group-hover:scale-110 transition-transform`} />
            
            <div className="flex items-center justify-between mb-6">
              <div className={`w-14 h-14 rounded-2xl ${card.color} bg-opacity-10 flex items-center justify-center text-white`}>
                <div className={`w-full h-full rounded-2xl ${card.color} flex items-center justify-center shadow-lg shadow-${card.color.split('-')[1]}-500/20`}>
                  <card.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase">
                <TrendingUp className="w-3 h-3" />
                {card.trend}
              </div>
            </div>

            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">{card.label}</p>
            <div className="flex items-end gap-2">
               <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{card.value}</h3>
               <ArrowUpRight className="w-5 h-5 text-emerald-500 mb-1" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Placeholder for charts/recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="p-10 rounded-[48px] bg-slate-100/50 dark:bg-white/[0.02] border-2 border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center mb-6 shadow-sm">
               <TrendingUp className="w-8 h-8 text-indigo-500" />
            </div>
            <h4 className="text-lg font-black dark:text-white mb-2">Usage Trends</h4>
            <p className="text-sm text-slate-500 max-w-xs font-medium">Chart visualization for platform growth and credit consumption patterns coming soon.</p>
         </div>
         <div className="p-10 rounded-[48px] bg-slate-100/50 dark:bg-white/[0.02] border-2 border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center mb-6 shadow-sm">
               <RefreshCw className="w-8 h-8 text-purple-500" />
            </div>
            <h4 className="text-lg font-black dark:text-white mb-2">Recent Events</h4>
            <p className="text-sm text-slate-500 max-w-xs font-medium">Global activity log including signups and large transactions will appear here.</p>
         </div>
      </div>
    </div>
  );
}
