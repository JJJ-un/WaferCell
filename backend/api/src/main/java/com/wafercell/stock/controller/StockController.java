package com.wafercell.stock.controller;

import com.wafercell.stock.entity.StockSupplyChainEvent;
import com.wafercell.stock.dto.response.StockChartPointResponse;
import com.wafercell.stock.dto.response.StockDailyPriceResponse;
import com.wafercell.stock.dto.response.StockHeatmapResponse;
import com.wafercell.stock.service.application.StockService;
import com.wafercell.stock.service.application.ValueChainStreamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * 주식 데이터 제공을 위한 REST 컨트롤러
 */
@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 프론트엔드 연결을 위한 CORS 개방
public class StockController {
    private final StockService stockService;
    private final ValueChainStreamService streamService;

    @GetMapping(value = "/{ticker}/value-chain/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamValueChain(@PathVariable String ticker) {
        return streamService.createStream(ticker);
    }

    @GetMapping("/heatmap")
    public StockHeatmapResponse getHeatmap() {
        return stockService.getFullHeatmapResponse();
    }

    /**
     * 특정 종목의 일별 시세 목록을 반환합니다.
     */
    @GetMapping("/{ticker}/daily-prices")
    public List<StockDailyPriceResponse> getDailyPrices(
            @PathVariable String ticker,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        // 백엔드 DB에서 offset (page * size)을 계산하여 20개씩 쪼개서 반환
        return stockService.getDailyPricesPaged(ticker, page, size);
    }

    /**
     * 특정 종목의 차트 데이터(경량화)를 조회합니다.
     */
    @GetMapping("/{ticker}/chart")
    public List<StockChartPointResponse> getChartData(
            @PathVariable String ticker,
            @RequestParam String period) {
        return stockService.getChartData(ticker, period);
    }

    /**
     * 특정 종목의 특정 날짜 속보 이벤트를 반환합니다.
     */
    @GetMapping("/{ticker}/events")
    public List<StockSupplyChainEvent> getEventsByDate(
            @PathVariable String ticker,
            @RequestParam String date) {
        return stockService.getEventsByDate(ticker, date);
    }
}
