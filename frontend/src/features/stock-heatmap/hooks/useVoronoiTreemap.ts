import { useMemo } from 'react';
import { type StockSnapshot } from '@/entities/stock/types/stock.types';
import * as d3 from 'd3';
// @ts-ignore
import * as d3VoronoiTreemap from 'd3-voronoi-treemap';

// 계층 구조 데이터 타입 정의
type HeatmapNode = { name: string; children: StockSnapshot[] } | StockSnapshot;


/**
 * 데이터를 바탕으로 보로노이 트리맵 다각형 좌표를 계산하는 훅
 */
export const useVoronoiTreemap = (stocks: StockSnapshot[], width: number, height: number) => {

  const stockKeys = useMemo(() => 
    stocks.map(s => `${s.base.ticker}-${s.base.marketCap}`).join(','), 
  [stocks]);
  

  // 2. D3 계층 구조(Hierarchy) 생성
  const root = useMemo(() => {
    if (!stocks || stocks.length === 0) return null;

    const hierarchyData: HeatmapNode = { name: "root", children: stocks };

    return d3.hierarchy<HeatmapNode>(hierarchyData)
          .sum((d) => {
            return 'base' in d ? d.base.marketCap : 0;
          });
  }, [stockKeys]); 

  // 3. 보로노이 트리맵 알고리즘 실행 및 다각형(Polygons) 반환
  const polygons = useMemo(() => {
    if (!root || width === 0 || height === 0) return [];

    try {
      // 보로노이 트리맵 레이아웃 설정
      const voronoi = d3VoronoiTreemap.voronoiTreemap()
        .clip([
          [0, 0], 
          [width, 0], 
          [width, height], 
          [0, height]
        ]);

      // root 데이터에 좌표값(.polygon) 주입
      voronoi(root);

      // 최하위 노드(개별 주식)들의 데이터 반환
      return root.leaves();
    } catch (error) {
      console.error("Voronoi calculation failed:", error);
      return [];
    }
    // root가 바뀌거나, 캔버스 크기(width, height)가 바뀔 때만 실행됩니다.
  }, [root, width, height]);

  return polygons;
};