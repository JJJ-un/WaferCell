import { useMemo } from 'react';
import { type Stock } from '@/shared/types/Semiconductor';
import { MOCK_STOCKS } from '@/shared/mock/stocks.mock';

/**
 * 주식 데이터 리스트를 선택된 섹터에 따라 필터링하는 커스텀 훅입니다.
 * 
 * @param stocks 전체 주식 데이터 배열
 * @param selectedSector 선택된 섹터 이름 (null 이거나 'ALL'일 경우 전체 반환)
 * @returns 필터링된 주식 데이터 배열 (메모이제이션됨)
 */
export const useFilteredStocks = (
  selectedSector: string | null
): Stock[] => {
  return useMemo(() => {
    // 섹터가 선택되지 않았거나 '전체(ALL)'인 경우 모든 데이터 반환
    if (!selectedSector || selectedSector === 'ALL') {
      return MOCK_STOCKS;
    }

    // 선택된 섹터 이름과 일치하는 데이터만 필터링
    // Note: Stock 인터페이스에 sectorName 필드가 포함되어 있어야 합니다.
    return MOCK_STOCKS.filter((stock) => (stock as any).sectorName === selectedSector);
  }, [MOCK_STOCKS, selectedSector]);
};
