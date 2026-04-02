import { type Stock, type UpdatedStock } from '../types/stock.types';

/**
 * 소켓에서 온 문자열(Raw) 데이터를 숫자로 변환합니다.
 * 백엔드(StockService.java)에서 이미 RSI, 거래대금비율 등을 계산해서 보내주므로 
 * 프론트에서는 파싱만 수행합니다.
 */
export const transformUpdate = (data: UpdatedStock): Partial<Stock> => ({
  price: parseFloat(data.price),
  changePercent: parseFloat(data.rate),
  volume: parseInt(data.volume, 10),
  highPrice: parseFloat(data.highPrice),
  lowPrice: parseFloat(data.lowPrice),
  tradingValue: data.tradingValue ? parseFloat(data.tradingValue) : undefined,
  strength: data.strength ? parseFloat(data.strength) : undefined,
  rsi: data.rsi ? parseFloat(data.rsi) : undefined,
  // 백엔드에서 내려주는 지표가 있다면 그대로 사용 (UpdatedStock 타입에 추가 필요 시 추가)
  tradingValueRatio: (data as any).tradingValueRatio ? parseFloat((data as any).tradingValueRatio) : undefined,
});

/**
 * [Surgical Update] 단일 종목의 전체 데이터를 완성하여 반환합니다.
 */
export const calculateStockUpdate = (
  currentStock: Stock,
  updateRaw: UpdatedStock,
  soxxRate: number
): Stock => {
  const updatedInfo = transformUpdate(updateRaw);

  return {
    ...currentStock,
    ...updatedInfo,
    // SOXX 대비 상대 변동률만 프론트에서 실시간 계산 (SOXX가 변할 수 있으므로)
    relativeChange: (updatedInfo.changePercent ?? currentStock.changePercent) - soxxRate,
  };
};
