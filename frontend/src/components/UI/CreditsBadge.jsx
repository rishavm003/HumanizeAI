import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store.js';

export default function CreditsBadge() {
  const { credits, plan, refreshCredits } = useAuthStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  // Handle pulse animation when credits change
  const triggerPulse = () => {
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 500);
  };

  // Get color based on credits
  const getCreditsColor = () => {
    if (credits === null) return 'text-gray-400';
    if (credits > 20) return 'text-green-600';
    if (credits >= 5) return 'text-amber-500';
    return 'text-red-500';
  };

  const getCreditsBg = () => {
    if (credits === null) return 'bg-gray-100';
    if (credits > 20) return 'bg-green-50';
    if (credits >= 5) return 'bg-amber-50';
    return 'bg-red-50';
  };

  const isFreePlan = plan?.name === 'Free' || !plan?.id;

  return (
    <div className="w-full">
      <motion.div
        animate={isPulsing ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.3 }}
        className="rounded-xl bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 overflow-hidden"
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <Zap className={`w-3.5 h-3.5 ${credits > 0 ? 'text-indigo-600 fill-indigo-600' : 'text-slate-400'}`} />
            <span className="text-xs font-black text-slate-700 dark:text-slate-200">
              {credits !== null ? credits.toLocaleString() : '--'}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Credits</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        {/* Expanded details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-gray-200/50"
            >
              <div className="p-3 space-y-3">
                {/* Plan info */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Current Plan</span>
                  <span className="font-medium text-gray-700">
                    {plan?.name || 'Free'}
                  </span>
                </div>

                {/* Monthly allowance */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Monthly Allowance</span>
                  <span className="font-medium text-gray-700">
                    {plan?.monthlyAllowance || 10} credits
                  </span>
                </div>

                {/* Refresh info */}
                <div className="text-xs text-gray-400 pt-2 border-t border-gray-200/30">
                  Resets on the 1st of each month
                </div>

                {/* Upgrade link for free users */}
                {isFreePlan && (
                  <Link
                    to="/app/billing"
                    className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <CreditCard className="w-4 h-4" />
                    Upgrade Plan
                  </Link>
                )}

                {/* Refresh button */}
                <button
                  onClick={() => {
                    refreshCredits();
                    triggerPulse();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  Refresh Balance
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
