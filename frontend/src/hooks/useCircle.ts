import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { circleApi } from '../lib/api';
import { useAppDispatch } from '../store/hooks';
import { setCircle } from '../store/slices/authSlice';

export function useCircle() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  // Query current circle
  const circleQuery = useQuery({
    queryKey: ['circle', 'current'],
    queryFn: async () => {
      const data = await circleApi.getMyCircle();
      dispatch(setCircle(data));
      return data;
    },
  });

  // Join circle mutation
  const joinCircleMutation = useMutation({
    mutationFn: circleApi.joinCircle,
    onSuccess: (data) => {
      dispatch(setCircle(data.circle));
      queryClient.setQueryData(['circle', 'current'], data.circle);
      queryClient.invalidateQueries({ queryKey: ['circle'] });
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  // Invite by email mutation
  const inviteEmailMutation = useMutation({
    mutationFn: circleApi.inviteEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circle'] });
    },
  });

  return {
    circle: circleQuery.data,
    isLoading: circleQuery.isLoading,
    refetch: circleQuery.refetch,
    joinCircle: joinCircleMutation.mutateAsync,
    isJoining: joinCircleMutation.isPending,
    inviteEmail: inviteEmailMutation.mutateAsync,
    isInviting: inviteEmailMutation.isPending,
  };
}
