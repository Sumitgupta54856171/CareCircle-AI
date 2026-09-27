import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { monitoringApi, type MonitoringRecord } from '../lib/api';

export function useMonitoring() {
  const queryClient = useQueryClient();

  const latestQuery = useQuery({
    queryKey: ['monitoring', 'latest'],
    queryFn: monitoringApi.getLatest,
  });

  const historyQuery = useQuery({
    queryKey: ['monitoring', 'history'],
    queryFn: monitoringApi.getHistory,
  });

  const submitCheckinMutation = useMutation({
    mutationFn: (formData: FormData) => monitoringApi.submitCheckin(formData),
    onSuccess: (data) => {
      // Set latest immediately in query cache for instant reactivity
      queryClient.setQueryData(['monitoring', 'latest'], { record: data.record });
      queryClient.invalidateQueries({ queryKey: ['monitoring'] });
    },
  });

  return {
    latestRecord: latestQuery.data?.record || null,
    history: (historyQuery.data?.records || []) as MonitoringRecord[],
    isLoadingLatest: latestQuery.isLoading,
    isLoadingHistory: historyQuery.isLoading,
    isSubmitting: submitCheckinMutation.isPending,
    submitCheckin: submitCheckinMutation.mutateAsync,
    refetchHistory: historyQuery.refetch,
    refetchLatest: latestQuery.refetch,
  };
}
