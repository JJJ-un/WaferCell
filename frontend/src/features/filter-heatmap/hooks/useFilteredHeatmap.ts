import { useHeatmapQuery } from "@/entities/stock/model/useHeatmap";
import { useRealtimeStocks } from "@/features/realtime-stock/hooks/useRealtimeStocks";
import { useState, useMemo } from "react";
import { type SectorName } from "@/entities/stock/types/stock.types";


export const useFilteredHeatmap = () => {
    const { data: heatmapData } = useHeatmapQuery();
    useRealtimeStocks(); // 실시간 구독 로직도 포함 가능
    
    const [selectedSector, setSelectedSector] = useState<SectorName | null>(null);

    const filteredData = useMemo(() => {
        if (!heatmapData) return [];
        if (!selectedSector || selectedSector === '전체') return heatmapData.stocks;
        
        return heatmapData.stocks.filter(stock => stock.sector === selectedSector);
    }, [heatmapData, selectedSector]);

    return { filteredData, selectedSector, setSelectedSector };
};
