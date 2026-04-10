import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store.js';
import { useThemeStore } from './store/theme.store.js';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import EditorPage from './pages/EditorPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import BillingPage from './pages/BillingPage.jsx';
import InvoicesPage from './pages/InvoicesPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import TwoFactorAuthPage from './pages/TwoFactorAuthPage.jsx';
import SessionControlPage from './pages/SessionControlPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './components/Layout/AppLayout.jsx';

function App() {
  const { initializeAuth } = useAuthStore();
  const { isDarkMode } = useThemeStore();

  // Apply theme class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Initialize auth on app load
  useEffect(() => {
    initializeAuth();

    // Listen to auth state changes
    import('./lib/supabase.js').then(({ supabase }) => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          useAuthStore.setState({ 
            session, 
            user: session?.user || null 
          });

          // Cleanup URL fragments (like #access_token=...) after successful login
          if (session && window.location.hash.includes('access_token')) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    });
  }, [initializeAuth]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route 
        path="/app/*" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route index element={<EditorPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="settings/security/2fa" element={<TwoFactorAuthPage />} />
                <Route path="settings/security/sessions" element={<SessionControlPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="billing/invoices" element={<InvoicesPage />} />
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="admin/users" element={<AdminUsersPage />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
