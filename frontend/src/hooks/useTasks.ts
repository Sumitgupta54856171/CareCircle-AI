import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../lib/api';

export function useTasks() {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: taskApi.getTodayPlan,
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({
      team,
      taskId,
      status,
    }: {
      team: 'patient' | 'caregiver';
      taskId: string;
      status?: 'completed' | 'pending';
    }) => taskApi.toggleTask(team, taskId, status),
    onSuccess: (data) => {
      queryClient.setQueryData(['tasks', 'today'], {
        plan: data.plan,
        metrics: data.metrics,
      });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'today'] });
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: taskApi.addTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'today'] });
    },
  });

  const generatePlanMutation = useMutation({
    mutationFn: taskApi.generateAdaptivePlan,
    onSuccess: (data) => {
      queryClient.setQueryData(['tasks', 'today'], {
        plan: data.plan,
        metrics: data.metrics,
      });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'today'] });
    },
  });

  return {
    plan: tasksQuery.data?.plan,
    metrics: tasksQuery.data?.metrics || {
      patient: { total: 0, completed: 0, percentage: 0 },
      caregiver: { total: 0, completed: 0, percentage: 0 },
      overall: { total: 0, completed: 0, percentage: 0 },
    },
    isLoading: tasksQuery.isLoading,
    refetch: tasksQuery.refetch,
    toggleTask: toggleTaskMutation.mutateAsync,
    isToggling: toggleTaskMutation.isPending,
    addTask: addTaskMutation.mutateAsync,
    isAdding: addTaskMutation.isPending,
    generateAdaptivePlan: generatePlanMutation.mutateAsync,
    isGenerating: generatePlanMutation.isPending,
  };
}
