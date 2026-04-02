import { useQuery } from '@tanstack/react-query';
import { fetchHeatmap } from '../api/fetchHeatmap';
import type { StockHeatmap, Stock } from '../types/stock.types';

// 선택된 데이터와 인덱싱된 Map을 포함하는 확장 타입
export interface IndexedStockHeatmap extends StockHeatmap {
  stockMap: Map<string, Stock>;
}

// 유틸리티 함수로 분리
const indexStocks = (data: StockHeatmap): IndexedStockHeatmap => ({
  ...data,
  stockMap: new Map(data.stocks.map(stock => [stock.ticker, stock]))
});

export const useHeatmapQuery = <T = IndexedStockHeatmap>(
  select?: (data: IndexedStockHeatmap) => T,
  enabled: boolean = true
) => {
  return useQuery<IndexedStockHeatmap, Error, T>({
    queryKey: ['stocks', 'heatmap'],
    queryFn: async () => {
      const data = await fetchHeatmap();
      return indexStocks(data);
    },
    staleTime: Infinity,
    select: select as (data: IndexedStockHeatmap) => T,
    enabled
  });
};