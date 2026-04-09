import { type Stock, type UpdatedStock } from '@/entities/stock/types/stock.types';

/**
 * 소켓에서 온 문자열(Raw) 데이터를 숫자로 변환합니다.
 * 값이 존재하는 경우에만 객체에 포함시켜 기존 데이터를 덮어쓰지 않도록 합니다.
 */
export const transformUpdate = (data: UpdatedStock): Partial<Stock> => {
  const result: Partial<Stock> = {};

  if (data.price) result.price = parseFloat(data.price);
  if (data.rate) result.changePercent = parseFloat(data.rate);
  if (data.volume) result.volume = parseInt(data.volume, 10);
  if (data.highPrice) result.highPrice = parseFloat(data.highPrice);
  if (data.lowPrice) result.lowPrice = parseFloat(data.lowPrice);
  if (data.tradingValue) result.tradingValue = parseFloat(data.tradingValue);
  if (data.strength) result.strength = parseFloat(data.strength);
  if (data.rsi) result.rsi = parseFloat(data.rsi);
  if (data.tradingValueRatio) result.tradingValueRatio = parseFloat(data.tradingValueRatio);

  return result;
};

/**
 * [Surgical Update] 단일 종목의 전체 데이터를 완성하여 반환합니다.
 * 고정된 값(averageTradingValue)과 실시간 값(tradingValue)을 조합하여 지표를 재계산합니다.
 */
export const calculateStockUpdate = (
  currentStock: Stock,
  updateRaw: UpdatedStock,
  soxxRate: number
): Stock => {
  const updatedInfo = transformUpdate(updateRaw);

  // 1. 기본 정보 병합
  const mergedStock = {
    ...currentStock,
    ...updatedInfo,
  };

  // 2. 실시간 지표 재계산 (프론트엔드 책임)

  // 거래대금 비율: (현재 거래대금 / 평균 거래대금) * 100
  // 만약 소켓에서 직접 내려준다면 그것을 쓰고, 없다면 프론트에서 계산
  if (!updatedInfo.tradingValueRatio && mergedStock.tradingValue && mergedStock.averageTradingValue) {
    mergedStock.tradingValueRatio = (mergedStock.tradingValue / mergedStock.averageTradingValue) * 100;
  }

  // SOXX 대비 상대 변동률: 현재 등락률 - SOXX 등락률
  mergedStock.relativeChange = mergedStock.changePercent - soxxRate;

  return mergedStock;
};
