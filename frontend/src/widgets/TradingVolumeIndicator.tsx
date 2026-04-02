import Card from "@/shared/ui/card/Card";
import { useHeatmapQuery } from "@/entities/stock/model/useHeatmap";
import { useStockStore } from "@/entities/stock/model/useStockStore";


// Volume이 아니 거래대금인 Value로 바꿔야함
export const TradingVolumeIndicator = () => {
  const hoveredTicker = useStockStore(state => state.hoveredTickerId);

  // [성능 최적화] O(1) Map 조회 및 조건부 쿼리
  const { tradingValue = 0, tradingValueRatio = 0 } = useHeatmapQuery(data => {
    if (!hoveredTicker) return { tradingValue: 0, tradingValueRatio: 0 };
    const stock = data.stockMap.get(hoveredTicker);
    return {
      tradingValue: stock?.tradingValue || 0,
      tradingValueRatio: stock?.tradingValueRatio || 0
    };
  }, !!hoveredTicker).data || {};

  const amountInEokDollar = tradingValue / 100_000_000;
  const isActive = tradingValueRatio >= 100;
  const isExplosive = tradingValueRatio >= 200;

  const getStatusColor = () => {
    if (isExplosive) return 'var(--color-trend-up-700)';
    if (isActive) return '#f59e0b';
    return 'var(--color-slate-500)';
  };

  const statusColor = getStatusColor();

  return (
    <Card className="w-[260px] h-[170px] p-5 flex flex-col justify-between bg-primary border-slate-800/60 backdrop-blur-lg">
      <header className="flex justify-between items-end pb-2 border-b border-slate-800/50">
        <div className="flex flex-col">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">거래대금</span>
          <span className="text-[9px] text-slate-500 font-bold">{hoveredTicker || '선택 없음'}</span>
        </div>
        <div 
          className="text-2xl font-black tracking-tighter text-slate-100 transition-all duration-500"
          style={{ 
            textShadow: isActive ? `0 0 20px ${statusColor}44` : 'none'
          }}
        >
          {amountInEokDollar.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          <span className="text-xs ml-0.5 opacity-70 font-medium text-slate-400">억$</span>
        </div>
      </header>

      <section className="py-4">
        <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter mb-2">
          <span className="text-slate-500">평균 대비 강도</span>
          <span 
            style={{ color: statusColor }} 
            className="transition-colors duration-500 font-bold"
          >
            {tradingValueRatio.toFixed(1)}%
          </span>
        </div>

        <div className="relative h-3 w-full bg-bg rounded-full border border-slate-800/40 shadow-inner overflow-hidden">
          <div className="absolute left-1/2 top-0 w-0.5 h-full bg-white/20 z-10" />
          <div 
            className="absolute left-0 h-full transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{ 
              width: `${Math.min(tradingValueRatio / 2, 100)}%`, 
              backgroundColor: statusColor,
              boxShadow: isActive ? `0 0 15px ${statusColor}66` : 'none'
            }}
          />
        </div>

        <div className="flex justify-between text-[7px] text-slate-600 mt-1.5 uppercase font-bold tracking-tighter">
          <span>0%</span>
          <span className="text-slate-500">100% (Average)</span>
          <span>200%+</span>
        </div>
      </section>

      <footer className="text-[10px] text-center font-medium text-slate-500 italic">
        {!hoveredTicker ? (
          <span>종목 위에 마우스를 올려 보세요</span>
        ) : isExplosive ? (
          <span className="text-red-400 animate-pulse">⚠️ 역대급 자금 유입! 시장의 주목을 받고 있습니다</span>
        ) : isActive ? (
          <span className="text-amber-400">평균치를 상회하며 에너지가 응집되고 있습니다</span>
        ) : (
          <span>현재 평소와 비슷한 수준의 거래가 진행 중입니다</span>
        )}
      </footer>
    </Card>
  );
};