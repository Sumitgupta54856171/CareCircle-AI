import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../lib/api';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCredentials, setUser, setCircle, logout } from '../store/slices/authSlice';

export function useAuth() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { user, circle, token, isAuthenticated } = useAppSelector((state) => state.auth);

  // Query /auth/me if token exists
  const authQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const data = await authApi.me();
      dispatch(setUser(data.user));
      dispatch(setCircle(data.circle));
      return data;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      dispatch(setCredentials({ user: data.user, token: data.token, circle: data.circle }));
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['circle'] });
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      dispatch(setCredentials({ user: data.user, token: data.token, circle: data.circle }));
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['circle'] });
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  const handleLogout = () => {
    dispatch(logout());
    queryClient.clear();
  };

  return {
    user,
    circle,
    isAuthenticated,
    isLoading: authQuery.isLoading && !!token,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: handleLogout,
    refetchUser: authQuery.refetch,
  };
}
