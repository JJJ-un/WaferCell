import { StandardHeatmap } from "@/widgets/heatmap/StandardHeatmap";
import { SectorDropdown } from "@/widgets/heatmap/SectorDropdown";
import { useRealtimeStocks } from "@/features/realtime-stock/hooks/useRealtimeStocks";
import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";

export const DashBoard = () => {
    // 웹소켓 연결 및 실시간 데이터 업데이트 훅
    useRealtimeStocks();

    const [isFilterVisible, setIsFilterVisible] = useState(true);

    const handleWheel = (e: React.WheelEvent) => {
        // e.deltaY > 10 이면 아래로 스크롤 (필터 숨김)
        // e.deltaY < -10 이면 위로 스크롤 (필터 표시)
        if (e.deltaY > 10) {
            setIsFilterVisible(false);
        } else if (e.deltaY < -10) {
            setIsFilterVisible(true);
        }
    };

    return (
        <div 
            onWheel={handleWheel}
            className="h-full min-h-0 flex flex-col p-[24px] overflow-hidden"
        >
            <div 
                className={`transition-all duration-300 ease-in-out flex-shrink-0 ${
                    isFilterVisible 
                        ? "h-[38px] opacity-100 mb-[12px] visible overflow-visible" 
                        : "h-0 opacity-0 mb-0 invisible overflow-hidden pointer-events-none"
                }`}
            >
                <SectorDropdown />
            </div>
            <div className="flex-1 min-h-0 w-full">
                <StandardHeatmap />
            </div>
        </div>
    )
}

export const Route = createFileRoute('/dashboard/')({
    component: DashBoard,
});
