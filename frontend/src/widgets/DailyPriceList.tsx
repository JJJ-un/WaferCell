import { DailyPriceItem } from "./DailyPriceItem"
import { type DailyPrice } from "@/entities/stock/types/stock.types";

export interface DailyPriceListProps {
    dailyPrices: DailyPrice[];
    children?: React.ReactNode; // 무한 스크롤 감지선 컴포넌트를 내부에 삽입하기 위함
    onDateVisible?: (date: string) => void;
    scrollRef?: React.RefObject<HTMLDivElement | null>; // 휠 스크롤 감지를 위한 Ref 추가
}

export const DailyPriceList = ({ dailyPrices, children, onDateVisible, scrollRef }: DailyPriceListProps) => {
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const childHeight = 49; // DailyPriceItem의 대략적인 높이
        const visibleIndex = Math.floor((target.scrollTop + 10) / childHeight);
        const targetItem = dailyPrices[visibleIndex];
        if (targetItem && onDateVisible) {
            onDateVisible(targetItem.date);
        }
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 gap-[16px]">
            <div className="text-[24px] text-foreground font-semibold flex-shrink-0">일별 시세</div>
            <div className="flex justify-between border-b border-tertiary pb-[8px] text-gray-500 font-medium flex-shrink-0">
                <span className="w-24">날짜</span>
                <span className="w-24 text-right">종가</span>
                <span className="w-40 text-right">등락</span>
                <span className="w-32 text-right">거래량</span>
                <span className="w-24 text-center">이슈</span>
            </div>
            {/* 동적으로 늘어나는 세로 스크롤 영역 */}
            <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex flex-col flex-1 min-h-0 overflow-y-auto pr-[8px] scrollbar-hide"
            >
                {dailyPrices.map((dailyPrice, index) => (
                    <DailyPriceItem key={index} dailyPrice={dailyPrice} index={index} />
                ))}
                {children} {/* 스크롤 뷰포트 영역 최하단에 자연스럽게 감지선이 존재하도록 구성 */}
            </div>
        </div>
    )
}
