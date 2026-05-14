import { type StockSnapshot, type UpdatedStock, type StockPrice, type StockIndicators } from '@/entities/stock/types/stock.types';

/**
 * 소켓에서 온 수치 데이터를 DTO 구조에 맞게 매핑합니다.
 */
export const transformUpdate = (data: UpdatedStock): { price: Partial<StockPrice>, indicators: Partial<StockIndicators> } => {
  const price: Partial<StockPrice> = {
    price: data.price,
    changePercent: data.changePercent,
    volume: data.volume,
    highPrice: data.highPrice,
    lowPrice: data.lowPrice
  };

  const indicators: Partial<StockIndicators> = {
    tradingValue: data.tradingValue,
    strength: data.strength,
    rsi: data.rsi,
    tradingValueRatio: data.tradingValueRatio
  };

  return { price, indicators };
};

/**
 * [Surgical Update] 단일 종목의 전체 데이터를 완성하여 반환합니다.
 */
export const calculateStockUpdate = (
  currentStock: StockSnapshot,
  updateRaw: UpdatedStock,
  soxxRate: number
): StockSnapshot => {
  const { price: updatedPrice, indicators: updatedIndicators } = transformUpdate(updateRaw);

  // 1. 객체 병합 (중첩 구조 유지)
  const mergedPrice = {
    ...currentStock.price,
    ...updatedPrice,
  };

  const mergedIndicators = {
    ...currentStock.indicators,
    ...updatedIndicators,
  };

  // 2. 실시간 지표 재계산
  if (!updatedIndicators.tradingValueRatio && mergedIndicators.tradingValue && mergedIndicators.averageTradingValue) {
    mergedIndicators.tradingValueRatio = (mergedIndicators.tradingValue / mergedIndicators.averageTradingValue) * 100;
  }

  // SOXX 대비 상대 변동률
  mergedIndicators.relativeChange = mergedPrice.changePercent - soxxRate;

  return {
    ...currentStock,
    price: mergedPrice,
    indicators: mergedIndicators,
  };
};
