import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Pill, Check, X, Clock, Camera, Sparkles } from 'lucide-react';
import type { MedicationScheduleItem } from '../../lib/api';

interface MedicationItemProps {
  medication: MedicationScheduleItem;
  onLog: (medicationId: string, status: 'taken' | 'missed', timeSlot: string) => void;
  onConfirmPhoto?: (medication: MedicationScheduleItem) => void;
  isLogging?: boolean;
}

export function MedicationItem({
  medication,
  onLog,
  onConfirmPhoto,
  isLogging = false,
}: MedicationItemProps) {
  const isTaken = medication.status === 'taken';
  const isMissed = medication.status === 'missed';
  const isPhotoConfirmed = medication.confirmationMethod === 'photo';

  const formatConfirmedTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`flex flex-col gap-2 p-4 rounded-xl border transition-all duration-200 ${
        isTaken
          ? 'bg-emerald-50/40 border-emerald-200/60 dark:bg-emerald-950/15 dark:border-emerald-900/30'
          : isMissed
          ? 'bg-rose-50/30 border-rose-200/60 dark:bg-rose-950/15 dark:border-rose-900/30'
          : 'bg-white border-slate-200/80 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Med Info */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
              isTaken
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : isMissed
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                : 'bg-[#0D9488]/15 text-[#0D9488]'
            }`}
          >
            <Pill className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                {medication.name}
              </h4>
              <Badge variant="outline" className="text-xs font-semibold px-2 py-0">
                {medication.dosage}
              </Badge>
              {isTaken && isPhotoConfirmed && (
                <Badge
                  variant="outline"
                  className="border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 flex items-center gap-1 font-semibold text-[11px]"
                >
                  <Sparkles className="w-3 h-3 text-teal-500" />
                  AI Verified {Math.round((medication.aiVerification?.confidence || 0.9) * 100)}%
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
              {medication.instructions || 'Take with food and water'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                <Clock className="h-3 w-3 text-slate-400" />
                Scheduled: {medication.timeSlot}
              </span>
            </div>
          </div>
        </div>

        {/* Action / Status Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {isTaken ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Badge
                variant="default"
                className="bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1 text-xs py-1 px-2.5 font-medium"
              >
                <Check className="h-3.5 w-3.5" />
                Taken {formatConfirmedTime(medication.confirmedAt)}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onConfirmPhoto?.(medication)}
                disabled={isLogging}
                className="h-8.5 px-2.5 text-xs text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 cursor-pointer font-medium"
                title="Verify or update dose with Gemini Vision photo"
              >
                <Camera className="h-3.5 w-3.5 mr-1" />
                {isPhotoConfirmed ? 'Update Photo' : 'Add Photo'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLog(medication.medicationId, 'missed', medication.timeSlot)}
                disabled={isLogging}
                className="text-xs h-8 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Reset
              </Button>
            </div>
          ) : isMissed ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Badge
                variant="destructive"
                className="flex items-center gap-1 text-xs py-1 px-2.5 font-medium"
              >
                <X className="h-3.5 w-3.5" />
                Missed
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onConfirmPhoto?.(medication)}
                disabled={isLogging}
                className="h-8.5 px-2.5 text-xs text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 cursor-pointer font-medium"
                title="Confirm dose with Gemini Vision photo"
              >
                <Camera className="h-3.5 w-3.5 mr-1" />
                Photo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onLog(medication.medicationId, 'taken', medication.timeSlot)}
                disabled={isLogging}
                className="text-xs h-8.5 text-emerald-700 hover:bg-emerald-50 border-emerald-300 cursor-pointer"
              >
                Mark Taken
              </Button>
            </div>
          ) : (
            /* Pending state with 1-click Taken, Photo confirmation, and Missed */
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onConfirmPhoto?.(medication)}
                disabled={isLogging}
                className="h-8.5 px-2.5 text-xs text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 cursor-pointer font-medium"
                title="Verify dose with Gemini Vision photo"
              >
                <Camera className="h-3.5 w-3.5 mr-1" />
                Photo
              </Button>
              <Button
                variant="teal"
                size="sm"
                onClick={() => onLog(medication.medicationId, 'taken', medication.timeSlot)}
                disabled={isLogging}
                className="h-8.5 px-3 text-xs font-semibold cursor-pointer shadow-xs"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Taken
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onLog(medication.medicationId, 'missed', medication.timeSlot)}
                disabled={isLogging}
                className="h-8.5 px-2.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 border-slate-200 cursor-pointer"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Missed
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* AI Clinical Note if photo verified */}
      {isTaken && isPhotoConfirmed && medication.aiVerification?.notes && (
        <div className="mt-1 pt-2 border-t border-emerald-100 dark:border-emerald-900/40 flex items-start gap-1.5 text-xs text-emerald-800 dark:text-emerald-300">
          <Sparkles className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            <span className="font-semibold">AI Verification Note:</span> {medication.aiVerification.notes}
          </span>
        </div>
      )}
    </div>
  );
}
