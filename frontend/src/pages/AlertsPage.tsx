import { useState } from 'react';
import {
  Bell,
  Sparkles,
  RefreshCw,
  Sun,
  ShieldCheck,
  Send,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAlerts } from '../hooks/useAlerts';
import { AlertCard } from '../components/alerts/AlertCard';

export function AlertsPage() {
  const {
    activeAlerts,
    resolvedAlerts,
    activeCount,
    isLoading,
    refetch,
    acknowledgeAlert,
    resolveAlert,
    createAlert,
  } = useAlerts();

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);

  const handleAcknowledge = async (id: string) => {
    try {
      setProcessingId(id);
      await acknowledgeAlert(id);
    } catch (err: any) {
      alert(err.message || 'Failed to acknowledge alert.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      setProcessingId(id);
      await resolveAlert(id);
    } catch (err: any) {
      alert(err.message || 'Failed to resolve alert.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSendNudge = async () => {
    try {
      await createAlert({
        type: 'gentle_nudge',
        message: 'A warm reminder to check today’s wellness plan and take a 5-minute hydration break.',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to send nudge.');
    }
  };

  const handleSendEmergency = async () => {
    const confirm = window.confirm(
      'Are you sure you want to trigger an Emergency Signal for your Care Circle?'
    );
    if (!confirm) return;
    try {
      await createAlert({
        type: 'emergency_signal',
        severity: 'emergency',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to trigger emergency signal.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-teal-700 to-slate-900 text-white p-6 sm:p-8 shadow-lg">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-amber-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            Feature 7: Real-Time Alerts & Safety
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <span>Alerts & Safety</span>
            {activeCount > 0 ? (
              <Badge variant="destructive" className="text-xs px-2.5 py-0.5">
                {activeCount} Active
              </Badge>
            ) : (
              <Badge variant="outline" className="border-teal-300 text-teal-200 text-xs px-2.5 py-0.5">
                All Clear
              </Badge>
            )}
          </h1>
          <p className="text-sm text-teal-100 leading-relaxed">
            Gentle heads-ups — never alarms. Automatically triggered when medication photos fail,
            doses are missed, or high stress/fatigue is detected.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <Button
              onClick={handleSendNudge}
              className="bg-white text-slate-800 hover:bg-teal-50 font-bold shadow-md gap-1.5 text-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-teal-600" />
              Send Gentle Nudge
            </Button>
            <Button
              variant="outline"
              onClick={handleSendEmergency}
              className="bg-rose-500/20 border-rose-400/40 text-rose-200 hover:bg-rose-500/30 gap-1.5 text-xs cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
              Emergency Signal
            </Button>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 gap-1.5 text-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Decorative glow */}
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Active Alerts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            Active Circle Alerts
          </h2>
          <span className="text-xs text-slate-500">
            {activeAlerts.length} open heads-up{activeAlerts.length === 1 ? '' : 's'}
          </span>
        </div>

        {isLoading ? (
          <Card className="p-8 text-center border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Checking active alerts...</p>
          </Card>
        ) : activeAlerts.length > 0 ? (
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <AlertCard
                key={alert._id}
                alert={alert}
                onAcknowledge={handleAcknowledge}
                onResolve={handleResolve}
                isProcessing={processingId === alert._id}
              />
            ))}
          </div>
        ) : (
          /* Calming All Clear State matching build/ui.html */
          <Card className="border-dashed border-teal-200 dark:border-teal-900/60 p-10 text-center bg-teal-50/20 dark:bg-teal-950/10 rounded-2xl">
            <div className="w-14 h-14 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Sun className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
              All Clear
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4 leading-relaxed">
              Nothing needs your attention right now. We’re keeping a gentle watch on medications,
              check-ins, and well-being, and will notify your circle if anything requires a heads-up.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-teal-700 dark:text-teal-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              Protected by CareCircle Smart Monitoring
            </div>
          </Card>
        )}
      </div>

      {/* Resolved Alerts Section */}
      {resolvedAlerts.length > 0 && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowResolved(!showResolved)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Resolved Alerts ({resolvedAlerts.length})</span>
              <span className="text-[11px] underline ml-1">
                {showResolved ? 'Hide' : 'Show'}
              </span>
            </button>
          </div>

          {showResolved && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {resolvedAlerts.map((alert) => (
                <AlertCard
                  key={alert._id}
                  alert={alert}
                  onAcknowledge={handleAcknowledge}
                  onResolve={handleResolve}
                  isProcessing={processingId === alert._id}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default AlertsPage;
