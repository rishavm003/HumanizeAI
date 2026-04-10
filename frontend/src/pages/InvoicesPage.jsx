import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/auth.store.js';
import { 
  ChevronLeft, 
  Receipt, 
  Download, 
  Loader2, 
  FileText,
  AlertCircle
} from 'lucide-react';

export default function InvoicesPage() {
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/credits/invoices`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch invoices');
      
      setInvoices(data.data || []);
    } catch (err) {
      console.error('Invoices fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100);
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8 pb-24">
      {/* Breadcrumb */}
      <button 
        onClick={() => navigate('/app/billing')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-bold uppercase tracking-widest">Back to Billing</span>
      </button>

      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-[1.5rem] bg-indigo-500/10 flex items-center justify-center text-indigo-500">
          <Receipt className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Payment Invoices</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Download past receipts and view your payment history.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm text-slate-500 font-bold tracking-widest uppercase">Fetching Records...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500 flex flex-col items-center gap-3">
             <AlertCircle className="w-10 h-10 opacity-50" />
             <p className="font-bold">{error}</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
              <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-lg font-black mb-2">No Invoices Found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm font-medium">
              You don't have any paid invoices or receipts attached to this account yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                {invoices.map((inv, i) => (
                  <motion.tr 
                    key={inv.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-50/30 dark:hover:bg-white/[0.01] transition-colors"
                  >
                    <td className="px-8 py-5 font-bold text-slate-600 dark:text-slate-300">
                      {new Date(inv.created * 1000).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 font-black text-slate-900 dark:text-white">
                      {formatCurrency(inv.amount_paid)}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        inv.status === 'paid' 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : 'bg-slate-500/10 text-slate-500'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {inv.hosted_invoice_url ? (
                        <a 
                          href={inv.hosted_invoice_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition-all"
                        >
                          <Download className="w-3 h-3" />
                          PDF
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">N/A</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
