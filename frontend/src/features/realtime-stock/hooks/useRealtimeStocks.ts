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
}

const transformUpdate = (data: StockUpdate): Partial<Stock> => ({
  price: parseFloat(data.price),
  changePercent: parseFloat(data.rate),
  volume: parseInt(data.volume, 10),
  highPrice: parseFloat(data.highPrice),
  lowPrice: parseFloat(data.lowPrice),
  tradingValue: data.tradingValue ? parseFloat(data.tradingValue) : undefined,
  strength: data.strength ? parseFloat(data.strength) : undefined,
});

/**
 * 실시간 주가 업데이트를 수신하고, 전체 시장 지수 및 섹터 지수, 
 * 그리고 SOXX 대비 상대 지표를 실시간으로 재계산하여 캐시를 갱신하는 훅
 */
export const useRealtimeStocks = () => {
  const { isConnected, subscribe } = useStomp();
  const queryClient = useQueryClient();

  const handleUpdate = useCallback((stockUpdate: StockUpdate) => {
    queryClient.setQueryData(['stocks', 'heatmap'], (prev: StockHeatmap | undefined) => {
      if (!prev || !prev.stocks) return prev;

      // 1. 해당 종목 데이터 업데이트 (참조값 변경을 위해 배열 복사)
      const targetIndex = prev.stocks.findIndex(s => s.ticker === stockUpdate.ticker);
      if (targetIndex === -1) return prev;

      const baseStocks = [...prev.stocks];
      baseStocks[targetIndex] = {
        ...baseStocks[targetIndex],
        ...transformUpdate(stockUpdate),
      };

      // 2. 실시간 SOXX 등락률 기반 상대 지표(Relative Change) 계산
      const soxxStock = baseStocks.find(s => s.ticker === 'SOXX');
      const soxxRate = soxxStock ? soxxStock.changePercent : 0;

      const finalStocks = baseStocks.map(s => ({
        ...s,
        relativeChange: s.changePercent - soxxRate,
      }));

      // 3. 섹터 요약 정보 실시간 재계산 (가중 평균)
      const updatedSectors = prev.sectors.map(sector => {
        const sectorStocks = finalStocks.filter(s => s.sector === sector.name);
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

      // 4. 전체 요약 정보(반도체 지수) 실시간 재계산
      const totalMarketCap = updatedSectors.reduce((sum, s) => sum + s.marketCap, 0);
      const totalVolume = updatedSectors.reduce((sum, s) => sum + s.volume, 0);
      const overallAvgRate = totalMarketCap === 0 ? 0 :
        updatedSectors.reduce((sum, s) => sum + (s.changePercent * (s.marketCap / totalMarketCap)), 0);

      // 5. 전체 캐시 객체 참조 변경 (불변성 유지 -> 리렌더링 유발)
      return {
        ...prev,
        overall: {
          ...prev.overall,
          marketCap: totalMarketCap,
          changePercent: overallAvgRate,
          volume: totalVolume,
        },
        sectors: updatedSectors,
        stocks: finalStocks,
      };
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
