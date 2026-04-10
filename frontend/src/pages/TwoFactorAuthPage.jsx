import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Smartphone, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
  Copy,
  Check,
  ShieldAlert,
  ChevronLeft
} from 'lucide-react';
import { supabase } from '../lib/supabase.js';
import { QRCodeSVG } from 'qrcode.react';

export default function TwoFactorAuthPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Intro, 2: Setup/QR, 3: Verify, 4: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mfaData, setMfaData] = useState(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Check if MFA is already enabled
  useEffect(() => {
    checkMfaStatus();
  }, []);

  const checkMfaStatus = async () => {
    const { data: { factors }, error } = await supabase.auth.mfa.listFactors();
    if (error) return;
    
    const activeFactor = factors.find(f => f.status === 'verified');
    if (activeFactor) {
      setStep(4); // Already enabled
    }
  };

  const startEnrollment = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      });

      if (error) throw error;
      setMfaData(data);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (verifyCode.length !== 6) return;
    
    setLoading(true);
    setError('');
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: mfaData.id
      });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaData.id,
        challengeId: challenge.id,
        code: verifyCode
      });

      if (verifyError) throw verifyError;

      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mfaData?.totp?.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisableMfa = async () => {
    if (!window.confirm('Are you sure you want to disable Two-Factor Authentication? This will reduce your account security.')) {
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const { data: { factors }, error: fetchError } = await supabase.auth.mfa.listFactors();
      if (fetchError) throw fetchError;
      
      const activeFactor = factors.find(f => f.status === 'verified');
      if (activeFactor) {
        const { error: unenrollError } = await supabase.auth.mfa.unenroll({
          factorId: activeFactor.id
        });
        if (unenrollError) throw unenrollError;
      }
      
      setStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-10">
      <div className="max-w-2xl mx-auto">
        
        {/* Breadcrumb */}
        <button 
          onClick={() => navigate('/app/settings')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-8 group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-bold">Back to Settings</span>
        </button>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-[40px] p-8 lg:p-12 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Background Art */}
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
             <ShieldCheck className="w-64 h-64" />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="relative z-10"
              >
                <div className="w-16 h-16 rounded-22xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 mb-8">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black mb-4 tracking-tight">Two-Factor Authentication</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed max-w-lg">
                  Add an extra layer of security to your account. When enabled, you'll need to enter a 6-digit code from your authenticator app each time you sign in.
                </p>

                <div className="space-y-4 mb-10">
                   {[
                     { title: 'Enhanced Protection', desc: 'Even if someone gets your password, they can\'t access your account.', icon: ShieldCheck },
                     { title: 'Industry Standard', desc: 'Securely generate codes with any TOTP app like Google Authenticator or Authy.', icon: Smartphone },
                   ].map((feature) => (
                     <div key={feature.title} className="flex gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-500">
                           <feature.icon className="w-5 h-5" />
                        </div>
                        <div>
                           <h4 className="text-sm font-black">{feature.title}</h4>
                           <p className="text-xs text-slate-500 font-medium">{feature.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>

                <button 
                  onClick={startEnrollment}
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 text-white text-sm font-black shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Started'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="relative z-10"
              >
                <h2 className="text-2xl font-black mb-6 tracking-tight text-center">Scan QR Code</h2>
                
                <div className="flex flex-col items-center justify-center mb-8">
                  <div className="p-6 bg-white rounded-[32px] shadow-sm mb-6">
                    <QRCodeSVG 
                      value={mfaData?.totp?.qr_code} 
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <div className="text-center max-w-sm">
                    <p className="text-sm text-slate-500 font-medium mb-4">
                      Scan this QR code with your authenticator app. If you can't scan it, use the secret key below:
                    </p>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl">
                       <code className="flex-1 text-xs font-mono font-bold text-indigo-500 break-all">{mfaData?.totp?.secret}</code>
                       <button onClick={copyToClipboard} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors">
                          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                       </button>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setStep(3)}
                  className="w-full px-8 py-4 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white text-sm font-black shadow-xl hover:scale-105 transition-all"
                >
                  I've scanned it
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="relative z-10"
              >
                <h2 className="text-2xl font-black mb-4 tracking-tight">Verify Setup</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                  Enter the 6-digit code generated by your authenticator app to complete the setup.
                </p>

                <form onSubmit={handleVerify} className="space-y-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Code</label>
                      <input 
                        type="text" 
                        maxLength={6}
                        required
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                        autoFocus
                        placeholder="000 000"
                        className="w-full text-center text-4xl font-black tracking-[0.5em] py-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all"
                      />
                   </div>

                   {error && (
                     <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm font-bold">
                        <AlertCircle className="w-4 h-4" /> {error}
                     </div>
                   )}

                   <div className="flex gap-4">
                     <button 
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 px-8 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white text-sm font-black hover:bg-slate-200 transition-all"
                     >
                       Back
                     </button>
                     <button 
                      type="submit"
                      disabled={loading || verifyCode.length !== 6}
                      className="flex-[2] px-8 py-4 rounded-2xl bg-indigo-600 text-white text-sm font-black shadow-xl shadow-indigo-600/20 disabled:opacity-50 transition-all"
                     >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Activation'}
                     </button>
                   </div>
                </form>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 text-center py-8"
              >
                <div className="w-20 h-20 rounded-[32px] bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-8 shadow-inner">
                   <ShieldCheck className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black mb-4 tracking-tight italic">Security Level Up!</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 max-w-sm mx-auto">
                  Two-factor authentication is now active on your account. Your dashboard is now fortified.
                </p>

                <div className="p-6 rounded-[32px] bg-indigo-600 text-white mb-10 overflow-hidden relative group">
                   <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700">
                      <ShieldCheck className="w-16 h-16" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2">Protection Summary</p>
                   <h4 className="text-xl font-black mb-1">TOTP Enabled</h4>
                   <p className="text-xs text-indigo-100 font-medium">Session-based verification is active.</p>
                </div>

                <div className="flex flex-col gap-3 justify-center items-center">
                  <button 
                    onClick={() => navigate('/app/settings')}
                    className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-black hover:scale-105 active:scale-95 transition-all shadow-xl"
                  >
                    Return to Dashboard
                  </button>
                  <button 
                    onClick={handleDisableMfa}
                    disabled={loading}
                    className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-transparent text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm font-black transition-all"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Disable Two-Factor Authentication'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Support Section */}
        <div className="mt-12 text-center">
           <p className="text-sm text-slate-400 font-medium">
             Lost access to your device? <a href="mailto:support@humanizeai.text" className="text-indigo-500 font-bold hover:underline">Contact Security Support</a>
           </p>
        </div>
      </div>
    </div>
  );
}
