package com.wafercell.stock.controller;

import com.wafercell.stock.dto.StockHeatmapResponse;
import com.wafercell.stock.dto.StockNewsDto;
import com.wafercell.stock.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 주식 데이터 및 뉴스 제공을 위한 REST 컨트롤러
 */
@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    /**
     * 전체 반도체 주식 데이터를 통합 구조(평면 리스트 + 요약 정보)로 반환합니다.
     */
    @GetMapping("/heatmap")
    public StockHeatmapResponse getHeatmap() {
        return stockService.getFullHeatmapResponse();
    }

    /**
     * 최신 해외 주식 속보 목록을 반환합니다. (무한 스크롤 지원)
     */
    @GetMapping("/news")
    public List<StockNewsDto> getNews(@RequestParam(required = false) String lastSrno) {
        return stockService.getLatestNews(lastSrno);
    }
}
