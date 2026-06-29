import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface JournalResponseDto {
  id: number;
  ticker: string;
  actionType: 'BUY' | 'SELL' | 'MEMO';
  price: number | null;
  quantity: number | null;
  feeling: 'CALM' | 'GREEDY' | 'FEAR' | 'NEUTRAL';
  notes: string;
  journalDate: string; // YYYY-MM-DD
  journalTime: string | null;
  createdAt: string;
}

/**
 * 투자 일지 목록을 가져오는 React Query useQuery 훅
 */
export const useJournalQueries = (ticker?: string) => {
  
  // 1. 특정 종목의 일지 목록 조회
  const tickerQuery = useQuery<JournalResponseDto[]>({
    queryKey: ['journals', ticker?.toUpperCase()],
    queryFn: async () => {
      if (!ticker) return [];
      const response = await axios.get(`/api/journals/${ticker.toUpperCase()}`);
      return response.data;
    },
    enabled: !!ticker,
  });

  // 2. 전체 종목의 일지 목록 조회 (My Diary 대시보드용)
  const allQuery = useQuery<JournalResponseDto[]>({
    queryKey: ['journals', 'all'],
    queryFn: async () => {
      const response = await axios.get('/api/journals');
      return response.data;
    },
  });

  return {
    tickerJournals: tickerQuery.data || [],
    isTickerLoading: tickerQuery.isLoading,
    allJournals: allQuery.data || [],
    isAllLoading: allQuery.isLoading,
    refetchTicker: tickerQuery.refetch,
    refetchAll: allQuery.refetch,
  };
};
