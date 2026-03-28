// @/entities/stock/api/useStockQuery.ts
import { useQuery } from '@tanstack/react-query';
import { fetchHeatmap } from '../api/fetchHeatmap';

export const useHeatmapQuery = () => {
  return useQuery({
    queryKey: ['stocks', 'heatmap'], // 캐시 키
    queryFn: fetchHeatmap,           // 데이터 패칭 함수
    staleTime: Infinity,            // 주식 기본판은 소켓이 업데이트하므로 자동 리페치 방지
  });
};