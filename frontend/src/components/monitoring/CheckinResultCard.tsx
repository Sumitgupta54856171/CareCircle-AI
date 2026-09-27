import { HeartPulse, Sparkles, Smile, ShieldAlert, Clock, User, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import type { MonitoringRecord } from '../../lib/api';

interface CheckinResultCardProps {
  record: MonitoringRecord;
  isLatest?: boolean;
}

export function CheckinResultCard({ record, isLatest = false }: CheckinResultCardProps) {
  const { stressScore, fatigueScore, fallRiskScore, mood, expressionSummary, recommendation } =
    record.data;

  // Format stress color & badge
  const getStressInfo = (score: number) => {
    if (score < 40) return { label: 'Low Stress', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500' };
    if (score < 70) return { label: 'Moderate Stress', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500' };
    return { label: 'Elevated Stress', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500' };
  };

  // Format fatigue color & badge
  const getFatigueInfo = (score: number) => {
    if (score < 40) return { label: 'Well Rested', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500' };
    if (score < 70) return { label: 'Mild Fatigue', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500' };
    return { label: 'High Fatigue', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500' };
  };

  const stressInfo = getStressInfo(stressScore);
  const fatigueInfo = getFatigueInfo(fatigueScore);

  const formattedDate = new Date(record.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="border-teal-100 dark:border-teal-900/50 shadow-sm overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Smile className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>Wellness Check-in</span>
                {isLatest && (
                  <Badge variant="teal" className="text-[11px] py-0 px-2 font-medium">
                    Latest
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formattedDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {record.userId?.fullName || 'Circle Member'}
                </span>
              </div>
            </div>
          </div>

          <Badge variant="outline" className="px-3 py-1 text-xs font-semibold bg-slate-50 dark:bg-slate-800/80">
            Mood: <span className="ml-1 text-teal-600 dark:text-teal-400 font-bold">{mood}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4 text-sm">
        {/* Metric Gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Stress Meter */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-teal-500" />
                Stress Level
              </span>
              <span className={`text-xs font-bold ${stressInfo.color}`}>
                {stressScore}% ({stressInfo.label})
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${stressInfo.bg} rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(stressScore, 100)}%` }}
              />
            </div>
          </div>

          {/* Fatigue Meter */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Fatigue Level
              </span>
              <span className={`text-xs font-bold ${fatigueInfo.color}`}>
                {fatigueScore}% ({fatigueInfo.label})
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${fatigueInfo.bg} rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(fatigueScore, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Fall Risk if calculated */}
        {fallRiskScore !== null && fallRiskScore !== undefined && (
          <div className="p-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-xs">
            <span className="text-blue-700 dark:text-blue-300 flex items-center gap-1.5 font-medium">
              <ShieldAlert className="w-3.5 h-3.5" />
              Mobility / Fall Risk Estimate
            </span>
            <span className="font-bold text-blue-800 dark:text-blue-200">{fallRiskScore}% (Low Risk)</span>
          </div>
        )}

        {/* Expression Summary */}
        {expressionSummary && (
          <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              AI Vision Observation
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
              {expressionSummary}
            </p>
          </div>
        )}

        {/* AI Recommendation */}
        {recommendation && (
          <div className="p-3.5 rounded-xl bg-teal-50/80 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              CareCircle Co-Pilot Recommendation
            </div>
            <p className="text-teal-950 dark:text-teal-100 text-xs leading-relaxed font-medium">
              {recommendation}
            </p>
          </div>
        )}

        {/* Synced confirmation */}
        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-teal-500" />
            Analyzed by AI Wellness Vision Check-in
          </span>
          <span>Source: Camera check-in</span>
        </div>
      </CardContent>
    </Card>
  );
}
