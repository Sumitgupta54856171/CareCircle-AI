import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../hooks/useAuth';
import { useCaregiverBurnout } from '../hooks/useCaregiverBurnout';
import {
  HeartPulse,
  Activity,
  BatteryCharging,
  Moon,
  Sparkles,
  AlertTriangle,
  Send,
  RefreshCw,
  CheckCircle2,
  Clock,
  Check,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CaregiverBurnoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    latestRecord,
    burnoutScore,
    stressScore,
    fatigueScore,
    capacityLevel,
    summary,
    recommendation,
    suggestedActions,
    history,
    isLoading,
    isSubmitting,
    isNudging,
    submitBurnout,
    sendRespiteNudge,
    refetch,
  } = useCaregiverBurnout();

  // Self-check form state
  const [sleepQuality, setSleepQuality] = useState<'restful' | 'interrupted' | 'poor'>(
    (latestRecord?.data?.sleepQuality as any) || 'interrupted'
  );
  const [hoursActive, setHoursActive] = useState<number>(
    latestRecord?.data?.hoursActive || 8
  );
  const [emotionalLoad, setEmotionalLoad] = useState<number>(
    latestRecord?.data?.emotionalLoad || 3
  );
  const [physicalFatigue, setPhysicalFatigue] = useState<number>(
    latestRecord?.data?.physicalFatigue || 3
  );
  const [feelingOverwhelmed, setFeelingOverwhelmed] = useState<boolean>(
    latestRecord?.data?.feelingOverwhelmed || false
  );
  const [notes, setNotes] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [nudgeSent, setNudgeSent] = useState<boolean>(false);

  const handleSubmitCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    try {
      const res = await submitBurnout({
        sleepQuality,
        hoursActive: Number(hoursActive),
        emotionalLoad: Number(emotionalLoad),
        physicalFatigue: Number(physicalFatigue),
        feelingOverwhelmed,
        notes,
      });

      if (res?.alert) {
        setSuccessMessage('Assessment analyzed. A safety alert was issued to your Care Circle for support.');
      } else {
        setSuccessMessage('Wellness assessment analyzed and logged successfully.');
      }
      setNotes('');
    } catch (err: any) {
      setSuccessMessage('Failed to submit check-in: ' + (err.message || 'Error'));
    }
  };

  const handleSendNudge = async () => {
    try {
      await sendRespiteNudge();
      setNudgeSent(true);
      setTimeout(() => setNudgeSent(false), 5000);
    } catch (err: any) {
      alert('Could not send nudge: ' + err.message);
    }
  };

  const getCapacityColor = (cap: string) => {
    switch (cap) {
      case 'optimal':
        return {
          bg: 'bg-emerald-500',
          text: 'text-emerald-700 dark:text-emerald-300',
          badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
          border: 'border-emerald-200 dark:border-emerald-900',
          label: 'Optimal Capacity',
          desc: 'Balanced stamina & manageable circle demands',
        };
      case 'moderate':
        return {
          bg: 'bg-teal-500',
          text: 'text-teal-700 dark:text-teal-300',
          badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300',
          border: 'border-teal-200 dark:border-teal-900',
          label: 'Moderate Load',
          desc: 'Steady care routine; brief rest breaks recommended',
        };
      case 'pacing_needed':
        return {
          bg: 'bg-amber-500',
          text: 'text-amber-700 dark:text-amber-300',
          badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
          border: 'border-amber-200 dark:border-amber-900',
          label: 'Pacing Needed',
          desc: 'Noticeable fatigue; transfer non-critical tasks',
        };
      case 'burnout_risk':
      default:
        return {
          bg: 'bg-rose-500',
          text: 'text-rose-700 dark:text-rose-300',
          badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
          border: 'border-rose-200 dark:border-rose-900',
          label: 'Burnout Risk',
          desc: 'High exhaustion; circle backup & respite required',
        };
    }
  };

  const capStyle = getCapacityColor(capacityLevel);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-rose-50 via-teal-50/50 to-slate-50 p-5 border border-rose-200/60 dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900 dark:border-rose-900/40">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/20">
            <HeartPulse className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Caregiver Wellness & Resilience
              </h1>
              <Badge variant="teal" className="text-[10px] font-bold">
                Caregiver Support
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl mt-0.5">
              Protecting the protector with multidimensional load tracking, sleep deficit detection, and AI respite guidance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="cursor-pointer h-9 px-3 gap-1.5"
            disabled={isLoading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={handleSendNudge}
            disabled={isNudging || nudgeSent}
            className="cursor-pointer h-9 px-3 gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
          >
            {nudgeSent ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Nudge Sent!
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Respite Nudge
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Grid: Burnout Meter + AI Co-Pilot Advice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Burnout Meter & Capacity Gauge Card */}
        <Card className={`border shadow-sm ${capStyle.border} bg-white dark:bg-slate-900`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-[#0D9488]" />
                Live Burnout Gauge
              </CardTitle>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${capStyle.badge}`}>
                {capStyle.label}
              </span>
            </div>
            <CardDescription className="text-xs">{capStyle.desc}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Visual Gauge */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/40 text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="h-36 w-36 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    className="stroke-slate-200 dark:stroke-slate-700"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    className={`${
                      burnoutScore >= 85
                        ? 'stroke-rose-500'
                        : burnoutScore >= 68
                        ? 'stroke-amber-500'
                        : burnoutScore >= 40
                        ? 'stroke-teal-500'
                        : 'stroke-emerald-500'
                    } transition-all duration-700 ease-out`}
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - burnoutScore / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                    {burnoutScore}%
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Load Index
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <Shield className="h-3.5 w-3.5 text-[#0D9488]" />
                <span>Assessed for <strong>{user?.fullName || 'Caregiver'}</strong></span>
              </div>
            </div>

            {/* Sub-Metric Pill Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Stress</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{stressScore}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${stressScore}%` }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Fatigue</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{fatigueScore}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${fatigueScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Context Summary */}
            <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Clinical Observation:
              </p>
              <p className="leading-relaxed">{summary}</p>
            </div>
          </CardContent>
        </Card>

        {/* AI Co-Pilot Respite Advice & Interactive Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Recommendation Card */}
          <Card className="border-teal-200/70 bg-gradient-to-br from-white via-teal-50/20 to-slate-50 shadow-sm dark:border-teal-900/60 dark:from-slate-900 dark:to-slate-900">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0D9488]/15 text-[#0D9488]">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      AI Co-Pilot Respite Guidance
                    </CardTitle>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Tailored specifically to current caregiver capacity and recovery needs
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Personalized Support
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-3.5 dark:border-teal-950/80 dark:bg-teal-950/20">
                <p className="text-xs text-teal-950 dark:text-teal-200 leading-relaxed font-medium">
                  "{recommendation}"
                </p>
              </div>

              {/* Action Chips */}
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#0D9488]" />
                  Suggested Micro-Actions for Today:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedActions.map((action, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-xs dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0D9488]" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Chat Shortcut */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Need personalized respite strategies?
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/chat')}
                  className="h-8 text-xs text-[#0D9488] hover:text-[#0D9488] hover:bg-[#0D9488]/10 cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                  Chat with Co-Pilot
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick 1-Minute Self-Check Form */}
          <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BatteryCharging className="h-4.5 w-4.5 text-[#0D9488]" />
                1-Minute Caregiver Self-Check
              </CardTitle>
              <CardDescription className="text-xs">
                Log your sleep quality and emotional strain to update circle load balancing.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmitCheckin} className="space-y-4">
                {successMessage && (
                  <div className="rounded-xl bg-teal-50 border border-teal-200 p-3 text-xs text-teal-800 font-medium dark:bg-teal-950/40 dark:border-teal-900 dark:text-teal-300 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0D9488]" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Sleep Quality Selector */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                    Last Night's Sleep Quality
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'restful', label: 'Restful', icon: Moon, desc: 'Deep & uninterrupted' },
                      { val: 'interrupted', label: 'Interrupted', icon: Clock, desc: 'Woke up 2+ times' },
                      { val: 'poor', label: 'Poor / Deficit', icon: AlertTriangle, desc: '< 5 hrs or restless' },
                    ].map((opt) => {
                      const Icon = opt.icon;
                      const active = sleepQuality === opt.val;
                      return (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setSleepQuality(opt.val as any)}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            active
                              ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488] font-bold shadow-xs'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          <Icon className="h-4 w-4 mb-1" />
                          <span className="text-xs">{opt.label}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{opt.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Emotional Load Scale */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <span className="uppercase tracking-wider">Emotional Load Rating</span>
                    <span className="text-[#0D9488] font-bold">{emotionalLoad} / 5</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { num: 1, label: 'Low' },
                      { num: 2, label: 'Mild' },
                      { num: 3, label: 'Moderate' },
                      { num: 4, label: 'Heavy' },
                      { num: 5, label: 'Overloaded' },
                    ].map((item) => (
                      <button
                        key={item.num}
                        type="button"
                        onClick={() => setEmotionalLoad(item.num)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          emotionalLoad === item.num
                            ? 'border-[#0D9488] bg-[#0D9488] text-white shadow-xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {item.num}
                        <span className="block text-[9px] font-normal opacity-85">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Physical Fatigue Scale */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <span className="uppercase tracking-wider">Physical Fatigue Rating</span>
                    <span className="text-rose-500 font-bold">{physicalFatigue} / 5</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { num: 1, label: 'Energized' },
                      { num: 2, label: 'Light' },
                      { num: 3, label: 'Weary' },
                      { num: 4, label: 'Exhausted' },
                      { num: 5, label: 'Depleted' },
                    ].map((item) => (
                      <button
                        key={item.num}
                        type="button"
                        onClick={() => setPhysicalFatigue(item.num)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          physicalFatigue === item.num
                            ? 'border-rose-500 bg-rose-500 text-white shadow-xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {item.num}
                        <span className="block text-[9px] font-normal opacity-85">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hours Active + Feeling Overwhelmed Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                      Active Caregiving Hours Today
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={24}
                      value={hoursActive}
                      onChange={(e) => setHoursActive(Number(e.target.value))}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                      Feeling Overwhelmed Today?
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFeelingOverwhelmed(true)}
                        className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          feelingOverwhelmed
                            ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                            : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900'
                        }`}
                      >
                        Yes, I am
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeelingOverwhelmed(false)}
                        className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          !feelingOverwhelmed
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900'
                        }`}
                      >
                        Managing OK
                      </button>
                    </div>
                  </div>
                </div>

                {/* Optional Note */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Caregiver Reflections / Triggers (Optional)
                  </label>
                  <Input
                    placeholder="e.g. Rahul woke up twice last night; struggling with transfers today"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full font-bold bg-[#0D9488] hover:bg-[#0D9488]/90 text-white cursor-pointer"
                  disabled={isSubmitting}
                >
                  <HeartPulse className="h-4 w-4 mr-1.5" />
                  {isSubmitting ? 'Evaluating Wellness Signals...' : 'Analyze Resilience & Wellness'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Historical Assessment Log */}
      {history.length > 0 && (
        <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              Recent Caregiver Resilience Assessments ({history.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 dark:divide-slate-800 dark:border-slate-800">
              {history.map((rec) => {
                const badge = getCapacityColor(rec.data?.capacityLevel || 'moderate');
                return (
                  <div
                    key={rec._id}
                    className="flex flex-wrap items-center justify-between gap-3 p-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 font-bold text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {rec.data?.burnoutScore}%
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {rec.userId?.fullName || 'Caregiver'}
                          </span>
                          <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${badge.badge}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {rec.data?.expressionSummary}
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-400">
                      {new Date(rec.timestamp).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
