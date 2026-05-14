import Card from "@/shared/ui/card/Card";
import { useHeatmapQuery } from "@/entities/stock/model/useHeatmap";
import { useStockStore } from "@/features/stock-heatmap/model/useStockStore";

const STRENGTH_BASE = 100;
const MAX_OFFSET = 50; 

export const TradeStrengthIndicator = () => {
  const hoveredTicker = useStockStore(state => state.hoveredTickerId);

  /** 
   * [성능 최적화 1] enabled: !!hoveredTicker (마우스가 올라갔을 때만 연산 시작)
   * [성능 최적화 2] O(1) 조회: data.stocks[hoveredTicker] (전체 배열 순회 find 대신 즉시 조회)
   */
  const { data: rawStrength = STRENGTH_BASE } = useHeatmapQuery(
    data => hoveredTicker ? (data.stocks[hoveredTicker]?.indicators.strength ?? STRENGTH_BASE) : STRENGTH_BASE,
    !!hoveredTicker 
  );

  // 0으로 들어오는 경우 데이터가 없는 장전 상태이므로 균형(100)으로 처리
  const strength = rawStrength === 0 ? STRENGTH_BASE : rawStrength;

  const bullishRatio = Math.min(Math.max(((strength - (STRENGTH_BASE - MAX_OFFSET)) / (MAX_OFFSET * 2)) * 100, 0), 100);

  const isBullish = strength > STRENGTH_BASE;
  const isBearish = strength < STRENGTH_BASE;
  const isNeutral = strength === STRENGTH_BASE;
  
  const bullColor = 'var(--color-trend-up-700)';
  const bearColor = 'var(--color-trend-down-700)';
  const activeColor = isNeutral ? 'var(--color-slate-500)' : (isBullish ? bullColor : bearColor);

  return (
    <Card className="w-[330px] h-[210px] p-5 flex flex-col justify-between bg-primary border-slate-800/60 backdrop-blur-lg">
      <header className="flex justify-between items-end pb-2 border-b border-slate-800/50">
        <div className="flex flex-col">
          <span className="text-slate-400 text-[16px] font-bold uppercase tracking-widest">체결 강도</span>
          <span className="text-[9px] text-slate-500 font-bold">{hoveredTicker || '선택 없음'}</span>
        </div>
        <div 
          className="text-2xl font-black tracking-tighter transition-colors duration-500"
          style={{ 
            color: activeColor,
            textShadow: isNeutral ? 'none' : `0 0 15px ${isBullish ? 'rgba(220, 38, 38, 0.4)' : 'rgba(29, 78, 216, 0.4)'}` 
          }}
        >
          {strength.toFixed(1)}<span className="text-xs ml-0.5 opacity-70">%</span>
        </div>
      </header>

      <section className="py-4">
        <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter mb-2">
          <span style={{ color: isBearish ? bearColor : 'var(--color-slate-500)' }}>매도 우위</span>
          <span style={{ color: isNeutral ? 'var(--color-slate-100)' : 'var(--color-slate-500)' }}>균형</span>
          <span style={{ color: isBullish ? bullColor : 'var(--color-slate-500)' }}>매수 우위</span>
        </div>

        <div 
          className="relative h-3 w-full rounded-full border border-slate-800/40 shadow-inner overflow-hidden"
          style={{ backgroundColor: bearColor }}
        >
          <div 
            className="absolute right-0 h-full transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{ 
              width: `${bullishRatio}%`,
              backgroundColor: bullColor,
              boxShadow: isBullish ? `-10px 0 20px rgba(220, 38, 38, 0.5)` : 'none'
            }}
          />
          <div className="absolute left-1/2 top-0 w-0.5 h-full bg-white/30 z-10" />
        </div>
      </section>

      <footer className="text-[10px] text-center font-medium text-slate-500 italic">
        {!hoveredTicker 
          ? '분석할 종목을 선택해 주세요' 
          : isBullish 
            ? '매수세가 시장 에너지를 주도하고 있습니다' 
            : '매도세가 시장 에너지를 압도하고 있습니다'}
      </footer>
    </Card>
  );
};