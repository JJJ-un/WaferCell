import { useMemo, useState } from 'react';
import { type Stock } from '../shared/types/Semiconductor';
import * as d3 from 'd3';
// @ts-ignore
import * as d3VoronoiTreemap from 'd3-voronoi-treemap';
import { StockTooltip } from '@/entities/stock/ui/Stock';

interface StockProps {
    data: Stock[]; 
}

interface HierarchyDataType {
  ticker?: string;
  value?: number;
  children?: HierarchyDataType[];
}

export const BasicVoronoi = ({ data }: StockProps) => {
  const [hoveredTicker, setHoveredTicker] = useState<string | null>(null);

  const width = 600;
  const height = 600;

  const layoutDependency = useMemo(() => {
    return data.map(s => `${s.ticker}-${s.value}`).join('|');
  }, [data.length]); 

  const root = useMemo(() => {
    return d3.hierarchy<HierarchyDataType>({ children: data })
      .sum(d => d.value ?? 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutDependency]); 

  const polygons = useMemo(() => {
    if (!data || data.length === 0) return [];
    try {
      const voronoi = d3VoronoiTreemap.voronoiTreemap()
        .clip([[0, 0], [width, 0], [width, height], [0, height]]);
      voronoi(root);
      return root.leaves(); 
    } catch (error) {
      return [];
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root]); 

  // 🚀 광대역 초정밀 색상 스케일 (0.01% 반응 ~ 10% 정점)
  const colorScale = useMemo(() => {
    return d3.scaleLinear<string>()
      // 0.01%에서 시작하여 10%까지 부드럽게 진해지는 구간 설정
      .domain([-10, -5, -2, -0.5, -0.01, 0, 0.01, 0.5, 2, 5, 10]) 
      .range([
        "#1e3a8a", // -10% (Dark Blue)
        "#1d4ed8", // -5%
        "#3b82f6", // -2% (Moderate Blue)
        "#93c5fd", // -0.5%
        "#dbeafe", // -0.01% (Very Light Blue)
        "#ffffff", //  0% (Pure White)
        "#fee2e2", // +0.01% (Very Light Red)
        "#fca5a5", // +0.5%
        "#f87171", // +2% (Moderate Red)
        "#dc2626", // +5%
        "#7f1d1d"  // +10% (Dark Red)
      ])
      .clamp(true);
  }, []);

  const currentHoveredStock = useMemo(() => {
    if (!hoveredTicker) return null;
    return data.find(s => s.ticker === hoveredTicker) || null;
  }, [hoveredTicker, data]);

  if (!data || data.length === 0) {
    return <div>데이터를 불러오는 중입니다...</div>;
  }

  return (
    <div style={{ position: 'relative' }}>
      <svg width={width} height={height} style={{ border: '1px solid #cbd5e1' }}>
        {polygons.map((d: any, i) => {
          if (!d.polygon) return null;
          
          const currentStock = data.find(s => s.ticker === d.data.ticker) || d.data;
          const centroid = d3.polygonCentroid(d.polygon);

          return (
            <g key={currentStock.ticker || i}>
              <path
                d={d3.line()(d.polygon) + "z"}
                fill={colorScale(currentStock.changePercent)}
                stroke="#eee"
                strokeWidth="0.5"
                onMouseEnter={() => setHoveredTicker(currentStock.ticker)}
                onMouseLeave={() => setHoveredTicker(null)}
                style={{ transition: 'fill 0.3s ease', cursor: 'pointer' }} 
              />
              <text
                x={centroid[0]}
                y={centroid[1]}
                fontSize="11"
                fontWeight="900"
                textAnchor="middle"
                // 색상이 어느 정도 진해질 때(2% 이상)만 글자색을 흰색으로 변경
                fill={Math.abs(currentStock.changePercent) > 2.0 ? "#fff" : "#1e293b"}
                pointerEvents="none"
                style={{ textShadow: Math.abs(currentStock.changePercent) <= 2.0 ? '0 0 2px white' : 'none' }}
              >
                {currentStock.ticker}
              </text>
            </g>
          );
        })}
      </svg>
      {currentHoveredStock && (
        <StockTooltip data={currentHoveredStock} />
      )}
    </div>
  );
};
