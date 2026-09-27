import { Clock, User, Smile } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import type { MonitoringRecord } from '../../lib/api';

interface CheckinHistoryTimelineProps {
  records: MonitoringRecord[];
}

export function CheckinHistoryTimeline({ records }: CheckinHistoryTimelineProps) {
  if (!records || records.length === 0) {
    return (
      <Card className="border-dashed border-slate-200 dark:border-slate-800 bg-transparent text-center p-8">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <Smile className="w-6 h-6" />
        </div>
        <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">No check-ins recorded yet</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Start your first camera check-in to track daily stress levels, fatigue, and recovery patterns.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center justify-between">
          <span>Recent Wellness Check-ins</span>
          <span className="text-xs font-normal text-slate-500">
            {records.length} check-in{records.length === 1 ? '' : 's'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 p-0">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {records.map((rec) => {
            const date = new Date(rec.timestamp).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            });
            const time = new Date(rec.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            const isRelaxed = rec.data.stressScore < 40;
            const isMild = rec.data.stressScore >= 40 && rec.data.stressScore < 70;

            return (
              <div
                key={rec._id}
                className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs font-semibold px-2 py-0.5 ${
                        isRelaxed
                          ? 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-300'
                          : isMild
                          ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}
                    >
                      {rec.data.mood}
                    </Badge>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Stress: <span className="font-bold">{rec.data.stressScore}%</span>
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Fatigue: <span className="font-bold">{rec.data.fatigueScore}%</span>
                    </span>
                  </div>

                  {rec.data.expressionSummary && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                      {rec.data.expressionSummary}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 shrink-0">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {rec.userId?.fullName || 'User'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {date}, {time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
