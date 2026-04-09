import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { transformToHeatmapData } from '../lib/transformToHeatmapData';
import { type IndexedStockResponse, type UpdatedStock } from '@entities/stock/types/stock.types';

/**
 * React Query 캐시의 주식 데이터를 실시간으로 업데이트하는 전용 훅
 */
export const useUpdateStockData = () => {
  const queryClient = useQueryClient();

  const updateStockData = useCallback((data: UpdatedStock) => {
    queryClient.setQueryData(['stocks', 'heatmap'], (prev: IndexedStockResponse | undefined) => {
      if (!prev) return prev;
      
      return transformToHeatmapData(prev, data);
    });
  }, [queryClient]);

  return { updateStockData };
};
