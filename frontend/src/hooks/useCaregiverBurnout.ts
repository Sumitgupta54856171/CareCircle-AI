import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  monitoringApi,
  type CaregiverBurnoutSubmission,
  type CaregiverBurnoutRecord,
} from '../lib/api';

export function useCaregiverBurnout() {
  const queryClient = useQueryClient();

  // Fetch latest caregiver burnout record
  const latestQuery = useQuery({
    queryKey: ['caregiver-burnout-latest'],
    queryFn: monitoringApi.getCaregiverBurnoutLatest,
    refetchInterval: 10000,
  });

  // Fetch recent history of caregiver load assessments
  const historyQuery = useQuery({
    queryKey: ['caregiver-burnout-history'],
    queryFn: monitoringApi.getCaregiverBurnoutHistory,
    refetchInterval: 20000,
  });

  // Mutation to submit self-check burnout assessment
  const submitMutation = useMutation({
    mutationFn: (payload: CaregiverBurnoutSubmission) =>
      monitoringApi.submitCaregiverBurnout(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregiver-burnout-latest'] });
      queryClient.invalidateQueries({ queryKey: ['caregiver-burnout-history'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  // Mutation to trigger circle respite nudge
  const nudgeMutation = useMutation({
    mutationFn: monitoringApi.sendCaregiverRespiteNudge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const latestRecord: CaregiverBurnoutRecord | null =
    latestQuery.data?.record || null;
  const history: CaregiverBurnoutRecord[] = historyQuery.data?.records || [];

  const burnoutScore = latestRecord?.data?.burnoutScore ?? 42;
  const stressScore = latestRecord?.data?.stressScore ?? 38;
  const fatigueScore = latestRecord?.data?.fatigueScore ?? 40;
  const capacityLevel = latestRecord?.data?.capacityLevel ?? 'moderate';
  const summary =
    latestRecord?.data?.expressionSummary ||
    'Caregiver load is currently within manageable parameters.';
  const recommendation =
    latestRecord?.data?.recommendation ||
    'Prioritize a brief 15-minute rest pause today and share remaining tasks with your circle.';
  const suggestedActions =
    latestRecord?.data?.suggestedActions || [
      'Take a 15-min rest pause',
      'Hydrate with a glass of water',
      'Review circle task delegation',
    ];

  return {
    latestRecord,
    burnoutScore,
    stressScore,
    fatigueScore,
    capacityLevel,
    summary,
    recommendation,
    suggestedActions,
    history,
    isLoading: latestQuery.isLoading,
    isSubmitting: submitMutation.isPending,
    isNudging: nudgeMutation.isPending,
    submitBurnout: submitMutation.mutateAsync,
    sendRespiteNudge: nudgeMutation.mutateAsync,
    refetch: () => {
      latestQuery.refetch();
      historyQuery.refetch();
    },
  };
}
