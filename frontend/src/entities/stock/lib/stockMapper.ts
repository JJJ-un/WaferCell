import { type Stock, type HeatmapNode } from "../types/stockTypes"

/**
 * @description 트리 구조의 히트맵 데이터를 평탄화된 주식 배열로 변환합니다.
 * @param node 현재 순회 중인 히트맵 노드
 * @param parentName 부모 노드의 이름 (섹터명 결정을 위해 전달)
 */

export const mapHeatmapToStocks = (node: HeatmapNode, parentName: string = ''): Stock[] => {
  // 1. 자식 노드가 없는 경우 (실제 주식 종목 - Leaf Node)
  if (!node.children || node.children.length === 0) {
    return [{
      id: node.name,
      ticker: node.name,
      value: node.value,
      changePercent: node.rate,
      // 섹터 네임 로직: 부모가 있으면 부모 이름을, 없으면 자신의 이름을 사용
      sectorName: parentName || node.name,
      price: 0,
      change: 0,
      volume: 0,
    }];
  }

  // 2. 자식 노드가 있는 경우 (섹터 혹은 그룹 - Internal Node)
  // '반도체 전체' 같은 최상위 노드인 경우 자식의 이름을 섹터로 넘기고, 
  // 일반 섹터인 경우 자신의 이름을 섹터명으로 고정하여 하위로 전달합니다.
  return node.children.flatMap((child) => {
    const nextSectorName = node.name.includes('전체') ? child.name : node.name;
    return mapHeatmapToStocks(child, nextSectorName);
  });
};