import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Sparkles, RefreshCw, ShieldCheck, Activity, HeartPulse } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useMonitoring } from '../hooks/useMonitoring';
import { CameraCheckinModal } from '../components/monitoring/CameraCheckinModal';
import { CheckinResultCard } from '../components/monitoring/CheckinResultCard';
import { CheckinHistoryTimeline } from '../components/monitoring/CheckinHistoryTimeline';

export default function CheckinPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    latestRecord,
    history,
    isLoadingLatest,
    submitCheckin,
    refetchLatest,
    refetchHistory,
  } = useMonitoring();

  const handleRefresh = () => {
    refetchLatest();
    refetchHistory();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-900 text-white p-6 sm:p-8 shadow-lg">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-teal-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            Gemini 2.5 Flash Multimodal Vision
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Wellness Camera Check-in
          </h1>
          <p className="text-sm text-teal-100 leading-relaxed">
            Take a 10-second facial check-in to monitor signs of stress, fatigue, and recovery
            progression. Seamlessly synced with your Care Circle.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-teal-900 hover:bg-teal-50 font-bold shadow-md gap-2 cursor-pointer transition-all"
            >
              <Camera className="w-4 h-4 text-teal-700" />
              Start Camera Check-in
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="bg-teal-800/40 border-teal-600/50 text-white hover:bg-teal-700/50 gap-1.5 text-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/burnout')}
              className="bg-rose-500/20 border-rose-300/40 text-rose-100 hover:bg-rose-500/30 gap-1.5 text-xs cursor-pointer"
            >
              <HeartPulse className="w-3.5 h-3.5 text-rose-300" />
              Caregiver Load
            </Button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Grid: Latest Check-in & How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Latest Check-in Card (2 cols) */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              Current Wellness State
            </h2>
          </div>

          {isLoadingLatest ? (
            <Card className="p-8 text-center border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading latest check-in...</p>
            </Card>
          ) : latestRecord ? (
            <CheckinResultCard record={latestRecord} isLatest={true} />
          ) : (
            <Card className="border-dashed border-teal-200 dark:border-teal-900/60 p-8 text-center bg-teal-50/30 dark:bg-teal-950/20 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-600 flex items-center justify-center mx-auto mb-3">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                No check-in recorded today
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Perform your first camera check-in to provide your Care Circle with up-to-date
                wellness and fatigue signals.
              </p>
              <Button
                variant="teal"
                onClick={() => setIsModalOpen(true)}
                className="font-semibold text-xs gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                Perform Check-in Now
              </Button>
            </Card>
          )}
        </div>

        {/* Informative Side Card (1 col) */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            Check-in Guidelines
          </h2>

          <Card className="border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70">
            <CardContent className="p-4 space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
                    Position Face in Oval
                  </h4>
                  <p className="text-slate-500 leading-relaxed">
                    Ensure adequate front lighting so your facial features are clearly visible.
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
                    Deep Breathing Cadence
                  </h4>
                  <p className="text-slate-500 leading-relaxed">
                    Follow the guided breathing ring for a moment to settle into a calm resting state.
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
                    AI Wellness Summary
                  </h4>
                  <p className="text-slate-500 leading-relaxed">
                    Gemini Multimodal analyzes stress markers, fatigue signals, and suggests personalized recovery steps.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Historical Check-ins Timeline */}
      <div className="pt-2">
        <CheckinHistoryTimeline records={history} />
      </div>

      {/* Camera Check-in Modal */}
      <CameraCheckinModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={submitCheckin}
      />
    </div>
  );
}
