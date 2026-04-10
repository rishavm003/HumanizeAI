import React, { useState } from 'react';
import { useEditorStore } from '../../store/editor.store.js';
import { Copy, Download, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OutputPanel = () => {
  const { outputText, wordCountOut } = useEditorStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'humanized-text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full relative border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm min-h-[300px]">
      <AnimatePresence mode="wait">
        {!outputText ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-300 dark:text-indigo-800 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <p className="text-gray-400 dark:text-gray-500 font-medium">
              Your humanized text will appear here
            </p>
          </motion.div>
        ) : (
          <motion.div 
            key="filled"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col h-full"
          >
            <div className="flex-1 overflow-y-auto p-4 md:p-6 text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap selection:bg-indigo-100 dark:selection:bg-indigo-900/50">
              {outputText}
            </div>
            
            {/* Action bar below output */}
            <div className="h-12 shrink-0 border-t border-gray-100 dark:border-gray-800/60 px-4 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {wordCountOut} words
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button 
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .txt
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OutputPanel;
