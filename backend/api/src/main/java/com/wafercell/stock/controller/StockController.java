package com.wafercell.stock.controller;

import com.wafercell.stock.dto.HeatmapNode;
import com.wafercell.stock.entity.Stock;
import com.wafercell.stock.repository.StockRepository;
import com.wafercell.stock.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 주식 히트맵 데이터 조회를 위한 REST 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;
    private final StockRepository stockRepository;

    /**
     * 전체 섹터가 포함된 히트맵 데이터를 가져옵니다.
     */
    @GetMapping("/heatmap/total")
    public ResponseEntity<HeatmapNode> getTotalHeatmap() {
        return ResponseEntity.ok(stockService.getTotalHeatmap());
    }

    /**
     * 특정 섹터(예: 반도체) 내부의 상세 히트맵 데이터를 가져옵니다.
     */
    @GetMapping("/heatmap/{sector}")
    public ResponseEntity<HeatmapNode> getSectorHeatmap(@PathVariable String sector) {
        return ResponseEntity.ok(stockService.getSectorHeatmap(sector));
    }

    /**
     * [테스트용] DB에 기초 반도체 종목 데이터를 채워 넣습니다.
     * 실제 서비스 시에는 관리자 페이지나 배치를 통해 관리해야 합니다.
     */
    @PostMapping("/seed")
    public ResponseEntity<String> seedData() {
        if (stockRepository.count() > 0) {
            return ResponseEntity.ok("이미 데이터가 존재합니다.");
        }

        List<Stock> initialStocks = List.of(
            new Stock("NVDA", "엔비디아", "NAS", "반도체", "팹리스"),
            new Stock("AMD", "AMD", "NAS", "반도체", "팹리스"),
            new Stock("AVGO", "브로드컴", "NAS", "반도체", "팹리스"),
            new Stock("TSM", "TSMC", "NYS", "반도체", "파운드리"),
            new Stock("INTC", "인텔", "NAS", "반도체", "IDM/메모리"),
            new Stock("MU", "마이크론", "NAS", "반도체", "IDM/메모리"),
            new Stock("ASML", "ASML", "NAS", "반도체", "소부장"),
            new Stock("AMAT", "어플라이드 머티어리얼즈", "NAS", "반도체", "소부장"),
            new Stock("LRCX", "램리서치", "NAS", "반도체", "소부장")
        );

        stockRepository.saveAll(initialStocks);
        return ResponseEntity.ok("반도체 종목 데이터 9건이 성공적으로 등록되었습니다.");
    }
}
