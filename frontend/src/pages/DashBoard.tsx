import { BasicVoronoi } from "@/widgets/BasicVoronoi";
import { SectorDropdown } from "@/widgets/SectorDropdown";
import { useMemo } from "react";
import { useRealtimeStocks } from "@/features/realtime-stock/hooks/useRealtimeStocks";
import { useHeatmapQuery } from "@/entities/stock/model/useHeatmap";
import { TradeStrengthIndicator } from "@/widgets/TradeStrengthIndicator";
import { TradingValueIndicator } from "@/widgets/TradingValueIndicator";
import { RsiIndicator } from "@/widgets/RsiIndicator";
import { useStockStore } from "@/entities/stock/model/useStockStore";

export const DashBoard = () => {
    // 여기에 모든 데이터 들어오고,
    // 이게 영향을 주나보다.
    const { data: heatmapData} = useHeatmapQuery();
    // 이거 내부로 옮겨야함
    // 이놈 때문이다
    useRealtimeStocks();
    
    // Zustand 스토어에서 선택된 섹터 가져오기
    const selectedSector = useStockStore(state => state.selectedSectorId);

    const filteredData = useMemo(() => {
    if (!heatmapData) return [];
    
    // '전체'일 때는 모든 종목을 다 보여줌
    if (!selectedSector || selectedSector === '전체') {
        return heatmapData.stocks;
    }
    
    // 특정 섹터가 선택되면 해당 섹터 종목만 필터링
    // 분리해야하는거 아닌가?? 
    // 값 바뀌면 렌더링 계속 
    return heatmapData.stocks.filter(stock => stock.sector === selectedSector);
    }, [heatmapData, selectedSector]);

    return (
        <div className="p-[24px] flex flex-col gap-[24px]">
            // 리렌더링에 영향을 받는다. 누가 리렌더링 영향?? 
            <SectorDropdown/>
            <BasicVoronoi data={filteredData}/>
            <div className="flex gap-6">
                <TradeStrengthIndicator strength={700}/>
                <TradingValueIndicator/>
                <RsiIndicator/>
            </div>
        </div>
    )
}
