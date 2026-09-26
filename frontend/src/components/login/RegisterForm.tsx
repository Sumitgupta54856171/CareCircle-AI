import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { RoleSelector } from './RoleSelector';
import { ConditionSelector } from './ConditionSelector';
import { authApi, setAuthToken } from '../../lib/api';
import { Mail, Lock, User, AlertCircle, Check } from 'lucide-react';

interface RegisterFormProps {
  onSuccess: (data: { user: any; circle: any }) => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'caregiver'>('patient');
  const [selectedConditions, setSelectedConditions] = useState<string[]>(['Stroke Recovery']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await authApi.register({
        fullName,
        email,
        password,
        role,
        conditions: role === 'patient' ? selectedConditions : [],
      });
      setAuthToken(res.token);
      setSuccess('Account created successfully!');
      onSuccess({ user: res.user, circle: res.circle });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check the entered details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 border border-emerald-200">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="e.g. Rahul Sharma"
            className="pl-10"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>
      </div>

      {/* Role Selection */}
      <RoleSelector role={role} onChange={setRole} />

      {/* Condition Selection (only for Patient) */}
      {role === 'patient' && (
        <ConditionSelector
          selectedConditions={selectedConditions}
          onChange={setSelectedConditions}
        />
      )}

      {/* Email Address */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            type="email"
            placeholder="you@example.com"
            className="pl-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Password (min 6 characters)
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            type="password"
            placeholder="••••••••"
            className="pl-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
      </div>

      <Button type="submit" className="w-full text-base font-semibold mt-2" disabled={submitting}>
        {submitting ? (
          <span className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Creating Account...
          </span>
        ) : (
          'Create My Account'
        )}
      </Button>
    </form>
  );
}
