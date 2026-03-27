import { useState} from 'react';
import { type Stock } from '../shared/types/Semiconductor';
import * as d3 from 'd3';
// @ts-ignore
import * as d3VoronoiTreemap from 'd3-voronoi-treemap';
import { StockTooltip } from '@/entities/stock/ui/Stock';
import { useColorScale } from '@/features/stock-filter/hooks/useColorScale';
import { useVoronoiTreemap } from '@/features/stock-filter/useVoronoiTreemap';

interface StockProps {
    data: Stock[]; 
}

export const BasicVoronoi = ({ data }: StockProps) => {
  const width = 960;
  const height = 500;

  const [hoveredStock, setHoveredStock] = useState<Stock | null>(null);
  const colorScale = useColorScale();
  const polygons = useVoronoiTreemap(data, width, height);

  return (
    <div style={{ position: 'relative' }}>
      <svg width={width} height={height} className="border border-slate-300 rounded-lg">
        {polygons.map((d: any, i) => {
          if (!d.polygon) return null;
          
          const stock = d.data as Stock;
          const centroid = d3.polygonCentroid(d.polygon);

          return (
            <g key={stock.ticker || i}>
              <path
                d={d3.line()(d.polygon) + "z"}
                fill={colorScale(stock.changePercent)}
                stroke="#eee"
                strokeWidth="0.5"
                onMouseEnter={() => setHoveredStock(stock)} 
                onMouseLeave={() => setHoveredStock(null)}
                style={{ transition: 'fill 0.3s ease', cursor: 'pointer' }} 
              />
              <text
                x={centroid[0]}
                y={centroid[1]}
                fontSize="11"
                fontWeight="900"
                textAnchor="middle"
                // 색상이 어느 정도 진해질 때(2% 이상)만 글자색을 흰색으로 변경
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
        <StockTooltip data={hoveredStock} />
      )}
    </div>
  );
};
