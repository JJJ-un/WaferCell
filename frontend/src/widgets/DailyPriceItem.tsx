

import { type DailyPrice } from "@/entities/stock/types/stock.types";

export const DailyPriceItem = ({ dailyPrice }: { dailyPrice: DailyPrice }) => {
    const { changeAmount, changeRate, date, closePrice, volume } = dailyPrice;

    const isPositive = changeAmount > 0;
    const isNegative = changeAmount < 0;

    // 개별적으로 부호를 체크하여 '+-' 현상 방지
    const amountSign = isPositive ? '+' : '';
    const rateSign = changeRate > 0 ? '+' : '';

    const colorClass = isPositive ? "text-trend-up-500" : isNegative ? "text-trend-down-500" : "text-gray-500";

    return (
        <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
            <div className="w-24 text-gray-500">{date}</div>
            <div className="w-24 text-right font-semibold text-foreground">
                {closePrice.toLocaleString()}
            </div>
            <div className={`w-40 text-right ${colorClass} font-medium`}>
                {amountSign}{changeAmount.toLocaleString()} ({rateSign}{changeRate}%)
            </div>
            <div className="w-32 text-right text-gray-500">
                {volume.toLocaleString()}
            </div>
        </div>
    )
}