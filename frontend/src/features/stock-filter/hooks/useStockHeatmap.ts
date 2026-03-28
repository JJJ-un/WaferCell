// @/entities/stock/api/useStockQuery.ts
import { useQuery } from '@tanstack/react-query';
import { fetchStocks } from '@/entities/stock/api/fetchStock.ts';
import { mapHeatmapToStocks } from '@/entities/stock/lib/stockMapper';

export const useStockQuery = () => {
  return useQuery({
    queryKey: ['stocks', 'heatmap'], // 캐시 키
    queryFn: fetchStocks,           // 데이터 패칭 함수
    select: (data) => mapHeatmapToStocks(data), // 가져온 즉시 평탄화해서 반환
    staleTime: Infinity,            // 주식 기본판은 소켓이 업데이트하므로 자동 리페치 방지
  });
};