import { useQuery } from '@tanstack/react-query';
import { fetchHeatmap } from '../api/fetchHeatmap';
import type { StockResponse, IndexedStockResponse, StockSummary, StockSnapshot } from '../types/stock.types';

// 초기 배열 데이터를 인덱싱된 Record 데이터로 변환, 최초 1회 계산
const indexStocks = (data: StockResponse): IndexedStockResponse => {
  const stocksRecord: Record<string, StockSnapshot> = {};
  data.stocks.forEach(stock => {
    stocksRecord[stock.base.ticker] = stock;
  });

  const sectorsRecord: Record<string, StockSummary> = {};
  data.sectors.forEach(sector => {
    sectorsRecord[sector.name] = sector;
  });

  return {
    overall: data.overall,
    sectors: sectorsRecord,
    stocks: stocksRecord,
  };
};

// 우리는 해당 값으로 작업할 것이다.
export const useHeatmapQuery = <T = IndexedStockResponse>(
  select?: (data: IndexedStockResponse) => T,
  enabled: boolean = true
) => {
  return useQuery<IndexedStockResponse, Error, T>({
    queryKey: ['stocks', 'heatmap'],
    queryFn: async () => {
      const data = await fetchHeatmap();
      // API에서 받아온 데이터를 인덱싱된 형태로 변환하여 반환 => 계산하기 편하게
      return indexStocks(data);
    },
    staleTime: Infinity,
    select: select as (data: IndexedStockResponse) => T,
    enabled
  });
};