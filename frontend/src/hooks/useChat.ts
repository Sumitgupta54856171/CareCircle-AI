import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../lib/api';

export function useChat() {
  const queryClient = useQueryClient();

  // Query chat history
  const chatHistoryQuery = useQuery({
    queryKey: ['chat', 'history'],
    queryFn: chatApi.getHistory,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => chatApi.sendMessage(message),
    onSuccess: (data) => {
      // Append the new message pair to cache
      queryClient.setQueryData<any[]>(['chat', 'history'], (old = []) => [
        ...old,
        data.userMessage,
        data.aiMessage,
      ]);
      queryClient.invalidateQueries({ queryKey: ['chat', 'history'] });
    },
  });

  return {
    messages: chatHistoryQuery.data || [],
    isLoading: chatHistoryQuery.isLoading,
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    refetch: chatHistoryQuery.refetch,
  };
}
