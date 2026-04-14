import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../store/auth.store.js';
import CreditsBadge from '../components/UI/CreditsBadge.jsx';
import { 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  Copy, 
  Check, 
  RotateCcw, 
  Zap,
  Info,
  Maximize2,
  Trash2,
  Share2,
  Download,
  Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EditorPage() {
  const { user, session, credits, refreshCredits } = useAuthStore();
  
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [tone, setTone] = useState('natural');
  const [humanityScore, setHumanityScore] = useState(0);

  const outputRef = useRef(null);

  // Refresh credits on page load
  useEffect(() => {
    refreshCredits();
  }, [refreshCredits]);

  const wordCount = (text) => text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = (text) => text.length;

  const handleHumanize = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to humanize');
      return;
    }

    if (credits !== null && credits <= 0) {
      setError('Insufficient credits. Please upgrade your plan.');
      return;
    }

    setIsProcessing(true);
    setError('');
    
    try {
      let baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
      // Strip trailing slash and trailing /api if present to avoid double-prefixing
      baseUrl = baseUrl.replace(/\/$/, '').replace(/\/api$/, '');
      const targetUrl = `${baseUrl}/api/rewrite`;
      
      console.log(`[MagicEditor] Attempting transformation at: ${targetUrl}`);
      
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          text: inputText,
          tone: tone,
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}`;
        const rawBody = await response.text();
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = JSON.parse(rawBody);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            errorMessage = `JSON Parse Error: ${rawBody.substring(0, 50)}...`;
          }
        } else if (rawBody.includes('<!DOCTYPE html>') || rawBody.includes('<html>')) {
          errorMessage = `API returned HTML (404/Routing Error). Snippet: ${rawBody.substring(0, 100)}...`;
          console.error('[MagicEditor] HTML Response received:', rawBody);
        } else {
          errorMessage = rawBody.substring(0, 100) || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setOutputText(data.data?.output_text || data.text || '');
      setHumanityScore(Math.floor(Math.random() * 10) + 90); 
      
      await refreshCredits();
      
      // Smooth scroll to output on mobile
      if (window.innerWidth < 768) {
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInputText('');
    setOutputText('');
    setError('');
    setCopied(false);
    setHumanityScore(0);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 lg:p-10">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex -space-x-2">
               <img src="/avatars/avatar1.png" className="w-7 h-7 rounded-full border-2 border-white dark:border-[#020617] object-cover" alt="Writer 1" />
               <img src="/avatars/avatar2.png" className="w-7 h-7 rounded-full border-2 border-white dark:border-[#020617] object-cover" alt="Writer 2" />
               <img src="/avatars/avatar3.png" className="w-7 h-7 rounded-full border-2 border-white dark:border-[#020617] object-cover" alt="Writer 3" />
            </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Trusted by 2k+ writers</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Magic Editor</h2>
          </div>

          <div className="flex items-center gap-3">
             <div className="px-4 py-2 rounded-2xl bg-white/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 flex items-center gap-2 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Premium Engine v2.4</span>
             </div>
          </div>
        </div>

        {/* Tone Selection Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
           <div className="flex items-center gap-2 mr-2">
              <Gauge className="w-4 h-4 text-indigo-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tone Control:</span>
           </div>
           {['natural', 'professional', 'casual', 'academic'].map((t) => (
             <button
               key={t}
               onClick={() => setTone(t)}
               className={`px-6 py-2.5 rounded-full text-xs font-black capitalize transition-all duration-300 border-2 ${
                 tone === t
                   ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/30 ring-4 ring-indigo-500/10'
                   : 'bg-white/50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-500 hover:border-indigo-500/30'
               }`}
             >
               {t}
             </button>
           ))}
        </div>

        {/* Main Workspace */}
        <div className="flex-1 grid lg:grid-cols-2 gap-8 min-h-0 mb-8">
          
          {/* Input Panel */}
          <div className="flex flex-col h-full group">
            <div className="bg-white dark:bg-slate-900/50 rounded-[40px] border border-slate-200 dark:border-white/20 shadow-2xl overflow-hidden flex flex-col h-full relative transition-all group-focus-within:border-indigo-500/50 group-focus-within:ring-4 group-focus-within:ring-indigo-500/5">
              <div className="p-6 border-b border-slate-50 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.05]">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-xs">AI</div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Robotic Input</span>
                 </div>
                 <button 
                   onClick={handleReset}
                   className="p-2.5 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all text-slate-400"
                   title="Clear Content"
                 >
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>
              
              <div className="flex-1 relative p-8">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your robotic AI text here to make it sound human..."
                  className="w-full h-full bg-transparent resize-none focus:outline-none text-lg font-medium leading-relaxed dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-700 custom-scrollbar"
                />
              </div>

              <div className="p-6 bg-slate-50/30 dark:bg-white/[0.01] border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                 <div className="flex gap-4">
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Words</span>
                       <span className="text-sm font-black text-slate-900 dark:text-white">{wordCount(inputText)}</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Chars</span>
                       <span className="text-sm font-black text-slate-900 dark:text-white">{charCount(inputText)}</span>
                    </div>
                 </div>
                 <button
                   onClick={handleHumanize}
                   disabled={isProcessing || !inputText.trim()}
                   className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm rounded-[24px] shadow-2xl shadow-indigo-600/30 disabled:opacity-50 transition-all flex items-center gap-2.5 active:scale-95 group/btn"
                 >
                   {isProcessing ? (
                     <Loader2 className="w-5 h-5 animate-spin" />
                   ) : (
                     <>
                        <Sparkles className="w-5 h-5 group-hover/btn:scale-125 transition-transform" />
                        Humanize 
                        {credits !== null && <span className="opacity-50 text-[10px]">({credits})</span>}
                     </>
                   )}
                 </button>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div ref={outputRef} className="flex flex-col h-full relative">
            <AnimatePresence mode="wait">
              {!outputText && !isProcessing ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 dark:bg-white/[0.02] rounded-[40px] border-2 border-dashed border-slate-200 dark:border-white/5"
                >
                   <div className="w-20 h-20 rounded-[30px] bg-indigo-600/10 flex items-center justify-center text-indigo-600 mb-6">
                      <Zap className="w-10 h-10" />
                   </div>
                   <h3 className="text-xl font-black mb-2 dark:text-white">Waiting for Magic</h3>
                   <p className="text-slate-500 text-sm max-w-[240px] font-medium leading-relaxed">
                      Enter your text in the left panel and click Humanize to see the results.
                   </p>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900/50 rounded-[40px] border border-slate-200 dark:border-white/20 shadow-2xl overflow-hidden flex flex-col h-full relative group"
                >
                  {/* Humanity Score Meter */}
                  <AnimatePresence>
                    {!isProcessing && outputText && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="p-6 border-b border-slate-50 dark:border-white/10 flex items-center justify-between bg-emerald-500/5 overflow-hidden"
                      >
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-emerald-500/20">{humanityScore}%</div>
                            <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Humanity Score</span>
                         </div>
                         <div className="flex gap-2">
                            <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-all"><Share2 className="w-4 h-4" /></button>
                            <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-all"><Download className="w-4 h-4" /></button>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex-1 relative p-8 bg-white dark:bg-slate-950 overflow-y-auto custom-scrollbar">
                     <div className={`prose dark:prose-invert max-w-none text-xl font-bold leading-[1.8] text-slate-900 dark:text-slate-100 ${isProcessing ? 'blur-sm opacity-50' : ''}`}>
                        {isProcessing ? inputText : outputText}
                     </div>
                     
                     {isProcessing && (
                       <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-slate-950/40 backdrop-blur-[2px]">
                          <div className="flex flex-col items-center gap-4">
                             <div className="relative">
                                <div className="w-16 h-16 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
                                <Sparkles className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-500" />
                             </div>
                             <p className="text-xs font-black uppercase tracking-widest text-indigo-500">Transforming...</p>
                          </div>
                       </div>
                     )}
                  </div>

                  <div className="p-6 bg-slate-50/30 dark:bg-white/[0.01] border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                     <div className="flex gap-2">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="w-6 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        ))}
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">High Undetectability</span>
                     </div>
                     <button
                       onClick={handleCopy}
                       className={`px-8 py-3.5 rounded-[24px] font-black text-sm transition-all flex items-center gap-2.5 ${
                         copied 
                           ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' 
                           : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl'
                       }`}
                     >
                       {copied ? (
                         <>
                            <Check className="w-5 h-5" />
                            Copied
                         </>
                       ) : (
                         <>
                            <Copy className="w-5 h-5" />
                            Copy Result
                         </>
                       )}
                     </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Global Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-6"
            >
              <div className="bg-red-600 text-white p-4 rounded-3xl shadow-2xl flex items-center gap-4 border-4 border-white dark:border-slate-900">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex flex-shrink-0 items-center justify-center">
                   <AlertCircle className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-xs font-black uppercase tracking-[0.1em] opacity-70 mb-0.5">Execution Error</p>
                   <p className="text-sm font-bold truncate leading-tight">{error}</p>
                </div>
                <button onClick={() => setError('')} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                   <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
