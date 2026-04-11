import { StandardHeatmap } from "@/widgets/heatmap/StandardHeatmap";
import { SectorDropdown } from "@/widgets/heatmap/SectorDropdown";
import { TradeStrengthIndicator } from "@/widgets/sub-indicator/TradeStrengthIndicator";
import { RsiIndicator } from "@/widgets/sub-indicator/RsiIndicator";
import { TradingVolumeIndicator } from "@/widgets/sub-indicator/TradingVolumeIndicator";
import { useRealtimeStocks } from "@/features/realtime-stock/hooks/useRealtimeStocks";
import { createFileRoute } from "@tanstack/react-router";

export const DashBoard = () => {
    // 웹소켓 연결 및 실시간 데이터 업데이트 훅
    useRealtimeStocks();

    return (
        <div className="p-[24px] flex flex-col gap-[24px]">
            <SectorDropdown/>
            <StandardHeatmap/>
            <div className="flex justify-between">
                <TradeStrengthIndicator />
                <TradingVolumeIndicator/>
                <RsiIndicator />
            </div>
        </div>
    )
}

export const Route = createFileRoute('/dashboard/')({
  component: DashBoard,
});
