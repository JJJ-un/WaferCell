import { create } from 'zustand';
import { type SectorName } from '@/entities/stock/types/stock.types';

interface StockState {
  selectedSectorId: SectorName;
  setSelectedSector: (id: SectorName) => void;
}

export const useStockStore = create<StockState>((set) => ({
  selectedSectorId: '전체', // 초기값
  setSelectedSector: (id) => set({ selectedSectorId: id as SectorName }),
}));