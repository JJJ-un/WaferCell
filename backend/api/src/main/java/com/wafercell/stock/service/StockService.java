package com.wafercell.stock.service;

import com.wafercell.stock.client.KoreaInvestRealtimeClient;
import com.wafercell.stock.client.StockClient;
import com.wafercell.stock.dto.HeatmapNode;
import com.wafercell.stock.dto.StockUpdate;
import com.wafercell.stock.entity.Stock;
import com.wafercell.stock.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockService {

    private final StockRepository stockRepository;
    private final StockClient stockClient;
    private final KoreaInvestRealtimeClient realtimeClient;
    private final Map<String, HeatmapNode> stockCache = new ConcurrentHashMap<>();

    @EventListener(ApplicationReadyEvent.class)
    public void init() {
        refreshAllStockData();
    }

    /**
     * DB에 등록된 모든 종목을 웹소켓 서버에 구독 요청합니다.
     */
    public void subscribeAllStocks() {
        log.info("모든 종목 실시간 구독 시작...");
        List<Stock> allStocks = stockRepository.findAll();
        for (Stock stock : allStocks) {
            realtimeClient.subscribe(stock.getExchange(), stock.getTicker());
        }
    }

    @Scheduled(cron = "0 0 * * * *")
    public void refreshAllStockData() {
        log.info("주가 데이터 최신화 시작...");
        List<Stock> allStocks = stockRepository.findAll();
        
        if (allStocks.isEmpty()) {
            log.warn("DB에 등록된 종목이 없습니다.");
            return;
        }

        for (Stock stock : allStocks) {
            try {
                HeatmapNode node = fetchStockNodeFromApi(stock);
                stockCache.put(stock.getTicker(), node);
                
                stock.updateMarketCap(node.getValue());
                stockRepository.save(stock);
                
                log.debug("데이터 로드 완료: {}", stock.getTicker());
                Thread.sleep(100); 
            } catch (Exception e) {
                log.error("데이터 로드 실패: {} - {}", stock.getTicker(), e.getMessage());
                double lastVal = stock.getMarketCap() != null ? stock.getMarketCap() : 100.0;
                stockCache.putIfAbsent(stock.getTicker(), HeatmapNode.builder().name(stock.getTicker()).value(lastVal).rate(0.0).build());
            }
        }
        log.info("주가 데이터 최신화 완료 (총 {}종목)", stockCache.size());
        
        // 데이터 로드 후 웹소켓 구독 수행
        subscribeAllStocks();
    }

    public void updateStockCache(StockUpdate update) {
        String ticker = update.getTicker();
        HeatmapNode existing = stockCache.get(ticker);
        if (existing != null) {
            try {
                double newRate = Double.parseDouble(update.getRate());
                stockCache.put(ticker, HeatmapNode.builder()
                        .name(ticker)
                        .value(existing.getValue())
                        .rate(newRate)
                        .build());
            } catch (Exception e) {
                log.error("캐시 업데이트 오류: {}", e.getMessage());
            }
        }
    }

    public HeatmapNode getTotalHeatmap() {
        List<Stock> allStocks = stockRepository.findAll();
        Map<String, List<Stock>> sectors = allStocks.stream()
                .collect(Collectors.groupingBy(Stock::getSector));

        List<HeatmapNode> sectorNodes = sectors.entrySet().stream()
                .map(entry -> {
                    List<HeatmapNode> stockNodes = entry.getValue().stream()
                            .map(stock -> stockCache.getOrDefault(stock.getTicker(), 
                                    HeatmapNode.builder().name(stock.getTicker()).value(100.0).rate(0.0).build()))
                            .collect(Collectors.toList());

                    double val = stockNodes.stream().mapToDouble(HeatmapNode::getValue).sum();
                    double rate = val == 0 ? 0 : stockNodes.stream().mapToDouble(n -> n.getRate() * (n.getValue() / val)).sum();
                    return HeatmapNode.builder().name(entry.getKey()).value(val).rate(rate).children(stockNodes).build();
                }).collect(Collectors.toList());

        double totalVal = sectorNodes.stream().mapToDouble(HeatmapNode::getValue).sum();
        double totalRate = totalVal == 0 ? 0 : sectorNodes.stream().mapToDouble(n -> n.getRate() * (n.getValue() / totalVal)).sum();

        return HeatmapNode.builder().name("반도체 전체").value(totalVal).rate(totalRate).children(sectorNodes).build();
    }

    private HeatmapNode fetchStockNodeFromApi(Stock stock) {
        Map<String, Object> response = stockClient.getOverseasStockDetail(stock.getExchange(), stock.getTicker());
        @SuppressWarnings("unchecked")
        Map<String, Object> output = (Map<String, Object>) response.get("output");
        
        if (output == null) {
            throw new RuntimeException("API 응답에 output 데이터가 없습니다.");
        }

        double marketCap = parseDouble(output, "tomv");
        double last = parseDouble(output, "last");
        double base = parseDouble(output, "base");
        double rate = (base == 0) ? 0 : ((last - base) / base) * 100;

        stock.updateRealtimeInfo(last, rate, marketCap);
        
        return HeatmapNode.builder()
                .name(stock.getTicker())
                .value(marketCap)
                .rate(rate)
                .build();
    }

    private double parseDouble(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val == null) return 0.0;
        try {
            return Double.parseDouble(val.toString().trim());
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }
}
