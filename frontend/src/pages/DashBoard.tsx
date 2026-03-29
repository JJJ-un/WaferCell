import { BasicVoronoi } from "@/widgets/BasicVoronoi";
import { SectorDropdown } from "@/widgets/SectorDropdown";
import { useState, useMemo } from "react";
import { type SectorName } from "@/entities/stock/types/stock.types";
import { useRealtimeStocks } from "@/features/realtime-stock/hooks/useRealtimeStocks";
import { useHeatmapQuery } from "@/entities/stock/model/useHeatmap";
import { TradeStrengthIndicator } from "@/widgets/TradeStrengthIndicator";
import { TradingValueIndicator } from "@/widgets/TradingValueIndicator";
import { RsiIndicator } from "@/widgets/RsiIndicator";

export const DashBoard = () => {
    const { data: heatmapData} = useHeatmapQuery();
    useRealtimeStocks();
    const [selectedSector, setSelectedSector] = useState<SectorName | null>(null);

    const filteredData = useMemo(() => {
    if (!heatmapData) return [];
    
    // '전체'일 때는 모든 종목을 다 보여줌
    if (!selectedSector || selectedSector === '전체') {
        return heatmapData.stocks;
    }
    
    // 특정 섹터가 선택되면 해당 섹터 종목만 필터링
    return heatmapData.stocks.filter(stock => stock.sector === selectedSector);
    }, [heatmapData, selectedSector]);

    return (
        <div className="p-[24px] flex flex-col gap-[24px]">
            <SectorDropdown onSectorChange={setSelectedSector}/>
            <BasicVoronoi data={filteredData}/>
            <div className="flex gap-6">
                <TradeStrengthIndicator/>
                <TradingValueIndicator/>
                <RsiIndicator/>
            </div>
        </div>
    )
}
