import { DailyPriceItem } from "./DailyPriceItem"
import { type DailyPrice } from "@/entities/stock/types/stock.types";

export interface DailyPriceListProps {
    dailyPrices: DailyPrice[];
}

export const DailyPriceList = ({ dailyPrices }: DailyPriceListProps) => {
    return (
        <div className="p-[24px] flex flex-col justify-between gap-[24px]">
            <div className="text-[24px] text-foreground font-semibold">일별 시세</div>
            <div className="flex justify-between border-b border-tertiary pb-[8px] text-gray-500 font-medium">
                <span className="w-24">날짜</span>
                <span className="w-24 text-right">종가</span>
                <span className="w-40 text-right">등락</span>
                <span className="w-32 text-right">거래량</span>
            </div>
            <div className="flex flex-col">
                {dailyPrices.map((dailyPrice, index) => (
                    <DailyPriceItem key={index} dailyPrice={dailyPrice} />
                ))}
            </div>
        </div>
    )
}


