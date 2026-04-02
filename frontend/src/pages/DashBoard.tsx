import { BasicVoronoi } from "@/widgets/BasicVoronoi";
import { SectorDropdown } from "@/widgets/SectorDropdown";
import { TradeStrengthIndicator } from "@/widgets/TradeStrengthIndicator";
import { RsiIndicator } from "@/widgets/RsiIndicator";
import { TradingVolumeIndicator } from "@/widgets/TradingVolumeIndicator";
import { useRealtimeStocks } from "@/features/realtime-stock/hooks/useRealtimeStocks";

export const DashBoard = () => {
    useRealtimeStocks();

    return (
        <div className="p-[24px] flex flex-col gap-[24px]">
            <SectorDropdown/>
            <BasicVoronoi/>
            <div className="flex gap-6">
                <TradeStrengthIndicator />
                <TradingVolumeIndicator/>
                <RsiIndicator />
            </div>
        </div>
    )
}
