import Card from "@/shared/ui/card/Card";
import { useHeatmapQuery } from "@/entities/stock/model/useHeatmap";
import { useStockStore } from "@/entities/stock/model/useStockStore";

export const RsiIndicator = () => {
  const hoveredTicker = useStockStore(state => state.hoveredTickerId);

  // useHeatmapQuery가 반환하는 데이터는 setQueryData에 의해 실시간으로 업데이트된 객체입니다.
  const { data: rsi = 50 } = useHeatmapQuery(
    data => hoveredTicker ? (data.stockMap.get(hoveredTicker)?.rsi ?? 50) : 50,
    !!hoveredTicker
  );

  const isOverbought = rsi >= 70;
  const isOversold = rsi <= 30;
  
  const getRsiColor = () => {
    if (isOverbought) return '#f87171';
    if (isOversold) return '#60a5fa';
    return '#34d399';
  };

  const rsiColor = getRsiColor();

  return (
    <Card className="w-[260px] h-[170px] p-5 flex flex-col justify-between bg-primary border-slate-800/60 backdrop-blur-lg">
      <header className="flex justify-between items-end pb-2 border-b border-slate-800/50">
        <div className="flex flex-col">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">심리 지표</span>
          <span className="text-[9px] text-slate-500 font-bold">{hoveredTicker || '선택 없음'}</span>
        </div>
        <div 
          className="text-2xl font-black tracking-tighter transition-all duration-500"
          style={{ 
            color: rsiColor,
            textShadow: `0 0 15px ${rsiColor}44`
          }}
        >
          {rsi.toFixed(1)}
        </div>
      </header>

      <section className="py-4">
        <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter mb-2">
          <span className={isOversold ? 'text-blue-400' : 'text-slate-500'}>과매도</span>
          <span className="text-slate-400">중립</span>
          <span className={isOverbought ? 'text-red-400' : 'text-slate-500'}>과매수</span>
        </div>

        <div className="relative h-3 w-full bg-bg rounded-full border border-slate-800/40 shadow-inner overflow-hidden">
          <div className="absolute left-[30%] right-[30%] h-full bg-white/5" />
          <div className="absolute left-[30%] top-0 w-px h-full bg-slate-700/50 z-10" />
          <div className="absolute left-[70%] top-0 w-px h-full bg-slate-700/50 z-10" />
          <div 
            className="absolute left-0 h-full transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{ 
              width: `${rsi}%`,
              backgroundColor: rsiColor,
              boxShadow: `0 0 15px ${rsiColor}66`
            }}
          />
        </div>

        <div className="flex justify-between text-[7px] text-slate-600 mt-1.5 uppercase font-bold tracking-tighter">
          <span>0</span>
          <span>30</span>
          <span>50</span>
          <span>70</span>
          <span>100</span>
        </div>
      </section>

      <footer className="text-[10px] text-center font-medium text-slate-500 italic">
        {!hoveredTicker ? (
          <span>종목 심리 지수를 확인해 보세요</span>
        ) : isOverbought ? (
          <span className="text-red-400">시장이 과열되었습니다. 조정 가능성에 유의하세요.</span>
        ) : isOversold ? (
          <span className="text-blue-400">과도한 매도세가 발생했습니다. 반등을 기대할 수 있습니다.</span>
        ) : (
          <span>현재 시장 심리가 안정적인 구간에 있습니다.</span>
        )}
      </footer>
    </Card>
  );
};