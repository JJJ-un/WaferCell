import { apiClient } from '@/shared/api/apiClient';
import { type StockNews } from '../types/stock.types';

/**
 * 최신 해외 속보 목록을 가져옵니다. (무한 스크롤 페이징 지원)
 */
export const fetchNewsList = async (start?: number): Promise<StockNews[]> => {
  console.log("📡 [apiClient.get 요청 시도] start:", start);
  try {
    const { data } = await apiClient.get<StockNews[]>('/stocks/news', {
      params: { start }
    });
    console.log("📡 [apiClient.get 요청 성공] 수신된 뉴스 개수:", data?.length, "데이터:", data);
    return data;
  } catch (error) {
    console.error("❌ [apiClient.get 요청 실패] 에러 발생:", error);
    throw error;
  }
};


