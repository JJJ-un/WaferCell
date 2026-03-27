import { BasicVoronoi } from "@/widgets/BasicVoronoi";
import { SectorDropdown } from "@/widgets/SectorDropdown";
import { useState } from "react";
import { type SectorName } from "@/shared/types/Semiconductor";
import { useFilteredStocks } from "@/features/stock-filter/hooks/useFilteredStocks";
import { useRealtimeStocks } from "@/features/stock-filter/hooks/useRealtimeStocks";
import { useStockQuery } from "@/features/stock-filter/hooks/useStockHeatmap";

export const DashBoard = () => {
    const { data: stocks} = useStockQuery();
    useRealtimeStocks();
    const [selectedSector, setSelectedSector] = useState<SectorName | null>(null);
    const filteredData = useFilteredStocks(stocks ?? [], selectedSector);

    return (
        <div className="p-[24px]">
            <SectorDropdown onSectorChange={setSelectedSector}/>
            <BasicVoronoi data={filteredData}/>
        </div>
    )
}
