import { useState, useMemo } from 'react';
import { type Stock } from '@/entities/stock/types/stock.types';
import { StockTooltip } from './StockTooltip';
import { useColorScale } from '@/shared/model/hooks/useColorScale';
import { useTreemap } from '@/features/stock-heatmap/hooks/useTreemap';
import { useStockStore } from '@/features/stock-heatmap/model/useStockStore';
import { useHeatmapQuery } from '@/entities/stock/model/useHeatmap';
import { useNavigate } from '@tanstack/react-router';

export const StandardHeatmap = () => {
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
    return allStocks.filter(stock => stock.sector === selectedSector);
  }, [heatmapData?.stocks, selectedSector]);

  // 3. 마우스 호버 데이터
  const hoveredStock = useMemo(() => {
    if (!hoveredTicker || !heatmapData) return null;
    return heatmapData.stocks[hoveredTicker] || null;
  }, [hoveredTicker, heatmapData?.stocks]);

  const width = 1060;
  const height = 500;

  const [hoveredPosition, setHoveredPosition] = useState<{ x: number, y: number } | null>(null);  
  const colorScale = useColorScale();
  
  // 4. 사각형 트리맵 레이아웃 계산
  const nodes = useTreemap(filteredData, width, height);

  return (
    <div style={{ position: 'relative' }}>
      <svg width={width} height={height} className="rounded-lg overflow-hidden border border-slate-200">
        {nodes.map((d: any, i) => {
          const stock = d.data as Stock;
          const rectWidth = d.x1 - d.x0;
          const rectHeight = d.y1 - d.y0;
          
          // 칸의 크기에 따라 텍스트 표시 여부 및 크기 조절
          const showText = rectWidth > 35 && rectHeight > 20;

          return (
            <g 
              key={stock.ticker || i} 
              transform={`translate(${d.x0},${d.y0})`}
              onClick={() => navigate({ to: '/chart/$ticker', params: { ticker: stock.ticker } })}
              onMouseEnter={() => {
                setHoveredPosition({ x: d.x0 + rectWidth / 2, y: d.y0 + rectHeight / 2 });
                setHoveredTicker(stock.ticker);
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
                fill={colorScale(stock.changePercent)}
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
                  fontSize={Math.min(rectWidth / 5, 14)}
                  fontWeight="600"
                  fill={Math.abs(stock.changePercent) > 4.0 ? "#fff" : "#1e293b"}
                  pointerEvents="none"
                  style={{ userSelect: 'none' }}
                >
                  {stock.ticker}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hoveredStock && (
        <StockTooltip data={hoveredStock} x={hoveredPosition?.x} y={hoveredPosition?.y} />
      )}
    </div>
  );
};
