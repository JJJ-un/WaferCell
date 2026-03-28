import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStomp } from '@/shared/model/contexts/StompContext';
import { type Stock } from '@/shared/types/Semiconductor';

interface StockUpdate {
  ticker: string;
  price: string;
  rate: string;
  volume: string;
  timestamp: string;
  tradingValue: string;
  strength: string;
  volumeIntensity: string;
}

const transformUpdate = (data: StockUpdate) => ({
  price: parseFloat(data.price),
  changePercent: parseFloat(data.rate),
  volume: parseInt(data.volume, 10),
  tradingValue: parseFloat(data.tradingValue),
  strength: parseFloat(data.strength),
  volumeIntensity: parseFloat(data.volumeIntensity),
});

export const useRealtimeStocks = () => {
  const { isConnected, subscribe } = useStomp();
  const queryClient = useQueryClient(); // 리액트 쿼리 캐시에 접근하기 위한 클라이언트

  const handleUpdate = useCallback((stockUpdate: StockUpdate) => {
    // 1. ['stocks', 'heatmap'] 키를 가진 캐시 데이터를 직접 수정합니다.
    queryClient.setQueryData(['stocks', 'heatmap'], (prevStocks: Stock[] | undefined) => {
      if (!prevStocks) return prevStocks;

      const targetIndex = prevStocks.findIndex(s => s.ticker === stockUpdate.ticker);
      if (targetIndex === -1) return prevStocks;

      const updatedStocks = [...prevStocks];
      updatedStocks[targetIndex] = {
        ...updatedStocks[targetIndex],
        ...transformUpdate(stockUpdate),
      };
      
      return updatedStocks;
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