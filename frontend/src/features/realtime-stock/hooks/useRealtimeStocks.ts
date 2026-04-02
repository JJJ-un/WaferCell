import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStomp } from '@/shared/model/contexts/StompContext';
import { updateHeatmapData, type IndexedStockHeatmap } from '@/entities/stock/model/updateHeatmap';
import { type UpdatedStock } from '@/entities/stock/model/updateIndividualStock';

/**
 * 실시간 주가 및 거래대금 강도, RSI, SOXX 상대수익률을 동기화하는 훅
 */
export const useRealtimeStocks = () => {
  const { isConnected, subscribe } = useStomp();
  const queryClient = useQueryClient();

  const handleUpdate = useCallback((data: UpdatedStock) => {
    queryClient.setQueryData(['stocks', 'heatmap'], (prev: IndexedStockHeatmap | undefined) => {
      if (!prev) return prev;
      return updateHeatmapData(prev, data);
    });
  }, [queryClient]);

  useEffect(() => {
    if (!isConnected || !subscribe) return;

    const subscription = subscribe('/topic/stocks', handleUpdate);

    return () => {
      subscription?.unsubscribe();
    };
  }, [isConnected, subscribe, handleUpdate]);
};

