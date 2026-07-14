import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface TickerNewsDto {
  id: string;
  newsOferEntpCode: string;
  date: string;
  time: string;
  title: string;
  source: string;
  description: string;
  tickers: string[];
  link?: string;
}

/**
 * 특정 종목 티커(예: NVDA)와 관련된 국내 기사를 최신순으로 가져오는 React Query 훅
 */
export const useTickerNews = (ticker?: string) => {
  return useQuery<TickerNewsDto[]>({
    queryKey: ['news', 'ticker', ticker?.toUpperCase()],
    queryFn: async () => {
      if (!ticker) return [];
      const response = await axios.get('/api/stocks/news', {
        params: { ticker: ticker.toUpperCase() }
      });
      return response.data;
    },
    enabled: !!ticker,
    staleTime: 1000 * 60 * 5, // 5분 캐싱
  });
};
