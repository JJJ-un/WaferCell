import { type IndexedStockResponse, type UpdatedStock } from '@/entities/stock/types/stock.types';
import { calculateStockUpdate } from './updateIndividualStock';


/**
 * 실시간 주가 업데이트 시 전체 상태를 효율적으로 업데이트합니다.
 * O(1) 증분 업데이트(Incremental Update)를 통해 섹터와 전체 지표도 실시간으로 반영합니다.
 */
export const transformToHeatmapData = (
  prev: IndexedStockResponse,
  updateRaw: UpdatedStock
): IndexedStockResponse => {
  const ticker = updateRaw.ticker;
  const oldStock = prev.stocks[ticker];

  if (!oldStock) return prev;

  const soxxRate = prev.stocks['SOXX']?.price.changePercent ?? 0;
  const updatedStock = calculateStockUpdate(oldStock, updateRaw, soxxRate);

  // 1. 섹터 요약 데이터 증분 업데이트 (O(1))
  const sectorName = updatedStock.base.sector;
  const oldSector = prev.sectors[sectorName];
  let newSectors = prev.sectors;

  if (oldSector) {
    const priceDiff = updatedStock.price.changePercent - oldStock.price.changePercent;
    const volumeDiff = updatedStock.price.volume - oldStock.price.volume;
    
    // 가중치(시총 비중) 계산: 해당 종목 시총 / 섹터 전체 시총
    const weightInSector = updatedStock.base.marketCap / (oldSector.marketCap || 1);
    
    newSectors = {
      ...prev.sectors,
      [sectorName]: {
        ...oldSector,
        // 가중 평균 등락률 업데이트: 기존 값 + (변화분 * 비중)
        changePercent: oldSector.changePercent + (priceDiff * weightInSector),
        volume: oldSector.volume + volumeDiff,
      }
    };
  }

  // 2. 전체(Overall) 요약 데이터 증분 업데이트 (O(1))
  const oldOverall = prev.overall;
  const weightInOverall = updatedStock.base.marketCap / (oldOverall.marketCap || 1);
  const priceDiff = updatedStock.price.changePercent - oldStock.price.changePercent;
  const volumeDiff = updatedStock.price.volume - oldStock.price.volume;

  const newOverall = {
    ...oldOverall,
    changePercent: oldOverall.changePercent + (priceDiff * weightInOverall),
    volume: oldOverall.volume + volumeDiff,
  };

  return {
    ...prev,
    overall: newOverall,
    sectors: newSectors,
    stocks: {
      ...prev.stocks,
      [ticker]: updatedStock,
    },
  };
};
