import { apiClient } from '@/shared/api/apiClient';
import { type StockNews } from '../types/stock.types';

/**
 * 최신 해외 속보 목록을 가져옵니다. (무한 스크롤 페이징 지원)
 */
export const fetchNewsList = async (lastSrno?: string): Promise<StockNews[]> => {
  const { data } = await apiClient.get<StockNews[]>('/stocks/news', {
    params: { lastSrno }
  });
  return data;
};
