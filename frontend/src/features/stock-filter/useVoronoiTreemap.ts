import { useMemo } from 'react';
import * as d3 from 'd3';
// @ts-ignore
import * as d3VoronoiTreemap from 'd3-voronoi-treemap';

// 계층 구조 데이터 타입 정의
interface HierarchyDataType {
  ticker?: string;
  value?: number;
  children?: HierarchyDataType[];
}

/**
 * 데이터를 바탕으로 보로노이 트리맵 다각형 좌표를 계산하는 훅
 */
export const useVoronoiTreemap = (data: any[], width: number, height: number) => {
  
  // 1. 데이터 내용의 변화를 감지하기 위한 "지문(Fingerprint)" 생성
  // 데이터의 순서나 값이 바뀌었을 때만 root를 재계산하도록 합니다.
  const layoutDependency = useMemo(() => {
    return data.map(s => `${s.ticker}-${s.value}`).join('|');
  }, [data]);

  // 2. D3 계층 구조(Hierarchy) 생성
  const root = useMemo(() => {
    if (!data || data.length === 0) return null;

    return d3.hierarchy<HierarchyDataType>({ children: data })
      .sum(d => d.value ?? 0);
  }, [layoutDependency]);

  // 3. 보로노이 트리맵 알고리즘 실행 및 다각형(Polygons) 반환
  const polygons = useMemo(() => {
    if (!root || !data || data.length === 0) return [];

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