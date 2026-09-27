import { useState } from 'react';
import { AdherenceCard } from '../components/medications/AdherenceCard';
import { MedicationItem } from '../components/medications/MedicationItem';
import { AddMedicationDialog } from '../components/medications/AddMedicationDialog';
import { MedicationPhotoModal } from '../components/medications/MedicationPhotoModal';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useMedications } from '../hooks/useMedications';
import type { MedicationScheduleItem } from '../lib/api';
import {
  Pill,
  Plus,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';

export function MedicationsPage() {
  const {
    schedule,
    summary,
    isLoading,
    refetch,
    logStatus,
    confirmPhoto,
  } = useMedications();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [photoModalMed, setPhotoModalMed] = useState<MedicationScheduleItem | null>(null);
  const [loggingMedId, setLoggingMedId] = useState<string | null>(null);

  const handleLogStatus = async (
    medicationId: string,
    status: 'taken' | 'missed',
    timeSlot: string
  ) => {
    try {
      setLoggingMedId(medicationId);
      await logStatus({ medicationId, status, timeSlot });
    } catch (err: any) {
      alert(err.message || 'Error updating medication status.');
    } finally {
      setLoggingMedId(null);
    }
  };

  // Find next pending medication for the highlight card
  const pendingMed = schedule.find((m) => m.status === 'pending');

  // Group by slot
  const morningDoses = schedule.filter((m) => m.timeSlot <= '11:59');
  const afternoonDoses = schedule.filter(
    (m) => m.timeSlot >= '12:00' && m.timeSlot <= '16:59'
  );
  const eveningDoses = schedule.filter((m) => m.timeSlot >= '17:00');

  if (isLoading && schedule.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0D9488] border-t-transparent" />
          <p className="text-xs text-slate-500 font-medium">Loading medication schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-[#0D9488]/15 via-blue-50 to-slate-50 p-4 border border-[#0D9488]/20 dark:from-[#0D9488]/20 dark:via-slate-900 dark:to-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D9488] text-white">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Medications & Adherence Schedule
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Shared real-time tracking with 1-click adherence logging and smart photo verification.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="cursor-pointer h-9 px-2.5"
            title="Refresh schedule"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button
            variant="teal"
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="cursor-pointer h-9 font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Medication
          </Button>
        </div>
      </div>

      {/* Adherence Overview Metric Card */}
      {schedule.length > 0 && (
        <AdherenceCard
          adherenceRate={summary.adherenceRate}
          totalDoses={summary.totalDoses}
          takenDoses={summary.takenDoses}
        />
      )}

      {/* Current / Pending Highlight from ui.html */}
      {pendingMed ? (
        <Card className="border-amber-200/80 bg-gradient-to-br from-amber-50/60 to-orange-50/30 dark:border-amber-900/40 dark:from-amber-950/20 dark:to-slate-900 shadow-sm">
          <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                <Clock className="h-3.5 w-3.5" />
                <span>Next Scheduled Dose · Waiting on you</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {pendingMed.name}{' '}
                <span className="text-sm font-medium text-slate-500">
                  {pendingMed.dosage}
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Scheduled for {pendingMed.timeSlot} — {pendingMed.instructions || 'Take with food and water'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="teal"
                onClick={() => handleLogStatus(pendingMed.medicationId, 'taken', pendingMed.timeSlot)}
                disabled={loggingMedId === pendingMed.medicationId}
                className="h-10 px-5 font-bold cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Mark as Taken
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : schedule.length > 0 ? (
        <Card className="border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/15 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
              All of today's scheduled doses are confirmed! Great adherence consistency.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Schedule Grouped Sections */}
      {schedule.length > 0 ? (
        <div className="space-y-6">
          {/* Morning Doses */}
          {morningDoses.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                Morning Schedule
              </h3>
              <div className="space-y-2.5">
                {morningDoses.map((med, idx) => (
                  <MedicationItem
                    key={`${med.medicationId}-${med.timeSlot}-${idx}`}
                    medication={med}
                    onLog={handleLogStatus}
                    onConfirmPhoto={(m) => setPhotoModalMed(m)}
                    isLogging={loggingMedId === med.medicationId}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Afternoon Doses */}
          {afternoonDoses.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                Afternoon Schedule
              </h3>
              <div className="space-y-2.5">
                {afternoonDoses.map((med, idx) => (
                  <MedicationItem
                    key={`${med.medicationId}-${med.timeSlot}-${idx}`}
                    medication={med}
                    onLog={handleLogStatus}
                    onConfirmPhoto={(m) => setPhotoModalMed(m)}
                    isLogging={loggingMedId === med.medicationId}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Evening Doses */}
          {eveningDoses.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                Evening Schedule
              </h3>
              <div className="space-y-2.5">
                {eveningDoses.map((med, idx) => (
                  <MedicationItem
                    key={`${med.medicationId}-${med.timeSlot}-${idx}`}
                    medication={med}
                    onLog={handleLogStatus}
                    onConfirmPhoto={(m) => setPhotoModalMed(m)}
                    isLogging={loggingMedId === med.medicationId}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 text-center py-12">
          <CardContent className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0D9488]/15 text-[#0D9488]">
              <Pill className="h-7 w-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                No Medications Scheduled Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Add prescribed medications for the Care Circle so both Patient and Caregiver can monitor daily adherence.
              </p>
            </div>
            <Button
              variant="teal"
              onClick={() => setIsAddOpen(true)}
              className="cursor-pointer font-semibold"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Your First Medication
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Medication Dialog Modal */}
      <AddMedicationDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Medication Photo Confirmation Modal */}
      <MedicationPhotoModal
        isOpen={!!photoModalMed}
        medication={photoModalMed}
        onClose={() => setPhotoModalMed(null)}
        onConfirmPhoto={(medicationId, formData) => confirmPhoto({ medicationId, formData })}
      />
    </div>
  );
}
