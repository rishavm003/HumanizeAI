import { NavLink, Link } from 'react-router-dom';
import { PenTool, Clock, Settings, CreditCard, Zap, LogOut, Moon, Sun, X, Sparkles, Shield, Users } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store.js';
import { useThemeStore } from '../../store/theme.store.js';
import CreditsBadge from '../UI/CreditsBadge.jsx';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout, role } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  const navLinks = [
    { to: '/app', icon: PenTool, label: 'Editor', exact: true },
    { to: '/app/history', icon: Clock, label: 'History' },
    { to: '/app/settings', icon: Settings, label: 'Settings' },
    { to: '/app/billing', icon: CreditCard, label: 'Billing' },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" 
          onClick={closeMobile}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-2xl border-r border-slate-200 dark:border-white/5 transition-all duration-500 ease-in-out md:translate-x-0 flex flex-col ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-white/5 shrink-0">
          <Link to="/app" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">HumanizeAI</span>
          </Link>
          <button className="md:hidden p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" onClick={closeMobile}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-8 px-4 flex flex-col gap-1.5">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) => 
                `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all relative group ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`
              }
              onClick={closeMobile}
            >
              <link.icon className={`w-5 h-5 transition-transform group-hover:scale-110`} />
              {link.label}
              
              {/* Active Indicator */}
              <NavLink 
                to={link.to} 
                end={link.exact} 
                className={({ isActive }) => isActive ? "absolute right-3 w-1.5 h-1.5 rounded-full bg-white/50" : "hidden"}
              />
            </NavLink>
          ))}

          {role === 'admin' && (
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-white/5 space-y-1.5">
               <span className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Administration</span>
               <NavLink
                 to="/app/admin"
                 end
                 className={({ isActive }) => 
                   `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all relative group ${
                     isActive 
                       ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' 
                       : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                   }`
                 }
                 onClick={closeMobile}
               >
                 <Shield className="w-5 h-5 transition-transform group-hover:scale-110" />
                 Dashboard
               </NavLink>
               <NavLink
                 to="/app/admin/users"
                 className={({ isActive }) => 
                   `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all relative group ${
                     isActive 
                       ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' 
                       : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                   }`
                 }
                 onClick={closeMobile}
               >
                 <Users className="w-5 h-5 transition-transform group-hover:scale-110" />
                 Users
               </NavLink>
            </div>
          )}
        </div>

        {/* Footer actions & Profile */}
        <div className="p-4 flex flex-col gap-6 shrink-0 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
          
          {/* User Identity Section */}
          <div className="relative px-2">
            {/* Floating Theme Toggle to save horizontal space */}
            <div className="absolute top-0 right-0">
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex flex-shrink-0 items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-600/20">
                 {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0 pr-8">
                 <p className="text-[13px] font-black text-slate-900 dark:text-white leading-tight mb-0.5">
                    {user?.user_metadata?.full_name || 'Premium User'}
                 </p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest break-all">
                    {user?.email || user?.email?.split('@')[0]}
                 </p>
              </div>
            </div>
          </div>

          <div className="px-2">
            <CreditsBadge />
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:border-red-500/20 transition-all font-black text-xs uppercase tracking-widest shadow-sm group"
          >
            <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-white/5 group-hover:bg-red-500/10 transition-colors">
               <LogOut className="w-4 h-4" />
            </div>
            Sign Out
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
