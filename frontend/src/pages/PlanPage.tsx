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
import { useMonitoring } from '../hooks/useMonitoring';
import { useCaregiverBurnout } from '../hooks/useCaregiverBurnout';
import {
  Calendar,
  Plus,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Camera,
  HeartPulse,
  BrainCircuit,
  Activity,
  Layers,
} from 'lucide-react';

export function PlanPage() {
  const navigate = useNavigate();
  const { user, circle } = useAuth();
  const {
    plan,
    metrics,
    isLoading,
    refetch,
    toggleTask,
    isToggling,
    generateAdaptivePlan,
    isGenerating,
  } = useTasks();

  const { latestRecord: latestCheckin } = useMonitoring();
  const { burnoutScore, capacityLevel } = useCaregiverBurnout();

  const [activeTab, setActiveTab] = useState<'patient' | 'caregiver'>(
    user?.role === 'caregiver' ? 'caregiver' : 'patient'
  );
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string>('');

  const patientName =
    circle?.patientId?.fullName || (user?.role === 'patient' ? user.fullName : 'Patient');
  const caregiverMember = circle?.members?.find((m) => m.roleInCircle === 'primary_caregiver');
  const caregiverName =
    caregiverMember?.userId?.fullName || (user?.role === 'caregiver' ? user.fullName : 'Caregiver');

  const currentTasks = activeTab === 'patient' ? plan?.patientTasks || [] : plan?.caregiverTasks || [];

  const handleToggle = async (team: 'patient' | 'caregiver', taskId: string) => {
    try {
      await toggleTask({ team, taskId });
    } catch (err: any) {
      alert(err.message || 'Failed to update task.');
    }
  };

  const handleGeneratePlan = async () => {
    setSuccessBanner('');
    try {
      const res = await generateAdaptivePlan();
      setSuccessBanner(
        `Adaptive daily care plan successfully updated! Calibrated for ${res.patientEnergyLevel || 'patient'} and ${res.caregiverCapacity || 'caregiver'}.`
      );
      setTimeout(() => setSuccessBanner(''), 7000);
    } catch (err: any) {
      alert('Failed to synthesize plan: ' + (err.message || 'Server error'));
    }
  };

  if (isLoading && !plan) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0D9488] border-t-transparent" />
          <p className="text-xs text-slate-500 font-medium">Loading daily care plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-teal-50 via-cyan-50 to-slate-50 p-5 border border-teal-200/70 dark:from-teal-950/20 dark:via-slate-900 dark:to-slate-900 dark:border-teal-900/40">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0D9488] to-cyan-600 text-white shadow-md shadow-teal-600/20">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Adaptive Daily Care Plan
              </h1>
              <Badge variant="teal" className="text-[10px] font-bold">
                Adaptive Care Coordination
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl mt-0.5">
              Personalized routines orchestrating patient recovery goals, physical stamina, and caregiver capacity into one synchronized team schedule.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            onClick={() => setIsAddOpen(true)}
            className="cursor-pointer h-9 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Custom Task
          </Button>

          <Button
            size="sm"
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="cursor-pointer h-9 px-3.5 gap-1.5 font-bold bg-gradient-to-r from-[#0D9488] to-cyan-600 hover:from-[#0D9488]/90 hover:to-cyan-600/90 text-white shadow-md shadow-teal-600/20"
          >
            <Sparkles className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating Care Plan...' : 'Generate AI Care Plan'}
          </Button>
        </div>
      </div>

      {/* Success Banner */}
      {successBanner && (
        <div className="rounded-xl bg-teal-50 border border-teal-200 p-3 text-xs text-teal-900 font-medium dark:bg-teal-950/40 dark:border-teal-900 dark:text-teal-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Telemetry Anchor Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Patient Telemetry */}
        <div
          onClick={() => navigate('/checkin')}
          className="rounded-xl border border-slate-200/90 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 cursor-pointer hover:border-[#0D9488]/50 transition-colors shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[10px]">
              <Camera className="h-3.5 w-3.5 text-[#0D9488]" />
              Patient Energy Telemetry
            </span>
            <span className="text-[#0D9488] text-[10px] font-bold">Check-in</span>
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
            {plan?.patientEnergyLevel || (latestCheckin?.data ? `${latestCheckin.data.mood} (${latestCheckin.data.fatigueScore}% Fatigue)` : 'Moderate (Balanced)')}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
            {circle?.patientId?.conditions?.length ? `Tracking: ${circle.patientId.conditions.join(', ')}` : 'Standard recovery module'}
          </p>
        </div>

        {/* Caregiver Telemetry */}
        <div
          onClick={() => navigate('/burnout')}
          className="rounded-xl border border-slate-200/90 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 cursor-pointer hover:border-rose-400/50 transition-colors shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[10px]">
              <HeartPulse className="h-3.5 w-3.5 text-rose-500" />
              Caregiver Load Telemetry
            </span>
            <span className="text-rose-500 text-[10px] font-bold">{burnoutScore}%</span>
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
            {plan?.caregiverCapacity || (capacityLevel === 'optimal' ? 'High Capacity (Optimal)' : capacityLevel === 'moderate' ? 'Medium Capacity (Balanced)' : 'Low Capacity (Respite Needed)')}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
            {burnoutScore >= 70 ? 'Respite protection active in task allocation' : 'Balanced support task allowance'}
          </p>
        </div>

        {/* Health Balancing */}
        <div className="rounded-xl border border-teal-200/70 bg-gradient-to-br from-teal-50/50 to-white p-3 dark:border-teal-900/60 dark:from-slate-900 dark:to-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[10px] text-teal-700 dark:text-teal-300">
              <Activity className="h-3.5 w-3.5 text-[#0D9488]" />
              Dynamic Health Balancing
            </span>
            <span className="text-xs font-bold text-teal-600">Active</span>
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Recovery & Rest Protocol
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Synchronized patient recovery & caregiver pacing
          </p>
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

      {/* AI Reasoning Insight Card */}
      {plan?.aiReasoning && (
        <Card className="border-teal-200/80 bg-gradient-to-br from-white via-teal-50/20 to-slate-50 dark:border-teal-900/60 dark:from-slate-900 dark:to-slate-900 shadow-sm">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#0D9488]" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  AI Co-Pilot Care Rationale:
                </span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                Care Plan Analysis
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium pl-6">
              "{plan.aiReasoning}"
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#0D9488]" />
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {activeTab === 'patient'
                ? `${patientName}’s Personalized Routine (${currentTasks.length} tasks)`
                : `${caregiverName}’s Coordinated Checklist (${currentTasks.length} tasks)`}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Tap to mark complete
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
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddOpen(true)}
                  className="cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add First Task
                </Button>
                <Button
                  size="sm"
                  onClick={handleGeneratePlan}
                  className="cursor-pointer bg-[#0D9488] text-white"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Generate AI Care Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Coordinated Care Delivery Pipeline Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <Activity className="h-4 w-4 text-[#0D9488]" />
            Coordinated Care Delivery Pipeline:
          </h4>
          <span className="text-[10px] text-slate-400">One Adaptive Team</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
            <p className="font-bold text-slate-700 dark:text-slate-300">1. Daily Telemetry</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Wellness check-in, load metrics & adherence
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100 dark:bg-teal-950/30 dark:border-teal-900">
            <p className="font-bold text-teal-800 dark:text-teal-300">2. Adaptive Evaluation</p>
            <p className="text-[10px] text-teal-600 dark:text-teal-400 mt-0.5">
              Personalized recovery posture & capacity balance
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-100 dark:bg-cyan-950/30 dark:border-cyan-900">
            <p className="font-bold text-cyan-800 dark:text-cyan-300">3. Care Synthesis</p>
            <p className="text-[10px] text-cyan-600 dark:text-cyan-400 mt-0.5">
              Tailored routines, rest pauses & clinical guidance
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
            <p className="font-bold text-slate-700 dark:text-slate-300">4. Live Team Sync</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Synchronized across family, patient & caregiver
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
