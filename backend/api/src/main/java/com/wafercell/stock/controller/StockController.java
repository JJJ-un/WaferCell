package com.wafercell.stock.controller;

import com.wafercell.stock.dto.response.StockDailyPriceResponse;
import com.wafercell.stock.dto.response.StockHeatmapResponse;
import com.wafercell.stock.service.application.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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

    /**
     * 특정 종목의 일별 시세 목록을 반환합니다.
     */
    @GetMapping("/{ticker}/daily-prices")
    public List<StockDailyPriceResponse> getDailyPrices(@PathVariable String ticker) {
        return stockService.getDailyPrices(ticker);
    }
}
