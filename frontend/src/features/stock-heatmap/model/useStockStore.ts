import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { type SectorName, type IndexedStockResponse } from '@/entities/stock/types/stock.types';

interface StockState {
  // 상태(State)
  selectedSectorId: SectorName;
  hoveredTickerId: string | null;
  heatmapData: IndexedStockResponse | null;
  
  // 액션(Actions)
  actions: {
    setSelectedSector: (id: SectorName) => void;
    setHoveredTicker: (ticker: string | null) => void;
    setInitialHeatmapData: (data: IndexedStockResponse) => void;
  }
}

export const useStockStore = create<StockState>()(
  devtools((set) => ({
    selectedSectorId: '전체',
    hoveredTickerId: null,
    heatmapData: null,

    actions: {
      setSelectedSector: (id) => set({ selectedSectorId: id }), 
      setHoveredTicker: (ticker) => set({ hoveredTickerId: ticker }),
      setInitialHeatmapData: (data) => set({ heatmapData: data }),
    },
  }))
);
