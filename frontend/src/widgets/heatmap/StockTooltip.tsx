import { type StockSnapshot } from "@/entities/stock/types/stock.types";

export interface StockProps {
    data: StockSnapshot;
    x?: number;
    y?: number;
}

const formatUnit = (num: number | null | undefined): string => {
    if (num == null) return '-';
    if (num >= 1000000000000) {
        const val = num / 1000000000000;
        return (val % 1 === 0 ? val.toLocaleString() : val.toFixed(2)) + '조';
    }
    if (num >= 100000000) {
        const val = num / 100000000;
        return (val % 1 === 0 ? val.toLocaleString() : val.toFixed(2)) + '억';
    }
    if (num >= 10000) {
        const val = num / 10000;
        return (val % 1 === 0 ? val.toLocaleString() : val.toFixed(1)) + '만';
    }
    return num.toLocaleString();
};

/**
 * 통화 포맷팅 (달러)
 */
const formatCurrency = (num: number | null | undefined): string => {
    if (num == null || num === 0) return '-';
    return '$' + num.toLocaleString();
};

export const StockTooltip = ({ data, x, y }: StockProps) => {
    const { base, price } = data;
    // 상태에 따른 컬러 및 부호 변수 추출
    const isUp = price.changePercent > 0;
    const isDown = price.changePercent < 0;
    const statusColor = isUp ? 'text-trend-up-500' : isDown ? 'text-trend-down-500' : 'text-slate-400';
    const trendIcon = isUp ? '▲' : isDown ? '▼' : '';

    return (
        <div
            className="fixed z-[1000] bg-tooltip-bg border border-slate-200 rounded-2xl p-6 text-slate-800 shadow-2xl shadow-slate-300/40 w-[300px] pointer-events-none backdrop-blur-sm"
            style={{
                left: x ? `${x + 15}px` : 'auto',
                top: y ? `${y + 15}px` : 'auto'
            }}
        >
            {/* 헤더: 티커 & 섹터 */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-xl font-black text-slate-800 tracking-tight">{base.ticker}</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-600">
                    {base.sector}
                </span>
            </div>

            {/* Main Price Highlight */}
            <div className="flex justify-between items-baseline py-4 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-500">현재가</span>
                <span className="text-3xl text-slate-800">{formatCurrency(price.price)}</span>
            </div>

            {/* Fluctuating Data */}
            <div className="flex justify-between items-center py-3 border-b border-slate-200/50">
                <span className="text-sm font-medium text-slate-500">등락률</span>
                <div className={`flex items-center gap-1.5 font-bold ${statusColor}`}>
                    {trendIcon && (
                        <span className="text-xs">
                            {trendIcon}
                        </span>
                    )}
                    <span className="text-lg">{isUp ? '+' : ''}{price.changePercent.toFixed(2)}%</span>
                </div>
            </div>

            {/* Secondary Market Data */}
            <div className="grid grid-cols-1 gap-2 mt-4">
                <div className="flex justify-between items-center p-2.5 px-3 hover:bg-slate-200/30 rounded-xl transition-colors">
                    <span className="text-xs font-medium text-slate-500">전일</span>
                    <span className="text-sm font-semibold text-slate-700">{formatCurrency(price.prevClose)}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 px-3 hover:bg-slate-200/30 rounded-xl transition-colors">
                    <span className="text-xs font-medium text-slate-500">저가/고가</span>
                    <span className="text-sm font-semibold text-slate-700">
                        {formatUnit(price.lowPrice)} / {formatUnit(price.highPrice)}
                    </span>
                </div>
                <div className="flex justify-between items-center p-2.5 px-3 hover:bg-slate-200/30 rounded-xl transition-colors">
                    <span className="text-xs font-medium text-slate-500">거래량</span>
                    <span className="text-sm font-semibold text-slate-700">{formatUnit(price.volume)}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 px-3 hover:bg-slate-200/30 rounded-xl transition-colors">
                    <span className="text-xs font-medium text-slate-500">시가총액</span>
                    <span className="text-sm font-semibold text-slate-700">{formatUnit(base.marketCap)}</span>
                </div>
            </div>
        </div>
    );
}