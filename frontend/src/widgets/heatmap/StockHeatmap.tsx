import { useState, useMemo, useEffect, useRef } from 'react';
import { type StockSnapshot } from '@/entities/stock/types/stock.types';
import { StockTooltip } from './StockTooltip';
import { useColorScale } from '@/shared/model/hooks/useColorScale';
import { useTreemap } from '@/features/stock-heatmap/hooks/useTreemap';
import { useStockStore } from '@/features/stock-heatmap/model/useStockStore';
import { useHeatmapQuery } from '@/entities/stock/model/useHeatmap';
import { useNavigate } from '@tanstack/react-router';
import { useRealtimeStocks } from '@/features/realtime-stock/hooks/useRealtimeStocks';

export const StockHeatmap = () => {
  // 실시간 웹소켓 구독 및 쿼리 캐시 자동 갱신
  useRealtimeStocks();

  const selectedSector = useStockStore(state => state.selectedSectorId);
  const hoveredTicker = useStockStore(state => state.hoveredTickerId);
  const { setHoveredTicker } = useStockStore(state => state.actions);
  const navigate = useNavigate();

  // 1. 데이터 가져오기
  const { data: heatmapData } = useHeatmapQuery();

  // 2. 필터링된 데이터 계산
  const filteredData = useMemo(() => {
    if (!heatmapData) return [];
    const allStocks = Object.values(heatmapData.stocks);
    if (!selectedSector || selectedSector === '전체') return allStocks;
    return allStocks.filter(stock => stock.base.sector === selectedSector);
  }, [heatmapData?.stocks, selectedSector]);

  // 3. 마우스 호버 데이터
  const hoveredStock = useMemo(() => {
    if (!hoveredTicker || !heatmapData) return null;
    return heatmapData.stocks[hoveredTicker] || null;
  }, [hoveredTicker, heatmapData?.stocks]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const [hoveredPosition, setHoveredPosition] = useState<{ x: number, y: number } | null>(null);  
  const colorScale = useColorScale();
  
  // 4. 사각형 트리맵 레이아웃 계산 (marketCap 위치 확인 필요: stock.base.marketCap)
  const nodes = useTreemap(filteredData, dimensions.width, dimensions.height);

  return (
    <div ref={containerRef} className="w-full h-full min-h-0" style={{ position: 'relative' }}>
      {dimensions.width > 0 && dimensions.height > 0 && (
        <svg width={dimensions.width} height={dimensions.height} className="rounded-lg overflow-hidden border border-slate-200">
          {nodes.map((d: any, i) => {
            const stock = d.data as StockSnapshot;
            const rectWidth = d.x1 - d.x0;
            const rectHeight = d.y1 - d.y0;
            
            // 칸의 크기에 따라 텍스트 표시 여부 및 크기 조절
            const showText = rectWidth > 35 && rectHeight > 20;

            return (
              <g 
                key={stock.base.ticker || i} 
                transform={`translate(${d.x0},${d.y0})`}
                onClick={() => navigate({ to: '/stock/$ticker', params: { ticker: stock.base.ticker } })}
                onMouseEnter={() => {
                  setHoveredPosition({ x: d.x0 + rectWidth / 2, y: d.y0 + rectHeight / 2 });
                  setHoveredTicker(stock.base.ticker);
                }} 
                onMouseLeave={() => {
                  setHoveredPosition(null);
                  setHoveredTicker(null);
                }}
                className="group"
              >
                <rect
                  width={rectWidth}
                  height={rectHeight}
                  fill={colorScale(stock.price.changePercent)}
                  stroke="white"
                  strokeWidth="0.5"
                  className="transition-all duration-200 cursor-pointer group-hover:brightness-110"
                />
                {showText && (
                  <text
                    x={rectWidth / 2}
                    y={rectHeight / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={Math.min(rectWidth / 3.5, 22)}
                    fontWeight="600"
                    fill={Math.abs(stock.price.changePercent) > 4.0 ? "#fff" : "#1e293b"}
                    pointerEvents="none"
                    style={{ userSelect: 'none' }}
                  >
                    {stock.base.ticker}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
      {hoveredStock && (
        <StockTooltip 
          data={hoveredStock} 
          x={hoveredPosition?.x} 
          y={hoveredPosition?.y} 
          parentHeight={dimensions.height}
          parentWidth={dimensions.width}
        />
      )}
    </div>
  );
};
