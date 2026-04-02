import { type StockHeatmap, type Stock } from '../types/stock.types';
import { updateIndividualStock, type UpdatedStock } from './updateIndividualStock';
import { updateRelativeMetrics } from './updateRelativeMetrics';
import { calculateSectors } from './calculateSectors';
import { calculateOverall } from './calculateOverall';

// useHeatmap.ts의 IndexedStockHeatmap과 동일한 구조
export interface IndexedStockHeatmap extends StockHeatmap {
  stockMap: Map<string, Stock>;
}

/**
 * 실시간 주가 업데이트 시 Heatmap 전체 상태를 재계산하는 메인 함수입니다.
 */
export const updateHeatmapData = (
  prev: IndexedStockHeatmap,
  updateRaw: UpdatedStock
): IndexedStockHeatmap => {
  if (!prev.stocks) return prev;

  // 1. 개별 종목 업데이트
  let updatedStocks = updateIndividualStock(prev.stocks, updateRaw);

  // 2. SOXX 대비 지표 재계산
  updatedStocks = updateRelativeMetrics(updatedStocks);

  // 3. 섹터 요약 재계산
  const updatedSectors = calculateSectors(updatedStocks, prev.sectors);

  // 4. 전체 요약 재계산
  const updatedOverall = calculateOverall(updatedSectors);

  // 5. IndexedStockHeatmap을 위한 stockMap 재계산 (추가됨)
  const updatedStockMap = new Map(updatedStocks.map(s => [s.ticker, s]));

  return {
    ...prev,
    overall: updatedOverall,
    sectors: updatedSectors,
    stocks: updatedStocks,
    stockMap: updatedStockMap,
  };
};
