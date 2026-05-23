import { useMemo } from 'react';
import * as d3 from 'd3';
import { type StockSnapshot } from '@/entities/stock/types/stock.types';

/**
 * 데이터를 바탕으로 일반 사각형 트리맵(Treemap) 좌표를 계산하는 훅
 */
export const useTreemap = (stocks: StockSnapshot[], width: number, height: number) => {
  return useMemo(() => {
    if (!stocks || stocks.length === 0 || width === 0 || height === 0) return [];

    // 1. D3 계층 구조(Hierarchy) 생성 및 데이터 합산/정렬
    const hierarchyData = { name: "root", children: stocks };
    
    const root = d3.hierarchy(hierarchyData)
      .sum((d: any) => (d.base && d.base.marketCap) || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // 2. 트리맵 레이아웃 설정 (사각형 방식)
    const treemapLayout = d3.treemap<any>()
      .size([width, height])
      .paddingOuter(2)
      .paddingInner(1)
      .round(true);

    // 3. root 데이터에 좌표값(x0, y0, x1, y1) 주입
    treemapLayout(root);

    // 4. 최하위 노드(개별 주식)들의 데이터 반환
    return root.leaves();
  }, [stocks, width, height]);
};
