import { type Stock } from "@/shared/types/Semiconductor"

export interface StockProps {
    data: Stock;


}

export const StockTooltip = ( {data}: StockProps) => {

    return (
        <div>
            <div>
                <span>현재가</span>
                {data.price}
            </div>
            <div>
                <span>변동률</span>
                {data.changePercent}
            </div>
            <div>
                <span>거래량</span>
                {data.volume}
            </div>
        </div>
    )


}