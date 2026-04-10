import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/auth.store.js';
import { 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  CreditCard, 
  ArrowRight,
  TrendingUp,
  History,
  AlertCircle
} from 'lucide-react';

export default function BillingPage() {
  const navigate = useNavigate();
  const { credits, session, refreshCredits, plan: userPlan } = useAuthStore();
  const [isLoading, setIsLoading] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    refreshCredits();
    fetchTransactions();
  }, [refreshCredits]);

  // Handle Stripe callback messages
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      alert('Payment successful! Your plan is being updated.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/transactions`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSelectPlan = async (planName) => {
    setIsLoading(planName);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/credits/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ planName }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Payment initiation failed');

      if (data.data?.url) {
        window.location.href = data.data.url;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(null);
    }
  };

  const plans = [
    {
      dbName: 'Free',
      name: 'Free Starter',
      priceCode: '0',
      credits: '10',
      features: ['Basic Engine', 'Standard Speed', 'Web Editor'],
      btnText: 'Current Plan',
      recommended: false,
    },
    {
      dbName: 'Pro',
      name: 'Pro Creator',
      priceCode: '9.99',
      credits: '150',
      features: ['Advanced AI Models', 'Priority Speed', 'Bulk Humanize', 'History Storage'],
      btnText: 'Upgrade to Pro',
      recommended: true,
    },
    {
      dbName: 'Unlimited',
      name: 'Agency Max',
      priceCode: '19.99',
      credits: '500',
      features: ['Neural API Access', 'Max Conciseness', 'Dedicated Support', 'White-labeling'],
      btnText: 'Go Agency',
      recommended: false,
    }
  ];

  const totalCreditsInPlan = userPlan?.monthlyAllowance || 10;
  const usedCredits = Math.max(0, totalCreditsInPlan - (credits || 0));
  const usagePercentage = totalCreditsInPlan > 0 ? Math.min(100, Math.max(0, (usedCredits / totalCreditsInPlan) * 100)) : 0;

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-12 pb-24">
      
      {/* Header & Status Section */}
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        <div className="flex-1">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Billing & Credits</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Manage your subscription and monitor your account performance.</p>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/20 shadow-sm relative overflow-hidden group">
               <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-24 h-24" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Credits Available</p>
               <h3 className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{credits !== null ? credits : '-'}</h3>
            </div>
            <div className="p-6 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/20 shadow-sm">
               <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Monthly Usage</p>
                    <h3 className="text-xl font-black">{usagePercentage.toFixed(0)}% Utilized</h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{usedCredits}/{totalCreditsInPlan} Used</span>
               </div>
               <div className="w-full h-3 bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${usagePercentage}%` }} transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                  />
               </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 p-1 rounded-[32px] bg-gradient-to-tr from-emerald-500/20 to-indigo-500/20">
           <div className="h-full bg-white dark:bg-slate-900 rounded-[31px] p-8 flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
                 <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="font-black text-lg mb-1">Secure Billing</h4>
              <p className="text-xs text-slate-500 font-medium mb-6">Payments are encrypted and processed securely via Stripe.</p>
              <button 
                onClick={() => navigate('/app/billing/invoices')}
                className="w-full py-3 bg-slate-100 dark:bg-white/5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                Invoices <ArrowRight className="w-3 h-3" />
              </button>
           </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * idx }}
            className={`relative p-8 rounded-[40px] border-2 transition-all duration-500 flex flex-col ${
              plan.recommended 
                ? 'bg-slate-900 dark:bg-slate-800 text-white dark:text-white border-indigo-500 shadow-2xl shadow-indigo-500/20 scale-105 z-10' 
                : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-100 dark:border-white/20 h-full'
            }`}
          >
            {plan.recommended && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                Most Popular
              </div>
            )}

            <div className="mb-8">
               <h3 className="text-xl font-black mb-1">{plan.name}</h3>
               <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tight">${plan.priceCode}</span>
                  <span className="text-xs font-bold opacity-50 uppercase tracking-widest">/mo</span>
               </div>
            </div>

            <p className={`text-xs font-black uppercase tracking-wider mb-8 pb-8 border-b ${plan.recommended ? 'border-white/10 dark:border-slate-900/10' : 'border-slate-50 dark:border-white/5'}`}>
               <Zap className="w-4 h-4 inline-block mr-2" />
               {plan.credits} Monthly Credits
            </p>

            <ul className="space-y-4 mb-10 flex-1">
               {plan.features.map(f => (
                 <li key={f} className="flex items-center gap-3 text-sm font-medium">
                   <CheckCircle2 className={`w-5 h-5 ${plan.recommended ? 'text-indigo-400' : 'text-emerald-500'}`} />
                   {f}
                 </li>
               ))}
            </ul>

            <button
              onClick={() => handleSelectPlan(plan.dbName)}
              disabled={isLoading !== null || userPlan?.name === plan.name}
              className={`w-full py-4 rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-2 ${
                userPlan?.name === plan.name
                  ? 'bg-emerald-500 text-white cursor-default'
                  : 'bg-indigo-600 text-white hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isLoading === plan.dbName ? <Loader2 className="w-5 h-5 animate-spin" /> : (userPlan?.name === plan.name ? 'Current Plan' : plan.btnText)}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Transaction History Section */}
      <div className="pt-12">
        <div className="flex items-center gap-3 mb-8">
           <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
              <History className="w-5 h-5" />
           </div>
           <h3 className="text-2xl font-black tracking-tight">Recent Activity</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden">
           {loadingHistory ? (
             <div className="p-12 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
           ) : transactions.length === 0 ? (
             <div className="p-16 text-center">
                <p className="text-slate-500 font-medium">No recent transactions to display.</p>
             </div>
           ) : (
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction Date</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                   {transactions.map(tx => (
                     <tr key={tx.id} className="hover:bg-slate-50/30 dark:hover:bg-white/[0.01] transition-colors">
                        <td className="px-8 py-5 font-bold text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                        <td className="px-8 py-5 font-black text-slate-900 dark:text-white uppercase tracking-tight">Credits {tx.amount > 0 ? 'Recharge' : 'Deduction'}</td>
                        <td className={`px-8 py-5 text-right font-black ${tx.amount > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
           )}
        </div>
      </div>

    </div>
  );
}
