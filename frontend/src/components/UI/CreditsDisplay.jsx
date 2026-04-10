import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store.js';

export default function CreditsDisplay() {
  const { credits, refreshCredits } = useAuthStore();
  const [pulse, setPulse] = useState(false);
  const [prevCredits, setPrevCredits] = useState(credits);

  // Detect credit changes and trigger pulse animation
  useEffect(() => {
    if (credits !== null && prevCredits !== null && credits !== prevCredits) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 500);
      return () => clearTimeout(timer);
    }
    setPrevCredits(credits);
  }, [credits, prevCredits]);

  // Get color based on credit amount
  const getColorClass = () => {
    if (credits === null) return 'text-gray-400';
    if (credits > 20) return 'text-green-500';
    if (credits >= 5) return 'text-amber-500';
    return 'text-red-500';
  };

  // Get background color for pulse effect
  const getPulseColor = () => {
    if (credits === null) return 'rgba(156, 163, 175, 0.3)';
    if (credits > 20) return 'rgba(34, 197, 94, 0.3)';
    if (credits >= 5) return 'rgba(245, 158, 11, 0.3)';
    return 'rgba(239, 68, 68, 0.3)';
  };

  // Tooltip text
  const getTooltipText = () => {
    if (credits === null) return 'Loading credits...';
    return `${credits} credits remaining this month`;
  };

  return (
    <div className="relative group">
      {/* Pulse animation background */}
      <AnimatePresence>
        {pulse && (
          <motion.div
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: getPulseColor() }}
          />
        )}
      </AnimatePresence>

      {/* Main display */}
      <motion.div
        animate={pulse ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.2 }}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-gray-200 shadow-sm cursor-default ${getColorClass()}`}
        title={getTooltipText()}
      >
        <Zap 
          className="w-4 h-4" 
          fill={credits !== null && credits > 0 ? 'currentColor' : 'none'}
        />
        <span className="text-sm font-semibold min-w-[1.5rem] text-center">
          {credits !== null ? credits : '-'}
        </span>
      </motion.div>

      {/* Tooltip */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {getTooltipText()}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800" />
      </div>
    </div>
  );
}
