import { BasicVoronoi } from "@/features/BasicVoronoi";
import { SectorDropdown } from "@/widgets/SectorDropdown";
import { useState } from "react";
import { type SectorName } from "@/shared/types/Semiconductor";
import { useFilteredStocks } from "@/features/stock-filter/hooks/useFilteredStocks";

export const DashBoard = () => {
    // 데이터 담는 상태 선언 or 커스텀 훅으로 상태가져와기 
    
    // 이값은 필터링에 쓰인다. 
    const [selectedSector, setSelectedSector] = useState<SectorName | null>(null);
    const filteredData =  useFilteredStocks(selectedSector)

    return (
        //해당 위치에 드롭다운 컴포넌트 넣기 
        <div>
            <SectorDropdown onSectorChange={setSelectedSector}/>
            <BasicVoronoi data={filteredData}/>
        </div>
    )


}