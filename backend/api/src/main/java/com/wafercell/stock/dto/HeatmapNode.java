package com.wafercell.stock.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

/**
 * 히트맵의 계층 구조를 담는 DTO
 * 시가총액(value)에 따라 크기가 결정되고, 등락률(rate)에 따라 색상이 결정됩니다.
 */
@Getter
@Builder
public class HeatmapNode {
    private String name;                // 섹터명 또는 종목명
    private Double value;               // 시가총액 (사각형의 크기)
    private Double rate;                // 등락률 (사각형의 색상)
    private List<HeatmapNode> children; // 하위 계층 (섹터 -> 하위섹터 -> 종목)
}
