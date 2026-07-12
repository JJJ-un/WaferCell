import { DailyPriceItem } from "./DailyPriceItem"
import { type DailyPrice } from "@/entities/stock/types/stock.types";

export interface DailyPriceListProps {
    dailyPrices: DailyPrice[];
    children?: React.ReactNode; // 무한 스크롤 감지선 컴포넌트를 내부에 삽입하기 위함
}

export const DailyPriceList = ({ dailyPrices, children }: DailyPriceListProps) => {
    return (
        <div className="p-[24px] flex flex-col justify-between gap-[24px]">
            <div className="text-[24px] text-foreground font-semibold">일별 시세</div>
            <div className="flex justify-between border-b border-tertiary pb-[8px] text-gray-500 font-medium">
                <span className="w-24">날짜</span>
                <span className="w-24 text-right">종가</span>
                <span className="w-40 text-right">등락</span>
                <span className="w-32 text-right">거래량</span>
                <span className="w-24 text-center">이슈</span>
            </div>
            {/* 고정 높이 400px 및 Y축 자체 스크롤 활성화 영역 */}
            <div className="flex flex-col max-h-[400px] overflow-y-auto pr-[8px] scrollbar-hide">
                {dailyPrices.map((dailyPrice, index) => (
                    <DailyPriceItem key={index} dailyPrice={dailyPrice} />
                ))}
                {children} {/* 스크롤 뷰포트 영역 최하단에 자연스럽게 감지선이 존재하도록 구성 */}
            </div>
        </div>
    )
}
