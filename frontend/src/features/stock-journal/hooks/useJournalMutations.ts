import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface JournalSavePayload {
  ticker: string;
  actionType: 'BUY' | 'SELL' | 'MEMO';
  price?: number;
  quantity?: number;
  feeling: 'CALM' | 'GREEDY' | 'FEAR' | 'NEUTRAL';
  notes: string;
  journalDate: string; // YYYY-MM-DD
  journalTime: string; // HH:mm
}

/**
 * 투자 일지 저장 및 삭제를 위한 React Query useMutation 훅
 */
export const useJournalMutations = () => {
  const queryClient = useQueryClient();

  // 신규 일지 저장 Mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: JournalSavePayload) => {
      const response = await axios.post('/api/journals', payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // 해당 종목의 일지 캐시 및 전체 일지 캐시 갱신
      queryClient.invalidateQueries({ queryKey: ['journals', variables.ticker.toUpperCase()] });
      queryClient.invalidateQueries({ queryKey: ['journals', 'all'] });
    },
  });

  // 일지 삭제 Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/api/journals/${id}`);
    },
    onSuccess: () => {
      // 모든 일지 관련 쿼리 캐시 갱신
      queryClient.invalidateQueries({ queryKey: ['journals'] });
    },
  });

  return {
    saveJournal: saveMutation.mutateAsync, // async 호출 지원을 위해 mutateAsync 반환
    isSaving: saveMutation.isPending,
    deleteJournal: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
