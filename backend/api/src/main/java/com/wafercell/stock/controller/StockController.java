package com.wafercell.stock.controller;

import com.wafercell.stock.dto.HeatmapNode;
import com.wafercell.stock.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 주식 데이터 제공을 위한 REST 컨트롤러
 */
@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    /**
     * 전체 반도체 히트맵 데이터를 반환합니다.
     * (DB 및 메모리 캐시된 최신 데이터를 사용함)
     */
    @GetMapping("/heatmap")
    public HeatmapNode getHeatmap() {
        return stockService.getTotalHeatmap();
    }
}
