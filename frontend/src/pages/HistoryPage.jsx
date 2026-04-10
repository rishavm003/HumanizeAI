import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Clock, 
  Copy, 
  Check, 
  Calendar, 
  ChevronRight, 
  Zap,
  MoreVertical,
  Trash2,
  Filter
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store.js';

export default function HistoryPage() {
  const { session } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rewrite/history?limit=50`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setHistory(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text, id) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredHistory = history.filter(item => 
    item.input_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.output_text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Your History</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Access all your humanized transformations in one place.</p>
        </div>
        
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-6 py-3.5 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full md:w-80 transition-all backdrop-blur-xl font-medium"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-48 rounded-[32px] bg-slate-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-32 bg-slate-50/50 dark:bg-white/[0.02] rounded-[40px] border border-slate-100 dark:border-white/5">
          <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mx-auto mb-6">
            <Clock className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black mb-2">No history found</h3>
          <p className="text-slate-500 max-w-xs mx-auto">Either you haven't humanized anything yet, or your search didn't match any results.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredHistory.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative p-1 rounded-[32px] bg-gradient-to-b from-slate-200 to-transparent dark:from-white/10 dark:to-transparent hover:from-indigo-500/50 transition-all duration-500"
              >
                <div className="h-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/20 rounded-[31px] p-6 flex flex-col justify-between overflow-hidden relative">
                  {/* Grain Overlay */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 text-[10px] font-black uppercase tracking-widest text-indigo-500">
                        <Zap className="w-3 h-3" />
                        {item.tone || 'Natural'}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-4 leading-relaxed font-medium mb-6">
                      {item.output_text}
                    </p>
                  </div>

                  <div className="relative z-10 flex items-center justify-between pt-4 border-t border-slate-50 dark:border-white/5">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {item.word_count} Words
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => handleCopy(item.output_text, item.id)}
                         className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-indigo-500/10 hover:text-indigo-500 transition-all"
                       >
                         {copiedId === item.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                       </button>
                       <button 
                         onClick={() => setSelectedEntry(item)}
                         className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-white dark:hover:bg-slate-800 transition-all"
                       >
                         <ChevronRight className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedEntry(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-4 z-[101]"
            >
              <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-2xl border border-white dark:border-white/10 max-h-[80vh] overflow-y-auto relative">
                <button 
                  onClick={() => setSelectedEntry(null)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </button>

                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-xl">Full Transformation</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{new Date(selectedEntry.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block">Raw Input</label>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-sm text-slate-500 italic leading-relaxed">
                      {selectedEntry.input_text}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-3 block">Humanized Result</label>
                    <div className="p-6 rounded-3xl bg-indigo-500/[0.03] border border-indigo-500/10 text-slate-900 dark:text-slate-100 leading-relaxed font-medium">
                      {selectedEntry.output_text}
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex items-center justify-between pt-6 border-t border-slate-50 dark:border-white/5">
                  <div className="flex gap-4">
                     <div className="text-center px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5">
                        <div className="text-xs font-black">{selectedEntry.word_count}</div>
                        <div className="text-[8px] uppercase tracking-widest text-slate-400">Words</div>
                     </div>
                     <div className="text-center px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5">
                        <div className="text-xs font-black capitalize">{selectedEntry.tone}</div>
                        <div className="text-[8px] uppercase tracking-widest text-slate-400">Tone</div>
                     </div>
                  </div>
                  <button 
                    onClick={() => handleCopy(selectedEntry.output_text, 'modal')}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all flex items-center gap-2"
                  >
                    {copiedId === 'modal' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    Copy Text
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
