import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { LoginForm } from '../components/login/LoginForm';
import { RegisterForm } from '../components/login/RegisterForm';
import { useAuth } from '../hooks/useAuth';
import { Heart } from 'lucide-react';

interface LoginPageProps {
  onAuthSuccess?: (data: { user: any; circle: any }) => void;
}

export function LoginPage({ onAuthSuccess }: LoginPageProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/circle', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSuccess = (data: { user: any; circle: any }) => {
    if (onAuthSuccess) {
      onAuthSuccess(data);
    }
    navigate('/circle');
  };

  return (
    <div className="mx-auto max-w-md py-6 sm:py-10">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0D9488] text-white shadow-lg shadow-[#0D9488]/20">
          <Heart className="h-7 w-7 fill-white" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            CareCircle AI
          </h1>
        </div>
        <p className="text-sm text-slate-500 font-medium">
          Patient + Caregiver = One Adaptive Team
        </p>
      </div>

      {/* Switcher Tabs */}
      <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 p-1">
        <button
          type="button"
          onClick={() => setTab('login')}
          className={`rounded-lg py-2.5 text-sm font-semibold transition-all cursor-pointer ${
            tab === 'login'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setTab('register')}
          className={`rounded-lg py-2.5 text-sm font-semibold transition-all cursor-pointer ${
            tab === 'register'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Auth Card */}
      <Card className="shadow-lg border-slate-200/90 dark:border-slate-800">
        <CardContent className="pt-6">
          {tab === 'login' ? (
            <LoginForm onSuccess={handleSuccess} />
          ) : (
            <RegisterForm onSuccess={handleSuccess} />
          )}
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Secure email-based access for patients, caregivers, and families.
      </p>
    </div>
  );
}
