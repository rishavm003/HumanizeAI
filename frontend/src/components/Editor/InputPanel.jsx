import React, { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useEditorStore } from '../../store/editor.store.js';
import { AnimatePresence, motion } from 'framer-motion';

const InputPanel = () => {
  const { inputText, setInput, wordCountIn, reset } = useEditorStore();
  const [showPasted, setShowPasted] = useState(false);
  const textareaRef = useRef(null);

  const handleClear = () => {
    reset();
  };

  const handlePaste = () => {
    setShowPasted(true);
    setTimeout(() => {
      setShowPasted(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full relative border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all shadow-sm">
      <textarea
        ref={textareaRef}
        className="flex-1 w-full p-4 md:p-6 bg-transparent resize-none outline-none dark:text-gray-100 placeholder:text-gray-400 min-h-[300px]"
        placeholder="Paste your AI-generated text here..."
        value={inputText}
        onChange={(e) => setInput(e.target.value)}
        onPaste={handlePaste}
      />
      
      {inputText && (
        <button 
          onClick={handleClear}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 transition-colors"
          title="Clear text"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Footer info */}
      <div className="h-12 border-t border-gray-100 dark:border-gray-800/60 px-4 md:px-6 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50 text-xs text-gray-500 dark:text-gray-400 shrink-0">
        <div className="flex items-center gap-4">
          <span>{wordCountIn} words</span>
          <span>{inputText.length} characters</span>
        </div>
        
        <AnimatePresence>
          {showPasted && (
            <motion.span 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-emerald-600 dark:text-emerald-400 font-medium"
            >
              Text pasted
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InputPanel;
