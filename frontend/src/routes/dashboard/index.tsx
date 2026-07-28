import { StockHeatmap } from "@/widgets/heatmap/StockHeatmap";
import { SectorDropdown } from "@/widgets/heatmap/SectorDropdown";
import { RightNewsPanel } from "@/widgets/news-feed/RightNewsPanel";
import { createFileRoute } from "@tanstack/react-router";
import { useWheelToggle } from "@/shared/hooks/useWheelToggle";

export const DashBoard = () => {
    const { isVisible: isFilterVisible, handleWheel } = useWheelToggle();

    return (
        <div className="flex flex-1 h-full min-h-0 overflow-hidden">
            <div
                onWheel={handleWheel}
                className="flex-1 h-full min-h-0 flex flex-col p-[24px] overflow-hidden"
            >
                <div
                    className={`transition-all duration-300 ease-in-out flex-shrink-0 
                        ${isFilterVisible
                            ? "h-[38px] opacity-100 mb-[12px] visible overflow-visible"
                            : "h-0 opacity-0 mb-0 invisible overflow-hidden pointer-events-none"
                        }`}
                >
                    <SectorDropdown />
                </div>
                <div className="flex-1 min-h-0 w-full">
                    <StockHeatmap />
                </div>
            </div>
            <RightNewsPanel />
        </div>
    )
}

export const Route = createFileRoute('/dashboard/')({
    component: DashBoard,
});
