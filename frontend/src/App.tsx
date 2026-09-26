import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { authApi, circleApi, setAuthToken, removeAuthToken, getAuthToken } from './lib/api';
import {
  Users,
  User,
  Heart,
  ShieldCheck,
  Copy,
  Check,
  LogOut,
  Mail,
  Lock,
  UserPlus,
  Sparkles,
  ArrowRight,
  Activity,
  AlertCircle,
} from 'lucide-react';

interface UserData {
  _id: string;
  email: string;
  fullName: string;
  role: 'patient' | 'caregiver';
  conditions: string[];
}

interface CircleMember {
  userId: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
  };
  roleInCircle: string;
  joinedAt: string;
}

interface CircleData {
  _id: string;
  name: string;
  inviteCode: string;
  patientId: {
    _id: string;
    fullName: string;
    email: string;
    conditions: string[];
    phone?: string;
  };
  members: CircleMember[];
}

const COMMON_CONDITIONS = [
  'Stroke Recovery',
  'Type 2 Diabetes',
  'Elderly Care',
  'Hypertension',
  'Postnatal Recovery',
  'Mobility Support',
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [currentCircle, setCurrentCircle] = useState<CircleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'patient' | 'caregiver'>('patient');
  const [selectedConditions, setSelectedConditions] = useState<string[]>(['Stroke Recovery']);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Circle action states
  const [joinCode, setJoinCode] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [circleActionMessage, setCircleActionMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Check auth on load
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then((data) => {
        setCurrentUser(data.user);
        setCurrentCircle(data.circle);
      })
      .catch(() => {
        removeAuthToken();
        setCurrentUser(null);
        setCurrentCircle(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const refreshCircle = async () => {
    try {
      const circle = await circleApi.getMyCircle();
      setCurrentCircle(circle);
    } catch (err: any) {
      console.log('No circle found yet');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      if (authMode === 'login') {
        const res = await authApi.login({ email, password });
        setAuthToken(res.token);
        setCurrentUser(res.user);
        setCurrentCircle(res.circle);
        setFormSuccess('Logged in successfully!');
      } else {
        const res = await authApi.register({
          email,
          password,
          fullName,
          role,
          conditions: role === 'patient' ? selectedConditions : [],
        });
        setAuthToken(res.token);
        setCurrentUser(res.user);
        setCurrentCircle(res.circle);
        setFormSuccess('Account created and logged in!');
      }
    } catch (err: any) {
      setFormError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    setCurrentUser(null);
    setCurrentCircle(null);
    setEmail('');
    setPassword('');
  };

  const toggleCondition = (cond: string) => {
    if (selectedConditions.includes(cond)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== cond));
    } else {
      setSelectedConditions([...selectedConditions, cond]);
    }
  };

  const handleCopyInviteCode = () => {
    if (currentCircle?.inviteCode) {
      navigator.clipboard.writeText(currentCircle.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleJoinCircle = async (e: React.FormEvent) => {
    e.preventDefault();
    setCircleActionMessage('');
    if (!joinCode.trim()) return;

    try {
      const isEmail = joinCode.includes('@');
      const res = await circleApi.joinCircle(
        isEmail ? { patientEmail: joinCode.trim() } : { inviteCode: joinCode.trim() }
      );
      setCurrentCircle(res.circle);
      setCircleActionMessage('Successfully linked to Care Circle!');
      setJoinCode('');
    } catch (err: any) {
      setCircleActionMessage(err.message || 'Could not join circle.');
    }
  };

  const handleInviteCaregiver = async (e: React.FormEvent) => {
    e.preventDefault();
    setCircleActionMessage('');
    if (!inviteEmail.trim()) return;

    try {
      const res = await circleApi.inviteEmail(inviteEmail.trim());
      setCircleActionMessage(res.message);
      setInviteEmail('');
      await refreshCircle();
    } catch (err: any) {
      setCircleActionMessage(err.message || 'Invite failed.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-[#0D9488] border-t-transparent" />
          <p className="text-sm font-medium text-slate-600">Connecting to CareCircle AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D9488] text-white shadow-sm shadow-[#0D9488]/20">
              <Heart className="h-5 w-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-slate-900 text-lg">CareCircle AI</span>
                <Badge variant="teal" className="text-[11px] py-0 px-2">
                  Feature 1
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium">Patient + Caregiver = One Adaptive Team</p>
            </div>
          </div>

          {currentUser && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-900">{currentUser.fullName}</span>
                <span className="text-xs text-slate-500">{currentUser.email}</span>
              </div>
              <Badge variant={currentUser.role === 'caregiver' ? 'amber' : 'teal'}>
                {currentUser.role === 'caregiver' ? 'Caregiver' : 'Patient'}
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-600 hover:text-red-600">
                <LogOut className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {!currentUser ? (
          /* ================= AUTHENTICATION VIEW (FEATURE 1) ================= */
          <div className="mx-auto max-w-md">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {authMode === 'login' ? 'Welcome Back' : 'Create CareCircle Account'}
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Email-based secure authentication for Patients & Caregivers
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-200/70 p-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setFormError('');
                }}
                className={`rounded-lg py-2 text-sm font-medium transition-all ${
                  authMode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setFormError('');
                }}
                className={`rounded-lg py-2 text-sm font-medium transition-all ${
                  authMode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>

            <Card className="shadow-md">
              <form onSubmit={handleAuthSubmit}>
                <CardContent className="space-y-4 pt-6">
                  {formError && (
                    <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {formSuccess && (
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 border border-emerald-200">
                      <Check className="h-4 w-4 shrink-0" />
                      <span>{formSuccess}</span>
                    </div>
                  )}

                  {/* Register Specific Fields */}
                  {authMode === 'register' && (
                    <>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Full Name
                        </label>
                        <Input
                          placeholder="e.g. Rahul Sharma"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>

                      {/* Role Selector */}
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Your Role
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => setRole('patient')}
                            className={`flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition-all ${
                              role === 'patient'
                                ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0F766E] font-semibold'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <User className="h-5 w-5 mb-1" />
                            <span className="text-sm">Patient</span>
                            <span className="text-[11px] text-slate-500 font-normal">Receiving care</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setRole('caregiver')}
                            className={`flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition-all ${
                              role === 'caregiver'
                                ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0F766E] font-semibold'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <ShieldCheck className="h-5 w-5 mb-1" />
                            <span className="text-sm">Caregiver</span>
                            <span className="text-[11px] text-slate-500 font-normal">Supporting patient</span>
                          </button>
                        </div>
                      </div>

                      {/* Condition Selection (Patient only) */}
                      {role === 'patient' && (
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Primary Conditions / Care Focus
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {COMMON_CONDITIONS.map((cond) => {
                              const active = selectedConditions.includes(cond);
                              return (
                                <button
                                  key={cond}
                                  type="button"
                                  onClick={() => toggleCondition(cond)}
                                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                                    active
                                      ? 'bg-[#0D9488] text-white shadow-xs'
                                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  }`}
                                >
                                  {cond}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Email & Password */}
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
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Password
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
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3">
                  <Button type="submit" className="w-full text-base font-semibold" disabled={submitting}>
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Please wait...
                      </span>
                    ) : authMode === 'login' ? (
                      'Sign In to CareCircle'
                    ) : (
                      'Create My Account'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        ) : (
          /* ================= CARE CIRCLE DASHBOARD (FEATURE 1) ================= */
          <div className="space-y-6">
            {/* Phase 1 banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-[#0D9488]/15 via-blue-50 to-slate-50 p-4 border border-[#0D9488]/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D9488] text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Feature 1: User Roles + Care Circle Ready</h2>
                  <p className="text-xs text-slate-600">
                    Email-authenticated linking between Patient and Caregiver in one shared circle.
                  </p>
                </div>
              </div>
              <Badge variant="teal" className="text-xs px-3 py-1">
                Phase 1 Active
              </Badge>
            </div>

            {/* Care Circle Status Banner */}
            {currentCircle ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Circle Overview Card */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-[#0D9488]" />
                        <CardTitle>{currentCircle.name}</CardTitle>
                      </div>
                      <Badge variant="outline">Circle Active</Badge>
                    </div>
                    <CardDescription>
                      Patient: <span className="font-semibold text-slate-800">{currentCircle.patientId?.fullName}</span> ({currentCircle.patientId?.email})
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    {/* Conditions */}
                    {currentCircle.patientId?.conditions?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          Tracked Conditions
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {currentCircle.patientId.conditions.map((cond, i) => (
                            <Badge key={i} variant="teal" className="font-normal text-xs">
                              {cond}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Members List */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Circle Members ({currentCircle.members?.length || 1})
                      </p>
                      <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/50">
                        {currentCircle.members?.map((m, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                                {m.userId?.fullName?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800">{m.userId?.fullName}</p>
                                <p className="text-xs text-slate-500">{m.userId?.email}</p>
                              </div>
                            </div>
                            <Badge variant={m.roleInCircle === 'primary_caregiver' ? 'amber' : 'secondary'}>
                              {m.roleInCircle?.replace('_', ' ')}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Feedback message */}
                    {circleActionMessage && (
                      <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800 font-medium">
                        {circleActionMessage}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Right Side: Invite / Link Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Care Circle Linking</CardTitle>
                    <CardDescription>Share code or invite by email</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Invite Code Box */}
                    <div>
                      <label className="text-xs font-medium text-slate-600 block mb-1">
                        Unique Circle Invite Code
                      </label>
                      <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-2.5 border border-slate-200">
                        <span className="font-mono text-base font-bold tracking-widest text-[#0D9488] flex-1">
                          {currentCircle.inviteCode}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyInviteCode}
                          className="h-8 px-2.5"
                        >
                          {copiedCode ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Give this code to your caregiver so they can join your circle.
                      </p>
                    </div>

                    {/* Invite by Email */}
                    <form onSubmit={handleInviteCaregiver} className="space-y-2">
                      <label className="text-xs font-medium text-slate-600 block">
                        Invite Caregiver via Email
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="caregiver@example.com"
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="h-9 text-xs"
                          required
                        />
                        <Button type="submit" size="sm" className="h-9 px-3 shrink-0">
                          <UserPlus className="h-3.5 w-3.5 mr-1" />
                          Invite
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* If logged in user (Caregiver) hasn't joined a circle yet */
              <Card className="max-w-xl mx-auto shadow-md">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#0D9488]/15 text-[#0D9488]">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <CardTitle>Join a Patient's Care Circle</CardTitle>
                  <CardDescription>
                    Connect with your patient to see shared plans, medication adherence, and alerts.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleJoinCircle} className="space-y-4">
                    {circleActionMessage && (
                      <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800 font-medium">
                        {circleActionMessage}
                      </div>
                    )}
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Patient Circle Invite Code or Email
                      </label>
                      <Input
                        placeholder="e.g. CARE-XXXX or patient@example.com"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full font-semibold">
                      Join Care Circle
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Feature 1 Verification Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-slate-800 text-sm mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#0D9488]" />
                How to Test Feature 1:
              </h3>
              <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-4">
                <li>
                  <strong>Patient account</strong>: Register with an email as a <em>Patient</em> (select conditions like Stroke / Diabetes). Your Care Circle and unique code (e.g. <span className="font-mono font-semibold">CARE-XXXX</span>) are instantly created.
                </li>
                <li>
                  <strong>Caregiver account</strong>: In an incognito tab or after logging out, register another email as a <em>Caregiver</em>.
                </li>
                <li>
                  <strong>Join Circle</strong>: The Caregiver enters the Patient's Circle Invite Code (or Patient's email) and clicks <em>Join Care Circle</em>.
                </li>
                <li>
                  <strong>Verified</strong>: Both users are now permanently linked in the same Care Circle!
                </li>
              </ol>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
