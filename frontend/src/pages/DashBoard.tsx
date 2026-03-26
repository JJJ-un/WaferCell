import { BasicVoronoi } from "@/features/BasicVoronoi";
import { SectorDropdown } from "@/widgets/SectorDropdown";
import { useState } from "react";
import { type SectorName } from "@/shared/types/Semiconductor";
import { useFilteredStocks } from "@/features/stock-filter/hooks/useFilteredStocks";
import { useRealtimeStocks } from "@/features/stock-filter/hooks/useRealtimeStocks";
import { useStockQuery } from "@/features/stock-filter/hooks/useStockHeatmap";

export const DashBoard = () => {
    // 실시간 주식 데이터 가져오기
    const { data: stocks} = useStockQuery();
    useRealtimeStocks();

    // 선택된 섹터 상태 관리
    const [selectedSector, setSelectedSector] = useState<SectorName | null>(null);

    // 실시간 데이터에 필터링 적용
    const filteredData = useFilteredStocks(stocks ?? [], selectedSector);

    return (
        <div>
            <SectorDropdown onSectorChange={setSelectedSector}/>
            <BasicVoronoi data={filteredData}/>
        </div>
    )
}
