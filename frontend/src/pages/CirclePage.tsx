import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { circleApi } from '../lib/api';
import {
  Users,
  ShieldCheck,
  Copy,
  Check,
  UserPlus,
  Sparkles,
  ArrowRight,
  Activity,
} from 'lucide-react';

interface CirclePageProps {
  user: any;
  circle: any;
  onCircleUpdated: (circle: any) => void;
}

export function CirclePage({ user, circle, onCircleUpdated }: CirclePageProps) {
  const [joinCode, setJoinCode] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopyInviteCode = () => {
    if (circle?.inviteCode) {
      navigator.clipboard.writeText(circle.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleJoinCircle = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage('');
    if (!joinCode.trim()) return;
    setIsSubmitting(true);

    try {
      const isEmail = joinCode.includes('@');
      const res = await circleApi.joinCircle(
        isEmail ? { patientEmail: joinCode.trim() } : { inviteCode: joinCode.trim() }
      );
      onCircleUpdated(res.circle);
      setActionMessage('Successfully linked to Care Circle!');
      setJoinCode('');
    } catch (err: any) {
      setActionMessage(err.message || 'Could not join circle.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteCaregiver = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage('');
    if (!inviteEmail.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await circleApi.inviteEmail(inviteEmail.trim());
      setActionMessage(res.message);
      setInviteEmail('');
      const updated = await circleApi.getMyCircle();
      onCircleUpdated(updated);
    } catch (err: any) {
      setActionMessage(err.message || 'Invite failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-[#0D9488]/15 via-blue-50 to-slate-50 p-4 border border-[#0D9488]/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D9488] text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Feature 1: User Roles & Care Circle</h2>
            <p className="text-xs text-slate-600">
              Email-authenticated linking between Patient and Caregiver in one shared circle.
            </p>
          </div>
        </div>
        <Badge variant="teal" className="text-xs px-3 py-1">
          Phase 1 Active
        </Badge>
      </div>

      {circle ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Circle Card */}
          <Card className="md:col-span-2 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#0D9488]" />
                  <CardTitle>{circle.name}</CardTitle>
                </div>
                <Badge variant="outline">Circle Active</Badge>
              </div>
              <CardDescription>
                Primary Patient: <span className="font-semibold text-slate-800">{circle.patientId?.fullName || user.fullName}</span> ({circle.patientId?.email || user.email})
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Conditions */}
              {circle.patientId?.conditions?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Tracked Health Conditions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {circle.patientId.conditions.map((cond: string, i: number) => (
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
                  Circle Members ({circle.members?.length || 1})
                </p>
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/50">
                  {circle.members?.map((m: any, idx: number) => (
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

              {actionMessage && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800 font-medium">
                  {actionMessage}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Linking / Invite Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Circle Linking</CardTitle>
              <CardDescription>Share code or invite via email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Unique Circle Invite Code
                </label>
                <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-2.5 border border-slate-200">
                  <span className="font-mono text-base font-bold tracking-widest text-[#0D9488] flex-1">
                    {circle.inviteCode}
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
                  Share this code with your caregiver or family member.
                </p>
              </div>

              <form onSubmit={handleInviteCaregiver} className="space-y-2">
                <label className="text-xs font-medium text-slate-600 block">
                  Invite Member via Email
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
                  <Button type="submit" size="sm" className="h-9 px-3 shrink-0" disabled={isSubmitting}>
                    <UserPlus className="h-3.5 w-3.5 mr-1" />
                    Invite
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* If logged in Caregiver without a linked circle */
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
              {actionMessage && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800 font-medium">
                  {actionMessage}
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
              <Button type="submit" className="w-full font-semibold" disabled={isSubmitting}>
                Join Care Circle
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Guide box */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="font-semibold text-slate-800 text-sm mb-2 flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#0D9488]" />
          Feature 1 Test Verification Checklist:
        </h3>
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
          <li><strong>Patient</strong> logs in via email and views their circle and unique code.</li>
          <li><strong>Caregiver</strong> logs in via email and enters the invite code or patient email to join.</li>
          <li>Both roles see each other under <strong>Circle Members</strong>.</li>
        </ul>
      </div>
    </div>
  );
}
