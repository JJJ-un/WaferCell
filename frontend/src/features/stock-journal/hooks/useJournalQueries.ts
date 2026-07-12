import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
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

const PAGE_SIZE = 3;

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

  // 2. 전체 종목의 일지 목록 조회 (감정 통계 도넛 차트 등 전체 데이터가 필요한 용도)
  const allQuery = useQuery<JournalResponseDto[]>({
    queryKey: ['journals', 'all'],
    queryFn: async () => {
      const response = await axios.get('/api/journals');
      return response.data;
    },
  });

  // 3. 전체 일지 무한스크롤 조회 (타임라인 피드용)
  const allInfiniteQuery = useInfiniteQuery<JournalResponseDto[]>({
    queryKey: ['journals', 'all', 'infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await axios.get('/api/journals', {
        params: { page: pageParam, size: PAGE_SIZE },
      });
      return response.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // 마지막 페이지의 아이템 수가 PAGE_SIZE 미만이면 더 이상 없음
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length; // 다음 페이지 번호
    },
  });

  return {
    tickerJournals: tickerQuery.data || [],
    isTickerLoading: tickerQuery.isLoading,
    allJournals: allQuery.data || [],
    isAllLoading: allQuery.isLoading,
    refetchTicker: tickerQuery.refetch,
    refetchAll: () => {
      allQuery.refetch();
      allInfiniteQuery.refetch();
    },
    // 무한스크롤 전용 반환값
    infiniteJournals: allInfiniteQuery.data?.pages.flat() || [],
    isInfiniteLoading: allInfiniteQuery.isLoading,
    isFetchingNextPage: allInfiniteQuery.isFetchingNextPage,
    hasNextPage: allInfiniteQuery.hasNextPage,
    fetchNextPage: allInfiniteQuery.fetchNextPage,
  };
};
