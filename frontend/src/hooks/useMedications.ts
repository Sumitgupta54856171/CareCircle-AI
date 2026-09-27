import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationApi } from '../lib/api';

export function useMedications() {
  const queryClient = useQueryClient();

  // Query today's medication schedule
  const todayScheduleQuery = useQuery({
    queryKey: ['medications', 'today'],
    queryFn: medicationApi.getTodaySchedule,
  });

  // Log status mutation (taken / missed)
  const logStatusMutation = useMutation({
    mutationFn: ({
      medicationId,
      status,
      timeSlot,
    }: {
      medicationId: string;
      status: 'taken' | 'missed';
      timeSlot: string;
    }) => medicationApi.logStatus(medicationId, { status, timeSlot }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications', 'today'] });
    },
  });

  // Add medication mutation
  const addMedicationMutation = useMutation({
    mutationFn: medicationApi.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['medications', 'all'] });
    },
  });

  // Confirm photo mutation
  const confirmPhotoMutation = useMutation({
    mutationFn: ({
      medicationId,
      formData,
    }: {
      medicationId: string;
      formData: FormData;
    }) => medicationApi.confirmPhoto(medicationId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications', 'today'] });
    },
  });

  return {
    schedule: todayScheduleQuery.data?.schedule || [],
    summary: todayScheduleQuery.data?.summary || {
      totalDoses: 0,
      takenDoses: 0,
      adherenceRate: 100,
    },
    isLoading: todayScheduleQuery.isLoading,
    isRefetching: todayScheduleQuery.isRefetching,
    refetch: todayScheduleQuery.refetch,
    logStatus: logStatusMutation.mutateAsync,
    isLogging: logStatusMutation.isPending,
    addMedication: addMedicationMutation.mutateAsync,
    isAdding: addMedicationMutation.isPending,
    confirmPhoto: confirmPhotoMutation.mutateAsync,
    isConfirmingPhoto: confirmPhotoMutation.isPending,
  };
}
