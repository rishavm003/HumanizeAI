import React from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { useEditorStore } from '../../store/editor.store.js';
import { useAuthStore } from '../../store/auth.store.js';
import { useToast } from '../../hooks/useToast.js';

const HumanizeButton = () => {
  const { inputText, humanize, loading } = useEditorStore();
  const { user, credits, refreshCredits } = useAuthStore();
  const toast = useToast();
  
  const creditsRemaining = credits !== null ? credits : (user?.user_metadata?.credits_remaining ?? 10);
  
  const noInput = !inputText.trim();
  const noCredits = creditsRemaining <= 0;
  
  const isDisabled = loading || noInput || noCredits;

  let tooltip = '';
  if (noCredits) tooltip = 'No credits remaining';
  else if (noInput) tooltip = 'Paste some text to get started';

  const handleHumanize = async () => {
    if (isDisabled) return;
    try {
      await humanize();
      await refreshCredits();
      toast.success("Text humanized successfully!");
    } catch (err) {
      if (err.response?.status === 402 || err.message?.includes('credits')) {
        toast.error("You've run out of credits — upgrade your plan");
      } else if (err.response?.status === 429 || err.message?.includes('Too many requests')) {
        toast.warning("Too many requests, please wait a moment");
      } else {
        toast.error("An error occurred during humanization.");
      }
    }
  };

  return (
    <div className="relative group w-full my-4 mt-auto shrink-0 z-10">
      <button
        onClick={handleHumanize}
        disabled={isDisabled}
        className={`w-full py-4 rounded-lg font-semibold text-[15px] flex items-center justify-center gap-2 transition-all duration-200 ${
          isDisabled 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md active:scale-[0.99]'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Humanizing...</span>
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            <span>Humanize Text</span>
          </>
        )}
      </button>
      
      {tooltip && isDisabled && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-10 w-max px-3 py-1.5 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 dark:bg-gray-100 dark:text-gray-900">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
        </div>
      )}
    </div>
  );
};

export default HumanizeButton;
