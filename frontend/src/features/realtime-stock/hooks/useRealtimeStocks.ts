import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStomp } from '@/shared/model/contexts/StompContext';
import { type StockHeatmap, type Stock } from '@/entities/stock/types/stock.types';

interface StockUpdate {
  ticker: string;
  price: string;
  rate: string;
  volume: string;
  highPrice: string;
  lowPrice: string;
  timestamp: string;
  tradingValue?: string;
  strength?: string;
  volumeIntensity?: string;
}

const transformUpdate = (data: StockUpdate): Partial<Stock> => ({
  price: parseFloat(data.price),
  changePercent: parseFloat(data.rate),
  volume: parseInt(data.volume, 10),
  highPrice: parseFloat(data.highPrice),
  lowPrice: parseFloat(data.lowPrice),
});

export const useRealtimeStocks = () => {
  const { isConnected, subscribe } = useStomp();
  const queryClient = useQueryClient();

  const handleUpdate = useCallback((stockUpdate: StockUpdate) => {
    // ['stocks', 'heatmap'] 키에 대한 캐시를 갱신합니다.
    queryClient.setQueryData(['stocks', 'heatmap'], (prev: StockHeatmap | undefined) => {
      if (!prev || !prev.stocks) return prev;

      // 1. 종목 배열에서 해당 종목 인덱스 찾기
      const targetIndex = prev.stocks.findIndex(s => s.ticker === stockUpdate.ticker);
      if (targetIndex === -1) return prev;

      // 2. 종목 리스트를 '완전히 새로운 배열'로 생성
      const updatedStocks = [...prev.stocks];
      
      // 3. 해당 종목도 '완전히 새로운 객체'로 업데이트 (불변성 유지)
      updatedStocks[targetIndex] = {
        ...updatedStocks[targetIndex],
        ...transformUpdate(stockUpdate),
      };

      // 4. 섹터 요약 정보 재계산 (모든 섹터 객체도 새로 생성)
      const updatedSectors = prev.sectors.map(sector => {
        const sectorStocks = updatedStocks.filter(s => s.sector === sector.name);
        if (sectorStocks.length === 0) return { ...sector };

        const totalMarketCap = sectorStocks.reduce((sum, s) => sum + s.marketCap, 0);
        const totalVolume = sectorStocks.reduce((sum, s) => sum + s.volume, 0);
        const weightedAvgRate = totalMarketCap === 0 ? 0 :
          sectorStocks.reduce((sum, s) => sum + (s.changePercent * (s.marketCap / totalMarketCap)), 0);

        return {
          ...sector,
          marketCap: totalMarketCap,
          changePercent: weightedAvgRate,
          volume: totalVolume,
        };
      });

      // 5. 전체 요약 정보 재계산
      const totalMarketCap = updatedSectors.reduce((sum, s) => sum + s.marketCap, 0);
      const totalVolume = updatedSectors.reduce((sum, s) => sum + s.volume, 0);
      const overallAvgRate = totalMarketCap === 0 ? 0 :
        updatedSectors.reduce((sum, s) => sum + (s.changePercent * (s.marketCap / totalMarketCap)), 0);

      // 6. 전체 응답 객체(StockHeatmap)를 '완전히 새로운 참조'로 반환
      // 이 작업을 통해 리액트 쿼리가 상태 변화를 감지하고 UI를 리렌더링하게 됩니다.
      return {
        ...prev,
        overall: {
          ...prev.overall,
          marketCap: totalMarketCap,
          changePercent: overallAvgRate,
          volume: totalVolume,
        },
        sectors: updatedSectors,
        stocks: updatedStocks,
      };
    });
  }, [queryClient]);

  useEffect(() => {
    if (!isConnected || !subscribe) return;

    // 백엔드의 /topic/stocks 채널 구독 시작
    const subscription = subscribe('/topic/stocks', handleUpdate);

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      subscription?.unsubscribe();
    };
  }, [isConnected, subscribe, handleUpdate]);
};
