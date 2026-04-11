

export interface DailyPrice {
    date: string;
    price: number;
    change: number; // 전일 대비 가격 변화량
    volume: number; // 거래량
}


export const DailyPriceItem = ({ dailyPrice }: { dailyPrice: DailyPrice }) => {
    return (
        <div className="flex justify-between text-text-primary">
            <div>{dailyPrice.date}</div>
            <div className="font-semibold"> {dailyPrice.price}</div>
            <div>{dailyPrice.change}</div>
            <div>{dailyPrice.volume}</div>
        </div>

    )
}