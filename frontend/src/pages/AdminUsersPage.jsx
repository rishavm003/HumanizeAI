import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth.store.js';
import { 
  Users, 
  Search, 
  MoreVertical, 
  Shield, 
  Coins, 
  Loader2, 
  AlertCircle,
  X,
  Plus,
  Minus,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminUsersPage() {
  const { session } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Credit Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState(10);
  const [adjustmentReason, setAdjustmentReason] = useState('Manual admin adjustment');
  const [updatingCredits, setUpdatingCredits] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch users');
      setUsers(data.data || []);
      setTotalUsers(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustCredits = async () => {
    if (!selectedUser || updatingCredits) return;
    
    setUpdatingCredits(true);
    setSuccessMessage('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${selectedUser.id}/credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          amount: adjustmentAmount,
          reason: adjustmentReason
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update credits');

      // Update local state
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, credits_remaining: data.data.newBalance } 
          : u
      ));
      
      setSuccessMessage(`Added ${adjustmentAmount} credits successfully!`);
      setTimeout(() => {
        setSelectedUser(null);
        setSuccessMessage('');
        setAdjustmentAmount(10);
      }, 1500);
      
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingCredits(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">User Management</h2>
           <p className="text-slate-500 dark:text-slate-400 font-medium">Manage user accounts, monitor credits, and override balances.</p>
        </div>
        
        <div className="relative w-full md:w-80 group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
           <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-medium text-sm"
           />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
             <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
             <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading User Base...</p>
          </div>
        ) : error ? (
           <div className="p-20 text-center text-red-500 flex flex-col items-center gap-3">
              <AlertCircle className="w-10 h-10 opacity-50" />
              <p className="font-bold">{error}</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">User Details</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Plan</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Credits</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Joined</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredUsers.map((user, i) => (
                  <motion.tr 
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-white/10 dark:to-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 font-black text-xs">
                          {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 dark:text-white truncate">{user.full_name || 'Anonymous User'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                         user.plans?.name === 'Unlimited' ? 'bg-purple-500/10 text-purple-500' :
                         user.plans?.name === 'Pro' ? 'bg-indigo-500/10 text-indigo-500' :
                         'bg-slate-500/10 text-slate-500'
                       }`}>
                         {user.plans?.name || 'Free'}
                       </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <span className={`text-sm font-black ${user.credits_remaining < 5 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                         {user.credits_remaining}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-1.5 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold">{new Date(user.created_at).toLocaleDateString()}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button 
                         onClick={() => setSelectedUser(user)}
                         className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-transparent hover:border-indigo-500/20"
                       >
                          <Coins className="w-4 h-4" />
                       </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Credit Adjustment Modal */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !updatingCredits && setSelectedUser(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-950 rounded-[48px] border border-slate-200 dark:border-white/10 shadow-2xl z-[101] overflow-hidden"
            >
              <div className="p-8">
                 <div className="flex justify-between items-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                       <Coins className="w-6 h-6" />
                    </div>
                    <button onClick={() => setSelectedUser(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400"><X className="w-5 h-5" /></button>
                 </div>

                 <h3 className="text-2xl font-black tracking-tight mb-2">Adjust User Credits</h3>
                 <p className="text-sm text-slate-500 font-medium mb-8">Inject or remove credits from <span className="text-slate-900 dark:text-white font-bold">{selectedUser.email}</span></p>

                 <div className="space-y-6">
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Amount to Add (or subtract)</label>
                       <div className="flex items-center gap-4">
                          <button 
                            onClick={() => setAdjustmentAmount(prev => prev - 10)}
                            className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all font-black"
                          >
                             <Minus className="w-5 h-5" />
                          </button>
                          <input 
                             type="number" 
                             value={adjustmentAmount}
                             onChange={(e) => setAdjustmentAmount(parseInt(e.target.value) || 0)}
                             className="flex-1 h-12 bg-transparent text-center text-2xl font-black focus:outline-none"
                          />
                          <button 
                            onClick={() => setAdjustmentAmount(prev => prev + 10)}
                            className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-emerald-500/10 hover:text-emerald-500 transition-all font-black"
                          >
                             <Plus className="w-5 h-5" />
                          </button>
                       </div>
                    </div>

                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Reason for adjustment</label>
                       <input 
                         type="text" 
                         value={adjustmentReason}
                         onChange={(e) => setAdjustmentReason(e.target.value)}
                         className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 focus:outline-none focus:border-indigo-500 transition-all font-medium text-sm"
                       />
                    </div>
                 </div>

                 <div className="mt-10">
                    <button 
                       onClick={handleAdjustCredits}
                       disabled={updatingCredits || !adjustmentAmount}
                       className={`w-full py-4 rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl transition-all flex items-center justify-center gap-3 ${
                         successMessage ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                       }`}
                    >
                       {updatingCredits ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                        successMessage ? <CheckCircle2 className="w-5 h-5" /> : 
                        'Update Balance'}
                       {successMessage || 'Update Balance'}
                    </button>
                 </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
