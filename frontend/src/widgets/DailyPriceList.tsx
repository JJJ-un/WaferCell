import { DailyPriceItem } from "./DailyPriceItem"

interface DailyPrice {
    date: string;
    price: number;
    change: number; // 전일 대비 가격 변화량
    volume: number; // 거래량
}

export interface DailyPriceListProps {
    dailyPrices: DailyPrice[];
}

// 내부에서 일별 가격 훅으로 불러오는건??
export const DailyPriceList = ({ dailyPrices }: DailyPriceListProps) => {
    return (
        <div className="p-[24px] flex flex-col justify-between gap-[24px]">
            {/* 일별 가격 리스트 컴포넌트 */}
            <div className="text-[24px] font-semibold">일별 시세</div>
            <div className="flex justify-between border-b border-tertiary pb-[8px] text-text-primary">
                <span>날짜</span>
                <span className="ml-[60px]">종가</span>
                <span>등락률</span>
                <span>거래량</span>
            </div>
                {dailyPrices.map((dailyPrice, index) => (
                    <DailyPriceItem key={index} dailyPrice={dailyPrice} />
                ))}
        </div>
    )
}   


