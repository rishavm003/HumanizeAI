import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store.js';

export default function ProtectedRoute({ children }) {
  const { user, loading, setLoading } = useAuthStore();
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => {
        if (useAuthStore.getState().loading) {
          setLoading(false);
          setTimeoutReached(true);
          console.warn('Auth loading timed out after 5 seconds');
        }
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [loading, setLoading]);

  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
