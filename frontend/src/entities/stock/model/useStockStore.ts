import { create } from 'zustand';
import { type SectorName } from '@/entities/stock/types/stock.types';

interface StockState {
  selectedSectorId: SectorName;
  hoveredTickerId: string | null; // 현재 마우스가 올라가 있는 종목 티커
  setSelectedSector: (id: SectorName) => void;
  setHoveredTicker: (ticker: string | null) => void;
}

export const useStockStore = create<StockState>((set) => ({
  selectedSectorId: '전체',
  hoveredTickerId: null, // 초기값은 없음
  setSelectedSector: (id) => set({ selectedSectorId: id as SectorName }),
  setHoveredTicker: (ticker) => set({ hoveredTickerId: ticker }),
}));