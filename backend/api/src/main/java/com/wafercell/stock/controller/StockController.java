package com.wafercell.stock.controller;

import com.wafercell.stock.dto.StockHeatmapResponse;
import com.wafercell.stock.service.application.StockService;
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
    @GetMapping("/heatmap")
    public StockHeatmapResponse getHeatmap() {
        return stockService.getFullHeatmapResponse();
    }
}
