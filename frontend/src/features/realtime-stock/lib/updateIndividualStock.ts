import { type StockSnapshot, type UpdatedStock } from '@/entities/stock/types/stock.types';

/**
 * [Surgical Update] 서버에서 완성된 데이터를 받아 단일 종목의 상태를 갱신합니다.
 * 백엔드에서 모든 지표(RSI, 거래대금 비율 등)를 계산해서 보내주므로 프론트는 단순 덮어쓰기만 수행합니다.
 */
export const calculateStockUpdate = (
  currentStock: StockSnapshot,
  updateRaw: UpdatedStock,
  soxxRate: number
): StockSnapshot => {
  // 1. 서버에서 온 데이터로 가격 및 지표 갱신
  const mergedPrice = {
    ...currentStock.price,
    ...updateRaw.price,
  };

  const mergedIndicators = {
    ...currentStock.indicators,
    ...updateRaw.indicators,
  };

  // 2. 상대 변동률만 프론트엔드의 현재 기준(SOXX)으로 계산 (백엔드 부하 경감)
  mergedIndicators.relativeChange = mergedPrice.changePercent - soxxRate;

  return {
    ...currentStock,
    price: mergedPrice,
    indicators: mergedIndicators,
  };
};
