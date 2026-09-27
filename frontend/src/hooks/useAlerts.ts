import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertApi, type AlertItem } from '../lib/api';

export function useAlerts() {
  const queryClient = useQueryClient();

  const alertsQuery = useQuery({
    queryKey: ['alerts'],
    queryFn: alertApi.getAll,
    refetchInterval: 8000, // Background poll every 8s for live circle heads-up
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (id: string) => alertApi.acknowledge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => alertApi.resolve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const createAlertMutation = useMutation({
    mutationFn: alertApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const allAlerts: AlertItem[] = alertsQuery.data?.alerts || [];
  const activeAlerts = allAlerts.filter(
    (a) => a.status === 'new' || a.status === 'acknowledged'
  );
  const resolvedAlerts = allAlerts.filter((a) => a.status === 'resolved');
  const activeCount = alertsQuery.data?.activeCount ?? activeAlerts.length;

  return {
    alerts: allAlerts,
    activeAlerts,
    resolvedAlerts,
    activeCount,
    isLoading: alertsQuery.isLoading,
    refetch: alertsQuery.refetch,
    acknowledgeAlert: acknowledgeMutation.mutateAsync,
    isAcknowledging: acknowledgeMutation.isPending,
    resolveAlert: resolveMutation.mutateAsync,
    isResolving: resolveMutation.isPending,
    createAlert: createAlertMutation.mutateAsync,
    isCreating: createAlertMutation.isPending,
  };
}
