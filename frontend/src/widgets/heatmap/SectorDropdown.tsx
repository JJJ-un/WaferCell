import { Dropdown } from "@/shared/ui/dropdown/Dropdown";
import { useStockStore } from "@/features/stock-heatmap/model/useStockStore";
import { type SectorName } from "@/entities/stock/types/stock.types";

const SECTORS: SectorName[] = [
  '전체', '팹리스', '파운드리', '소부장', '메모리', 'IDM', 'IP'
];

export const SectorDropdown = () => {
  // Zustand에서 상태와 액션을 직접 가져옵니다.
  const selectedSector = useStockStore(state => state.selectedSectorId);
  const setSelectedSector = useStockStore(state => state.actions.setSelectedSector);

  return (
    <Dropdown className="relative w-40">
      <Dropdown.Trigger className="flex items-center justify-between w-full px-4 py-2 bg-secondary border border-slate-700/50 rounded-xl text-sm font-semibold text-slate-200 hover:border-slate-500 transition-all">
        {/* 현재 선택된 값을 표시합니다. */}
        <Dropdown.Value value={selectedSector} />
        <Dropdown.Icon />
      </Dropdown.Trigger>
      
      <Dropdown.Menu className="absolute top-full left-0 w-full mt-2 py-1 bg-secondary border border-slate-700/50 rounded-xl shadow-2xl z-50 overflow-hidden">
        {SECTORS.map((sector) => (
          <Dropdown.Option
            key={sector}
            optionId={sector}
            onSelect={(id) => setSelectedSector(id as SectorName)}
            className={`
              px-4 py-2 text-sm cursor-pointer transition-colors
              ${selectedSector === sector 
                ? 'bg-blue-600/20 text-blue-400 font-bold' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
            `}
          >
            {sector}
          </Dropdown.Option>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};