import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskProgressCard } from '../components/tasks/TaskProgressCard';
import { TaskItemRow } from '../components/tasks/TaskItemRow';
import { AddTaskDialog } from '../components/tasks/AddTaskDialog';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import {
  Calendar,
  Plus,
  Sparkles,
  RefreshCw,
  Trophy,
  CheckCircle2,
  Camera,
} from 'lucide-react';

export function PlanPage() {
  const navigate = useNavigate();
  const { user, circle } = useAuth();
  const { plan, metrics, isLoading, refetch, toggleTask, isToggling } = useTasks();

  const [activeTab, setActiveTab] = useState<'patient' | 'caregiver'>(
    user?.role === 'caregiver' ? 'caregiver' : 'patient'
  );
  const [isAddOpen, setIsAddOpen] = useState(false);

  const patientName = circle?.patientId?.fullName || (user?.role === 'patient' ? user.fullName : 'Patient');
  const caregiverMember = circle?.members?.find((m) => m.roleInCircle === 'primary_caregiver');
  const caregiverName = caregiverMember?.userId?.fullName || (user?.role === 'caregiver' ? user.fullName : 'Caregiver');

  const currentTasks = activeTab === 'patient' ? plan?.patientTasks || [] : plan?.caregiverTasks || [];

  const handleToggle = async (team: 'patient' | 'caregiver', taskId: string) => {
    try {
      await toggleTask({ team, taskId });
    } catch (err: any) {
      alert(err.message || 'Failed to update task.');
    }
  };

  if (isLoading && !plan) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0D9488] border-t-transparent" />
          <p className="text-xs text-slate-500 font-medium">Loading daily adaptive plan...</p>
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
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Feature 4: Daily Tasks & Simple Plan
              </h2>
              <Badge variant="teal" className="text-[11px] py-0">Phase 1 Complete</Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Personalized routines for Patient and Caregiver functioning as one adaptive team.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="cursor-pointer h-9 px-2.5"
            title="Refresh plan"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/checkin')}
            className="cursor-pointer h-9 font-semibold text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/50"
          >
            <Camera className="h-4 w-4 mr-1.5" />
            Check-in
          </Button>

          <Button
            variant="teal"
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="cursor-pointer h-9 font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Progress Metric Card with Segmented Switcher */}
      <TaskProgressCard
        currentTab={activeTab}
        onTabChange={setActiveTab}
        patientName={patientName}
        caregiverName={caregiverName}
        patientMetric={metrics.patient}
        caregiverMetric={metrics.caregiver}
        overallMetric={metrics.overall}
      />

      {/* AI Reasoning Insight */}
      {plan?.aiReasoning && (
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/40 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 text-[#0D9488] shrink-0" />
          <span>
            <strong>AI Co-Pilot Plan Note:</strong> {plan.aiReasoning}
          </span>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {activeTab === 'patient' ? `${patientName}’s Routine` : `${caregiverName}’s Support Checklist`}
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Click any task to toggle complete
          </span>
        </div>

        {currentTasks.length > 0 ? (
          <div className="space-y-2.5">
            {currentTasks.map((task) => (
              <TaskItemRow
                key={task.id}
                task={task}
                team={activeTab}
                onToggle={handleToggle}
                isToggling={isToggling}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 text-center py-10">
            <CardContent className="space-y-3">
              <Calendar className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No tasks scheduled for this role yet.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddOpen(true)}
                className="cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add First Task
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Phase 1 Completion Summary Card */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/60 to-teal-50/40 p-5 dark:border-emerald-900/40 dark:from-emerald-950/20 dark:to-slate-900">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
            <Trophy className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Phase 1: MVP Core Fully Built & Connected
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every critical MVP milestone is operational:
              <br />
              <strong>1. Auth & Care Circle</strong> (Email auth + linking) →
              <strong> 2. Medications</strong> (Schedule + 1-click adherence logging) →
              <strong> 3. AI Co-Pilot</strong> (Vertex AI Gemini 2.5 Flash context reasoning) →
              <strong> 4. Daily Tasks</strong> (Shared patient + caregiver adaptive plan).
            </p>
          </div>
        </div>
      </div>

      {/* Add Task Dialog */}
      <AddTaskDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        defaultTeam={activeTab}
      />
    </div>
  );
}
