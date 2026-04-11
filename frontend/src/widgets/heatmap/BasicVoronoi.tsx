import { useState, useMemo } from 'react';
import { type Stock } from '@/entities/stock/types/stock.types';
import * as d3 from 'd3';
// @ts-ignore
import * as d3VoronoiTreemap from 'd3-voronoi-treemap';
import { StockTooltip } from './StockTooltip';
import { useColorScale } from '@/shared/model/hooks/useColorScale';
import { useVoronoiTreemap } from '@/features/stock-heatmap/hooks/useVoronoiTreemap';
import { useStockStore } from '@/features/stock-heatmap/model/useStockStore';
import { useHeatmapQuery } from '@/entities/stock/model/useHeatmap';
import { useNavigate } from '@tanstack/react-router';

export const BasicVoronoi = () => {
  const selectedSector = useStockStore(state => state.selectedSectorId);
  const hoveredTicker = useStockStore(state => state.hoveredTickerId);
  const { setHoveredTicker } = useStockStore(state => state.actions);
  const navigate = useNavigate();


  // 1. 원본 데이터 전체를 가져옵니다
  const { data: heatmapData } = useHeatmapQuery();

  // 2. 필터링된 데이터 계산
  const filteredData = useMemo(() => {
    if (!heatmapData) return [];
    
    // 객체를 배열로 변환하여 처리
    const allStocks = Object.values(heatmapData.stocks);
    
    if (!selectedSector || selectedSector === '전체') {
      return allStocks;
    }
    return allStocks.filter(stock => stock.sector === selectedSector);
  }, [heatmapData?.stocks, selectedSector]);

  // 3. 현재 마우스가 올라간 종목의 최신 데이터를 실시간으로 가져옴
  const hoveredStock = useMemo(() => {
    if (!hoveredTicker || !heatmapData) return null;
    return heatmapData.stocks[hoveredTicker] || null;
  }, [hoveredTicker, heatmapData?.stocks]);

  const width = 1060;
  const height = 500;

  const [hoveredPosition, setHoveredPosition] = useState<{ x: number, y: number } | null>(null);  
  const colorScale = useColorScale();
  
  // 다각형 모양 계산 (marketCap이 안 변하면 이 안의 d.data는 옛날 객체일 수 있음)
  const polygons = useVoronoiTreemap(filteredData, width, height);

  return (
    <div style={{ position: 'relative' }}>
      <svg width={width} height={height} className="border border-slate-300 rounded-lg">
        {polygons.map((d: any, i) => {
          if (!d.polygon) return null;
          
          // 핵심: 다각형에 저장된 ticker를 이용해 '진짜 최신 데이터'를 가져옵니다.
          const staleStock = d.data as Stock;
          const stock = heatmapData?.stocks[staleStock.ticker] || staleStock;
          
          const centroid = d3.polygonCentroid(d.polygon);

          return (
            <g key={stock.ticker || i}>
              <path
                d={d3.line()(d.polygon) + "z"}
                fill={colorScale(stock.changePercent)}
                stroke="#eee"
                strokeWidth="0.5"
                onMouseEnter={() => {
                  setHoveredPosition({ x: centroid[0], y: centroid[1] });
                  setHoveredTicker(stock.ticker);
                }} 
                onMouseLeave={() => {
                  setHoveredPosition(null);
                  setHoveredTicker(null);
                }}
                onClick={() => navigate({ to: '/chart/$ticker', params: { ticker: stock.ticker } })}
                style={{ transition: 'fill 0.3s ease', cursor: 'pointer' }} 
              />
              <text
                x={centroid[0]}
                y={centroid[1]}
                fontSize="20"
                fontWeight="semi-bold"
                textAnchor="middle"
                fill={Math.abs(stock.changePercent) > 2.0 ? "#fff" : "#1e293b"}
                pointerEvents="none"
                style={{ textShadow: Math.abs(stock.changePercent) <= 2.0 ? '0 0 2px white' : 'none' }}
              >
                {stock.ticker}
              </text>
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
