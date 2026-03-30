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
  rsi?: string;
}

const transformUpdate = (data: StockUpdate): Partial<Stock> => ({
  price: parseFloat(data.price),
  changePercent: parseFloat(data.rate),
  volume: parseInt(data.volume, 10),
  highPrice: parseFloat(data.highPrice),
  lowPrice: parseFloat(data.lowPrice),
  tradingValue: data.tradingValue ? parseFloat(data.tradingValue) : undefined,
  strength: data.strength ? parseFloat(data.strength) : undefined,
  rsi: data.rsi ? parseFloat(data.rsi) : undefined,
});

/**
 * 실시간 주가 및 거래대금 강도, RSI, SOXX 상대수익률을 동기화하는 훅
 */
export const useRealtimeStocks = () => {
  const { isConnected, subscribe } = useStomp();
  const queryClient = useQueryClient();

  const handleUpdate = useCallback((stockUpdate: StockUpdate) => {
    // 해당 키의 데이터를 건드린다. 값이 계속 바뀌겠지?? 
    queryClient.setQueryData(['stocks', 'heatmap'], (prev: StockHeatmap | undefined) => {
      if (!prev || !prev.stocks) return prev;

      // 1. 해당 종목 데이터 업데이트
      const targetIndex = prev.stocks.findIndex(s => s.ticker === stockUpdate.ticker);
      if (targetIndex === -1) return prev;

      const baseStocks = [...prev.stocks];
      const currentStock = baseStocks[targetIndex];
      const updatedInfo = transformUpdate(stockUpdate);

      // 2. 거래대금 비율(Ratio) 실시간 재계산
      const newTradingValue = updatedInfo.tradingValue ?? (currentStock.tradingValue || 0);
      const avgTamt = currentStock.averageTradingValue || 0;
      const newTamtRatio = avgTamt === 0 ? 0 : (newTradingValue / avgTamt) * 100;

      baseStocks[targetIndex] = {
        ...currentStock,
        ...updatedInfo,
        tradingValueRatio: newTamtRatio,
      };

      // 3. 실시간 SOXX 대비 지표 재계산
      const soxxStock = baseStocks.find(s => s.ticker === 'SOXX');
      const soxxRate = soxxStock ? soxxStock.changePercent : 0;

      const finalStocks = baseStocks.map(s => ({
        ...s,
        relativeChange: s.changePercent - soxxRate,
      }));

      // 4. 섹터 요약 재계산
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

      // 5. 전체 요약 재계산
      const totalMarketCap = updatedSectors.reduce((sum, s) => sum + s.marketCap, 0);
      const totalVolume = updatedSectors.reduce((sum, s) => sum + s.volume, 0);
      const overallAvgRate = totalMarketCap === 0 ? 0 :
        updatedSectors.reduce((sum, s) => sum + (s.changePercent * (s.marketCap / totalMarketCap)), 0);

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
