import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { LoginForm } from '../components/login/LoginForm';
import { RegisterForm } from '../components/login/RegisterForm';
import { Heart } from 'lucide-react';

interface LoginPageProps {
  onAuthSuccess: (data: { user: any; circle: any }) => void;
}

export function LoginPage({ onAuthSuccess }: LoginPageProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  return (
    <div className="mx-auto max-w-md py-6 sm:py-10">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0D9488] text-white shadow-lg shadow-[#0D9488]/20">
          <Heart className="h-7 w-7 fill-white" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">CareCircle AI</h1>
          <Badge variant="teal" className="text-xs">Phase 1</Badge>
        </div>
        <p className="text-sm text-slate-500 font-medium">
          Patient + Caregiver = One Adaptive Team
        </p>
      </div>

      {/* Switcher Tabs */}
      <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-200/80 p-1">
        <button
          type="button"
          onClick={() => setTab('login')}
          className={`rounded-lg py-2.5 text-sm font-semibold transition-all cursor-pointer ${
            tab === 'login'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setTab('register')}
          className={`rounded-lg py-2.5 text-sm font-semibold transition-all cursor-pointer ${
            tab === 'register'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Auth Card containing Login or Register component */}
      <Card className="shadow-lg border-slate-200/90">
        <CardContent className="pt-6">
          {tab === 'login' ? (
            <LoginForm onSuccess={onAuthSuccess} />
          ) : (
            <RegisterForm onSuccess={onAuthSuccess} />
          )}
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-slate-500">
        Secure email-based authentication • Feature 1: User Roles & Care Circle
      </p>
    </div>
  );
}
