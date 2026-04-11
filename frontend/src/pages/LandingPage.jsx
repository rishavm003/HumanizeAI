import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useThemeStore } from '../store/theme.store.js';
import { useAuthStore } from '../store/auth.store.js';
import { 
  Zap, 
  ShieldCheck, 
  MessageSquare, 
  ArrowRight, 
  ShieldAlert, 
  BrainCircuit, 
  Sparkles, 
  BarChart3,
  CheckCircle2,
  Clock,
  Sun,
  Moon
} from 'lucide-react';

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { session } = useAuthStore();
  const navigate = useNavigate();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  useEffect(() => {
    if (session) {
      navigate('/app');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-100 overflow-hidden selection:bg-indigo-500/30">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[80vw] h-[80vh] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1.1, 1, 1.1],
            x: [0, -40, 0],
            y: [0, -60, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[70vw] h-[70vh] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[120px]"
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-[#020617]/70 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link 
              to="/" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center shadow-lg shadow-indigo-500/10 group-hover:scale-110 transition-all duration-300 border border-slate-100 dark:border-white/10 overflow-hidden p-1.5">
                <img src="/favicon.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400">Humanize AI</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors">Features</a>
              <a href="#comparison" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors">Comparison</a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors">Process</a>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link to="/login" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Login</Link>
              <Link to="/signup" className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-sm font-bold shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-20 md:pt-56 md:pb-32 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-8 uppercase tracking-widest"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            V2.0 is Live
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-slate-900 dark:text-white leading-[1.1]"
          >
            Turn AI Text into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient">Human Gold</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-12"
          >
            Converts robotic, AI-generated content into natural human-like prose that bypasses all major AI detectors including GPTZero and Originality.ai.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/signup" className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-bold shadow-2xl shadow-indigo-500/40 hover:scale-105 transition-all flex items-center justify-center gap-2 group">
              Start Humanizing
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Words Humanized', value: '10M+' },
            { label: 'Success Rate', value: '99.9%' },
            { label: 'AI Detectors Bypassed', value: '15+' },
            { label: 'Happy Writers', value: '50k+' },
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-center"
            >
              <div className="text-3xl md:text-4xl font-black text-indigo-600 dark:text-indigo-400 mb-1">{stat.value}</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-32 px-4 border-t border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Powerful <span className="text-indigo-600">Features</span></h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Everything you need to scale your content without losing that human spark.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Natural Tone",
                desc: "Convert robotic text into conversational, human-like content instantly.",
                icon: <MessageSquare className="w-6 h-6" />
              },
              {
                title: "Instant Processing",
                desc: "Get ultra-fast inference results in seconds backed by our powerful AI engine.",
                icon: <Zap className="w-6 h-6" />
              },
              {
                title: "Plagiarism Safe",
                desc: "Unique contextual generation every time. Completely undetectable.",
                icon: <ShieldCheck className="w-6 h-6" />
              }
            ].map((feat, i) => (
              <motion.div 
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="p-8 rounded-[32px] bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/10 hover:border-indigo-500/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h4 className="text-xl font-bold mb-3">{feat.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Detection Comparison (The Chart) */}
      <section id="comparison" className="relative z-10 py-32 px-4 bg-slate-50 dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Proof is in the <span className="text-indigo-600">Numbers</span></h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                Most AI content fails detectors immediately. HumanizeAI restructuring doesn't just swap words; it rebuilds syntax to mirror human variability.
              </p>
              
              <div className="space-y-8">
                {[
                  { name: 'GPTZero Detection', raw: 98, human: 2 },
                  { name: 'Originality.ai Detection', raw: 99, human: 4 },
                  { name: 'Copyleaks Detection', raw: 95, human: 0 },
                ].map((item) => (
                  <div key={item.name} className="space-y-3">
                    <div className="flex justify-between text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <span>{item.name}</span>
                    </div>
                    <div className="relative h-6 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} whileInView={{ width: `${item.raw}%` }} transition={{ duration: 1, delay: 0.2 }}
                        className="absolute inset-y-0 left-0 bg-red-500/20 border-r border-red-500"
                      />
                      <motion.div 
                        initial={{ width: 0 }} whileInView={{ width: `${item.human}%` }} transition={{ duration: 1, delay: 0.5 }}
                        className="absolute inset-y-0 left-0 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                      />
                    </div>
                    <div className="flex justify-between text-xs font-black">
                      <span className="text-red-500">Raw AI: {item.raw}%</span>
                      <span className="text-emerald-500">Humanized: {item.human}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative group">
               <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="relative p-8 rounded-[40px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-3 mb-8 border-b border-slate-100 dark:border-white/5 pb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">Evasion Performance</h4>
                      <p className="text-xs text-slate-500">Verified Test Results V2.1</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                      <div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-emerald-500" /> <span className="font-bold">Bypassed</span></div>
                      <span className="text-xs font-black text-slate-400">0.2s ago</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                      <div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-emerald-500" /> <span className="font-bold">Natural Score: 98/100</span></div>
                      <span className="text-xs font-black text-slate-400">1.5s ago</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 opacity-50">
                      <div className="flex items-center gap-3"><ShieldAlert className="w-5 h-5 text-red-500" /> <span className="font-bold">Blocked Raw Input</span></div>
                      <span className="text-xs font-black text-slate-400">Just now</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Side-by-Side Comparison Section */}
      <section className="relative z-10 py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">The Human <span className="text-purple-500">Edge</span></h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Witness the transformation from clinical robotics to natural expression.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Raw AI Bubble */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              className="relative p-1 rounded-[32px] bg-gradient-to-b from-slate-200 to-transparent dark:from-white/10 dark:to-transparent"
            >
              <div className="p-8 rounded-[31px] bg-white dark:bg-slate-900 min-h-[300px]">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                  <BrainCircuit className="w-3 h-3" />
                  Raw AI Generated
                </div>
                <p className="text-slate-400 dark:text-slate-500 italic leading-relaxed">
                  "Advancements in artificial intelligence have allowed for the automated generation of textual content. This process employs large language models to predict subsequent linguistic tokens based on statistical probabilities established during the training phase on large datasets..."
                </p>
                <div className="mt-8 flex items-center justify-between border-t border-slate-50 dark:border-white/5 pt-6">
                  <div className="text-red-500 font-bold flex items-center gap-1.5"><ShieldAlert className="w-4 h-4" /> 98% AI Probability</div>
                </div>
              </div>
            </motion.div>

            {/* Humanized Bubble */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              className="relative p-1 rounded-[32px] bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 shadow-2xl shadow-indigo-500/20"
            >
              <div className="p-8 rounded-[31px] bg-white dark:bg-slate-950 min-h-[300px] relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-6 relative z-10">
                  <Sparkles className="w-3 h-3" />
                  Humanized Gold
                </div>
                <p className="text-slate-900 dark:text-slate-200 leading-relaxed font-medium relative z-10">
                  "Today's AI can write almost anything, but it often lacks the soul of a real author. By using smart modeling, we can take those robotic drafts and breathe life back into them—making the writing feel intuitive, spontaneous, and truly human once again."
                </p>
                <div className="mt-8 flex items-center justify-between border-t border-slate-50 dark:border-white/5 pt-6 relative z-10">
                  <div className="text-emerald-500 font-bold flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> 100% Human Score</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="relative z-10 py-32 px-4 bg-slate-50 dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Simple 3-Step <span className="text-indigo-500">Flow</span></h2>
          </div>

          <div className="relative grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="relative group">
              <div className="text-[120px] font-black absolute -top-16 -left-4 text-slate-200/50 dark:text-white/5 select-none transition-transform group-hover:scale-110">01</div>
              <div className="relative space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-lg group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold">Paste AI Content</h3>
                <p className="text-slate-500 dark:text-slate-400">Copy any text generated by ChatGPT, Claude, or Gemini into our editor.</p>
              </div>
            </div>
            {/* Step 2 */}
            <div className="relative group">
              <div className="text-[120px] font-black absolute -top-16 -left-4 text-slate-200/50 dark:text-white/5 select-none transition-transform group-hover:scale-110">02</div>
              <div className="relative space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-lg group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold">Refactor Locally</h3>
                <p className="text-slate-500 dark:text-slate-400">Our proprietary model restructures your text to break AI patterns while keeping the meaning.</p>
              </div>
            </div>
            {/* Step 3 */}
            <div className="relative group">
              <div className="text-[120px] font-black absolute -top-16 -left-4 text-slate-200/50 dark:text-white/5 select-none transition-transform group-hover:scale-110">03</div>
              <div className="relative space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-lg group-hover:bg-pink-600 group-hover:text-white transition-all duration-300">
                  <ArrowRight className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold">Ship It</h3>
                <p className="text-slate-500 dark:text-slate-400">Export your undetectable humanized content and publish with complete peace of mind.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 py-32 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto relative rounded-[40px] bg-indigo-600 p-12 md:p-24 text-center overflow-hidden">
          {/* CTA Background Blurs */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-50" />
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-pink-500 rounded-full blur-[100px] opacity-50" />
          </div>

          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">Stop Getting <br /> Caught by AI Filters.</h2>
            <p className="text-xl text-indigo-100 max-w-xl mx-auto opacity-80">Join 50,000+ creators who are scaling their content without detection.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
               <Link to="/signup" className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white text-indigo-600 text-xl font-black shadow-2xl hover:scale-105 transition-all">Start 100% Free</Link>
               <div className="flex items-center gap-6 text-white/60 font-bold uppercase tracking-widest text-[10px]">
                 <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Seconds Setup</div>
                 <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> No Credit Card</div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 pt-10 pb-20 px-4 border-t border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto text-center text-xs font-bold text-slate-400 dark:text-slate-600 tracking-widest uppercase">
          &copy; 2026 Humanize AI. All rights reserved. Built for humans.
        </div>
      </footer>
    </div>
  );
}
