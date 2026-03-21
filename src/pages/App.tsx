import { useMemo } from 'react';
import { type Stock } from '../shared/types/Semiconductor';
import * as d3 from 'd3';
// @ts-ignore
import * as d3VoronoiTreemap from 'd3-voronoi-treemap';

interface StockProps {
    data: Stock[]; 
}
interface HierarchyDataType {
  ticker?: string;    // 종목명 (루트에는 없을 수 있음)
  value?: number;     // 값 (루트에는 없을 수 있음)
  children?: HierarchyDataType[]; // 자식 (있을 수도, 없을 수도 있음)
}

export const BasicVoronoi = ({ data }:StockProps ) => {

  // 전체 틀의 높이 예상 => css 파일로 못옮기나?
  const width = 600;
  const height = 600;

  // 1. D3 계층 구조 생성 (단일 레벨)
  // 데이터 구조 자체는 크게 상관이 없어 보이는 것 같기도
  // 일단 트리구조 (루트노트, 자식노드) 만든후 sum으로 루프를 돌린다.
  const root = useMemo(() => {
    return d3.hierarchy<HierarchyDataType>({ children: data })
      .sum(d => d.value ?? 0)
  }, [data]);

  // 2. 보로노이 다각형 계산
  const polygons = useMemo(() => {
    const voronoi = d3VoronoiTreemap.voronoiTreemap()
    // 해당 값 으로 전체 모양을 잡을 수 있다. 
      .clip([[0, 0], [width, 0], [width, height], [0, height]]);
    // 이때 꼭짓점이 만들어진다. 
    voronoi(root);
    return root.leaves(); // 최종 계산된 잎 노드(다각형)들 반환
  }, [root]);

  // 3. 색상 함수 (빨강: 하락, 초록: 상승)
  // 색상을 어떻게 계산하지?? 
  // d3의 d3.scaleLinear() 도입하여 해결 
  const getColor = (percent: number) => {
    const intensity = Math.min(Math.abs(percent) / 5, 1); 
    if (percent > 0) return `rgba(239, 68, 68, ${0.2 + intensity * 0.8})`; // Red 계열 (상승)
    if (percent < 0) return `rgba(59, 130, 246, ${0.2 + intensity * 0.8})`; // Blue 계열 (하락)
    return '#334155'; // 변동 없음 (Slate-700)
  };

  const colorScale = useMemo(() => {
  return d3.scaleLinear<string>()
    .domain([-5, 0, 5])
    .range(["#3b82f6", "#334155", "#ef4444"]) // 파랑(Tailwind Blue-500), Slate-700, 빨강(Red-500)
    .clamp(true);
}, []);

  return (
    // 폴리곤의 형태는 배열이다. d를 정의해야하는데 d는 d3에서 스인것
    <svg width={width} height={height} style={{ border: '1px solid #ccc' }}>
      {polygons.map((d: any, i) => (
        <g key={i}>
          {/* 다각형 그리기 */}
          {/*d.polygon은 꼭짓점이다.  */}
          {/* 호벗 시 컴포넌트 띄울 수 있을까?? */}
          <path
            d={d3.line()(d.polygon) + "z"}
            fill={colorScale(d.data.changePercent)}
            stroke="#fff"
          />
          {/* 중앙에 텍스트 배치(당연히 컴포넌트 들어갈 수 있을듯) */}
          <text
            x={d3.polygonCentroid(d.polygon)[0]}
            y={d3.polygonCentroid(d.polygon)[1]}
            fontSize="12"
            textAnchor="middle"
            fill="#fff"
          >
            {d.data.ticker}
          </text>
        </g>
      ))}
    </svg>
  );
};